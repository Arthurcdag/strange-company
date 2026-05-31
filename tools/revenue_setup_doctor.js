const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const requireReady = args.includes("--require-ready");
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg ? path.resolve(process.cwd(), packetArg) : undefined;
const failures = [];
const checks = [];

function commandLine(script, extraArgs = []) {
  return [path.join(root, "tools", script), ...extraArgs];
}

function runCheck(label, script, extraArgs = [], options = {}) {
  const result = spawnSync(process.execPath, commandLine(script, extraArgs), {
    cwd: root,
    encoding: "utf8"
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const ok = result.status === 0;
  checks.push({ label, ok, output });
  if (!ok && !options.allowFailure) {
    failures.push(`${label} failed${output ? `:\n${output}` : ""}`);
  }
  return { ok, output, status: result.status };
}

function parseJsonReport(output) {
  try {
    return JSON.parse(output);
  } catch (error) {
    failures.push(`gap report did not return JSON: ${error.message}`);
    return {};
  }
}

const packetArgs = packetPath ? [packetPath] : [];

runCheck("schema sync", "check_revenue_setup_schema_sync.js");
runCheck("evidence template validation", "validate_revenue_setup_evidence.js", packetArgs);
const reportResult = runCheck("gap report", "report_revenue_setup_gaps.js", [...packetArgs, "--json"]);
const report = reportResult.ok ? parseJsonReport(reportResult.output) : {};

let readyResult = { ok: false, output: "" };
if (requireReady) {
  readyResult = runCheck("strict ready validation", "validate_revenue_setup_evidence.js", [...packetArgs, "--require-ready"]);
} else {
  readyResult = runCheck("strict ready validation", "validate_revenue_setup_evidence.js", [...packetArgs, "--require-ready"], {
    allowFailure: true
  });
}

const summary = {
  source: report.source || (packetPath ? path.relative(root, packetPath) : "REVENUE_SETUP_EVIDENCE_INDEX.template.json"),
  ready: report.ready === true,
  live_payment_intake_allowed: report.live_payment_intake_allowed === true,
  gate_counts: report.gate_counts || {},
  public_config_missing: report.public_config_missing || [],
  next_human_actions: report.next_human_actions || [],
  strict_ready_validation_passed: readyResult.ok,
  verdict: report.verdict || "Revenue setup status unknown.",
  checks: checks.map((check) => ({ label: check.label, ok: check.ok }))
};

if (jsonOutput) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log("Revenue Setup Doctor");
  console.log(`Source: ${summary.source}`);
  console.log(`Ready: ${summary.ready ? "yes" : "no"}`);
  console.log(`Live payment intake allowed: ${summary.live_payment_intake_allowed ? "yes" : "no"}`);
  console.log(`Strict ready validation: ${summary.strict_ready_validation_passed ? "passed" : "blocked"}`);
  console.log("");
  console.log("Checks:");
  for (const check of summary.checks) {
    console.log(`- ${check.label}: ${check.ok ? "pass" : "blocked"}`);
  }
  console.log("");
  console.log("Gate counts:");
  for (const [key, value] of Object.entries(summary.gate_counts)) {
    console.log(`- ${key}: ${value}`);
  }
  console.log("");
  console.log("Public config missing:");
  console.log(`- ${summary.public_config_missing.join(", ") || "none"}`);
  console.log("");
  console.log("Next human actions:");
  if (!summary.next_human_actions.length) {
    console.log("- run strict ready validation and live-gate audit");
  } else {
    for (const action of summary.next_human_actions) {
      console.log(`- ${action.gate_id}: ${action.action}`);
    }
  }
  console.log("");
  console.log(`Verdict: ${summary.verdict}`);
}

if (failures.length) {
  if (!jsonOutput) {
    console.error("");
    console.error("Revenue setup doctor failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
  }
  process.exit(1);
}
