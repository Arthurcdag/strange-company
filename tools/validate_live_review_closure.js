const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireReady = args.includes("--require-ready");
const templateOk = args.includes("--template-ok") || !requireReady;
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "LIVE_REVIEW_CLOSURE.template.json");

const failures = [];
const warnings = [];

const GATE_CONFIG_FIELDS = {
  terms: "termsReviewedAt",
  privacy: "privacyReviewedAt",
  brazilCompliance: "brazilComplianceReviewedAt",
  aiHandoff: "aiHandoffReviewedAt",
};

const REQUIRED_DOCUMENTS = {
  terms: ["TERMOS.md", "TERMS.md"],
  privacy: ["AVISO_DE_PRIVACIDADE.md", "PRIVACY.md"],
  brazilCompliance: ["BRAZIL_COMPLIANCE.md", "BRAZIL_COMPLIANCE_AGENTS.md", "CONKA8_LAW_INSTRUCTIONS.md"],
  aiHandoff: ["AI_LEGAL_HANDOFF.md", "HUMAN_REVIEW_PACKET.md"],
};

const REQUIRED_TRUE_FLAGS = {
  terms: ["offerFlowReviewed", "refundCancellationReviewed", "supportFlowReviewed", "humanApprovedForPublicConfig"],
  privacy: ["lgpdContactReviewed", "retentionReviewed", "processorsReviewed", "dataSubjectRightsReviewed", "humanApprovedForPublicConfig"],
  brazilCompliance: ["cnpjOrEntityRouteReviewed", "fiscalReceiptRouteReviewed", "paymentSupportReviewed", "lgpdRouteReviewed", "humanApprovedForPublicConfig"],
  aiHandoff: ["aiPreparedTextReviewed", "acceptedChangedOrRejected", "automatedDecisionStopRuleConfirmed", "humanApprovedForPublicConfig"],
};

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
    fail(`could not read JSON closure packet: ${error.message}`);
    return {};
  }
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isIsoDate(value) {
  if (isBlank(value)) {
    return false;
  }
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(text);
}

function requireObject(obj, sectionPath) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    fail(`${sectionPath} must be an object.`);
    return false;
  }
  return true;
}

function requireText(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : "";
  if (required && isBlank(value)) {
    fail(`${sectionPath}.${key} is required.`);
  }
  return !isBlank(value);
}

function requireDate(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : "";
  const valid = isIsoDate(value);
  if (required && !valid) {
    fail(`${sectionPath}.${key} must be YYYY-MM-DD.`);
  }
  if (!required && !isBlank(value) && !valid) {
    fail(`${sectionPath}.${key} must be YYYY-MM-DD when present.`);
  }
  if (valid && String(value).trim() > new Date().toISOString().slice(0, 10)) {
    fail(`${sectionPath}.${key} must not be in the future.`);
    return false;
  }
  return valid;
}

function requireTrue(obj, key, sectionPath) {
  if (!obj || obj[key] !== true) {
    fail(`${sectionPath}.${key} must be true to pass this review-date gate.`);
    return false;
  }
  return true;
}

