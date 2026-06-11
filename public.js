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

function publicReadinessModel() {
  const formUrl = safeGoogleFormUrl(PUBLIC_ORDER_CONFIG.googleFormUrl);
  const supportReady = Boolean(PUBLIC_ORDER_CONFIG.supportEmail && PUBLIC_ORDER_CONFIG.supportInboxVerified);
  const formReady = Boolean(formUrl && PUBLIC_ORDER_CONFIG.googleFormVerified);
  const termsReady = Boolean(PUBLIC_ORDER_CONFIG.termsReviewedAt);
  const privacyReady = Boolean(PUBLIC_ORDER_CONFIG.privacyReviewedAt);
  const brazilReady = PUBLIC_ORDER_CONFIG.jurisdiction === "BR"
    && PUBLIC_ORDER_CONFIG.aiGeneratedLegalDocsRequireHumanReview === true
    && Boolean(PUBLIC_ORDER_CONFIG.brazilComplianceReviewedAt)
    && Boolean(PUBLIC_ORDER_CONFIG.aiHandoffReviewedAt);
  const liveReady = Boolean(PUBLIC_ORDER_CONFIG.liveMode && supportReady && formReady && termsReady && privacyReady && brazilReady);
  const blockers = [];
  if (!supportReady) blockers.push("support inbox");
  if (!formReady) blockers.push("Google intake");
  if (!termsReady) blockers.push("terms review");
  if (!privacyReady) blockers.push("privacy review");
  if (!brazilReady) blockers.push("Brazil compliance and AI human review");
  if (!PUBLIC_ORDER_CONFIG.liveMode) blockers.push("live-mode flag");
  return {
    formUrl,
    supportReady,
    formReady,
    termsReady,
    privacyReady,
    brazilReady,
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
    </div>
  `;
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

function setupAmaForm() {
  const form = document.querySelector("#publicAmaForm");
  if (!form) {
    return;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
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

document.addEventListener("DOMContentLoaded", () => {
  renderReadiness();
  setupAmaForm();
  setupForm();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
