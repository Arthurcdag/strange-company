const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function isIsoDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(text);
}

function isGoogleFormUrl(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  try {
    const url = new URL(text);
    return url.protocol === "https:" && url.href.startsWith("https://docs.google.com/forms/");
  } catch {
    return false;
  }
}

function coreLiveEvidenceRows(config) {
  return [
    {
      id: "support-inbox",
      title: "Support inbox verified",
      field: "supportEmail + supportInboxVerified",
      passed: Boolean(String(config.supportEmail || "").trim() && config.supportInboxVerified === true),
      fix: "Record monitored inbox owner, cadence, test received timestamp, and reply timestamp."
    },
    {
      id: "google-form-url",
      title: "Google Form URL public and safe",
      field: "googleFormUrl",
      passed: isGoogleFormUrl(config.googleFormUrl),
      fix: "Create the Form, link it to the private Sheet, then paste only the public Form URL."
    },
    {
      id: "google-form-verified",
      title: "Google Form test response verified",
      field: "googleFormVerified",
      passed: config.googleFormVerified === true,
      fix: "Submit one safe test response and confirm it lands in the Responses ledger."
    },
    {
      id: "terms-review",
      title: "Terms reviewed by human",
      field: "termsReviewedAt",
      passed: isIsoDate(config.termsReviewedAt),
      fix: "Record the actual human review date as YYYY-MM-DD."
    },
    {
      id: "privacy-review",
      title: "Privacy reviewed by human",
      field: "privacyReviewedAt",
      passed: isIsoDate(config.privacyReviewedAt),
      fix: "Record the actual privacy review date as YYYY-MM-DD."
    },
    {
      id: "brazil-compliance-review",
      title: "Brazil compliance review closed",
      field: "brazilComplianceReviewedAt",
      passed: isIsoDate(config.brazilComplianceReviewedAt),
      fix: "Close CNPJ/fiscal/LGPD/payment support review with a responsible human."
    },
    {
      id: "ai-handoff-review",
      title: "AI legal handoff reviewed",
      field: "aiHandoffReviewedAt",
      passed: isIsoDate(config.aiHandoffReviewedAt),
      fix: "Confirm which AI-prepared text remains draft-only and which human-owned changes are accepted."
    },
    {
      id: "brazil-config",
      title: "Public config remains Brazil-first",
      field: "jurisdiction + aiGeneratedLegalDocsRequireHumanReview",
      passed: config.jurisdiction === "BR" && config.aiGeneratedLegalDocsRequireHumanReview === true,
      fix: "Keep jurisdiction BR and require human review for AI-generated legal docs."
    }
  ];
}

function buildLiveEvidenceModel(config) {
  const coreRows = coreLiveEvidenceRows(config);
  const evidenceBlockers = coreRows.filter((row) => !row.passed);
  const liveModeSafe = config.liveMode !== true || evidenceBlockers.length === 0;
  const rows = [
    ...coreRows,
    {
      id: "live-mode-last",
      title: "Live mode stays last",
      field: "liveMode",
      passed: liveModeSafe,
      fix: "Set liveMode true only after --require-live passes with real external evidence."
    }
  ];
  const blockers = rows.filter((row) => !row.passed);
  return {
    state: evidenceBlockers.length ? "External evidence blocked" : "External evidence ready",
    blockers,
    evidenceBlockers,
    rows,
    liveMode: config.liveMode === true,
    readyToTurnOn: evidenceBlockers.length === 0 && liveModeSafe
  };
}

function snapshot(config) {
  return {
    operatorName: config.operatorName || "",
    jurisdiction: config.jurisdiction || "",
    supportEmail: config.supportEmail || "",
    supportInboxVerified: config.supportInboxVerified === true,
    googleFormUrl: config.googleFormUrl || "",
    googleFormVerified: config.googleFormVerified === true,
    termsReviewedAt: config.termsReviewedAt || "",
    privacyReviewedAt: config.privacyReviewedAt || "",
    brazilComplianceReviewedAt: config.brazilComplianceReviewedAt || "",
    aiHandoffReviewedAt: config.aiHandoffReviewedAt || "",
    liveMode: config.liveMode === true
  };
}

const validationCommands = [
  "node tools/check_external_live_packet_gate.js",
  "node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js",
  "node tools/preflight_public_launch.js",
  "node tools/audit_company_functionality.js --require-live"
];

const stopRules = [
  "Do not set liveMode true until support, Google Form, terms, privacy, Brazil compliance, and AI handoff evidence are real.",
  "Do not commit EXTERNAL_LIVE_PACKET.local.json, Sheet URLs, Stripe dashboard URLs, bank metadata, private keys, or customer secrets.",
  "Do not treat this packet as legal, tax, privacy, fiscal, payment, or support approval."
];

function liveEvidencePacket(config, model) {
  const missing = model.evidenceBlockers.length
    ? model.evidenceBlockers.map((row) => `- ${row.title} (${row.field}): ${row.fix}`).join("\n")
    : "- No missing external evidence rows detected in public-config.js.";
  const rows = model.rows
    .map((row) => `- ${row.title}: ${row.passed ? "pass" : "block"} / ${row.field}`)
    .join("\n");
  const current = snapshot(config);

  return [
    "Strange Company external live evidence gap packet",
    `Generated: ${new Date().toISOString()}`,
    `State: ${model.state}`,
    `Evidence gaps: ${model.evidenceBlockers.length}`,
    "",
    "[Public Config Snapshot]",
    `operatorName: ${current.operatorName}`,
    `jurisdiction: ${current.jurisdiction}`,
    `supportEmail: ${current.supportEmail}`,
    `supportInboxVerified: ${current.supportInboxVerified}`,
    `googleFormUrl: ${current.googleFormUrl}`,
    `googleFormVerified: ${current.googleFormVerified}`,
    `termsReviewedAt: ${current.termsReviewedAt}`,
    `privacyReviewedAt: ${current.privacyReviewedAt}`,
    `brazilComplianceReviewedAt: ${current.brazilComplianceReviewedAt}`,
    `aiHandoffReviewedAt: ${current.aiHandoffReviewedAt}`,
    `liveMode: ${current.liveMode}`,
    "",
    "[Gate Rows]",
    rows,
    "",
    "[Missing Evidence]",
    missing,
    "",
    "[Validation Commands]",
    validationCommands.join("\n"),
    "",
    "[Stop Rules]",
    stopRules.join("\n")
  ].join("\n");
}

const config = loadPublicConfig();
const model = buildLiveEvidenceModel(config);

if (asJson) {
  console.log(JSON.stringify({
    snapshot: snapshot(config),
    state: model.state,
    evidenceGapCount: model.evidenceBlockers.length,
    blockers: model.evidenceBlockers.map((row) => ({
      id: row.id,
      title: row.title,
      field: row.field,
      fix: row.fix
    })),
    rows: model.rows.map((row) => ({
      id: row.id,
      title: row.title,
      field: row.field,
      passed: row.passed
    })),
    validationCommands,
    stopRules
  }, null, 2));
} else {
  console.log(liveEvidencePacket(config, model));
}
