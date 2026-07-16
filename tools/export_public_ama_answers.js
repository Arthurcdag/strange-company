const fs = require("fs");
const path = require("path");
const { parseFrozenWindowJson } = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const requirePublished = args.includes("--require-published");
const templateOk = args.includes("--template-ok");
const checkPublicJs = args.includes("--check-public-js");

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? String(args[index + 1]) : "";
}

const inputPath = path.resolve(
  process.cwd(),
  argValue("--input") || path.join(root, "PUBLIC_AMA_QUEUE.local.json")
);
const outputArg = argValue("--output");
const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : "";
const publicJsPath = path.resolve(process.cwd(), argValue("--public-js") || path.join(root, "public-ama-answers.js"));
const failures = [];

function fail(message) {
  failures.push(message);
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function isIsoDate(value) {
  if (isBlank(value) || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(String(value));
}

function hasPrivateDataLikeValue(value) {
  const text = String(value || "");
  const checks = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /\b(?:\d[ -]*?){13,19}\b/,
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})\b/,
    /\b(password|passcode|secret|private key|api[_ -]?key|access token|bearer token)\b/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i
  ];
  return checks.some((pattern) => pattern.test(text));
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Could not read JSON ${filePath}: ${error.message}`);
    return null;
  }
}

function validateTemplate() {
  const template = readJson(path.join(root, "PUBLIC_AMA_ANSWERS.template.json"));
  if (!template) {
    return;
  }
  if (template.schemaVersion !== 1) {
    fail("PUBLIC_AMA_ANSWERS.template.json schemaVersion must be 1.");
  }
  if (template.mode !== "template") {
    fail("PUBLIC_AMA_ANSWERS.template.json mode must be template.");
  }
  if (!Array.isArray(template.answers) || template.answers.length !== 0) {
    fail("PUBLIC_AMA_ANSWERS.template.json answers must stay empty.");
  }
  if (template.attestation?.publicOnly !== true || template.attestation?.noPrivateContactData !== true) {
    fail("PUBLIC_AMA_ANSWERS.template.json must attest public-only output.");
  }
}

function validatePublicArchive(archive, label) {
  if (!archive || typeof archive !== "object") {
    fail(`${label} must expose an archive object.`);
    return;
  }
  if (archive.schemaVersion !== 1) {
    fail(`${label} schemaVersion must be 1.`);
  }
  if (archive.mode !== "public") {
    fail(`${label} mode must be public.`);
  }
  if (!Array.isArray(archive.answers)) {
    fail(`${label} answers must be an array.`);
    return;
  }
  if (archive.attestation?.publicOnly !== true || archive.attestation?.noPrivateContactData !== true) {
    fail(`${label} must attest public-only answers with no private contact data.`);
  }
  archive.answers.forEach((answer, index) => {
    const forbidden = ["nameAlias", "contactRef", "questionSummary", "evidenceRef"];
    for (const field of forbidden) {
      if (Object.prototype.hasOwnProperty.call(answer, field)) {
        fail(`${label}.answers[${index}] must not include ${field}.`);
      }
    }
    for (const field of ["questionId", "topic", "publicSafeQuestion", "publicAnswer", "answerReviewedAt", "publishedAt"]) {
      if (isBlank(answer[field])) {
        fail(`${label}.answers[${index}].${field} is required.`);
      }
    }
    if (!isIsoDate(answer.answerReviewedAt)) {
      fail(`${label}.answers[${index}].answerReviewedAt must be YYYY-MM-DD.`);
    }
    if (!isIsoDate(answer.publishedAt)) {
      fail(`${label}.answers[${index}].publishedAt must be YYYY-MM-DD.`);
    }
    for (const field of ["questionId", "topic", "publicSafeQuestion", "publicAnswer"]) {
      if (hasPrivateDataLikeValue(answer[field])) {
        fail(`${label}.answers[${index}].${field} contains private-data-like content.`);
      }
    }
  });
}

function loadPublicJsArchive(filePath) {
  try {
    return parseFrozenWindowJson(
      fs.readFileSync(filePath, "utf8"),
      "PUBLIC_AMA_ANSWERS",
      filePath
    );
  } catch (error) {
    fail(`Could not load ${filePath}: ${error.message}`);
    return null;
  }
}

function isPublishedPublicAnswer(record, index) {
  if (!record || typeof record !== "object") {
    return false;
  }
  let valid = true;
  const required = [
    ["questionId", record.questionId],
    ["topic", record.topic],
    ["publicSafeQuestion", record.publicSafeQuestion],
    ["publicAnswer", record.publicAnswer],
    ["answerReviewedAt", record.answerReviewedAt]
  ];
  for (const [field, value] of required) {
    if (isBlank(value)) {
      fail(`questionRecords[${index}].${field} is required for public export.`);
      valid = false;
    }
  }
  if (record.status !== "published") {
    return false;
  }
  if (record.boundaryDecision !== "public_safe") {
    fail(`questionRecords[${index}] must be public_safe before export.`);
    valid = false;
  }
  if (record.humanScreened !== true) {
    fail(`questionRecords[${index}].humanScreened must be true before export.`);
    valid = false;
  }
  if (record.humanApprovedForPublication !== true) {
    fail(`questionRecords[${index}].humanApprovedForPublication must be true before export.`);
    valid = false;
  }
  if (!isIsoDate(record.answerReviewedAt)) {
    fail(`questionRecords[${index}].answerReviewedAt must be YYYY-MM-DD before export.`);
    valid = false;
  }
  for (const field of ["questionId", "topic", "publicSafeQuestion", "publicAnswer"]) {
    if (hasPrivateDataLikeValue(record[field])) {
      fail(`questionRecords[${index}].${field} contains private-data-like content.`);
      valid = false;
    }
  }
  return valid;
}

function buildArchive(queue) {
  const records = Array.isArray(queue?.questionRecords) ? queue.questionRecords : [];
  const answers = [];
  records.forEach((record, index) => {
    if (record?.status !== "published") {
      return;
    }
    if (!isPublishedPublicAnswer(record, index)) {
      return;
    }
    answers.push({
      questionId: cleanText(record.questionId, 80),
      topic: cleanText(record.topic, 80),
      publicSafeQuestion: cleanText(record.publicSafeQuestion, 400),
      publicAnswer: cleanText(record.publicAnswer, 1200),
      answerReviewedAt: cleanText(record.answerReviewedAt, 10),
      publishedAt: isIsoDate(record.publishedAt) ? cleanText(record.publishedAt, 10) : cleanText(record.answerReviewedAt, 10)
    });
  });

  return {
    schemaVersion: 1,
    mode: "public",
    generatedAt: new Date().toISOString(),
    sourceQueue: "PUBLIC_AMA_QUEUE.local.json",
    answers,
    attestation: {
      publicOnly: true,
      noPrivateContactData: true,
      noPaymentOrderOrLaunchApprovalCreated: true,
      answersWereHumanApprovedBeforeExport: true,
      strangeCompanyRemainsSealed: true
    }
  };
}

function renderPublicJavaScript(archive) {
  return `window.PUBLIC_AMA_ANSWERS = Object.freeze(${JSON.stringify(archive, null, 2)});\n`;
}

function writeOutput(filePath, archive) {
  if (fs.existsSync(filePath) && !force) {
    fail(`Refusing to overwrite ${filePath}. Pass --force to replace it.`);
    return;
  }
  const contents = filePath.endsWith(".json")
    ? `${JSON.stringify(archive, null, 2)}\n`
    : renderPublicJavaScript(archive);
  fs.writeFileSync(filePath, contents, "utf8");
  console.log(`Public AMA answers written: ${filePath}`);
}

if (templateOk) {
  validateTemplate();
  if (failures.length) {
    console.error("Public AMA answers template validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
  console.log("Public AMA answers template validation passed.");
  process.exit(0);
}

if (checkPublicJs) {
  validatePublicArchive(loadPublicJsArchive(publicJsPath), "public-ama-answers.js");
  if (failures.length) {
    console.error("Public AMA answers archive validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
  console.log("Public AMA answers archive validation passed.");
  process.exit(0);
}

const queue = readJson(inputPath);
const archive = buildArchive(queue);

if (requirePublished && archive.answers.length === 0) {
  fail("at least one published public-safe AMA answer is required.");
}

if (failures.length) {
  console.error("Public AMA answer export failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (outputPath) {
  writeOutput(outputPath, archive);
  if (failures.length) {
    console.error("Public AMA answer export failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
} else {
  process.stdout.write(`${JSON.stringify(archive, null, 2)}\n`);
}
