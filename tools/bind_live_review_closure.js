const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  parseFrozenWindowJson,
  parsePublicOrderConfig,
} = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

const PLAN_DOMAIN = "STRANGE_COMPANY_LIVE_REVIEW_BIND_PLAN_V1";
const REVIEW_FIELDS = Object.freeze([
  "termsReviewedAt",
  "privacyReviewedAt",
  "brazilComplianceReviewedAt",
  "aiHandoffReviewedAt",
]);
const REVIEW_DOCUMENT_PATHS = Object.freeze([
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
const BOOLEAN_OPTIONS = new Set(["--apply", "--json"]);
const VALUE_OPTIONS = new Set([
  "--expect-plan-id",
  "--public-config",
  "--public-receipt",
  "--document-root",
  "--terms-doc",
  "--privacy-doc",
  "--live-review-closure",
]);

function fail(message) {
  throw new Error(message);
}

function parseArguments(rawArgs) {
  const flags = new Set();
  const values = new Map();
  const positional = [];
  for (let index = 0; index < rawArgs.length; index += 1) {
    const option = String(rawArgs[index]);
    if (!option.startsWith("--")) {
      positional.push(option);
      continue;
    }
    if (BOOLEAN_OPTIONS.has(option)) {
      if (flags.has(option)) fail(`duplicate option: ${option}`);
      flags.add(option);
      continue;
    }
    if (!VALUE_OPTIONS.has(option)) fail(`unknown option: ${option}`);
    if (values.has(option)) fail(`duplicate option: ${option}`);
    const value = rawArgs[index + 1];
    if (value === undefined || String(value).trim() === "" || String(value).startsWith("--")) {
      fail(`${option} requires a non-option value.`);
    }
    values.set(option, String(value));
    index += 1;
  }
  if (positional.length > 1) fail("only one closure packet positional argument is allowed.");
  if (positional.length && values.has("--live-review-closure")) {
    fail("use either the closure packet positional argument or --live-review-closure, not both.");
  }
  if (positional.length) values.set("--live-review-closure", positional[0]);
  if (flags.has("--apply") && !values.has("--expect-plan-id")) {
    fail("--apply requires --expect-plan-id from a fresh plan.");
  }
  if (!flags.has("--apply") && values.has("--expect-plan-id")) {
    fail("--expect-plan-id is valid only with --apply.");
  }
  const expectedPlanId = values.get("--expect-plan-id") || "";
  if (expectedPlanId && !/^[0-9a-f]{64}$/.test(expectedPlanId)) {
    fail("--expect-plan-id must be a lowercase SHA-256 hex value.");
  }
  return { flags, values };
}

function resolveValue(parsed, option, fallback) {
  const value = parsed.values.get(option);
  return value ? path.resolve(process.cwd(), value) : fallback;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function canonicalPlanId(parts) {
  const lines = [PLAN_DOMAIN];
  for (const [label, digest] of parts) lines.push(`${label}=${digest}`);
  return sha256(`${lines.join("\n")}\n`);
}

function readRequired(filePath, label) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    fail(`could not read ${label}: ${error.message}`);
  }
}

function writeExclusive(filePath, contents, mode = 0o600) {
  const descriptor = fs.openSync(filePath, "wx", mode);
  try {
    fs.writeFileSync(descriptor, contents);
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function atomicReplace(filePath, contents) {
  const directory = path.dirname(filePath);
  const basename = path.basename(filePath);
  const mode = fs.statSync(filePath).mode;
  const temporaryPath = path.join(
    directory,
    `.${basename}.bind-${process.pid}-${crypto.randomBytes(8).toString("hex")}.tmp`
  );
  try {
    writeExclusive(temporaryPath, contents, mode);
    fs.renameSync(temporaryPath, filePath);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

function loadPublicConfig(source, filename) {
  try {
    return parsePublicOrderConfig(source.toString("utf8"), filename);
  } catch (error) {
    fail(`could not load public config: ${error.message}`);
  }
}

function loadPublicReceipt(source, filename) {
  try {
    return parseFrozenWindowJson(
      source.toString("utf8"),
      "PUBLIC_LIVE_RECEIPT",
      filename
    );
  } catch (error) {
    fail(`could not load public receipt: ${error.message}`);
  }
}

function runNode(commandArgs, label, { allowFailure = false } = {}) {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) fail(`${label} could not start: ${result.error.message}`);
  if (result.status !== 0 && !allowFailure) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    fail(`${label} failed${output ? `:\n${output}` : "."}`);
  }
  return result;
}

function snapshotInputs(paths) {
  const documentSources = new Map();
  for (const canonicalPath of REVIEW_DOCUMENT_PATHS) {
    const sourcePath = canonicalPath === "TERMOS.md"
      ? paths.termsDocument
      : canonicalPath === "AVISO_DE_PRIVACIDADE.md"
        ? paths.privacyDocument
        : path.join(paths.documentRoot, canonicalPath);
    documentSources.set(canonicalPath, readRequired(sourcePath, `review document ${canonicalPath}`));
  }
  return {
    closure: readRequired(paths.closure, "live review closure packet"),
    config: readRequired(paths.publicConfig, "public config"),
    receipt: readRequired(paths.publicReceipt, "public receipt"),
    documents: documentSources,
  };
}

function materializeSnapshot(snapshot) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "strange-company-review-bind-"));
  try {
    try {
      fs.chmodSync(directory, 0o700);
    } catch (_error) {
      // Windows may not expose POSIX permissions; the unique temp directory remains process-local.
    }
    const closurePath = path.join(directory, "LIVE_REVIEW_CLOSURE.local.json");
    const currentConfigPath = path.join(directory, "public-config.current.js");
    const currentReceiptPath = path.join(directory, "public-live-receipt.current.js");
    fs.writeFileSync(closurePath, snapshot.closure, { mode: 0o600 });
    fs.writeFileSync(currentConfigPath, snapshot.config, { mode: 0o600 });
    fs.writeFileSync(currentReceiptPath, snapshot.receipt, { mode: 0o600 });
    for (const [canonicalPath, contents] of snapshot.documents) {
      fs.writeFileSync(path.join(directory, canonicalPath), contents, { mode: 0o600 });
    }
    return { directory, closurePath, currentConfigPath, currentReceiptPath };
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

function validateClosure(snapshotPaths, configPath = "") {
  const validatorArgs = [
    path.join(root, "tools", "validate_live_review_closure.js"),
    snapshotPaths.closurePath,
    "--require-ready",
    "--document-root",
    snapshotPaths.directory,
    "--terms-doc",
    path.join(snapshotPaths.directory, "TERMOS.md"),
    "--privacy-doc",
    path.join(snapshotPaths.directory, "AVISO_DE_PRIVACIDADE.md"),
  ];
  if (configPath) validatorArgs.push("--public-config", configPath);
  runNode(validatorArgs, configPath ? "config-bound closure validation" : "document-bound closure validation");
}

function receiptCheckArgs(snapshotPaths, configPath, receiptPath) {
  return [
    path.join(root, "tools", "export_public_live_receipt.js"),
    "--check-public-js",
    "--public-config",
    configPath,
    "--public-js",
    receiptPath,
    "--document-root",
    snapshotPaths.directory,
    "--terms-doc",
    path.join(snapshotPaths.directory, "TERMOS.md"),
    "--privacy-doc",
    path.join(snapshotPaths.directory, "AVISO_DE_PRIVACIDADE.md"),
  ];
}

function receiptMatches(snapshotPaths, configPath, receiptPath) {
  return runNode(
    receiptCheckArgs(snapshotPaths, configPath, receiptPath),
    "public receipt validation",
    { allowFailure: true }
  ).status === 0;
}

function requireReceiptMatches(snapshotPaths, configPath, receiptPath, label) {
  runNode(receiptCheckArgs(snapshotPaths, configPath, receiptPath), label);
}

function parseClosurePacket(snapshot) {
  try {
    const packet = JSON.parse(snapshot.closure.toString("utf8"));
    if (!packet || typeof packet !== "object" || Array.isArray(packet)) {
      fail("closure packet must be a JSON object.");
    }
    return packet;
  } catch (error) {
    fail(`could not parse closure packet: ${error.message}`);
  }
}

function requireSafeConfig(config) {
  if (config.liveMode !== false) fail("refusing to bind review dates while liveMode is not false.");
  if (config.jurisdiction !== "BR") fail("refusing to bind review dates outside the BR jurisdiction posture.");
  if (config.aiGeneratedLegalDocsRequireHumanReview !== true) {
    fail("refusing to bind review dates while AI-generated legal documents do not require human review.");
  }
}

function replaceReviewDates(sourceBuffer, targetDates) {
  let source = sourceBuffer.toString("utf8");
  const changes = [];
  for (const field of REVIEW_FIELDS) {
    const propertyPattern = new RegExp(`^[\\t ]*${field}[\\t ]*:`, "gm");
    const propertyCount = [...source.matchAll(propertyPattern)].length;
    if (propertyCount !== 1) {
      fail(`public config must contain exactly one ${field} property; found ${propertyCount}.`);
    }
    const valuePattern = new RegExp(`(^[\\t ]*${field}[\\t ]*:[\\t ]*)"([^"]*)"`, "m");
    const match = source.match(valuePattern);
    if (!match) fail(`public config ${field} must be a double-quoted string literal.`);
    const from = match[2];
    const to = targetDates[field];
    if (typeof to !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      fail(`closure publicConfigPatch.${field} must be an ISO date.`);
    }
    changes.push({ field, from, to, changed: from !== to });
    source = source.replace(valuePattern, `$1${JSON.stringify(to)}`);
  }
  return { contents: Buffer.from(source, "utf8"), changes };
}

function stagePlaceholder(snapshotPaths, candidateConfigPath) {
  const stagedReceiptPath = path.join(snapshotPaths.directory, "public-live-receipt.staged.js");
  fs.copyFileSync(snapshotPaths.currentReceiptPath, stagedReceiptPath);
  runNode([
    path.join(root, "tools", "export_public_live_receipt.js"),
    "--revoke",
    "--public-config",
    candidateConfigPath,
    "--document-root",
    snapshotPaths.directory,
    "--terms-doc",
    path.join(snapshotPaths.directory, "TERMOS.md"),
    "--privacy-doc",
    path.join(snapshotPaths.directory, "AVISO_DE_PRIVACIDADE.md"),
    "--output",
    stagedReceiptPath,
    "--force",
  ], "fail-closed receipt staging");
  requireReceiptMatches(snapshotPaths, candidateConfigPath, stagedReceiptPath, "staged receipt validation");
  return stagedReceiptPath;
}

function snapshotHashParts(snapshot) {
  const parts = [
    ["closure", sha256(snapshot.closure)],
    ["config", sha256(snapshot.config)],
    ["receipt", sha256(snapshot.receipt)],
  ];
  for (const canonicalPath of REVIEW_DOCUMENT_PATHS) {
    parts.push([`document:${canonicalPath}`, sha256(snapshot.documents.get(canonicalPath))]);
  }
  return parts;
}

function implementationHashParts() {
  return [
    ["implementation:binder", sha256(readRequired(__filename, "closure binder implementation"))],
    ["implementation:closure-validator", sha256(readRequired(
      path.join(root, "tools", "validate_live_review_closure.js"),
      "closure validator implementation"
    ))],
    ["implementation:receipt-exporter", sha256(readRequired(
      path.join(root, "tools", "export_public_live_receipt.js"),
      "receipt exporter implementation"
    ))],
  ];
}

function buildPlan(snapshot, paths) {
  const snapshotPaths = materializeSnapshot(snapshot);
  try {
    validateClosure(snapshotPaths);
    const packet = parseClosurePacket(snapshot);
    const targetDates = packet.publicConfigPatch || {};
    const replacement = replaceReviewDates(snapshot.config, targetDates);
    const currentConfig = loadPublicConfig(snapshot.config, paths.publicConfig);
    requireSafeConfig(currentConfig);
    const candidateConfigPath = path.join(snapshotPaths.directory, "public-config.candidate.js");
    fs.writeFileSync(candidateConfigPath, replacement.contents);
    const candidateConfig = loadPublicConfig(replacement.contents, candidateConfigPath);
    requireSafeConfig(candidateConfig);
    for (const field of REVIEW_FIELDS) {
      if (candidateConfig[field] !== targetDates[field]) {
        fail(`candidate public config did not preserve the exact ${field} target.`);
      }
    }
    validateClosure(snapshotPaths, candidateConfigPath);

    const currentReceipt = loadPublicReceipt(snapshot.receipt, paths.publicReceipt);
    const currentReceiptMatches = receiptMatches(
      snapshotPaths,
      snapshotPaths.currentConfigPath,
      snapshotPaths.currentReceiptPath
    );
    const candidateReceiptMatches = receiptMatches(
      snapshotPaths,
      candidateConfigPath,
      snapshotPaths.currentReceiptPath
    );
    const allDatesBound = replacement.changes.every((change) => !change.changed);
    const matchingPlaceholder = currentReceiptMatches
      && allDatesBound
      && currentReceipt.status === "not_issued";

    let transition = "bind_and_revoke";
    let stagedReceiptContents;
    let receiptAfter;
    if (matchingPlaceholder) {
      transition = "already_bound";
      stagedReceiptContents = snapshot.receipt;
      receiptAfter = currentReceipt;
    } else if (
      !allDatesBound
      && candidateReceiptMatches
      && currentReceipt.status === "not_issued"
    ) {
      transition = "resume_receipt_ahead";
      stagedReceiptContents = snapshot.receipt;
      receiptAfter = currentReceipt;
    } else {
      if (!currentReceiptMatches) {
        fail("current public receipt is not valid for the current config and is not a recognized receipt-ahead recovery state.");
      }
      const stagedReceiptPath = stagePlaceholder(snapshotPaths, candidateConfigPath);
      stagedReceiptContents = fs.readFileSync(stagedReceiptPath);
      receiptAfter = loadPublicReceipt(stagedReceiptContents, stagedReceiptPath);
    }

    if (receiptAfter.status !== "not_issued") {
      fail("candidate public receipt must be a fail-closed not_issued placeholder.");
    }
    if (!Number.isSafeInteger(receiptAfter.generation) || receiptAfter.generation < 1) {
      fail("candidate public receipt generation must be a positive safe integer.");
    }

    const configWillChange = !replacement.contents.equals(snapshot.config);
    const receiptWillChange = !stagedReceiptContents.equals(snapshot.receipt);
    const implementationHashes = implementationHashParts();
    const planId = canonicalPlanId([
      ...snapshotHashParts(snapshot),
      ...implementationHashes,
      ["candidate-config", sha256(replacement.contents)],
      ["candidate-receipt", sha256(stagedReceiptContents)],
      ["transition", sha256(transition)],
    ]);
    const plan = {
      system: "STRANGE_COMPANY_LIVE_REVIEW_BIND_PLAN",
      schemaVersion: 1,
      planId,
      localOnly: true,
      publishPlanId: false,
      containsCommitmentToPrivateClosure: true,
      transition,
      alreadyBound: transition === "already_bound",
      wouldApply: configWillChange || receiptWillChange,
      liveModeRemainsFalse: true,
      requiresRealHumanReviewEvidence: true,
      externalEvidenceClaimed: false,
      sourcePacket: path.basename(paths.closure),
      publicConfig: path.basename(paths.publicConfig),
      publicReceipt: path.basename(paths.publicReceipt),
      changes: replacement.changes,
      publicConfigBeforeSha256: sha256(snapshot.config),
      publicConfigAfterSha256: sha256(replacement.contents),
      publicReceiptBeforeSha256: sha256(snapshot.receipt),
      publicReceiptAfterSha256: sha256(stagedReceiptContents),
      receiptGenerationBefore: currentReceipt.generation,
      receiptGenerationAfter: receiptAfter.generation,
      strictClosureValidationPassed: true,
      stagedReceiptValidationPassed: true,
      implementationSha256: Object.fromEntries(
        implementationHashes.map(([label, digest]) => [label.replace("implementation:", ""), digest])
      ),
      applyArguments: [
        "node",
        "tools/bind_live_review_closure.js",
        paths.closure,
        "--public-config",
        paths.publicConfig,
        "--public-receipt",
        paths.publicReceipt,
        "--document-root",
        paths.documentRoot,
        "--terms-doc",
        paths.termsDocument,
        "--privacy-doc",
        paths.privacyDocument,
        "--json",
        "--apply",
        "--expect-plan-id",
        planId,
      ],
      stopRules: [
        "This plan and PLAN_ID are local-only commitments to private closure evidence; do not publish or commit them.",
        "This transition records no human review and consumes only an already-ready local closure packet.",
        "This transition does not enable liveMode or close external payment, fiscal, privacy, legal, or launch gates.",
        "Rerun the plan after any closure packet, reviewed document, public config, or public receipt change.",
      ],
    };
    return {
      plan,
      candidateConfig: replacement.contents,
      candidateReceipt: stagedReceiptContents,
      sourceHashes: new Map(snapshotHashParts(snapshot)),
      configWillChange,
      receiptWillChange,
    };
  } finally {
    fs.rmSync(snapshotPaths.directory, { recursive: true, force: true });
  }
}

function acquireLocks(lockPaths) {
  const descriptors = [];
  for (const lockPath of [...lockPaths].sort()) {
    try {
      const descriptor = fs.openSync(lockPath, "wx", 0o600);
      descriptors.push({ descriptor, lockPath });
    } catch (error) {
      for (const acquired of descriptors.reverse()) {
        fs.closeSync(acquired.descriptor);
        fs.rmSync(acquired.lockPath, { force: true });
      }
      if (error && error.code === "EEXIST") fail(`transition lock already exists: ${lockPath}`);
      fail(`could not acquire transition lock ${lockPath}: ${error.message}`);
    }
  }
  return () => {
    for (const acquired of descriptors.reverse()) {
      try {
        fs.closeSync(acquired.descriptor);
      } finally {
        fs.rmSync(acquired.lockPath, { force: true });
      }
    }
  };
}

function assertCas(paths, expectedHashes) {
  const current = snapshotInputs(paths);
  const currentHashes = new Map(snapshotHashParts(current));
  for (const [label, expected] of expectedHashes) {
    if (currentHashes.get(label) !== expected) {
      fail(`input changed after planning (${label}); no files were written.`);
    }
  }
}

function validateApplied(paths) {
  const finalSnapshot = snapshotInputs(paths);
  const snapshotPaths = materializeSnapshot(finalSnapshot);
  try {
    validateClosure(snapshotPaths, snapshotPaths.currentConfigPath);
    requireReceiptMatches(
      snapshotPaths,
      snapshotPaths.currentConfigPath,
      snapshotPaths.currentReceiptPath,
      "applied receipt validation"
    );
  } finally {
    fs.rmSync(snapshotPaths.directory, { recursive: true, force: true });
  }
}

function assertAppliedBytes(paths, built) {
  const finalConfig = readRequired(paths.publicConfig, "applied public config");
  const finalReceipt = readRequired(paths.publicReceipt, "applied public receipt");
  if (!finalConfig.equals(built.candidateConfig)) {
    fail("applied public config does not match the reviewed candidate bytes.");
  }
  if (!finalReceipt.equals(built.candidateReceipt)) {
    fail("applied public receipt does not match the reviewed fail-closed candidate bytes.");
  }
}

function applyPlan(built, paths, expectedPlanId) {
  if (built.plan.planId !== expectedPlanId) {
    fail("expected plan ID does not match the current packet, documents, config, and receipt; rerun the plan.");
  }
  const noOp = !built.plan.wouldApply;
  const interruptAfterReceipt = process.env.STRANGE_COMPANY_TEST_BINDER_INTERRUPT_AFTER_RECEIPT === "1";
  if (interruptAfterReceipt && process.env.NODE_ENV !== "test") {
    fail("STRANGE_COMPANY_TEST_BINDER_INTERRUPT_AFTER_RECEIPT is allowed only with NODE_ENV=test.");
  }
  const release = acquireLocks([
    `${paths.publicConfig}.live-review-bind.lock`,
    `${paths.publicReceipt}.lock`,
  ]);
  try {
    assertCas(paths, built.sourceHashes);
    if (!noOp && built.receiptWillChange) atomicReplace(paths.publicReceipt, built.candidateReceipt);
    if (!noOp && interruptAfterReceipt) {
      fail("simulated interruption after fail-closed receipt replacement.");
    }
    if (!noOp && built.configWillChange) atomicReplace(paths.publicConfig, built.candidateConfig);
    assertAppliedBytes(paths, built);
    validateApplied(paths);
  } finally {
    release();
  }
  return { ...built.plan, applied: !noOp, noOp };
}

function printText(report) {
  console.log(report.system);
  console.log(`Plan ID: ${report.planId}`);
  console.log(`Transition: ${report.transition}`);
  console.log(`Would apply: ${report.wouldApply}`);
  if (Object.prototype.hasOwnProperty.call(report, "applied")) {
    console.log(`Applied: ${report.applied}`);
  }
  console.log(`liveMode remains false: ${report.liveModeRemainsFalse}`);
  console.log("Changes:");
  for (const change of report.changes) {
    console.log(`- ${change.field}: ${JSON.stringify(change.from)} -> ${JSON.stringify(change.to)}`);
  }
  console.log(`Receipt generation: ${report.receiptGenerationBefore} -> ${report.receiptGenerationAfter}`);
  if (!Object.prototype.hasOwnProperty.call(report, "applied") && report.wouldApply) {
    console.log("Apply only after reviewing this exact plan; execute these arguments without editing them:");
    console.log(JSON.stringify(report.applyArguments));
  }
}

let snapshot;
try {
  const parsed = parseArguments(args);
  const documentRoot = resolveValue(parsed, "--document-root", root);
  const paths = {
    closure: resolveValue(parsed, "--live-review-closure", path.join(root, "LIVE_REVIEW_CLOSURE.local.json")),
    publicConfig: resolveValue(parsed, "--public-config", path.join(root, "public-config.js")),
    publicReceipt: resolveValue(parsed, "--public-receipt", path.join(root, "public-live-receipt.js")),
    documentRoot,
    termsDocument: resolveValue(parsed, "--terms-doc", path.join(documentRoot, "TERMOS.md")),
    privacyDocument: resolveValue(parsed, "--privacy-doc", path.join(documentRoot, "AVISO_DE_PRIVACIDADE.md")),
  };
  snapshot = snapshotInputs(paths);
  const built = buildPlan(snapshot, paths);
  const report = parsed.flags.has("--apply")
    ? applyPlan(built, paths, parsed.values.get("--expect-plan-id"))
    : built.plan;
  if (parsed.flags.has("--json")) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    printText(report);
  }
} catch (error) {
  console.error(`Live review closure bind failed:\n- ${error.message}`);
  process.exitCode = 1;
}
