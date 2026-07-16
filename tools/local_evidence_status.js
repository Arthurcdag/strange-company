const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");

function argValue(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? String(args[index + 1]) : fallback;
}

const localDir = path.resolve(process.cwd(), argValue("--local-dir", root));
const publicConfigPath = path.resolve(process.cwd(), argValue("--public-config", path.join(root, "public-config.js")));

const lanes = [
  {
    id: "externalLivePacket",
    label: "External live packet",
    localFile: "EXTERNAL_LIVE_PACKET.local.json",
    validator: "tools/validate_external_live_packet.js",
    bindPublicConfig: true,
    draftCommand: "node tools/draft_external_live_packet.js --write-local",
    checks: [
      {
        id: "live_ready",
        label: "external live packet ready",
        args: ["--require-live"],
      },
    ],
  },
  {
    id: "liveReviewClosure",
    label: "Live review closure",
    localFile: "LIVE_REVIEW_CLOSURE.local.json",
    validator: "tools/validate_live_review_closure.js",
    phaseModel: "live_review_closure",
    draftCommand: "node tools/draft_live_review_closure.js --write-local",
    checks: [
      {
        id: "document_ready",
        label: "review documents ready",
        args: ["--require-ready"],
        bindPublicConfig: false,
      },
      {
        id: "config_bound_ready",
        label: "review documents and dates bound to public config",
        args: ["--require-ready"],
        bindPublicConfig: true,
      },
    ],
  },
  {
    id: "revenueSetupEvidence",
    label: "Revenue setup evidence",
    localFile: "REVENUE_SETUP_EVIDENCE_INDEX.local.json",
    validator: "tools/validate_revenue_setup_evidence_index.js",
    bindPublicConfig: true,
    draftCommand: "node tools/draft_revenue_setup_evidence_index.js --write-local",
    checks: [
      {
        id: "all_revenue_gates_ready",
        label: "all revenue setup gates ready",
        args: ["--require-all"],
      },
    ],
  },
  {
    id: "reviewerCandidateTracker",
    label: "Reviewer candidate tracker",
    localFile: "REVIEWER_CANDIDATE_TRACKER.local.json",
    validator: "tools/validate_reviewer_candidate_tracker.js",
    draftCommand: "node tools/draft_reviewer_candidate_tracker.js --write-local",
    checks: [
      {
        id: "one_candidate_recorded",
        label: "one reviewer candidate recorded",
        args: ["--require-one"],
      },
      {
        id: "ready_reviewer_pool",
        label: "four-role reviewer pool ready",
        args: ["--require-ready"],
      },
    ],
  },
  {
    id: "publicAmaQueue",
    label: "Public AMA queue",
    localFile: "PUBLIC_AMA_QUEUE.local.json",
    validator: "tools/validate_public_ama_queue.js",
    draftCommand: "node tools/draft_public_ama_queue.js --write-local",
    checks: [
      {
        id: "one_question_recorded",
        label: "one screened public question recorded",
        args: ["--require-one"],
      },
      {
        id: "answer_ready",
        label: "answer-ready question approved",
        args: ["--require-answer-ready"],
      },
    ],
  },
  {
    id: "deliveryReviewChecklist",
    label: "Delivery review checklist",
    localFile: "DELIVERY_REVIEW_CHECKLIST.local.json",
    validator: "tools/validate_delivery_review_checklist.js",
    draftCommand: "node tools/draft_delivery_review_checklist.js --write-local",
    checks: [
      {
        id: "delivery_loop_ready",
        label: "delivery review loop ready",
        args: ["--require-ready"],
      },
    ],
  },
];

function runNode(commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: "utf8",
  });
  return result.status === 0;
}

function checkBindsPublicConfig(lane, check) {
  return check && typeof check.bindPublicConfig === "boolean"
    ? check.bindPublicConfig
    : lane.bindPublicConfig === true;
}

function validatorCommand(lane, fileName, checkArgs = [], bindPublicConfig = lane.bindPublicConfig === true) {
  const bindingArgs = bindPublicConfig && checkArgs.length
    ? ["--public-config", "public-config.js"]
    : [];
  return ["node", lane.validator, fileName, ...checkArgs, ...bindingArgs].join(" ");
}

