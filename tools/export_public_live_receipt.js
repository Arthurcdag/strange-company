const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  parseFrozenWindowJson,
  parsePublicOrderConfig,
  parseStrictJson,
} = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

const BOOLEAN_OPTIONS = new Set([
  "--force",
  "--json",
  "--check-public-js",
  "--require-issued",
  "--revoke",
]);
const VALUE_OPTION_GROUPS = Object.freeze([
  ["--public-config"],
  ["--document-root"],
  ["--external-live-packet", "--external-packet"],
  ["--revenue-index", "--revenue-evidence-index"],
  ["--reviewer-tracker", "--reviewer-candidate-tracker"],
  ["--delivery-review-checklist", "--delivery-checklist"],
  ["--live-review-closure"],
  ["--output"],
  ["--public-js"],
  ["--terms-doc"],
  ["--privacy-doc"],
]);
const VALUE_OPTIONS = new Set(VALUE_OPTION_GROUPS.flat());

function parseArguments(rawArgs) {
  const flags = new Set();
  const values = new Map();
  for (let index = 0; index < rawArgs.length; index += 1) {
    const option = String(rawArgs[index]);
    if (!option.startsWith("--")) {
      throw new Error(`unexpected positional argument: ${option}`);
    }
    if (BOOLEAN_OPTIONS.has(option)) {
      if (flags.has(option)) throw new Error(`duplicate option: ${option}`);
      flags.add(option);
      continue;
    }
    if (!VALUE_OPTIONS.has(option)) {
      throw new Error(`unknown option: ${option}`);
    }
    if (values.has(option)) throw new Error(`duplicate option: ${option}`);
    const value = rawArgs[index + 1];
    if (
      value === undefined
      || String(value).trim() === ""
      || String(value).startsWith("--")
    ) {
      throw new Error(`${option} requires a non-option value.`);
    }
    values.set(option, String(value));
    index += 1;
  }
  for (const aliases of VALUE_OPTION_GROUPS) {
    const supplied = aliases.filter((option) => values.has(option));
    if (supplied.length > 1) {
      throw new Error(`duplicate aliases are not allowed: ${supplied.join(", ")}`);
    }
  }
  return { flags, values };
}

let parsedArgs;
try {
  parsedArgs = parseArguments(args);
} catch (error) {
  console.error(`Public live receipt export failed: ${error.message}`);
  process.exit(1);
}

const force = parsedArgs.flags.has("--force");
const asJson = parsedArgs.flags.has("--json");
const checkPublicJs = parsedArgs.flags.has("--check-public-js");
const requireIssued = parsedArgs.flags.has("--require-issued");
const revoke = parsedArgs.flags.has("--revoke");

const ACTIVE_STATUS = "local_packet_validators_passed";
const PLACEHOLDER_STATUS = "not_issued";
const RECEIPT_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_PUBLIC_ASSET_TEXT_LENGTH = 1000000;
const PUBLIC_REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1";
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
const REVIEW_FIELDS = [
  "termsReviewedAt",
  "privacyReviewedAt",
  "brazilComplianceReviewedAt",
  "aiHandoffReviewedAt",
];

function argValue(name) {
  return parsedArgs.values.get(name) || "";
}

function firstArgValue(names, fallback) {
  for (const name of names) {
    const value = argValue(name);
    if (value) return path.resolve(process.cwd(), value);
  }
  return fallback;
}

const publicConfigPath = firstArgValue(
  ["--public-config"],
  path.join(root, "public-config.js")
);
const documentRootPath = firstArgValue(
  ["--document-root"],
  root
);
const externalPacketPath = firstArgValue(
  ["--external-live-packet", "--external-packet"],
  path.join(root, "EXTERNAL_LIVE_PACKET.local.json")
);
const revenueIndexPath = firstArgValue(
  ["--revenue-index", "--revenue-evidence-index"],
  path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.local.json")
);
const reviewerTrackerPath = firstArgValue(
  ["--reviewer-tracker", "--reviewer-candidate-tracker"],
  path.join(root, "REVIEWER_CANDIDATE_TRACKER.local.json")
);
const deliveryReviewChecklistPath = firstArgValue(
  ["--delivery-review-checklist", "--delivery-checklist"],
  path.join(root, "DELIVERY_REVIEW_CHECKLIST.local.json")
);
const liveReviewClosurePath = firstArgValue(
  ["--live-review-closure"],
  path.join(root, "LIVE_REVIEW_CLOSURE.local.json")
);
const outputArg = argValue("--output");
const outputPath = outputArg
  ? path.resolve(process.cwd(), outputArg)
  : asJson && !revoke
    ? ""
    : path.join(root, "public-live-receipt.js");
