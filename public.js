const DEFAULT_PUBLIC_ORDER_CONFIG = {
  operatorName: "Strange Works Studio",
  jurisdiction: "BR",
  complianceMode: "brazil-draft",
  aiGeneratedLegalDocsRequireHumanReview: true,
  supportEmail: "tuiidagnese+strangeworks@gmail.com",
  googleFormUrl: "",
  supportInboxVerified: true,
  googleFormVerified: false,
  termsReviewedAt: "",
  privacyReviewedAt: "",
  brazilComplianceReviewedAt: "",
  aiHandoffReviewedAt: "",
  liveMode: false,
  services: [
    {
      id: "proof-sprint",
      title: "Compliance proof sprint",
      detail: "Evidence map, checklist cleanup, monthly proof packet, exception notes, and exportable receipt.",
      price: 750
    },
    {
      id: "template-pack",
      title: "Compliance template pack",
      detail: "Checklist templates and renewal worksheets for teams not ready for a managed sprint.",
      price: 79
    }
  ]
};

const PUBLIC_ORDER_CONFIG = {
  ...DEFAULT_PUBLIC_ORDER_CONFIG,
  ...(window.PUBLIC_ORDER_CONFIG || {}),
  services: Array.isArray(window.PUBLIC_ORDER_CONFIG?.services) && window.PUBLIC_ORDER_CONFIG.services.length
    ? window.PUBLIC_ORDER_CONFIG.services
    : DEFAULT_PUBLIC_ORDER_CONFIG.services
};
const PUBLIC_LIVE_RECEIPT = window.PUBLIC_LIVE_RECEIPT || {};
let CURRENT_PUBLIC_LIVE_RECEIPT = PUBLIC_LIVE_RECEIPT;
const PUBLIC_LEGAL_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_LEGAL_DOCUMENT_V1";
const PUBLIC_LEGAL_DOCUMENT_SPECS = Object.freeze([
  Object.freeze({ key: "terms", path: "TERMOS.md" }),
  Object.freeze({ key: "privacy", path: "AVISO_DE_PRIVACIDADE.md" })
]);

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeGoogleFormUrl(value) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return "";
  }
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.href.startsWith("https://docs.google.com/forms/") ? url.href : "";
  } catch {
    return "";
  }
}

function requestId() {
  return `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`;
}

function amaId() {
  return `AMA-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`;
}

function findSensitiveData(text) {
  const value = String(text || "");
  const checks = [
    ["protected health information", /\b(PHI|patient|diagnosis|medical record|MRN|health record|treatment|prescription)\b/i],
    ["payment card data", /\b(?:\d[ -]*?){13,19}\b/],
    ["social security number", /\b\d{3}-\d{2}-\d{4}\b/],
    ["Brazil personal or company tax ID", /\b(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})\b/],
    ["password or secret", /\b(password|passcode|secret|private key|api[_ -]?key|access token|bearer token)\b/i],
    ["private key material", /-----BEGIN [A-Z ]*PRIVATE KEY-----/i]
  ];
  return checks.filter(([, pattern]) => pattern.test(value)).map(([label]) => label);
}

function selectedService(serviceId) {
  return PUBLIC_ORDER_CONFIG.services.find((service) => service.id === serviceId) || PUBLIC_ORDER_CONFIG.services[0];
}

function canonicalPublicText(value) {
  return String(value || "").trim();
}

