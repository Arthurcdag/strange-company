const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const writeLocal = args.includes("--write-local");
const force = args.includes("--force");
const outputIndex = args.indexOf("--output");
const operatorArgIndex = args.indexOf("--operator");
const reviewedAtArgIndex = args.indexOf("--reviewed-at");
const outputPath = outputIndex >= 0 && outputIndex + 1
  ? path.resolve(process.cwd(), args[outputIndex + 1])
  : writeLocal
    ? path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.local.json")
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
    const sandbox = { window: {} };
    vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
    return sandbox.window.PUBLIC_ORDER_CONFIG || {};
  } catch (_error) {
    return {};
  }
}

function loadTemplate() {
  return JSON.parse(read("REVENUE_SETUP_EVIDENCE_INDEX.template.json"));
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
    sourceTemplate: "REVENUE_SETUP_EVIDENCE_INDEX.template.json",
    publicConfig: {
      ...template.publicConfig,
      operatorName: publicConfig.operatorName || template.publicConfig.operatorName,
    },
    attestation: {
      ...template.attestation,
      operator,
      reviewedAt: reviewedAt || template.attestation.reviewedAt || "",
    },
    draftInstructions: [
      "Create one local packet in REVENUE_SETUP_EVIDENCE_INDEX.local.json and fill real evidence references before any paid intake.",
      "Run: node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-payment",
      "After tax and payment readiness, run: node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-tax",
      "After both are ready, check VAU with: python tools/vau_company_evolution.py --revenue-evidence-index REVENUE_SETUP_EVIDENCE_INDEX.local.json",
      "Do not keep private evidence values (CNPJ, CPF, bank numbers, tax IDs, processor secrets) in this repo."
    ]
  };
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Draft revenue evidence index written: ${targetPath}`);
}

const draft = draftFromTemplate(loadTemplate(), loadPublicConfig());
const contents = JSON.stringify(draft, null, 2);

if (outputPath) {
  writeOutput(outputPath, contents);
} else {
  console.log(contents);
}
