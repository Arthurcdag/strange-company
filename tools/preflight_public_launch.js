const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const failures = [];

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(file, snippet, label) {
  const contents = read(file);
  assert(contents.includes(snippet), `${file} is missing ${label}.`);
}

function compileJavaScript(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
  } catch (error) {
    failures.push(`${relativePath} does not parse: ${error.message}`);
  }
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  try {
    vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
    return sandbox.window.PUBLIC_ORDER_CONFIG || {};
  } catch (error) {
    failures.push(`public-config.js could not be loaded: ${error.message}`);
    return {};
  }
}

function isSafeGoogleFormUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.href.startsWith("https://docs.google.com/forms/");
  } catch {
    return false;
  }
}

function isIsoDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

function checkJavaScript() {
  [
    "public-config.js",
    "public.js",
    "script.js",
    "tools/audit_company_functionality.js",
    "tools/draft_external_live_packet.js",
    "tools/generate_external_live_gap_packet.js",
    "tools/validate_external_live_packet.js",
    "tools/revenue_setup_schema.js",
    "tools/validate_revenue_setup_evidence.js",
    "tools/report_revenue_setup_gaps.js",
    "tools/check_external_live_packet_gate.js",
    "tools/check_revenue_setup_evidence_gate.js",
    "tools/survival_check.js"
  ].forEach(compileJavaScript);
}

function checkCoreDocs() {
  const required = [
    ["README.md", "Core Files"],
    ["CHARTER.md", "lawfully survive, grow, and compound"],
    ["OPERATING_SYSTEM.md", "live gate"],
    ["SC_GAME_THEORY_RATIONALE.md", "guaranteed return"],
    ["SC_HUMAN_REVIEW_REQUEST.md", "liveMode fica false"],
    ["SATELLITE_COMPANY.md", "external customer revenue exists"],
    ["TREASURY_OS.md", "own retained surplus only"],
    ["BRAZIL_COMPLIANCE.md", "Keep `public-config.js` at `liveMode: false`"],
    ["REVENUE_SETUP_EVIDENCE_PACKET.md", "Live payment intake remains blocked"],
    ["REVENUE_SETUP_OUTREACH_PACKET.md", "Live payment intake remains blocked"],
    ["TERMOS.md", "# Termos de Uso e Contratacao"],
    ["AVISO_DE_PRIVACIDADE.md", "# Aviso de Privacidade"],
    ["SUPPORT.md", "tuiidagnese+strangeworks@gmail.com"],
    ["RESEARCH_GATE.md", "repo_signal_to_noise_review"],
    ["VAU_SIM_TO_REAL_RATIONALE.md", "decision-support loop"],
    ["INSTALL_AND_TEST.md", "Instalar E Testar O Core"]
  ];

  for (const [file, snippet] of required) {
    assert(exists(file), `${file} must exist in the core surface.`);
    if (exists(file)) assertIncludes(file, snippet, "core snippet");
  }
}

function checkLegacyNoiseRemoved() {
  const legacyRootDocs = [
    "ADAPTIVE_OPERATOR_PROTOCOL.md",
    "AI_LEGAL_HANDOFF.md",
    "AUTONOMOUS_CYCLE.md",
    "BRAZIL_COMPLIANCE_AGENTS.md",
    "CAPITAL_ROUTER.md",
    "CONKA8_LAW_INSTRUCTIONS.md",
    "CUSTOMER_ACQUISITION.md",
    "EXECUTION_MARKET.md",
    "EXTERNAL_LIVE_CONTROLS.md",
    "EXTERNAL_SIGNALS.md",
    "FIRST_REVENUE_CLOSEOUT.md",
    "GOOGLE_FORM_INTAKE.md",
    "GOOGLE_SHEET_LEDGER.md",
    "GROWTH_MANAGEMENT.md",
    "HUMAN_REVIEW_PACKET.md",
    "LAUNCH_PLAN.md",
    "LIVE_HANDOFF_CHECKLIST.md",
    "ONLINE_ASAP.md",
    "ONLINE_GATE.md",
    "OPERATIONS_RUNBOOK.md",
    "OPERATIONS_START_PACKET.md",
    "OPERATOR_FAST_START.md",
    "ORDER_DESK.md",
    "OUTCOME_REVIEW.md",
    "PRIVACY.md",
    "RECEIPT_CHAIN.md",
    "RESILIENCE_DRILLS.md",
    "RESILIENCE_MODEL.md",
    "REVENUE_PILOT.md",
    "REVENUE_START.md",
    "REVIEW_READY_PACKET.md",
    "RUN_LIVE_PILOT.md",
    "SETUP_EVIDENCE.md",
    "SUPPORT_INBOX_EVIDENCE.md",
    "TERMS.md",
    "THREAT_PATHOLOGY.md",
    "TOOLING_POLICY.md",
    "VAU_CHESS_DEV_EXAMPLE.md",
    "VAU_CHESS_TEST_DATA.generated.json",
    "VAU_COMPANY_EVOLUTION.md"
  ];

  for (const file of legacyRootDocs) {
    assert(!exists(file), `${file} should not be in the core root surface.`);
  }
  assert(!exists(".gitmodules"), ".gitmodules should not exist; the core path has no submodule.");
  assert(!exists("external/reactive-research-tools"), "external/reactive-research-tools should not be committed in the core path.");
}