function canonicalPublicConfigCore(config, legalDocuments) {
  const services = Array.isArray(config.services) ? config.services : [];
  return {
    operatorName: canonicalPublicText(config.operatorName),
    jurisdiction: canonicalPublicText(config.jurisdiction),
    complianceMode: canonicalPublicText(config.complianceMode),
    aiGeneratedLegalDocsRequireHumanReview: config.aiGeneratedLegalDocsRequireHumanReview === true,
    support: {
      email: canonicalPublicText(config.supportEmail),
      verified: config.supportInboxVerified === true
    },
    form: {
      url: canonicalPublicText(config.googleFormUrl),
      verified: config.googleFormVerified === true
    },
    flags: {
      supportInboxVerified: config.supportInboxVerified === true,
      googleFormVerified: config.googleFormVerified === true,
      liveMode: false
    },
    reviewDates: {
      termsReviewedAt: canonicalPublicText(config.termsReviewedAt),
      privacyReviewedAt: canonicalPublicText(config.privacyReviewedAt),
      brazilComplianceReviewedAt: canonicalPublicText(config.brazilComplianceReviewedAt),
      aiHandoffReviewedAt: canonicalPublicText(config.aiHandoffReviewedAt)
    },
    legalDocuments,
    services: services.map((service) => ({
      id: canonicalPublicText(service.id),
      title: canonicalPublicText(service.title),
      detail: canonicalPublicText(service.detail),
      price: Number(service.price || 0)
    }))
  };
}

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256Hex(value) {
  if (!globalThis.crypto || !globalThis.crypto.subtle || typeof TextEncoder === "undefined") {
    return "";
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizePublicLegalDocumentText(value) {
  return String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

async function fetchPublicAssetText(assetPath) {
  const requestOptions = { cache: "no-store", credentials: "same-origin" };
  const canAbort = typeof AbortController === "function";
  const controller = canAbort ? new AbortController() : null;
  let timeoutId = null;
  if (controller && typeof window.setTimeout === "function") {
    requestOptions.signal = controller.signal;
    timeoutId = window.setTimeout(() => controller.abort(), 5000);
  }
  try {
    const response = await fetch(assetPath, requestOptions);
    if (!response || response.ok !== true) {
      throw new Error(`Could not verify public asset ${assetPath}.`);
    }
    const contents = await response.text();
    if (typeof contents !== "string" || contents.length > 1000000) {
      throw new Error(`Public asset ${assetPath} has an invalid size.`);
    }
    return contents;
  } finally {
    if (timeoutId !== null && typeof window.clearTimeout === "function") {
      window.clearTimeout(timeoutId);
    }
  }
}

async function publicLegalDocumentCore() {
  const documents = {};
  for (const spec of PUBLIC_LEGAL_DOCUMENT_SPECS) {
    const contents = normalizePublicLegalDocumentText(await fetchPublicAssetText(spec.path));
    const sha256 = await sha256Hex(
      `${PUBLIC_LEGAL_DOCUMENT_DIGEST_DOMAIN}\npath=${spec.path}\n${contents}`
    );
    if (!/^[a-f0-9]{64}$/.test(sha256)) {
      throw new Error(`Could not hash public legal document ${spec.path}.`);
    }
    documents[spec.key] = { path: spec.path, sha256 };
  }
  return documents;
}

function parsePublicLiveReceiptScript(contents) {
  const prefix = "window.PUBLIC_LIVE_RECEIPT = Object.freeze(";
  const source = String(contents).trim();
  if (!source.startsWith(prefix) || !source.endsWith(");")) {
    throw new Error("Public live receipt wrapper is invalid.");
  }
  return JSON.parse(source.slice(prefix.length, -2));
}

async function fetchCurrentPublicLiveReceipt() {
  return parsePublicLiveReceiptScript(await fetchPublicAssetText("public-live-receipt.js"));
}

function receiptEnvelopePayload(receipt, receiptCore) {
  return {
    schemaVersion: receipt.schemaVersion,
    mode: receipt.mode,
    status: receipt.status,
    issuedAt: receipt.issuedAt,
    validUntil: receipt.validUntil,
    core: receiptCore,
    coreSha256: receipt.coreSha256,
    attestations: receipt.attestations
  };
}

function hasExactKeys(value, expected) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return stableSerialize(Object.keys(value).sort()) === stableSerialize([...expected].sort());
}

function digestablePublicCore(core) {
  const copy = JSON.parse(JSON.stringify(core));
  if (copy && copy.flags && typeof copy.flags === "object") {
    delete copy.flags.liveMode;
  }
  return copy;
}

function publicLiveReceiptFresh(receipt = CURRENT_PUBLIC_LIVE_RECEIPT, now = Date.now()) {
  const issuedAt = String(receipt && receipt.issuedAt || "");
  const validUntil = String(receipt && receipt.validUntil || "");
  const issuedDate = new Date(issuedAt);
  const validUntilDate = new Date(validUntil);
  return Boolean(
    issuedAt
    && validUntil
    && !Number.isNaN(issuedDate.valueOf())
    && !Number.isNaN(validUntilDate.valueOf())
    && issuedDate.toISOString() === issuedAt
    && validUntilDate.toISOString() === validUntil
    && issuedDate.valueOf() <= now + (5 * 60 * 1000)
    && validUntilDate.valueOf() > now
    && validUntilDate.valueOf() - issuedDate.valueOf() > 0
    && validUntilDate.valueOf() - issuedDate.valueOf() <= (7 * 24 * 60 * 60 * 1000)
  );
}

async function publicLiveReceiptReady(config = PUBLIC_ORDER_CONFIG, receipt = CURRENT_PUBLIC_LIVE_RECEIPT, now = Date.now()) {
  const attestations = receipt && receipt.attestations ? receipt.attestations : {};
  const receiptCore = receipt && receipt.core && typeof receipt.core === "object"
    ? receipt.core
    : null;
  try {
    const legalDocuments = await publicLegalDocumentCore();
    if (!(
      receipt
      && hasExactKeys(receipt, ["schemaVersion", "mode", "status", "issuedAt", "validUntil", "core", "coreSha256", "attestations", "envelopeSha256"])
      && hasExactKeys(attestations, ["publicOnly", "privatePacketDataExcluded", "privatePacketHashesExcluded", "localPacketValidatorsPassed", "reviewerCandidateTrackerReady", "deliveryReviewChecklistReady", "operationalValidatorsPassed", "digestCoversCanonicalPublicCoreExceptLiveMode", "digestCoversReceiptEnvelopeExceptLiveMode"])
      && receipt.schemaVersion === 2
      && receipt.mode === "public"
      && receipt.status === "local_packet_validators_passed"
      && publicLiveReceiptFresh(receipt, now)
      && /^[a-f0-9]{64}$/.test(String(receipt.coreSha256 || ""))
      && /^[a-f0-9]{64}$/.test(String(receipt.envelopeSha256 || ""))
      && attestations.publicOnly === true
      && attestations.privatePacketDataExcluded === true
      && attestations.privatePacketHashesExcluded === true
      && attestations.localPacketValidatorsPassed === true
      && attestations.reviewerCandidateTrackerReady === true
      && attestations.deliveryReviewChecklistReady === true
      && attestations.operationalValidatorsPassed === true
      && attestations.digestCoversCanonicalPublicCoreExceptLiveMode === true
      && attestations.digestCoversReceiptEnvelopeExceptLiveMode === true
      && receiptCore
      && receiptCore.flags
      && receiptCore.flags.liveMode === false
      && stableSerialize(digestablePublicCore(receiptCore)) === stableSerialize(digestablePublicCore(canonicalPublicConfigCore(config, legalDocuments)))
    )) {
      return false;
    }
    const expectedCoreDigest = await sha256Hex(
      `STRANGE_COMPANY_PUBLIC_LIVE_CORE_V1\n${stableSerialize(digestablePublicCore(receiptCore))}`
    );
    if (expectedCoreDigest !== receipt.coreSha256) {
      return false;
    }
    const expectedEnvelopeDigest = await sha256Hex(
      `STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V2\n${stableSerialize(receiptEnvelopePayload(receipt, digestablePublicCore(receiptCore)))}`
    );
    return expectedEnvelopeDigest === receipt.envelopeSha256;
  } catch {
    return false;
  }
}

let PUBLIC_LIVE_RECEIPT_VERIFIED = false;
let PUBLIC_LIVE_RECEIPT_REFRESH_EPOCH = 0;
let LATEST_PUBLIC_LIVE_RECEIPT_REFRESH = Promise.resolve(false);

function refreshPublicLiveReceiptVerification() {
  const refreshEpoch = ++PUBLIC_LIVE_RECEIPT_REFRESH_EPOCH;
  const refresh = (async () => {
    let latestReceipt = {};
    let latestVerified = false;
    try {
      latestReceipt = await fetchCurrentPublicLiveReceipt();
      latestVerified = await publicLiveReceiptReady(
        PUBLIC_ORDER_CONFIG,
        latestReceipt
      );
    } catch {
      latestReceipt = {};
      latestVerified = false;
    }
    if (refreshEpoch !== PUBLIC_LIVE_RECEIPT_REFRESH_EPOCH) {
      return PUBLIC_LIVE_RECEIPT_VERIFIED;
    }
    CURRENT_PUBLIC_LIVE_RECEIPT = latestReceipt;
    PUBLIC_LIVE_RECEIPT_VERIFIED = latestVerified;
    renderReadiness();
    setPublicOrderAvailability();
    return PUBLIC_LIVE_RECEIPT_VERIFIED;
  })();
  LATEST_PUBLIC_LIVE_RECEIPT_REFRESH = refresh;
  return refresh;
}

async function waitForLatestPublicLiveReceiptRefresh() {
  let pendingRefresh;
  do {
    pendingRefresh = LATEST_PUBLIC_LIVE_RECEIPT_REFRESH;
    await pendingRefresh;
  } while (pendingRefresh !== LATEST_PUBLIC_LIVE_RECEIPT_REFRESH);
  return PUBLIC_LIVE_RECEIPT_VERIFIED;
}

function publicReadinessModel(receiptIntegrityReady = PUBLIC_LIVE_RECEIPT_VERIFIED, now = Date.now()) {
  const formUrl = safeGoogleFormUrl(PUBLIC_ORDER_CONFIG.googleFormUrl);
  const supportReady = Boolean(canonicalPublicText(PUBLIC_ORDER_CONFIG.supportEmail) && PUBLIC_ORDER_CONFIG.supportInboxVerified);
  const formReady = Boolean(formUrl && PUBLIC_ORDER_CONFIG.googleFormVerified);
  const termsReady = Boolean(canonicalPublicText(PUBLIC_ORDER_CONFIG.termsReviewedAt));
  const privacyReady = Boolean(canonicalPublicText(PUBLIC_ORDER_CONFIG.privacyReviewedAt));
  const brazilReady = canonicalPublicText(PUBLIC_ORDER_CONFIG.jurisdiction) === "BR"
    && PUBLIC_ORDER_CONFIG.aiGeneratedLegalDocsRequireHumanReview === true
    && Boolean(canonicalPublicText(PUBLIC_ORDER_CONFIG.brazilComplianceReviewedAt))
    && Boolean(canonicalPublicText(PUBLIC_ORDER_CONFIG.aiHandoffReviewedAt));
  const receiptReady = receiptIntegrityReady === true && publicLiveReceiptFresh(CURRENT_PUBLIC_LIVE_RECEIPT, now);
  const liveReady = Boolean(PUBLIC_ORDER_CONFIG.liveMode === true && receiptReady && supportReady && formReady && termsReady && privacyReady && brazilReady);
  const blockers = [];
  if (!supportReady) blockers.push("support inbox");
  if (!formReady) blockers.push("Google intake");
  if (!termsReady) blockers.push("terms review");
  if (!privacyReady) blockers.push("privacy review");
  if (!brazilReady) blockers.push("Brazil compliance and AI human review");
  if (!receiptReady) blockers.push("strict public live receipt");
  if (!PUBLIC_ORDER_CONFIG.liveMode) blockers.push("live-mode flag");
  return {
    formUrl,
    supportReady,
    formReady,
    termsReady,
    privacyReady,
    brazilReady,
    receiptReady,
    liveReady,
    blockers
  };
}

function renderReadiness() {
  const target = document.querySelector("#publicReadiness");
  if (!target) {
    return;
  }
  const model = publicReadinessModel();
  const tone = model.liveReady ? "green" : "amber";
  target.innerHTML = `
    <div>
      <span class="metric-label">Public intake status</span>
      <h2>${model.liveReady ? "Live intake configured" : "Public intake closed"}</h2>
      <p>${model.liveReady
        ? "Support, Google intake, Brazil review gates, terms, and privacy review are configured for manual pilot intake."
        : `Still waiting on: ${escapeHtml(model.blockers.join(", "))}. Public intake is closed; use the private command center for test packets until the live gate is reviewed.`}</p>
    </div>
    <div class="readiness-pill ${tone}">${model.liveReady ? "Ready" : "Manual"}</div>
    <div class="readiness-checks">
      <span class="state ${model.supportReady ? "green" : "amber"}">Support</span>
      <span class="state ${model.formReady ? "green" : "amber"}">Google intake</span>
      <span class="state ${model.brazilReady ? "green" : "amber"}">Brazil</span>
      <span class="state ${model.termsReady ? "green" : "amber"}">Terms</span>
      <span class="state ${model.privacyReady ? "green" : "amber"}">Privacy</span>
      <span class="state ${model.receiptReady ? "green" : "amber"}">Live receipt</span>
    </div>
  `;
}

function setPublicOrderAvailability() {
  const readiness = publicReadinessModel();
  const form = document.querySelector("#publicOrderForm");
  const fields = document.querySelector("#publicOrderFields");
  const closed = document.querySelector("#publicOrderClosed");
  if (!form || !fields || !closed) {
    return;
  }

  const liveReady = readiness.liveReady === true;
  form.hidden = !liveReady;
  form.setAttribute("aria-hidden", String(!liveReady));
  fields.hidden = !liveReady;
  fields.disabled = !liveReady;
  closed.hidden = liveReady;
  closed.setAttribute("aria-hidden", String(liveReady));
}

function schedulePublicReceiptExpiry() {
  const expiresAt = new Date(String(CURRENT_PUBLIC_LIVE_RECEIPT.validUntil || "")).valueOf();
  if (!PUBLIC_LIVE_RECEIPT_VERIFIED || !Number.isFinite(expiresAt)) {
    return;
  }
  const delay = Math.max(0, expiresAt - Date.now());
  window.setTimeout(() => {
    renderReadiness();
    setPublicOrderAvailability();
  }, delay);
}

function schedulePublicReceiptRevalidation() {
  window.setInterval(() => {
    void refreshPublicLiveReceiptVerification();
  }, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refreshPublicLiveReceiptVerification();
    }
  });
}

