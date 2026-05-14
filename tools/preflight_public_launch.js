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
    ["private Profit Readiness panel", /\bProfit readiness\b/i],
    ["private paid pilot pipeline", /\bPaid pilot pipeline\b/i],
    ["sales lead form", /salesLeadForm/],
    ["sales lead storage key", /strange-company-sales-leads/],
    ["sales lead bulk copy", /copyAllLeadRows/],
    ["sales pipeline stage internals", /\binvoice_ready\b/],
    ["private Sheet ledger bridge", /\bSheet ledger bridge\b/i],
    ["private Daily pilot run console", /\bDaily pilot run\b/i],
    ["ledger bridge form id", /operationsLedgerBridgeForm/],
    ["daily run storage key", /strange-company-daily-pilot-run/],
    ["plugin workflow UI", /\b(Alpaca|Binance|Zotero|Life Science Research|GitHub signal)\b/],
    ["automatic network submit", /\bfetch\s*\(/],
    ["private Setup evidence panel", /\bSetup evidence\b/i],
    ["private Customer acquisition panel", /\bCustomer acquisition\b/i],
    ["setup evidence form id", /setupEvidencePanel/],
    ["setup evidence storage key", /strange-company-setup-evidence/],
    ["setup evidence slot internals", /SETUP_EVIDENCE_SLOTS/],
    ["customer acquisition form id", /customerAcquisitionPanel/],
    ["customer acquisition storage key", /strange-company-customer-acquisition/],
    ["acquisition lead source internals", /ACQUISITION_LEAD_SOURCES/],
    ["private outreach log form", /outreachLogForm/]
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

function checkLedgerBridgeContract() {
  const script = read("script.js");
  const indexHtml = read("index.html");
  const ledgerDoc = read("GOOGLE_SHEET_LEDGER.md");
  const required = [
    ["LEDGER_HEADERS constant", "const LEDGER_HEADERS = ["],
    ["LEDGER_STATUSES constant", 'const LEDGER_STATUSES = ["Draft", "Sent", "Paid", "Delivered"]'],
    ["parseLedgerTsv parser", "function parseLedgerTsv"],
    ["validateLedgerRow validator", "function validateLedgerRow"],
    ["importLedger upsert", "function importLedger"],
    ["upsert reads operations.orders", "operations.orders || []"],
    ["non-blank preservation for customer", "customer: incoming.customer || existing.customer"],
    ["extra column rejection", "expected ${LEDGER_HEADERS.length}. Remove extra Sheet columns before import."],
    ["positive amount required", "amount must be a finite, positive number."],
    ["sensitive-data scan in row validator", "findSensitiveData(joined)"],
    ["status whitelist applied", "LEDGER_STATUSES.includes(status)"],
    ["stripe URL allowlist applied", "safeExternalUrl(stripeRaw, STRIPE_INVOICE_URLS)"],
    ["per-row export helper", "function orderToLedgerRow"],
    ["bulk export helper", "function allOrdersLedgerTsv"],
    ["per-row copy handler", "function copyOrderLedgerRow"],
    ["bulk copy handler", "function copyAllLedgerRows"],
    ["per-row copy attribute", "data-copy-ledger-row="]
  ];
  for (const [label, snippet] of required) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["bridge form", 'id="operationsLedgerBridgeForm"'],
    ["bridge textarea", 'id="operationsLedgerTsv"'],
    ["preview button", 'id="operationsLedgerPreview"'],
    ["apply button", 'id="operationsLedgerImport"'],
    ["bulk copy button", 'id="copyAllLedgerRows"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(
    ledgerDoc.includes("Private Ledger Bridge"),
    "GOOGLE_SHEET_LEDGER.md must document the Private Ledger Bridge."
  );
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
    ["incident push to chain", 'operationIncidents.forEach((incident) => {'],
    ["incident receipt type", '"Incident",'],
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

function checkDailyPilotRunContract() {
  const script = read("script.js");
  const indexHtml = read("index.html");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const livePilot = read("RUN_LIVE_PILOT.md");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfig = read("public-config.js");

  const required = [
    ["daily run storage key", 'const DAILY_PILOT_RUN_KEY = "strange-company-daily-pilot-run"'],
    ["daily run checks", "const DAILY_RUN_CHECKS = ["],
    ["daily run stop rules", "const DAILY_RUN_STOP_RULES = ["],
    ["daily run loader", "function loadDailyPilotRun"],
    ["daily run saver", "function saveDailyPilotRun"],
    ["daily run normalizer", "function normalizeDailyRunRecord"],
    ["active stop rules helper", "function activeStopRules"],
    ["paused reason helper", "function dailyRunPausedReason"],
    ["start run handler", "function startDailyPilotRun"],
    ["close run handler", "function closeDailyPilotRun"],
    ["check toggle handler", "function toggleDailyRunCheck"],
    ["stop-rule toggle handler", "function toggleDailyRunStopRule"],
    ["incident id handler", "function updateDailyRunIncidentIds"],
    ["reset run handler", "function resetDailyPilotRun"],
    ["daily run renderer", "function renderDailyPilotRun"],
    ["touched order collector", "function collectDailyRunOrderIds"],
    ["receipt root captured at close", "const chain = buildReceiptChain()"],
    ["paused state in Operations model", 'state: "Paused"'],
    ["Draft to Sent paused block", 'order.status === "Draft" && pausedReason'],
    ["Run receipt type", '"Run",'],
    ["Run receipt carries receiptRoot", "receiptRoot: entry.receiptRoot"],
    ["Run receipt carries completedChecks", "completedChecks,"],
    ["Run receipt carries stopRules", "stopRules: entry.activeRules"]
  ];
  for (const [label, snippet] of required) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["daily run panel container", 'id="operationsDailyRun"'],
    ["start run button", 'id="startDailyPilotRun"'],
    ["close run button", 'id="closeDailyPilotRun"'],
    ["reset run button", 'id="resetDailyPilotRun"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(
    runbook.includes("Daily Pilot Run Console"),
    "OPERATIONS_RUNBOOK.md must document the Daily Pilot Run Console."
  );
  assert(
    livePilot.includes("Run the daily pilot console"),
    "RUN_LIVE_PILOT.md must document the daily pilot console step."
  );

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfig]
  ]) {
    assert(!/Daily pilot run/i.test(contents), `${file} exposes Daily pilot run text.`);
    assert(!/strange-company-daily-pilot-run/.test(contents), `${file} exposes daily run storage key.`);
    assert(!/operationsDailyRun/.test(contents), `${file} exposes daily run private UI.`);
  }
}

