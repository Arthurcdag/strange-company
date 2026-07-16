const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { parsePublicOrderConfig } = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireReady = args.includes("--require-ready");
const templateOk = args.includes("--template-ok") || !requireReady;

function argValue(name) {
  const index = args.indexOf(name);
  const value = index >= 0 ? args[index + 1] : "";
  return value && !String(value).startsWith("--") ? String(value) : "";
}

const VALUE_OPTIONS = new Set(["--document-root", "--terms-doc", "--privacy-doc", "--public-config"]);
const positionalArgs = [];
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (VALUE_OPTIONS.has(arg)) {
    index += 1;
  } else if (!arg.startsWith("--")) {
    positionalArgs.push(arg);
  }
}

const packetArg = positionalArgs[0];
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "LIVE_REVIEW_CLOSURE.template.json");
const documentRoot = argValue("--document-root")
  ? path.resolve(process.cwd(), argValue("--document-root"))
  : root;
const termsDocumentPath = argValue("--terms-doc")
  ? path.resolve(process.cwd(), argValue("--terms-doc"))
  : path.join(documentRoot, "TERMOS.md");
const privacyDocumentPath = argValue("--privacy-doc")
  ? path.resolve(process.cwd(), argValue("--privacy-doc"))
  : path.join(documentRoot, "AVISO_DE_PRIVACIDADE.md");
const publicConfigArg = argValue("--public-config");
const publicConfigPath = publicConfigArg
  ? path.resolve(process.cwd(), publicConfigArg)
  : "";

const failures = [];
const warnings = [];
const REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1";
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

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

function loadPublicConfig(filePath) {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    return parsePublicOrderConfig(source, filePath);
  } catch (error) {
    fail(`could not load public config ${filePath}: ${error.message}`);
    return null;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sameStringSet(actual, expected) {
  if (!Array.isArray(actual) || actual.some((value) => typeof value !== "string")) {
    return false;
  }
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

function normalizeDocumentText(value) {
  return String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function reviewDocumentDigest(canonicalPath, contents) {
  return crypto
    .createHash("sha256")
    .update(
      `${REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath=${canonicalPath}\n${normalizeDocumentText(contents)}`,
      "utf8"
    )
    .digest("hex");
}

function documentSourcePath(canonicalPath) {
  if (canonicalPath === "TERMOS.md") return termsDocumentPath;
  if (canonicalPath === "AVISO_DE_PRIVACIDADE.md") return privacyDocumentPath;
  return path.join(documentRoot, canonicalPath);
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
  if (!isPlainObject(obj)) {
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
  if (packet.schemaVersion !== 2) {
    fail("schemaVersion must be 2.");
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
    const section = `sections.reviewGates.${gateId}`;
    requireDate(gate, "reviewedAt", `sections.reviewGates.${gateId}`, false);
    if (!isBlank(gate.reviewedAt) && !isBlank((packet.publicConfigPatch || {})[configField]) && gate.reviewedAt !== packet.publicConfigPatch[configField]) {
      fail(`sections.reviewGates.${gateId}.reviewedAt must match sections.publicConfigPatch.${configField}.`);
    }
    if (gate.aiOnlyApproval === true) {
      fail(`sections.reviewGates.${gateId}.aiOnlyApproval must remain false.`);
    }
    const requiredDocuments = REQUIRED_DOCUMENTS[gateId];
    if (!sameStringSet(gate.documentsReviewed, requiredDocuments)) {
      fail(`${section}.documentsReviewed must contain exactly: ${requiredDocuments.join(", ")}.`);
    }

    const digests = gate.documentDigests;
    if (!isPlainObject(digests)) {
      fail(`${section}.documentDigests must be an object.`);
    } else {
      const digestKeys = Object.keys(digests);
      if (!sameStringSet(digestKeys, requiredDocuments)) {
        fail(`${section}.documentDigests must have exactly these canonical path keys: ${requiredDocuments.join(", ")}.`);
      }
      for (const canonicalPath of requiredDocuments) {
        const digest = digests[canonicalPath];
        const blankTemplatePlaceholder = packet.mode === "template" && isBlank(digest);
        if (!blankTemplatePlaceholder && (typeof digest !== "string" || !SHA256_PATTERN.test(digest))) {
          fail(`${section}.documentDigests[${JSON.stringify(canonicalPath)}] must be a lowercase SHA-256 hex digest.`);
        }
      }
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

  if (packet.mode === "template" || packet.mode === "local-draft") {
    fail(`mode ${JSON.stringify(packet.mode)} is non-evidence and cannot pass --require-ready.`);
  }

  for (const [gateId, configField] of Object.entries(GATE_CONFIG_FIELDS)) {
    const gate = gates[gateId] || {};
    const section = `sections.reviewGates.${gateId}`;
    requireText(gate, "reviewer", section);
    requireDate(gate, "reviewedAt", section);
    requireDate(patch, configField, "sections.publicConfigPatch");
    if (gate.reviewedAt && patch[configField] && gate.reviewedAt !== patch[configField]) {
      fail(`${section}.reviewedAt must match sections.publicConfigPatch.${configField}.`);
    }
    const digests = isPlainObject(gate.documentDigests) ? gate.documentDigests : {};
    for (const canonicalPath of REQUIRED_DOCUMENTS[gateId]) {
      let contents;
      const sourcePath = documentSourcePath(canonicalPath);
      try {
        contents = fs.readFileSync(sourcePath, "utf8");
      } catch (error) {
        fail(`${section}.documentDigests could not verify canonical document ${canonicalPath}: ${error.message}`);
        continue;
      }
      const expectedDigest = reviewDocumentDigest(canonicalPath, contents);
      if (digests[canonicalPath] !== expectedDigest) {
        fail(`${section}.documentDigests[${JSON.stringify(canonicalPath)}] does not match canonical document ${canonicalPath}.`);
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

function validatePublicConfigDates(packet, publicConfig) {
  if (!publicConfig) return;
  const patch = packet.publicConfigPatch || {};
  for (const configField of Object.values(GATE_CONFIG_FIELDS)) {
    if (patch[configField] !== publicConfig[configField]) {
      fail(`sections.publicConfigPatch.${configField} must exactly match public config ${configField}.`);
    }
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
  if (args.includes("--public-config") && !publicConfigPath) {
    fail("--public-config requires a path.");
  } else if (publicConfigPath) {
    validatePublicConfigDates(packet, loadPublicConfig(publicConfigPath));
  }
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