function checkPublicSurface() {
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfig = read("public-config.js");

  assert(publicHtml.includes('class="public-site"'), "public.html must render the public surface.");
  assert(publicHtml.includes("public-config.js"), "public.html must load public-config.js.");
  assert(publicHtml.includes("public.js"), "public.html must load public.js.");
  assert(!publicHtml.includes("script.js"), "public.html must not load the private dashboard script.");
  assert(publicHtml.includes('href="TERMOS.md"'), "public.html must link Portuguese terms.");
  assert(publicHtml.includes('href="AVISO_DE_PRIVACIDADE.md"'), "public.html must link Portuguese privacy.");
  assert(publicHtml.includes('href="SUPPORT.md"'), "public.html must link support.");
  assert(publicHtml.includes('href="README.md"'), "public.html must link the core README.");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfig]
  ]) {
    assert(!/\blocalStorage\b/.test(contents), `${file} must not use localStorage.`);
    assert(!/\bfetch\s*\(/.test(contents), `${file} must not auto-submit over the network.`);
    assert(!/dashboard\.stripe\.com/.test(contents), `${file} must not expose Stripe dashboard URLs.`);
    assert(!/brazilComplianceAgentsPanel|setupEvidencePanel|growthReviewPanel/.test(contents), `${file} exposes private dashboard panels.`);
  }

  assertIncludes("public.js", "findSensitiveData", "sensitive-data scanner");
  assertIncludes("public.js", "Public intake is closed", "closed intake copy");
  assertIncludes("public.js", "if (!readiness.liveReady)", "live gate submit block");
  assertIncludes("public.js", 'readiness.liveReady ? `<a href="${mailtoUrl(order)}">Open email draft</a>` : ""', "email action gated by live readiness");
}

function checkPrivateSurface() {
  const indexHtml = read("index.html");
  const script = read("script.js");

  [
    'id="public"',
    'id="launch"',
    'id="satellite"',
    'id="operations"',
    'id="treasury"',
    'id="research"',
    'id="liveEvidencePanel"',
    'id="revenueStartPanel"'
  ].forEach((snippet) => assert(indexHtml.includes(snippet), `index.html is missing ${snippet}.`));

  [
    "function buildReceiptChain",
    "function buildLiveEvidenceModel",
    "function renderLiveEvidencePanel",
    "function applyLocalStrangeGuardrails",
    "const BRAZIL_COMPLIANCE_AGENTS = [",
    "const SETUP_EVIDENCE_SLOTS = [",
    "const REVENUE_START_LANES = ["
  ].forEach((snippet) => assert(script.includes(snippet), `script.js is missing ${snippet}.`));
}

function checkConfig() {
  const config = loadPublicConfig();
  const formUrl = String(config.googleFormUrl || "").trim();
  const supportEmail = String(config.supportEmail || "").trim();
  const services = Array.isArray(config.services) ? config.services : [];

  assert(Boolean(config.operatorName), "public-config.js needs operatorName.");
  assert(config.jurisdiction === "BR", "public-config.js jurisdiction must be BR.");
  assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail), "public-config.js needs a valid supportEmail.");
  assert(isSafeGoogleFormUrl(formUrl), "googleFormUrl must be blank or an https://docs.google.com/forms/ URL.");
  assert(typeof config.supportInboxVerified === "boolean", "supportInboxVerified must be boolean.");
  assert(typeof config.googleFormVerified === "boolean", "googleFormVerified must be boolean.");
  assert(typeof config.liveMode === "boolean", "liveMode must be boolean.");
  assert(config.aiGeneratedLegalDocsRequireHumanReview === true, "AI legal docs must require human review.");
  assert(isIsoDate(String(config.termsReviewedAt || "").trim()), "termsReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(String(config.privacyReviewedAt || "").trim()), "privacyReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(String(config.brazilComplianceReviewedAt || "").trim()), "brazilComplianceReviewedAt must be blank or YYYY-MM-DD.");
  assert(isIsoDate(String(config.aiHandoffReviewedAt || "").trim()), "aiHandoffReviewedAt must be blank or YYYY-MM-DD.");
  assert(services.length > 0, "services must contain at least one public offer.");

  if (config.googleFormVerified) {
    assert(Boolean(formUrl), "googleFormVerified requires googleFormUrl.");
  }
  if (config.liveMode) {
    assert(config.supportInboxVerified, "liveMode requires supportInboxVerified.");
    assert(config.googleFormVerified, "liveMode requires googleFormVerified.");
    assert(Boolean(formUrl), "liveMode requires googleFormUrl.");
    assert(Boolean(config.termsReviewedAt), "liveMode requires termsReviewedAt.");
    assert(Boolean(config.privacyReviewedAt), "liveMode requires privacyReviewedAt.");
    assert(Boolean(config.brazilComplianceReviewedAt), "liveMode requires brazilComplianceReviewedAt.");
    assert(Boolean(config.aiHandoffReviewedAt), "liveMode requires aiHandoffReviewedAt.");
  }
}

checkJavaScript();
checkCoreDocs();
checkLegacyNoiseRemoved();
checkPublicSurface();
checkPrivateSurface();
checkConfig();

if (failures.length) {
  console.error("Public launch preflight failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Public launch preflight passed.");
