const REQUIRED_GATE_IDS = Object.freeze([
  "entity",
  "tax_nfse",
  "payment",
  "privacy_lgpd",
  "support",
  "terms_offer"
]);

const GATE_LABELS = Object.freeze({
  entity: "Entity/CNPJ or approved operating route",
  tax_nfse: "Tax, CNAE, municipal registration, and NFS-e",
  payment: "Payment provider, payout, refund, and reconciliation",
  privacy_lgpd: "LGPD, privacy contact, retention, and data boundary",
  support: "Support, refund, complaint, and incident ownership",
  terms_offer: "Offer, terms, refund, and scope review"
});

const ALLOWED_STATUSES = Object.freeze([
  "missing",
  "partial",
  "approved",
  "blocked",
  "unclear"
]);

const REQUIRED_READY_GATE_FIELDS = Object.freeze([
  "reviewer_role",
  "reviewed_at",
  "allowed_scope",
  "private_location_hint"
]);

const REQUIRED_PUBLIC_CONFIG_DATES = Object.freeze([
  "termsReviewedAt",
  "privacyReviewedAt",
  "brazilComplianceReviewedAt",
  "aiHandoffReviewedAt"
]);

const REQUIRED_CHECKS_BEFORE_LIVE_MODE = Object.freeze([
  "node tools\\preflight_public_launch.js",
  "node tools\\validate_revenue_setup_evidence.js",
  "node tools\\report_revenue_setup_gaps.js",
  "node tools\\audit_company_functionality.js",
  "node tools\\check_revenue_setup_schema_sync.js",
  "node tools\\check_revenue_setup_evidence_gate.js",
  "node tools\\validate_revenue_setup_evidence.js --require-ready",
  "node tools\\audit_company_functionality.js --require-live",
  "node tools\\survival_check.js",
  "python -B -m unittest discover -s tests",
  "git diff --check"
]);

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isIsoDate(value) {
  if (isBlank(value)) return false;
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(text);
}

function hasPlaceholder(value) {
  return /YYYYMMDD|YYYY-MM-DD/.test(String(value || ""));
}

function isClosedBlocker(value) {
  if (isBlank(value)) return true;
  return /^(none|n\/a|closed|no blockers)$/i.test(String(value).trim());
}

function gatePriority(status) {
  return {
    blocked: 0,
    unclear: 1,
    missing: 2,
    partial: 3,
    approved: 4
  }[status] ?? 2;
}

module.exports = {
  ALLOWED_STATUSES,
  GATE_LABELS,
  REQUIRED_CHECKS_BEFORE_LIVE_MODE,
  REQUIRED_GATE_IDS,
  REQUIRED_PUBLIC_CONFIG_DATES,
  REQUIRED_READY_GATE_FIELDS,
  gatePriority,
  hasPlaceholder,
  isBlank,
  isClosedBlocker,
  isIsoDate
};