const publicJsPath = firstArgValue(
  ["--public-js"],
  path.join(root, "public-live-receipt.js")
);
const termsDocumentPath = firstArgValue(
  ["--terms-doc"],
  path.join(documentRootPath, "TERMOS.md")
);
const privacyDocumentPath = firstArgValue(
  ["--privacy-doc"],
  path.join(documentRootPath, "AVISO_DE_PRIVACIDADE.md")
);
const REVIEW_DOCUMENT_SPECS = REVIEW_DOCUMENT_PATHS.map((publicPath) => ({
  publicPath,
  filePath: publicPath === "TERMOS.md"
    ? termsDocumentPath
    : publicPath === "AVISO_DE_PRIVACIDADE.md"
      ? privacyDocumentPath
      : path.join(documentRootPath, publicPath),
}));

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertExactKeys(value, expected, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object.`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(`${label} must contain only: ${wanted.join(", ")}.`);
  }
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalText(value, label) {
  if (typeof value !== "string") {
    fail(`${label} must be a string.`);
  }
  return value.trim();
}

function requireBoolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be true/false.`);
  return value;
}

function requirePositiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    fail(`${label} must be a positive safe integer.`);
  }
  return value;
}

function requireIsoDate(value, label, { allowFuture = false } = {}) {
  const text = requireText(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) fail(`${label} must be YYYY-MM-DD.`);
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || !parsed.toISOString().startsWith(text)) {
    fail(`${label} must be a real calendar date.`);
  }
  const todayUtc = new Date().toISOString().slice(0, 10);
  if (!allowFuture && text > todayUtc) {
    fail(`${label} must not be in the future.`);
  }
  return text;
}

function requireIsoTimestamp(value, label) {
  const text = requireText(value, label);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== text) {
    fail(`${label} must be an ISO-8601 UTC timestamp.`);
  }
  return text;
}

function enforcePublicAssetTextLength(source, label) {
  if (source.length > MAX_PUBLIC_ASSET_TEXT_LENGTH) {
    fail(`${label} exceeds ${MAX_PUBLIC_ASSET_TEXT_LENGTH} decoded text code units.`);
  }
  return source;
}

function readPublicAssetText(filePath, label) {
  try {
    return enforcePublicAssetTextLength(fs.readFileSync(filePath, "utf8"), label);
  } catch (error) {
    fail(`Could not read ${label} ${filePath}: ${error.message}`);
  }
}

function loadPublicConfigSource(source, filePath) {
  try {
    return parsePublicOrderConfig(source, filePath);
  } catch (error) {
    fail(`Could not load public config ${filePath}: ${error.message}`);
  }
}

function loadPublicConfig(filePath) {
  return loadPublicConfigSource(
    readPublicAssetText(filePath, "public config"),
    filePath
  );
}

function normalizeServices(services) {
  if (!Array.isArray(services) || services.length === 0) {
    fail("public config services must be a non-empty array.");
  }
  return services.map((service, index) => {
    if (!isPlainObject(service)) fail(`services[${index}] must be an object.`);
    const price = Number(service.price);
    if (!Number.isFinite(price) || price < 0) {
      fail(`services[${index}].price must be a non-negative number.`);
    }
    return {
      id: requireText(service.id, `services[${index}].id`),
      title: requireText(service.title, `services[${index}].title`),
      detail: requireText(service.detail, `services[${index}].detail`),
      price,
    };
  });
}

function normalizeReviewDocumentText(value) {
  return String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function reviewDocumentDigest(publicPath, contents) {
  return crypto
    .createHash("sha256")
    .update(
      `${PUBLIC_REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath=${publicPath}\n${normalizeReviewDocumentText(contents)}`,
      "utf8"
    )
    .digest("hex");
}

function readReviewDocumentContents() {
  return REVIEW_DOCUMENT_SPECS.reduce((documents, spec) => {
    documents[spec.publicPath] = readPublicAssetText(
      spec.filePath,
      `public review document ${spec.publicPath}`
    );
    return documents;
  }, {});
}

function buildReviewDocumentCore(documentContents = readReviewDocumentContents()) {
  return REVIEW_DOCUMENT_PATHS.reduce((documents, publicPath) => {
    const contents = documentContents[publicPath];
    if (typeof contents !== "string") {
      fail(`public review document snapshot is missing ${publicPath}.`);
    }
    documents[publicPath] = reviewDocumentDigest(publicPath, contents);
    return documents;
  }, {});
}

function buildPublicCore(config, documentContents = readReviewDocumentContents()) {
  const supportEmail = requireText(config.supportEmail, "supportEmail");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail)) {
    fail("supportEmail must be a valid public support email.");
  }
  const formUrl = optionalText(config.googleFormUrl, "googleFormUrl");
  if (formUrl && !/^https:\/\/docs\.google\.com\/forms\//.test(formUrl)) {
    fail("googleFormUrl must be blank or an HTTPS Google Form URL.");
  }
  const reviewDates = {};
  for (const field of REVIEW_FIELDS) {
    reviewDates[field] = config[field] === ""
      ? ""
      : requireIsoDate(config[field], field, { allowFuture: true });
  }
  const supportVerified = requireBoolean(config.supportInboxVerified, "supportInboxVerified");
  const formVerified = requireBoolean(config.googleFormVerified, "googleFormVerified");
  const liveMode = requireBoolean(config.liveMode, "liveMode");
  return {
    operatorName: requireText(config.operatorName, "operatorName"),
    jurisdiction: requireText(config.jurisdiction, "jurisdiction"),
    complianceMode: requireText(config.complianceMode, "complianceMode"),
    aiGeneratedLegalDocsRequireHumanReview: requireBoolean(
      config.aiGeneratedLegalDocsRequireHumanReview,
      "aiGeneratedLegalDocsRequireHumanReview"
    ),
    support: {
      email: supportEmail,
      verified: supportVerified,
    },
    form: {
      url: formUrl,
      verified: formVerified,
    },
    flags: {
      supportInboxVerified: supportVerified,
      googleFormVerified: formVerified,
      liveMode,
    },
    reviewDates,
    reviewDocuments: buildReviewDocumentCore(documentContents),
    services: normalizeServices(config.services),
  };
}

