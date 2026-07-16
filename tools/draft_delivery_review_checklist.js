const fs = require("fs");
const path = require("path");
const { parsePublicOrderConfig } = require("./strict_public_data");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const writeLocal = args.includes("--write-local");
const force = args.includes("--force");
const outputIndex = args.indexOf("--output");
const operatorIndex = args.indexOf("--operator");
const reviewedAtIndex = args.indexOf("--reviewed-at");
const outputPath = outputIndex >= 0 && args[outputIndex + 1]
  ? path.resolve(process.cwd(), args[outputIndex + 1])
  : writeLocal
    ? path.join(root, "DELIVERY_REVIEW_CHECKLIST.local.json")
    : "";
const operatorOverride = operatorIndex >= 0 && args[operatorIndex + 1]
  ? String(args[operatorIndex + 1]).trim()
  : "";
const reviewedAtOverride = reviewedAtIndex >= 0 && args[reviewedAtIndex + 1]
  ? String(args[reviewedAtIndex + 1]).trim()
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
  return JSON.parse(read("DELIVERY_REVIEW_CHECKLIST.template.json"));
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
    source: "template",
    sourceTemplate: "DELIVERY_REVIEW_CHECKLIST.template.json",
    attestation: {
      ...template.attestation,
      operator,
      reviewedAt,
    },
    draftInstructions: [
      "Keep this file local as DELIVERY_REVIEW_CHECKLIST.local.json.",
      "Fill only references, redacted labels, and public-safe artifact URLs.",
      "Do not store customer-private documents, CPF/CNPJ, payment data, credentials, or private review notes in git.",
      "Run: node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready",
      "Then run: python tools/vau_company_evolution.py --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --depth 1"
    ]
  };
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Draft delivery review checklist written: ${targetPath}`);
}

const draft = draftFromTemplate(loadTemplate(), loadPublicConfig());
const contents = JSON.stringify(draft, null, 2);

if (outputPath) {
  writeOutput(outputPath, contents);
} else {
  console.log(contents);
}
