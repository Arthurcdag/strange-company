const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const requireLive = process.argv.includes("--require-live");
const failures = [];
const evidence = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(label, detail) {
  evidence.push({ label, detail });
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(file, snippet, label) {
  const contents = read(file);
  assert(contents.includes(snippet), `${file} is missing ${label}.`);
  if (contents.includes(snippet)) {
    record(label, file);
  }
}

function assertAbsent(file, pattern, label) {
  const contents = read(file);
  assert(!pattern.test(contents), `${file} exposes ${label}.`);
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function externalLiveBlockers(config) {
  const blockers = [];
  if (!config.liveMode) blockers.push("public-config.js liveMode is false");
  if (!config.supportInboxVerified) blockers.push("support inbox is not verified");
  if (!config.googleFormVerified) blockers.push("Google Form route is not verified");
  if (!String(config.googleFormUrl || "").trim()) blockers.push("Google Form URL is blank");
  if (!String(config.termsReviewedAt || "").trim()) blockers.push("terms review date is blank");
  if (!String(config.privacyReviewedAt || "").trim()) blockers.push("privacy review date is blank");
  if (!String(config.brazilComplianceReviewedAt || "").trim()) blockers.push("Brazil compliance review date is blank");
  if (!String(config.aiHandoffReviewedAt || "").trim()) blockers.push("AI legal handoff review date is blank");
  return blockers;
}

function auditPrivateConsole() {
  assertIncludes("index.html", 'id="satellite"', "satellite company view");
  assertIncludes("index.html", 'id="operations"', "operations console view");
  assertIncludes("index.html", 'src="public-config.js"', "private console public config loader");
  assertIncludes("index.html", 'id="liveEvidencePanel"', "live evidence panel");
  assertIncludes("index.html", 'id="copyLiveEvidencePacket"', "live evidence copy action");
  assertIncludes("index.html", 'id="revenueStartPanel"', "revenue start panel");
  assertIncludes("index.html", 'id="issueRevenueStartPacket"', "revenue start issue action");
  assertIncludes("index.html", 'id="brazilComplianceAgentsPanel"', "Brazil compliance agents panel");
  assertIncludes("index.html", 'id="adaptiveOperatorPanel"', "adaptive operator panel");
  assertIncludes("index.html", 'id="copyLatestAdaptiveReceipt"', "adaptive operator copy action");
  assertIncludes("index.html", 'id="growthReviewPanel"', "growth review panel");
  assertIncludes("index.html", 'id="copyGrowthReview"', "growth review copy action");
  assertIncludes("script.js", "const REVENUE_START_LANES = [", "two-company revenue lanes");
  assertIncludes("script.js", "const BRAZIL_COMPLIANCE_AGENTS = [", "Brazil compliance agent roster");
  assertIncludes("script.js", "function buildBrazilComplianceAgentsModel", "Brazil compliance agent state model");
  assertIncludes("script.js", "function brazilComplianceAgentPacket", "Brazil compliance agent packet");
  assertIncludes("script.js", "function renderBrazilComplianceAgents", "Brazil compliance agent renderer");
  assertIncludes("script.js", "async function copyBrazilComplianceAgentPacket", "Brazil compliance agent copy action");
  assertIncludes("script.js", "function buildLiveEvidenceModel", "live evidence state model");
  assertIncludes("script.js", "function liveEvidencePacket", "live evidence packet");
  assertIncludes("script.js", "function renderLiveEvidencePanel", "live evidence renderer");
  assertIncludes("script.js", "async function copyLiveEvidencePacket", "live evidence copy action");
  assertIncludes("script.js", "const ADAPTIVE_DAMAGE_ROUTES = [", "adaptive damage route roster");
  assertIncludes("script.js", "function buildAdaptiveOperatorModel", "adaptive operator state model");
  assertIncludes("script.js", "function adaptiveReceiptPacket", "adaptive operator packet");
  assertIncludes("script.js", "function renderAdaptiveOperator", "adaptive operator renderer");
  assertIncludes("script.js", "function recordAdaptiveReceipt", "adaptive operator receipt action");
  assertIncludes("script.js", "function routeAdaptiveReceipt", "adaptive operator route action");
  assertIncludes("script.js", "data-route-adaptive-receipt", "adaptive operator route button");
  assertIncludes("script.js", "adaptiveReceiptId", "adaptive execution packet receipt link");
  assertIncludes("script.js", "sourceAdaptationId", "adaptive cooldown receipt link");
  assertIncludes("script.js", "function buildRevenueStartModel", "revenue start state model");
  assertIncludes("script.js", "function snapshotRevenueStartLanes", "start packet lane snapshots");
  assertIncludes("script.js", "function buildGrowthReviewModel", "growth review state model");
  assertIncludes("script.js", "function growthReviewPacket", "growth review packet");
  assertIncludes("script.js", "function buildProfitReadiness", "satellite profit readiness model");
  assertIncludes("script.js", "function advanceOperationOrder", "manual order lifecycle");
  assertIncludes("script.js", "function buildOrderTimeline(order)", "order receipt-chain timeline model");
  assertIncludes("script.js", "function renderOrderTimeline(order)", "order timeline renderer");
  assertIncludes("script.js", "${renderOrderTimeline(order)}", "order timeline mounted on order cards");
  assertIncludes("script.js", "ops-order-timeline-evidence", "order timeline evidence rows");
  assertIncludes("script.js", "events.sort((a, b) => String(a.at || \"\").localeCompare(String(b.at || \"\")))", "chronological order timeline");
  assertIncludes("script.js", "(order.incidentIds || []).forEach", "incident-linked order timeline events");
  assertIncludes("script.js", '"Revenue Start",', "revenue start receipt");
  assertIncludes("script.js", '"Revenue Packet",', "revenue packet receipt");
  assertIncludes("script.js", '"Growth Review",', "growth review receipt");
  assertIncludes("script.js", '"Adaptation Receipt",', "adaptive operator receipt");
}

function auditDocs() {
  assertIncludes("README.md", "TERMOS.md", "Portuguese terms README link");
  assertIncludes("README.md", "AVISO_DE_PRIVACIDADE.md", "Portuguese privacy README link");
  assertIncludes("README.md", "REVENUE_START.md", "revenue start README link");
  assertIncludes("README.md", "GROWTH_MANAGEMENT.md", "growth management README link");
  assertIncludes("README.md", "BRAZIL_COMPLIANCE.md", "Brazil compliance README link");
  assertIncludes("README.md", "BRAZIL_COMPLIANCE_AGENTS.md", "Brazil compliance agents README link");
  assertIncludes("README.md", "SUPPORT_INBOX_EVIDENCE.md", "support inbox evidence README link");
  assertIncludes("README.md", "AI_LEGAL_HANDOFF.md", "AI legal handoff README link");
  assertIncludes("README.md", "GOOGLE_FORM_INTAKE.md", "Google Form intake README link");
  assertIncludes("README.md", "tools/google_apps_script_create_intake_form.gs", "Google Form Apps Script README link");
  assertIncludes("README.md", "tools/survival_check.js", "survival check README link");
  assertIncludes("README.md", "ADAPTIVE_OPERATOR_PROTOCOL.md", "adaptive operator README link");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Adaptive Operator Protocol", "adaptive operator runbook section");
  assertIncludes("ADAPTIVE_OPERATOR_PROTOCOL.md", "Damage is information", "adaptive damage rule");
  assertIncludes("ADAPTIVE_OPERATOR_PROTOCOL.md", "Damage-to-adaptation receipts", "adaptive receipt console docs");
  assertIncludes("ADAPTIVE_OPERATOR_PROTOCOL.md", "no-spend execution packet", "adaptive route packet docs");
  assertIncludes("OPERATIONS_RUNBOOK.md", "can be routed into a no-spend execution packet", "adaptive route runbook note");
  assertIncludes("README.md", "ONLINE_ASAP.md", "online ASAP README link");
  assertIncludes("README.md", "EXTERNAL_LIVE_CONTROLS.md", "external live controls README link");
  assertIncludes("ONLINE_ASAP.md", "Main Track: Strange Company", "main online ASAP lane");
  assertIncludes("ONLINE_ASAP.md", "Satellite Track: Strange Works Studio", "satellite online ASAP lane");
  assertIncludes("ONLINE_ASAP.md", "Set `liveMode: true` last", "live mode last instruction");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "Google Form Intake", "Google Form setup instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "Support Inbox", "support inbox setup instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "Launch Gate Evidence Panel", "live evidence panel instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "Stripe Route", "Stripe route setup instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "Bank Route", "bank route setup instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "Readiness Packet", "external readiness packet instructions");
  assertIncludes("README.md", "tools/draft_external_live_packet.js", "external live packet draft README link");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "node tools/draft_external_live_packet.js --write-local", "external live packet draft command");
  assertIncludes("tools/draft_external_live_packet.js", "draft-from-public-config", "external live packet draft generator");
  assertIncludes("README.md", "tools/generate_external_live_gap_packet.js", "external live gap packet README link");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "node tools/generate_external_live_gap_packet.js", "external live gap packet command");
  assertIncludes("tools/generate_external_live_gap_packet.js", "Strange Company external live evidence gap packet", "external live gap packet generator");
  assertIncludes("README.md", "EXTERNAL_LIVE_PACKET.template.json", "external live packet template README link");
  assertIncludes("README.md", "tools/validate_external_live_packet.js", "external live packet validator README link");
  assertIncludes("README.md", "tools/check_external_live_packet_gate.js", "external live packet gate regression README link");
  assertIncludes("EXTERNAL_LIVE_PACKET.template.json", '"schemaVersion": 1', "external live packet template schema");
  assertIncludes("EXTERNAL_LIVE_PACKET.template.json", '"brazilComplianceReviewedAt": ""', "external packet Brazil compliance review field");
  assertIncludes("EXTERNAL_LIVE_PACKET.template.json", '"aiHandoffReviewedAt": ""', "external packet AI handoff review field");
  assertIncludes("tools/validate_external_live_packet.js", "External live packet validation", "external live packet validator");
  assertIncludes("tools/validate_external_live_packet.js", "public Brazil compliance review date", "external packet Brazil review live requirement");
  assertIncludes("tools/validate_external_live_packet.js", "public AI handoff review date", "external packet AI handoff live requirement");
  assertIncludes("tools/check_external_live_packet_gate.js", "External live packet gate regression passed", "external live packet gate regression tool");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "termsReviewedAt", "terms review date instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "privacyReviewedAt", "privacy review date instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "brazilComplianceReviewedAt", "Brazil compliance review date instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "aiHandoffReviewedAt", "AI handoff review date instructions");
  assertIncludes("EXTERNAL_LIVE_CONTROLS.md", "node tools/check_external_live_packet_gate.js", "external live packet gate regression command");
  assertIncludes("OPERATIONS_RUNBOOK.md", "## Functional Definition", "satellite functional definition");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Receipt Chain Timeline Panel", "order timeline runbook section");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Revenue Start Board", "revenue start runbook section");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Brazil Compliance Agents", "Brazil compliance agents runbook note");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Growth Management", "growth management runbook note");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Brazil", "Brazil operations boundary");
  assertIncludes("SATELLITE_COMPANY.md", "## Revenue Start", "satellite revenue start section");
  assertIncludes("REVENUE_START.md", "## Strange Company Lane", "Strange Company lane docs");
  assertIncludes("REVENUE_START.md", "## Second Company Lane", "second company lane docs");
  assertIncludes("GROWTH_MANAGEMENT.md", "## Growth States", "growth states docs");
  assertIncludes("RESILIENCE_DRILLS.md", "node tools/survival_check.js", "survival check resilience drill docs");
  assertIncludes("BRAZIL_COMPLIANCE.md", "## Gate Matrix", "Brazil compliance gate matrix");
  assertIncludes("BRAZIL_COMPLIANCE.md", "AI may not", "Brazil AI stop rules");
  assertIncludes("BRAZIL_COMPLIANCE_AGENTS.md", "## Agent Roster", "Brazil compliance agent roster docs");
  assertIncludes("BRAZIL_COMPLIANCE_AGENTS.md", "Human must close", "Brazil compliance agent human closure docs");
  assertIncludes("AI_LEGAL_HANDOFF.md", "## Human Review Queue", "human legal/accounting handoff queue");
  assertIncludes("AI_LEGAL_HANDOFF.md", "TERMOS.md", "Portuguese terms handoff note");
  assertIncludes("AI_LEGAL_HANDOFF.md", "AVISO_DE_PRIVACIDADE.md", "Portuguese privacy handoff note");
  assertIncludes("GOOGLE_FORM_INTAKE.md", "Do not commit the private Sheet URL", "Google Form private URL boundary");
  assertIncludes("GOOGLE_FORM_INTAKE.md", "Do not set googleFormVerified true", "Google Form verification stop rule");
  assertIncludes("tools/google_apps_script_create_intake_form.gs", "FormApp.create", "Google Form Apps Script builder");
  assertIncludes("tools/google_apps_script_create_intake_form.gs", "setDestination(FormApp.DestinationType.SPREADSHEET", "Google Form Apps Script Sheet destination");
  assertIncludes("tools/google_apps_script_create_intake_form.gs", "requireTextIsEmail", "Google Form Apps Script email validation");
  assertIncludes("GOOGLE_SHEET_LEDGER.md", "Current External Artifact", "created Google Sheet ledger note");
  assertIncludes("SUPPORT_INBOX_EVIDENCE.md", "# Support Inbox Evidence", "support inbox evidence doc");
  assertIncludes("SUPPORT_INBOX_EVIDENCE.md", "19e4c73fcdbf42a2", "support inbox verification message id");
  assertIncludes("SUPPORT.md", "tuiidagnese+strangeworks@gmail.com", "verified pilot support inbox");
  assertIncludes("TERMOS.md", "# Termos de Uso e Contratacao", "Portuguese terms heading");
  assertIncludes("TERMOS.md", "Cancelamento, Reembolso e Direito de Arrependimento", "Portuguese consumer cancellation/refund section");
  assertIncludes("TERMOS.md", "NFS-e", "Portuguese fiscal route terms");
  assertIncludes("AVISO_DE_PRIVACIDADE.md", "# Aviso de Privacidade", "Portuguese privacy heading");
  assertIncludes("AVISO_DE_PRIVACIDADE.md", "Direitos dos Titulares", "Portuguese LGPD rights section");
  assertIncludes("AVISO_DE_PRIVACIDADE.md", "A IA nao deve", "Portuguese AI privacy boundary");
  assertIncludes("public.html", 'href="TERMOS.md"', "public Portuguese terms link");
  assertIncludes("public.html", 'href="AVISO_DE_PRIVACIDADE.md"', "public Portuguese privacy link");
  assertIncludes("TERMS.md", "Brazilian operating entity", "Brazil-first terms operator gate");
  assertIncludes("TERMS.md", "NFS-e", "Brazil fiscal terms gate");
  assertIncludes("PRIVACY.md", "LGPD", "LGPD privacy notice");
  assertIncludes("SETUP_EVIDENCE.md", "Brazil-first slots", "Brazil-first setup evidence slots");
}