function requireReadyCore(core) {
  if (core.jurisdiction !== "BR") fail("jurisdiction must be BR before receipt issuance.");
  if (core.aiGeneratedLegalDocsRequireHumanReview !== true) {
    fail("AI-generated legal documents must require human review before receipt issuance.");
  }
  if (core.support.verified !== true || core.form.verified !== true) {
    fail("support inbox and Google Form must be verified before receipt issuance.");
  }
  const formUrl = requireText(core.form.url, "receipt.core.form.url");
  if (!/^https:\/\/docs\.google\.com\/forms\//.test(formUrl)) {
    fail("receipt.core.form.url must be an HTTPS Google Form URL before receipt issuance.");
  }
  for (const field of REVIEW_FIELDS) {
    requireIsoDate(core.reviewDates[field], `receipt.core.reviewDates.${field}`);
  }
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainObject(value)) return value;
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {});
}

function digestableCore(core) {
  const copy = JSON.parse(JSON.stringify(core));
  if (isPlainObject(copy.flags)) delete copy.flags.liveMode;
  return canonicalize(copy);
}

function coreDigest(core) {
  return crypto
    .createHash("sha256")
    .update(`STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2\n${JSON.stringify(digestableCore(core))}`, "utf8")
    .digest("hex");
}

function digestableEnvelope(receipt) {
  return canonicalize({
    schemaVersion: receipt.schemaVersion,
    generation: receipt.generation,
    mode: receipt.mode,
    status: receipt.status,
    issuedAt: receipt.issuedAt,
    validUntil: receipt.validUntil,
    core: digestableCore(receipt.core),
    coreSha256: receipt.coreSha256,
    attestations: receipt.attestations,
  });
}

function envelopeDigest(receipt) {
  return crypto
    .createHash("sha256")
    .update(
      `STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V4\n${JSON.stringify(digestableEnvelope(receipt))}`,
      "utf8"
    )
    .digest("hex");
}

function sameDigestableCore(left, right) {
  return JSON.stringify(digestableCore(left)) === JSON.stringify(digestableCore(right));
}

function readIssuanceInput(filePath, label, { publicText = false } = {}) {
  if (!fs.existsSync(filePath)) fail(`${label} is missing: ${filePath}`);
  try {
    const contents = fs.readFileSync(filePath);
    if (publicText) {
      enforcePublicAssetTextLength(contents.toString("utf8"), label);
    }
    return { filePath, label, contents };
  } catch (error) {
    fail(`Could not read ${label} ${filePath}: ${error.message}`);
  }
}