function checkPaidPilotProfitReadinessContract() {
  const script = read("script.js");
  const indexHtml = read("index.html");
  const ledgerDoc = read("GOOGLE_SHEET_LEDGER.md");
  const satelliteDoc = read("SATELLITE_COMPANY.md");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfigText = read("public-config.js");
  const publicConfig = loadPublicConfig();

  const requiredScript = [
    ["sales lead storage key", 'const SALES_LEADS_KEY = "strange-company-sales-leads"'],
    ["sales lead stages", 'const salesLeadStages = ["prospect", "qualified", "invoice_ready", "invoice_sent", "paid", "delivered", "rejected"]'],
    ["leads sheet headers", "const LEADS_HEADERS = ["],
    ["sales lead loader", "function loadSalesLeads"],
    ["sales lead saver", "function saveSalesLeads"],
    ["profit readiness model", "function buildProfitReadiness"],
    ["profit readiness renderer", "function renderProfitReadiness"],
    ["sales pipeline renderer", "function renderSalesPipeline"],
    ["sales lead create handler", "function addSalesLead"],
    ["sales lead order conversion", "function convertSalesLeadToOrder"],
    ["order stage sync", "function syncSalesLeadsFromOrders"],
    ["lead qualification copy", "function leadQualificationPacket"],
    ["lead invoice copy", "function leadInvoicePacket"],
    ["lead ledger row copy", "function leadToLedgerRow"],
    ["lead bulk TSV copy", "function copyAllLeadRows"],
    ["daily closeout copy", "function copyDailyRunSummary"],
    ["daily closeout summary", "function dailyRunCloseoutSummary"],
    ["sensitive lead scan", "findSensitiveData([customer, contact, need, qualificationNote]"],
    ["lead source copied into order", 'source: `Sales pipeline / ${lead.source || "Manual"}`'],
    ["sales lead receipts", 'push("Sales Lead", lead.id'],
    ["profit readiness receipt payload", "profitReadinessState: profitReadiness.state"]
  ];
  for (const [label, snippet] of requiredScript) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["profit readiness panel", 'id="profitReadinessPanel"'],
    ["sales lead form", 'id="salesLeadForm"'],
    ["sales lead list", 'id="salesLeadList"'],
    ["sales lead bulk copy", 'id="copyAllLeadRows"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(ledgerDoc.includes("`Leads`"), "GOOGLE_SHEET_LEDGER.md must document the Leads tab.");
  assert(
    ledgerDoc.includes("created_at,lead_id,customer,contact,service,amount,source,stage,qualification_note,order_id,notes"),
    "GOOGLE_SHEET_LEDGER.md must include the Leads tab header."
  );
  assert(satelliteDoc.includes("Profit Readiness"), "SATELLITE_COMPANY.md must document Profit Readiness.");
  assert(runbook.includes("Paid Pilot Profit Readiness"), "OPERATIONS_RUNBOOK.md must document Paid Pilot Profit Readiness.");
  assert(publicConfig.liveMode === false, "public-config.js must keep liveMode false by default.");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfigText]
  ]) {
    assert(!/Paid pilot pipeline/i.test(contents), `${file} exposes private paid pilot pipeline text.`);
    assert(!/Profit readiness/i.test(contents), `${file} exposes private Profit readiness text.`);
    assert(!/salesLeadForm/.test(contents), `${file} exposes salesLeadForm.`);
    assert(!/strange-company-sales-leads/.test(contents), `${file} exposes sales lead storage key.`);
    assert(!/copyAllLeadRows/.test(contents), `${file} exposes lead bulk copy action.`);
    assert(!/\binvoice_ready\b/.test(contents), `${file} exposes private sales stage internals.`);
  }
}

