const fs = require("fs");
const path = require("path");
const { parsePublicOrderConfig } = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const writeLocal = args.includes("--write-local");
const force = args.includes("--force");
const outputIndex = args.indexOf("--output");
const operatorArgIndex = args.indexOf("--operator");
const reviewedAtArgIndex = args.indexOf("--reviewed-at");
const outputPath = outputIndex >= 0 && args[outputIndex + 1]
  ? path.resolve(process.cwd(), args[outputIndex + 1])
  : writeLocal
    ? path.join(root, "PUBLIC_AMA_QUEUE.local.json")
    : "";
const operatorOverride = operatorArgIndex >= 0 && args[operatorArgIndex + 1]
  ? String(args[operatorArgIndex + 1]).trim()
  : "";
const reviewedAtOverride = reviewedAtArgIndex >= 0 && args[reviewedAtArgIndex + 1]
  ? String(args[reviewedAtArgIndex + 1]).trim()
  : "";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadPublicConfig() {
  try {
    return parsePublicOrderConfig(read("public-config.js"), "public-config.js");
  } catch (_error) {
    return {};
  }
}

function loadTemplate() {
  return JSON.parse(read("PUBLIC_AMA_QUEUE.template.json"));
}

function draftFromTemplate(template, publicConfig) {
  const operator = operatorOverride || publicConfig.operatorName || "operator";
  const reviewedAt = /^\d{4}-\d{2}-\d{2}$/.test(reviewedAtOverride)
    ? reviewedAtOverride
    : template.attestation.reviewedAt || "";

  return {
    ...template,
    mode: "local-draft",
    generatedAt: new Date().toISOString(),
    sourceTemplate: "PUBLIC_AMA_QUEUE.template.json",
    attestation: {
      ...template.attestation,
      operator,
      reviewedAt
    },
    draftInstructions: [
      "Keep completed AMA question evidence in PUBLIC_AMA_QUEUE.local.json outside git.",
      "Record aliases and support-thread references only; do not store direct emails or private evidence in this file.",
      "Run: node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-one after the first screened public-safe question.",
      "Run: node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-answer-ready before publishing any AMA answer.",
      "Route legal, tax, accounting, privacy, payment, refund, sensitive-data, or launch-approval questions to the human workflow instead of publishing an AMA answer."
    ]
  };
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Draft public AMA queue written: ${targetPath}`);
}

const draft = draftFromTemplate(loadTemplate(), loadPublicConfig());
const contents = JSON.stringify(draft, null, 2);

if (outputPath) {
  writeOutput(outputPath, contents);
} else {
  console.log(contents);
}
