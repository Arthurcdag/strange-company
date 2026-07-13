const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? path.resolve(process.cwd(), args[index + 1]) : fallback;
}

const packetArg = args.find((arg) => !arg.startsWith("--"));
const packetPath = packetArg
  ? path.resolve(process.cwd(), packetArg)
  : path.join(root, "LIVE_REVIEW_CLOSURE.local.json");
const publicConfigPath = argValue("--public-config", path.join(root, "public-config.js"));

const REVIEW_FIELDS = [
  "termsReviewedAt",
  "privacyReviewedAt",
  "brazilComplianceReviewedAt",
  "aiHandoffReviewedAt",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readPublicConfig(filePath) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox, { filename: filePath });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function validateReadyPacket(filePath) {
  const result = spawnSync(process.execPath, ["tools/validate_live_review_closure.js", filePath, "--require-ready"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    throw new Error(`LIVE_REVIEW_CLOSURE packet is not ready:\n${output}`);
  }
}

function renderSnippet(patch) {
  return [
    ...REVIEW_FIELDS.map((field) => `  ${field}: ${JSON.stringify(patch[field])},`),
    "  liveMode: false,",
  ].join("\n");
}

function buildPlan(packet, currentConfig) {
  const patch = packet.publicConfigPatch || {};
  if (patch.liveMode !== false) {
    throw new Error("Refusing to render patch because publicConfigPatch.liveMode is not false.");
  }
  if (currentConfig.liveMode === true) {
    throw new Error("Refusing to render review-date patch while current public-config.js has liveMode true.");
  }
  if (currentConfig.jurisdiction && currentConfig.jurisdiction !== "BR") {
    throw new Error("Refusing to render patch because current public-config.js jurisdiction is not BR.");
  }
  if (currentConfig.aiGeneratedLegalDocsRequireHumanReview !== true) {
    throw new Error("Refusing to render patch because current public-config.js does not require human review for AI legal docs.");
  }

  const changes = REVIEW_FIELDS.map((field) => ({
    field,
    from: currentConfig[field] || "",
    to: patch[field] || "",
    changed: (currentConfig[field] || "") !== (patch[field] || ""),
  }));

  return {
    system: "LIVE_REVIEW_PUBLIC_CONFIG_PATCH",
    sourcePacket: path.relative(root, packetPath).replace(/\\/g, "/"),
    publicConfigPath: path.relative(root, publicConfigPath).replace(/\\/g, "/"),
    liveModeRemainsFalse: true,
    changes,
    replacementSnippet: renderSnippet(patch),
    nextValidation: [
      "node tools/preflight_public_launch.js",
      "node tools/audit_company_functionality.js",
      "node tools/evolution_goal_status.js --json",
      "node tools/generate_evolution_next_packet.js",
      "node tools/survival_check.js",
    ],
    stopRules: [
      "Do not copy private reviewer notes, CPF/CNPJ, bank data, payment dashboard URLs, credentials, or customer-private material into public-config.js.",
      "Do not set liveMode true from this review-date patch.",
      "Do not treat this patch as external live readiness or payment/fiscal evidence.",
    ],
  };
}

function printText(plan) {
  console.log(plan.system);
  console.log(`Source packet: ${plan.sourcePacket}`);
  console.log(`Public config: ${plan.publicConfigPath}`);
  console.log(`liveMode remains false: ${plan.liveModeRemainsFalse}`);
  console.log("");
  console.log("Changes:");
  for (const change of plan.changes) {
    console.log(`- ${change.field}: ${JSON.stringify(change.from)} -> ${JSON.stringify(change.to)}`);
  }
  console.log("");
  console.log("Replacement snippet:");
  console.log(plan.replacementSnippet);
  console.log("");
  console.log("Validation after applying dates:");
  for (const command of plan.nextValidation) {
    console.log(`- ${command}`);
  }
  console.log("");
  console.log("Stop rules:");
  for (const rule of plan.stopRules) {
    console.log(`- ${rule}`);
  }
}

try {
  validateReadyPacket(packetPath);
  const plan = buildPlan(readJson(packetPath), readPublicConfig(publicConfigPath));
  if (asJson) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    printText(plan);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
