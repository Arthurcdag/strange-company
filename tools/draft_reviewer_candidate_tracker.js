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
    ? path.join(root, "REVIEWER_CANDIDATE_TRACKER.local.json")
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
  return JSON.parse(read("REVIEWER_CANDIDATE_TRACKER.template.json"));
}

function draftFromTemplate(template, publicConfig) {
  const operator = operatorOverride || publicConfig.operatorName || "operator";
  const reviewedAt = /^\d{4}-\d{2}-\d{2}$/.test(reviewedAtOverride)
    ? reviewedAtOverride
    : "";

  return {
    ...template,
    mode: "local-draft",
    generatedAt: new Date().toISOString(),
    source: "template",
    sourceTemplate: "REVIEWER_CANDIDATE_TRACKER.template.json",
    attestation: {
      ...template.attestation,
      operator,
      reviewedAt: reviewedAt || template.attestation.reviewedAt || "",
    },
    draftInstructions: [
      "Create one local tracker in REVIEWER_CANDIDATE_TRACKER.local.json and fill real outreach evidence before requiring proofs.",
      "Run: node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-one",
      "After four paid-test-ready reviewers, run: node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready",
      "Never keep candidate notes, rates, bank details, or contract terms in the public repository."
    ],
  };
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Draft reviewer tracker written: ${targetPath}`);
}

const draft = draftFromTemplate(loadTemplate(), loadPublicConfig());
const contents = JSON.stringify(draft, null, 2);

if (outputPath) {
  writeOutput(outputPath, contents);
} else {
  console.log(contents);
}
