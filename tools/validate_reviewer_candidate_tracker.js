const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireOne = args.includes("--require-one");
const requireReady = args.includes("--require-ready");
const templateOk = args.includes("--template-ok") || (!requireOne && !requireReady);
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "REVIEWER_CANDIDATE_TRACKER.template.json");

const REQUIRED_READY_REVIEWER_COUNT = 4;
const REQUIRED_READY_ROLES = [
  "terms_consumer_law",
  "privacy_lgpd",
  "tax_nfse_accounting",
  "payment_reconciliation"
];
const ALLOWED_ROLES = new Set([...REQUIRED_READY_ROLES, "delivery_quality"]);
const CONTACT_STATUSES = new Set([
  "not_contacted",
  "contacted",
  "responded",
  "paid_test_ready",
  "declined",
  "unavailable"
]);

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`could not read JSON tracker: ${error.message}`);
    return {};
  }
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isIsoDate(value) {
  if (isBlank(value)) return false;
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(text);
}

function requireText(record, key, label, index) {
  const value = record[key];
  if (isBlank(value)) {
    fail(`candidateRecords[${index}].${key} is required for ${label}.`);
    return "";
  }
  return String(value).trim();
}

function requireTrue(value, label) {
  if (value !== true) {
    fail(`${label} must be true.`);
  }
}

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
    return [];
  }
  return value;
}

