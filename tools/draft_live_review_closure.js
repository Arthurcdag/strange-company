const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { parsePublicOrderConfig } = require("./strict_public_data");

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
const documentRoot = argValue("--document-root")
  ? path.resolve(process.cwd(), argValue("--document-root"))
  : root;
const termsDocumentPath = argValue("--terms-doc")
  ? path.resolve(process.cwd(), argValue("--terms-doc"))
  : path.join(documentRoot, "TERMOS.md");
const privacyDocumentPath = argValue("--privacy-doc")
  ? path.resolve(process.cwd(), argValue("--privacy-doc"))
  : path.join(documentRoot, "AVISO_DE_PRIVACIDADE.md");

const REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1";

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
  return JSON.parse(read("LIVE_REVIEW_CLOSURE.template.json"));
}

function isIsoDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text);
}

function normalizeDocumentText(value) {
  return String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function documentSourcePath(canonicalPath) {
  if (canonicalPath === "TERMOS.md") return termsDocumentPath;
  if (canonicalPath === "AVISO_DE_PRIVACIDADE.md") return privacyDocumentPath;
  return path.join(documentRoot, canonicalPath);
}

function documentDigest(canonicalPath) {
  const contents = fs.readFileSync(documentSourcePath(canonicalPath), "utf8");
  return crypto
    .createHash("sha256")
    .update(
      `${REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath=${canonicalPath}\n${normalizeDocumentText(contents)}`,
      "utf8"
    )
    .digest("hex");
}

function draftGate(gate, publicDate) {
  const documents = Array.isArray(gate.documentsReviewed) ? gate.documentsReviewed : [];
  return {
    ...gate,
    reviewedAt: gate.reviewedAt || publicDate || "",
    documentDigests: Object.fromEntries(
      documents.map((canonicalPath) => [canonicalPath, documentDigest(canonicalPath)])
    ),
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
      "Each documentDigest binds a canonical path to the normalized bytes present when this draft was created; responsible humans must review those exact files.",
      "If any required document changes, regenerate this packet and repeat the affected human review before --require-ready.",
      "Do not store private reviewer notes, CPF/CNPJ, bank data, payment dashboard URLs, credentials, or customer-private material in git.",
      "Do not use this packet to set liveMode true.",
      "Run: node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready",
      "After a ready packet passes, run node tools/bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json, review its exact four-date plan, and apply only that plan ID transactionally while liveMode remains false."
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
