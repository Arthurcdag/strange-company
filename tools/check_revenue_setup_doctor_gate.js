const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");

function runDoctor(args = []) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "revenue_setup_doctor.js"),
    ...args
  ], {
    cwd: root,
    encoding: "utf8"
  });
}

function outputOf(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function fail(message, output = "") {
  console.error("Revenue setup doctor gate regression failed:");
  console.error(`- ${message}`);
  if (output) {
    console.error(output);
  }
  process.exit(1);
}

function parseJson(output, label) {
  try {
    return JSON.parse(output);
  } catch (error) {
    fail(`${label} did not return JSON: ${error.message}`, output);
    return {};
  }
}

const defaultResult = runDoctor();
const defaultOutput = outputOf(defaultResult);
if (defaultResult.status !== 0) {
  fail("doctor default mode should pass while setup is valid but not ready.", defaultOutput);
}
for (const expected of [
  "Revenue Setup Doctor",
  "Strict ready validation: blocked",
  "Live payment intake allowed: no",
  "Revenue setup may continue as evidence gathering only"
]) {
  if (!defaultOutput.includes(expected)) {
    fail(`doctor default output missing ${expected}.`, defaultOutput);
  }
}

const jsonResult = runDoctor(["--json"]);
const jsonOutput = outputOf(jsonResult);
if (jsonResult.status !== 0) {
  fail("doctor JSON mode should pass while setup is valid but not ready.", jsonOutput);
}
const summary = parseJson(jsonOutput, "doctor JSON mode");
if (summary.ready !== false) fail("doctor JSON summary must report ready=false.", jsonOutput);
if (summary.live_payment_intake_allowed !== false) {
  fail("doctor JSON summary must report live_payment_intake_allowed=false.", jsonOutput);
}
if (summary.strict_ready_validation_passed !== false) {
  fail("doctor JSON summary must report strict_ready_validation_passed=false.", jsonOutput);
}
if (!summary.gate_counts || summary.gate_counts.missing !== 5 || summary.gate_counts.partial !== 1) {
  fail("doctor JSON summary must preserve current gate counts.", jsonOutput);
}

const requireReadyResult = runDoctor(["--require-ready"]);
const requireReadyOutput = outputOf(requireReadyResult);
if (requireReadyResult.status === 0) {
  fail("doctor --require-ready should fail until outside evidence closes.", requireReadyOutput);
}
if (!requireReadyOutput.includes("strict ready validation failed")) {
  fail("doctor --require-ready did not report strict ready validation failure.", requireReadyOutput);
}
if (!requireReadyOutput.includes("status must not be template_only for ready evidence")) {
  fail("doctor --require-ready did not surface the template-only blocker.", requireReadyOutput);
}

console.log("Revenue setup doctor gate regression passed.");
