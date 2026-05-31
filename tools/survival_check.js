const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const failures = [];
const evidence = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(label, detail) {
  evidence.push({ label, detail });
}

function assert(condition, message, label, detail) {
  if (!condition) {
    failures.push(message);
    return;
  }
  if (label) record(label, detail);
}

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8"
  });
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function externalLiveBlockers(config) {
  const blockers = [];
  if (!config.liveMode) blockers.push("public-config.js liveMode is false");
  if (!config.supportInboxVerified) blockers.push("support inbox is not verified");
  if (!config.googleFormVerified) blockers.push("Google Form route is not verified");
  if (!String(config.googleFormUrl || "").trim()) blockers.push("Google Form URL is blank");
  if (!String(config.termsReviewedAt || "").trim()) blockers.push("terms review date is blank");
  if (!String(config.privacyReviewedAt || "").trim()) blockers.push("privacy review date is blank");
  if (!String(config.brazilComplianceReviewedAt || "").trim()) blockers.push("Brazil compliance review date is blank");
  if (!String(config.aiHandoffReviewedAt || "").trim()) blockers.push("AI legal handoff review date is blank");
  return blockers;
}

function checkCommand(name, args) {
  const result = runNode(args);
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  assert(result.status === 0, `${name} failed:\n${output}`, name, args.join(" "));
}

function checkCoreSurvivalSurface() {
  assert(read("README.md").includes("No customer or investor money for trading"), "README.md must keep the customer-money firewall.", "customer-money firewall", "README.md");
  assert(read("CHARTER.md").includes("Does it avoid creating a single point of failure?"), "CHARTER.md must keep the single-point-of-failure test.", "single-point-of-failure test", "CHARTER.md");
  assert(read("SC_GAME_THEORY_RATIONALE.md").includes("Do not accept customer capital for trading"), "SC_GAME_THEORY_RATIONALE.md must keep the investment firewall.", "investment firewall", "SC_GAME_THEORY_RATIONALE.md");
  assert(read("TREASURY_OS.md").includes("own retained surplus only"), "TREASURY_OS.md must keep the own-surplus rule.", "own-surplus treasury rule", "TREASURY_OS.md");
  assert(read("BRAZIL_COMPLIANCE.md").includes("Keep `public-config.js` at `liveMode: false`"), "BRAZIL_COMPLIANCE.md must keep the liveMode stop rule.", "Brazil liveMode stop rule", "BRAZIL_COMPLIANCE.md");
  assert(read("SC_HUMAN_REVIEW_REQUEST.md").includes("sua revisao nao aprova operacao ao vivo"), "SC_HUMAN_REVIEW_REQUEST.md must keep the reviewer non-approval rule.", "reviewer non-approval rule", "SC_HUMAN_REVIEW_REQUEST.md");
  assert(read("RESEARCH_GATE.md").includes("The core repo no longer ships the external research submodule"), "RESEARCH_GATE.md must keep the no-submodule core policy.", "no-submodule research gate", "RESEARCH_GATE.md");
  assert(read("public.js").includes("if (!readiness.liveReady)"), "public.js must block submit before live readiness.", "public live gate", "public.js");
  assert(read("script.js").includes("function applyLocalStrangeGuardrails"), "script.js must apply browser-side Strange guardrails.", "browser guardrails", "script.js");
  assert(read("tools/strange_research_gate.py").includes("fallback_evaluate_argument"), "strange_research_gate.py must run without the external submodule.", "local research fallback", "tools/strange_research_gate.py");
}

function checkLiveGateBehavior(config) {
  const blockers = externalLiveBlockers(config);
  const result = runNode(["tools/audit_company_functionality.js", "--require-live"]);
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();

  if (blockers.length) {
    assert(
      result.status !== 0 && output.includes("external live-operation gate is blocked"),
      `--require-live must fail while external blockers remain. Output:\n${output}`,
      "live gate blocks unsafe launch",
      blockers.join("; ")
    );
    return { blockers, liveReady: false };
  }

  assert(result.status === 0, `--require-live must pass when no external blockers remain. Output:\n${output}`, "live gate ready", "--require-live");
  return { blockers, liveReady: true };
}

let config = {};
try {
  config = loadPublicConfig();
  record("public config loads", "public-config.js");
} catch (error) {
  failures.push(`public-config.js failed to load: ${error.message}`);
}

if (!failures.length) {
  checkCoreSurvivalSurface();
  checkCommand("external live packet gate regression", ["tools/check_external_live_packet_gate.js"]);
  checkCommand("revenue setup evidence template validation", ["tools/validate_revenue_setup_evidence.js"]);
  checkCommand("public launch preflight", ["tools/preflight_public_launch.js"]);
  checkCommand("company functionality audit", ["tools/audit_company_functionality.js"]);
}

const liveGate = failures.length ? { blockers: [], liveReady: false } : checkLiveGateBehavior(config);

if (failures.length) {
  console.error("Strange Company survival check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Strange Company survival check passed.");
console.log(`Verdict: ${liveGate.liveReady ? "live gate ready if external evidence is real" : "survives as a guarded prototype; live operation remains blocked by design"}.`);
console.log("Survival surfaces:");
evidence.forEach((item) => console.log(`- ${item.label}: ${item.detail}`));
if (liveGate.blockers.length) {
  console.log("External blockers still preventing live operation:");
  liveGate.blockers.forEach((blocker) => console.log(`- ${blocker}`));
}