function requestPacket(order) {
  return [
    `Request ID: ${order.id}`,
    `Operator: ${PUBLIC_ORDER_CONFIG.operatorName}`,
    `Jurisdiction: Brazil`,
    `Customer: ${order.customer}`,
    `Contact: ${order.contact}`,
    `Service: ${order.serviceTitle}`,
    `Requested monthly amount: ${money.format(Number(order.amount || 0))}`,
    `Source: Public Order Desk`,
    "",
    "Need:",
    order.need,
    "",
    "Controls:",
    "Manual invoice request only.",
    "No payment data is collected by this site.",
    "No protected health information, credentials, private keys, sensitive personal data, or regulated source documents are accepted in v1.",
    "AI-generated legal, tax, privacy, and compliance copy requires human review before use."
  ].join("\n");
}

function amaQuestionPacket(question) {
  return [
    `AMA Question ID: ${question.id}`,
    `Operator: ${PUBLIC_ORDER_CONFIG.operatorName}`,
    `Jurisdiction: Brazil`,
    `Name: ${question.name}`,
    `Contact: ${question.contact}`,
    `Topic: ${question.topic}`,
    `Source: Public AMA Desk`,
    "",
    "Question:",
    question.question,
    "",
    "Controls:",
    "Public-safe AMA question only.",
    "No order, invoice, payment request, customer support ticket, or launch approval is created.",
    "No protected health information, credentials, private keys, CPF, CNPJ documents, payment data, private evidence, or regulated source documents are accepted.",
    "AI-generated legal, tax, privacy, accounting, payment, refund, and compliance answers require human review before operational use."
  ].join("\n");
}

