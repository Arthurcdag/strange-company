const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? path.resolve(process.cwd(), args[index + 1]) : fallback;
}

const publicConfigPath = argValue("--public-config", path.join(root, "public-config.js"));
const evolutionLogPath = argValue("--evolution-log", path.join(root, "EVOLUTION_LOG.md"));
const localEvidenceDir = argValue("--local-evidence-dir", root);
const publicLiveReceiptPath = argValue("--public-live-receipt", path.join(root, "public-live-receipt.js"));
const termsDocumentPath = argValue("--terms-doc", path.join(root, "TERMOS.md"));
const privacyDocumentPath = argValue("--privacy-doc", path.join(root, "AVISO_DE_PRIVACIDADE.md"));
const REVIEW_CLOSURE_FIELDS = ["termsReviewedAt", "privacyReviewedAt", "brazilComplianceReviewedAt", "aiHandoffReviewedAt"];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadPublicConfig(filePath) {
  const sandbox = { window: {} };
  vm.runInNewContext(readText(filePath), sandbox, { filename: filePath });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function isIsoDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf())
    && date.toISOString().startsWith(text)
    && text <= new Date().toISOString().slice(0, 10);
}

function isGoogleFormUrl(value) {
  const text = String(value || "").trim();
  if (!text) {
    return false;
  }
  try {
    const url = new URL(text);
    return url.protocol === "https:" && url.href.startsWith("https://docs.google.com/forms/");
  } catch (_error) {
    return false;
  }
}

function evolutionPasses(text) {
  const matches = [...text.matchAll(/^##\s+(\d{4}-\d{2}-\d{2})\s+-\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index || 0;
    const next = matches[index + 1];
    const end = next ? next.index || text.length : text.length;
    return {
      date: match[1],
      title: match[2].trim(),
      body: text.slice(start, end),
    };
  });
}

