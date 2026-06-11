const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireEntity = args.includes("--require-entity");
const requireTax = args.includes("--require-tax");
const requirePayment = args.includes("--require-payment");
const requireSupport = args.includes("--require-support");
const requirePrivacy = args.includes("--require-privacy");
const requireTerms = args.includes("--require-terms");
const requireLedger = args.includes("--require-ledger");
const requireAll = args.includes("--require-all");
const templateOk = args.includes("--template-ok") || (!requireEntity && !requireTax && !requirePayment && !requireSupport && !requirePrivacy && !requireTerms && !requireLedger && !requireAll);
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg ? path.resolve(process.cwd(), packetArg) : path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.template.json");

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
    fail(`could not read JSON index: ${error.message}`);
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

function isBoolean(value) {
  return value === true || value === false;
}

function isGoogleFormUrl(value) {
  if (isBlank(value)) {
    return false;
  }
  return /^https:\/\/docs\.google\.com\/forms\//.test(String(value).trim());
}

function isGoogleSheetUrl(value) {
  if (isBlank(value)) {
    return false;
  }
  return /^https:\/\/docs\.google\.com\/spreadsheets\//.test(String(value).trim());
}

function requireText(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : "";
  if (required && isBlank(value)) {
    fail(`${sectionPath}.${key} is required.`);
  }
  return !isBlank(value);
}

function requireBoolean(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : undefined;
  if (required && !isBoolean(value)) {
    fail(`${sectionPath}.${key} must be true/false.`);
  }
  return value === true;
}

function requireDate(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : "";
  if (required && !isIsoDate(value)) {
    fail(`${sectionPath}.${key} must be YYYY-MM-DD.`);
  }
}

function requireObject(obj, sectionPath) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    fail(`${sectionPath} must be an object.`);
    return false;
  }
  return true;
}

function validateSectionObject(data, section, requiredFields, requiredBooleans) {
  const path = `sections.${section}`;
  if (!requireObject(data, path)) {
    return;
  }
  for (const key of requiredFields) {
    requireText(data, key, path);
  }
  for (const key of requiredBooleans) {
    requireBoolean(data, key, path);
  }
}

function requireVerifiedFlags(data, section, requiredTrueFlags) {
  for (const key of requiredTrueFlags) {
    const sectionPath = `evidence.${section}`;
    const value = data && data[section] ? data[section][key] : undefined;
    if (!isBoolean(value)) {
      fail(`${sectionPath}.${key} must be true/false.`);
    } else if (value !== true) {
      fail(`${sectionPath}.${key} must be true to pass this readiness gate.`);
    }
  }
}

function requireSection(section) {
  const required = {
    entity: {
      fields: [
        "entityEvidenceId",
        "cnpjOrRoute",
        "reviewerName",
        "reviewDate",
        "blockers",
      ],
      booleans: ["allowedToInvoiceServices", "verified"],
      dates: ["reviewDate"],
      urls: [],
      trueBooleans: ["verified", "allowedToInvoiceServices"],
    },
    tax: {
      fields: [
        "taxEvidenceId",
        "taxRegime",
        "cnae",
        "nfseRoute",
        "fiscalDocumentOwner",
        "testNfseOrReceiptStatus",
        "monthlyReconciliationOwner",
      ],
      booleans: ["municipalRegistrationNeeded", "verified"],
      dates: ["accountantReviewedAt"],
      urls: [],
      trueBooleans: ["verified"],
    },
    payment: {
      fields: [
        "paymentEvidenceId",
        "provider",
        "businessAccountName",
        "testPaymentId",
        "testPayoutStatus",
        "refundTestOrProcedure",
        "chargebackOrDisputeProcedure",
        "reconciliationOwner",
      ],
      booleans: ["payoutDestinationVerified", "feesReviewed", "dashboardAllowlistHostsConfirmed", "verified"],
      dates: [],
      urls: [],
      trueBooleans: [
        "payoutDestinationVerified",
        "feesReviewed",
        "dashboardAllowlistHostsConfirmed",
        "verified",
      ],
    },
    support: {
      fields: [
        "supportEvidenceId",
        "supportEmail",
        "testSentAt",
        "testReceivedAt",
        "dailyCheckTime",
        "incidentOwner",
        "refundOwner",
        "privacyOwner",
      ],
      booleans: ["verified"],
      dates: ["testSentAt", "testReceivedAt"],
      urls: [],
      trueBooleans: ["verified"],
    },
    privacy: {
      fields: [
        "privacyEvidenceId",
        "privacyReviewedAt",
        "lgpdContact",
        "processorListLocation",
        "retentionDecision",
        "rightsRequestOwner",
      ],
      booleans: ["sensitiveDataBoundaryConfirmed", "verified"],
      dates: ["privacyReviewedAt"],
      urls: [],
      trueBooleans: ["sensitiveDataBoundaryConfirmed", "verified"],
    },
    terms: {
      fields: [
        "termsEvidenceId",
        "termsReviewedAt",
        "reviewer",
        "refundPath",
        "cancellationPath",
        "customerType",
      ],
      booleans: ["offerScopeConfirmed", "verified"],
      dates: ["termsReviewedAt"],
      urls: [],
      trueBooleans: ["offerScopeConfirmed", "verified"],
    },
    ledger: {
      fields: [
        "ledgerEvidenceId",
        "googleFormUrl",
        "googleSheetUrl",
        "testSubmissionId",
        "owner",
      ],
      booleans: ["tabsVerified", "columnNamesVerified", "allowedStatusValuesVerified", "verified"],
      dates: [],
      urls: ["googleFormUrl", "googleSheetUrl"],
      trueBooleans: ["tabsVerified", "columnNamesVerified", "allowedStatusValuesVerified", "verified"],
    },
  }[section];
  return required;
}

