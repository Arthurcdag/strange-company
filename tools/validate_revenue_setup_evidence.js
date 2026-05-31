const fs = require("fs");
const path = require("path");
const {
  ALLOWED_STATUSES,
  REQUIRED_CHECKS_BEFORE_LIVE_MODE,
  REQUIRED_GATE_IDS,
  hasPlaceholder,
  isBlank,
  isClosedBlocker,
  isIsoDate
} = require("./revenue_setup_schema");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireReady = args.includes("--require-ready");
const templateOk = args.includes("--template-ok") || !requireReady;
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.template.json");

const allowedStatuses = new Set(ALLOWED_STATUSES);
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`could not read revenue setup evidence index: ${error.message}`);
    return {};
  }
}

function scanForPrivateData(value, currentPath = "$") {
  const forbiddenKeyPattern = /(password|secret|private.?key|api.?key|access.?token|refresh.?token|routing.?number|account.?number|card.?number|cvv)/i;
  const forbiddenExactKeys = new Set(["cpf", "cnpj", "taxid", "tax_id", "bank_account", "card_number"]);
  const forbiddenValuePatterns = [
    { label: "Stripe secret key", pattern: /[rs]k_(live|test)_[A-Za-z0-9]/ },
    { label: "private key", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { label: "card-like number", pattern: /\b(?:\d[ -]*?){13,19}\b/ },
    { label: "CPF-like number", pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
    { label: "CNPJ-like number", pattern: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/ }
  ];

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForPrivateData(entry, `${currentPath}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (forbiddenKeyPattern.test(key) || forbiddenExactKeys.has(normalizedKey)) {
        fail(`evidence index contains forbidden private-data key ${currentPath}.${key}.`);
      }
      scanForPrivateData(child, `${currentPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    if (/private_location_hint$/i.test(currentPath) && /^https?:\/\//i.test(value.trim())) {
      fail(`${currentPath} must be a non-secret location hint, not a private URL.`);
    }
    for (const { label, pattern } of forbiddenValuePatterns) {
      if (pattern.test(value)) {
        fail(`evidence index contains ${label} at ${currentPath}.`);
      }
    }
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object.`);
    return false;
  }
  return true;
}

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
    return false;
  }
  return true;
}

function validateRootShape(index) {
  assertObject(index, "revenue setup evidence index");
  if (isBlank(index.schema_version)) fail("schema_version is required.");
  if (isBlank(index.status)) fail("status is required.");
  if (isBlank(index.decision)) fail("decision is required.");
  if (typeof index.live_mode_requested !== "boolean") fail("live_mode_requested must be boolean.");
  if (typeof index.live_payment_intake_allowed !== "boolean") fail("live_payment_intake_allowed must be boolean.");
  if (isBlank(index.last_updated)) fail("last_updated is required.");
  if (isBlank(index.operator)) fail("operator is required.");
  if (!String(index.public_safe_rule || "").includes("Do not store customer data")) {
    fail("public_safe_rule must keep the no-customer-data rule.");
  }
  assertArray(index.service_offers, "service_offers");
  assertArray(index.gates, "gates");
  assertObject(index.public_config_gate, "public_config_gate");
  assertArray(index.required_checks_before_live_mode, "required_checks_before_live_mode");
  assertArray(index.stop_rules, "stop_rules");
}

function validateServiceOffers(index) {
  if (!Array.isArray(index.service_offers)) return;
  if (index.service_offers.length < 1) fail("service_offers must contain at least one offer.");
  for (const [indexNumber, offer] of index.service_offers.entries()) {
    if (!assertObject(offer, `service_offers[${indexNumber}]`)) continue;
    if (isBlank(offer.service_id)) fail(`service_offers[${indexNumber}].service_id is required.`);
    if (isBlank(offer.label)) fail(`service_offers[${indexNumber}].label is required.`);
    if (typeof offer.price_brl !== "number" || offer.price_brl < 0) {
      fail(`service_offers[${indexNumber}].price_brl must be a non-negative number.`);
    }
    if (isBlank(offer.status)) fail(`service_offers[${indexNumber}].status is required.`);
  }
}

function validateGates(index) {
  if (!Array.isArray(index.gates)) return { allApproved: false };
  const gateById = new Map();
  for (const [indexNumber, gate] of index.gates.entries()) {
    if (!assertObject(gate, `gates[${indexNumber}]`)) continue;
    if (isBlank(gate.gate_id)) fail(`gates[${indexNumber}].gate_id is required.`);
    if (gateById.has(gate.gate_id)) fail(`duplicate gate_id ${gate.gate_id}.`);
    gateById.set(gate.gate_id, gate);

    if (isBlank(gate.evidence_id)) fail(`${gate.gate_id || `gates[${indexNumber}]`}.evidence_id is required.`);
    if (!allowedStatuses.has(gate.status)) {
      fail(`${gate.gate_id || `gates[${indexNumber}]`}.status must be one of: ${Array.from(allowedStatuses).join(", ")}.`);
    }
    if (isBlank(gate.artifact_type)) fail(`${gate.gate_id || `gates[${indexNumber}]`}.artifact_type is required.`);
    if (isBlank(gate.next_step)) fail(`${gate.gate_id || `gates[${indexNumber}]`}.next_step is required.`);
  }

  for (const gateId of REQUIRED_GATE_IDS) {
    if (!gateById.has(gateId)) fail(`missing required gate ${gateId}.`);
  }

  const allApproved = REQUIRED_GATE_IDS.every((gateId) => gateById.get(gateId)?.status === "approved");
  if (!allApproved && index.live_payment_intake_allowed === true) {
    fail("live_payment_intake_allowed cannot be true until all required gates are approved.");
  }
  return { allApproved, gateById };
}

function validatePublicConfigGate(index) {
  const gate = index.public_config_gate || {};
  for (const key of ["termsReviewedAt", "privacyReviewedAt", "brazilComplianceReviewedAt", "aiHandoffReviewedAt"]) {
    if (!isBlank(gate[key]) && !isIsoDate(gate[key])) {
      fail(`public_config_gate.${key} must be blank or YYYY-MM-DD.`);
    }
  }
  if (typeof gate.liveMode !== "boolean") fail("public_config_gate.liveMode must be boolean.");
  if (gate.liveMode === true) {
    for (const key of ["termsReviewedAt", "privacyReviewedAt", "brazilComplianceReviewedAt", "aiHandoffReviewedAt"]) {
      if (!isIsoDate(gate[key])) fail(`public_config_gate.liveMode=true requires ${key}.`);
    }
  }
}

function validateRequiredChecks(index) {
  if (!Array.isArray(index.required_checks_before_live_mode)) return;
  for (const command of REQUIRED_CHECKS_BEFORE_LIVE_MODE) {
    if (!index.required_checks_before_live_mode.includes(command)) {
      fail(`required_checks_before_live_mode is missing ${command}.`);
    }
  }
  if (!Array.isArray(index.stop_rules) || index.stop_rules.length < REQUIRED_GATE_IDS.length) {
    fail("stop_rules must keep at least one stop rule per required gate.");
  }
}

function validateTemplate(index) {
  if (!templateOk) return;
  if (index.status !== "template_only") {
    warn("index status is not template_only; run with --require-ready before using it for live mode.");
  }
  if (index.live_mode_requested === true || index.live_payment_intake_allowed === true) {
    warn("template/default validation does not approve live intake; run with --require-ready.");
  }
}

function validateReady(index, gateState) {
  if (!requireReady) return;
  if (!isIsoDate(index.last_updated)) fail("last_updated must be YYYY-MM-DD for ready evidence.");
  if (index.live_mode_requested !== true) fail("live_mode_requested must be true for ready evidence.");
  if (index.live_payment_intake_allowed !== true) fail("live_payment_intake_allowed must be true for ready evidence.");
  if (!gateState.allApproved) fail("all required gates must have status approved for ready evidence.");

  for (const gateId of REQUIRED_GATE_IDS) {
    const gate = gateState.gateById?.get(gateId) || {};
    if (hasPlaceholder(gate.evidence_id)) fail(`${gateId}.evidence_id must replace the placeholder.`);
    if (isBlank(gate.reviewer_role)) fail(`${gateId}.reviewer_role is required for ready evidence.`);
    if (!isIsoDate(gate.reviewed_at)) fail(`${gateId}.reviewed_at must be YYYY-MM-DD for ready evidence.`);
    if (isBlank(gate.allowed_scope)) fail(`${gateId}.allowed_scope is required for ready evidence.`);
    if (isBlank(gate.private_location_hint)) fail(`${gateId}.private_location_hint is required for ready evidence.`);
    if (!isClosedBlocker(gate.blocker_summary)) {
      fail(`${gateId}.blocker_summary must be blank, none, n/a, closed, or no blockers for ready evidence.`);
    }
  }

  const publicGate = index.public_config_gate || {};
  if (publicGate.liveMode !== true) fail("public_config_gate.liveMode must be true for ready evidence.");
  for (const key of ["termsReviewedAt", "privacyReviewedAt", "brazilComplianceReviewedAt", "aiHandoffReviewedAt"]) {
    if (!isIsoDate(publicGate[key])) fail(`public_config_gate.${key} must be YYYY-MM-DD for ready evidence.`);
  }
}

const evidenceIndex = readJson(packetPath);
validateRootShape(evidenceIndex);
scanForPrivateData(evidenceIndex);
validateServiceOffers(evidenceIndex);
const gateState = validateGates(evidenceIndex);
validatePublicConfigGate(evidenceIndex);
validateRequiredChecks(evidenceIndex);
validateTemplate(evidenceIndex);
validateReady(evidenceIndex, gateState);

if (failures.length) {
  console.error("Revenue setup evidence validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  requireReady
    ? "Revenue setup evidence validation passed for ready/live review."
    : "Revenue setup evidence template validation passed."
);
for (const warning of warnings) {
  console.log(`Warning: ${warning}`);
}