function summarizeLatestPass(pass) {
  if (!pass) {
    return null;
  }
  const resultMatch = pass.body.match(/^Result:\s+(.+(?:\n(?!##\s|\w+:\s).+)*)/m);
  return {
    date: pass.date,
    title: pass.title,
    result: resultMatch ? resultMatch[1].replace(/\s+/g, " ").trim() : "",
  };
}

function loadLocalEvidenceStatus(dir, configPath) {
  const result = spawnSync(process.execPath, [
    "tools/local_evidence_status.js",
    "--json",
    "--local-dir",
    dir,
    "--public-config",
    configPath,
  ], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`could not build local evidence status:\n${output}`);
  }
  return JSON.parse(result.stdout);
}

function summarizeLocalEvidence(localEvidence) {
  return {
    system: localEvidence.system,
    publicSafe: localEvidence.publicSafe,
    allTemplatesValid: localEvidence.allTemplatesValid,
    laneCount: localEvidence.laneCount,
    readyLaneCount: localEvidence.readyLaneCount,
    missingLaneCount: localEvidence.missingLaneCount,
    invalidLaneCount: localEvidence.invalidLaneCount,
    lanes: localEvidence.lanes.map((lane) => ({
      id: lane.id,
      label: lane.label,
      localFile: lane.localFile,
      status: lane.status,
      ready: lane.ready,
      nextAction: lane.nextAction,
    })),
  };
}

function liveGateRows(config) {
  return [
    {
      id: "supportInboxVerified",
      label: "support inbox verified",
      passed: Boolean(String(config.supportEmail || "").trim() && config.supportInboxVerified === true),
      nextAction: "Keep monitoring the verified support inbox.",
    },
    {
      id: "googleFormVerified",
      label: "Google Form route verified",
      passed: Boolean(isGoogleFormUrl(config.googleFormUrl) && config.googleFormVerified === true),
      nextAction: "Keep the verified Form URL and private Sheet route in local evidence; the tracked closed config stays blank until the final live release.",
    },
    {
      id: "termsReviewedAt",
      label: "human terms review date",
      passed: isIsoDate(config.termsReviewedAt),
      nextAction: "Record the real human terms review date in public-config.js only after review.",
    },
    {
      id: "privacyReviewedAt",
      label: "human privacy review date",
      passed: isIsoDate(config.privacyReviewedAt),
      nextAction: "Record the real human privacy review date in public-config.js only after review.",
    },
    {
      id: "brazilComplianceReviewedAt",
      label: "Brazil compliance review date",
      passed: isIsoDate(config.brazilComplianceReviewedAt),
      nextAction: "Close CNPJ/fiscal/LGPD/payment support review with a responsible human.",
    },
    {
      id: "aiHandoffReviewedAt",
      label: "AI handoff review date",
      passed: isIsoDate(config.aiHandoffReviewedAt),
      nextAction: "Have a human review what AI prepared and record the real review date.",
    },
    {
      id: "liveMode",
      label: "live mode remains closed until evidence is real",
      passed: config.liveMode !== true,
      nextAction: "Keep liveMode false until all public and private live gates pass.",
    },
  ];
}

function reviewClosureActions(hardBlockers) {
  if (!hardBlockers.some((blocker) => REVIEW_CLOSURE_FIELDS.includes(blocker))) {
    return [];
  }
  return [
    "Draft LIVE_REVIEW_CLOSURE.local.json: node tools/draft_live_review_closure.js --write-local",
    "Fill real human review evidence locally, then run node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready.",
    "Render the date-only public config patch: node tools/render_live_review_public_config_patch.js LIVE_REVIEW_CLOSURE.local.json.",
    "Copy only termsReviewedAt, privacyReviewedAt, brazilComplianceReviewedAt, and aiHandoffReviewedAt into public-config.js; keep liveMode false until external live and revenue gates pass.",
  ];
}

function evidenceLane(localEvidence, id) {
  return localEvidence.lanes.find((lane) => lane.id === id) || null;
}

function blockerFromLane(localEvidence, id, blocker) {
  const lane = evidenceLane(localEvidence, id);
  return lane && lane.ready ? [] : [{ ...blocker, laneId: id }];
}

function issuedPublicLiveReceiptReady(configPath, receiptPath, termsPath, privacyPath) {
  const result = spawnSync(process.execPath, [
    "tools/export_public_live_receipt.js",
    "--check-public-js",
    "--require-issued",
    "--public-config",
    configPath,
    "--public-js",
    receiptPath,
    "--terms-doc",
    termsPath,
    "--privacy-doc",
    privacyPath,
  ], {
    cwd: root,
    encoding: "utf8",
  });
  return result.status === 0;
}

function laneHandoff(localEvidence, options) {
  const lane = evidenceLane(localEvidence, options.laneId);
  const laneStatus = lane ? lane.status : "missing";
  let command = options.validatorCommand;
  if (laneStatus === "missing") {
    command = options.draftCommand;
  } else if (laneStatus === "ready" && options.readyCommand) {
    command = options.readyCommand;
  }
  return {
    blockerId: options.blockerId,
    laneId: options.laneId,
    laneStatus,
    priority: options.priority,
    command,
    validatorCommand: options.validatorCommand,
    progressAuditCommand: "node tools/evolution_goal_status.js --json",
    requiresRealEvidence: true,
    liveModeRemainsFalse: true,
    whyNow: options.whyNow,
  };
}

function selectHandoff({
  reviewBlockers,
  revenueBlockers,
  externalLiveBlockers,
  publicRouteBlockers,
  operationalBlockers,
  localEvidence,
  liveMode,
}) {
  const hardLaneCandidates = [];
  if (reviewBlockers.length) {
    hardLaneCandidates.push(laneHandoff(localEvidence, {
      blockerId: "humanReviewClosure",
      laneId: "liveReviewClosure",
      priority: "hard_gate",
      draftCommand: "node tools/draft_live_review_closure.js --write-local",
      validatorCommand: "node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready",
      readyCommand: "node tools/render_live_review_public_config_patch.js LIVE_REVIEW_CLOSURE.local.json",
      whyNow: "One closure packet addresses the current human review-date blockers without changing liveMode.",
    }));
  }
  if (revenueBlockers.length) {
    hardLaneCandidates.push(laneHandoff(localEvidence, {
      blockerId: "privatePaymentFiscalEvidence",
      laneId: "revenueSetupEvidence",
      priority: "hard_gate",
      draftCommand: "node tools/draft_revenue_setup_evidence_index.js --write-local",
      validatorCommand: "node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js",
      whyNow: "Validated payment and fiscal evidence is required before any paid operating decision.",
    }));
  }
  if (externalLiveBlockers.length) {
    hardLaneCandidates.push(laneHandoff(localEvidence, {
      blockerId: "privateExternalLiveEvidence",
      laneId: "externalLivePacket",
      priority: "hard_gate",
      draftCommand: "node tools/draft_external_live_packet.js --write-local",
      validatorCommand: "node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js",
      whyNow: "The strict Stripe, bank, support, Google, and review packet must validate before a human live decision.",
    }));
  }

  const activeHardLane = hardLaneCandidates.find((handoff) => handoff.laneStatus !== "missing")
    || hardLaneCandidates[0];
  if (activeHardLane) {
    return activeHardLane;
  }

  const immediatePublicRouteBlocker = publicRouteBlockers.find(
    (blocker) => blocker.id !== "publicLiveReceipt"
  );
  if (immediatePublicRouteBlocker) {
    const blocker = immediatePublicRouteBlocker;
    return {
      blockerId: blocker.id,
      laneId: null,
      laneStatus: "open",
      priority: "public_route",
      command: blocker.command || blocker.nextAction,
      validatorCommand: blocker.validatorCommand || "node tools/preflight_public_launch.js",
      progressAuditCommand: "node tools/evolution_goal_status.js --json",
      requiresRealEvidence: true,
      liveModeRemainsFalse: true,
      whyNow: "The public route must be verified before readiness can advance.",
    };
  }

  if (operationalBlockers.length) {
    const blocker = operationalBlockers[0];
    const config = blocker.id === "humanReviewerCapacity"
      ? {
        draftCommand: "node tools/draft_reviewer_candidate_tracker.js --write-local",
        validatorCommand: "node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready",
      }
      : {
        draftCommand: "node tools/draft_delivery_review_checklist.js --write-local",
        validatorCommand: "node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready",
      };
    return laneHandoff(localEvidence, {
      blockerId: blocker.id,
      laneId: blocker.laneId,
      priority: "operational_gate",
      ...config,
      whyNow: `${blocker.label} is the next operating-capacity gate after live evidence is ready.`,
    });
  }

  const receiptBlocker = publicRouteBlockers.find((blocker) => blocker.id === "publicLiveReceipt");
  if (receiptBlocker) {
    return {
      blockerId: receiptBlocker.id,
      laneId: null,
      laneStatus: "open",
      priority: "public_route",
      command: receiptBlocker.command || receiptBlocker.nextAction,
      validatorCommand: receiptBlocker.validatorCommand || "node tools/preflight_public_launch.js",
      progressAuditCommand: "node tools/evolution_goal_status.js --json",
      requiresRealEvidence: true,
      liveModeRemainsFalse: true,
      whyNow: "All private readiness and operating-capacity validators are ready; issue the short-lived public receipt before the separate human live decision.",
    };
  }

  if (!liveMode) {
    return {
      blockerId: "humanLiveModeDecision",
      laneId: null,
      laneStatus: "ready",
      priority: "human_decision",
      command: "node tools/preflight_public_launch.js",
      validatorCommand: "node tools/evolution_goal_status.js --json",
      progressAuditCommand: "node tools/survival_check.js",
      requiresRealEvidence: true,
      liveModeRemainsFalse: true,
      whyNow: "Every tracked gate is ready; a human operator must review the public receipt and make the separate liveMode decision.",
    };
  }

  return {
    blockerId: "liveOperationsReview",
    laneId: null,
    laneStatus: "ready",
    priority: "live_operations",
    command: "python tools/vau_company_evolution.py --depth 1",
    validatorCommand: "node tools/survival_check.js",
    progressAuditCommand: "node tools/evolution_goal_status.js --json",
    requiresRealEvidence: true,
    liveModeRemainsFalse: false,
    whyNow: "Live mode is active; review real outcomes and receipts before scaling, revising, or stopping the lane.",
  };
}

function evolutionMode(hardBlockers, publicRouteBlockers, operationalBlockers, liveMode) {
  if (hardBlockers.length) {
    return {
      mode: "burn_down_hard_blockers",
      nextLoop: "Close one real evidence gate, rerun status, and keep liveMode false.",
    };
  }
  if (publicRouteBlockers.length || operationalBlockers.length) {
    return {
      mode: "harden_operations",
      nextLoop: "Improve public route verification, reviewer capacity, delivery review, or support receipts before scaling.",
    };
  }
  if (liveMode) {
    return {
      mode: "operate_measure_adapt",
      nextLoop: "Convert each live outcome into a reviewed receipt, then scale, revise, or stop the lane.",
    };
  }
  return {
    mode: "ready_for_human_live_decision",
    nextLoop: "Run the live audit and require a human operator decision before flipping liveMode.",
  };
}

function buildStatus(config, logText, localEvidence, publicLiveReceiptReady) {
  const evidenceRows = [
    ...liveGateRows(config).filter((row) => row.id !== "liveMode"),
    {
      id: "publicLiveReceipt",
      label: "issued public live receipt bound to the current public config, terms, and privacy notice",
      passed: publicLiveReceiptReady,
      command: "node tools/export_public_live_receipt.js --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force",
      validatorCommand: "node tools/export_public_live_receipt.js --check-public-js --require-issued",
      nextAction: "Validate revenue, external-live, reviewer-capacity, delivery-review, and the current public legal documents, then export the seven-day public-only live receipt while liveMode remains false.",
    },
  ];
  const publicRouteBlockers = evidenceRows
    .filter((row) => !row.passed)
    .filter((row) => !REVIEW_CLOSURE_FIELDS.includes(row.id));
  const reviewBlockers = evidenceRows
    .filter((row) => !row.passed)
    .filter((row) => REVIEW_CLOSURE_FIELDS.includes(row.id))
    .map((row) => row.id);
  const closureActions = reviewClosureActions(reviewBlockers);
  const localEvidenceSummary = summarizeLocalEvidence(localEvidence);
  const revenueBlockers = blockerFromLane(localEvidenceSummary, "revenueSetupEvidence", {
    id: "privatePaymentFiscalEvidence",
    label: "private payment/fiscal evidence",
    nextAction: "Complete REVENUE_SETUP_EVIDENCE_INDEX.local.json outside git and run node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js.",
  });
  const externalLiveBlockers = blockerFromLane(localEvidenceSummary, "externalLivePacket", {
    id: "privateExternalLiveEvidence",
    label: "private external live evidence",
    nextAction: "Complete EXTERNAL_LIVE_PACKET.local.json outside git and run node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js.",
  });
  const operationalBlockers = [
    ...blockerFromLane(localEvidenceSummary, "reviewerCandidateTracker", {
      id: "humanReviewerCapacity",
      label: "four-role human reviewer capacity",
      nextAction: "Complete REVIEWER_CANDIDATE_TRACKER.local.json outside git and run node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready.",
    }),
    ...blockerFromLane(localEvidenceSummary, "deliveryReviewChecklist", {
      id: "deliveryReviewLoop",
      label: "repeatable delivery review loop",
      nextAction: "Complete DELIVERY_REVIEW_CHECKLIST.local.json outside git and run node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready.",
    }),
  ];
  const hardBlockers = [
    ...reviewBlockers,
    ...revenueBlockers.map((blocker) => blocker.id),
    ...externalLiveBlockers.map((blocker) => blocker.id),
  ];
  const passes = evolutionPasses(logText);
  const latestPass = summarizeLatestPass(passes[passes.length - 1]);
  const modeState = evolutionMode(
    hardBlockers,
    publicRouteBlockers,
    operationalBlockers,
    config.liveMode === true,
  );
  const publicLiveReady = !publicRouteBlockers.length && !hardBlockers.length && !operationalBlockers.length;
  const publicGateRows = [
    ...evidenceRows,
    {
      id: "liveMode",
      label: "live mode is enabled only when verified readiness permits it",
      passed: config.liveMode !== true || publicLiveReady,
      nextAction: publicLiveReady
        ? "Require a human operator decision before changing liveMode."
        : "Keep liveMode false until all public and private live gates pass.",
    },
  ];
  const localEvidenceActions = localEvidenceSummary.lanes
    .filter((lane) => !lane.ready)
    .filter((lane) => !["externalLivePacket", "liveReviewClosure", "revenueSetupEvidence"].includes(lane.id))
    .map((lane) => `${lane.label}: ${lane.nextAction}`);
  const selectedHandoff = selectHandoff({
    reviewBlockers,
    revenueBlockers,
    externalLiveBlockers,
    publicRouteBlockers,
    operationalBlockers,
    localEvidence: localEvidenceSummary,
    liveMode: config.liveMode === true,
  });

  return {
    system: "STRANGE_COMPANY_EVOLUTION_STATUS",
    goalStatus: "active",
    mode: modeState.mode,
    nextLoop: modeState.nextLoop,
    publicLiveReady,
    companyOperationalReady: publicLiveReady,
    liveMode: config.liveMode === true,
    publicGateRows,
    hardBlockers,
    publicRouteBlockers: publicRouteBlockers.map((blocker) => blocker.id),
    publicLiveReceiptReady,
    selectedHandoff,
    reviewClosureActions: closureActions,
    revenueBlockers,
    externalLiveBlockers,
    operationalBlockers,
    localEvidence: localEvidenceSummary,
    evolutionPassCount: passes.length,
    latestPass,
    nextActions: [
      ...(closureActions.length
        ? closureActions
        : []),
      ...publicRouteBlockers.map((blocker) => blocker.nextAction),
      ...revenueBlockers.map((blocker) => blocker.nextAction),
      ...externalLiveBlockers.map((blocker) => blocker.nextAction),
      ...localEvidenceActions,
      "Run node tools/audit_evolution_log.js after every repo evolution pass.",
    ],
    guardrails: [
      "Do not set liveMode true while any hard blocker or private live evidence remains open.",
      "Do not commit local evidence packets, credentials, tax IDs, bank data, or customer-private material.",
      "Do not treat simulations, templates, or AI output as legal, tax, payment, privacy, fiscal, or launch approval.",
    ],
  };
}

function printText(status) {
  console.log(status.system);
  console.log(`Goal status: ${status.goalStatus}`);
  console.log(`Mode: ${status.mode}`);
  console.log(`Next loop: ${status.nextLoop}`);
  console.log(`Public live ready: ${status.publicLiveReady}`);
  console.log(`Company operational ready: ${status.companyOperationalReady}`);
  console.log(`liveMode: ${status.liveMode}`);
  console.log(`Evolution passes logged: ${status.evolutionPassCount}`);
  if (status.latestPass) {
    console.log(`Latest pass: ${status.latestPass.date} - ${status.latestPass.title}`);
    console.log(`Latest result: ${status.latestPass.result}`);
  }
  console.log("");
  console.log("Selected handoff:");
  console.log(`- blocker: ${status.selectedHandoff.blockerId}`);
  console.log(`- command: ${status.selectedHandoff.command}`);
  console.log(`- validate: ${status.selectedHandoff.validatorCommand}`);
  console.log("Hard blockers:");
  for (const blocker of status.hardBlockers) {
    console.log(`- ${blocker}`);
  }
  console.log("Review closure workflow:");
  for (const action of status.reviewClosureActions) {
    console.log(`- ${action}`);
  }
  console.log("Revenue blockers:");
  for (const blocker of status.revenueBlockers) {
    console.log(`- ${blocker.id}: ${blocker.nextAction}`);
  }
  console.log("External live blockers:");
  for (const blocker of status.externalLiveBlockers) {
    console.log(`- ${blocker.id}: ${blocker.nextAction}`);
  }
  console.log("Operational blockers:");
  for (const blocker of status.operationalBlockers) {
    console.log(`- ${blocker.id}: ${blocker.nextAction}`);
  }
  console.log("Local evidence:");
  console.log(`- ready lanes: ${status.localEvidence.readyLaneCount}/${status.localEvidence.laneCount}`);
  console.log(`- missing lanes: ${status.localEvidence.missingLaneCount}`);
  console.log(`- invalid lanes: ${status.localEvidence.invalidLaneCount}`);
  for (const lane of status.localEvidence.lanes) {
    console.log(`- ${lane.id}: ${lane.status}`);
  }
  console.log("Next actions:");
  for (const action of status.nextActions) {
    console.log(`- ${action}`);
  }
}

const status = buildStatus(
  loadPublicConfig(publicConfigPath),
  readText(evolutionLogPath),
  loadLocalEvidenceStatus(localEvidenceDir, publicConfigPath),
  issuedPublicLiveReceiptReady(
    publicConfigPath,
    publicLiveReceiptPath,
    termsDocumentPath,
    privacyDocumentPath,
  ),
);

if (asJson) {
  console.log(JSON.stringify(status, null, 2));
} else {
  printText(status);
}