function validateSectionGates(packet, section) {
  const rules = requireSection(section);
  if (!rules) {
    return;
  }
  const sectionData = packet[section];

  validateSectionObject(sectionData, section, rules.fields, rules.booleans);
  for (const key of rules.dates) {
    requireDate(sectionData, key, `sections.${section}`);
  }
  if (rules.urls.includes("googleFormUrl") && !isGoogleFormUrl(sectionData && sectionData.googleFormUrl)) {
    fail(`sections.${section}.googleFormUrl must be a Google Form URL.`);
  }
  if (rules.urls.includes("googleSheetUrl") && !isGoogleSheetUrl(sectionData && sectionData.googleSheetUrl)) {
    fail(`sections.${section}.googleSheetUrl must be a Google Spreadsheet URL.`);
  }
  requireVerifiedFlags(packet, section, rules.trueBooleans);
}

function validateShape(packet) {
  if (packet.schemaVersion !== 1) {
    fail("schemaVersion must be 1.");
  }
  if (isBlank(packet.mode)) {
    fail("mode is required.");
  }

  if (!requireObject(packet.operator, "sections.operator")) {
    return;
  }
  if (!requireObject(packet.entity, "sections.entity")) return;
  if (!requireObject(packet.tax, "sections.tax")) return;
  if (!requireObject(packet.payment, "sections.payment")) return;
  if (!requireObject(packet.support, "sections.support")) return;
  if (!requireObject(packet.privacy, "sections.privacy")) return;
  if (!requireObject(packet.terms, "sections.terms")) return;
  if (!requireObject(packet.ledger, "sections.ledger")) return;
  if (!requireObject(packet.publicConfig, "sections.publicConfig")) return;
  if (!requireObject(packet.attestation, "sections.attestation")) return;
}

function validateGateModeFlags() {
  const attestation = packet.attestation || {};
  if ((requireAll || requireEntity || requireTax || requirePayment || requireSupport || requirePrivacy || requireTerms || requireLedger) && !attestation.noSecretsInRepo) {
    fail("attestation.noSecretsInRepo must be true.");
  }
  if ((requireAll || requireTax || requirePayment) && !attestation.aiDidNotApproveLegalTaxPaymentOrPrivacy) {
    fail("attestation.aiDidNotApproveLegalTaxPaymentOrPrivacy must be true.");
  }
}

function validateTemplate(packet) {
  if (packet.mode === "template") {
    return;
  }
  if (packet.mode === "local-draft") {
    warn("local draft mode is not a fully validated local packet.");
    return;
  }
  warn("mode is not template; run with --require-* gates for a completed local packet.");
}

