const fs = require("fs");
const path = require("path");
const { parsePublicOrderConfig } = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireLive = args.includes("--require-live");
const templateOk = args.includes("--template-ok") || !requireLive;

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? String(args[index + 1]) : "";
}

const publicConfigArg = argValue("--public-config");
const publicConfigPath = publicConfigArg ? path.resolve(process.cwd(), publicConfigArg) : "";
const packetArg = args.find((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--public-config");
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "EXTERNAL_LIVE_PACKET.template.json");

const PUBLIC_CONFIG_BINDING_FIELDS = [
  "operatorName",
  "jurisdiction",
  "aiGeneratedLegalDocsRequireHumanReview",
  "supportEmail",
  "googleFormUrl",
  "supportInboxVerified",
  "googleFormVerified",
  "termsReviewedAt",
  "privacyReviewedAt",
  "brazilComplianceReviewedAt",
  "aiHandoffReviewedAt",
];
const EXTERNAL_TEST_FRESHNESS_MS = 30 * 24 * 60 * 60 * 1000;

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
    fail(`could not read JSON packet: ${error.message}`);
    return {};
  }
}

function readPublicConfig(filePath) {
  try {
    return parsePublicOrderConfig(fs.readFileSync(filePath, "utf8"), filePath);
  } catch (error) {
    fail(`could not read current public config: ${error.message}`);
    return {};
  }
}

function valueAt(packet, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key];
    }
    return undefined;
  }, packet);
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || "").trim());
}

function isIsoDate(value) {
  if (isBlank(value)) return false;
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(text);
}

function isHttpsPrefix(value, prefix) {
  if (isBlank(value)) return false;
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "https:" && url.href.startsWith(prefix);
  } catch {
    return false;
  }
}

function requirePath(packet, dottedPath, label) {
  const value = valueAt(packet, dottedPath);
  if (isBlank(value)) {
    fail(`${label} is required at ${dottedPath}.`);
  }
  return value;
}

function requireTrue(packet, dottedPath, label) {
  const value = valueAt(packet, dottedPath);
  if (value !== true) {
    fail(`${label} must be true at ${dottedPath}.`);
  }
}

function requireEquals(packet, dottedPath, expected, label) {
  const value = valueAt(packet, dottedPath);
  if (value !== expected) {
    fail(`${label} must be ${JSON.stringify(expected)} at ${dottedPath}.`);
  }
}

function assertShape(packet) {
  if (packet.schemaVersion !== 1) {
    fail("packet schemaVersion must be 1.");
  }
  if (requireLive && packet.mode !== "local") {
    fail("packet mode must be local for --require-live.");
  }
  const requiredObjects = [
    "support",
    "google",
    "legalReview",
    "stripe",
    "bank",
    "publicConfig",
    "attestation"
  ];
  for (const key of requiredObjects) {
    if (!packet[key] || typeof packet[key] !== "object" || Array.isArray(packet[key])) {
      fail(`packet is missing object section ${key}.`);
    }
  }
}

function requireRecentIsoUtcTimestamp(value, dottedPath, label, now = Date.now()) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(text)) {
    fail(`${label} must be an ISO-8601 UTC timestamp at ${dottedPath}.`);
    return Number.NaN;
  }
  const parsed = new Date(text);
  const canonical = text.includes(".") ? text : `${text.slice(0, -1)}.000Z`;
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== canonical) {
    fail(`${label} must be a real ISO-8601 UTC timestamp at ${dottedPath}.`);
    return Number.NaN;
  }
  const timestamp = parsed.valueOf();
  if (timestamp > now) {
    fail(`${label} must not be in the future at ${dottedPath}.`);
  }
  if (timestamp < now - EXTERNAL_TEST_FRESHNESS_MS) {
    fail(`${label} must be no more than 30 days old at ${dottedPath}.`);
  }
  return timestamp;
}