function createIssuanceSnapshot() {
  const configInput = readIssuanceInput(publicConfigPath, "public config", {
    publicText: true,
  });
  const closureInput = readIssuanceInput(
    liveReviewClosurePath,
    "LIVE_REVIEW_CLOSURE"
  );
  const documentInputs = REVIEW_DOCUMENT_SPECS.map((spec) => ({
    ...readIssuanceInput(
      spec.filePath,
      `public review document ${spec.publicPath}`,
      { publicText: true }
    ),
    publicPath: spec.publicPath,
  }));
  const externalInput = readIssuanceInput(
    externalPacketPath,
    "EXTERNAL_LIVE_PACKET"
  );
  const revenueInput = readIssuanceInput(
    revenueIndexPath,
    "REVENUE_SETUP_EVIDENCE_INDEX"
  );
  const reviewerInput = readIssuanceInput(
    reviewerTrackerPath,
    "REVIEWER_CANDIDATE_TRACKER"
  );
  const deliveryInput = readIssuanceInput(
    deliveryReviewChecklistPath,
    "DELIVERY_REVIEW_CHECKLIST"
  );
  const inputs = [
    configInput,
    closureInput,
    ...documentInputs,
    externalInput,
    revenueInput,
    reviewerInput,
    deliveryInput,
  ];
  const configSource = configInput.contents.toString("utf8");
  const documentContents = Object.fromEntries(
    documentInputs.map((input) => [
      input.publicPath,
      input.contents.toString("utf8"),
    ])
  );
  const snapshotDir = fs.mkdtempSync(path.join(os.tmpdir(), "strange-company-live-receipt-"));
  try {
    try {
      fs.chmodSync(snapshotDir, 0o700);
    } catch (_error) {
      // Windows may not expose POSIX permissions; the unique temp directory is still private to this run.
    }
    const snapshotConfigPath = path.join(snapshotDir, "public-config.js");
    const snapshotClosurePath = path.join(snapshotDir, "LIVE_REVIEW_CLOSURE.local.json");
    const snapshotExternalPath = path.join(snapshotDir, "EXTERNAL_LIVE_PACKET.local.json");
    const snapshotRevenuePath = path.join(snapshotDir, "REVENUE_SETUP_EVIDENCE_INDEX.local.json");
    const snapshotReviewerPath = path.join(snapshotDir, "REVIEWER_CANDIDATE_TRACKER.local.json");
    const snapshotDeliveryPath = path.join(snapshotDir, "DELIVERY_REVIEW_CHECKLIST.local.json");
    fs.writeFileSync(snapshotConfigPath, configInput.contents);
    fs.writeFileSync(snapshotClosurePath, closureInput.contents);
    for (const input of documentInputs) {
      fs.writeFileSync(path.join(snapshotDir, input.publicPath), input.contents);
    }
    fs.writeFileSync(snapshotExternalPath, externalInput.contents);
    fs.writeFileSync(snapshotRevenuePath, revenueInput.contents);
    fs.writeFileSync(snapshotReviewerPath, reviewerInput.contents);
    fs.writeFileSync(snapshotDeliveryPath, deliveryInput.contents);
    return {
      dir: snapshotDir,
      configPath: snapshotConfigPath,
      configSource,
      closurePath: snapshotClosurePath,
      documentContents,
      externalPath: snapshotExternalPath,
      revenuePath: snapshotRevenuePath,
      reviewerPath: snapshotReviewerPath,
      deliveryPath: snapshotDeliveryPath,
      inputs,
    };
  } catch (error) {
    fs.rmSync(snapshotDir, { recursive: true, force: true });
    throw error;
  }
}

function assertIssuanceInputsMatchSnapshot(snapshot) {
  for (const input of snapshot.inputs) {
    let current;
    try {
      current = fs.readFileSync(input.filePath);
    } catch (error) {
      fail(
        `Issuance input changed during validation (${input.label}); refusing to issue a receipt: ${error.message}`
      );
    }
    if (!current.equals(input.contents)) {
      fail(
        `Issuance input changed during validation (${input.label}); refusing to issue a receipt. Rerun issuance from the current inputs.`
      );
    }
  }
}

function cleanupIssuanceSnapshot(snapshot) {
  if (snapshot && snapshot.dir) {
    fs.rmSync(snapshot.dir, { recursive: true, force: true });
  }
}

function waitAtSnapshotBarrierForTest() {
  const barrierValue = process.env.STRANGE_COMPANY_TEST_RECEIPT_SNAPSHOT_BARRIER;
  if (!barrierValue) return;
  if (process.env.NODE_ENV !== "test") {
    fail("STRANGE_COMPANY_TEST_RECEIPT_SNAPSHOT_BARRIER is allowed only with NODE_ENV=test.");
  }
  const barrier = path.resolve(barrierValue);
  const readyPath = `${barrier}.ready`;
  const releasePath = `${barrier}.release`;
  fs.writeFileSync(readyPath, "snapshot-ready\n", "utf8");
  const deadline = Date.now() + 15000;
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  while (!fs.existsSync(releasePath)) {
    if (Date.now() >= deadline) {
      fail("test receipt snapshot barrier timed out.");
    }
    Atomics.wait(sleeper, 0, 0, 10);
  }
}

function runValidator(label, scriptName, packetPath, validatorArgs) {
  if (!fs.existsSync(packetPath)) fail(`${label} is missing: ${packetPath}`);
  const scriptPath = path.join(root, "tools", scriptName);
  const result = spawnSync(
    process.execPath,
    [scriptPath, packetPath, ...validatorArgs],
    { cwd: root, encoding: "utf8" }
  );
  if (result.error) fail(`${label} validator could not run: ${result.error.message}`);
  if (result.status !== 0) {
    fail(`${label} validator failed; inspect the private packet with its validator before exporting a public receipt.`);
  }
}

