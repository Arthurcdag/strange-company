const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function compileJavaScript(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
  } catch (error) {
    fail(`${relativePath} does not parse: ${error.message}`);
  }
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  try {
    vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
    return sandbox.window.PUBLIC_ORDER_CONFIG || {};
  } catch (error) {
    fail(`public-config.js could not be loaded: ${error.message}`);
    return {};
  }
}

function isSafeGoogleFormUrl(value) {
  if (!value) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.href.startsWith("https://docs.google.com/forms/");
  } catch {
    return false;
  }
}

function isIsoDate(value) {
  if (!value) {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

function checkPublicSurface() {
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfig = read("public-config.js");
  const publicFiles = [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfig]
  ];

  assert(publicHtml.includes('class="public-site"'), "public.html must render the public surface.");
  assert(publicHtml.includes("public-config.js"), "public.html must load public-config.js.");
  assert(publicHtml.includes("public.js"), "public.html must load public.js.");
  assert(!publicHtml.includes("script.js"), "public.html must not load the private command center script.");

  const forbiddenPublicPatterns = [
    ["localStorage", /\blocalStorage\b/],
    ["sessionStorage", /\bsessionStorage\b/],
    ["Apps Script config", /\bappsScriptUrl\b/],
    ["Stripe dashboard", /dashboard\.stripe\.com/],
    ["private Operations label", /\bOperations\b/],
    ["private Treasury label", /\bTreasury\b/],
    ["private Decisions label", /\bDecisions\b/],
    ["private External Signals console", /\bExternal Signals\b/],
    ["plugin workflow UI", /\b(Alpaca|Binance|Zotero|Life Science Research|GitHub signal)\b/],
    ["automatic network submit", /\bfetch\s*\(/]
  ];

  for (const [file, contents] of publicFiles) {
    for (const [label, pattern] of forbiddenPublicPatterns) {
      assert(!pattern.test(contents), `${file} exposes ${label}.`);
    }
  }

  const requiredGuardTerms = [
    "findSensitiveData",
    "protected health information",
    "payment card data",
    "social security number",
    "password or secret",
    "private key material",
    "renderBlocked"
  ];
  for (const term of requiredGuardTerms) {
    assert(publicJs.includes(term), `public.js must keep the ${term} guard.`);
  }
}

function checkPrivateUrlAllowlists() {
  const script = read("script.js");
  const required = [
    '["https://docs.google.com/spreadsheets/"]',
    '["https://docs.google.com/forms/"]',
    '["https://script.google.com/macros/"]',
    '["https://dashboard.stripe.com/"]',
    '["https://invoice.stripe.com/"]'
  ];
  for (const snippet of required) {
    assert(script.includes(snippet), `script.js is missing URL allowlist ${snippet}.`);
  }
}

function checkOutcomeEvidenceContract() {
  const script = read("script.js");
  const required = [
    ["safeHttpsUrl helper", "function safeHttpsUrl"],
    ["evidence submit handler", "function submitOutcomeEvidence"],
    ["evidence-required guard in createOutcomeFromPacket", "if (!evidence) {"],
    ["bounty evidence form renderer", 'data-evidence-form="'],
    ["artifact URL field", 'name="artifactUrl"'],
    ["measured before field", 'name="measuredBefore"'],
    ["measured after field", 'name="measuredAfter"'],
    ["next claim field", 'name="nextClaim"'],
    ["source signal field", 'name="sourceSignalId"'],
    ["eligible source signal filter", "function eligibleOutcomeSignals"],
    ["source signal sensitive scan", "signalSensitiveFindings(sourceSignal)"],
    ["source signal metadata copy", "sourceSignalReference: sourceSignal ? sourceSignal.evidence_reference"],
    ["sensitive-data scan over evidence", "findSensitiveData(`${measuredBefore}"],
    ["outcome review storage", "const OUTCOME_REVIEWS_KEY"],
    ["outcome review validator", "function validateOutcomeForReview"],
    ["outcome review approval", "function approveOutcomeReview"],
    ["outcome route review blocker", "function outcomeRouteBlockedReason"],
    ["route guard uses review blocker", "const routeBlock = outcomeRouteBlockedReason(outcome)"],
    ["proposal carries artifact evidence", "evidenceArtifactUrl: artifact"],
    ["proposal carries measurement evidence", "evidenceMeasuredBefore: before"],
    ["proposal carries review evidence", "evidenceReviewId: review ? review.id"],
    ["proposal carries signal evidence", "sourceSignalId: outcome.sourceSignalId"],
    ["receipt chain carries review receipts", 'push("Review", review.id'],
    ["receipt chain carries outcome artifact", "artifactUrl: outcome.artifactUrl"],
    ["receipt chain carries outcome measurement", "measuredBefore: outcome.measuredBefore"],
    ["receipt chain carries outcome review", "evidenceReviewId: review ? review.id"],
    ["receipt chain carries outcome signal", "sourceSignalId: outcome.sourceSignalId"]
  ];
  for (const [label, snippet] of required) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }
}

function checkOrderLifecycleContract() {
  const script = read("script.js");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");

  const required = [
    ["incident storage key", 'const OPERATION_INCIDENTS_KEY = "strange-company-operation-incidents"'],
    ["incident severities", 'const INCIDENT_SEVERITIES = ["info", "low", "medium", "high"]'],
    ["incident statuses", 'const INCIDENT_STATUSES = ["open", "mitigating", "resolved", "closed"]'],
    ["normalizeOperationIncident", "function normalizeOperationIncident"],
    ["loadOperationIncidents", "function loadOperationIncidents"],
    ["saveOperationIncidents", "function saveOperationIncidents"],
    ["operation incident state", "let operationIncidents"],
    ["order normalizer for delivery artifact", "deliveryArtifactUrl: artifactRaw ? safeHttpsUrl(artifactRaw)"],
    ["order normalizer for acceptance note", "acceptanceNote: typeof order.acceptanceNote === \"string\""],
    ["order normalizer for incidentIds", "incidentIds: Array.isArray(order.incidentIds)"],
    ["order advance block helper", "function orderAdvanceBlock"],
    ["delivery artifact gate", "Attach an https:// delivery artifact URL before marking Delivered."],
    ["acceptance note gate", "Record an acceptance note before marking Delivered."],
    ["acceptance note sensitive scan", "findSensitiveData(String(order.acceptanceNote"],
    ["invoiceSentAt stamp", "next.invoiceSentAt = now"],
    ["paidAt stamp", "next.paidAt = now"],
    ["deliveredAt stamp", "next.deliveredAt = now"],
    ["incident submit handler", "function submitOrderIncident"],
    ["incident push to chain", 'push(\n      "Incident",'],
    ["order chain payload carries acceptance", "acceptanceNote: order.acceptanceNote"],
    ["order chain payload carries delivery artifact", "deliveryArtifactUrl: safeHttpsUrl(order.deliveryArtifactUrl"],
    ["order chain payload carries timestamps", "invoiceSentAt: order.invoiceSentAt"],
    ["order chain payload carries incidentIds", "incidentIds: Array.isArray(order.incidentIds)"]
  ];
  for (const [label, snippet] of required) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  assert(
    runbook.includes("Order Lifecycle Receipts"),
    "OPERATIONS_RUNBOOK.md must document Order Lifecycle Receipts."
  );
  assert(runbook.includes("Incidents"), "OPERATIONS_RUNBOOK.md must document Incidents.");

  for (const [file, contents] of [["public.html", publicHtml], ["public.js", publicJs]]) {
    assert(!/data-incident-form/.test(contents), `${file} exposes incident form attribute.`);
    assert(!/operationIncidents/.test(contents), `${file} exposes operationIncidents state.`);
    assert(!/deliveryArtifactUrl/.test(contents), `${file} exposes deliveryArtifactUrl field.`);
    assert(!/acceptanceNote/.test(contents), `${file} exposes acceptanceNote field.`);
  }
}

function checkConfig() {
  const config = loadPublicConfig();
  const formUrl = String(config.googleFormUrl || "").trim();
  const supportEmail = String(config.supportEmail || "").trim();
  const termsReviewedAt = String(config.termsReviewedAt || "").trim();
  const privacyReviewedAt = String(config.privacyReviewedAt || "").trim();
  const services = Array.isArray(config.services) ? config.services : [];

  assert(Boolean(config.operatorName), "public-config.js needs operatorName.");
  assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail), "public-config.js needs a valid supportEmail.");
  assert(isSafeGoogleFormUrl(formUrl), "googleFormUrl must be blank or an https://docs.google.com/forms/ URL.");
  assert(typeof config.supportInboxVerified === "boolean", "supportInboxVerified must be boolean.");
  assert(typeof config.googleFormVerified === "boolean", "googleFormVerified must be boolean.");
  assert(typeof config.liveMode === "boolean", "liveMode must be boolean.");
  assert(isIsoDate(termsReviewedAt), "termsReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(privacyReviewedAt), "privacyReviewedAt must be blank or YYYY-MM-DD.");
  assert(services.length > 0, "services must contain at least one public offer.");

  for (const [index, service] of services.entries()) {
    assert(Boolean(service.id), `services[${index}] needs id.`);
    assert(Boolean(service.title), `services[${index}] needs title.`);
    assert(Number(service.price) > 0, `services[${index}] needs a positive price.`);
  }

  if (config.googleFormVerified) {
    assert(Boolean(formUrl), "googleFormVerified requires googleFormUrl.");
  }

  if (config.liveMode) {
    assert(config.supportInboxVerified, "liveMode requires supportInboxVerified.");
    assert(config.googleFormVerified, "liveMode requires googleFormVerified.");
    assert(Boolean(formUrl), "liveMode requires googleFormUrl.");
    assert(Boolean(termsReviewedAt), "liveMode requires termsReviewedAt.");
    assert(Boolean(privacyReviewedAt), "liveMode requires privacyReviewedAt.");
  }
}

compileJavaScript("public-config.js");
compileJavaScript("public.js");
compileJavaScript("script.js");
checkPublicSurface();
checkPrivateUrlAllowlists();
checkOutcomeEvidenceContract();
checkOrderLifecycleContract();
checkConfig();

if (failures.length) {
  console.error("Public launch preflight failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Public launch preflight passed.");
