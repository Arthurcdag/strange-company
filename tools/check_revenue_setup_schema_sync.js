const fs = require("fs");
const path = require("path");
const {
  ALLOWED_STATUSES,
  PUBLIC_SAFE_RULE_REQUIRED_SNIPPET,
  REQUIRED_CHECKS_BEFORE_LIVE_MODE,
  REQUIRED_GATE_IDS,
  REQUIRED_PUBLIC_CONFIG_DATES,
  REQUIRED_READY_GATE_FIELDS,
  REVENUE_SETUP_OPERATOR,
  REVENUE_SETUP_SCHEMA_VERSION,
  REVENUE_SETUP_TEMPLATE_STATUS
} = require("./revenue_setup_schema");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const templateArg = args.find((arg) => !arg.startsWith("--"));
const templatePath = templateArg
  ? path.resolve(process.cwd(), templateArg)
  : path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.template.json");
const failures = [];

function fail(message) {
  failures.push(message);
}

function readTemplate() {
  try {
    return JSON.parse(fs.readFileSync(templatePath, "utf8"));
  } catch (error) {
    fail(`could not read revenue setup evidence template: ${error.message}`);
    return {};
  }
}

function assertArrayEquals(actual, expected, label) {
  if (!Array.isArray(actual)) {
    fail(`${label} must be an array.`);
    return;
  }
  if (actual.length !== expected.length) {
    fail(`${label} length mismatch. expected ${expected.length}, got ${actual.length}.`);
  }
  const max = Math.max(actual.length, expected.length);
  for (let index = 0; index < max; index += 1) {
    if (actual[index] !== expected[index]) {
      fail(`${label}[${index}] expected ${JSON.stringify(expected[index])}, got ${JSON.stringify(actual[index])}.`);
    }
  }
}

function assertHasOwn(object, key, label) {
  if (!object || !Object.prototype.hasOwnProperty.call(object, key)) {
    fail(`${label} is missing ${key}.`);
  }
}

const template = readTemplate();
const gates = Array.isArray(template.gates) ? template.gates : [];

if (template.schema_version !== REVENUE_SETUP_SCHEMA_VERSION) {
  fail(`template.schema_version must be ${REVENUE_SETUP_SCHEMA_VERSION}.`);
}
if (template.status !== REVENUE_SETUP_TEMPLATE_STATUS) {
  fail(`template.status must be ${REVENUE_SETUP_TEMPLATE_STATUS}.`);
}
if (template.operator !== REVENUE_SETUP_OPERATOR) {
  fail(`template.operator must be ${REVENUE_SETUP_OPERATOR}.`);
}
if (!String(template.public_safe_rule || "").includes(PUBLIC_SAFE_RULE_REQUIRED_SNIPPET)) {
  fail(`template.public_safe_rule must include ${PUBLIC_SAFE_RULE_REQUIRED_SNIPPET}.`);
}

assertArrayEquals(gates.map((gate) => gate.gate_id), REQUIRED_GATE_IDS, "template.gates gate_id order");
assertArrayEquals(
  template.required_checks_before_live_mode,
  REQUIRED_CHECKS_BEFORE_LIVE_MODE,
  "template.required_checks_before_live_mode"
);

for (const [index, gate] of gates.entries()) {
  const label = `template.gates[${index}]`;
  for (const field of [
    "gate_id",
    "evidence_id",
    "status",
    "reviewer_role",
    "reviewed_at",
    "artifact_type",
    "allowed_scope",
    "blocker_summary",
    "private_location_hint",
    "next_step"
  ]) {
    assertHasOwn(gate, field, label);
  }
  for (const field of REQUIRED_READY_GATE_FIELDS) {
    assertHasOwn(gate, field, label);
  }
  if (gate && !ALLOWED_STATUSES.includes(gate.status)) {
    fail(`${label}.status must be one of ${ALLOWED_STATUSES.join(", ")}.`);
  }
}

for (const field of REQUIRED_PUBLIC_CONFIG_DATES) {
  assertHasOwn(template.public_config_gate, field, "template.public_config_gate");
}
assertHasOwn(template.public_config_gate, "liveMode", "template.public_config_gate");
assertHasOwn(template.public_config_gate, "status", "template.public_config_gate");

if (failures.length) {
  console.error("Revenue setup schema sync failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Revenue setup schema sync passed.");