function buildReceipt(core, generation) {
  const issuedAt = new Date();
  const receipt = {
    schemaVersion: 4,
    generation: requirePositiveSafeInteger(generation, "receipt.generation"),
    mode: "public",
    status: ACTIVE_STATUS,
    issuedAt: issuedAt.toISOString(),
    validUntil: new Date(issuedAt.valueOf() + RECEIPT_VALIDITY_MS).toISOString(),
    core,
    coreSha256: coreDigest(core),
    attestations: {
      publicOnly: true,
      privatePacketDataExcluded: true,
      privatePacketHashesExcluded: true,
      localPacketValidatorsPassed: true,
      liveReviewClosureValidatorPassed: true,
      reviewerCandidateTrackerReady: true,
      deliveryReviewChecklistReady: true,
      operationalValidatorsPassed: true,
      digestCoversCanonicalPublicCoreExceptLiveMode: true,
      digestCoversReceiptEnvelopeExceptLiveMode: true,
    },
  };
  const completeReceipt = { ...receipt, envelopeSha256: envelopeDigest(receipt) };
  enforcePublicAssetTextLength(
    renderPublicJavaScript(completeReceipt),
    "rendered public live receipt"
  );
  return completeReceipt;
}

function buildPlaceholder(core, generation) {
  const receipt = {
    schemaVersion: 4,
    generation: requirePositiveSafeInteger(generation, "receipt.generation"),
    mode: "public",
    status: PLACEHOLDER_STATUS,
    issuedAt: "",
    validUntil: "",
    core,
    coreSha256: "",
    attestations: {
      publicOnly: true,
      privatePacketDataExcluded: true,
      privatePacketHashesExcluded: true,
      localPacketValidatorsPassed: false,
      liveReviewClosureValidatorPassed: false,
      reviewerCandidateTrackerReady: false,
      deliveryReviewChecklistReady: false,
      operationalValidatorsPassed: false,
      digestCoversCanonicalPublicCoreExceptLiveMode: true,
      digestCoversReceiptEnvelopeExceptLiveMode: true,
    },
    envelopeSha256: "",
  };
  enforcePublicAssetTextLength(
    renderPublicJavaScript(receipt),
    "rendered public live receipt"
  );
  return receipt;
}

function renderPublicJavaScript(receipt) {
  return `window.PUBLIC_LIVE_RECEIPT = Object.freeze(${JSON.stringify(receipt, null, 2)});\n`;
}

function loadPublicReceipt(filePath) {
  try {
    const source = readPublicAssetText(filePath, "public live receipt");
    if (filePath.toLowerCase().endsWith(".json")) {
      return parseStrictJson(source, filePath);
    }
    return parseFrozenWindowJson(
      source,
      "PUBLIC_LIVE_RECEIPT",
      filePath
    );
  } catch (error) {
    fail(`Could not load public live receipt ${filePath}: ${error.message}`);
  }
}

function captureReceiptOutputBaseline(filePath) {
  if (!filePath) return { tracked: false, exists: false, contents: null };
  try {
    if (!fs.existsSync(filePath)) {
      return { tracked: true, exists: false, contents: null };
    }
    return {
      tracked: true,
      exists: true,
      contents: fs.readFileSync(filePath),
    };
  } catch (error) {
    fail(`Could not capture receipt output baseline ${filePath}: ${error.message}`);
  }
}

function assertReceiptOutputMatchesBaseline(filePath, baseline) {
  if (!baseline.tracked) return;
  let current;
  try {
    if (!fs.existsSync(filePath)) {
      current = { exists: false, contents: null };
    } else {
      current = { exists: true, contents: fs.readFileSync(filePath) };
    }
  } catch (error) {
    fail(`Could not recheck receipt output ${filePath}: ${error.message}`);
  }
  const unchanged = current.exists === baseline.exists
    && (!current.exists || current.contents.equals(baseline.contents));
  if (!unchanged) {
    fail(
      "Receipt output changed during issuance validation; refusing to overwrite a newer issue or revocation. Rerun issuance from the current receipt state."
    );
  }
}

function nextReceiptGeneration(
  filePath,
  { allowLegacyActiveMigration = false } = {}
) {
  if (!filePath || !fs.existsSync(filePath)) return 1;
  const existing = loadPublicReceipt(filePath);
  let currentGeneration;
  if (isPlainObject(existing) && existing.schemaVersion === 4) {
    currentGeneration = requirePositiveSafeInteger(
      existing.generation,
      "existing receipt.generation"
    );
  } else if (
    isPlainObject(existing)
    && existing.schemaVersion === 3
    && !Object.prototype.hasOwnProperty.call(existing, "generation")
    && existing.mode === "public"
    && existing.status === PLACEHOLDER_STATUS
    && existing.issuedAt === ""
    && existing.validUntil === ""
    && existing.coreSha256 === ""
    && existing.envelopeSha256 === ""
  ) {
    // One-time migration for the tracked schema-v3 fail-closed placeholder.
    currentGeneration = 0;
  } else if (
    allowLegacyActiveMigration
    && isPlainObject(existing)
    && existing.schemaVersion === 3
    && !Object.prototype.hasOwnProperty.call(existing, "generation")
    && existing.mode === "public"
    && existing.status === ACTIVE_STATUS
  ) {
    // Emergency fail-close migration: a legacy active lease has no generation,
    // so revocation advances it from the migration base 0 to generation 1.
    currentGeneration = 0;
  } else {
    fail(
      "Existing receipt output must be schema v4, or the schema-v3 not_issued placeholder used for migration."
    );
  }
  if (currentGeneration >= Number.MAX_SAFE_INTEGER) {
    fail("Existing receipt generation cannot be incremented safely.");
  }
  return currentGeneration + 1;
}

