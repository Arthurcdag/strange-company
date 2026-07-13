const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const writeLocal = args.includes("--write-local");
const force = args.includes("--force");

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? String(args[index + 1]).trim() : "";
}

const outputPath = argValue("--output")
  ? path.resolve(process.cwd(), argValue("--output"))
  : writeLocal
    ? path.join(root, "LIVE_REVIEW_CLOSURE.local.json")
    : "";
const operatorOverride = argValue("--operator");
const reviewedAtOverride = argValue("--reviewed-at");

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
  return JSON.parse(read("LIVE_REVIEW_CLOSURE.template.json"));
}

function isIsoDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text);
}

function draftGate(gate, publicDate) {
  return {
    ...gate,
    reviewedAt: gate.reviewedAt || publicDate || "",
  };
}

function buildDraft(template, publicConfig) {
  const reviewedAt = isIsoDate(reviewedAtOverride)
    ? reviewedAtOverride
    : template.attestation.reviewedAt || "";

  return {
    ...template,
    mode: "local-draft",
    generatedAt: new Date().toISOString(),
    source: "public-config.js",
    sourceTemplate: "LIVE_REVIEW_CLOSURE.template.json",
    reviewGates: {
      terms: draftGate(template.reviewGates.terms, publicConfig.termsReviewedAt),
      privacy: draftGate(template.reviewGates.privacy, publicConfig.privacyReviewedAt),
      brazilCompliance: draftGate(template.reviewGates.brazilCompliance, publicConfig.brazilComplianceReviewedAt),
      aiHandoff: draftGate(template.reviewGates.aiHandoff, publicConfig.aiHandoffReviewedAt),
    },
    publicConfigPatch: {
      ...template.publicConfigPatch,
      jurisdiction: publicConfig.jurisdiction || "BR",
      aiGeneratedLegalDocsRequireHumanReview: publicConfig.aiGeneratedLegalDocsRequireHumanReview === true,
      termsReviewedAt: publicConfig.termsReviewedAt || "",
      privacyReviewedAt: publicConfig.privacyReviewedAt || "",
      brazilComplianceReviewedAt: publicConfig.brazilComplianceReviewedAt || "",
      aiHandoffReviewedAt: publicConfig.aiHandoffReviewedAt || "",
      liveMode: false,
    },
    attestation: {
      ...template.attestation,
      operator: operatorOverride || publicConfig.operatorName || "operator",
      reviewedAt,
      noPrivateEvidenceInRepo: true,
      noLegalTaxPrivacyApprovalFromAi: true,
      liveModeStaysFalse: true,
      externalLivePacketStillRequired: true,
      revenuePaymentFiscalEvidenceStillRequired: true,
    },
    draftInstructions: [
      "Keep this file local as LIVE_REVIEW_CLOSURE.local.json.",
      "Use it only for the four public review-date blockers: terms, privacy, Brazil compliance, and AI handoff.",
      "Do not store private reviewer notes, CPF/CNPJ, bank data, payment dashboard URLs, credentials, or customer-private material in git.",
      "Do not use this packet to set liveMode true.",
      "Run: node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready",
      "After a ready packet passes, copy only the four public-safe dates into public-config.js and keep liveMode false until the external live and revenue evidence gates pass."
    ]
  };
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Draft live review closure written: ${targetPath}`);
}

const draft = buildDraft(loadTemplate(), loadPublicConfig());
const contents = JSON.stringify(draft, null, 2);

if (outputPath) {
  writeOutput(outputPath, contents);
} else {
  console.log(contents);
}