function auditPublicBoundary() {
  assertIncludes("public.js", "Public intake is closed", "public closed-intake copy");
  assertIncludes("public.js", "if (!readiness.liveReady)", "public submit live gate");
  assertIncludes("public.js", 'readiness.liveReady ? `<a href="${mailtoUrl(order)}">Open email draft</a>` : ""', "public email action gated by live readiness");
  const privatePatterns = [
    [/strange-company-revenue-start/, "revenue start storage key"],
    [/revenueStartPanel/, "private revenue start panel"],
    [/issueRevenueStartPacket/, "private revenue start action"],
    [/brazilComplianceAgentsPanel/, "private Brazil compliance agents panel"],
    [/BRAZIL_COMPLIANCE_AGENTS/, "Brazil compliance agent internals"],
    [/adaptiveOperatorPanel/, "private adaptive operator panel"],
    [/strange-company-adaptive-operator/, "adaptive operator storage key"],
    [/ADAPTIVE_DAMAGE_ROUTES/, "adaptive damage route internals"],
    [/growthReviewPanel/, "private growth review panel"],
    [/copyGrowthReview/, "private growth review action"],
    [/strange-company-operations/, "operations storage key"],
    [/strange-company-sales-leads/, "sales lead storage key"],
    [/\bPaid pilot pipeline\b/i, "private paid pilot pipeline"],
    [/\bDaily pilot run\b/i, "private daily pilot console"]
  ];
  for (const file of ["public.html", "public.js", "public-config.js"]) {
    for (const [pattern, label] of privatePatterns) {
      assertAbsent(file, pattern, label);
    }
  }
  record("public/private boundary", "public.html, public.js, public-config.js");
}

