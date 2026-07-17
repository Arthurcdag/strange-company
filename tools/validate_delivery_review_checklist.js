const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const requireReady = args.includes("--require-ready");
const templateOk = args.includes("--template-ok") || !requireReady;
const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg ? path.resolve(process.cwd(), packetArg) : path.join(root, "DELIVERY_REVIEW_CHECKLIST.template.json");

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
    fail(`could not read JSON checklist: ${error.message}`);
    return {};
  }
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isIsoDate(value) {
  if (isBlank(value)) {
    return false;
  }
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(text);
}

function isBoolean(value) {
  return value === true || value === false;
}

function isHttpsUrl(value) {
  if (isBlank(value)) {
    return false;
  }
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

function requireObject(obj, sectionPath) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    fail(`${sectionPath} must be an object.`);
    return false;
  }
  return true;
}

function requireText(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : "";
  if (required && isBlank(value)) {
    fail(`${sectionPath}.${key} is required.`);
  }
  return !isBlank(value);
}

function requireBoolean(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : undefined;
  if (required && !isBoolean(value)) {
    fail(`${sectionPath}.${key} must be true/false.`);
  }
  return value === true;
}

function requireDate(obj, key, sectionPath, required = true) {
  const value = obj ? obj[key] : "";
  if (required && !isIsoDate(value)) {
    fail(`${sectionPath}.${key} must be YYYY-MM-DD.`);
  }
}

function validateShape(packet) {
  if (packet.schemaVersion !== 1) {
    fail("schemaVersion must be 1.");
  }
  if (isBlank(packet.mode)) {
    fail("mode is required.");
  }
  requireObject(packet.deliveryLoop, "sections.deliveryLoop");
  requireObject(packet.evidence, "sections.evidence");
  requireObject(packet.attestation, "sections.attestation");
  if (packet.evidence && !Array.isArray(packet.evidence.incidentIds)) {
    fail("sections.evidence.incidentIds must be an array.");
  }
}

function validateTemplate(packet) {
  if (packet.mode === "template") {
    return;
  }
  if (packet.mode === "local-draft") {
    warn("local draft mode is not a completed delivery review checklist.");
    return;
  }
  warn("mode is not template; run --require-ready before treating it as delivery-loop evidence.");
}

function validateReady(packet) {
  if (packet.mode !== "local") {
    fail("mode must be local before the delivery checklist can be treated as real evidence.");
  }

  const loop = packet.deliveryLoop || {};
  const evidence = packet.evidence || {};
  const attestation = packet.attestation || {};

  for (const key of [
    "serviceName",
    "orderId",
    "scopeEvidenceRef",
    "humanReviewer",
    "deliveryArtifactUrl",
  ]) {
    requireText(loop, key, "sections.deliveryLoop");
  }

  for (const key of [
    "intakePacketRef",
    "sourceOrderRef",
    "draftArtifactRef",
    "reviewNotesRef",
    "finalArtifactRef",
    "receiptRoot",
  ]) {
    requireText(evidence, key, "sections.evidence");
  }

  requireDate(loop, "humanReviewDate", "sections.deliveryLoop");
  requireText(attestation, "operator", "sections.attestation");
  requireDate(attestation, "reviewedAt", "sections.attestation");

  if (!isHttpsUrl(loop.deliveryArtifactUrl)) {
    fail("sections.deliveryLoop.deliveryArtifactUrl must be an https:// URL.");
  }

  for (const key of [
    "intakeAccepted",
    "dataBoundaryConfirmed",
    "aiDraftCreated",
    "humanReviewCompleted",
    "revisionsCompleted",
    "acceptanceCriteriaMet",
    "receiptChainUpdated",
    "incidentReviewCompleted",
    "readyForDelivery",
  ]) {
    if (!requireBoolean(loop, key, "sections.deliveryLoop")) {
      fail(`sections.deliveryLoop.${key} must be true to pass this readiness gate.`);
    }
  }

  for (const key of [
    "noSecretsInRepo",
    "noCustomerPrivateDataInRepo",
    "aiDidNotApproveFinalDelivery",
    "strangeCompanyRemainsSealed",
    "satelliteIsDeliveryOperator",
  ]) {
    if (!requireBoolean(attestation, key, "sections.attestation")) {
      fail(`sections.attestation.${key} must be true to pass this readiness gate.`);
    }
  }
}

const packet = readJson(packetPath);
validateShape(packet);
validateTemplate(packet);

if (requireReady) {
  validateReady(packet);
}

if (failures.length) {
  console.error("Delivery review checklist validation failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

if (requireReady) {
  console.log("Delivery review checklist ready gate passed.");
} else if (templateOk) {
  console.log("Delivery review checklist template validation passed.");
} else {
  console.log("Delivery review checklist appears structurally valid.");
}

for (const message of warnings) {
  console.log(`Warning: ${message}`);
}