function mailtoUrl(order) {
  const subject = `Invoice request ${order.id} / ${order.customer}`;
  return `mailto:${encodeURIComponent(PUBLIC_ORDER_CONFIG.supportEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestPacket(order))}`;
}

function amaMailtoUrl(question) {
  const subject = `AMA question ${question.id} / ${question.topic}`;
  return `mailto:${encodeURIComponent(PUBLIC_ORDER_CONFIG.supportEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(amaQuestionPacket(question))}`;
}

function renderBlocked(message) {
  const output = document.querySelector("#publicOrderOutput");
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">Request blocked</span>
    <strong>${escapeHtml(message)}</strong>
  `;
}

function renderAmaBlocked(message) {
  const output = document.querySelector("#publicAmaOutput");
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">AMA blocked</span>
    <strong>${escapeHtml(message)}</strong>
  `;
}

function renderAmaPacket(question) {
  const output = document.querySelector("#publicAmaOutput");
  const packet = amaQuestionPacket(question);
  const readiness = publicReadinessModel();
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">AMA packet created</span>
    <strong>${escapeHtml(question.id)} / ${escapeHtml(question.topic)}</strong>
    <p>${readiness.supportReady ? "Open the email draft or copy the packet for the public AMA queue." : "Copy this packet and send it only after the support route is verified."}</p>
    <div class="order-output-actions">
      ${readiness.supportReady ? `<a href="${amaMailtoUrl(question)}">Open AMA email</a>` : ""}
      <button type="button" id="copyAmaPacket">Copy AMA packet</button>
    </div>
    <pre>${escapeHtml(packet)}</pre>
  `;
  const copyButton = document.querySelector("#copyAmaPacket");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(packet);
        copyButton.textContent = "Copied";
      } catch {
        copyButton.textContent = "Copy unavailable";
      }
    });
  }
}

function publicAmaAnswersModel() {
  const packet = window.PUBLIC_AMA_ANSWERS || {};
  const answers = Array.isArray(packet.answers) ? packet.answers : [];
  return answers
    .filter((answer) => (
      answer
      && answer.questionId
      && answer.publicSafeQuestion
      && answer.publicAnswer
      && answer.answerReviewedAt
    ))
    .slice(0, 12);
}

function renderPublicAmaAnswers() {
  const target = document.querySelector("#publicAmaAnswerList");
  if (!target) {
    return;
  }
  const answers = publicAmaAnswersModel();
  if (!answers.length) {
    target.innerHTML = `
      <article class="public-ama-answer empty">
        <span class="metric-label">No answers published</span>
        <p>Approved answers will appear here after the local AMA queue is exported to the public archive.</p>
      </article>
    `;
    return;
  }
  target.innerHTML = answers.map((answer) => `
    <article class="public-ama-answer">
      <div>
        <span class="metric-label">${escapeHtml(answer.topic || "public-ama")} / ${escapeHtml(answer.questionId)}</span>
        <h3>${escapeHtml(answer.publicSafeQuestion)}</h3>
      </div>
      <p>${escapeHtml(answer.publicAnswer)}</p>
      <small>Reviewed ${escapeHtml(answer.answerReviewedAt)}${answer.publishedAt ? ` / published ${escapeHtml(answer.publishedAt)}` : ""}</small>
    </article>
  `).join("");
}

function setupAmaForm() {
  const form = document.querySelector("#publicAmaForm");
  if (!form) {
    return;
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    refreshPublicLiveReceiptVerification();
    await waitForLatestPublicLiveReceiptRefresh();
    const readiness = publicReadinessModel();
    if (!readiness.supportReady) {
      renderAmaBlocked("AMA is closed until the public support inbox is verified.");
      return;
    }
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim().slice(0, 120);
    const contact = String(formData.get("contact") || "").trim().slice(0, 160);
    const topic = String(formData.get("topic") || "other").trim().slice(0, 80);
    const question = String(formData.get("question") || "").trim().slice(0, 1200);
    const clean = Boolean(formData.get("clean"));
    const boundary = Boolean(formData.get("boundary"));

    if (!name || !contact || !question) {
      renderAmaBlocked("Name, contact email, and question are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) {
      renderAmaBlocked("Use a valid contact email.");
      return;
    }
    if (!clean || !boundary) {
      renderAmaBlocked("Confirm the AMA data boundary before creating the packet.");
      return;
    }
    const sensitiveFindings = findSensitiveData([name, contact, topic, question].join("\n"));
    if (sensitiveFindings.length) {
      renderAmaBlocked(`Remove ${sensitiveFindings.join(", ")} before submitting.`);
      return;
    }

    renderAmaPacket({
      id: amaId(),
      name,
      contact,
      topic,
      question
    });
    form.reset();
  });
}

function renderPacket(order) {
  const output = document.querySelector("#publicOrderOutput");
  const packet = requestPacket(order);
  const readiness = publicReadinessModel();
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">Request packet created</span>
    <strong>${escapeHtml(order.id)} / ${escapeHtml(order.customer)}</strong>
    <p>${readiness.formReady ? "Open the verified Google intake and paste the packet there." : "Forward this packet manually until the Google intake is verified."}</p>
    <div class="order-output-actions">
      ${readiness.liveReady ? `<a href="${mailtoUrl(order)}">Open email draft</a>` : ""}
      ${readiness.liveReady && readiness.formReady ? `<a href="${escapeHtml(readiness.formUrl)}" target="_blank" rel="noreferrer">Open Google intake</a>` : ""}
      <button type="button" id="copyPublicPacket">Copy packet</button>
    </div>
    <pre>${escapeHtml(packet)}</pre>
  `;
  const copyButton = document.querySelector("#copyPublicPacket");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(packet);
        copyButton.textContent = "Copied";
      } catch {
        copyButton.textContent = "Copy unavailable";
      }
    });
  }
}

