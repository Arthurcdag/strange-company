const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const asJson = args.includes("--json");
const checkPublicJs = args.includes("--check-public-js");
const requireIssued = args.includes("--require-issued");
const revoke = args.includes("--revoke");

const ACTIVE_STATUS = "local_packet_validators_passed";
const PLACEHOLDER_STATUS = "not_issued";
const RECEIPT_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const LEGAL_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_LEGAL_DOCUMENT_V1";
const REVIEW_FIELDS = [
  "termsReviewedAt",
  "privacyReviewedAt",
  "brazilComplianceReviewedAt",
  "aiHandoffReviewedAt",
];

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? String(args[index + 1]) : "";
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
  path.join(root, "TERMOS.md")
);
const privacyDocumentPath = firstArgValue(
  ["--privacy-doc"],
  path.join(root, "AVISO_DE_PRIVACIDADE.md")
);
const LEGAL_DOCUMENT_SPECS = [
  { key: "terms", publicPath: "TERMOS.md", filePath: termsDocumentPath },
  { key: "privacy", publicPath: "AVISO_DE_PRIVACIDADE.md", filePath: privacyDocumentPath },
];

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

function loadPublicConfig(filePath) {
  try {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox, { filename: filePath });
    if (!isPlainObject(sandbox.window.PUBLIC_ORDER_CONFIG)) {
      fail(`${filePath} must assign window.PUBLIC_ORDER_CONFIG.`);
    }
    return sandbox.window.PUBLIC_ORDER_CONFIG;
  } catch (error) {
    fail(`Could not load public config ${filePath}: ${error.message}`);
  }
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

function normalizeLegalDocumentText(value) {
  return String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function legalDocumentDigest(publicPath, contents) {
  return crypto
    .createHash("sha256")
    .update(
      `${LEGAL_DOCUMENT_DIGEST_DOMAIN}\npath=${publicPath}\n${normalizeLegalDocumentText(contents)}`,
      "utf8"
    )
    .digest("hex");
}

function buildLegalDocumentCore() {
  return LEGAL_DOCUMENT_SPECS.reduce((documents, spec) => {
    let contents;
    try {
      contents = fs.readFileSync(spec.filePath, "utf8");
    } catch (error) {
      fail(`Could not read public legal document ${spec.publicPath}: ${error.message}`);
    }
    documents[spec.key] = {
      path: spec.publicPath,
      sha256: legalDocumentDigest(spec.publicPath, contents),
    };
    return documents;
  }, {});
}

function buildPublicCore(config) {
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
    legalDocuments: buildLegalDocumentCore(),
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
    .update(`STRANGE_COMPANY_PUBLIC_LIVE_CORE_V1\n${JSON.stringify(digestableCore(core))}`, "utf8")
    .digest("hex");
}

function digestableEnvelope(receipt) {
  return canonicalize({
    schemaVersion: receipt.schemaVersion,
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
      `STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V2\n${JSON.stringify(digestableEnvelope(receipt))}`,
      "utf8"
    )
    .digest("hex");
}

function sameDigestableCore(left, right) {
  return JSON.stringify(digestableCore(left)) === JSON.stringify(digestableCore(right));
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

function buildReceipt(core) {
  const issuedAt = new Date();
  const receipt = {
    schemaVersion: 2,
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
  return { ...receipt, envelopeSha256: envelopeDigest(receipt) };
}

function buildPlaceholder(core) {
  return {
    schemaVersion: 2,
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
}

function renderPublicJavaScript(receipt) {
  return `window.PUBLIC_LIVE_RECEIPT = Object.freeze(${JSON.stringify(receipt, null, 2)});\n`;
}

function loadPublicReceipt(filePath) {
  try {
    const sandbox = { window: {}, Object };
    vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox, { filename: filePath });
    return sandbox.window.PUBLIC_LIVE_RECEIPT;
  } catch (error) {
    fail(`Could not load public live receipt ${filePath}: ${error.message}`);
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
      "legalDocuments",
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
  assertExactKeys(core.legalDocuments, ["terms", "privacy"], "receipt.core.legalDocuments");
  for (const spec of LEGAL_DOCUMENT_SPECS) {
    const document = core.legalDocuments[spec.key];
    assertExactKeys(document, ["path", "sha256"], `receipt.core.legalDocuments.${spec.key}`);
    if (document.path !== spec.publicPath) {
      fail(`receipt.core.legalDocuments.${spec.key}.path must be ${spec.publicPath}.`);
    }
    if (!/^[a-f0-9]{64}$/.test(String(document.sha256 || ""))) {
      fail(`receipt.core.legalDocuments.${spec.key}.sha256 must be a lowercase SHA-256 hex digest.`);
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
  if (receipt.schemaVersion !== 2) fail("public live receipt schemaVersion must be 2.");
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
  fs.writeFileSync(filePath, contents, "utf8");
}

try {
  if (revoke && checkPublicJs) {
    fail("--revoke cannot be combined with --check-public-js.");
  }
  if (revoke && requireIssued) {
    fail("--revoke cannot be combined with --require-issued.");
  }
  const currentCore = buildPublicCore(loadPublicConfig(publicConfigPath));

  if (checkPublicJs) {
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
    process.exit(0);
  }

  if (revoke) {
    if (currentCore.flags.liveMode !== false) {
      fail("Refusing to revoke the public live receipt until public-config.js liveMode is false.");
    }
    const receipt = buildPlaceholder(currentCore);
    validateReceipt(receipt, currentCore);
    writeReceipt(outputPath, receipt, true);
    if (asJson) {
      process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    } else {
      console.log(`Public live receipt revoked to a fail-closed placeholder: ${outputPath}`);
    }
    process.exit(0);
  }

  if (currentCore.flags.liveMode !== false) {
    fail("Refusing to issue a live receipt after public-config.js liveMode has been enabled; issue it while liveMode is false, then perform the human flip.");
  }
  requireReadyCore(currentCore);
  runValidator(
    "LIVE_REVIEW_CLOSURE",
    "validate_live_review_closure.js",
    liveReviewClosurePath,
    [
      "--require-ready",
      "--terms-doc",
      termsDocumentPath,
      "--privacy-doc",
      privacyDocumentPath,
      "--public-config",
      publicConfigPath,
    ]
  );
  runValidator(
    "EXTERNAL_LIVE_PACKET",
    "validate_external_live_packet.js",
    externalPacketPath,
    ["--require-live", "--public-config", publicConfigPath]
  );
  runValidator(
    "REVENUE_SETUP_EVIDENCE_INDEX",
    "validate_revenue_setup_evidence_index.js",
    revenueIndexPath,
    ["--require-all", "--public-config", publicConfigPath]
  );
  runValidator(
    "REVIEWER_CANDIDATE_TRACKER",
    "validate_reviewer_candidate_tracker.js",
    reviewerTrackerPath,
    ["--require-ready"]
  );
  runValidator(
    "DELIVERY_REVIEW_CHECKLIST",
    "validate_delivery_review_checklist.js",
    deliveryReviewChecklistPath,
    ["--require-ready"]
  );
  const receipt = buildReceipt(currentCore);
  if (outputPath) writeReceipt(outputPath, receipt);
  if (asJson) {
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } else {
    console.log(`Public live receipt written: ${outputPath}`);
  }
} catch (error) {
  console.error(`Public live receipt export failed: ${error.message}`);
  process.exit(1);
}