auditPrivateConsole();
auditDocs();
auditPublicBoundary();

let config = {};
try {
  config = loadPublicConfig();
  record("public config loads", "public-config.js");
  assert(config.jurisdiction === "BR", "public-config.js jurisdiction must be BR");
  assert(config.supportEmail === "tuiidagnese+strangeworks@gmail.com", "public-config.js supportEmail must match verified pilot inbox");
  assert(config.supportInboxVerified === true, "public-config.js supportInboxVerified must reflect the verified pilot inbox");
  assert(
    config.aiGeneratedLegalDocsRequireHumanReview === true,
    "public-config.js must require human review for AI-generated legal docs"
  );
} catch (error) {
  failures.push(`public-config.js failed to load: ${error.message}`);
}

const liveBlockers = externalLiveBlockers(config);
if (requireLive && liveBlockers.length) {
  failures.push(`external live-operation gate is blocked: ${liveBlockers.join("; ")}`);
}

if (failures.length) {
  console.error("Company functionality audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Company functionality audit passed.");
console.log("Repo-level functional surfaces:");
evidence.forEach((item) => console.log(`- ${item.label}: ${item.detail}`));

if (liveBlockers.length) {
  console.log("External live-operation gate: blocked");
  liveBlockers.forEach((blocker) => console.log(`- ${blocker}`));
  console.log("Run with --require-live to fail while these outside setup checks remain open.");
} else {
  console.log("External live-operation gate: ready by public-config.js flags.");
}
