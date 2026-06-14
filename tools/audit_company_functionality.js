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

function assert(condition, message, label, detail) {
  if (!condition) {
    failures.push(message);
    return;
  }
  if (label) evidence.push({ label, detail });
}

function assertIncludes(file, snippet, label) {
  const contents = read(file);
  assert(contents.includes(snippet), `${file} is missing ${label}.`, label, file);
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

function auditCoreDocs() {
  assertIncludes("README.md", "Core Files", "core README");
  assertIncludes("CHARTER.md", "lawfully survive, grow, and compound", "charter survival objective");
  assertIncludes("SC_GAME_THEORY_RATIONALE.md", "Do not accept customer capital for trading", "investment firewall");
  assertIncludes("SC_HUMAN_REVIEW_REQUEST.md", "Arquivos repetidos ou dispensaveis", "reviewer cleanup ask");
  assertIncludes("TREASURY_OS.md", "own retained surplus only", "treasury own-surplus rule");
  assertIncludes("BRAZIL_COMPLIANCE.md", "AI may not", "Brazil AI boundary");
  assertIncludes("TERMOS.md", "Cancelamento, Reembolso e Direito de Arrependimento", "Brazil consumer terms");
  assertIncludes("AVISO_DE_PRIVACIDADE.md", "Direitos dos Titulares", "LGPD rights");
  assertIncludes("SUPPORT.md", "tuiidagnese+strangeworks@gmail.com", "support route");
  assertIncludes("RESEARCH_GATE.md", "critique_requires_specifics", "vague critique guardrail");
  assertIncludes("VAU_SIM_TO_REAL_RATIONALE.md", "decision-support loop", "VAU boundary");
  assertIncludes("INSTALL_AND_TEST.md", "audit_company_functionality.js --require-live", "live gate test command");
}

function auditRuntimeSurfaces() {
  assertIncludes("public.html", 'class="public-site"', "public order surface");
  assertIncludes("public.html", 'href="README.md"', "core README public link");
  assertIncludes("public.js", "Public intake is closed", "public live gate copy");
  assertIncludes("public.js", "findSensitiveData", "public sensitive-data scan");
  assertIncludes("index.html", 'id="operations"', "private operations console");
  assertIncludes("index.html", 'id="liveEvidencePanel"', "private live evidence panel");
  assertIncludes("index.html", 'id="research"', "private research gate tab");
  assertIncludes("script.js", "function buildReceiptChain", "receipt chain builder");
  assertIncludes("script.js", "function buildLiveEvidenceModel", "live evidence model");
  assertIncludes("script.js", "function applyLocalStrangeGuardrails", "browser Strange guardrails");
  assertIncludes("tools/strange_research_gate.py", "fallback_evaluate_argument", "local research fallback");
  assertIncludes("tools/preflight_public_launch.js", "checkLegacyNoiseRemoved", "core cleanup check");
  assertIncludes("tools/validate_external_live_packet.js", "External live packet validation", "external packet validator");
  assertIncludes("tools/revenue_setup_schema.js", "REVENUE_SETUP_SCHEMA_VERSION", "revenue setup shared schema");
  assertIncludes("tools/revenue_setup_doctor.js", "Revenue Setup Doctor", "revenue setup doctor");
  assertIncludes("tools/check_revenue_setup_doctor_gate.js", "Revenue setup doctor gate regression passed", "revenue setup doctor regression");
  assertIncludes("tools/validate_revenue_setup_evidence.js", "Revenue setup evidence validation", "revenue setup evidence validator");
  assertIncludes("tools/report_revenue_setup_gaps.js", "Revenue Setup Gap Report", "revenue setup gap reporter");
  assertIncludes("tools/check_revenue_setup_schema_sync.js", "Revenue setup schema sync passed", "revenue setup schema sync");
  assertIncludes("tools/check_revenue_setup_schema_sync_gate.js", "Revenue setup schema sync regression passed", "revenue setup schema sync regression");
  assertIncludes("tools/check_external_live_packet_gate.js", "External live packet gate regression passed", "external packet gate regression");
  assertIncludes("tools/check_revenue_setup_evidence_gate.js", "Revenue setup evidence gate regression passed", "revenue setup evidence gate regression");
  assertIncludes("tools/vau_company_evolution.py", "resource_allocation_plan", "whole-company resource allocation");
}

function auditPublicBoundary() {
  for (const file of ["public.html", "public.js", "public-config.js"]) {
    const contents = read(file);
    assert(!/\blocalStorage\b/.test(contents), `${file} must not use localStorage.`, "public localStorage absent", file);
    assert(!/\bfetch\s*\(/.test(contents), `${file} must not auto-submit over the network.`, "public network submit absent", file);
    assert(!/dashboard\.stripe\.com/.test(contents), `${file} must not expose Stripe dashboard URLs.`, "public Stripe dashboard absent", file);
    assert(!/brazilComplianceAgentsPanel|setupEvidencePanel|growthReviewPanel/.test(contents), `${file} exposes private dashboard panels.`, "public private-panels absent", file);
  }
}

let config = {};
try {
  config = loadPublicConfig();
  evidence.push({ label: "public config loads", detail: "public-config.js" });
  assert(config.jurisdiction === "BR", "public-config.js jurisdiction must be BR.", "Brazil jurisdiction", "public-config.js");
  assert(config.aiGeneratedLegalDocsRequireHumanReview === true, "public-config.js must require human review for AI legal docs.", "AI human review gate", "public-config.js");
} catch (error) {
  failures.push(`public-config.js failed to load: ${error.message}`);
}

auditCoreDocs();
auditRuntimeSurfaces();
auditPublicBoundary();

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