function scanForSecrets(value, currentPath = "$") {
  const forbiddenKeyPattern = /(password|secret|private.?key|api.?key|routing.?number|account.?number|card.?number|cvv|cpf|cnpj|tax.?id)/i;
  const forbiddenValuePatterns = [
    /sk_(live|test)_[A-Za-z0-9]/,
    /rk_(live|test)_[A-Za-z0-9]/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/,
    /\b(?:\d[ -]*?){13,19}\b/
  ];

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${currentPath}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenKeyPattern.test(key) && key !== "noSecretsInRepo") {
        fail(`tracker contains forbidden secret-like key ${currentPath}.${key}.`);
      }
      scanForSecrets(child, `${currentPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    for (const pattern of forbiddenValuePatterns) {
      if (pattern.test(value)) {
        fail(`tracker contains forbidden secret-like value at ${currentPath}.`);
      }
    }
  }
}

function validateShape(packet) {
  if (packet.schemaVersion !== 1) {
    fail("schemaVersion must be 1.");
  }
  if (isBlank(packet.mode)) {
    fail("mode is required.");
  }

  const allowedRoles = assertArray(packet.allowedRoles, "allowedRoles");
  const contactStatuses = assertArray(packet.contactStatuses, "contactStatuses");
  const requiredRoles = assertArray(packet.requiredReadyRoles, "requiredReadyRoles");
  assertArray(packet.candidateRecords, "candidateRecords");

  for (const role of REQUIRED_READY_ROLES) {
    if (!allowedRoles.includes(role)) {
      fail(`allowedRoles must include required role ${role}.`);
    }
    if (!requiredRoles.includes(role)) {
      fail(`requiredReadyRoles must include ${role}.`);
    }
  }

  for (const status of ["contacted", "responded", "paid_test_ready", "declined"]) {
    if (!contactStatuses.includes(status)) {
      fail(`contactStatuses must include ${status}.`);
    }
  }

  if (!packet.attestation || typeof packet.attestation !== "object" || Array.isArray(packet.attestation)) {
    fail("attestation must be an object.");
  }
}

function validateCandidateFormats(packet) {
  const records = Array.isArray(packet.candidateRecords) ? packet.candidateRecords : [];
  const seenIds = new Set();

  records.forEach((record, index) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      fail(`candidateRecords[${index}] must be an object.`);
      return;
    }

    if (!isBlank(record.candidateId)) {
      const candidateId = String(record.candidateId).trim();
      if (seenIds.has(candidateId)) {
        fail(`candidateId ${candidateId} is duplicated.`);
      }
      seenIds.add(candidateId);
    }

    if (!isBlank(record.reviewRole) && !ALLOWED_ROLES.has(String(record.reviewRole).trim())) {
      fail(`candidateRecords[${index}].reviewRole must be an allowed role.`);
    }

    if (!isBlank(record.contactStatus) && !CONTACT_STATUSES.has(String(record.contactStatus).trim())) {
      fail(`candidateRecords[${index}].contactStatus must be an allowed status.`);
    }

    if (!isBlank(record.contactedAt) && !isIsoDate(record.contactedAt)) {
      fail(`candidateRecords[${index}].contactedAt must be YYYY-MM-DD when present.`);
    }

    if (record.readyForPaidTest === true && record.contactStatus !== "paid_test_ready") {
      fail(`candidateRecords[${index}] cannot set readyForPaidTest=true unless contactStatus is paid_test_ready.`);
    }
  });
}

function requireAttestation(packet) {
  const attestation = packet.attestation || {};
  for (const key of ["operator", "reviewedAt"]) {
    if (isBlank(attestation[key])) {
      fail(`attestation.${key} is required.`);
    }
  }
  if (!isBlank(attestation.reviewedAt) && !isIsoDate(attestation.reviewedAt)) {
    fail("attestation.reviewedAt must be YYYY-MM-DD.");
  }
  requireTrue(attestation.noSecretsInRepo, "attestation.noSecretsInRepo");
  requireTrue(attestation.privateCandidateNotesStayOutOfRepo, "attestation.privateCandidateNotesStayOutOfRepo");
  requireTrue(attestation.aiDidNotApproveReviewer, "attestation.aiDidNotApproveReviewer");
  requireTrue(attestation.strangeCompanyRemainsSealed, "attestation.strangeCompanyRemainsSealed");
  requireTrue(attestation.satelliteIsReviewerContractingLane, "attestation.satelliteIsReviewerContractingLane");
}

function requireLocalMode(packet) {
  if (packet.mode !== "local") {
    fail("mode must be local before reviewer records can be treated as real evidence.");
  }
}

function hasRecordedCandidate(record, index) {
  requireText(record, "candidateId", "recorded candidate", index);
  requireText(record, "candidateLabel", "recorded candidate", index);
  const role = requireText(record, "reviewRole", "recorded candidate", index);
  const status = requireText(record, "contactStatus", "recorded candidate", index);
  requireText(record, "contactedAt", "recorded candidate", index);
  requireText(record, "scope", "recorded candidate", index);
  requireText(record, "rateBand", "recorded candidate", index);
  requireText(record, "availability", "recorded candidate", index);
  requireText(record, "paidTestTask", "recorded candidate", index);
  requireText(record, "conflictCheck", "recorded candidate", index);
  requireText(record, "evidenceRef", "recorded candidate", index);
  requireTrue(record.humanRecorded, `candidateRecords[${index}].humanRecorded`);

  return ALLOWED_ROLES.has(role) && CONTACT_STATUSES.has(status) && status !== "not_contacted";
}

function requireOneCandidate(packet) {
  const records = Array.isArray(packet.candidateRecords) ? packet.candidateRecords : [];
  if (!records.length) {
    fail("at least one candidate record is required.");
    return [];
  }

  const recorded = [];
  records.forEach((record, index) => {
    const before = failures.length;
    const complete = hasRecordedCandidate(record, index);
    if (complete && failures.length === before) {
      recorded.push(record);
    }
  });

  if (!recorded.length) {
    fail("at least one complete contacted candidate record is required.");
  }
  return recorded;
}

function requireReadyPool(packet) {
  const recorded = requireOneCandidate(packet);
  const ready = recorded.filter(
    (record) => record.contactStatus === "paid_test_ready" && record.readyForPaidTest === true
  );
  const readyRoles = new Set(ready.map((record) => record.reviewRole));

  if (ready.length < REQUIRED_READY_REVIEWER_COUNT) {
    fail(`at least ${REQUIRED_READY_REVIEWER_COUNT} paid-test-ready reviewer records are required.`);
  }

  for (const role of REQUIRED_READY_ROLES) {
    if (!readyRoles.has(role)) {
      fail(`ready reviewer pool must include role ${role}.`);
    }
  }
}

function validateTemplate(packet) {
  if (packet.mode !== "template") {
    warn("tracker mode is not template; run with --require-one or --require-ready for completed local tracker validation.");
  }
  const records = Array.isArray(packet.candidateRecords) ? packet.candidateRecords : [];
  if (records.length) {
    warn("template includes candidateRecords; completed reviewer evidence should stay local.");
  }
}

const packet = readJson(packetPath);
validateShape(packet);
scanForSecrets(packet);
validateCandidateFormats(packet);

if (requireOne || requireReady) {
  requireLocalMode(packet);
  requireAttestation(packet);
}
if (requireReady) {
  requireReadyPool(packet);
} else if (requireOne) {
  requireOneCandidate(packet);
} else if (templateOk) {
  validateTemplate(packet);
}

if (failures.length) {
  console.error("Reviewer candidate tracker validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (requireReady) {
  console.log("Reviewer candidate tracker has a ready reviewer pool.");
} else if (requireOne) {
  console.log("Reviewer candidate tracker has at least one recorded candidate.");
} else {
  console.log("Reviewer candidate tracker template validation passed.");
}
for (const warning of warnings) {
  console.log(`Warning: ${warning}`);
}
