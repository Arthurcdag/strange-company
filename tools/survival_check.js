const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const failures = [];
const evidence = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(label, detail) {
  evidence.push({ label, detail });
}

function assert(condition, message, label, detail) {
  if (!condition) {
    failures.push(message);
    return;
  }
  if (label) {
    record(label, detail);
  }
}

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8"
  });
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

function checkStaticSurvivalSurface() {
  const charter = read("CHARTER.md");
  const resilienceModel = read("RESILIENCE_MODEL.md");
  const resilienceDrills = read("RESILIENCE_DRILLS.md");
  const adaptiveProtocol = read("ADAPTIVE_OPERATOR_PROTOCOL.md");
  const operatingSystem = read("OPERATING_SYSTEM.md");
  const brazilCompliance = read("BRAZIL_COMPLIANCE.md");
  const brazilAgents = read("BRAZIL_COMPLIANCE_AGENTS.md");
  const aiHandoff = read("AI_LEGAL_HANDOFF.md");
  const googleFormIntake = read("GOOGLE_FORM_INTAKE.md");
  const humanReviewPacket = read("HUMAN_REVIEW_PACKET.md");
  const supportEvidence = read("SUPPORT_INBOX_EVIDENCE.md");
  const termos = read("TERMOS.md");
  const avisoPrivacidade = read("AVISO_DE_PRIVACIDADE.md");
  const script = read("script.js");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfig = read("public-config.js");

  assert(charter.includes("lawfully survive, grow, and compound"), "CHARTER.md must preserve the lawful survival objective.", "charter survival objective", "CHARTER.md");
  assert(charter.includes("Does it avoid creating a single point of failure?"), "CHARTER.md must keep the single-point-of-failure test.", "single-point-of-failure test", "CHARTER.md");
  assert(resilienceModel.includes("## Threat Model"), "RESILIENCE_MODEL.md must define the threat model.", "threat model", "RESILIENCE_MODEL.md");
  assert(resilienceModel.includes("Every incident must produce at least one permanent improvement"), "RESILIENCE_MODEL.md must keep the anti-fragility rule.", "anti-fragility rule", "RESILIENCE_MODEL.md");
  assert(resilienceDrills.includes("Every serious weakness must become a hardening packet"), "RESILIENCE_DRILLS.md must keep the hardening packet rule.", "hardening packet rule", "RESILIENCE_DRILLS.md");
  assert(adaptiveProtocol.includes("Damage is information"), "ADAPTIVE_OPERATOR_PROTOCOL.md must keep the adaptive damage rule.", "adaptive damage rule", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(adaptiveProtocol.includes("Do not set `liveMode: true`"), "ADAPTIVE_OPERATOR_PROTOCOL.md must keep the liveMode stop rule.", "adaptive liveMode stop rule", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(adaptiveProtocol.includes("Damage-to-adaptation receipts"), "ADAPTIVE_OPERATOR_PROTOCOL.md must document adaptive receipts.", "adaptive receipt docs", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(adaptiveProtocol.includes("no-spend execution packet"), "ADAPTIVE_OPERATOR_PROTOCOL.md must document adaptive route packets.", "adaptive route packet docs", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(operatingSystem.includes("receipt chain"), "OPERATING_SYSTEM.md must describe the receipt chain.", "receipt-chain operating layer", "OPERATING_SYSTEM.md");
  assert(brazilCompliance.includes("Keep `public-config.js` at `liveMode: false`"), "BRAZIL_COMPLIANCE.md must keep the liveMode stop rule.", "Brazil liveMode stop rule", "BRAZIL_COMPLIANCE.md");
  assert(brazilAgents.includes("Human must close"), "BRAZIL_COMPLIANCE_AGENTS.md must keep human closure language.", "Brazil compliance human closure", "BRAZIL_COMPLIANCE_AGENTS.md");
  assert(aiHandoff.includes("Before setting `liveMode: true`"), "AI_LEGAL_HANDOFF.md must gate live mode on human review.", "AI human review live gate", "AI_LEGAL_HANDOFF.md");
  assert(aiHandoff.includes("HUMAN_REVIEW_PACKET.md"), "AI_LEGAL_HANDOFF.md must link the live human review packet.", "AI handoff human review packet link", "AI_LEGAL_HANDOFF.md");
  assert(humanReviewPacket.includes("Manual Close Sheet"), "HUMAN_REVIEW_PACKET.md must include the manual close sheet.", "human review manual close sheet", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live"), "HUMAN_REVIEW_PACKET.md must include the live packet validation command.", "human review packet validation command", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("Do not put Sheet URLs, Stripe dashboard URLs, bank metadata, tax IDs, private reviewer notes, or credentials in `public-config.js`."), "HUMAN_REVIEW_PACKET.md must keep private evidence out of public config.", "human review public config boundary", "HUMAN_REVIEW_PACKET.md");
  assert(googleFormIntake.includes("Do not set googleFormVerified true"), "GOOGLE_FORM_INTAKE.md must keep the Google Form verification stop rule.", "Google Form verification stop rule", "GOOGLE_FORM_INTAKE.md");
  assert(read("tools/google_apps_script_create_intake_form.gs").includes("FormApp.create"), "Apps Script builder must create the Google Form.", "Google Form Apps Script builder", "tools/google_apps_script_create_intake_form.gs");
  assert(supportEvidence.includes("19e4c73fcdbf42a2"), "SUPPORT_INBOX_EVIDENCE.md must record the Gmail receiving test.", "support inbox receiving test", "SUPPORT_INBOX_EVIDENCE.md");
  assert(supportEvidence.includes("tuiidagnese+strangeworks@gmail.com"), "SUPPORT_INBOX_EVIDENCE.md must name the verified pilot inbox.", "verified pilot support inbox", "SUPPORT_INBOX_EVIDENCE.md");
  assert(termos.includes("Cancelamento, Reembolso e Direito de Arrependimento"), "TERMOS.md must include the Brazil consumer cancellation/refund review lane.", "Portuguese terms consumer lane", "TERMOS.md");
  assert(avisoPrivacidade.includes("Direitos dos Titulares"), "AVISO_DE_PRIVACIDADE.md must include LGPD data-subject rights.", "Portuguese privacy rights", "AVISO_DE_PRIVACIDADE.md");
  assert(publicHtml.includes('href="TERMOS.md"'), "public.html must link the Portuguese terms.", "public Portuguese terms link", "public.html");
  assert(publicHtml.includes('href="AVISO_DE_PRIVACIDADE.md"'), "public.html must link the Portuguese privacy notice.", "public Portuguese privacy link", "public.html");
  assert(publicJs.includes("Public intake is closed"), "public.js must tell users public intake is closed before live readiness.", "public closed-intake copy", "public.js");
  assert(publicJs.includes("if (!readiness.liveReady)"), "public.js must block public submits before live readiness.", "public submit live gate", "public.js");
  assert(publicJs.includes('readiness.liveReady ? `<a href="${mailtoUrl(order)}">Open email draft</a>` : ""'), "public.js must hide email draft action before live readiness.", "public email action live gate", "public.js");

  assert(read("index.html").includes('id="liveEvidencePanel"'), "index.html must expose the private live evidence panel.", "live evidence panel", "index.html");
  assert(script.includes("function buildReceiptChain"), "script.js must include receipt-chain construction.", "receipt-chain builder", "script.js");
  assert(script.includes("function sealReceiptChain"), "script.js must include receipt-chain sealing.", "receipt-chain sealer", "script.js");
  assert(script.includes("function buildLiveEvidenceModel"), "script.js must include live evidence state modeling.", "live evidence model", "script.js");
  assert(script.includes("function liveEvidencePacket"), "script.js must include live evidence packet generation.", "live evidence packet", "script.js");
  assert(read("tools/draft_external_live_packet.js").includes("draft-from-public-config"), "external live packet draft tool must keep local evidence in draft mode.", "external live packet draft tool", "tools/draft_external_live_packet.js");
  assert(read("tools/generate_external_live_gap_packet.js").includes("Strange Company external live evidence gap packet"), "live evidence gap packet tool must generate a handoff packet.", "live evidence gap packet tool", "tools/generate_external_live_gap_packet.js");
  assert(read("tools/generate_external_live_gap_packet.js").includes("node tools/check_external_live_packet_gate.js"), "live evidence gap packet must include the external gate regression command.", "live evidence gap regression command", "tools/generate_external_live_gap_packet.js");
  assert(read("tools/validate_external_live_packet.js").includes("public Brazil compliance review date"), "external live packet validator must require Brazil compliance review date.", "external packet Brazil review gate", "tools/validate_external_live_packet.js");
  assert(read("tools/validate_external_live_packet.js").includes("public AI handoff review date"), "external live packet validator must require AI handoff review date.", "external packet AI review gate", "tools/validate_external_live_packet.js");
  assert(read("tools/check_external_live_packet_gate.js").includes("External live packet gate regression passed"), "external live packet gate regression must protect the Brazil/AI review-date gate.", "external packet gate regression", "tools/check_external_live_packet_gate.js");
  assert(script.includes("function runResilienceDrill"), "script.js must include resilience drill execution.", "resilience drill runner", "script.js");
  assert(script.includes("function issueDrillHardeningPacket"), "script.js must include drill hardening packet issuance.", "hardening packet issuer", "script.js");
  assert(script.includes("const BRAZIL_COMPLIANCE_AGENTS = ["), "script.js must include Brazil compliance agents.", "Brazil compliance agents", "script.js");
  assert(script.includes("const ADAPTIVE_DAMAGE_ROUTES = ["), "script.js must include adaptive damage routes.", "adaptive damage routes", "script.js");
  assert(script.includes("function recordAdaptiveReceipt"), "script.js must include adaptive receipt recording.", "adaptive receipt recorder", "script.js");
  assert(script.includes("function routeAdaptiveReceipt"), "script.js must include adaptive receipt routing.", "adaptive receipt router", "script.js");
  assert(script.includes("adaptiveReceiptId"), "script.js must link routed packets back to adaptive receipts.", "adaptive packet receipt link", "script.js");
  assert(script.includes('"Adaptation Receipt",'), "script.js must include adaptive receipts in the receipt chain.", "adaptive receipt chain", "script.js");
  assert(script.includes("const SETUP_EVIDENCE_SLOTS = ["), "script.js must include setup evidence slots.", "setup evidence slots", "script.js");

  for (const [file, contents] of [
    ["public.html", publicHtml],
    ["public.js", publicJs],
    ["public-config.js", publicConfig]
  ]) {
    assert(!/brazilComplianceAgentsPanel/.test(contents), `${file} must not expose the private Brazil compliance agents panel.`, "public/private boundary", file);
    assert(!/adaptiveOperatorPanel/.test(contents), `${file} must not expose the private adaptive operator panel.`, "public/private boundary", file);
    assert(!/strange-company-adaptive-operator/.test(contents), `${file} must not expose private adaptive operator storage.`, "public adaptive storage absent", file);
    assert(!/strange-company-operations/.test(contents), `${file} must not expose private operations storage.`, "public operations storage absent", file);
    assert(!/strange-company-revenue-start/.test(contents), `${file} must not expose private revenue-start storage.`, "public revenue-start storage absent", file);
  }
}

function checkCommand(name, args) {
  const result = runNode(args);
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  assert(result.status === 0, `${name} failed:\n${output}`, name, args.join(" "));
  return result;
}

function checkLiveGateBehavior(config) {
  const blockers = externalLiveBlockers(config);
  const result = runNode(["tools/audit_company_functionality.js", "--require-live"]);
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();

  if (blockers.length) {
    assert(
      result.status !== 0 && output.includes("external live-operation gate is blocked"),
      `--require-live must fail while external blockers remain. Output:\n${output}`,
      "live gate blocks unsafe launch",
      blockers.join("; ")
    );
    return { blockers, liveReady: false };
  }

  assert(result.status === 0, `--require-live must pass when no external blockers remain. Output:\n${output}`, "live gate ready", "--require-live");
  return { blockers, liveReady: true };
}

let config = {};
try {
  config = loadPublicConfig();
  record("public config loads", "public-config.js");
} catch (error) {
  failures.push(`public-config.js failed to load: ${error.message}`);
}

if (!failures.length) {
  checkStaticSurvivalSurface();
  checkCommand("external live packet gate regression", ["tools/check_external_live_packet_gate.js"]);
  checkCommand("public launch preflight", ["tools/preflight_public_launch.js"]);
  checkCommand("company functionality audit", ["tools/audit_company_functionality.js"]);
}

const liveGate = failures.length ? { blockers: [], liveReady: false } : checkLiveGateBehavior(config);

if (failures.length) {
  console.error("Strange Company survival check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Strange Company survival check passed.");
console.log(`Verdict: ${liveGate.liveReady ? "live gate ready if external evidence is real" : "survives as a guarded prototype; live operation remains blocked by design"}.`);
console.log("Survival surfaces:");
for (const item of evidence) {
  console.log(`- ${item.label}: ${item.detail}`);
}
if (liveGate.blockers.length) {
  console.log("External blockers still preventing live operation:");
  for (const blocker of liveGate.blockers) {
    console.log(`- ${blocker}`);
  }
}
