const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireOne = args.includes("--require-one");
const requireAnswerReadyGate = args.includes("--require-answer-ready");
const templateOk = args.includes("--template-ok") || (!requireOne && !requireAnswerReadyGate);
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg ? path.resolve(process.cwd(), packetArg) : path.join(root, "PUBLIC_AMA_QUEUE.template.json");

const ALLOWED_TOPICS = new Set([
  "launch-gates",
  "strange-works-studio",
  "sealed-company",
  "brazil-compliance",
  "other"
]);
const ALLOWED_STATUSES = new Set([
  "new",
  "screened",
  "needs-human-route",
  "answer_ready",
  "published",
  "rejected"
]);
const ALLOWED_BOUNDARY_DECISIONS = new Set([
  "public_safe",
  "route_to_human",
  "reject_sensitive"
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
    fail(`could not read JSON AMA queue: ${error.message}`);
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

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
    return [];
  }
  return value;
}

function requireText(record, key, label, index) {
  const value = record[key];
  if (isBlank(value)) {
    fail(`questionRecords[${index}].${key} is required for ${label}.`);
    return "";
  }
  return String(value).trim();
}

function requireTrue(value, label) {
  if (value !== true) {
    fail(`${label} must be true.`);
  }
}

function scanForSecrets(value, currentPath = "$") {
  const forbiddenKeyPattern = /(password|secret|private.?key|api.?key|routing.?number|account.?number|card.?number|cvv|cpf|cnpj|tax.?id|email|contactEmail)/i;
  const forbiddenValuePatterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /sk_(live|test)_[A-Za-z0-9]/,
    /rk_(live|test)_[A-Za-z0-9]/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
    /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/,
    /\b(?:\d[ -]*?){13,19}\b/
  ];

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${currentPath}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenKeyPattern.test(key) && key !== "noSecretsInRepo") {
        fail(`AMA queue contains forbidden private-data-like key ${currentPath}.${key}.`);
      }
      scanForSecrets(child, `${currentPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string") {
    for (const pattern of forbiddenValuePatterns) {
      if (pattern.test(value)) {
        fail(`AMA queue contains forbidden private-data-like value at ${currentPath}.`);
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

  const topics = assertArray(packet.allowedTopics, "allowedTopics");
  const statuses = assertArray(packet.allowedStatuses, "allowedStatuses");
  const boundaryDecisions = assertArray(packet.allowedBoundaryDecisions, "allowedBoundaryDecisions");
  assertArray(packet.questionRecords, "questionRecords");

  for (const topic of ALLOWED_TOPICS) {
    if (!topics.includes(topic)) {
      fail(`allowedTopics must include ${topic}.`);
    }
  }
  for (const status of ALLOWED_STATUSES) {
    if (!statuses.includes(status)) {
      fail(`allowedStatuses must include ${status}.`);
    }
  }
  for (const decision of ALLOWED_BOUNDARY_DECISIONS) {
    if (!boundaryDecisions.includes(decision)) {
      fail(`allowedBoundaryDecisions must include ${decision}.`);
    }
  }
  if (!packet.attestation || typeof packet.attestation !== "object" || Array.isArray(packet.attestation)) {
    fail("attestation must be an object.");
  }
}

function validateQuestionFormats(packet) {
  const records = Array.isArray(packet.questionRecords) ? packet.questionRecords : [];
  const seenIds = new Set();

  records.forEach((record, index) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      fail(`questionRecords[${index}] must be an object.`);
      return;
    }

    if (!isBlank(record.questionId)) {
      const questionId = String(record.questionId).trim();
      if (seenIds.has(questionId)) {
        fail(`questionId ${questionId} is duplicated.`);
      }
      seenIds.add(questionId);
    }

    if (!isBlank(record.receivedAt) && !isIsoDate(record.receivedAt)) {
      fail(`questionRecords[${index}].receivedAt must be YYYY-MM-DD when present.`);
    }
    if (!isBlank(record.answerReviewedAt) && !isIsoDate(record.answerReviewedAt)) {
      fail(`questionRecords[${index}].answerReviewedAt must be YYYY-MM-DD when present.`);
    }
    if (!isBlank(record.topic) && !ALLOWED_TOPICS.has(String(record.topic).trim())) {
      fail(`questionRecords[${index}].topic must be an allowed topic.`);
    }
    if (!isBlank(record.status) && !ALLOWED_STATUSES.has(String(record.status).trim())) {
      fail(`questionRecords[${index}].status must be an allowed status.`);
    }
    if (!isBlank(record.boundaryDecision) && !ALLOWED_BOUNDARY_DECISIONS.has(String(record.boundaryDecision).trim())) {
      fail(`questionRecords[${index}].boundaryDecision must be an allowed boundary decision.`);
    }
    if (record.status === "answer_ready" && record.boundaryDecision !== "public_safe") {
      fail(`questionRecords[${index}] cannot be answer_ready unless boundaryDecision is public_safe.`);
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
  requireTrue(attestation.privateEvidenceStaysOutOfRepo, "attestation.privateEvidenceStaysOutOfRepo");
  requireTrue(attestation.aiDidNotApproveLegalTaxPaymentOrPrivacy, "attestation.aiDidNotApproveLegalTaxPaymentOrPrivacy");
  requireTrue(attestation.noPaymentOrderOrLaunchApprovalCreated, "attestation.noPaymentOrderOrLaunchApprovalCreated");
  requireTrue(attestation.strangeCompanyRemainsSealed, "attestation.strangeCompanyRemainsSealed");
}

function hasScreenedQuestion(record, index) {
  requireText(record, "questionId", "screened AMA question", index);
  requireText(record, "receivedAt", "screened AMA question", index);
  requireText(record, "topic", "screened AMA question", index);
  requireText(record, "nameAlias", "screened AMA question", index);
  requireText(record, "contactRef", "screened AMA question", index);
  requireText(record, "questionSummary", "screened AMA question", index);
  requireText(record, "publicSafeQuestion", "screened AMA question", index);
  requireText(record, "status", "screened AMA question", index);
  requireText(record, "boundaryDecision", "screened AMA question", index);
  requireText(record, "evidenceRef", "screened AMA question", index);
  requireTrue(record.humanScreened, `questionRecords[${index}].humanScreened`);

  return (
    isIsoDate(record.receivedAt)
    && ALLOWED_TOPICS.has(String(record.topic || "").trim())
    && ALLOWED_STATUSES.has(String(record.status || "").trim())
    && ALLOWED_BOUNDARY_DECISIONS.has(String(record.boundaryDecision || "").trim())
  );
}

function requireOneQuestion(packet) {
  const records = Array.isArray(packet.questionRecords) ? packet.questionRecords : [];
  if (!records.length) {
    fail("at least one screened AMA question is required.");
    return [];
  }

  const screened = [];
  records.forEach((record, index) => {
    const before = failures.length;
    const complete = hasScreenedQuestion(record, index);
    if (complete && failures.length === before) {
      screened.push(record);
    }
  });

  if (!screened.length) {
    fail("at least one complete screened AMA question is required.");
  }
  return screened;
}

function requireAnswerReady(packet) {
  const screened = requireOneQuestion(packet);
  const ready = screened.filter((record) => (
    record.status === "answer_ready"
    && record.boundaryDecision === "public_safe"
    && !isBlank(record.publicAnswer)
    && record.humanApprovedForPublication === true
    && isIsoDate(record.answerReviewedAt)
  ));

  if (!ready.length) {
    fail("at least one public-safe AMA answer_ready record with human publication approval is required.");
  }
}

function validateTemplate(packet) {
  if (packet.mode !== "template") {
    warn("AMA queue mode is not template; run with --require-one or --require-answer-ready for completed local queue validation.");
  }
  const records = Array.isArray(packet.questionRecords) ? packet.questionRecords : [];
  if (records.length) {
    warn("template includes questionRecords; completed AMA evidence should stay local.");
  }
}

const packet = readJson(packetPath);
validateShape(packet);
scanForSecrets(packet);
validateQuestionFormats(packet);

if (requireOne || requireAnswerReadyGate) {
  requireAttestation(packet);
}
if (requireAnswerReadyGate) {
  requireAnswerReady(packet);
} else if (requireOne) {
  requireOneQuestion(packet);
} else if (templateOk) {
  validateTemplate(packet);
}

if (failures.length) {
  console.error("Public AMA queue validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (requireAnswerReadyGate) {
  console.log("Public AMA queue has at least one answer-ready public-safe question.");
} else if (requireOne) {
  console.log("Public AMA queue has at least one screened question.");
} else {
  console.log("Public AMA queue template validation passed.");
}
for (const warning of warnings) {
  console.log(`Warning: ${warning}`);
}
