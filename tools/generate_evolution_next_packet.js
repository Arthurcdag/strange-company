const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const writeLocal = args.includes("--write-local");
const force = args.includes("--force");
const localEvidenceDirIndex = args.indexOf("--local-evidence-dir");
const localEvidenceDir = localEvidenceDirIndex >= 0 && args[localEvidenceDirIndex + 1]
  ? path.resolve(process.cwd(), args[localEvidenceDirIndex + 1])
  : "";
const publicConfigIndex = args.indexOf("--public-config");
const publicConfig = publicConfigIndex >= 0 && args[publicConfigIndex + 1]
  ? path.resolve(process.cwd(), args[publicConfigIndex + 1])
  : "";
const publicLiveReceiptIndex = args.indexOf("--public-live-receipt");
const publicLiveReceipt = publicLiveReceiptIndex >= 0 && args[publicLiveReceiptIndex + 1]
  ? path.resolve(process.cwd(), args[publicLiveReceiptIndex + 1])
  : "";
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 && args[outputIndex + 1]
  ? path.resolve(process.cwd(), args[outputIndex + 1])
  : writeLocal
    ? path.join(root, "EVOLUTION_NEXT_ACTION.local.md")
    : "";

function statusJson() {
  const statusArgs = ["tools/evolution_goal_status.js", "--json"];
  if (localEvidenceDir) {
    statusArgs.push("--local-evidence-dir", localEvidenceDir);
  }
  if (publicConfig) {
    statusArgs.push("--public-config", publicConfig);
  }
  if (publicLiveReceipt) {
    statusArgs.push("--public-live-receipt", publicLiveReceipt);
  }
  const result = spawnSync(process.execPath, statusArgs, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`could not build evolution status:\n${output}`);
  }
  return JSON.parse(result.stdout);
}

function checklist(items) {
  return items.map((item) => `- [ ] ${item}`).join("\n");
}

function localEvidenceMatrix(status) {
  const localEvidence = status.localEvidence;
  if (!localEvidence || !Array.isArray(localEvidence.lanes)) {
    return "- unavailable";
  }
  return localEvidence.lanes
    .map((lane) => {
      const phase = lane.phase ? `; phase=${lane.phase}` : "";
      return `- ${lane.id}: ${lane.status}${phase} (${lane.localFile})`;
    })
    .join("\n");
}

function selectedHandoff(status) {
  const handoff = status.selectedHandoff;
  if (!handoff) {
    return "- unavailable";
  }
  const liveModeState = typeof handoff.currentLiveMode === "boolean"
    ? [
      `- Current liveMode: ${handoff.currentLiveMode}`,
      `- Target liveMode: ${handoff.targetLiveMode}`,
    ]
    : [`- liveMode remains false: ${handoff.liveModeRemainsFalse}`];
  return [
    `- Blocker: ${handoff.blockerId}`,
    `- Evidence lane: ${handoff.laneId || "none"}`,
    `- Lane status: ${handoff.laneStatus}`,
    `- Lane phase: ${handoff.lanePhase || "n/a"}`,
    `- Priority: ${handoff.priority}`,
    `- Do: \`${handoff.command}\``,
    `- Validate: \`${handoff.validatorCommand}\``,
    `- Recheck: \`${handoff.progressAuditCommand}\``,
    `- Why now: ${handoff.whyNow}`,
    `- Requires real evidence: ${handoff.requiresRealEvidence}`,
    ...liveModeState,
  ].join("\n");
}