function validateCurrentPublicConfigBinding(packet, currentConfig) {
  for (const field of PUBLIC_CONFIG_BINDING_FIELDS) {
    const packetValue = valueAt(packet, `publicConfig.${field}`);
    const currentValue = currentConfig[field];
    if (packetValue !== currentValue) {
      fail(`publicConfig.${field} must match the current public-config.js value.`);
    }
  }
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
      if (forbiddenKeyPattern.test(key) && key !== "noSecretsInRepo") {
        fail(`packet contains forbidden secret-like key ${currentPath}.${key}.`);
      }
      scanForSecrets(child, `${currentPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    for (const pattern of forbiddenValuePatterns) {
      if (pattern.test(value)) {
        fail(`packet contains forbidden secret-like value at ${currentPath}.`);
      }
    }
  }
}

function validateOptionalFormats(packet) {
  const supportEmail = valueAt(packet, "support.supportEmail");
  const configEmail = valueAt(packet, "publicConfig.supportEmail");
  const formUrl = valueAt(packet, "google.formUrl");
  const configFormUrl = valueAt(packet, "publicConfig.googleFormUrl");
  const sheetUrl = valueAt(packet, "google.sheetUrl");
  const dashboardUrl = valueAt(packet, "stripe.dashboardUrl");
  const hostedInvoiceUrl = valueAt(packet, "stripe.testHostedInvoiceUrl");

  if (!isBlank(supportEmail) && !isEmail(supportEmail)) {
    fail("support.supportEmail must be a valid email address.");
  }
  if (!isBlank(configEmail) && !isEmail(configEmail)) {
    fail("publicConfig.supportEmail must be a valid email address.");
  }
  if (!isBlank(supportEmail) && !isBlank(configEmail) && supportEmail !== configEmail) {
    fail("support.supportEmail must match publicConfig.supportEmail.");
  }
  if (!isBlank(formUrl) && !isHttpsPrefix(formUrl, "https://docs.google.com/forms/")) {
    fail("google.formUrl must start with https://docs.google.com/forms/.");
  }
  if (!isBlank(configFormUrl) && !isHttpsPrefix(configFormUrl, "https://docs.google.com/forms/")) {
    fail("publicConfig.googleFormUrl must start with https://docs.google.com/forms/.");
  }
  if (!isBlank(formUrl) && !isBlank(configFormUrl) && formUrl !== configFormUrl) {
    fail("google.formUrl must match publicConfig.googleFormUrl.");
  }
  if (!isBlank(sheetUrl) && !isHttpsPrefix(sheetUrl, "https://docs.google.com/spreadsheets/")) {
    fail("google.sheetUrl must start with https://docs.google.com/spreadsheets/.");
  }
  if (!isBlank(dashboardUrl) && !isHttpsPrefix(dashboardUrl, "https://dashboard.stripe.com/")) {
    fail("stripe.dashboardUrl must start with https://dashboard.stripe.com/.");
  }
  if (!isBlank(hostedInvoiceUrl) && !isHttpsPrefix(hostedInvoiceUrl, "https://invoice.stripe.com/")) {
    fail("stripe.testHostedInvoiceUrl must start with https://invoice.stripe.com/.");
  }

  for (const dottedPath of [
    "legalReview.termsReviewedAt",
    "legalReview.privacyReviewedAt",
    "legalReview.supportReviewedAt",
    "legalReview.brazilComplianceReviewedAt",
    "legalReview.aiHandoffReviewedAt",
    "publicConfig.termsReviewedAt",
    "publicConfig.privacyReviewedAt",
    "publicConfig.brazilComplianceReviewedAt",
    "publicConfig.aiHandoffReviewedAt",
    "attestation.reviewedAt"
  ]) {
    const value = valueAt(packet, dottedPath);
    if (!isBlank(value) && !isIsoDate(value)) {
      fail(`${dottedPath} must be YYYY-MM-DD when present.`);
    } else if (!isBlank(value) && String(value).trim() > new Date().toISOString().slice(0, 10)) {
      fail(`${dottedPath} must not be in the future.`);
    }
  }

  const terms = valueAt(packet, "legalReview.termsReviewedAt");
  const publicTerms = valueAt(packet, "publicConfig.termsReviewedAt");
  const privacy = valueAt(packet, "legalReview.privacyReviewedAt");
  const publicPrivacy = valueAt(packet, "publicConfig.privacyReviewedAt");
  const brazilCompliance = valueAt(packet, "legalReview.brazilComplianceReviewedAt");
  const publicBrazilCompliance = valueAt(packet, "publicConfig.brazilComplianceReviewedAt");
  const aiHandoff = valueAt(packet, "legalReview.aiHandoffReviewedAt");
  const publicAiHandoff = valueAt(packet, "publicConfig.aiHandoffReviewedAt");
  if (!isBlank(terms) && !isBlank(publicTerms) && terms !== publicTerms) {
    fail("legalReview.termsReviewedAt must match publicConfig.termsReviewedAt.");
  }
  if (!isBlank(privacy) && !isBlank(publicPrivacy) && privacy !== publicPrivacy) {
    fail("legalReview.privacyReviewedAt must match publicConfig.privacyReviewedAt.");
  }
  if (!isBlank(brazilCompliance) && !isBlank(publicBrazilCompliance) && brazilCompliance !== publicBrazilCompliance) {
    fail("legalReview.brazilComplianceReviewedAt must match publicConfig.brazilComplianceReviewedAt.");
  }
  if (!isBlank(aiHandoff) && !isBlank(publicAiHandoff) && aiHandoff !== publicAiHandoff) {
    fail("legalReview.aiHandoffReviewedAt must match publicConfig.aiHandoffReviewedAt.");
  }
}

function validateLive(packet) {
  requirePath(packet, "support.supportEmail", "support email");
  requirePath(packet, "support.owner", "support owner");
  requirePath(packet, "support.monitoringCadence", "support monitoring cadence");
  requirePath(packet, "support.testReceivedAt", "support test received timestamp");
  requirePath(packet, "support.testRepliedAt", "support test replied timestamp");
  requireTrue(packet, "support.verified", "support inbox verification");

  requirePath(packet, "google.sheetUrl", "Google Sheet URL");
  requirePath(packet, "google.formUrl", "Google Form URL");
  requirePath(packet, "google.testResponseTimestamp", "Google Form test response timestamp");
  requireTrue(packet, "google.requestsHeaderVerified", "Requests header verification");
  requireTrue(packet, "google.invoicesHeaderVerified", "Invoices header verification");
  requireTrue(packet, "google.leadsHeaderVerified", "Leads header verification");
  requireTrue(packet, "google.formLinkedToSheet", "Google Form response link");
  requireEquals(packet, "google.acceptingResponses", false, "Google Form pre-live response collection");
  requireTrue(packet, "google.verified", "Google intake verification");

  requirePath(packet, "legalReview.termsReviewedAt", "terms review date");
  requirePath(packet, "legalReview.privacyReviewedAt", "privacy review date");
  requirePath(packet, "legalReview.supportReviewedAt", "support review date");
  requirePath(packet, "legalReview.brazilComplianceReviewedAt", "Brazil compliance review date");
  requirePath(packet, "legalReview.aiHandoffReviewedAt", "AI handoff review date");
  requirePath(packet, "legalReview.reviewer", "legal/support reviewer");

  requirePath(packet, "stripe.dashboardUrl", "Stripe dashboard URL");
  requirePath(packet, "stripe.testInvoiceId", "Stripe test invoice id");
  requirePath(packet, "stripe.testHostedInvoiceUrl", "Stripe hosted invoice URL");
  requirePath(packet, "stripe.payoutRouteVerifiedBy", "Stripe payout verifier");
  requirePath(packet, "stripe.reconciliationOwner", "Stripe reconciliation owner");
  requirePath(packet, "stripe.weeklyReconciliationDay", "weekly reconciliation day");
  requireTrue(packet, "stripe.hostedInvoicesEnabled", "Stripe Hosted Invoices");
  requireTrue(packet, "stripe.verified", "Stripe route verification");

  requirePath(packet, "bank.entityName", "bank entity name");
  requirePath(packet, "bank.bankName", "bank name");
  requirePath(packet, "bank.bankAccountLast4", "bank account last4");
  requirePath(packet, "bank.stripePayoutTestStatus", "Stripe payout test status");
  requirePath(packet, "bank.reconciliationOwner", "bank reconciliation owner");
  requireTrue(packet, "bank.responsiblePartyRecorded", "responsible party record");
  requireTrue(packet, "bank.verified", "bank route verification");

  requirePath(packet, "publicConfig.operatorName", "public operator name");
  requireEquals(packet, "publicConfig.jurisdiction", "BR", "public jurisdiction");
  requireTrue(packet, "publicConfig.aiGeneratedLegalDocsRequireHumanReview", "public AI legal review flag");
  requirePath(packet, "publicConfig.supportEmail", "public support email");
  requirePath(packet, "publicConfig.googleFormUrl", "public Google Form URL");
  requireTrue(packet, "publicConfig.supportInboxVerified", "public support verified flag");
  requireTrue(packet, "publicConfig.googleFormVerified", "public Google Form verified flag");
  requirePath(packet, "publicConfig.termsReviewedAt", "public terms review date");
  requirePath(packet, "publicConfig.privacyReviewedAt", "public privacy review date");
  requirePath(packet, "publicConfig.brazilComplianceReviewedAt", "public Brazil compliance review date");
  requirePath(packet, "publicConfig.aiHandoffReviewedAt", "public AI handoff review date");
  requireTrue(packet, "publicConfig.liveMode", "public live mode");

  requirePath(packet, "attestation.operator", "attesting operator");
  requirePath(packet, "attestation.reviewedAt", "attestation review date");
  requireTrue(packet, "attestation.noSecretsInRepo", "no-secrets attestation");
  requireTrue(packet, "attestation.strangeCompanyRemainsSealed", "sealed company attestation");
  requireTrue(packet, "attestation.satelliteIsRevenueOperator", "satellite operator attestation");

  const now = Date.now();
  const supportReceivedAt = requireRecentIsoUtcTimestamp(
    valueAt(packet, "support.testReceivedAt"),
    "support.testReceivedAt",
    "support test received timestamp",
    now
  );
  const supportRepliedAt = requireRecentIsoUtcTimestamp(
    valueAt(packet, "support.testRepliedAt"),
    "support.testRepliedAt",
    "support test replied timestamp",
    now
  );
  requireRecentIsoUtcTimestamp(
    valueAt(packet, "google.testResponseTimestamp"),
    "google.testResponseTimestamp",
    "Google Form test response timestamp",
    now
  );
  if (
    Number.isFinite(supportReceivedAt)
    && Number.isFinite(supportRepliedAt)
    && supportRepliedAt < supportReceivedAt
  ) {
    fail("support.testRepliedAt must be at or after support.testReceivedAt.");
  }
}

function validateTemplate(packet) {
  if (packet.mode !== "template") {
    warn("packet mode is not template; run with --require-live for completed packet validation.");
  }
  if (valueAt(packet, "publicConfig.liveMode") === true) {
    warn("template has publicConfig.liveMode=true; completed packets should be kept local.");
  }
}

const packet = readJson(packetPath);
assertShape(packet);
scanForSecrets(packet);
validateOptionalFormats(packet);

if (requireLive) {
  validateLive(packet);
  if (publicConfigPath) {
    validateCurrentPublicConfigBinding(packet, readPublicConfig(publicConfigPath));
  } else {
    fail("--require-live requires --public-config public-config.js so readiness cannot pass against a stale public snapshot.");
  }
} else if (templateOk) {
  validateTemplate(packet);
}

if (failures.length) {
  console.error("External live packet validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  requireLive
    ? "External live packet validation passed for live intake."
    : "External live packet template validation passed."
);
for (const warning of warnings) {
  console.log(`Warning: ${warning}`);
}