function scanForSecrets(value, currentPath = "$") {
  const forbiddenKeyPattern = /(password|secret|private.?key|api.?key|routing.?number|account.?number|card.?number|cvv|ssn|tax.?id)/i;
  const forbiddenValuePatterns = [
    /sk_(live|test)_[A-Za-z0-9]/,
    /rk_(live|test)_[A-Za-z0-9]/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b(?:\d[ -]*?){13,19}\b/
  ];

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${currentPath}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenKeyPattern.test(key) && key !== "noPrivateEvidenceInRepo") {
        fail(`closure packet contains forbidden secret-like key ${currentPath}.${key}.`);
      }
      scanForSecrets(child, `${currentPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    for (const pattern of forbiddenValuePatterns) {
      if (pattern.test(value)) {
        fail(`closure packet contains forbidden secret-like value at ${currentPath}.`);
      }
    }
  }
}

function validateShape(packet) {
  if (packet.schemaVersion !== 1) {
    fail("schemaVersion must be 1.");
  }
  if (isBlank(packet.mode)) {
    fail("mode is required.");
  }
  if (requireObject(packet.reviewGates, "sections.reviewGates")) {
    for (const gateId of Object.keys(GATE_CONFIG_FIELDS)) {
      requireObject(packet.reviewGates[gateId], `sections.reviewGates.${gateId}`);
    }
  }
  requireObject(packet.publicConfigPatch, "sections.publicConfigPatch");
  requireObject(packet.attestation, "sections.attestation");
}

function validatePublicPatch(packet) {
  const patch = packet.publicConfigPatch || {};
  if (patch.jurisdiction !== "BR") {
    fail("sections.publicConfigPatch.jurisdiction must be BR.");
  }
  if (patch.aiGeneratedLegalDocsRequireHumanReview !== true) {
    fail("sections.publicConfigPatch.aiGeneratedLegalDocsRequireHumanReview must be true.");
  }
  if (patch.liveMode !== false) {
    fail("sections.publicConfigPatch.liveMode must remain false in this review-date closure packet.");
  }

  for (const field of Object.values(GATE_CONFIG_FIELDS)) {
    requireDate(patch, field, "sections.publicConfigPatch", false);
  }
}

function validateOptionalGateFormats(packet) {
  const gates = packet.reviewGates || {};
  for (const [gateId, configField] of Object.entries(GATE_CONFIG_FIELDS)) {
    const gate = gates[gateId] || {};
    requireDate(gate, "reviewedAt", `sections.reviewGates.${gateId}`, false);
    if (!isBlank(gate.reviewedAt) && !isBlank((packet.publicConfigPatch || {})[configField]) && gate.reviewedAt !== packet.publicConfigPatch[configField]) {
      fail(`sections.reviewGates.${gateId}.reviewedAt must match sections.publicConfigPatch.${configField}.`);
    }
    if (gate.aiOnlyApproval === true) {
      fail(`sections.reviewGates.${gateId}.aiOnlyApproval must remain false.`);
    }
    if (gate.documentsReviewed !== undefined && !Array.isArray(gate.documentsReviewed)) {
      fail(`sections.reviewGates.${gateId}.documentsReviewed must be an array.`);
    }
  }
  requireDate(packet.attestation || {}, "reviewedAt", "sections.attestation", false);
}

function validateTemplate(packet) {
  if (packet.mode === "template") {
    return;
  }
  if (packet.mode === "local-draft") {
    warn("local draft mode is not a completed live review closure packet.");
    return;
  }
  warn("mode is not template; run --require-ready before treating it as review-date evidence.");
}

function validateReady(packet) {
  const gates = packet.reviewGates || {};
  const patch = packet.publicConfigPatch || {};
  const attestation = packet.attestation || {};

  for (const [gateId, configField] of Object.entries(GATE_CONFIG_FIELDS)) {
    const gate = gates[gateId] || {};
    const section = `sections.reviewGates.${gateId}`;
    requireText(gate, "reviewer", section);
    requireDate(gate, "reviewedAt", section);
    requireDate(patch, configField, "sections.publicConfigPatch");
    if (gate.reviewedAt && patch[configField] && gate.reviewedAt !== patch[configField]) {
      fail(`${section}.reviewedAt must match sections.publicConfigPatch.${configField}.`);
    }
    const documents = Array.isArray(gate.documentsReviewed) ? gate.documentsReviewed : [];
    for (const document of REQUIRED_DOCUMENTS[gateId]) {
      if (!documents.includes(document)) {
        fail(`${section}.documentsReviewed must include ${document}.`);
      }
    }
    for (const flag of REQUIRED_TRUE_FLAGS[gateId]) {
      requireTrue(gate, flag, section);
    }
    if (gate.aiOnlyApproval !== false) {
      fail(`${section}.aiOnlyApproval must be false.`);
    }
  }

  requireText(attestation, "operator", "sections.attestation");
  requireDate(attestation, "reviewedAt", "sections.attestation");
  for (const key of [
    "noPrivateEvidenceInRepo",
    "noLegalTaxPrivacyApprovalFromAi",
    "liveModeStaysFalse",
    "externalLivePacketStillRequired",
    "revenuePaymentFiscalEvidenceStillRequired",
  ]) {
    requireTrue(attestation, key, "sections.attestation");
  }
}

const packet = readJson(packetPath);
validateShape(packet);
scanForSecrets(packet);
validatePublicPatch(packet);
validateOptionalGateFormats(packet);
validateTemplate(packet);

if (requireReady) {
  validateReady(packet);
}

if (failures.length) {
  console.error("Live review closure validation failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

if (requireReady) {
  console.log("Live review closure ready gate passed.");
} else if (templateOk) {
  console.log("Live review closure template validation passed.");
} else {
  console.log("Live review closure packet appears structurally valid.");
}

for (const message of warnings) {
  console.log(`Warning: ${message}`);
}
