const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.template.json");
const cleanPath = path.join(os.tmpdir(), `strange-revenue-schema-clean-${process.pid}-${Date.now()}.json`);
const badVersionPath = path.join(os.tmpdir(), `strange-revenue-schema-version-${process.pid}-${Date.now()}.json`);
const badGateOrderPath = path.join(os.tmpdir(), `strange-revenue-schema-gates-${process.pid}-${Date.now()}.json`);
const badChecksPath = path.join(os.tmpdir(), `strange-revenue-schema-checks-${process.pid}-${Date.now()}.json`);

function runSync(filePath) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "check_revenue_setup_schema_sync.js"),
    filePath
  ], {
    cwd: root,
    encoding: "utf8"
  });
}

function outputOf(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function fail(message, output = "") {
  console.error("Revenue setup schema sync regression failed:");
  console.error(`- ${message}`);
  if (output) {
    console.error(output);
  }
  process.exit(1);
}

function loadTemplate() {
  return JSON.parse(fs.readFileSync(templatePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function assertFailure(filePath, expectedSnippet, label) {
  const result = runSync(filePath);
  const output = outputOf(result);
  if (result.status === 0) {
    fail(`schema sync accepted drifted template: ${label}.`, output);
  }
  if (!output.includes(expectedSnippet)) {
    fail(`schema sync did not report expected drift for ${label}: ${expectedSnippet}`, output);
  }
}

try {
  const clean = loadTemplate();
  writeJson(cleanPath, clean);
  const cleanResult = runSync(cleanPath);
  if (cleanResult.status !== 0) {
    fail("schema sync rejected an unchanged template fixture.", outputOf(cleanResult));
  }

  const badVersion = loadTemplate();
  badVersion.schema_version = "drifted-schema-version";
  writeJson(badVersionPath, badVersion);
  assertFailure(badVersionPath, "template.schema_version must be", "schema version");

  const badGateOrder = loadTemplate();
  badGateOrder.gates = [...badGateOrder.gates];
  [badGateOrder.gates[0], badGateOrder.gates[1]] = [badGateOrder.gates[1], badGateOrder.gates[0]];
  writeJson(badGateOrderPath, badGateOrder);
  assertFailure(badGateOrderPath, "template.gates gate_id order[0]", "gate order");

  const badChecks = loadTemplate();
  badChecks.required_checks_before_live_mode = badChecks.required_checks_before_live_mode.filter(
    (command) => command !== "node tools\\audit_company_functionality.js"
  );
  writeJson(badChecksPath, badChecks);
  assertFailure(badChecksPath, "template.required_checks_before_live_mode length mismatch", "required checks");

  console.log("Revenue setup schema sync regression passed.");
} finally {
  for (const file of [cleanPath, badVersionPath, badGateOrderPath, badChecksPath]) {
    try {
      fs.unlinkSync(file);
    } catch {
      // Temporary file cleanup best effort.
    }
  }
}