function checkOperationalV15Contract() {
  const script = read("script.js");
  const indexHtml = read("index.html");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfigText = read("public-config.js");

  const requiredScript = [
    ["setup evidence storage key", 'const SETUP_EVIDENCE_KEY = "strange-company-setup-evidence"'],
    ["customer acquisition storage key", 'const CUSTOMER_ACQUISITION_KEY = "strange-company-customer-acquisition"'],
    ["setup evidence statuses", 'const SETUP_EVIDENCE_STATUSES = ["missing", "pending", "verified", "blocked"]'],
    ["setup evidence slots", "const SETUP_EVIDENCE_SLOTS = ["],
    ["acquisition lead sources", 'const ACQUISITION_LEAD_SOURCES = ["referral", "email", "form", "direct", "partner"]'],
    ["setup evidence loader", "function loadSetupEvidence"],
    ["setup evidence saver", "function saveSetupEvidence"],
    ["setup evidence normalizer", "function normalizeSetupEvidence"],
    ["setup evidence model", "function buildSetupEvidenceModel"],
    ["setup evidence renderer", "function renderSetupEvidence"],
    ["setup evidence verify handler", "function verifySetupEvidence"],
    ["setup evidence clear handler", "function clearSetupEvidence"],
    ["setup evidence url sanitizer", 'safeHttpsUrl(raw)'],
    ["setup evidence note sensitive scan", "findSensitiveData(note)"],
    ["customer acquisition loader", "function loadCustomerAcquisition"],
    ["customer acquisition saver", "function saveCustomerAcquisition"],
    ["customer acquisition model", "function buildCustomerAcquisitionModel"],
    ["customer acquisition renderer", "function renderCustomerAcquisition"],
    ["outreach packet builder", "function outreachPacket"],
    ["outreach log submit", "function submitOutreachLog"],
    ["outreach log remove", "function removeOutreachEntry"],
    ["outreach packet copy", "async function copyOutreachPacket"],
    ["profit readiness reads setup evidence", "const setupModel = buildSetupEvidenceModel()"],
    ["profit readiness blocker names slot", 'blockers.push(`unverified evidence: ${record.label}`)'],
    ["setup evidence receipt type", 'push("Setup Evidence"'],
    ["acquisition receipt type", 'push("Acquisition"'],
    ["sales lead sourceCategory", "const sourceCategory = ACQUISITION_LEAD_SOURCES.includes(sourceCategoryRaw)"]
  ];
  for (const [label, snippet] of requiredScript) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["setup evidence panel container", 'id="setupEvidencePanel"'],
    ["setup evidence reset button", 'id="resetSetupEvidence"'],
    ["customer acquisition panel container", 'id="customerAcquisitionPanel"'],
    ["customer acquisition reset button", 'id="resetCustomerAcquisition"'],
    ["sales lead source category select", 'id="salesLeadSourceCategory"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(runbook.includes("Operational v1.5"), "OPERATIONS_RUNBOOK.md must document Operational v1.5.");
  assert(runbook.includes("Setup Evidence"), "OPERATIONS_RUNBOOK.md must reference the Setup Evidence panel.");
  assert(runbook.includes("Customer Acquisition"), "OPERATIONS_RUNBOOK.md must reference the Customer Acquisition panel.");

  const setupDoc = read("SETUP_EVIDENCE.md");
  assert(setupDoc.includes("# Setup Evidence"), "SETUP_EVIDENCE.md must exist and start with a top-level heading.");
  assert(setupDoc.includes("Profit Readiness Gate"), "SETUP_EVIDENCE.md must document the Profit Readiness gate.");

  const acquisitionDoc = read("CUSTOMER_ACQUISITION.md");
  assert(acquisitionDoc.includes("# Customer Acquisition"), "CUSTOMER_ACQUISITION.md must exist and start with a top-level heading.");
  assert(acquisitionDoc.includes("Outreach Log"), "CUSTOMER_ACQUISITION.md must document the outreach log.");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfigText]
  ]) {
    assert(!/strange-company-setup-evidence/.test(contents), `${file} exposes setup evidence storage key.`);
    assert(!/strange-company-customer-acquisition/.test(contents), `${file} exposes customer acquisition storage key.`);
    assert(!/setupEvidencePanel/.test(contents), `${file} exposes setup evidence panel id.`);
    assert(!/customerAcquisitionPanel/.test(contents), `${file} exposes customer acquisition panel id.`);
    assert(!/outreachLogForm/.test(contents), `${file} exposes outreach log form id.`);
    assert(!/SETUP_EVIDENCE_SLOTS/.test(contents), `${file} exposes setup evidence slot internals.`);
    assert(!/ACQUISITION_LEAD_SOURCES/.test(contents), `${file} exposes acquisition lead source internals.`);
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
checkLedgerBridgeContract();
checkOrderLifecycleContract();
checkDailyPilotRunContract();
checkPaidPilotProfitReadinessContract();
checkOperationalV15Contract();
checkConfig();

if (failures.length) {
  console.error("Public launch preflight failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Public launch preflight passed.");