function validatorArgs(lane, fileName, checkArgs = [], bindPublicConfig = lane.bindPublicConfig === true) {
  const bindingArgs = bindPublicConfig && checkArgs.length
    ? ["--public-config", publicConfigPath]
    : [];
  return [lane.validator, fileName, ...checkArgs, ...bindingArgs];
}

function localPath(lane) {
  return path.join(localDir, lane.localFile);
}

function localFileExists(lane) {
  try {
    return fs.statSync(localPath(lane)).isFile();
  } catch (_error) {
    return false;
  }
}

function laneNextAction(lane, status, checks) {
  if (lane.phaseModel === "live_review_closure") {
    const documentCheck = checks.find((check) => check.id === "document_ready");
    const boundCheck = checks.find((check) => check.id === "config_bound_ready");
    if (boundCheck && boundCheck.passed) {
      return "Keep this closure local and rerun its config-bound validator after any reviewed document or public review date changes.";
    }
    if (documentCheck && documentCheck.passed) {
      return `Apply only the four approved review dates while liveMode remains false, then run ${boundCheck.command}.`;
    }
    if (status === "missing") {
      return `${lane.draftCommand}; then fill real human-review evidence outside git.`;
    }
    return `Complete real document-bound human review, then run ${documentCheck.command}.`;
  }
  if (status === "ready") {
    return "Keep this packet local and rerun VAU/status after the related public config or operating evidence changes.";
  }
  if (status === "invalid") {
    return `Inspect the local packet privately with ${validatorCommand(lane, lane.localFile)} before using it as evidence.`;
  }
  if (status === "missing") {
    return `${lane.draftCommand}; then fill real evidence outside git.`;
  }
  const firstOpenCheck = checks.find((check) => !check.passed);
  if (firstOpenCheck) {
    return `Complete real local evidence, then run ${validatorCommand(lane, lane.localFile, firstOpenCheck.args)}.`;
  }
  return "Review the local packet privately before treating it as evidence.";
}

function closurePhase(lane, present, structurallyValid, checks) {
  if (lane.phaseModel !== "live_review_closure") {
    return undefined;
  }
  if (!present) {
    return "missing";
  }
  if (!structurallyValid) {
    return "invalid";
  }
  const documentReady = checks.find((check) => check.id === "document_ready")?.passed === true;
  const configBoundReady = checks.find((check) => check.id === "config_bound_ready")?.passed === true;
  if (configBoundReady) {
    return "config_bound_ready";
  }
  if (documentReady) {
    return "document_ready_unbound";
  }
  return "invalid";
}

function closureCommands(lane, checks) {
  if (lane.phaseModel !== "live_review_closure") {
    return undefined;
  }
  return {
    draft: lane.draftCommand,
    validateDocuments: checks.find((check) => check.id === "document_ready")?.command || "",
    validateConfigBinding: checks.find((check) => check.id === "config_bound_ready")?.command || "",
  };
}

