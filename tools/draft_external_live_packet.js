const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const writeLocal = args.includes("--write-local");
const force = args.includes("--force");
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 && args[outputIndex + 1]
  ? path.resolve(process.cwd(), args[outputIndex + 1])
  : writeLocal
    ? path.join(root, "EXTERNAL_LIVE_PACKET.local.json")
    : "";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function loadTemplate() {
  return JSON.parse(read("EXTERNAL_LIVE_PACKET.template.json"));
}

function publicConfigDraft(config) {
  return {
    operatorName: config.operatorName || "Strange Works Studio",
    jurisdiction: config.jurisdiction || "BR",
    aiGeneratedLegalDocsRequireHumanReview: config.aiGeneratedLegalDocsRequireHumanReview === true,
    supportEmail: config.supportEmail || "",
    googleFormUrl: config.googleFormUrl || "",
    supportInboxVerified: config.supportInboxVerified === true,
    googleFormVerified: config.googleFormVerified === true,
    termsReviewedAt: config.termsReviewedAt || "",
    privacyReviewedAt: config.privacyReviewedAt || "",
    brazilComplianceReviewedAt: config.brazilComplianceReviewedAt || "",
    aiHandoffReviewedAt: config.aiHandoffReviewedAt || "",
    liveMode: config.liveMode === true
  };
}

function buildDraft(template, config) {
  const publicConfig = publicConfigDraft(config);
  return {
    ...template,
    mode: "draft-from-public-config",
    generatedAt: new Date().toISOString(),
    source: "public-config.js",
    support: {
      ...template.support,
      supportEmail: publicConfig.supportEmail,
      verified: publicConfig.supportInboxVerified
    },
    google: {
      ...template.google,
      formUrl: publicConfig.googleFormUrl,
      verified: publicConfig.googleFormVerified
    },
    legalReview: {
      ...template.legalReview,
      termsReviewedAt: publicConfig.termsReviewedAt,
      privacyReviewedAt: publicConfig.privacyReviewedAt,
      brazilComplianceReviewedAt: publicConfig.brazilComplianceReviewedAt,
      aiHandoffReviewedAt: publicConfig.aiHandoffReviewedAt
    },
    publicConfig,
    attestation: {
      ...template.attestation,
      noSecretsInRepo: true,
      strangeCompanyRemainsSealed: true,
      satelliteIsRevenueOperator: true
    },
    draftWarnings: [
      "This draft only copies public-safe values from public-config.js.",
      "Blank private fields must be completed from real external evidence before --require-live can pass.",
      "Keep public-config.js liveMode false. After every external evidence gate is real, set only this local packet's publicConfig.liveMode target to true for --require-live; the tracked flip remains a separate human decision."
    ]
  };
}

function writeOutput(targetPath, contents) {
  if (fs.existsSync(targetPath) && !force) {
    console.error(`Refusing to overwrite ${targetPath}. Pass --force to replace it.`);
    process.exit(1);
  }
  fs.writeFileSync(targetPath, `${contents}\n`, "utf8");
  console.log(`Draft external live packet written: ${targetPath}`);
}

const draft = buildDraft(loadTemplate(), loadPublicConfig());
const contents = JSON.stringify(draft, null, 2);

if (outputPath) {
  writeOutput(outputPath, contents);
} else {
  console.log(contents);
}