function withReceiptMutationLock(filePath, operation) {
  if (!filePath) return operation();
  const lockPath = `${filePath}.lock`;
  let descriptor;
  try {
    descriptor = fs.openSync(lockPath, "wx", 0o600);
  } catch (error) {
    if (error && error.code === "EEXIST") {
      fail(`Receipt mutation lock already exists: ${lockPath}`);
    }
    fail(`Could not acquire receipt mutation lock ${lockPath}: ${error.message}`);
  }
  try {
    return operation();
  } finally {
    try {
      fs.closeSync(descriptor);
    } finally {
      fs.rmSync(lockPath, { force: true });
    }
  }
}

function validateCoreShape(core) {
  assertExactKeys(
    core,
    [
      "operatorName",
      "jurisdiction",
      "complianceMode",
      "aiGeneratedLegalDocsRequireHumanReview",
      "support",
      "form",
      "flags",
      "reviewDates",
      "reviewDocuments",
      "services",
    ],
    "receipt.core"
  );
  requireText(core.operatorName, "receipt.core.operatorName");
  requireText(core.jurisdiction, "receipt.core.jurisdiction");
  requireText(core.complianceMode, "receipt.core.complianceMode");
  requireBoolean(
    core.aiGeneratedLegalDocsRequireHumanReview,
    "receipt.core.aiGeneratedLegalDocsRequireHumanReview"
  );
  assertExactKeys(core.support, ["email", "verified"], "receipt.core.support");
  requireText(core.support.email, "receipt.core.support.email");
  requireBoolean(core.support.verified, "receipt.core.support.verified");
  assertExactKeys(core.form, ["url", "verified"], "receipt.core.form");
  optionalText(core.form.url, "receipt.core.form.url");
  requireBoolean(core.form.verified, "receipt.core.form.verified");
  assertExactKeys(
    core.flags,
    ["supportInboxVerified", "googleFormVerified", "liveMode"],
    "receipt.core.flags"
  );
  requireBoolean(core.flags.supportInboxVerified, "receipt.core.flags.supportInboxVerified");
  requireBoolean(core.flags.googleFormVerified, "receipt.core.flags.googleFormVerified");
  requireBoolean(core.flags.liveMode, "receipt.core.flags.liveMode");
  assertExactKeys(core.reviewDates, REVIEW_FIELDS, "receipt.core.reviewDates");
  for (const field of REVIEW_FIELDS) {
    const value = core.reviewDates[field];
    if (value !== "") {
      requireIsoDate(value, `receipt.core.reviewDates.${field}`, { allowFuture: true });
    }
  }
  assertExactKeys(core.reviewDocuments, REVIEW_DOCUMENT_PATHS, "receipt.core.reviewDocuments");
  for (const documentPath of REVIEW_DOCUMENT_PATHS) {
    if (!/^[a-f0-9]{64}$/.test(String(core.reviewDocuments[documentPath] || ""))) {
      fail(`receipt.core.reviewDocuments.${documentPath} must be a lowercase SHA-256 hex digest.`);
    }
  }
  if (!Array.isArray(core.services) || core.services.length === 0) {
    fail("receipt.core.services must be a non-empty array.");
  }
  core.services.forEach((service, index) => {
    assertExactKeys(service, ["id", "title", "detail", "price"], `receipt.core.services[${index}]`);
    requireText(service.id, `receipt.core.services[${index}].id`);
    requireText(service.title, `receipt.core.services[${index}].title`);
    requireText(service.detail, `receipt.core.services[${index}].detail`);
    if (typeof service.price !== "number" || !Number.isFinite(service.price) || service.price < 0) {
      fail(`receipt.core.services[${index}].price must be a non-negative number.`);
    }
  });
}