function packet(status) {
  const hardBlockers = status.hardBlockers.length
    ? status.hardBlockers.map((blocker) => `- ${blocker}`).join("\n")
    : "- none";
  const revenueBlockers = status.revenueBlockers.length
    ? status.revenueBlockers.map((blocker) => `- ${blocker.id}: ${blocker.nextAction}`).join("\n")
    : "- none";
  const externalLiveBlockers = status.externalLiveBlockers.length
    ? status.externalLiveBlockers.map((blocker) => `- ${blocker.id}: ${blocker.nextAction}`).join("\n")
    : "- none";
  const operationalBlockers = status.operationalBlockers.length
    ? status.operationalBlockers.map((blocker) => `- ${blocker.id}: ${blocker.nextAction}`).join("\n")
    : "- none";
  const reviewClosureWorkflow = status.reviewClosureActions && status.reviewClosureActions.length
    ? checklist(status.reviewClosureActions)
    : "- none";
  const liveRecoveryWorkflow = status.liveRecoveryActions && status.liveRecoveryActions.length
    ? checklist(status.liveRecoveryActions)
    : "- none";
  const liveModeStopRule = status.liveMode
    ? status.liveRecoveryActions && status.liveRecoveryActions.length
      ? "Do not issue or replace a receipt while liveMode is true; complete the ordered fail-closed recovery first."
      : "Do not reissue the public receipt until reissuance readiness is true; keep monitoring the active public receipt and runtime gates."
    : "Do not set `liveMode: true` from this packet.";
  const latest = status.latestPass
    ? `${status.latestPass.date} - ${status.latestPass.title}`
    : "none";
  const localEvidence = status.localEvidence || {};

  return [
    "# Evolution Next Action Packet",
    "",
    "This is a public-safe operator packet. It is not customer evidence, legal approval, tax approval, payment proof, privacy approval, fiscal approval, or launch approval.",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${status.mode}`,
    `Next loop: ${status.nextLoop}`,
    `Goal status: ${status.goalStatus}`,
    `Public live ready: ${status.publicLiveReady}`,
    `Public runtime ready: ${status.publicRuntimeReady}`,
    `Reissuance ready: ${status.reissuanceReady}`,
    `Company operational ready: ${status.companyOperationalReady}`,
    `liveMode: ${status.liveMode}`,
    `Live review closure phase: ${status.liveReviewClosurePhase}`,
    `Latest logged pass: ${latest}`,
    "",
    "## Do This Next",
    "",
    selectedHandoff(status),
    "",
    "## Live Recovery Workflow",
    "",
    liveRecoveryWorkflow,
    "",
    "## Current Hard Blockers",
    "",
    hardBlockers,
    "",
    "## Revenue Blockers",
    "",
    revenueBlockers,
    "",
    "## External Live Blockers",
    "",
    externalLiveBlockers,
    "",
    "## Operational Blockers",
    "",
    operationalBlockers,
    "",
    "## Review Closure Workflow",
    "",
    reviewClosureWorkflow,
    "",
    "## Document-Bound Review Closure Prerequisite",
    "",
    "`LIVE_REVIEW_CLOSURE.local.json` is a hard prerequisite even when all four public review dates are populated. Final readiness requires `node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js`, which checks the current canonical document digests and exact `publicConfigPatch` date binding while `liveMode` remains false.",
    "",
    "A missing, invalid, document-stale, or date-mismatched closure packet keeps `humanReviewClosureEvidence` open and keeps the selected handoff on the closure lane.",
    "",
    "## Local Evidence Matrix",
    "",
    `Ready lanes: ${localEvidence.readyLaneCount || 0}/${localEvidence.laneCount || 0}`,
    `Missing lanes: ${localEvidence.missingLaneCount || 0}`,
    `Invalid local lanes: ${localEvidence.invalidLaneCount || 0}`,
    "",
    localEvidenceMatrix(status),
    "",
    "## Next Action Checklist",
    "",
    checklist(status.nextActions),
    "",
    "## Guardrails",
    "",
    status.guardrails.map((guardrail) => `- ${guardrail}`).join("\n"),
    "",
    "## Validation After Any Change",
    "",
    checklist([
      "Run `node tools/evolution_goal_status.js --json`.",
      "Run `node tools/local_evidence_status.js --json`.",
      "Run `node tools/check_live_review_closure_conformance.js`.",
      "Run `node tools/audit_evolution_log.js`.",
      "Run `node tools/preflight_public_launch.js`.",
      "Run `node tools/build_public_site.js --check --output .public-site-build.local --force`.",
      "Run `node tools/survival_check.js`.",
      "Add a public-safe entry to `EVOLUTION_LOG.md` for the completed repo pass.",
    ]),
    "",
    "## Stop Rules",
    "",
    checklist([
      liveModeStopRule,
      "Do not put CPF, CNPJ, bank data, payment dashboard URLs, credentials, private reviewer notes, or customer-private material in git.",
      "Do not mark any legal, tax, fiscal, payment, privacy, or launch gate complete from AI output alone.",
      "Do not treat this packet as evidence that a real external blocker is closed.",
    ]),
    "",
  ].join("\n");
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Evolution next action packet written: ${targetPath}`);
}

try {
  const contents = packet(statusJson());
  if (outputPath) {
    writeOutput(outputPath, contents);
  } else {
    console.log(contents);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