function setupForm() {
  const form = document.querySelector("#publicOrderForm");
  const serviceSelect = document.querySelector("#publicService");
  const amountInput = document.querySelector("#publicAmount");
  serviceSelect.innerHTML = PUBLIC_ORDER_CONFIG.services
    .map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.title)} / ${money.format(service.price)}</option>`)
    .join("");
  serviceSelect.addEventListener("change", () => {
    amountInput.value = selectedService(serviceSelect.value).price;
  });
  amountInput.value = selectedService(serviceSelect.value).price;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    refreshPublicLiveReceiptVerification();
    await waitForLatestPublicLiveReceiptRefresh();
    const readiness = publicReadinessModel();
    if (!readiness.liveReady) {
      renderBlocked(`Public intake is closed until these gates are reviewed: ${readiness.blockers.join(", ")}.`);
      return;
    }
    const formData = new FormData(form);
    const customer = String(formData.get("customer") || "").trim().slice(0, 120);
    const contact = String(formData.get("contact") || "").trim().slice(0, 160);
    const service = selectedService(String(formData.get("service") || ""));
    const amount = Number(formData.get("amount") || service.price);
    const need = String(formData.get("need") || "").trim().slice(0, 1200);
    const clean = Boolean(formData.get("clean"));
    const terms = Boolean(formData.get("terms"));

    if (!customer || !contact || !need) {
      renderBlocked("Customer, contact email, and need are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) {
      renderBlocked("Use a valid contact email.");
      return;
    }
    if (!clean || !terms) {
      renderBlocked("Confirm the data boundary and manual invoice acknowledgement first.");
      return;
    }
    const sensitiveFindings = findSensitiveData([customer, contact, need].join("\n"));
    if (sensitiveFindings.length) {
      renderBlocked(`Remove ${sensitiveFindings.join(", ")} before submitting.`);
      return;
    }

    renderPacket({
      id: requestId(),
      customer,
      contact,
      serviceTitle: service.title,
      amount,
      need
    });
    form.reset();
    amountInput.value = selectedService(serviceSelect.value).price;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await refreshPublicLiveReceiptVerification();
  schedulePublicReceiptExpiry();
  schedulePublicReceiptRevalidation();
  renderPublicAmaAnswers();
  setupAmaForm();
  setupForm();
});