function validateReceipt(receipt, currentCore) {
  assertExactKeys(
    receipt,
    [
      "schemaVersion",
      "generation",
      "mode",
      "status",
      "issuedAt",
      "validUntil",
      "core",
      "coreSha256",
      "attestations",
      "envelopeSha256",
    ],
    "public live receipt"
  );
  if (receipt.schemaVersion !== 4) fail("public live receipt schemaVersion must be 4.");
  requirePositiveSafeInteger(receipt.generation, "receipt.generation");
  if (receipt.mode !== "public") fail("public live receipt mode must be public.");
  if (![PLACEHOLDER_STATUS, ACTIVE_STATUS].includes(receipt.status)) {
    fail(`public live receipt status must be ${PLACEHOLDER_STATUS} or ${ACTIVE_STATUS}.`);
  }
  validateCoreShape(receipt.core);
  assertExactKeys(
    receipt.attestations,
    [
      "publicOnly",
      "privatePacketDataExcluded",
      "privatePacketHashesExcluded",
      "localPacketValidatorsPassed",
      "liveReviewClosureValidatorPassed",
      "reviewerCandidateTrackerReady",
      "deliveryReviewChecklistReady",
      "operationalValidatorsPassed",
      "digestCoversCanonicalPublicCoreExceptLiveMode",
      "digestCoversReceiptEnvelopeExceptLiveMode",
    ],
    "receipt.attestations"
  );
  for (const field of [
    "publicOnly",
    "privatePacketDataExcluded",
    "privatePacketHashesExcluded",
    "localPacketValidatorsPassed",
    "liveReviewClosureValidatorPassed",
    "reviewerCandidateTrackerReady",
    "deliveryReviewChecklistReady",
    "operationalValidatorsPassed",
    "digestCoversCanonicalPublicCoreExceptLiveMode",
    "digestCoversReceiptEnvelopeExceptLiveMode",
  ]) {
    requireBoolean(receipt.attestations[field], `receipt.attestations.${field}`);
  }
  if (
    receipt.attestations.publicOnly !== true ||
    receipt.attestations.privatePacketDataExcluded !== true ||
    receipt.attestations.privatePacketHashesExcluded !== true ||
    receipt.attestations.digestCoversCanonicalPublicCoreExceptLiveMode !== true ||
    receipt.attestations.digestCoversReceiptEnvelopeExceptLiveMode !== true
  ) {
    fail("public live receipt public-safety attestations must be true.");
  }

  if (receipt.status === PLACEHOLDER_STATUS) {
    if (
      receipt.issuedAt !== "" ||
      receipt.validUntil !== "" ||
      receipt.coreSha256 !== "" ||
      receipt.envelopeSha256 !== ""
    ) {
      fail("not_issued placeholder must have blank timestamps and digests.");
    }
    if (
      receipt.attestations.localPacketValidatorsPassed !== false ||
      receipt.attestations.liveReviewClosureValidatorPassed !== false ||
      receipt.attestations.reviewerCandidateTrackerReady !== false ||
      receipt.attestations.deliveryReviewChecklistReady !== false ||
      receipt.attestations.operationalValidatorsPassed !== false
    ) {
      fail("not_issued placeholder must not attest local or operational validation.");
    }
    if (receipt.core.flags.liveMode !== false) {
      fail("not_issued placeholder must keep liveMode false.");
    }
    if (JSON.stringify(canonicalize(receipt.core)) !== JSON.stringify(canonicalize(currentCore))) {
      fail("not_issued placeholder has a stale public core.");
    }
  } else {
    requireReadyCore(receipt.core);
    if (receipt.core.flags.liveMode !== false) {
      fail("issued receipt core must preserve the pre-flip liveMode=false snapshot.");
    }
    const issuedAt = new Date(requireIsoTimestamp(receipt.issuedAt, "receipt.issuedAt"));
    const validUntil = new Date(requireIsoTimestamp(receipt.validUntil, "receipt.validUntil"));
    const now = Date.now();
    if (issuedAt.valueOf() > now + CLOCK_SKEW_MS) {
      fail("receipt.issuedAt must not be in the future.");
    }
    if (validUntil.valueOf() <= now) {
      fail("issued public live receipt has expired; rerun all validators and reissue it.");
    }
    const validityWindow = validUntil.valueOf() - issuedAt.valueOf();
    if (validityWindow <= 0 || validityWindow > RECEIPT_VALIDITY_MS) {
      fail("receipt validity window must be positive and no longer than seven days.");
    }
    if (!/^[a-f0-9]{64}$/.test(receipt.coreSha256)) {
      fail("receipt.coreSha256 must be a lowercase SHA-256 hex digest.");
    }
    if (receipt.coreSha256 !== coreDigest(receipt.core)) {
      fail("receipt.coreSha256 does not match the canonical public core digest.");
    }
    if (!/^[a-f0-9]{64}$/.test(receipt.envelopeSha256)) {
      fail("receipt.envelopeSha256 must be a lowercase SHA-256 hex digest.");
    }
    if (receipt.envelopeSha256 !== envelopeDigest(receipt)) {
      fail("receipt.envelopeSha256 does not match the canonical receipt envelope.");
    }
    if (
      receipt.attestations.localPacketValidatorsPassed !== true ||
      receipt.attestations.liveReviewClosureValidatorPassed !== true ||
      receipt.attestations.reviewerCandidateTrackerReady !== true ||
      receipt.attestations.deliveryReviewChecklistReady !== true ||
      receipt.attestations.operationalValidatorsPassed !== true
    ) {
      fail("issued receipt must attest all local and operational validators passed.");
    }
    if (!sameDigestableCore(receipt.core, currentCore)) {
      fail("issued receipt has a stale public core (liveMode is the only ignored field).");
    }
  }

  if (requireIssued && receipt.status !== ACTIVE_STATUS) {
    fail(`an issued receipt with status ${ACTIVE_STATUS} is required.`);
  }
}