function inspectLane(lane) {
  const templateValid = runNode([lane.validator, "--template-ok"]);
  const present = localFileExists(lane);
  const checks = lane.checks.map((check) => ({
    id: check.id,
    label: check.label,
    passed: false,
    command: validatorCommand(
      lane,
      lane.localFile,
      check.args,
      checkBindsPublicConfig(lane, check)
    ),
    args: check.args,
    bindsPublicConfig: checkBindsPublicConfig(lane, check),
  }));

  if (!present) {
    return {
      id: lane.id,
      label: lane.label,
      localFile: lane.localFile,
      localFilePresent: false,
      templateValid,
      status: "missing",
      ...(lane.phaseModel ? { phase: closurePhase(lane, false, false, checks) } : {}),
      ready: false,
      ...(lane.phaseModel ? { finalReady: false } : {}),
      checks,
      draftCommand: lane.draftCommand,
      ...(lane.phaseModel ? { commands: closureCommands(lane, checks) } : {}),
      nextAction: laneNextAction(lane, "missing", checks),
    };
  }

  const structurallyValid = runNode([lane.validator, localPath(lane)]);
  if (!structurallyValid) {
    return {
      id: lane.id,
      label: lane.label,
      localFile: lane.localFile,
      localFilePresent: true,
      templateValid,
      status: "invalid",
      ...(lane.phaseModel ? { phase: closurePhase(lane, true, false, checks) } : {}),
      ready: false,
      ...(lane.phaseModel ? { finalReady: false } : {}),
      checks,
      draftCommand: lane.draftCommand,
      ...(lane.phaseModel ? { commands: closureCommands(lane, checks) } : {}),
      nextAction: laneNextAction(lane, "invalid", checks),
    };
  }

  let passed = 0;
  for (const [index, check] of lane.checks.entries()) {
    const ok = runNode(validatorArgs(
      lane,
      localPath(lane),
      check.args,
      checkBindsPublicConfig(lane, check)
    ));
    checks[index].passed = ok;
    if (ok) {
      passed += 1;
    }
  }

  const phase = closurePhase(lane, true, true, checks);
  const status = lane.phaseModel === "live_review_closure"
    ? phase === "config_bound_ready"
      ? "ready"
      : phase === "document_ready_unbound"
        ? "partial"
        : "invalid"
    : passed === lane.checks.length
      ? "ready"
      : passed > 0
        ? "partial"
        : "local_not_ready";

  return {
    id: lane.id,
    label: lane.label,
    localFile: lane.localFile,
    localFilePresent: true,
    templateValid,
    status,
    ...(lane.phaseModel ? { phase } : {}),
    ready: status === "ready",
    ...(lane.phaseModel ? { finalReady: phase === "config_bound_ready" } : {}),
    checks,
    draftCommand: lane.draftCommand,
    ...(lane.phaseModel ? { commands: closureCommands(lane, checks) } : {}),
    nextAction: laneNextAction(lane, status, checks),
  };
}

function buildStatus() {
  const laneStatuses = lanes.map(inspectLane);
  const templateFailures = laneStatuses.filter((lane) => !lane.templateValid);
  const invalidLanes = laneStatuses.filter((lane) => lane.status === "invalid");
  const readyLanes = laneStatuses.filter((lane) => lane.ready);
  const missingLanes = laneStatuses.filter((lane) => lane.status === "missing");

  return {
    system: "STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS",
    publicSafe: true,
    localDirectoryMode: localDir === root ? "repo-root" : "custom",
    note: "This command reports local evidence readiness without printing ignored packet contents or validator stderr.",
    allTemplatesValid: templateFailures.length === 0,
    laneCount: laneStatuses.length,
    readyLaneCount: readyLanes.length,
    missingLaneCount: missingLanes.length,
    invalidLaneCount: invalidLanes.length,
    lanes: laneStatuses,
    guardrails: [
      "Keep completed *.local.json evidence out of git.",
      "Do not treat a ready local packet as legal, tax, payment, privacy, fiscal, or launch approval.",
      "Do not set liveMode true from this status report.",
    ],
  };
}

function printText(status) {
  console.log(status.system);
  console.log(status.note);
  console.log(`Templates valid: ${status.allTemplatesValid}`);
  console.log(`Ready lanes: ${status.readyLaneCount}/${status.laneCount}`);
  console.log(`Missing lanes: ${status.missingLaneCount}`);
  console.log(`Invalid local lanes: ${status.invalidLaneCount}`);
  console.log("");
  console.log("Lanes:");
  for (const lane of status.lanes) {
    const phase = lane.phase ? ` / phase=${lane.phase}` : "";
    console.log(`- ${lane.id}: ${lane.status}${phase} (${lane.localFile})`);
    console.log(`  next: ${lane.nextAction}`);
  }
  console.log("");
  console.log("Guardrails:");
  for (const guardrail of status.guardrails) {
    console.log(`- ${guardrail}`);
  }
}

const status = buildStatus();

if (asJson) {
  console.log(JSON.stringify(status, null, 2));
} else {
  printText(status);
}

if (!status.allTemplatesValid) {
  process.exit(1);
}
