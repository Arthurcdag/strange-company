const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1";
const CLOSURE_BLOCKER = "humanReviewClosureEvidence";
const CLOSURE_FILE = "LIVE_REVIEW_CLOSURE.local.json";
const REVIEW_DATE = "2026-06-12";
const UNBOUND_REVIEW_DATE = "2026-06-13";

const fixtureSpecs = [
  {
    phase: "missing",
    localStatus: "missing",
    packetMode: "missing",
    configBound: false,
  },
  {
    phase: "invalid",
    localStatus: "invalid",
    packetMode: "invalid",
    configBound: false,
  },
  {
    phase: "document_ready_unbound",
    localStatus: "partial",
    packetMode: "ready",
    configBound: false,
  },
  {
    phase: "config_bound_ready",
    localStatus: "ready",
    packetMode: "ready",
    configBound: true,
  },
];

function fail(message) {
  throw new Error(message);
}

function parseJson(output, label) {
  try {
    return JSON.parse(output);
  } catch (_error) {
    fail(`${label} did not return valid JSON`);
  }
}

function run(command, commandArgs, label) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) {
    fail(`${label} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    fail(`${label} exited with ${result.status}${output ? `: ${output}` : ""}`);
  }
  return result.stdout;
}

function runNode(commandArgs, label) {
  return run(process.execPath, commandArgs, label);
}

function resolvePython() {
  const candidates = [...new Set([
    process.env.PYTHON,
    "python",
    "python3",
    "py",
  ].filter(Boolean))];
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    });
    if (!result.error && result.status === 0) {
      return candidate;
    }
  }
  fail("no usable Python interpreter was found");
}

function normalizeReviewDocument(contents) {
  return contents.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function reviewDocumentDigest(canonicalPath) {
  const contents = fs.readFileSync(path.join(root, canonicalPath), "utf8");
  const payload = `${REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath=${canonicalPath}\n${normalizeReviewDocument(contents)}`;
  return crypto.createHash("sha256").update(payload, "utf8").digest("hex");
}

function readyClosurePayload() {
  const payload = JSON.parse(fs.readFileSync(path.join(root, "LIVE_REVIEW_CLOSURE.template.json"), "utf8"));
  payload.mode = "local";

  const dateFields = {
    terms: "termsReviewedAt",
    privacy: "privacyReviewedAt",
    brazilCompliance: "brazilComplianceReviewedAt",
    aiHandoff: "aiHandoffReviewedAt",
  };
  for (const [gateId, dateField] of Object.entries(dateFields)) {
    const gate = payload.reviewGates[gateId];
    gate.reviewer = `${gateId}-fixture-reviewer`;
    gate.reviewedAt = REVIEW_DATE;
    gate.humanApprovedForPublicConfig = true;
    gate.aiOnlyApproval = false;
    gate.documentDigests = Object.fromEntries(
      gate.documentsReviewed.map((canonicalPath) => [canonicalPath, reviewDocumentDigest(canonicalPath)])
    );
    payload.publicConfigPatch[dateField] = REVIEW_DATE;
  }

  Object.assign(payload.reviewGates.terms, {
    offerFlowReviewed: true,
    refundCancellationReviewed: true,
    supportFlowReviewed: true,
  });
  Object.assign(payload.reviewGates.privacy, {
    lgpdContactReviewed: true,
    retentionReviewed: true,
    processorsReviewed: true,
    dataSubjectRightsReviewed: true,
  });
  Object.assign(payload.reviewGates.brazilCompliance, {
    cnpjOrEntityRouteReviewed: true,
    fiscalReceiptRouteReviewed: true,
    paymentSupportReviewed: true,
    lgpdRouteReviewed: true,
  });
  Object.assign(payload.reviewGates.aiHandoff, {
    aiPreparedTextReviewed: true,
    acceptedChangedOrRejected: true,
    automatedDecisionStopRuleConfirmed: true,
  });
  Object.assign(payload.attestation, {
    operator: "Synthetic conformance operator",
    reviewedAt: REVIEW_DATE,
    noPrivateEvidenceInRepo: true,
    noLegalTaxPrivacyApprovalFromAi: true,
    liveModeStaysFalse: true,
    externalLivePacketStillRequired: true,
    revenuePaymentFiscalEvidenceStillRequired: true,
  });
  return payload;
}

function writePublicConfig(filePath, reviewDate) {
  const contents = [
    "window.PUBLIC_ORDER_CONFIG = {",
    '  operatorName: "Strange Works Studio",',
    '  jurisdiction: "BR",',
    '  complianceMode: "brazil-draft",',
    "  aiGeneratedLegalDocsRequireHumanReview: true,",
    '  supportEmail: "support@example.com",',
    '  googleFormUrl: "",',
    "  supportInboxVerified: true,",
    "  googleFormVerified: false,",
    `  termsReviewedAt: "${reviewDate}",`,
    `  privacyReviewedAt: "${reviewDate}",`,
    `  brazilComplianceReviewedAt: "${reviewDate}",`,
    `  aiHandoffReviewedAt: "${reviewDate}",`,
    "  liveMode: false,",
    "  services: [{",
    '    id: "proof-sprint",',
    '    title: "Proof sprint",',
    '    detail: "Synthetic conformance fixture",',
    "    price: 750",
    "  }]",
    "};",
    "",
  ].join("\n");
  fs.writeFileSync(filePath, contents, "utf8");
}

function writeFixture(workspace, spec) {
  const fixtureDir = path.join(workspace, spec.phase);
  fs.mkdirSync(fixtureDir, { recursive: true });
  const configPath = path.join(fixtureDir, "public-config.js");
  const closurePath = path.join(fixtureDir, CLOSURE_FILE);
  const reviewDate = spec.phase === "document_ready_unbound" ? UNBOUND_REVIEW_DATE : REVIEW_DATE;
  writePublicConfig(configPath, reviewDate);

  if (spec.packetMode === "invalid") {
    fs.writeFileSync(closurePath, "{\n", "utf8");
  } else if (spec.packetMode === "ready") {
    fs.writeFileSync(closurePath, `${JSON.stringify(readyClosurePayload(), null, 2)}\n`, "utf8");
  }

  return {
    fixtureDir,
    configPath,
    closurePath,
    missingReceiptPath: path.join(fixtureDir, "missing-public-live-receipt.js"),
  };
}

function findClosureLane(status, label) {
  const lane = status.lanes.find((candidate) => candidate.id === "liveReviewClosure");
  if (!lane) {
    fail(`${label} omitted the liveReviewClosure lane`);
  }
  return lane;
}

function packetPhase(packetText) {
  const match = packetText.match(/^Live review closure phase:\s*(\S+)\s*$/m);
  return match ? match[1] : "";
}

function inspectFixture(python, workspace, spec) {
  const fixture = writeFixture(workspace, spec);
  const localStatus = parseJson(runNode([
    "tools/local_evidence_status.js",
    "--json",
    "--local-dir",
    fixture.fixtureDir,
    "--public-config",
    fixture.configPath,
  ], `${spec.phase}: local evidence status`), `${spec.phase}: local evidence status`);

  const evolutionArgs = [
    "--local-evidence-dir",
    fixture.fixtureDir,
    "--public-config",
    fixture.configPath,
    "--public-live-receipt",
    fixture.missingReceiptPath,
  ];
  const evolutionStatus = parseJson(runNode([
    "tools/evolution_goal_status.js",
    "--json",
    ...evolutionArgs,
  ], `${spec.phase}: evolution goal status`), `${spec.phase}: evolution goal status`);
  const nextPacket = runNode([
    "tools/generate_evolution_next_packet.js",
    ...evolutionArgs,
  ], `${spec.phase}: evolution next packet`);

  const missingPath = (name) => path.join(fixture.fixtureDir, `missing-${name}`);
  const vau = parseJson(run(python, [
    "tools/vau_company_evolution.py",
    "--public-config",
    fixture.configPath,
    "--reviewer-tracker",
    missingPath("reviewer-tracker.json"),
    "--revenue-evidence-index",
    missingPath("revenue-index.json"),
    "--external-live-packet",
    missingPath("external-live-packet.json"),
    "--live-review-closure",
    fixture.closurePath,
    "--public-live-receipt",
    fixture.missingReceiptPath,
    "--terms-doc",
    path.join(root, "TERMOS.md"),
    "--privacy-doc",
    path.join(root, "AVISO_DE_PRIVACIDADE.md"),
    "--public-ama-queue",
    missingPath("ama-queue.json"),
    "--public-ama-answers",
    missingPath("ama-answers.js"),
    "--delivery-review-checklist",
    missingPath("delivery-review.json"),
    "--depth",
    "1",
    "--format",
    "json",
  ], `${spec.phase}: VAU`), `${spec.phase}: VAU`);

  return {
    localStatus,
    localLane: findClosureLane(localStatus, `${spec.phase}: local evidence status`),
    evolutionStatus,
    evolutionLane: findClosureLane(evolutionStatus.localEvidence, `${spec.phase}: evolution goal status`),
    nextPacket,
    nextPacketPhase: packetPhase(nextPacket),
    vau,
  };
}

function check(condition, failures, phase, message) {
  if (!condition) {
    failures.push(`${phase}: ${message}`);
  }
}

function verifyFixture(spec, observation, failures) {
  const { phase } = spec;
  const local = observation.localLane;
  const goal = observation.evolutionStatus;
  const selected = goal.selectedHandoff || {};
  const documentCheck = local.checks.find((candidate) => candidate.id === "document_ready");
  const configCheck = local.checks.find((candidate) => candidate.id === "config_bound_ready");
  const closureBlocked = goal.hardBlockers.includes(CLOSURE_BLOCKER);
  const packetBlocked = observation.nextPacket.includes(`- Blocker: ${CLOSURE_BLOCKER}`);
  const vauReady = observation.vau.current_state?.gates?.liveReviewClosureReady === true;
  const vauBlocked = observation.vau.hard_blockers?.includes(CLOSURE_BLOCKER) === true;
  const vauFirstBlocker = observation.vau.hard_blockers?.[0] || "";
  const vauFirstRecommendedEvent = observation.vau.recommended_next_actions?.[0]?.events?.[0] || "";
  const vauPriorityConsistent = spec.configBound
    ? vauFirstBlocker !== CLOSURE_BLOCKER
      && vauFirstRecommendedEvent !== "human_review_closure_evidence_ready"
    : vauFirstBlocker === CLOSURE_BLOCKER
      && vauFirstRecommendedEvent === "human_review_closure_evidence_ready";

  check(local.phase === phase, failures, phase, `local evidence phase was ${local.phase || "absent"}`);
  check(local.status === spec.localStatus, failures, phase, `local evidence status was ${local.status}`);
  check(local.ready === spec.configBound, failures, phase, `local evidence ready was ${local.ready}`);
  check(documentCheck?.passed === ["document_ready_unbound", "config_bound_ready"].includes(phase), failures, phase, "document-ready check disagreed with the phase");
  check(configCheck?.passed === spec.configBound, failures, phase, "config-binding check disagreed with the phase");

  check(goal.liveReviewClosurePhase === phase, failures, phase, `evolution goal phase was ${goal.liveReviewClosurePhase || "absent"}`);
  check(observation.evolutionLane.phase === phase, failures, phase, "evolution goal local-evidence phase disagreed");
  check(closureBlocked === !spec.configBound, failures, phase, "evolution goal blocker state disagreed");
  check((goal.reviewClosureEvidenceBlockers || []).length === (spec.configBound ? 0 : 1), failures, phase, "evolution goal closure blocker detail disagreed");

  check(observation.nextPacketPhase === phase, failures, phase, `next packet phase was ${observation.nextPacketPhase || "absent"}`);
  check(packetBlocked === !spec.configBound, failures, phase, "next packet blocker state disagreed");
  check(observation.nextPacket.includes(`phase=${phase}`), failures, phase, "next packet local-evidence matrix omitted the phase");

  check(vauReady === spec.configBound, failures, phase, `VAU closure-ready gate was ${vauReady}`);
  check(vauBlocked === !spec.configBound, failures, phase, "VAU closure blocker state disagreed");
  check(vauPriorityConsistent, failures, phase, "VAU closure priority disagreed");

  if (spec.configBound) {
    check(selected.blockerId !== CLOSURE_BLOCKER, failures, phase, "selected handoff did not advance beyond review closure");
    check(!observation.nextPacket.includes("## Review Closure Workflow\n\n- [ ]"), failures, phase, "next packet retained an open review closure workflow");
  } else {
    check(selected.blockerId === CLOSURE_BLOCKER, failures, phase, "selected handoff left the blocked review closure lane");
    check(selected.lanePhase === phase, failures, phase, `selected handoff phase was ${selected.lanePhase || "absent"}`);
  }

  if (phase === "missing") {
    check(selected.command?.includes("draft_live_review_closure.js"), failures, phase, "selected handoff did not draft the missing packet");
  } else if (phase === "invalid") {
    check(selected.command?.includes("validate_live_review_closure.js"), failures, phase, "selected handoff did not validate the invalid packet");
  } else if (phase === "document_ready_unbound") {
    check(selected.command?.includes("render_live_review_public_config_patch.js"), failures, phase, "selected handoff did not render the date patch");
  }

  return {
    fixture: phase,
    phase,
    localEvidenceStatus: local.status,
    localEvidencePhase: local.phase,
    evolutionGoalPhase: goal.liveReviewClosurePhase,
    nextPacketPhase: observation.nextPacketPhase,
    closureBlocked,
    vauClosureReady: vauReady,
    vauPriorityConsistent,
    selectedHandoffAdvanced: selected.blockerId !== CLOSURE_BLOCKER,
  };
}

function printText(report) {
  console.log("Live review closure conformance passed.");
  for (const phase of report.phases) {
    console.log(`- ${phase.fixture}: ${phase.phase}`);
  }
}

let workspace = "";
try {
  const unknownArgs = args.filter((arg) => arg !== "--json");
  if (unknownArgs.length) {
    fail(`unknown argument: ${unknownArgs[0]}`);
  }
  const python = resolvePython();
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "strange-company-live-review-conformance-"));
  const failures = [];
  const phases = fixtureSpecs.map((spec) => verifyFixture(
    spec,
    inspectFixture(python, workspace, spec),
    failures,
  ));
  if (failures.length) {
    fail(`conformance mismatch:\n- ${failures.join("\n- ")}`);
  }
  const report = {
    system: "STRANGE_COMPANY_LIVE_REVIEW_CLOSURE_CONFORMANCE",
    passed: true,
    publicSafe: true,
    phases,
  };
  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printText(report);
  }
} catch (error) {
  console.error(`Live review closure conformance failed:\n- ${error.message}`);
  process.exitCode = 1;
} finally {
  if (workspace) {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}