function writeReceipt(filePath, receipt, overwrite = force) {
  if (fs.existsSync(filePath) && !overwrite) {
    fail(`Refusing to overwrite ${filePath}. Pass --force to replace it.`);
  }
  const contents = filePath.toLowerCase().endsWith(".json")
    ? `${JSON.stringify(receipt, null, 2)}\n`
    : renderPublicJavaScript(receipt);
  enforcePublicAssetTextLength(contents, "rendered public live receipt");
  fs.writeFileSync(filePath, contents, "utf8");
}

let issuanceSnapshot = null;
try {
  if (revoke && checkPublicJs) {
    fail("--revoke cannot be combined with --check-public-js.");
  }
  if (revoke && requireIssued) {
    fail("--revoke cannot be combined with --require-issued.");
  }

  if (checkPublicJs) {
    const currentCore = buildPublicCore(loadPublicConfig(publicConfigPath));
    const receipt = loadPublicReceipt(publicJsPath);
    validateReceipt(receipt, currentCore);
    if (asJson) {
      process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    } else {
      console.log(
        receipt.status === ACTIVE_STATUS
          ? "Public live receipt validation passed for an issued receipt."
          : "Public live receipt fail-closed placeholder validation passed."
      );
    }
  } else if (revoke) {
    const currentCore = buildPublicCore(loadPublicConfig(publicConfigPath));
    if (currentCore.flags.liveMode !== false) {
      fail("Refusing to revoke the public live receipt until public-config.js liveMode is false.");
    }
    const receipt = withReceiptMutationLock(outputPath, () => {
      const nextGeneration = nextReceiptGeneration(outputPath, {
        allowLegacyActiveMigration: true,
      });
      const nextReceipt = buildPlaceholder(currentCore, nextGeneration);
      validateReceipt(nextReceipt, currentCore);
      writeReceipt(outputPath, nextReceipt, true);
      return nextReceipt;
    });
    if (asJson) {
      process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    } else {
      console.log(`Public live receipt revoked to a fail-closed placeholder: ${outputPath}`);
    }
  } else {
    const outputBaseline = captureReceiptOutputBaseline(outputPath);
    issuanceSnapshot = createIssuanceSnapshot();
    waitAtSnapshotBarrierForTest();
    const currentCore = buildPublicCore(
      loadPublicConfigSource(issuanceSnapshot.configSource, issuanceSnapshot.configPath),
      issuanceSnapshot.documentContents
    );
    if (currentCore.flags.liveMode !== false) {
      fail("Refusing to issue a live receipt after public-config.js liveMode has been enabled; issue it while liveMode is false, then perform the human flip.");
    }
    requireReadyCore(currentCore);
    runValidator(
      "LIVE_REVIEW_CLOSURE",
      "validate_live_review_closure.js",
      issuanceSnapshot.closurePath,
      [
        "--require-ready",
        "--document-root",
        issuanceSnapshot.dir,
        "--terms-doc",
        path.join(issuanceSnapshot.dir, "TERMOS.md"),
        "--privacy-doc",
        path.join(issuanceSnapshot.dir, "AVISO_DE_PRIVACIDADE.md"),
        "--public-config",
        issuanceSnapshot.configPath,
      ]
    );
    runValidator(
      "EXTERNAL_LIVE_PACKET",
      "validate_external_live_packet.js",
      issuanceSnapshot.externalPath,
      ["--require-live", "--public-config", issuanceSnapshot.configPath]
    );
    runValidator(
      "REVENUE_SETUP_EVIDENCE_INDEX",
      "validate_revenue_setup_evidence_index.js",
      issuanceSnapshot.revenuePath,
      ["--require-all", "--public-config", issuanceSnapshot.configPath]
    );
    runValidator(
      "REVIEWER_CANDIDATE_TRACKER",
      "validate_reviewer_candidate_tracker.js",
      issuanceSnapshot.reviewerPath,
      ["--require-ready"]
    );
    runValidator(
      "DELIVERY_REVIEW_CHECKLIST",
      "validate_delivery_review_checklist.js",
      issuanceSnapshot.deliveryPath,
      ["--require-ready"]
    );
    const receipt = withReceiptMutationLock(outputPath, () => {
      assertReceiptOutputMatchesBaseline(outputPath, outputBaseline);
      assertIssuanceInputsMatchSnapshot(issuanceSnapshot);
      const nextReceipt = buildReceipt(currentCore, nextReceiptGeneration(outputPath));
      if (outputPath) writeReceipt(outputPath, nextReceipt);
      return nextReceipt;
    });
    if (asJson) {
      process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    } else {
      console.log(`Public live receipt written: ${outputPath}`);
    }
  }
} catch (error) {
  console.error(`Public live receipt export failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanupIssuanceSnapshot(issuanceSnapshot);
}
