const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { parsePublicOrderConfig } = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const failures = [];
const evidence = [];
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
  return parsePublicOrderConfig(read("public-config.js"), "public-config.js");
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
  const threatPathology = read("THREAT_PATHOLOGY.md");
  const adaptiveProtocol = read("ADAPTIVE_OPERATOR_PROTOCOL.md");
  const operatingSystem = read("OPERATING_SYSTEM.md");
  const operationsRunbook = read("OPERATIONS_RUNBOOK.md");
  const evolutionLog = read("EVOLUTION_LOG.md");
  const deliveryReviewLoop = read("DELIVERY_REVIEW_LOOP.md");
  const deliveryReviewTemplate = read("DELIVERY_REVIEW_CHECKLIST.template.json");
  const liveReviewTemplate = read("LIVE_REVIEW_CLOSURE.template.json");
  const brazilCompliance = read("BRAZIL_COMPLIANCE.md");
  const brazilAgents = read("BRAZIL_COMPLIANCE_AGENTS.md");
  const aiHandoff = read("AI_LEGAL_HANDOFF.md");
  const googleFormIntake = read("GOOGLE_FORM_INTAKE.md");
  const humanReviewPacket = read("HUMAN_REVIEW_PACKET.md");
  const conka8LawInstructions = read("CONKA8_LAW_INSTRUCTIONS.md");
  const supportEvidence = read("SUPPORT_INBOX_EVIDENCE.md");
  const termos = read("TERMOS.md");
  const avisoPrivacidade = read("AVISO_DE_PRIVACIDADE.md");
  const script = read("script.js");
  const publicHtml = read("public.html");
  const publicJs = read("public.js");
  const publicConfig = read("public-config.js");
  const publicReceipt = read("public-live-receipt.js");
  const publicAnswers = read("public-ama-answers.js");
  const receiptExporter = read("tools/export_public_live_receipt.js");
  const publicSiteBuilder = read("tools/build_public_site.js");
  const liveReviewBinder = read("tools/bind_live_review_closure.js");
  const strictPublicData = read("tools/strict_public_data.js");
  const shutdownRenderer = read("tools/render_public_live_shutdown_patch.js");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const validateWorkflow = read(".github/workflows/validate.yml");

  assert(charter.includes("lawfully survive, grow, and compound"), "CHARTER.md must preserve the lawful survival objective.", "charter survival objective", "CHARTER.md");
  assert(charter.includes("Does it avoid creating a single point of failure?"), "CHARTER.md must keep the single-point-of-failure test.", "single-point-of-failure test", "CHARTER.md");
  assert(resilienceModel.includes("## Threat Model"), "RESILIENCE_MODEL.md must define the threat model.", "threat model", "RESILIENCE_MODEL.md");
  assert(resilienceModel.includes("Every incident must produce at least one permanent improvement"), "RESILIENCE_MODEL.md must keep the anti-fragility rule.", "anti-fragility rule", "RESILIENCE_MODEL.md");
  assert(resilienceDrills.includes("Every serious weakness must become a hardening packet"), "RESILIENCE_DRILLS.md must keep the hardening packet rule.", "hardening packet rule", "RESILIENCE_DRILLS.md");
  assert(threatPathology.includes("Computer Pathology Model"), "THREAT_PATHOLOGY.md must define the computer pathology model.", "computer pathology model", "THREAT_PATHOLOGY.md");
  assert(threatPathology.includes("Every incident must be classified by pathology type before the system adapts"), "THREAT_PATHOLOGY.md must keep the pathology classification rule.", "pathology classification rule", "THREAT_PATHOLOGY.md");
  assert(threatPathology.includes("Do not create, test, deploy, or improve malware"), "THREAT_PATHOLOGY.md must keep the malware stop rule.", "pathology malware stop rule", "THREAT_PATHOLOGY.md");
  assert(adaptiveProtocol.includes("Damage is information"), "ADAPTIVE_OPERATOR_PROTOCOL.md must keep the adaptive damage rule.", "adaptive damage rule", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(adaptiveProtocol.includes("Do not set `liveMode: true`"), "ADAPTIVE_OPERATOR_PROTOCOL.md must keep the liveMode stop rule.", "adaptive liveMode stop rule", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(adaptiveProtocol.includes("Damage-to-adaptation receipts"), "ADAPTIVE_OPERATOR_PROTOCOL.md must document adaptive receipts.", "adaptive receipt docs", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(adaptiveProtocol.includes("no-spend execution packet"), "ADAPTIVE_OPERATOR_PROTOCOL.md must document adaptive route packets.", "adaptive route packet docs", "ADAPTIVE_OPERATOR_PROTOCOL.md");
  assert(operatingSystem.includes("receipt chain"), "OPERATING_SYSTEM.md must describe the receipt chain.", "receipt-chain operating layer", "OPERATING_SYSTEM.md");
  assert(evolutionLog.includes("Continuous VAU Goal") && evolutionLog.includes("Delivery Review Loop") && evolutionLog.includes("Evolution Pass Audit"), "EVOLUTION_LOG.md must record recent public-safe evolution passes.", "evolution pass log", "EVOLUTION_LOG.md");
  assert(read("tools/audit_evolution_log.js").includes("Evolution log audit passed"), "evolution log audit must be executable.", "evolution log audit tool", "tools/audit_evolution_log.js");
  assert(read("tools/evolution_goal_status.js").includes("STRANGE_COMPANY_EVOLUTION_STATUS"), "evolution goal status must be executable.", "evolution goal status tool", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("reviewClosureActions"), "evolution goal status must expose review-closure actions.", "evolution status review closure actions", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("localEvidence"), "evolution goal status must include local evidence status.", "evolution status local evidence summary", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("selectedHandoff"), "evolution goal status must select one deterministic operator handoff.", "evolution status selected handoff", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("privateExternalLiveEvidence"), "evolution goal status must block readiness on private external live evidence.", "evolution status external live blocker", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("humanReviewClosureEvidence"), "evolution goal status must block readiness on missing or stale document-bound human review evidence.", "evolution status review closure blocker", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("liveReviewClosurePhase"), "evolution goal status must expose the authoritative closure phase.", "evolution status closure phase", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("liveModeRecoveryRequired"), "evolution goal status must select fail-closed recovery before repair while live.", "evolution status live recovery", "tools/evolution_goal_status.js");
  assert(read("tools/evolution_goal_status.js").includes("publicRuntimeReady") && read("tools/evolution_goal_status.js").includes("reissuanceReady"), "evolution status must separate public runtime safety from local reissuance readiness.", "runtime and reissuance readiness split", "tools/evolution_goal_status.js");
  assert(evolutionLog.includes("Evolution Status Report"), "EVOLUTION_LOG.md must record the status-report pass.", "evolution status report log", "EVOLUTION_LOG.md");
  assert(evolutionLog.includes("Fail-Closed Live Recovery and Deployment Freshness"), "EVOLUTION_LOG.md must record the fail-closed live recovery pass.", "live recovery evolution log", "EVOLUTION_LOG.md");
  assert(read("tools/generate_evolution_next_packet.js").includes("EVOLUTION_NEXT_ACTION.local.md"), "evolution next action packet generator must be executable.", "evolution next action packet tool", "tools/generate_evolution_next_packet.js");
  assert(read("tools/generate_evolution_next_packet.js").includes("Review Closure Workflow"), "evolution next action packet must expose the review-closure workflow.", "evolution next packet review closure workflow", "tools/generate_evolution_next_packet.js");
  assert(read("tools/generate_evolution_next_packet.js").includes("Local Evidence Matrix"), "evolution next action packet must expose the local evidence matrix.", "evolution next packet local evidence matrix", "tools/generate_evolution_next_packet.js");
  assert(read("tools/generate_evolution_next_packet.js").includes("Do This Next"), "evolution next action packet must expose the selected handoff first.", "evolution next packet selected handoff", "tools/generate_evolution_next_packet.js");
  assert(read("tools/generate_evolution_next_packet.js").includes("External Live Blockers"), "evolution next action packet must expose the external live blocker.", "evolution next packet external live blocker", "tools/generate_evolution_next_packet.js");
  assert(read("tools/generate_evolution_next_packet.js").includes("Live Recovery Workflow"), "evolution next action packet must expose ordered fail-closed recovery.", "evolution next packet live recovery", "tools/generate_evolution_next_packet.js");
  assert(shutdownRenderer.includes("STRANGE_COMPANY_PUBLIC_LIVE_SHUTDOWN_PATCH") && shutdownRenderer.includes("mutatesFiles: false"), "the live shutdown renderer must be public-safe and output only.", "public live shutdown renderer", "tools/render_public_live_shutdown_patch.js");
  assert(evolutionLog.includes("Evolution Next Action Packet"), "EVOLUTION_LOG.md must record the next-action packet pass.", "evolution next action log", "EVOLUTION_LOG.md");
  assert(read("tools/local_evidence_status.js").includes("STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS"), "local evidence status tool must be executable.", "local evidence status tool", "tools/local_evidence_status.js");
  assert(read("tools/local_evidence_status.js").includes("LIVE_REVIEW_CLOSURE.local.json"), "local evidence status tool must track live-review closure evidence.", "local evidence status live review lane", "tools/local_evidence_status.js");
  assert(read("tools/local_evidence_status.js").includes("document_ready_unbound") && read("tools/local_evidence_status.js").includes("config_bound_ready"), "local evidence status must distinguish document-ready from config-bound closure.", "local evidence status closure phases", "tools/local_evidence_status.js");
  assert(read("tools/check_live_review_closure_conformance.js").includes("STRANGE_COMPANY_LIVE_REVIEW_CLOSURE_CONFORMANCE"), "live review closure conformance must be executable.", "live review closure conformance", "tools/check_live_review_closure_conformance.js");
  assert(read("tools/check_live_review_closure_conformance.js").includes("tools/local_evidence_status.js") && read("tools/check_live_review_closure_conformance.js").includes("tools/evolution_goal_status.js") && read("tools/check_live_review_closure_conformance.js").includes("tools/generate_evolution_next_packet.js") && read("tools/check_live_review_closure_conformance.js").includes("tools/vau_company_evolution.py"), "live review closure conformance must exercise every operator status surface.", "live review closure conformance surfaces", "tools/check_live_review_closure_conformance.js");
  assert(publicSiteBuilder.includes("tools/check_live_review_closure_conformance.js") && publicSiteBuilder.includes("tools/vau_company_evolution.py") && publicSiteBuilder.includes("tools/bind_live_review_closure.js"), "the public bundle must package the executable closure conformance and transactional binding stack.", "public bundle closure binding stack", "tools/build_public_site.js");
  assert(publicSiteBuilder.includes("tools/render_public_live_shutdown_patch.js"), "the public bundle must package the output-only live shutdown renderer.", "public bundle live shutdown renderer", "tools/build_public_site.js");
  assert(read("tools/local_evidence_status.js").includes("REVENUE_SETUP_EVIDENCE_INDEX.local.json"), "local evidence status tool must track revenue setup evidence.", "local evidence status revenue lane", "tools/local_evidence_status.js");
  assert(evolutionLog.includes("Local Evidence Status Matrix"), "EVOLUTION_LOG.md must record the local evidence status pass.", "local evidence status log", "EVOLUTION_LOG.md");
  assert(evolutionLog.includes("Live Review Closure Packet"), "EVOLUTION_LOG.md must record the live-review closure pass.", "live review closure log", "EVOLUTION_LOG.md");
  assert(liveReviewTemplate.includes('"reviewGates"'), "LIVE_REVIEW_CLOSURE.template.json must define review gates.", "live review closure template gates", "LIVE_REVIEW_CLOSURE.template.json");
  assert(liveReviewTemplate.includes('"schemaVersion": 2'), "LIVE_REVIEW_CLOSURE.template.json must use the document-bound schema.", "live review closure schema", "LIVE_REVIEW_CLOSURE.template.json");
  assert(liveReviewTemplate.includes('"documentDigests"'), "LIVE_REVIEW_CLOSURE.template.json must bind every reviewed document by digest.", "live review closure document digests", "LIVE_REVIEW_CLOSURE.template.json");
  assert(liveReviewTemplate.includes('"liveMode": false'), "LIVE_REVIEW_CLOSURE.template.json must keep liveMode false.", "live review closure liveMode stop rule", "LIVE_REVIEW_CLOSURE.template.json");
  assert(read("tools/draft_live_review_closure.js").includes("LIVE_REVIEW_CLOSURE.local.json"), "live review closure draft tool must generate local evidence.", "live review closure draft tool", "tools/draft_live_review_closure.js");
  assert(read("tools/validate_live_review_closure.js").includes("--require-ready"), "live review closure validator must expose a ready gate.", "live review closure validator", "tools/validate_live_review_closure.js");
  assert(read("tools/validate_live_review_closure.js").includes("STRANGE_COMPANY_REVIEW_DOCUMENT_V1"), "live review closure validator must use domain-separated document digests.", "live review closure digest domain", "tools/validate_live_review_closure.js");
  assert(read("tools/render_live_review_public_config_patch.js").includes("LIVE_REVIEW_PUBLIC_CONFIG_PATCH"), "live review public config patch renderer must be executable.", "live review patch renderer", "tools/render_live_review_public_config_patch.js");
  assert(liveReviewBinder.includes("STRANGE_COMPANY_LIVE_REVIEW_BIND_PLAN") && liveReviewBinder.includes("--expect-plan-id") && liveReviewBinder.includes("atomicReplace"), "live review binding must be plan-token guarded, atomic per file, receipt-first, and fail closed between its two output replacements.", "live review transactional binder", "tools/bind_live_review_closure.js");
  assert(strictPublicData.includes("parsePublicOrderConfig") && strictPublicData.includes("parseFrozenWindowJson") && strictPublicData.includes("duplicate object key") && strictPublicData.includes("unsafe object key"), "public config and frozen public archives must use one strict non-executing data parser.", "strict public data parser", "tools/strict_public_data.js");
  assert(publicSiteBuilder.includes("tools/strict_public_data.js") && pagesWorkflow.includes("node --check tools/strict_public_data.js") && validateWorkflow.includes("node --check tools/strict_public_data.js"), "the public bundle and both workflows must carry and syntax-check the strict parser.", "strict parser distribution", "tools/build_public_site.js, .github/workflows/pages.yml, .github/workflows/validate.yml");
  const executableDataParserPattern = new RegExp(
    ["runInNew", "Context|runIn", "Context|require\\([\"'](?:node:)?v", "m[\"']\\)|new\\s+v", "m\\.Script"].join("")
  );
  const executableDataParsers = fs.readdirSync(path.join(root, "tools"))
    .filter((name) => name.endsWith(".js"))
    .filter((name) => executableDataParserPattern.test(read(`tools/${name}`)));
  assert(executableDataParsers.length === 0, "tools must not execute public data through node:vm.", "non-executing public data boundary", executableDataParsers.join(", ") || "tools/*.js");
  assert(humanReviewPacket.includes("node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready"), "HUMAN_REVIEW_PACKET.md must include the live-review closure ready command.", "human review closure ready command", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js"), "HUMAN_REVIEW_PACKET.md must include the config-bound closure command.", "human review config-bound closure command", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("node tools/check_live_review_closure_conformance.js"), "HUMAN_REVIEW_PACKET.md must include the closure conformance command.", "human review closure conformance command", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("node tools/render_live_review_public_config_patch.js LIVE_REVIEW_CLOSURE.local.json"), "HUMAN_REVIEW_PACKET.md must include the live-review patch render command.", "human review patch render command", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("node tools/bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json") && humanReviewPacket.includes("--apply --expect-plan-id <PLAN_ID>"), "HUMAN_REVIEW_PACKET.md must use the plan-token closure binder for the actual two-file transition.", "human review transactional binder command", "HUMAN_REVIEW_PACKET.md");
  assert(script.includes("bind_live_review_closure.js") && read("tools/generate_external_live_gap_packet.js").includes("bind_live_review_closure.js"), "both Operations live-evidence surfaces must route reviewed dates through the transactional binder.", "live evidence closure binder handoff", "script.js, tools/generate_external_live_gap_packet.js");
  assert(script.includes("Only if LIVE_REVIEW_CLOSURE.local.json is absent") && script.includes("exact applyArguments") && read("tools/generate_external_live_gap_packet.js").includes("preparationCondition") && read("tools/generate_external_live_gap_packet.js").includes("exact applyArguments"), "live-evidence packets must distinguish conditional preparation from the exact plan-reported apply arguments.", "executable closure handoff", "script.js, tools/generate_external_live_gap_packet.js");
  assert(read("tools/evolution_goal_status.js").includes("phaseValidatorCommands"), "evolution status must choose both closure action and validator by phase.", "phase-specific closure status", "tools/evolution_goal_status.js");
  for (const file of ["ONLINE_ASAP.md", "OPERATIONS_START_PACKET.md", "FIRST_REVENUE_CLOSEOUT.md"]) {
    const contents = read(file);
    assert(!/^\s*(?:- \[ \] )?Push to `main`\.|git push origin main|Public site must be visible now \| Push to `main`/m.test(contents), `${file} must not instruct a direct-main release.`, "protected release handoff", file);
  }
  assert(humanReviewPacket.includes("node tools/render_public_live_shutdown_patch.js"), "HUMAN_REVIEW_PACKET.md must include the fail-closed live shutdown command.", "human review live shutdown command", "HUMAN_REVIEW_PACKET.md");
  assert(read("HUMAN_REVENUE_INSTRUCTIONS.md").includes("node tools\\render_public_live_shutdown_patch.js"), "HUMAN_REVENUE_INSTRUCTIONS.md must include the fail-closed live shutdown command.", "human revenue live shutdown command", "HUMAN_REVENUE_INSTRUCTIONS.md");
  assert(read("OPERATOR_FAST_START.md").includes("node tools/render_public_live_shutdown_patch.js"), "OPERATOR_FAST_START.md must include the fail-closed live shutdown command.", "operator fast-start shutdown command", "OPERATOR_FAST_START.md");
  assert(read("OPERATIONS_START_PACKET.md").includes("node tools/render_public_live_shutdown_patch.js"), "OPERATIONS_START_PACKET.md must include the fail-closed live shutdown command.", "operations start shutdown command", "OPERATIONS_START_PACKET.md");
  assert(read("RUN_LIVE_PILOT.md").includes("node tools/render_public_live_shutdown_patch.js"), "RUN_LIVE_PILOT.md must include the fail-closed live shutdown command.", "live pilot shutdown command", "RUN_LIVE_PILOT.md");
  assert(operationsRunbook.includes("Delivery Review Checklist"), "OPERATIONS_RUNBOOK.md must document the delivery review checklist.", "delivery review checklist docs", "OPERATIONS_RUNBOOK.md");
  assert(deliveryReviewLoop.includes("DELIVERY_REVIEW_CHECKLIST.local.json"), "DELIVERY_REVIEW_LOOP.md must keep completed delivery evidence local.", "delivery checklist local evidence rule", "DELIVERY_REVIEW_LOOP.md");
  assert(deliveryReviewLoop.includes("node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready"), "DELIVERY_REVIEW_LOOP.md must include the ready-gate validation command.", "delivery checklist ready validation command", "DELIVERY_REVIEW_LOOP.md");
  assert(deliveryReviewTemplate.includes('"noCustomerPrivateDataInRepo": true'), "DELIVERY_REVIEW_CHECKLIST.template.json must protect customer-private data.", "delivery checklist private data attestation", "DELIVERY_REVIEW_CHECKLIST.template.json");
  assert(read("tools/validate_delivery_review_checklist.js").includes("--require-ready"), "delivery review validator must expose the ready gate.", "delivery checklist validator", "tools/validate_delivery_review_checklist.js");
  assert(read("tools/vau_company_evolution.py").includes("--delivery-review-checklist"), "VAU must read delivery review checklist evidence.", "VAU delivery checklist input", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("--external-live-packet"), "VAU must read the private external live packet.", "VAU external live packet input", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("--live-review-closure"), "VAU must read the document-bound live review closure.", "VAU live review closure input", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("validate_live_review_closure.js"), "VAU must use the authoritative live review closure validator.", "VAU live review validator", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("live_review_closure_config_bound"), "VAU must enforce atomic config-bound closure readiness.", "VAU closure invariant", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("privateExternalLiveEvidenceReady"), "VAU must keep external live evidence as a hard gate.", "VAU external live evidence gate", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("validate_revenue_setup_evidence_index.js"), "VAU must use the authoritative revenue evidence validator.", "VAU revenue evidence validator", "tools/vau_company_evolution.py");
  assert(read("tools/vau_company_evolution.py").includes("publicLiveReceiptReady"), "VAU must keep the public live receipt as a hard gate.", "VAU public live receipt gate", "tools/vau_company_evolution.py");
  assert(read("tools/export_public_live_receipt.js").includes("privatePacketHashesExcluded"), "the public live receipt must exclude hashes of private packets.", "public live receipt private hash exclusion", "tools/export_public_live_receipt.js");
  assert(read("tools/export_public_live_receipt.js").includes("--live-review-closure"), "the public live receipt must require the document-bound human review packet for issuance.", "public receipt live review closure gate", "tools/export_public_live_receipt.js");
  assert(publicJs.includes("liveReviewClosureValidatorPassed"), "the browser must require the public-safe human-review validator attestation.", "public receipt browser review gate", "public.js");
  assert(receiptExporter.includes("schemaVersion: 4") && publicReceipt.includes('"schemaVersion": 4'), "the exporter and placeholder must use generation-aware public receipt schema v4.", "public receipt schema v4", "tools/export_public_live_receipt.js, public-live-receipt.js");
  assert(receiptExporter.includes("nextReceiptGeneration") && receiptExporter.includes("withReceiptMutationLock") && publicJs.includes("HIGHEST_PUBLIC_LIVE_RECEIPT_GENERATION") && publicJs.includes("HIGHEST_PUBLIC_LIVE_RECEIPT_IDENTITY"), "receipt mutations must serialize, and the open browser must enforce monotonic generations plus same-generation identity.", "public receipt anti-rollback generation", "tools/export_public_live_receipt.js, public.js");
  assert(receiptExporter.includes("createIssuanceSnapshot") && receiptExporter.includes("assertIssuanceInputsMatchSnapshot") && receiptExporter.includes("captureReceiptOutputBaseline") && receiptExporter.includes("assertReceiptOutputMatchesBaseline"), "receipt issuance must compare-and-swap every exact issuance input and its pre-validation output so drift or a newer revocation remains dominant.", "public receipt revocation dominance", "tools/export_public_live_receipt.js");
  assert(receiptExporter.includes("createRevocationSnapshot") && receiptExporter.includes("assertRevocationInputsMatchSnapshot"), "receipt revocation must compare-and-swap the exact public config and all reviewed documents so a stale revoker cannot overwrite a newer binder result.", "public receipt revocation input CAS", "tools/export_public_live_receipt.js");
  assert(receiptExporter.includes("STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V4") && publicJs.includes("STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V4"), "the exporter and browser must share the schema-v4 envelope digest domain.", "public receipt envelope v4", "tools/export_public_live_receipt.js, public.js");
  assert(pagesWorkflow.includes("cancel-in-progress: true") && pagesWorkflow.includes("github.ref == 'refs/heads/main'") && pagesWorkflow.includes("origin/main"), "Pages must cancel stale runs, reject non-main dispatches, and verify the current main head before deploy.", "Pages deployment freshness", ".github/workflows/pages.yml");
  assert(pagesWorkflow.includes("node tools/render_public_live_shutdown_patch.js --json") && validateWorkflow.includes("node tools/render_public_live_shutdown_patch.js --json"), "both validation workflows must execute the output-only shutdown renderer.", "shutdown renderer workflow execution", ".github/workflows/pages.yml, .github/workflows/validate.yml");
  assert(pagesWorkflow.includes("node --check tools/bind_live_review_closure.js") && validateWorkflow.includes("node --check tools/bind_live_review_closure.js"), "both workflows must syntax-check the transactional closure binder.", "closure binder workflow syntax", ".github/workflows/pages.yml, .github/workflows/validate.yml");
  assert(receiptExporter.includes("reviewDocuments") && publicJs.includes("reviewDocuments"), "the exporter and browser must use the nine-document reviewDocuments core.", "public receipt nine-document core", "tools/export_public_live_receipt.js, public.js");
  assert(receiptExporter.includes("STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1") && publicJs.includes("STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1"), "the exporter and browser must share the review-document digest domain.", "review-document digest domain", "STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1");
  assert(receiptExporter.includes("STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2") && publicJs.includes("STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2"), "the exporter and browser must share the v2 public core digest domain.", "public core digest domain", "STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2");
  for (const documentPath of PUBLIC_REVIEW_DOCUMENT_PATHS) {
    const quotedPath = JSON.stringify(documentPath);
    assert(liveReviewTemplate.includes(quotedPath), `live review template must name canonical document ${documentPath}.`, `closure document ${documentPath}`, "LIVE_REVIEW_CLOSURE.template.json");
    assert(receiptExporter.includes(quotedPath), `public receipt exporter must bind runtime document ${documentPath}.`, `receipt document ${documentPath}`, "tools/export_public_live_receipt.js");
    assert(publicJs.includes(quotedPath), `public browser must revalidate runtime document ${documentPath}.`, `browser document ${documentPath}`, "public.js");
    assert(publicSiteBuilder.includes(quotedPath), `public bundle must require runtime document ${documentPath}.`, `bundle document ${documentPath}`, "tools/build_public_site.js");
  }
  assert(!receiptExporter.includes("legalDocuments") && !publicJs.includes("legalDocuments") && !publicReceipt.includes('"legalDocuments"'), "legacy two-document legalDocuments cores must be removed.", "legacy two-document core removed", "receipt exporter, browser, placeholder");
  assert(publicSiteBuilder.includes("sourceBytes.length !== bundledBytes.length") && publicSiteBuilder.includes("sourceBytes.equals(bundledBytes)"), "public bundle must enforce size and byte parity for every reviewed document.", "public bundle reviewed-document parity", "tools/build_public_site.js");
  assert(publicSiteBuilder.includes('"--document-root"') && publicSiteBuilder.includes('path.join(root, "tools", "export_public_live_receipt.js")'), "public bundle must validate its receipt against the bundled document root with the trusted root exporter.", "public bundle receipt validation", "tools/build_public_site.js");
  assert(brazilCompliance.includes("Keep `public-config.js` at `liveMode: false`"), "BRAZIL_COMPLIANCE.md must keep the liveMode stop rule.", "Brazil liveMode stop rule", "BRAZIL_COMPLIANCE.md");
  assert(brazilAgents.includes("Human must close"), "BRAZIL_COMPLIANCE_AGENTS.md must keep human closure language.", "Brazil compliance human closure", "BRAZIL_COMPLIANCE_AGENTS.md");
  assert(aiHandoff.includes("Before setting `liveMode: true`"), "AI_LEGAL_HANDOFF.md must gate live mode on human review.", "AI human review live gate", "AI_LEGAL_HANDOFF.md");
  assert(aiHandoff.includes("HUMAN_REVIEW_PACKET.md"), "AI_LEGAL_HANDOFF.md must link the live human review packet.", "AI handoff human review packet link", "AI_LEGAL_HANDOFF.md");
  assert(aiHandoff.includes("CONKA8_LAW_INSTRUCTIONS.md"), "AI_LEGAL_HANDOFF.md must link conka8 law instructions.", "AI handoff conka8 law instructions link", "AI_LEGAL_HANDOFF.md");
  assert(humanReviewPacket.includes("Manual Close Sheet"), "HUMAN_REVIEW_PACKET.md must include the manual close sheet.", "human review manual close sheet", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js"), "HUMAN_REVIEW_PACKET.md must include the config-bound live packet validation command.", "human review packet config-bound validation command", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("Do not put Sheet URLs, Stripe dashboard URLs, bank metadata, tax IDs, private reviewer notes, or credentials in `public-config.js`."), "HUMAN_REVIEW_PACKET.md must keep private evidence out of public config.", "human review public config boundary", "HUMAN_REVIEW_PACKET.md");
  assert(humanReviewPacket.includes("CONKA8_LAW_INSTRUCTIONS.md"), "HUMAN_REVIEW_PACKET.md must link conka8 law instructions.", "human review conka8 link", "HUMAN_REVIEW_PACKET.md");
  assert(conka8LawInstructions.includes("Do not set `liveMode: true`, `googleFormVerified: true`, `brazilComplianceReviewedAt`, or `aiHandoffReviewedAt` unless the evidence is real"), "CONKA8_LAW_INSTRUCTIONS.md must keep the live gate stop rule.", "conka8 live gate stop rule", "CONKA8_LAW_INSTRUCTIONS.md");
  assert(conka8LawInstructions.includes("Law-Sensitive Areas"), "CONKA8_LAW_INSTRUCTIONS.md must include the law-sensitive area matrix.", "conka8 law-sensitive matrix", "CONKA8_LAW_INSTRUCTIONS.md");
  assert(conka8LawInstructions.includes("node tools/audit_company_functionality.js --require-live"), "CONKA8_LAW_INSTRUCTIONS.md must include the live audit command.", "conka8 live audit command", "CONKA8_LAW_INSTRUCTIONS.md");
  assert(googleFormIntake.includes("Do not set googleFormVerified true"), "GOOGLE_FORM_INTAKE.md must keep the Google Form verification stop rule.", "Google Form verification stop rule", "GOOGLE_FORM_INTAKE.md");
  assert(read("tools/google_apps_script_create_intake_form.gs").includes("FormApp.create"), "Apps Script builder must create the Google Form.", "Google Form Apps Script builder", "tools/google_apps_script_create_intake_form.gs");
  assert(supportEvidence.includes("19e4c73fcdbf42a2"), "SUPPORT_INBOX_EVIDENCE.md must record the Gmail receiving test.", "support inbox receiving test", "SUPPORT_INBOX_EVIDENCE.md");
  assert(supportEvidence.includes("tuiidagnese+strangeworks@gmail.com"), "SUPPORT_INBOX_EVIDENCE.md must name the verified pilot inbox.", "verified pilot support inbox", "SUPPORT_INBOX_EVIDENCE.md");
  assert(termos.includes("Cancelamento, Reembolso e Direito de Arrependimento"), "TERMOS.md must include the Brazil consumer cancellation/refund review lane.", "Portuguese terms consumer lane", "TERMOS.md");
  assert(avisoPrivacidade.includes("Direitos dos Titulares"), "AVISO_DE_PRIVACIDADE.md must include LGPD data-subject rights.", "Portuguese privacy rights", "AVISO_DE_PRIVACIDADE.md");
  assert(publicHtml.includes('href="TERMOS.md"'), "public.html must link the Portuguese terms.", "public Portuguese terms link", "public.html");
  assert(publicHtml.includes('href="AVISO_DE_PRIVACIDADE.md"'), "public.html must link the Portuguese privacy notice.", "public Portuguese privacy link", "public.html");
  assert(publicHtml.includes('id="publicAmaForm"'), "public.html must include the public AMA form.", "public AMA form", "public.html");
  assert(publicHtml.includes('href="PUBLIC_AMA.md"'), "public.html must link the public AMA rules.", "public AMA rules link", "public.html");
  assert(publicHtml.includes('id="publicAmaAnswers"'), "public.html must include the published AMA answer panel.", "public AMA published answers panel", "public.html");
  assert(publicHtml.includes('src="public-ama-answers.js"'), "public.html must load the public AMA answer archive.", "public AMA answer archive loader", "public.html");
  assert(publicHtml.includes('src="public-live-receipt.js"'), "public.html must load the public live receipt.", "public live receipt loader", "public.html");
  assert(publicHtml.includes('id="publicOrderClosed"'), "public.html must show a fail-closed paid-intake notice.", "public paid-intake closed notice", "public.html");
  assert(publicHtml.includes('href="#ama"'), "public.html must hand closed paid intake to the AMA.", "public paid-intake AMA handoff", "public.html");
  assert(publicHtml.includes('id="publicOrderFields" hidden disabled'), "public.html must keep order fields disabled by default.", "public order fields fail closed", "public.html");
  assert(publicJs.includes("amaQuestionPacket"), "public.js must build public-safe AMA packets.", "public AMA packet builder", "public.js");
  assert(publicJs.includes("renderPublicAmaAnswers"), "public.js must render public-safe AMA answers.", "public AMA answer renderer", "public.js");
  assert(publicJs.includes("if (!readiness.supportReady)"), "public.js must keep AMA behind the verified support inbox.", "public AMA support gate", "public.js");
  assert(publicJs.includes("function setPublicOrderAvailability()"), "public.js must expose the fail-closed paid-intake gate.", "public order availability gate", "public.js");
  assert(publicJs.includes("readiness.liveReady === true"), "public.js must require strict live readiness before showing paid intake.", "public order strict readiness", "public.js");
  assert(publicJs.includes("function publicLiveReceiptReady("), "public.js must require the issued public live receipt.", "public live receipt gate", "public.js");
  assert(publicJs.includes('receipt.status === "local_packet_validators_passed"'), "public.js must reject a non-issued public live receipt.", "public live receipt issued status", "public.js");
  assert(publicJs.includes('globalThis.crypto.subtle.digest("SHA-256", bytes)'), "public.js must recompute the public receipt digests in the browser.", "public live receipt browser digest", "public.js");
  assert(publicJs.includes("attestations.operationalValidatorsPassed === true"), "public.js must require the reviewer and delivery capacity attestation.", "public live receipt capacity gate", "public.js");
  assert(publicJs.includes("receipt.envelopeSha256"), "public.js must verify full receipt-envelope integrity.", "public live receipt envelope gate", "public.js");
  assert(publicJs.includes("function schedulePublicReceiptExpiry()"), "public.js must close an already-open desk when its receipt expires.", "public live receipt open-tab expiry", "public.js");
  assert(publicJs.includes("fields.disabled = !liveReady"), "public.js must disable order fields until live readiness.", "public order disabled fields", "public.js");
  assert(read("PUBLIC_AMA.md").includes("PUBLIC_AMA_QUEUE.local.json"), "PUBLIC_AMA.md must document the local AMA queue.", "public AMA local queue docs", "PUBLIC_AMA.md");
  assert(read("PUBLIC_AMA_PUBLICATION_PACKET.md").includes("Manual Close Sheet"), "PUBLIC_AMA_PUBLICATION_PACKET.md must keep human publication closure.", "public AMA publication close sheet", "PUBLIC_AMA_PUBLICATION_PACKET.md");
  assert(read("PUBLIC_AMA_QUEUE.template.json").includes('"questionRecords": []'), "PUBLIC_AMA_QUEUE.template.json must stay a blank public template.", "public AMA queue template", "PUBLIC_AMA_QUEUE.template.json");
  assert(read("PUBLIC_AMA_ANSWERS.template.json").includes('"answers": []'), "PUBLIC_AMA_ANSWERS.template.json must stay a blank public answer template.", "public AMA answers template", "PUBLIC_AMA_ANSWERS.template.json");
  assert(publicAnswers.includes("window.PUBLIC_AMA_ANSWERS"), "public-ama-answers.js must expose only the public answer archive.", "public AMA answer archive", "public-ama-answers.js");
  assert(read("tools/export_public_ama_answers.js").includes("humanApprovedForPublication"), "public AMA answer export must require human publication approval.", "public AMA answer export gate", "tools/export_public_ama_answers.js");
  assert(read("tools/export_public_ama_answers.js").includes("--check-public-js"), "public AMA answer export must validate the public archive.", "public AMA answer archive validation", "tools/export_public_ama_answers.js");
  assert(read("tools/build_public_site.js").includes("Public site build check passed"), "public site bundle must have an executable build check.", "public site build checker", "tools/build_public_site.js");
  assert(read("tools/validate_public_ama_queue.js").includes("--require-answer-ready"), "public AMA validator must require answer-ready review before publication.", "public AMA answer-ready gate", "tools/validate_public_ama_queue.js");
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
  checkCommand("live review closure conformance", ["tools/check_live_review_closure_conformance.js"]);
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