function validatePublicConfig(packet) {
  if (packet.publicConfig && (packet.publicConfig.googleFormUrl || packet.publicConfig.supportEmail)) {
    const url = String(packet.publicConfig.googleFormUrl || "").trim();
    if (url && !/^https:\/\/docs\.google\.com\/forms\//.test(url)) {
      fail("publicConfig.googleFormUrl must be a Google Form URL.");
    }
  }
  if (packet.publicConfig && !isBlank(packet.publicConfig.termsReviewedAt) && !isIsoDate(packet.publicConfig.termsReviewedAt)) {
    fail("publicConfig.termsReviewedAt must be YYYY-MM-DD when present.");
  }
  if (packet.publicConfig && !isBlank(packet.publicConfig.privacyReviewedAt) && !isIsoDate(packet.publicConfig.privacyReviewedAt)) {
    fail("publicConfig.privacyReviewedAt must be YYYY-MM-DD when present.");
  }
  if (packet.publicConfig && !isBlank(packet.publicConfig.brazilComplianceReviewedAt) && !isIsoDate(packet.publicConfig.brazilComplianceReviewedAt)) {
    fail("publicConfig.brazilComplianceReviewedAt must be YYYY-MM-DD when present.");
  }
  if (packet.publicConfig && !isBlank(packet.publicConfig.aiHandoffReviewedAt) && !isIsoDate(packet.publicConfig.aiHandoffReviewedAt)) {
    fail("publicConfig.aiHandoffReviewedAt must be YYYY-MM-DD when present.");
  }
  if (packet.publicConfig && !isBlank(packet.publicConfig.supportEmail) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(packet.publicConfig.supportEmail)) {
    fail("publicConfig.supportEmail must be a valid email when present.");
  }
  if (packet.publicConfig && typeof packet.publicConfig.supportInboxVerified !== "boolean") {
    fail("publicConfig.supportInboxVerified must be true/false.");
  }
  if (packet.publicConfig && typeof packet.publicConfig.googleFormVerified !== "boolean") {
    fail("publicConfig.googleFormVerified must be true/false.");
  }
  if (packet.publicConfig && typeof packet.publicConfig.liveMode !== "boolean") {
    fail("publicConfig.liveMode must be true/false.");
  }
}

function validateAttestation(packet) {
  const attestation = packet.attestation || {};
  if (!requireObject(attestation, "sections.attestation")) {
    return;
  }
  requireText(attestation, "operator", "sections.attestation", false);
  requireText(attestation, "reviewedAt", "sections.attestation", false);
  if (!isBlank(attestation.reviewedAt) && !isIsoDate(attestation.reviewedAt)) {
    fail("sections.attestation.reviewedAt must be YYYY-MM-DD when present.");
  }
}

const packet = readJson(packetPath);
validateShape(packet);
validatePublicConfig(packet);
validateAttestation(packet);
validateTemplate(packet);

if (templateOk && !packet.mode) {
  // no-op to keep shape checks active while skipping gate checks in template mode.
}

if (requireEntity || requireAll) {
  validateSectionGates(packet, "entity");
}
if (requireTax || requireAll) {
  validateSectionGates(packet, "tax");
}
if (requirePayment || requireAll) {
  validateSectionGates(packet, "payment");
}
if (requireSupport || requireAll) {
  validateSectionGates(packet, "support");
}
if (requirePrivacy || requireAll) {
  validateSectionGates(packet, "privacy");
}
if (requireTerms || requireAll) {
  validateSectionGates(packet, "terms");
}
if (requireLedger || requireAll) {
  validateSectionGates(packet, "ledger");
}
if (requireAll) {
  validateGateModeFlags();
}

if (failures.length) {
  console.error("Revenue setup evidence index validation failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

if (requireAll) {
  console.log("Revenue setup evidence index all gates are validated.");
} else if (requireEntity) {
  console.log("Revenue setup evidence index entity gate passed.");
} else if (requireTax) {
  console.log("Revenue setup evidence index tax gate passed.");
} else if (requirePayment) {
  console.log("Revenue setup evidence index payment gate passed.");
} else if (requireSupport) {
  console.log("Revenue setup evidence index support gate passed.");
} else if (requirePrivacy) {
  console.log("Revenue setup evidence index privacy gate passed.");
} else if (requireTerms) {
  console.log("Revenue setup evidence index terms gate passed.");
} else if (requireLedger) {
  console.log("Revenue setup evidence index ledger gate passed.");
} else if (templateOk) {
  console.log("Revenue setup evidence index template validation passed.");
} else {
  console.log("Revenue setup evidence index appears structurally valid.");
}

for (const message of warnings) {
  console.log(`Warning: ${message}`);
}
