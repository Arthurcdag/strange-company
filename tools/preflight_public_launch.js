const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const failures = [];
const deploymentMode = process.argv.includes("--deployment");
const PUBLIC_REVIEW_DOCUMENT_PATHS = Object.freeze([
  "TERMOS.md",
  "TERMS.md",
  "AVISO_DE_PRIVACIDADE.md",
  "PRIVACY.md",
  "BRAZIL_COMPLIANCE.md",
  "BRAZIL_COMPLIANCE_AGENTS.md",
  "CONKA8_LAW_INSTRUCTIONS.md",
  "AI_LEGAL_HANDOFF.md",
  "HUMAN_REVIEW_PACKET.md",
]);

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

function checkExternalLivePacketGate() {
  const result = spawnSync(process.execPath, ["tools/check_external_live_packet_gate.js"], {
    cwd: root,
    encoding: "utf8"
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  assert(result.status === 0, `external live packet gate regression failed:\n${output}`);
}

function checkPublicLiveReceipt() {
  const receiptArgs = [
    "tools/export_public_live_receipt.js",
    "--check-public-js",
    "--public-config",
    "public-config.js",
    "--public-js",
    "public-live-receipt.js",
  ];
  if (deploymentMode && loadPublicConfig().liveMode === true) {
    receiptArgs.push("--require-issued");
  }
  const result = spawnSync(process.execPath, receiptArgs, {
    cwd: root,
    encoding: "utf8"
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  assert(result.status === 0, `public live receipt regression failed:\n${output}`);
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
  const publicAnswers = read("public-ama-answers.js");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const publicFiles = [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-ama-answers.js", publicAnswers],
    ["public-config.js", publicConfig]
  ];

  assert(publicHtml.includes('class="public-site"'), "public.html must render the public surface.");
  assert(
    publicHtml.includes('http-equiv="Content-Security-Policy"')
      && publicHtml.includes("script-src 'self'")
      && publicHtml.includes("connect-src 'self'")
      && publicHtml.includes("form-action 'none'"),
    "public.html must keep a self-contained fail-closed Content Security Policy."
  );
  assert(!/<script\b[^>]*\bsrc=["']https?:\/\//i.test(publicHtml), "public.html must not execute third-party runtime scripts.");
  assert(publicHtml.includes('id="publicAmaForm"'), "public.html must render the public AMA form.");
  assert(publicHtml.includes('id="publicAmaAnswers"'), "public.html must render the public AMA answer archive.");
  assert(publicHtml.includes('href="PUBLIC_AMA.md"'), "public.html must link the public AMA rules.");
  assert(publicHtml.includes('src="public-live-receipt.js"'), "public.html must load the public live receipt before public.js.");
  assert(publicHtml.includes('id="publicOrderClosed"'), "public.html must render the fail-closed paid-intake notice.");
  assert(publicHtml.includes('href="#ama"'), "public.html must hand closed paid intake to the public-safe AMA.");
  assert(publicHtml.includes('id="publicOrderForm" hidden aria-hidden="true"'), "public order form must start hidden.");
  assert(publicHtml.includes('id="publicOrderFields" hidden disabled'), "public order fields must start disabled.");
  assert(publicJs.includes("liveReviewClosureValidatorPassed"), "public receipt verification must require the document-bound human-review attestation.");
  assert(publicHtml.includes("public-config.js"), "public.html must load public-config.js.");
  assert(publicHtml.includes("public-ama-answers.js"), "public.html must load public-ama-answers.js.");
  assert(publicHtml.includes("public.js"), "public.html must load public.js.");
  assert(!publicHtml.includes("script.js"), "public.html must not load the private command center script.");
  assert(pagesWorkflow.includes("node tools/build_public_site.js --check --output _site --force"), "pages workflow must use the public site build checker.");
  assert(pagesWorkflow.includes("python -m unittest discover -s tests"), "Pages deployment must run the full test suite before upload/deploy.");
  assert(validateWorkflow.includes("node tools/build_public_site.js --check --output .public-site-build.local --force"), "validate workflow must check the public site bundle.");

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
    ["beacon network submit", /\bsendBeacon\s*\(/],
    ["XHR network submit", /\bXMLHttpRequest\b/],
    ["WebSocket network channel", /\bWebSocket\s*\(/],
    ["EventSource network channel", /\bEventSource\s*\(/],
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

  const fetchCalls = publicJs.match(/\bfetch\s*\(/g) || [];
  const assetHelperReferences = publicJs.match(/\bfetchPublicAssetText\s*\(/g) || [];
  assert(fetchCalls.length === 1, "public.js may contain only the fixed same-origin public-asset GET.");
  assert(
    publicJs.includes("const response = await fetch(assetPath, requestOptions);"),
    "public.js fetch must stay inside the public-asset verification helper."
  );
  assert(
    publicJs.includes('const requestOptions = { cache: "no-store", credentials: "same-origin" };'),
    "public.js public-asset fetch must be same-origin and bypass the browser cache."
  );
  assert(assetHelperReferences.length === 3, "public.js public-asset helper must have only its declaration and two fixed call sites.");
  assert(
    publicJs.includes("const PUBLIC_REVIEW_DOCUMENT_PATHS = Object.freeze([")
      && PUBLIC_REVIEW_DOCUMENT_PATHS.every((documentPath) => publicJs.includes(JSON.stringify(documentPath)))
      && publicJs.includes("Promise.all(PUBLIC_REVIEW_DOCUMENT_PATHS.map"),
    "public.js nine-document fetch allowlist must stay fixed and concurrently revalidated."
  );
  assert(
    publicJs.includes('fetchPublicAssetText("public-live-receipt.js")'),
    "public.js receipt revalidation fetch must stay fixed."
  );
  assert(!/\bmethod\s*:/.test(publicJs), "public.js public-asset fetch must remain a GET.");
  assert(!/\bbody\s*:/.test(publicJs), "public.js must not attach a request body to network calls.");
  for (const [file, contents] of publicFiles.filter(([file]) => file !== "public.js")) {
    assert(!/\bfetch\s*\(/.test(contents), `${file} must not perform network fetches.`);
  }

  const requiredGuardTerms = [
    "findSensitiveData",
    "protected health information",
    "payment card data",
    "social security number",
    "password or secret",
    "private key material",
    "Brazil personal or company tax ID",
    "renderBlocked",
    "renderAmaBlocked",
    "amaQuestionPacket",
    "publicAmaAnswersModel",
    "renderPublicAmaAnswers",
    "setupAmaForm",
    "if (!readiness.supportReady)",
    "Public AMA Desk",
    "No order, invoice, payment request, customer support ticket, or launch approval is created.",
    "Public intake is closed",
    "if (!readiness.liveReady)",
    "function setPublicOrderAvailability()",
    "readiness.liveReady === true",
    "function publicLiveReceiptReady(",
    "function fetchPublicAssetText(",
    "function parsePublicLiveReceiptScript(",
    "await refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });",
    "PUBLIC_LIVE_RECEIPT_REFRESH_IN_FLIGHT",
    "PUBLIC_LIVE_RECEIPT_FORCE_REVALIDATION_REQUESTED",
    "PUBLIC_REVIEW_DOCUMENT_VERIFICATION_TTL_MS",
    'receipt.status === "local_packet_validators_passed"',
    'globalThis.crypto.subtle.digest("SHA-256", bytes)',
    "attestations.operationalValidatorsPassed === true",
    "receipt.envelopeSha256",
    "validUntilDate.valueOf() > now",
    "function schedulePublicReceiptExpiry()",
    "form.hidden = !liveReady",
    "fields.disabled = !liveReady",
    "readiness.liveReady ? `<a href=\"${mailtoUrl(order)}\">Open email draft</a>` : \"\""
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

function checkOrderTimelineContract() {
  const script = read("script.js");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const required = [
    ["timeline builder", "function buildOrderTimeline(order)"],
    ["timeline renderer", "function renderOrderTimeline(order)"],
    ["timeline mounted on order cards", "${renderOrderTimeline(order)}"],
    ["created order event", "order.createdAt"],
    ["sent invoice event", "order.invoiceSentAt"],
    ["paid order event", "order.paidAt"],
    ["delivered order event", "order.deliveredAt"],
    ["blocked transition event", "order.blockedAt && order.blockReason"],
    ["linked incident timeline events", "(order.incidentIds || []).forEach"],
    ["incident update event", "incident.updatedAt && incident.updatedAt !== incident.createdAt"],
    ["timeline chronological sort", "events.sort((a, b) => String(a.at || \"\").localeCompare(String(b.at || \"\")))"],
    ["timeline timestamp rendering", "formatReceiptDate(event.at)"],
    ["timeline actor rendering", "ops-order-timeline-actor"],
    ["timeline evidence rendering", "ops-order-timeline-evidence"],
    ["timeline evidence links", "entry.href"],
    ["timeline empty state", "ops-order-timeline-empty"],
    ["timeline summary label", "Receipt chain timeline"]
  ];
  for (const [label, snippet] of required) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  assert(
    runbook.includes("Receipt Chain Timeline Panel"),
    "OPERATIONS_RUNBOOK.md must document the Receipt Chain Timeline Panel."
  );
  assert(
    runbook.includes("Each event shows:") &&
      runbook.includes("the timestamp") &&
      runbook.includes("the actor that produced the transition") &&
      runbook.includes("the state transition itself") &&
      runbook.includes("attached evidence and metadata"),
    "OPERATIONS_RUNBOOK.md must document the order timeline event fields."
  );
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
  if (!deploymentMode) {
    assert(publicConfig.liveMode === false, "public-config.js must keep liveMode false by default; use --deployment only for the separately reviewed live flip.");
  }

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
    ["Brazil compliance agent list", "const BRAZIL_COMPLIANCE_AGENTS = ["],
    ["Brazil compliance agent model", "function buildBrazilComplianceAgentsModel"],
    ["Brazil compliance agent packet", "function brazilComplianceAgentPacket"],
    ["Brazil compliance agent renderer", "function renderBrazilComplianceAgents"],
    ["Brazil compliance agent copy handler", "async function copyBrazilComplianceAgentPacket"],
    ["customer acquisition loader", "function loadCustomerAcquisition"],
    ["customer acquisition saver", "function saveCustomerAcquisition"],
    ["customer acquisition model", "function buildCustomerAcquisitionModel"],
    ["customer acquisition renderer", "function renderCustomerAcquisition"],
    ["outreach packet builder", "function outreachPacket"],
    ["outreach log submit", "function submitOutreachLog"],
    ["outreach log remove", "function removeOutreachEntry"],
    ["outreach packet copy", "async function copyOutreachPacket"],
    ["growth review model", "function buildGrowthReviewModel"],
    ["growth review renderer", "function renderGrowthReview"],
    ["growth review packet", "function growthReviewPacket"],
    ["growth review copy handler", "async function copyGrowthReviewPacket"],
    ["profit readiness reads setup evidence", "const setupModel = buildSetupEvidenceModel()"],
    ["profit readiness blocker names slot", 'blockers.push(`unverified evidence: ${record.label}`)'],
    ["setup evidence receipt type", 'push("Setup Evidence"'],
    ["acquisition receipt type", 'push("Acquisition"'],
    ["growth review receipt type", '"Growth Review",'],
    ["sales lead sourceCategory", "const sourceCategory = ACQUISITION_LEAD_SOURCES.includes(sourceCategoryRaw)"]
  ];
  for (const [label, snippet] of requiredScript) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["setup evidence panel container", 'id="setupEvidencePanel"'],
    ["setup evidence reset button", 'id="resetSetupEvidence"'],
    ["Brazil compliance agents panel container", 'id="brazilComplianceAgentsPanel"'],
    ["customer acquisition panel container", 'id="customerAcquisitionPanel"'],
    ["customer acquisition reset button", 'id="resetCustomerAcquisition"'],
    ["growth review panel container", 'id="growthReviewPanel"'],
    ["growth review copy button", 'id="copyGrowthReview"'],
    ["sales lead source category select", 'id="salesLeadSourceCategory"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(runbook.includes("Operational v1.5"), "OPERATIONS_RUNBOOK.md must document Operational v1.5.");
  assert(runbook.includes("Setup Evidence"), "OPERATIONS_RUNBOOK.md must reference the Setup Evidence panel.");
  assert(runbook.includes("Brazil Compliance Agents"), "OPERATIONS_RUNBOOK.md must reference the Brazil Compliance Agents panel.");
  assert(runbook.includes("Customer Acquisition"), "OPERATIONS_RUNBOOK.md must reference the Customer Acquisition panel.");
  assert(runbook.includes("Growth Management"), "OPERATIONS_RUNBOOK.md must reference the Growth Management panel.");

  const setupDoc = read("SETUP_EVIDENCE.md");
  assert(setupDoc.includes("# Setup Evidence"), "SETUP_EVIDENCE.md must exist and start with a top-level heading.");
  assert(setupDoc.includes("Profit Readiness Gate"), "SETUP_EVIDENCE.md must document the Profit Readiness gate.");

  const acquisitionDoc = read("CUSTOMER_ACQUISITION.md");
  assert(acquisitionDoc.includes("# Customer Acquisition"), "CUSTOMER_ACQUISITION.md must exist and start with a top-level heading.");
  assert(acquisitionDoc.includes("Outreach Log"), "CUSTOMER_ACQUISITION.md must document the outreach log.");

  const growthDoc = read("GROWTH_MANAGEMENT.md");
  assert(growthDoc.includes("# Growth Management"), "GROWTH_MANAGEMENT.md must exist and start with a top-level heading.");
  assert(growthDoc.includes("Growth States"), "GROWTH_MANAGEMENT.md must document growth states.");

  const complianceAgentsDoc = read("BRAZIL_COMPLIANCE_AGENTS.md");
  assert(complianceAgentsDoc.includes("# Brazil Compliance Agents"), "BRAZIL_COMPLIANCE_AGENTS.md must exist and start with a top-level heading.");
  assert(complianceAgentsDoc.includes("AI prepares"), "BRAZIL_COMPLIANCE_AGENTS.md must document what AI can prepare.");
  assert(complianceAgentsDoc.includes("Human must close"), "BRAZIL_COMPLIANCE_AGENTS.md must document human closure.");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfigText]
  ]) {
    assert(!/strange-company-setup-evidence/.test(contents), `${file} exposes setup evidence storage key.`);
    assert(!/strange-company-customer-acquisition/.test(contents), `${file} exposes customer acquisition storage key.`);
    assert(!/setupEvidencePanel/.test(contents), `${file} exposes setup evidence panel id.`);
    assert(!/brazilComplianceAgentsPanel/.test(contents), `${file} exposes Brazil compliance agents panel id.`);
    assert(!/customerAcquisitionPanel/.test(contents), `${file} exposes customer acquisition panel id.`);
    assert(!/growthReviewPanel/.test(contents), `${file} exposes growth review panel id.`);
    assert(!/copyGrowthReview/.test(contents), `${file} exposes growth review copy action.`);
    assert(!/outreachLogForm/.test(contents), `${file} exposes outreach log form id.`);
    assert(!/SETUP_EVIDENCE_SLOTS/.test(contents), `${file} exposes setup evidence slot internals.`);
    assert(!/\bBRAZIL_COMPLIANCE_AGENTS\b(?!\.md)/.test(contents), `${file} exposes Brazil compliance agent internals.`);
    assert(!/ACQUISITION_LEAD_SOURCES/.test(contents), `${file} exposes acquisition lead source internals.`);
  }
}

function checkRevenueStartContract() {
  const script = read("script.js");
  const indexHtml = read("index.html");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const livePilot = read("RUN_LIVE_PILOT.md");
  const satelliteDoc = read("SATELLITE_COMPANY.md");
  const revenuePilotDoc = read("REVENUE_PILOT.md");
  const revenueStartDoc = read("REVENUE_START.md");
  const readme = read("README.md");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfigText = read("public-config.js");

  const requiredScript = [
    ["revenue start storage key", 'const REVENUE_START_KEY = "strange-company-revenue-start"'],
    ["revenue start lanes", "const REVENUE_START_LANES = ["],
    ["revenue start default", "function defaultRevenueStart"],
    ["revenue start loader", "function loadRevenueStart"],
    ["revenue start saver", "function saveRevenueStart"],
    ["revenue start packet lane normalizer", "function normalizeRevenueStartPacketLane"],
    ["revenue start model", "function buildRevenueStartModel"],
    ["revenue start renderer", "function renderRevenueStart"],
    ["revenue start task toggle", "function toggleRevenueStartTask"],
    ["revenue start lane snapshot", "function snapshotRevenueStartLanes"],
    ["revenue start packet builder", "function revenueStartPacket"],
    ["revenue start issue handler", "function issueRevenueStartPacket"],
    ["revenue start copy handler", "function copyRevenueStartPacket"],
    ["revenue start packet captures lanes", "lanes: snapshotRevenueStartLanes(model.lanes)"],
    ["revenue start packet captures next action", "nextAction: model.nextAction"],
    ["revenue start receipt", '"Revenue Start",'],
    ["revenue packet receipt carries lane snapshots", "laneSnapshots: (packet.lanes || []).map"],
    ["revenue packet receipt", 'push("Revenue Packet"']
  ];
  for (const [label, snippet] of requiredScript) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["revenue start panel", 'id="revenueStartPanel"'],
    ["issue start packet button", 'id="issueRevenueStartPacket"'],
    ["reset revenue start button", 'id="resetRevenueStart"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(runbook.includes("Revenue Start Board"), "OPERATIONS_RUNBOOK.md must document the Revenue Start Board.");
  assert(livePilot.includes("Revenue start packet issued"), "RUN_LIVE_PILOT.md must include the start packet setup step.");
  assert(satelliteDoc.includes("## Revenue Start"), "SATELLITE_COMPANY.md must document Revenue Start.");
  assert(revenuePilotDoc.includes("## Starting Revenue"), "REVENUE_PILOT.md must document Starting Revenue.");
  assert(revenueStartDoc.includes("# Revenue Start"), "REVENUE_START.md must exist and start with a top-level heading.");
  assert(revenueStartDoc.includes("Strange Company Lane"), "REVENUE_START.md must document the Strange Company lane.");
  assert(revenueStartDoc.includes("Second Company Lane"), "REVENUE_START.md must document the second company lane.");
  assert(readme.includes("REVENUE_START.md"), "README.md must link the Revenue Start operator doc.");
  assert(readme.includes("tools/audit_company_functionality.js"), "README.md must link the company functionality audit.");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfigText]
  ]) {
    assert(!/strange-company-revenue-start/.test(contents), `${file} exposes revenue start storage key.`);
    assert(!/revenueStartPanel/.test(contents), `${file} exposes revenue start panel id.`);
    assert(!/issueRevenueStartPacket/.test(contents), `${file} exposes revenue start issue action.`);
  }
}

function checkMainLegalProcedureContract() {
  const script = read("script.js");
  const indexHtml = read("index.html");
  const legalDoc = read("LEGAL_PROCEDURE.md");
  const draftFilingsDoc = read("LEGAL_DRAFT_FILINGS.md");
  const legalExperimentDoc = read("LEGAL_FILING_EXPERIMENT.md");
  const onlineGateDoc = read("ONLINE_GATE.md");
  const charterDoc = read("CHARTER.md");
  const livePilotDoc = read("RUN_LIVE_PILOT.md");
  const readme = read("README.md");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfigText = read("public-config.js");

  const requiredScript = [
    ["main legal procedure items", "const MAIN_LEGAL_PROCEDURE_ITEMS = ["],
    ["main legal procedure model", "function buildMainLegalProcedureModel"],
    ["main legal procedure renderer", "function renderLegalProcedure"],
    ["main legal procedure packet", "function legalProcedurePacket"],
    ["main legal procedure copy handler", "function copyLegalProcedurePacket"],
    ["main legal draft filing items", "const MAIN_LEGAL_DRAFT_FILING_ITEMS = ["],
    ["main legal draft filing model", "function buildLegalDraftFilingModel"],
    ["main legal draft filing renderer", "function renderLegalDraftFilings"],
    ["main legal draft filing packet", "function draftFilingPacket"],
    ["main legal draft filing copy handler", "function copyDraftFilingPacket"],
    ["legal filing experiment constant", "const LEGAL_FILING_EXPERIMENT = {"],
    ["legal try matrix constant", "const LEGAL_TRY_MATRIX = ["],
    ["legal mode distinctions constant", "const LEGAL_MODE_DISTINCTIONS = ["],
    ["legal mode distinctions model", "function buildLegalModeDistinctionsModel"],
    ["legal mode distinctions renderer", "function renderLegalModeDistinctions"],
    ["legal filing experiment model", "function buildLegalFilingExperimentModel"],
    ["legal filing experiment renderer", "function renderLegalFilingExperiment"],
    ["legal try matrix model", "function buildLegalTryMatrixModel"],
    ["legal try matrix renderer", "function renderLegalTryMatrix"],
    ["legal filing experiment packet", "function legalFilingExperimentPacket"],
    ["legal filing experiment copy handler", "function copyLegalFilingExperiment"],
    ["live legal signoff blocker", "Main legal procedure has outside signoff"],
    ["draft filing not submitted boundary", "Submission status: not submitted, not filed, not approved."],
    ["legal filing experiment no-submit rule", "Do not submit state filings, IRS EIN applications, BOI reports"],
    ["legal demand source rule", "official links must be re-checked before relying on them"]
  ];
  for (const [label, snippet] of requiredScript) {
    assert(script.includes(snippet), `script.js is missing ${label}.`);
  }

  const indexExpectations = [
    ["legal procedure copy button", 'id="copyLegalProcedurePacket"'],
    ["draft filing copy button", 'id="copyDraftFilingPacket"'],
    ["legal filing experiment copy button", 'id="copyLegalFilingExperiment"'],
    ["legal mode distinctions panel", 'id="legalModeDistinctions"'],
    ["legal try matrix panel", 'id="legalTryMatrix"'],
    ["legal procedure list", 'id="legalProcedureList"'],
    ["legal draft filing list", 'id="legalDraftFilingList"'],
    ["legal filing experiment panel", 'id="legalFilingExperimentPanel"'],
    ["legal procedure output", 'id="legalProcedureOutput"']
  ];
  for (const [label, snippet] of indexExpectations) {
    assert(indexHtml.includes(snippet), `index.html is missing ${label}.`);
  }

  assert(legalDoc.startsWith("# Main Legal Procedure"), "LEGAL_PROCEDURE.md must exist and start with a top-level heading.");
  assert(legalDoc.includes("not legal advice"), "LEGAL_PROCEDURE.md must state the legal-advice boundary.");
  assert(legalDoc.includes("SBA business registration"), "LEGAL_PROCEDURE.md must cite SBA registration guidance.");
  assert(legalDoc.includes("IRS responsible parties and nominees"), "LEGAL_PROCEDURE.md must cite IRS responsible-party guidance.");
  assert(legalDoc.includes("FinCEN BOI"), "LEGAL_PROCEDURE.md must cite FinCEN BOI guidance.");
  assert(legalDoc.includes("FTC Protecting Personal Information"), "LEGAL_PROCEDURE.md must cite FTC data-security guidance.");
  assert(legalDoc.includes("LEGAL_DRAFT_FILINGS.md"), "LEGAL_PROCEDURE.md must link the draft filing doc.");
  assert(legalDoc.includes("## Mode Distinctions"), "LEGAL_PROCEDURE.md must distinguish demand, draft, experiment, and evidence.");
  assert(legalDoc.includes("Never promote `Draft` or `Experiment` into `Evidence`"), "LEGAL_PROCEDURE.md must forbid mode promotion.");
  assert(draftFilingsDoc.startsWith("# Legal Draft Filings"), "LEGAL_DRAFT_FILINGS.md must exist and start with a top-level heading.");
  assert(draftFilingsDoc.includes("not submitted"), "LEGAL_DRAFT_FILINGS.md must state the no-submit boundary.");
  assert(draftFilingsDoc.includes("this document is `Draft`"), "LEGAL_DRAFT_FILINGS.md must identify its mode.");
  assert(draftFilingsDoc.includes("Do not store SSN, ITIN"), "LEGAL_DRAFT_FILINGS.md must keep sensitive identifiers out of repo.");
  assert(draftFilingsDoc.includes("IRS Form SS-4 instructions"), "LEGAL_DRAFT_FILINGS.md must cite IRS SS-4 guidance.");
  assert(draftFilingsDoc.includes("FinCEN BOI interim final rule Q&A"), "LEGAL_DRAFT_FILINGS.md must cite FinCEN BOI guidance.");
  assert(draftFilingsDoc.includes("FTC Protecting Personal Information"), "LEGAL_DRAFT_FILINGS.md must cite FTC data-security guidance.");
  assert(draftFilingsDoc.includes("LEGAL_FILING_EXPERIMENT.md"), "LEGAL_DRAFT_FILINGS.md must link the legal filing experiment.");
  assert(legalExperimentDoc.startsWith("# Legal Filing Experiment"), "LEGAL_FILING_EXPERIMENT.md must exist and start with a top-level heading.");
  assert(legalExperimentDoc.includes("Experiment only. Do not submit"), "LEGAL_FILING_EXPERIMENT.md must state the no-submit experiment boundary.");
  assert(legalExperimentDoc.includes("this document is `Experiment`"), "LEGAL_FILING_EXPERIMENT.md must identify its mode.");
  assert(legalExperimentDoc.includes("Pass condition"), "LEGAL_FILING_EXPERIMENT.md must document pass condition.");
  assert(legalExperimentDoc.includes("does not clear live operation"), "LEGAL_FILING_EXPERIMENT.md must not clear live operation.");
  assert(legalExperimentDoc.includes("## Try Matrix"), "LEGAL_FILING_EXPERIMENT.md must document the try matrix.");
  assert(legalExperimentDoc.includes("Formation state candidate"), "LEGAL_FILING_EXPERIMENT.md must include formation-state branch.");
  assert(legalExperimentDoc.includes("Data-minimization pass"), "LEGAL_FILING_EXPERIMENT.md must include data-minimization branch.");
  assert(onlineGateDoc.includes("LEGAL_PROCEDURE.md"), "ONLINE_GATE.md must require the legal procedure packet.");
  assert(onlineGateDoc.includes("LEGAL_DRAFT_FILINGS.md"), "ONLINE_GATE.md must document draft filing mode.");
  assert(onlineGateDoc.includes("LEGAL_FILING_EXPERIMENT.md"), "ONLINE_GATE.md must document legal filing experiment mode.");
  assert(onlineGateDoc.includes("`Demand` blocks, `Draft` prepares, `Experiment` measures"), "ONLINE_GATE.md must document legal mode differentiation.");
  assert(onlineGateDoc.includes("formation-state, entity-type, responsible-party, BOI, data-minimization"), "ONLINE_GATE.md must document legal try matrix branches.");
  assert(charterDoc.includes("Legal Proceeding Boundary"), "CHARTER.md must document the legal proceeding boundary.");
  assert(livePilotDoc.includes("Main legal procedure reviewed"), "RUN_LIVE_PILOT.md must include the main legal procedure setup step.");
  assert(livePilotDoc.includes("Draft filing packet prepared, not submitted"), "RUN_LIVE_PILOT.md must include the draft filing setup step.");
  assert(livePilotDoc.includes("Legal filing dry run measured"), "RUN_LIVE_PILOT.md must include the legal filing experiment setup step.");
  assert(readme.includes("LEGAL_PROCEDURE.md"), "README.md must link the main legal procedure doc.");
  assert(readme.includes("LEGAL_DRAFT_FILINGS.md"), "README.md must link the draft filing doc.");
  assert(readme.includes("LEGAL_FILING_EXPERIMENT.md"), "README.md must link the legal filing experiment doc.");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfigText]
  ]) {
    assert(!/copyLegalProcedurePacket/.test(contents), `${file} exposes legal procedure copy action.`);
    assert(!/copyDraftFilingPacket/.test(contents), `${file} exposes draft filing copy action.`);
    assert(!/copyLegalFilingExperiment/.test(contents), `${file} exposes legal filing experiment copy action.`);
    assert(!/legalProcedureList/.test(contents), `${file} exposes legal procedure private panel.`);
    assert(!/legalModeDistinctions/.test(contents), `${file} exposes legal mode distinctions private panel.`);
    assert(!/legalTryMatrix/.test(contents), `${file} exposes legal try matrix private panel.`);
    assert(!/legalDraftFilingList/.test(contents), `${file} exposes draft filing private panel.`);
    assert(!/legalFilingExperimentPanel/.test(contents), `${file} exposes legal filing experiment private panel.`);
    assert(!/MAIN_LEGAL_PROCEDURE_ITEMS/.test(contents), `${file} exposes private legal procedure internals.`);
    assert(!/MAIN_LEGAL_DRAFT_FILING_ITEMS/.test(contents), `${file} exposes private draft filing internals.`);
    assert(!/LEGAL_FILING_EXPERIMENT/.test(contents), `${file} exposes private legal experiment internals.`);
    assert(!/LEGAL_TRY_MATRIX/.test(contents), `${file} exposes private legal try matrix internals.`);
    assert(!/LEGAL_MODE_DISTINCTIONS/.test(contents), `${file} exposes private legal mode internals.`);
  }
}

function checkBrazilComplianceContract() {
  const readme = read("README.md");
  const terms = read("TERMS.md");
  const privacy = read("PRIVACY.md");
  const termos = read("TERMOS.md");
  const avisoPrivacidade = read("AVISO_DE_PRIVACIDADE.md");
  const setupEvidence = read("SETUP_EVIDENCE.md");
  const livePilot = read("RUN_LIVE_PILOT.md");
  const startPacket = read("OPERATIONS_START_PACKET.md");
  const brazilCompliance = read("BRAZIL_COMPLIANCE.md");
  const brazilAgents = read("BRAZIL_COMPLIANCE_AGENTS.md");
  const aiHandoff = read("AI_LEGAL_HANDOFF.md");
  const googleFormIntake = read("GOOGLE_FORM_INTAKE.md");
  const supportEvidence = read("SUPPORT_INBOX_EVIDENCE.md");
  const indexHtml = read("index.html");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const script = read("script.js");
  const styles = read("styles.css");

  const requiredDocs = [
    ["README Portuguese terms link", readme, "TERMOS.md"],
    ["README Portuguese privacy link", readme, "AVISO_DE_PRIVACIDADE.md"],
    ["README Brazil compliance link", readme, "BRAZIL_COMPLIANCE.md"],
    ["README Brazil compliance agents link", readme, "BRAZIL_COMPLIANCE_AGENTS.md"],
    ["README support inbox evidence link", readme, "SUPPORT_INBOX_EVIDENCE.md"],
    ["README AI handoff link", readme, "AI_LEGAL_HANDOFF.md"],
    ["README Google Form intake link", readme, "GOOGLE_FORM_INTAKE.md"],
    ["README Google Form Apps Script link", readme, "tools/google_apps_script_create_intake_form.gs"],
    ["Portuguese terms heading", termos, "# Termos de Uso e Contratacao"],
    ["Portuguese terms manual request", termos, "Pedido Manual"],
    ["Portuguese terms consumer handling", termos, "Cancelamento, Reembolso e Direito de Arrependimento"],
    ["Portuguese terms fiscal route", termos, "NFS-e"],
    ["Portuguese privacy heading", avisoPrivacidade, "# Aviso de Privacidade"],
    ["Portuguese privacy controller", avisoPrivacidade, "Controlador"],
    ["Portuguese privacy rights", avisoPrivacidade, "Direitos dos Titulares"],
    ["Portuguese privacy AI boundary", avisoPrivacidade, "A IA nao deve"],
    ["public page Portuguese terms link", publicHtml, 'href="TERMOS.md"'],
    ["public page Portuguese privacy link", publicHtml, 'href="AVISO_DE_PRIVACIDADE.md"'],
    ["terms Brazil operator gate", terms, "Brazilian operating entity"],
    ["terms NFS-e gate", terms, "NFS-e"],
    ["terms AI boundary", terms, "AI-created material is draft support"],
    ["privacy LGPD notice", privacy, "LGPD"],
    ["privacy data-subject rights", privacy, "Data-Subject Rights"],
    ["privacy AI boundary", privacy, "AI must not"],
    ["setup evidence Brazil operator", setupEvidence, "Brazilian operating entity"],
    ["setup evidence NFS-e", setupEvidence, "NFS-e"],
    ["setup evidence LGPD contact", setupEvidence, "LGPD contact"],
    ["live pilot Brazil posture", livePilot, "manual paid pilot in Brazil"],
    ["operations start Brazil gate", startPacket, "Brazilian entity/CNPJ"],
    ["Brazil gate matrix", brazilCompliance, "Gate Matrix"],
    ["Brazil AI boundary", brazilCompliance, "AI may not"],
    ["Brazil compliance agents heading", brazilAgents, "# Brazil Compliance Agents"],
    ["Brazil compliance agents AI lane", brazilAgents, "AI prepares"],
    ["Brazil compliance agents human lane", brazilAgents, "Human must close"],
    ["AI human review queue", aiHandoff, "Human Review Queue"],
    ["Google Form private URL boundary", googleFormIntake, "Do not commit the private Sheet URL"],
    ["Google Form verification stop rule", googleFormIntake, "Do not set googleFormVerified true"],
    ["Google Form Apps Script builder", read("tools/google_apps_script_create_intake_form.gs"), "FormApp.create"],
    ["Google Form Apps Script Sheet destination", read("tools/google_apps_script_create_intake_form.gs"), "setDestination(FormApp.DestinationType.SPREADSHEET"],
    ["support inbox evidence heading", supportEvidence, "# Support Inbox Evidence"],
    ["support inbox Gmail label", supportEvidence, "Strange Works Studio/Support"],
    ["support inbox Gmail message id", supportEvidence, "19e4c73fcdbf42a2"],
    ["private Brazil compliance agents panel", indexHtml, 'id="brazilComplianceAgentsPanel"'],
    ["public request packet Brazil jurisdiction", publicJs, "Jurisdiction: Brazil"],
    ["public request packet AI human review", publicJs, "AI-generated legal, tax, privacy, and compliance copy requires human review"],
    ["script Brazil compliance agent list", script, "const BRAZIL_COMPLIANCE_AGENTS = ["],
    ["script Brazil compliance agent renderer", script, "function renderBrazilComplianceAgents"],
    ["script Brazil setup slot", script, "Brazilian operator/CNPJ"],
    ["script NFS-e setup slot", script, "NFS-e or fiscal receipt route"],
    ["script LGPD setup slot", script, "LGPD contact path"],
    ["styles Brazil compliance agent card", styles, ".compliance-agent-card"]
  ];

  for (const [label, contents, snippet] of requiredDocs) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkReviewerCandidateContract() {
  const readme = read("README.md");
  const aiHandoff = read("AI_LEGAL_HANDOFF.md");
  const humanRevenue = read("HUMAN_REVENUE_INSTRUCTIONS.md");
  const packet = read("REVIEWER_CANDIDATE_PACKET.md");
  const tracker = read("REVIEWER_CANDIDATE_TRACKER.template.json");
  const validator = read("tools/validate_reviewer_candidate_tracker.js");
  const vauCompany = read("tools/vau_company_evolution.py");
  const gitignore = read(".gitignore");
  const validateWorkflow = read(".github/workflows/validate.yml");

  const required = [
    ["README reviewer packet link", readme, "REVIEWER_CANDIDATE_PACKET.md"],
    ["README reviewer tracker link", readme, "REVIEWER_CANDIDATE_TRACKER.template.json"],
    ["README reviewer draft generator link", readme, "tools/draft_reviewer_candidate_tracker.js"],
    ["README reviewer validator link", readme, "tools/validate_reviewer_candidate_tracker.js"],
    ["AI handoff reviewer packet link", aiHandoff, "REVIEWER_CANDIDATE_PACKET.md"],
    ["AI handoff reviewer require-one command", aiHandoff, "node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-one"],
    ["human revenue reviewer tracker link", humanRevenue, "REVIEWER_CANDIDATE_TRACKER.template.json"],
    ["human revenue reviewer draft generator link", humanRevenue, "tools/draft_reviewer_candidate_tracker.js"],
    ["reviewer packet first-candidate workflow", packet, "First Candidate Workflow"],
    ["reviewer packet ready-pool workflow", packet, "Ready Pool Workflow"],
    ["reviewer packet first-candidate command", packet, "node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-one"],
    ["reviewer packet ready-pool command", packet, "node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready"],
    ["reviewer tracker schema", tracker, '"schemaVersion": 1'],
    ["reviewer tracker candidate records", tracker, '"candidateRecords": []'],
    ["reviewer tracker terms role", tracker, '"terms_consumer_law"'],
    ["reviewer tracker privacy role", tracker, '"privacy_lgpd"'],
    ["reviewer tracker tax role", tracker, '"tax_nfse_accounting"'],
    ["reviewer tracker payment role", tracker, '"payment_reconciliation"'],
    ["reviewer tracker no-secrets attestation", tracker, '"noSecretsInRepo": true'],
    ["reviewer tracker sealed attestation", tracker, '"strangeCompanyRemainsSealed": true'],
    ["reviewer validator failure header", validator, "Reviewer candidate tracker validation failed"],
    ["reviewer validator one-candidate gate", validator, "--require-one"],
    ["reviewer validator ready-pool gate", validator, "--require-ready"],
    ["VAU reviewer tracker next action", vauCompany, "REVIEWER_CANDIDATE_TRACKER.local.json"],
    ["VAU reviewer tracker validator command", vauCompany, "tools/validate_reviewer_candidate_tracker.js"],
    ["reviewer local tracker ignored", gitignore, "REVIEWER_CANDIDATE_TRACKER.local.json"],
    ["reviewer template unignored", gitignore, "!REVIEWER_CANDIDATE_TRACKER.template.json"],
    ["reviewer validator CI syntax check", validateWorkflow, "node --check tools/validate_reviewer_candidate_tracker.js"],
    ["reviewer draft generator CI syntax check", validateWorkflow, "node --check tools/draft_reviewer_candidate_tracker.js"],
    ["reviewer validator CI template check", validateWorkflow, "node tools/validate_reviewer_candidate_tracker.js --template-ok"]
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkPublicAmaQueueContract() {
  const readme = read("README.md");
  const publicAma = read("PUBLIC_AMA.md");
  const publicationPacket = read("PUBLIC_AMA_PUBLICATION_PACKET.md");
  const template = read("PUBLIC_AMA_QUEUE.template.json");
  const answersTemplate = read("PUBLIC_AMA_ANSWERS.template.json");
  const publicAnswers = read("public-ama-answers.js");
  const draft = read("tools/draft_public_ama_queue.js");
  const exporter = read("tools/export_public_ama_answers.js");
  const validator = read("tools/validate_public_ama_queue.js");
  const gitignore = read(".gitignore");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pages = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const vauCompany = read("tools/vau_company_evolution.py");

  const required = [
    ["README public AMA doc link", readme, "PUBLIC_AMA.md"],
    ["README public AMA publication packet link", readme, "PUBLIC_AMA_PUBLICATION_PACKET.md"],
    ["README public AMA queue template link", readme, "PUBLIC_AMA_QUEUE.template.json"],
    ["README public AMA answer template link", readme, "PUBLIC_AMA_ANSWERS.template.json"],
    ["README public AMA draft tool link", readme, "tools/draft_public_ama_queue.js"],
    ["README public AMA answer export tool link", readme, "tools/export_public_ama_answers.js"],
    ["README public AMA validator link", readme, "tools/validate_public_ama_queue.js"],
    ["public AMA queue command", publicAma, "node tools/draft_public_ama_queue.js --write-local"],
    ["public AMA one-question command", publicAma, "node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-one"],
    ["public AMA answer-ready command", publicAma, "node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-answer-ready"],
    ["public AMA answer export command", publicAma, "node tools/export_public_ama_answers.js --input PUBLIC_AMA_QUEUE.local.json --output public-ama-answers.js --require-published --force"],
    ["public AMA answer archive check command", publicAma, "node tools/export_public_ama_answers.js --check-public-js"],
    ["public AMA publication packet link", publicAma, "PUBLIC_AMA_PUBLICATION_PACKET.md"],
    ["public AMA VAU command", publicAma, "python tools/vau_company_evolution.py --public-ama-queue PUBLIC_AMA_QUEUE.local.json --public-ama-answers public-ama-answers.js --depth 1"],
    ["public AMA publication packet close sheet", publicationPacket, "Manual Close Sheet"],
    ["public AMA publication packet export command", publicationPacket, "node tools/export_public_ama_answers.js --input PUBLIC_AMA_QUEUE.local.json --output public-ama-answers.js --require-published --force"],
    ["public AMA publication packet build check", publicationPacket, "node tools/build_public_site.js --check --output .public-site-build.local --force"],
    ["public AMA publication packet private data stop", publicationPacket, "No direct email, CPF, CNPJ document, payment data, credential"],
    ["public AMA private-data warning", publicAma, "must not include direct email addresses"],
    ["public AMA queue template schema", template, '"schemaVersion": 1'],
    ["public AMA queue template records", template, '"questionRecords": []'],
    ["public AMA queue public-safe decision", template, '"public_safe"'],
    ["public AMA answers template schema", answersTemplate, '"schemaVersion": 1'],
    ["public AMA answers template empty archive", answersTemplate, '"answers": []'],
    ["public AMA answers template public-only attestation", answersTemplate, '"noPrivateContactData": true'],
    ["public AMA answers archive global", publicAnswers, "window.PUBLIC_AMA_ANSWERS"],
    ["public AMA answers archive empty", publicAnswers, '"answers": []'],
    ["public site build tool", builder, "Public site build check passed"],
    ["public site build forbidden local queue", builder, "PUBLIC_AMA_QUEUE"],
    ["public site build forbidden MEI guard", builder, "^MEI_"],
    ["public AMA draft generator", draft, "PUBLIC_AMA_QUEUE.local.json"],
    ["public AMA answer exporter", exporter, "PUBLIC_AMA_ANSWERS.template.json"],
    ["public AMA answer exporter approval gate", exporter, "humanApprovedForPublication"],
    ["public AMA answer exporter publication gate", exporter, "--require-published"],
    ["public AMA answer exporter public archive check", exporter, "--check-public-js"],
    ["public AMA answer exporter public-only attestation", exporter, "noPrivateContactData"],
    ["public AMA validator failure header", validator, "Public AMA queue validation failed"],
    ["public AMA validator one-question gate", validator, "--require-one"],
    ["public AMA validator answer-ready gate", validator, "--require-answer-ready"],
    ["public AMA local queue ignored", gitignore, "PUBLIC_AMA_QUEUE.local.json"],
    ["public AMA template unignored", gitignore, "!PUBLIC_AMA_QUEUE.template.json"],
    ["public AMA local answers ignored", gitignore, "PUBLIC_AMA_ANSWERS.local.json"],
    ["public AMA answers template unignored", gitignore, "!PUBLIC_AMA_ANSWERS.template.json"],
    ["public AMA validator syntax check", validateWorkflow, "node --check tools/validate_public_ama_queue.js"],
    ["public AMA draft syntax check", validateWorkflow, "node --check tools/draft_public_ama_queue.js"],
    ["public AMA answer export syntax check", validateWorkflow, "node --check tools/export_public_ama_answers.js"],
    ["public site build syntax check", validateWorkflow, "node --check tools/build_public_site.js"],
    ["public AMA answer export CI template check", validateWorkflow, "node tools/export_public_ama_answers.js --template-ok"],
    ["public AMA answer archive CI check", validateWorkflow, "node tools/export_public_ama_answers.js --check-public-js"],
    ["public site build CI check", validateWorkflow, "node tools/build_public_site.js --check --output .public-site-build.local --force"],
    ["public AMA validator CI template check", validateWorkflow, "node tools/validate_public_ama_queue.js --template-ok"],
    ["public site pages workflow builder", pages, "node tools/build_public_site.js --check --output _site --force"],
    ["public AMA pages template copy", builder, "PUBLIC_AMA_QUEUE.template.json"],
    ["public AMA answers pages copy", builder, "public-ama-answers.js"],
    ["public AMA answers template pages copy", builder, "PUBLIC_AMA_ANSWERS.template.json"],
    ["public AMA pages draft copy", builder, "tools/draft_public_ama_queue.js"],
    ["public AMA pages exporter copy", builder, "tools/export_public_ama_answers.js"],
    ["public AMA pages validator copy", builder, "tools/validate_public_ama_queue.js"],
    ["public AMA VAU default path", vauCompany, "PUBLIC_AMA_QUEUE.local.json"],
    ["public AMA VAU answer archive path", vauCompany, "public-ama-answers.js"],
    ["public AMA VAU queue argument", vauCompany, "--public-ama-queue"],
    ["public AMA VAU answer archive argument", vauCompany, "--public-ama-answers"],
    ["VAU external live packet argument", vauCompany, "--external-live-packet"],
    ["VAU external live evidence gate", vauCompany, "privateExternalLiveEvidenceReady"],
    ["VAU authoritative external live validator", vauCompany, "validate_external_live_packet.js"]
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkRevenueSetupEvidenceIndexContract() {
  const readme = read("README.md");
  const aiHandoff = read("AI_LEGAL_HANDOFF.md");
  const humanRevenue = read("HUMAN_REVENUE_INSTRUCTIONS.md");
  const packet = read("REVENUE_SETUP_EVIDENCE_PACKET.md");
  const template = read("REVENUE_SETUP_EVIDENCE_INDEX.template.json");
  const draft = read("tools/draft_revenue_setup_evidence_index.js");
  const validator = read("tools/validate_revenue_setup_evidence_index.js");
  const gitignore = read(".gitignore");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const vauCompany = read("tools/vau_company_evolution.py");
  const builder = read("tools/build_public_site.js");

  const required = [
    ["README revenue setup packet link", readme, "REVENUE_SETUP_EVIDENCE_PACKET.md"],
    ["README revenue setup index template", readme, "REVENUE_SETUP_EVIDENCE_INDEX.template.json"],
    ["README revenue draft generator link", readme, "tools/draft_revenue_setup_evidence_index.js"],
    ["README revenue validator link", readme, "tools/validate_revenue_setup_evidence_index.js"],
    ["AI handoff revenue packet reference", aiHandoff, "REVENUE_SETUP_EVIDENCE_PACKET.md"],
    ["human revenue draft command", humanRevenue, "node tools/draft_revenue_setup_evidence_index.js --write-local"],
    ["human revenue payment gate command", humanRevenue, "node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-payment"],
    ["human revenue config-bound all-gates command", humanRevenue, "node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js"],
    ["human revenue packet includes draft command", packet, "tools/draft_revenue_setup_evidence_index.js"],
    ["human revenue packet includes validate command", packet, "tools/validate_revenue_setup_evidence_index.js"],
    ["revenue setup index template schema", template, '"schemaVersion": 1'],
    ["revenue validator failure header", validator, "Revenue setup evidence index validation failed"],
    ["revenue validator entity gate", validator, "--require-entity"],
    ["revenue validator tax gate", validator, "--require-tax"],
    ["revenue validator payment gate", validator, "--require-payment"],
    ["revenue validator support gate", validator, "--require-support"],
    ["revenue validator privacy gate", validator, "--require-privacy"],
    ["revenue validator terms gate", validator, "--require-terms"],
    ["revenue validator ledger gate", validator, "--require-ledger"],
    ["revenue validator all gate", validator, "--require-all"],
    ["revenue validator template check", validator, "--template-ok"],
    ["revenue index local ignored", gitignore, "REVENUE_SETUP_EVIDENCE_INDEX.local.json"],
    ["revenue index template unignored", gitignore, "!REVENUE_SETUP_EVIDENCE_INDEX.template.json"],
    ["revenue validator syntax check", validateWorkflow, "node --check tools/validate_revenue_setup_evidence_index.js"],
    ["revenue draft syntax check", validateWorkflow, "node --check tools/draft_revenue_setup_evidence_index.js"],
    ["revenue validator CI template check", validateWorkflow, "node tools/validate_revenue_setup_evidence_index.js --template-ok"],
    ["revenue pages template copy", builder, "REVENUE_SETUP_EVIDENCE_INDEX.template.json"],
    ["revenue pages draft copy", builder, "tools/draft_revenue_setup_evidence_index.js"],
    ["revenue pages validator copy", builder, "tools/validate_revenue_setup_evidence_index.js"],
    ["VAU revenue evidence path", vauCompany, "--revenue-evidence-index REVENUE_SETUP_EVIDENCE_INDEX.local.json"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkDeliveryReviewChecklistContract() {
  const readme = read("README.md");
  const runbook = read("OPERATIONS_RUNBOOK.md");
  const deliveryLoop = read("DELIVERY_REVIEW_LOOP.md");
  const template = read("DELIVERY_REVIEW_CHECKLIST.template.json");
  const draft = read("tools/draft_delivery_review_checklist.js");
  const validator = read("tools/validate_delivery_review_checklist.js");
  const gitignore = read(".gitignore");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const vauCompany = read("tools/vau_company_evolution.py");

  const required = [
    ["README delivery loop doc link", readme, "DELIVERY_REVIEW_LOOP.md"],
    ["README delivery checklist template", readme, "DELIVERY_REVIEW_CHECKLIST.template.json"],
    ["README delivery draft tool", readme, "tools/draft_delivery_review_checklist.js"],
    ["README delivery validator", readme, "tools/validate_delivery_review_checklist.js"],
    ["runbook delivery checklist section", runbook, "Delivery Review Checklist"],
    ["runbook delivery validator command", runbook, "node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready"],
    ["delivery loop local checklist command", deliveryLoop, "node tools/draft_delivery_review_checklist.js --write-local"],
    ["delivery loop ready validator command", deliveryLoop, "node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready"],
    ["delivery loop VAU command", deliveryLoop, "--delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json"],
    ["delivery template schema", template, '"schemaVersion": 1'],
    ["delivery template loop section", template, '"deliveryLoop"'],
    ["delivery template evidence section", template, '"evidence"'],
    ["delivery template attestation", template, '"noCustomerPrivateDataInRepo": true'],
    ["delivery draft local target", draft, "DELIVERY_REVIEW_CHECKLIST.local.json"],
    ["delivery draft no secrets instruction", draft, "Do not store customer-private documents"],
    ["delivery validator failure header", validator, "Delivery review checklist validation failed"],
    ["delivery validator ready gate", validator, "--require-ready"],
    ["delivery validator artifact URL gate", validator, "deliveryArtifactUrl must be an https:// URL"],
    ["delivery local checklist ignored", gitignore, "DELIVERY_REVIEW_CHECKLIST.local.json"],
    ["delivery template unignored", gitignore, "!DELIVERY_REVIEW_CHECKLIST.template.json"],
    ["delivery draft syntax check", validateWorkflow, "node --check tools/draft_delivery_review_checklist.js"],
    ["delivery validator syntax check", validateWorkflow, "node --check tools/validate_delivery_review_checklist.js"],
    ["delivery validator CI template check", validateWorkflow, "node tools/validate_delivery_review_checklist.js --template-ok"],
    ["delivery pages template check", pagesWorkflow, "node tools/validate_delivery_review_checklist.js --template-ok"],
    ["delivery pages template copy", builder, "DELIVERY_REVIEW_CHECKLIST.template.json"],
    ["delivery pages validator copy", builder, "tools/validate_delivery_review_checklist.js"],
    ["delivery local file forbidden from bundle", builder, "DELIVERY_REVIEW_CHECKLIST\\.local\\.json"],
    ["VAU delivery checklist default", vauCompany, "DEFAULT_DELIVERY_REVIEW_CHECKLIST"],
    ["VAU delivery checklist argument", vauCompany, "--delivery-review-checklist"],
    ["VAU delivery loop evidence", vauCompany, "deliveryReviewLoopReady"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkEvolutionLogAuditContract() {
  const readme = read("README.md");
  const evolutionLog = read("EVOLUTION_LOG.md");
  const audit = read("tools/audit_evolution_log.js");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const survival = read("tools/survival_check.js");

  const required = [
    ["README evolution log link", readme, "EVOLUTION_LOG.md"],
    ["README evolution audit tool", readme, "tools/audit_evolution_log.js"],
    ["evolution log public-safe boundary", evolutionLog, "public-safe repo evolution passes"],
    ["evolution log continuous goal entry", evolutionLog, "Continuous VAU Goal"],
    ["evolution log delivery entry", evolutionLog, "Delivery Review Loop"],
    ["evolution log audit entry", evolutionLog, "Evolution Pass Audit"],
    ["audit failure header", audit, "Evolution log audit failed"],
    ["audit required objective", audit, "Objective"],
    ["audit required changed artifacts", audit, "Changed"],
    ["audit required verified commands", audit, "Verified with"],
    ["audit required result", audit, "Result"],
    ["audit private data guard", audit, "forbidden approval or private-data claim"],
    ["audit syntax workflow", validateWorkflow, "node --check tools/audit_evolution_log.js"],
    ["audit execution workflow", validateWorkflow, "node tools/audit_evolution_log.js"],
    ["audit pages workflow", pagesWorkflow, "node tools/audit_evolution_log.js"],
    ["audit public bundle copy", builder, "tools/audit_evolution_log.js"],
    ["audit public bundle log copy", builder, "EVOLUTION_LOG.md"],
    ["audit survival check", survival, "Evolution Pass Audit"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkEvolutionGoalStatusContract() {
  const readme = read("README.md");
  const evolutionLog = read("EVOLUTION_LOG.md");
  const statusTool = read("tools/evolution_goal_status.js");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const survival = read("tools/survival_check.js");

  const required = [
    ["README evolution status tool", readme, "tools/evolution_goal_status.js"],
    ["README evolution status command", readme, "node tools/evolution_goal_status.js --json"],
    ["evolution log status entry", evolutionLog, "Evolution Status Report"],
    ["status system name", statusTool, "STRANGE_COMPANY_EVOLUTION_STATUS"],
    ["status active goal", statusTool, 'goalStatus: "active"'],
    ["status hard blocker mode", statusTool, "burn_down_hard_blockers"],
    ["status revenue blocker", statusTool, "privatePaymentFiscalEvidence"],
    ["status external live blocker", statusTool, "privateExternalLiveEvidence"],
    ["status selected handoff", statusTool, "selectedHandoff"],
    ["status review closure actions", statusTool, "reviewClosureActions"],
    ["status review closure local packet", statusTool, "LIVE_REVIEW_CLOSURE.local.json"],
    ["status review closure renderer", statusTool, "render_live_review_public_config_patch.js"],
    ["status local evidence command", statusTool, "tools/local_evidence_status.js"],
    ["status local evidence summary", statusTool, "localEvidence"],
    ["status local evidence dir override", statusTool, "--local-evidence-dir"],
    ["status latest pass parsing", statusTool, "latestPass"],
    ["status syntax workflow", validateWorkflow, "node --check tools/evolution_goal_status.js"],
    ["status execution workflow", validateWorkflow, "node tools/evolution_goal_status.js --json"],
    ["status pages workflow", pagesWorkflow, "node tools/evolution_goal_status.js --json"],
    ["status public bundle copy", builder, "tools/evolution_goal_status.js"],
    ["status survival check", survival, "STRANGE_COMPANY_EVOLUTION_STATUS"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkEvolutionNextPacketContract() {
  const readme = read("README.md");
  const evolutionLog = read("EVOLUTION_LOG.md");
  const generator = read("tools/generate_evolution_next_packet.js");
  const gitignore = read(".gitignore");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const survival = read("tools/survival_check.js");

  const required = [
    ["README next packet tool", readme, "tools/generate_evolution_next_packet.js"],
    ["README next packet command", readme, "node tools/generate_evolution_next_packet.js"],
    ["evolution log next packet entry", evolutionLog, "Evolution Next Action Packet"],
    ["next packet local target", generator, "EVOLUTION_NEXT_ACTION.local.md"],
    ["next packet status source", generator, "tools/evolution_goal_status.js"],
    ["next packet review closure section", generator, "Review Closure Workflow"],
    ["next packet selected handoff section", generator, "Do This Next"],
    ["next packet external live blocker section", generator, "External Live Blockers"],
    ["next packet review closure source", generator, "reviewClosureActions"],
    ["next packet local evidence section", generator, "Local Evidence Matrix"],
    ["next packet local evidence validation command", generator, "node tools/local_evidence_status.js --json"],
    ["next packet stop liveMode", generator, "Do not set `liveMode: true`"],
    ["next packet no private data", generator, "Do not put CPF, CNPJ, bank data"],
    ["next packet local ignored", gitignore, "EVOLUTION_NEXT_ACTION.local.md"],
    ["next packet syntax workflow", validateWorkflow, "node --check tools/generate_evolution_next_packet.js"],
    ["next packet execution workflow", validateWorkflow, "node tools/generate_evolution_next_packet.js"],
    ["next packet pages workflow", pagesWorkflow, "node tools/generate_evolution_next_packet.js"],
    ["next packet public bundle copy", builder, "tools/generate_evolution_next_packet.js"],
    ["next packet local file forbidden from bundle", builder, "EVOLUTION_NEXT_ACTION\\.local\\.md"],
    ["next packet survival check", survival, "Evolution Next Action Packet"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkLocalEvidenceStatusContract() {
  const readme = read("README.md");
  const evolutionLog = read("EVOLUTION_LOG.md");
  const statusTool = read("tools/local_evidence_status.js");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const survival = read("tools/survival_check.js");

  const required = [
    ["README local evidence status tool", readme, "tools/local_evidence_status.js"],
    ["README local evidence status command", readme, "node tools/local_evidence_status.js --json"],
    ["evolution log local evidence entry", evolutionLog, "Local Evidence Status Matrix"],
    ["local evidence status system name", statusTool, "STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS"],
    ["local evidence status local dir override", statusTool, "--local-dir"],
    ["local evidence status live review lane", statusTool, "LIVE_REVIEW_CLOSURE.local.json"],
    ["local evidence status revenue lane", statusTool, "REVENUE_SETUP_EVIDENCE_INDEX.local.json"],
    ["local evidence status validator stderr guard", statusTool, "without printing ignored packet contents or validator stderr"],
    ["local evidence status syntax workflow", validateWorkflow, "node --check tools/local_evidence_status.js"],
    ["local evidence status execution workflow", validateWorkflow, "node tools/local_evidence_status.js --json"],
    ["local evidence status pages workflow", pagesWorkflow, "node tools/local_evidence_status.js --json"],
    ["local evidence status public bundle copy", builder, "tools/local_evidence_status.js"],
    ["local evidence status survival check", survival, "STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }
}

function checkLiveReviewClosureContract() {
  const readme = read("README.md");
  const humanReview = read("HUMAN_REVIEW_PACKET.md");
  const evolutionLog = read("EVOLUTION_LOG.md");
  const template = read("LIVE_REVIEW_CLOSURE.template.json");
  const draft = read("tools/draft_live_review_closure.js");
  const renderer = read("tools/render_live_review_public_config_patch.js");
  const validator = read("tools/validate_live_review_closure.js");
  const receiptExporter = read("tools/export_public_live_receipt.js");
  const publicJs = read("public.js");
  const publicReceipt = read("public-live-receipt.js");
  const statusTool = read("tools/evolution_goal_status.js");
  const vauCompany = read("tools/vau_company_evolution.py");
  const gitignore = read(".gitignore");
  const validateWorkflow = read(".github/workflows/validate.yml");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const builder = read("tools/build_public_site.js");
  const survival = read("tools/survival_check.js");

  const required = [
    ["README live review template", readme, "LIVE_REVIEW_CLOSURE.template.json"],
    ["README live review draft tool", readme, "tools/draft_live_review_closure.js"],
    ["README live review validator", readme, "tools/validate_live_review_closure.js"],
    ["README live review renderer", readme, "tools/render_live_review_public_config_patch.js"],
    ["human review live closure local packet", humanReview, "LIVE_REVIEW_CLOSURE.local.json"],
    ["human review live closure ready command", humanReview, "node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready"],
    ["human review config-bound closure command", humanReview, "node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js"],
    ["human review live closure render command", humanReview, "node tools/render_live_review_public_config_patch.js LIVE_REVIEW_CLOSURE.local.json"],
    ["evolution log live review entry", evolutionLog, "Live Review Closure Packet"],
    ["live review template schema", template, '"schemaVersion": 2'],
    ["live review template gates", template, '"reviewGates"'],
    ["live review template document digests", template, '"documentDigests"'],
    ["live review template keeps liveMode false", template, '"liveMode": false'],
    ["live review draft local target", draft, "LIVE_REVIEW_CLOSURE.local.json"],
    ["live review draft stop liveMode", draft, "Do not use this packet to set liveMode true."],
    ["live review renderer system name", renderer, "LIVE_REVIEW_PUBLIC_CONFIG_PATCH"],
    ["live review renderer validates ready packet", renderer, "validate_live_review_closure.js"],
    ["live review renderer keeps liveMode false", renderer, "liveModeRemainsFalse"],
    ["live review validator ready gate", validator, "--require-ready"],
    ["live review validator digest domain", validator, "STRANGE_COMPANY_REVIEW_DOCUMENT_V1"],
    ["live review validator public config binding", validator, "--public-config"],
    ["live review validator canonical digest map", validator, "documentDigests"],
    ["live review validator keeps liveMode false", validator, "liveMode must remain false"],
    ["public receipt live review argument", receiptExporter, "--live-review-closure"],
    ["public receipt authoritative review validator", receiptExporter, "validate_live_review_closure.js"],
    ["public receipt review validator attestation", receiptExporter, "liveReviewClosureValidatorPassed"],
    ["public receipt schema v3 exporter", receiptExporter, "schemaVersion: 3"],
    ["public receipt schema v3 placeholder", publicReceipt, '"schemaVersion": 3'],
    ["public receipt nine-document core", receiptExporter, "reviewDocuments"],
    ["public browser nine-document core", publicJs, "reviewDocuments"],
    ["public receipt review-document digest domain", receiptExporter, "STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1"],
    ["public browser review-document digest domain", publicJs, "STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1"],
    ["public receipt core digest domain v2", receiptExporter, "STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2"],
    ["public browser core digest domain v2", publicJs, "STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2"],
    ["public receipt envelope digest domain v3", receiptExporter, "STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V3"],
    ["public browser envelope digest domain v3", publicJs, "STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V3"],
    ["status document-bound closure blocker", statusTool, "humanReviewClosureEvidence"],
    ["VAU live review closure argument", vauCompany, "--live-review-closure"],
    ["VAU authoritative review validator", vauCompany, "validate_live_review_closure.js"],
    ["live review local ignored", gitignore, "LIVE_REVIEW_CLOSURE.local.json"],
    ["live review template unignored", gitignore, "!LIVE_REVIEW_CLOSURE.template.json"],
    ["live review draft syntax workflow", validateWorkflow, "node --check tools/draft_live_review_closure.js"],
    ["live review renderer syntax workflow", validateWorkflow, "node --check tools/render_live_review_public_config_patch.js"],
    ["live review validator syntax workflow", validateWorkflow, "node --check tools/validate_live_review_closure.js"],
    ["live review validator CI template check", validateWorkflow, "node tools/validate_live_review_closure.js --template-ok"],
    ["live review pages template check", pagesWorkflow, "node tools/validate_live_review_closure.js --template-ok"],
    ["live review public bundle copy", builder, "LIVE_REVIEW_CLOSURE.template.json"],
    ["live review validator public bundle copy", builder, "tools/validate_live_review_closure.js"],
    ["live review renderer public bundle copy", builder, "tools/render_live_review_public_config_patch.js"],
    ["public bundle reviewed-document size parity", builder, "sourceBytes.length !== bundledBytes.length"],
    ["public bundle reviewed-document byte parity", builder, "sourceBytes.equals(bundledBytes)"],
    ["public bundle receipt document-root validation", builder, '"--document-root"'],
    ["public bundle receipt uses root exporter", builder, 'path.join(root, "tools", "export_public_live_receipt.js")'],
    ["live review local file forbidden from bundle", builder, "LIVE_REVIEW_CLOSURE\\.local\\.json"],
    ["live review survival check", survival, "Live Review Closure Packet"],
  ];

  for (const [label, contents, snippet] of required) {
    assert(contents.includes(snippet), `${label} is missing ${snippet}.`);
  }

  for (const documentPath of PUBLIC_REVIEW_DOCUMENT_PATHS) {
    const quotedPath = JSON.stringify(documentPath);
    assert(template.includes(quotedPath), `live review template is missing canonical reviewed document ${documentPath}.`);
    assert(receiptExporter.includes(quotedPath), `public receipt exporter is missing runtime reviewed document ${documentPath}.`);
    assert(publicJs.includes(quotedPath), `public browser is missing runtime reviewed document ${documentPath}.`);
    assert(builder.includes(quotedPath), `public bundle contract is missing runtime reviewed document ${documentPath}.`);
  }
  assert(!receiptExporter.includes("legalDocuments"), "public receipt exporter must not retain the legacy two-document legalDocuments core.");
  assert(!publicJs.includes("legalDocuments"), "public browser must not retain the legacy two-document legalDocuments core.");
  assert(!publicReceipt.includes('"legalDocuments"'), "public receipt placeholder must not retain the legacy two-document legalDocuments core.");
}

function checkConfig() {
  const config = loadPublicConfig();
  const formUrl = String(config.googleFormUrl || "").trim();
  const supportEmail = String(config.supportEmail || "").trim();
  const termsReviewedAt = String(config.termsReviewedAt || "").trim();
  const privacyReviewedAt = String(config.privacyReviewedAt || "").trim();
  const brazilComplianceReviewedAt = String(config.brazilComplianceReviewedAt || "").trim();
  const aiHandoffReviewedAt = String(config.aiHandoffReviewedAt || "").trim();
  const services = Array.isArray(config.services) ? config.services : [];

  assert(Boolean(config.operatorName), "public-config.js needs operatorName.");
  assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail), "public-config.js needs a valid supportEmail.");
  assert(isSafeGoogleFormUrl(formUrl), "googleFormUrl must be blank or an https://docs.google.com/forms/ URL.");
  assert(typeof config.supportInboxVerified === "boolean", "supportInboxVerified must be boolean.");
  assert(typeof config.googleFormVerified === "boolean", "googleFormVerified must be boolean.");
  assert(typeof config.liveMode === "boolean", "liveMode must be boolean.");
  assert(config.jurisdiction === "BR", "public-config.js jurisdiction must be BR for the Brazil-first launch gate.");
  assert(
    config.aiGeneratedLegalDocsRequireHumanReview === true,
    "public-config.js must keep aiGeneratedLegalDocsRequireHumanReview true."
  );
  assert(isIsoDate(termsReviewedAt), "termsReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(privacyReviewedAt), "privacyReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(brazilComplianceReviewedAt), "brazilComplianceReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(aiHandoffReviewedAt), "aiHandoffReviewedAt must be blank or YYYY-MM-DD.");
  assert(services.length > 0, "services must contain at least one public offer.");

  for (const [index, service] of services.entries()) {
    assert(Boolean(service.id), `services[${index}] needs id.`);
    assert(Boolean(service.title), `services[${index}] needs title.`);
    assert(Number(service.price) > 0, `services[${index}] needs a positive price.`);
  }

  if (config.googleFormVerified) {
    assert(Boolean(formUrl), "googleFormVerified requires googleFormUrl.");
  }

  if (config.supportInboxVerified) {
    const supportEvidence = read("SUPPORT_INBOX_EVIDENCE.md");
    assert(supportEvidence.includes(supportEmail), "supportInboxVerified requires SUPPORT_INBOX_EVIDENCE.md to reference supportEmail.");
  }

  if (config.liveMode) {
    assert(config.supportInboxVerified, "liveMode requires supportInboxVerified.");
    assert(config.googleFormVerified, "liveMode requires googleFormVerified.");
    assert(Boolean(formUrl), "liveMode requires googleFormUrl.");
    assert(Boolean(termsReviewedAt), "liveMode requires termsReviewedAt.");
    assert(Boolean(privacyReviewedAt), "liveMode requires privacyReviewedAt.");
    assert(Boolean(brazilComplianceReviewedAt), "liveMode requires brazilComplianceReviewedAt.");
    assert(Boolean(aiHandoffReviewedAt), "liveMode requires aiHandoffReviewedAt.");
  }
}

compileJavaScript("public-config.js");
compileJavaScript("public-live-receipt.js");
compileJavaScript("public-ama-answers.js");
compileJavaScript("public.js");
compileJavaScript("script.js");
compileJavaScript("tools/audit_company_functionality.js");
compileJavaScript("tools/audit_evolution_log.js");
compileJavaScript("tools/evolution_goal_status.js");
compileJavaScript("tools/generate_evolution_next_packet.js");
compileJavaScript("tools/local_evidence_status.js");
compileJavaScript("tools/draft_live_review_closure.js");
compileJavaScript("tools/render_live_review_public_config_patch.js");
compileJavaScript("tools/export_public_live_receipt.js");
compileJavaScript("tools/build_public_site.js");
compileJavaScript("tools/draft_external_live_packet.js");
compileJavaScript("tools/generate_external_live_gap_packet.js");
compileJavaScript("tools/validate_external_live_packet.js");
compileJavaScript("tools/validate_live_review_closure.js");
compileJavaScript("tools/check_external_live_packet_gate.js");
compileJavaScript("tools/validate_reviewer_candidate_tracker.js");
compileJavaScript("tools/draft_reviewer_candidate_tracker.js");
compileJavaScript("tools/draft_revenue_setup_evidence_index.js");
compileJavaScript("tools/validate_revenue_setup_evidence_index.js");
compileJavaScript("tools/draft_public_ama_queue.js");
compileJavaScript("tools/export_public_ama_answers.js");
compileJavaScript("tools/validate_public_ama_queue.js");
compileJavaScript("tools/draft_delivery_review_checklist.js");
compileJavaScript("tools/validate_delivery_review_checklist.js");
checkExternalLivePacketGate();
checkPublicLiveReceipt();
checkPublicSurface();
checkPrivateUrlAllowlists();
checkOutcomeEvidenceContract();
checkLedgerBridgeContract();
checkOrderLifecycleContract();
checkOrderTimelineContract();
checkDailyPilotRunContract();
checkPaidPilotProfitReadinessContract();
checkOperationalV15Contract();
checkRevenueStartContract();
checkMainLegalProcedureContract();
checkBrazilComplianceContract();
checkReviewerCandidateContract();
checkPublicAmaQueueContract();
checkRevenueSetupEvidenceIndexContract();
checkDeliveryReviewChecklistContract();
checkEvolutionLogAuditContract();
checkEvolutionGoalStatusContract();
checkEvolutionNextPacketContract();
checkLocalEvidenceStatusContract();
checkLiveReviewClosureContract();
checkConfig();

if (failures.length) {
  console.error("Public launch preflight failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Public launch preflight passed.");
