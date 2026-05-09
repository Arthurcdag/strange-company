const PUBLIC_ORDER_CONFIG = {
  operatorName: "Strange Works Studio",
  supportEmail: "ops@strangeworks.studio",
  googleFormUrl: "",
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

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
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

function findSensitiveData(text) {
  const value = String(text || "");
  const checks = [
    ["protected health information", /\b(PHI|patient|diagnosis|medical record|MRN|health record|treatment|prescription)\b/i],
    ["payment card data", /\b(?:\d[ -]*?){13,19}\b/],
    ["social security number", /\b\d{3}-\d{2}-\d{4}\b/],
    ["password or secret", /\b(password|passcode|secret|private key|api[_ -]?key|access token|bearer token)\b/i],
    ["private key material", /-----BEGIN [A-Z ]*PRIVATE KEY-----/i]
  ];
  return checks.filter(([, pattern]) => pattern.test(value)).map(([label]) => label);
}

function selectedService(serviceId) {
  return PUBLIC_ORDER_CONFIG.services.find((service) => service.id === serviceId) || PUBLIC_ORDER_CONFIG.services[0];
}

function requestPacket(order) {
  return [
    `Request ID: ${order.id}`,
    `Operator: ${PUBLIC_ORDER_CONFIG.operatorName}`,
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
    "No protected health information, credentials, private keys, or regulated source documents are accepted in v1."
  ].join("\n");
}

function mailtoUrl(order) {
  const subject = `Invoice request ${order.id} / ${order.customer}`;
  return `mailto:${encodeURIComponent(PUBLIC_ORDER_CONFIG.supportEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestPacket(order))}`;
}

function renderBlocked(message) {
  const output = document.querySelector("#publicOrderOutput");
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">Request blocked</span>
    <strong>${escapeHtml(message)}</strong>
  `;
}

function renderPacket(order) {
  const output = document.querySelector("#publicOrderOutput");
  const packet = requestPacket(order);
  const formUrl = safeGoogleFormUrl(PUBLIC_ORDER_CONFIG.googleFormUrl);
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">Request packet created</span>
    <strong>${escapeHtml(order.id)} / ${escapeHtml(order.customer)}</strong>
    <p>Send this packet to the operator. If the Google Form is configured, open it and paste the packet there.</p>
    <div class="order-output-actions">
      <a href="${mailtoUrl(order)}">Open email draft</a>
      ${formUrl ? `<a href="${escapeHtml(formUrl)}" target="_blank" rel="noreferrer">Open Google intake</a>` : ""}
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
  setupForm();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
