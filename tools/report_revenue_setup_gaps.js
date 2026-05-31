const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  GATE_LABELS,
  REQUIRED_GATE_IDS,
  REQUIRED_PUBLIC_CONFIG_DATES,
  REQUIRED_READY_GATE_FIELDS,
  gatePriority,
  hasPlaceholder,
  isBlank,
  isClosedBlocker
} = require("./revenue_setup_schema");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.template.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateTemplate(filePath) {
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "validate_revenue_setup_evidence.js"),
    filePath
  ], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`evidence index failed template validation:\n${output}`);
  }
}

function openBlocker(value) {
  return !isClosedBlocker(value);
}

function missingGateFields(gate) {
  const missing = [];
  if (hasPlaceholder(gate.evidence_id)) missing.push("real evidence_id");
  for (const field of REQUIRED_READY_GATE_FIELDS) {
    if (isBlank(gate[field])) missing.push(field);
  }
  if (gate.status !== "approved") missing.push("status=approved");
  if (openBlocker(gate.blocker_summary)) missing.push("closed blocker_summary");
  return missing;
}

function buildReport(index) {
  const gateById = new Map((index.gates || []).map((gate) => [gate.gate_id, gate]));
  const gates = REQUIRED_GATE_IDS.map((gateId) => {
    const gate = gateById.get(gateId) || {
      gate_id: gateId,
      status: "missing",
      blocker_summary: "Gate is missing from evidence index.",
      next_step: "Restore this gate in the evidence index."
    };
    const missing = missingGateFields(gate);
    return {
      gate_id: gateId,
      label: GATE_LABELS[gateId],
      status: gate.status || "missing",
      evidence_id: gate.evidence_id || "",
      reviewer_role: gate.reviewer_role || "",
      reviewed_at: gate.reviewed_at || "",
      missing_ready_fields: missing,
      blocker_summary: gate.blocker_summary || "",
      next_step: gate.next_step || ""
    };
  });

  const publicConfigGate = index.public_config_gate || {};
  const publicConfigMissing = REQUIRED_PUBLIC_CONFIG_DATES.filter((field) => isBlank(publicConfigGate[field]));
  if (publicConfigGate.liveMode !== true) publicConfigMissing.push("liveMode=true");

  const openGates = gates.filter((gate) => gate.status !== "approved" || gate.missing_ready_fields.length);
  const nextHumanActions = [...openGates]
    .sort((a, b) => gatePriority(a.status) - gatePriority(b.status))
    .map((gate) => ({
      gate_id: gate.gate_id,
      action: gate.next_step || `Close ${gate.label}.`,
      blocker_summary: gate.blocker_summary || "Missing ready evidence."
    }));

  return {
    source: path.relative(root, packetPath),
    status: index.status || "unknown",
    decision: index.decision || "",
    operator: index.operator || "",
    live_mode_requested: index.live_mode_requested === true,
    live_payment_intake_allowed: index.live_payment_intake_allowed === true,
    ready: openGates.length === 0 && publicConfigMissing.length === 0,
    gate_counts: {
      approved: gates.filter((gate) => gate.status === "approved").length,
      partial: gates.filter((gate) => gate.status === "partial").length,
      missing: gates.filter((gate) => gate.status === "missing").length,
      blocked: gates.filter((gate) => gate.status === "blocked").length,
      unclear: gates.filter((gate) => gate.status === "unclear").length
    },
    gates,
    public_config_missing: publicConfigMissing,
    next_human_actions: nextHumanActions,
    verdict: openGates.length || publicConfigMissing.length
      ? "Revenue setup may continue as evidence gathering only. Live payment intake remains blocked."
      : "Evidence index appears ready for strict ready validation and live-gate review."
  };
}

function printText(report) {
  console.log("Revenue Setup Gap Report");
  console.log(`Source: ${report.source}`);
  console.log(`Status: ${report.status}`);
  console.log(`Decision: ${report.decision}`);
  console.log(`Operator: ${report.operator}`);
  console.log(`Live payment intake allowed: ${report.live_payment_intake_allowed ? "yes" : "no"}`);
  console.log("");
  console.log("Gate counts:");
  for (const [key, value] of Object.entries(report.gate_counts)) {
    console.log(`- ${key}: ${value}`);
  }
  console.log("");
  console.log("Open gates:");
  const openGates = report.gates.filter((gate) => gate.status !== "approved" || gate.missing_ready_fields.length);
  if (!openGates.length) {
    console.log("- none");
  } else {
    for (const gate of openGates) {
      console.log(`- ${gate.gate_id}: ${gate.status}`);
      console.log(`  label: ${gate.label}`);
      console.log(`  missing: ${gate.missing_ready_fields.join(", ") || "none"}`);
      console.log(`  blocker: ${gate.blocker_summary || "none"}`);
      console.log(`  next: ${gate.next_step || "none"}`);
    }
  }
  console.log("");
  console.log("Public config gate:");
  console.log(`- missing: ${report.public_config_missing.join(", ") || "none"}`);
  console.log("");
  console.log("Next human actions:");
  if (!report.next_human_actions.length) {
    console.log("- run strict ready validation and live-gate audit");
  } else {
    for (const action of report.next_human_actions) {
      console.log(`- ${action.gate_id}: ${action.action}`);
    }
  }
  console.log("");
  console.log(`Verdict: ${report.verdict}`);
}

try {
  validateTemplate(packetPath);
  const report = buildReport(readJson(packetPath));
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printText(report);
  }
} catch (error) {
  console.error("Revenue setup gap report failed:");
  console.error(`- ${error.message}`);
  process.exit(1);
}
