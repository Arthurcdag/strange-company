const scenarios = {
  base: [
    ["Growth experiments", 35, "Ads, launches, partnerships, and sales tests.", "#bd3d2a"],
    ["Product automation", 25, "SaaS features, agents, integrations, and internal tools.", "#28689a"],
    ["Resilience reserve", 15, "Cash buffer, legal reserve, and migration capacity.", "#267a55"],
    ["Security compliance", 10, "Audits, monitoring, bug bounties, accounting, and legal.", "#6b4fa3"],
    ["Acquisitions", 10, "Small tools, domains, data sets, newsletters, and APIs.", "#a96c16"],
    ["Wild research", 5, "Capped bets that may create unusual advantages.", "#111111"]
  ],
  defense: [
    ["Growth experiments", 25, "Reduced experiments while defense posture increases.", "#bd3d2a"],
    ["Product automation", 20, "Core product work and reliability upgrades.", "#28689a"],
    ["Resilience reserve", 25, "Cash buffer, legal reserve, and migration capacity.", "#267a55"],
    ["Security compliance", 18, "Audits, monitoring, bug bounties, accounting, and legal.", "#6b4fa3"],
    ["Acquisitions", 7, "Only defensive or infrastructure acquisitions.", "#a96c16"],
    ["Wild research", 5, "Small asymmetric bets with strict caps.", "#111111"]
  ],
  growth: [
    ["Growth experiments", 45, "Ads, launches, partnerships, and sales tests.", "#bd3d2a"],
    ["Product automation", 25, "SaaS features, agents, integrations, and internal tools.", "#28689a"],
    ["Resilience reserve", 10, "Minimum reserve contribution stays intact.", "#267a55"],
    ["Security compliance", 8, "Controls remain funded while expansion accelerates.", "#6b4fa3"],
    ["Acquisitions", 9, "Small revenue assets and distribution assets.", "#a96c16"],
    ["Wild research", 3, "Only the sharpest unusual bets.", "#111111"]
  ]
};

const experiments = [
  {
    title: "Dental compliance tracker",
    status: "Scale",
    note: "Concierge version produced three paid pilots and low support load.",
    budget: "$4,200",
    payback: "31 days"
  },
  {
    title: "Bookkeeper referral wedge",
    status: "Measure",
    note: "Partner landing page is live for two vertical bookkeeping firms.",
    budget: "$1,100",
    payback: "Unknown"
  },
  {
    title: "Document audit trail",
    status: "Build",
    note: "Adds upload history, retention rules, and exportable proof packet.",
    budget: "$6,500",
    payback: "45 days"
  },
  {
    title: "Search ads v1",
    status: "Kill",
    note: "High click cost and low buyer intent after two capped cycles.",
    budget: "$600",
    payback: "Missed"
  },
  {
    title: "Template pack",
    status: "Scale",
    note: "Paid checklist bundle converts without a full SaaS account.",
    budget: "$900",
    payback: "9 days"
  },
  {
    title: "License database",
    status: "Review",
    note: "Possible acquisition of local license requirement data set.",
    budget: "$8,000",
    payback: "70 days"
  }
];

const scores = [
  ["Legal", 4.4],
  ["Financial", 4.0],
  ["Operational", 3.8],
  ["Technical", 4.2],
  ["Vendor", 3.6],
  ["Data", 4.5],
  ["Reputation", 4.1]
];

function defaultExecutionPackets() {
  return [
  {
    id: "proof-packet",
    title: "Build exportable compliance proof packet",
    detail: "PDF plus CSV export from the tracker audit trail.",
    budget: 2400,
    due: "10 days",
    state: "Open",
    source: "Manual packet",
    acceptance: "PDF export, CSV export, audit trail checksum"
  },
  {
    id: "storage-review",
    title: "Security review for storage rules",
    detail: "Review access policy, retention defaults, and backup posture.",
    budget: 1800,
    due: "7 days",
    state: "Open",
    source: "Manual packet",
    acceptance: "Threat model, storage policy diff, backup test"
  },
  {
    id: "clinic-interviews",
    title: "Interview 12 clinic operators",
    detail: "Validated notes, willingness to pay, and purchasing trigger.",
    budget: 1200,
    due: "14 days",
    state: "Awarded",
    source: "Manual packet",
    acceptance: "12 transcripts, buyer trigger table, price sensitivity"
  },
  {
    id: "processor-backup-plan",
    title: "Payment processor backup plan",
    detail: "Migration checklist and duplicate checkout path.",
    budget: 900,
    due: "9 days",
    state: "Draft",
    source: "Manual packet",
    acceptance: "Migration checklist, second checkout route, rollback test"
  }
  ];
}

function defaultAutonomousOutcomes() {
  return [
    {
      id: "outcome-template-pack",
      title: "Template pack converts before account signup",
      source: "Prior delivery / template pack",
      decision: "scale",
      metric: "9 day payback",
      evidence: "Paid checklist bundle converted without requiring a full SaaS account.",
      next: "Issue distribution packet",
      artifactUrl: "",
      measuredBefore: "0 paid bundles in week 1",
      measuredAfter: "11 paid bundles in week 2",
      nextClaim: "A distribution packet should issue scale capital for the bundle landing page.",
      gateRunId: "",
      createdAt: "2026-05-05T00:00:00.000Z"
    },
    {
      id: "outcome-search-ads-v1",
      title: "Search ads v1 missed buyer intent",
      source: "Experiment / search ads v1",
      decision: "kill",
      metric: "Low-intent spend lane closed",
      evidence: "High click cost and low buyer intent after two capped cycles.",
      next: "Cool down paid search scale lane",
      artifactUrl: "",
      measuredBefore: "Cycle 1: $4.20 cost per click, 0 buyer-stage replies",
      measuredAfter: "Cycle 2: $3.80 cost per click, 0 buyer-stage replies",
      nextClaim: "Paid search scale lane should be cooled until a narrower buyer trigger is found.",
      gateRunId: "",
      createdAt: "2026-05-05T00:00:00.000Z"
    }
  ];
}

function defaultCooldownLanes() {
  return [];
}

function defaultResilienceDrills() {
  return [
    {
      id: "treasury-capture",
      title: "Treasury capture attempt",
      vector: "Governance",
      severity: "A",
      score: 4.6,
      status: "Queued",
      probe: "A signer tries to approve spend without a Research Gate receipt.",
      response: "Reject the move, freeze the signer lane, and publish the decision trail.",
      packetTitle: "Build treasury signer anomaly monitor",
      packetBudget: 1900,
      due: "8 days",
      acceptance: "Signer threshold check, anomaly alert, frozen-lane audit entry"
    },
    {
      id: "vendor-lock-in",
      title: "Critical vendor lock-in",
      vector: "Vendor",
      severity: "B",
      score: 3.4,
      status: "Queued",
      probe: "A core service raises prices and blocks clean export during growth mode.",
      response: "Open migration packet and require secondary provider rehearsal.",
      packetTitle: "Create vendor exit rehearsal kit",
      packetBudget: 1600,
      due: "10 days",
      acceptance: "Export script, second-provider checklist, rollback rehearsal"
    },
    {
      id: "claim-laundering",
      title: "Claim laundering in treasury",
      vector: "Epistemic",
      severity: "A",
      score: 3.7,
      status: "Queued",
      probe: "A weak growth claim is rewritten as a safety claim to bypass budget limits.",
      response: "Route the claim back through the Research Gate with stricter context.",
      packetTitle: "Add claim lineage guard to treasury queue",
      packetBudget: 1400,
      due: "7 days",
      acceptance: "Claim lineage field, changed-scope warning, blocked approval demo"
    },
    {
      id: "data-loss-drill",
      title: "Audit data loss drill",
      vector: "Data",
      severity: "B",
      score: 4.3,
      status: "Queued",
      probe: "An audit-log store becomes unavailable during a customer proof export.",
      response: "Fail over to backup records and verify checksum continuity.",
      packetTitle: "Automate audit-log restore verification",
      packetBudget: 2100,
      due: "9 days",
      acceptance: "Restore proof, checksum match, export continuity report"
    }
  ];
}

function defaultLaunchGate() {
  return {
    serviceStatus: "unknown",
    checkedAt: "",
    launchPacketId: ""
  };
}

function defaultRevenuePilot() {
  return {
    offer: {
      id: "compliance-proof-sprint",
      title: "Compliance proof sprint",
      niche: "Dental and clinic operators",
      price: 750,
      targetMrr: 4000,
      promise: "Turn scattered compliance evidence into a monthly proof packet operators can show, export, and keep current.",
      delivery: "Checklist cleanup, evidence map, proof export, renewal watchlist, and monthly exception notes.",
      status: "Offer drafted"
    },
    blockers: [
      {
        id: "entity",
        title: "Legal wrapper selected",
        detail: "Entity, ownership, and authority path are written before invoices are sent.",
        done: false,
        critical: true
      },
      {
        id: "payments",
        title: "Payment route ready",
        detail: "Brazil bank/payment route, fiscal receipt/NFS-e process, reconciliation, and refund path are defined.",
        done: false,
        critical: true
      },
      {
        id: "accounting",
        title: "Accounting lane ready",
        detail: "Bookkeeping, tax regime, CNAE/NFS-e owner, and monthly reconciliation owner are defined.",
        done: false,
        critical: true
      },
      {
        id: "terms",
        title: "Terms and privacy copy ready",
        detail: "Brazil scope, data handling, LGPD path, support, cancellation, and limits are visible.",
        done: false,
        critical: true
      },
      {
        id: "support",
        title: "Support route ready",
        detail: "Pilot customers have a response address, triage rule, and incident path.",
        done: false,
        critical: false
      }
    ],
    leads: [
      {
        id: "lead-northside-dental",
        name: "Northside Dental Ops",
        source: "Warm intro",
        need: "Renewal evidence folder is scattered across email and drives.",
        stage: "Contacted",
        value: 750,
        createdAt: "2026-05-07T00:00:00.000Z"
      },
      {
        id: "lead-park-clinic",
        name: "Park Clinic Admin",
        source: "Operator interview",
        need: "Needs proof export before insurer audit.",
        stage: "Prospect",
        value: 750,
        createdAt: "2026-05-07T00:00:00.000Z"
      },
      {
        id: "lead-ridge-dental",
        name: "Ridge Dental Group",
        source: "Referral",
        need: "Wants a monthly compliance packet without a full SaaS migration.",
        stage: "Call booked",
        value: 950,
        createdAt: "2026-05-07T00:00:00.000Z"
      }
    ]
  };
}

function defaultSatelliteCompany() {
  return {
    companyName: "Strange Works Studio",
    purpose: "A normal for-profit vendor that sells compliance proof work, templates, and operations support while Strange Company keeps its treasury sealed.",
    targetNetProfit: 3500,
    services: [
      {
        id: "proof-sprint",
        title: "Compliance proof sprint",
        detail: "Done-for-you evidence cleanup and monthly proof packet for clinics.",
        price: 750,
        unitCost: 210,
        customers: 6,
        source: "External customers",
        relatedParty: false,
        active: true
      },
      {
        id: "template-pack",
        title: "Compliance template pack",
        detail: "Downloadable checklists and renewal worksheets sold before SaaS onboarding.",
        price: 79,
        unitCost: 8,
        customers: 12,
        source: "External customers",
        relatedParty: false,
        active: true
      },
      {
        id: "gate-maintenance",
        title: "Research Gate maintenance",
        detail: "Optional contracted upkeep for the local claim-checking service after public beta.",
        price: 1200,
        unitCost: 360,
        customers: 0,
        source: "Related-party contract",
        relatedParty: true,
        active: false
      },
      {
        id: "bounty-admin",
        title: "Bounty admin desk",
        detail: "Optional work-packet admin, acceptance triage, and vendor coordination.",
        price: 900,
        unitCost: 240,
        customers: 0,
        source: "Related-party contract",
        relatedParty: true,
        active: false
      }
    ],
    controls: [
      {
        id: "external-customers",
        title: "External customer revenue exists",
        detail: "Profit comes from real third-party buyers before any Strange Company contract is counted.",
        done: true,
        critical: true
      },
      {
        id: "market-pricing",
        title: "Market pricing evidence",
        detail: "Related-party services use comparable quotes or public rates, not arbitrary extraction.",
        done: true,
        critical: true
      },
      {
        id: "written-contracts",
        title: "Written scope and deliverables",
        detail: "Every paid service has a scope, acceptance criteria, refund path, and data boundary.",
        done: false,
        critical: true
      },
      {
        id: "invoices",
        title: "Invoices and bookkeeping lane",
        detail: "Revenue, expenses, taxes, and support obligations are tracked outside the Strange Company treasury.",
        done: false,
        critical: true
      },
      {
        id: "conflict-review",
        title: "Conflict disclosure review",
        detail: "Any work sold to Strange Company is disclosed and can be rejected by the gate.",
        done: false,
        critical: true
      },
      {
        id: "vendor-exit",
        title: "Replaceable vendor rule",
        detail: "Strange Company can choose a different vendor if the satellite becomes expensive, weak, or captured.",
        done: true,
        critical: false
      }
    ]
  };
}

function defaultOperations() {
  return {
    operatorName: "Strange Works Studio",
    supportEmail: "tuiidagnese+strangeworks@gmail.com",
    paymentMode: "Manual invoice only",
    invoicePrefix: "SWS",
    nextInvoiceNumber: 1001,
    integration: {
      googleSheetUrl: "",
      googleFormUrl: "",
      appsScriptUrl: "",
      stripeDashboardUrl: "",
      termsReviewedAt: "",
      privacyReviewedAt: ""
    },
    launchChecklist: [
      {
        id: "brazil-operator-confirmed",
        title: "Brazilian operator confirmed",
        detail: "CNPJ or approved Brazilian operating structure is recorded with a responsible human operator.",
        done: false,
        completedAt: ""
      },
      {
        id: "tax-route-reviewed",
        title: "Tax and NFS-e route reviewed",
        detail: "Accountant confirms tax regime, CNAE, municipal setup needs, and NFS-e or reviewed receipt path.",
        done: false,
        completedAt: ""
      },
      {
        id: "bank-open",
        title: "Business bank/payment account open",
        detail: "Operating account opened in the Brazilian operator's name and ready for payment-provider payouts.",
        done: false,
        completedAt: ""
      },
      {
        id: "payment-route-active",
        title: "Manual payment route active",
        detail: "Payment provider or manual invoice route is verified for the operator, with payouts, refunds, and reconciliation understood.",
        done: false,
        completedAt: ""
      },
      {
        id: "support-inbox",
        title: "Support inbox monitored",
        detail: "Real monitored support inbox is reachable and the operator checks it daily.",
        done: false,
        completedAt: ""
      },
      {
        id: "sheet-ledger",
        title: "Google Sheet ledger live",
        detail: "Sheet has Requests, Invoices, Customers, Delivery, Incidents tabs with the required columns.",
        done: false,
        completedAt: ""
      },
      {
        id: "terms-reviewed",
        title: "Terms reviewed",
        detail: "Customer-facing terms reviewed before taking the first payment.",
        done: false,
        completedAt: ""
      },
      {
        id: "privacy-reviewed",
        title: "Privacy notice reviewed",
        detail: "LGPD privacy notice, legal bases, rights request path, and processor list reviewed before taking the first payment.",
        done: false,
        completedAt: ""
      },
      {
        id: "first-invoice-sent",
        title: "First safe test order completed",
        detail: "At least one safe test request has completed payment/fiscal evidence, delivery, and receipt-chain closeout.",
        done: false,
        completedAt: ""
      }
    ],
    controls: [
      {
        id: "entity",
        title: "Entity and tax identity ready",
        detail: "Brazilian legal name, CNPJ or approved route, signer authority, and customer contract path are confirmed.",
        done: false,
        critical: true
      },
      {
        id: "payment",
        title: "Payment route ready",
        detail: "Bank, payment provider or manual invoice route, NFS-e/receipt path, refund path, and failed-payment handling are ready.",
        done: false,
        critical: true
      },
      {
        id: "accounting",
        title: "Bookkeeping lane ready",
        detail: "Invoice numbers, fiscal receipt/NFS-e evidence, tax review, and monthly reconciliation are defined.",
        done: false,
        critical: true
      },
      {
        id: "support",
        title: "Support inbox monitored",
        detail: "The support inbox exists, is monitored, and has an incident escalation path.",
        done: false,
        critical: true
      },
      {
        id: "terms",
        title: "Terms published",
        detail: "Customer scope, payment terms, cancellation, refund, and service limits are visible.",
        done: true,
        critical: true
      },
      {
        id: "privacy",
        title: "Privacy notice published",
        detail: "Data handling, local storage, retention, LGPD rights, AI boundary, and contact route are visible.",
        done: true,
        critical: true
      },
      {
        id: "no-regulated-data",
        title: "No regulated data in v0",
        detail: "The first service accepts summaries and document lists, not protected health, payment, credential, sensitive personal, or regulated source data.",
        done: true,
        critical: false
      }
    ],
    orders: [
      {
        id: "order-clinic-proof-sprint",
        invoiceNumber: "SWS-1000",
        customer: "Clinic operator",
        contact: "buyer@example.com",
        serviceId: "proof-sprint",
        serviceTitle: "Compliance proof sprint",
        need: "Needs a monthly proof packet before renewal.",
        amount: 750,
        status: "Draft",
        createdAt: "2026-05-08T00:00:00.000Z"
      }
    ]
  };
}

function defaultRevenueStart() {
  return {
    lanes: REVENUE_START_LANES.map((lane) => ({
      id: lane.id,
      tasks: lane.tasks.map((task) => ({
        id: task.id,
        done: false,
        completedAt: ""
      }))
    })),
    packets: []
  };
}

function defaultExternalSignals() {
  return [];
}

const pilotStages = ["Prospect", "Contacted", "Call booked", "Committed", "Ready to invoice"];
const salesLeadStages = ["prospect", "qualified", "invoice_ready", "invoice_sent", "paid", "delivered", "rejected"];
const operationStages = ["Draft", "Sent", "Paid", "Delivered"];
const signalSources = ["Alpaca", "Binance", "Zotero", "Life Science Research", "GitHub"];
const signalStatuses = ["observed", "triaged", "routed", "rejected"];
const LEDGER_HEADERS = [
  "created_at",
  "source",
  "invoice_id",
  "customer",
  "contact",
  "service",
  "amount",
  "status",
  "stripe_invoice_url",
  "delivery_due",
  "notes"
];
const LEDGER_STATUSES = ["Draft", "Sent", "Paid", "Delivered"];
const LEADS_HEADERS = [
  "created_at",
  "lead_id",
  "customer",
  "contact",
  "service",
  "amount",
  "source",
  "stage",
  "qualification_note",
  "order_id",
  "notes"
];

const gateChecks = [
  {
    title: "Compliance tracker scale-up",
    status: "Needs bridge",
    note: "Simulation success cannot carry a production revenue claim without production traces.",
    budget: "Issue simulation_to_production_scope_shift",
    payback: "Probe required"
  },
  {
    title: "No evidence against X",
    status: "Blocked",
    note: "Absence of disproof is not a double negation and should not become effective_yes.",
    budget: "Issue epistemic_to_ontological_shift",
    payback: "Reject"
  },
  {
    title: "Charter-compatible growth",
    status: "Review",
    note: "Accept only when the claim preserves scope, definition, and testability.",
    budget: "Gate with strictness high",
    payback: "Guardian log"
  }
];

const logs = [
  ["B", "Approve concierge compliance tracker for dental niche.", "Guardian review", "Approved", "green"],
  ["A", "Deploy capped search ad test for compliance templates.", "Treasury engine", "Closed", "amber"],
  ["B", "Negotiate data set license under acquisition cap.", "Outside counsel", "Review", "amber"],
  ["Incident", "Payment webhook retries exceeded normal range.", "Automation", "Resolved", "green"],
  ["C", "Consider purpose trust wrapper after v0 revenue proof.", "Guardians", "Deferred", "red"]
];

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
});

const GATE_API_URL = "http://127.0.0.1:8000/evaluate_argument";
const GATE_RUNS_KEY = "strange-company-gate-runs";
const TREASURY_PROPOSALS_KEY = "strange-company-treasury-proposals";
const EXECUTION_PACKETS_KEY = "strange-company-execution-packets";
const AUTONOMOUS_OUTCOMES_KEY = "strange-company-outcomes";
const OUTCOME_REVIEWS_KEY = "strange-company-outcome-reviews";
const COOLDOWN_LANES_KEY = "strange-company-cooldown-lanes";
const RESILIENCE_DRILLS_KEY = "strange-company-resilience-drills";
const LAUNCH_GATE_KEY = "strange-company-launch-gate";
const RECEIPT_SEAL_KEY = "strange-company-receipt-seal";
const REVENUE_PILOT_KEY = "strange-company-revenue-pilot";
const SATELLITE_COMPANY_KEY = "strange-company-satellite-company";
const SALES_LEADS_KEY = "strange-company-sales-leads";
const OPERATIONS_KEY = "strange-company-operations";
const REVENUE_START_KEY = "strange-company-revenue-start";
const OPERATION_INCIDENTS_KEY = "strange-company-operation-incidents";
const DAILY_PILOT_RUN_KEY = "strange-company-daily-pilot-run";
const EXTERNAL_SIGNALS_KEY = "strange-company-external-signals";
const SETUP_EVIDENCE_KEY = "strange-company-setup-evidence";
const CUSTOMER_ACQUISITION_KEY = "strange-company-customer-acquisition";
const ADAPTIVE_OPERATOR_KEY = "strange-company-adaptive-operator";
const INCIDENT_SEVERITIES = ["info", "low", "medium", "high"];
const INCIDENT_STATUSES = ["open", "mitigating", "resolved", "closed"];
const SETUP_EVIDENCE_STATUSES = ["missing", "pending", "verified", "blocked"];
const SETUP_EVIDENCE_SLOTS = [
  { id: "entity", label: "Brazilian operator/CNPJ", detail: "Brazilian entity, CNPJ, or approved operating structure confirmed with responsible human owner." },
  { id: "tax-regime", label: "Tax regime and CNAE", detail: "Accountant-reviewed tax regime, CNAE, municipal registration needs, and bookkeeping owner." },
  { id: "nfse", label: "NFS-e or fiscal receipt route", detail: "NFS-e portal or legally reviewed fiscal receipt route tested before paid operation." },
  { id: "bank", label: "Business bank/payment account", detail: "Operating bank or payment account opened in the Brazilian operator's name with payouts wired in." },
  { id: "payment", label: "Payment route active", detail: "Payment provider or manual invoice route verified with payout, refund, and reconciliation process." },
  { id: "support-inbox", label: "Support inbox monitored", detail: "Real monitored inbox is reachable and read every business day." },
  { id: "lgpd-contact", label: "LGPD contact path", detail: "Privacy and data-subject requests route to a responsible human operator." },
  { id: "google-sheet", label: "Google Sheet ledger", detail: "Live Sheet with Requests, Invoices, Customers, Delivery, Incidents, Leads tabs." },
  { id: "google-form", label: "Google Form intake", detail: "Public intake form points at the verified sheet and obeys boundaries." },
  { id: "terms-review", label: "Terms reviewed", detail: "Customer-facing terms reviewed before sending the first paid invoice." },
  { id: "privacy-review", label: "LGPD privacy notice reviewed", detail: "Privacy notice reviewed for legal bases, rights request path, retention, processors, and AI boundary before collecting customer detail." }
];
const BRAZIL_COMPLIANCE_AGENTS = [
  {
    id: "entity-cnpj",
    title: "Entity/CNPJ agent",
    setupIds: ["entity"],
    aiCan: "Prepare the entity route comparison, data-free founder checklist, and evidence packet template.",
    humanMust: "Founder, accountant, or lawyer confirms the operating structure, CNPJ route, municipal needs, and responsible legal owner.",
    evidence: "CNPJ/entity artifact or reviewed operating-structure note stored outside the repo, then referenced in Setup Evidence.",
    stopRule: "Do not ask for payment or issue fiscal documents while the operating entity route is unresolved."
  },
  {
    id: "tax-nfse",
    title: "Tax/NFS-e agent",
    setupIds: ["tax-regime", "nfse"],
    aiCan: "Prepare CNAE questions, NFS-e test script, bookkeeping handoff, and the invoice evidence checklist.",
    humanMust: "Accountant or responsible operator validates CNAE, tax regime, municipal registration, NFS-e access, and fiscal receipt route.",
    evidence: "Accountant-reviewed tax note plus successful NFS-e or legally reviewed fiscal receipt test.",
    stopRule: "Do not mark an invoice sent until fiscal issuance and tax owner are verified."
  },
  {
    id: "payment-reconciliation",
    title: "Payment/reconciliation agent",
    setupIds: ["bank", "payment"],
    aiCan: "Prepare payout, refund, chargeback, and ledger reconciliation procedures without touching credentials.",
    humanMust: "Operator opens and verifies the bank/payment route, runs a payout path, and confirms refund handling.",
    evidence: "Bank/payment account proof, provider route, payout owner, and reconciliation note.",
    stopRule: "Do not collect money through an unverified account or a route without refund and reconciliation ownership."
  },
  {
    id: "support-incidents",
    title: "Support/incident agent",
    setupIds: ["support-inbox"],
    aiCan: "Draft response macros, incident triage categories, and daily inbox review checklist.",
    humanMust: "Operator verifies a monitored support inbox and confirms who reads it every business day.",
    evidence: "Reachable support inbox, monitoring schedule, escalation owner, and incident logging route.",
    stopRule: "Do not open intake when no human can receive support, refund, privacy, or complaint messages."
  },
  {
    id: "lgpd-privacy",
    title: "LGPD/privacy agent",
    setupIds: ["lgpd-contact", "privacy-review"],
    aiCan: "Prepare a privacy review diff, data inventory, processor list, retention questions, and rights-request packet.",
    humanMust: "Privacy owner or lawyer reviews LGPD basis, data-subject rights path, retention, processors, security, and AI boundary.",
    evidence: "Reviewed privacy notice, LGPD contact route, and human owner for data-subject requests.",
    stopRule: "Do not collect customer detail before the rights path and privacy notice are human-reviewed."
  },
  {
    id: "consumer-terms",
    title: "Consumer/terms agent",
    setupIds: ["terms-review"],
    aiCan: "Prepare terms redlines for scope, cancellation, refund, delivery, consumer information, and support promises.",
    humanMust: "Lawyer or responsible operator confirms the offer terms, customer disclosures, refund path, and service limitation language.",
    evidence: "Human-reviewed terms date and customer-facing support/refund route.",
    stopRule: "Do not send the first paid offer with AI-only terms or unclear cancellation/refund language."
  },
  {
    id: "intake-ledger",
    title: "Intake/ledger agent",
    setupIds: ["google-sheet", "google-form"],
    aiCan: "Prepare form-field boundaries, Sheet tab checks, TSV import test rows, and no-sensitive-data warnings.",
    humanMust: "Operator verifies the live Google Form writes to the correct Sheet and excludes regulated or sensitive data.",
    evidence: "Live Sheet, live Form URL, test submission, and owner note for ledger maintenance.",
    stopRule: "Do not rely on public intake until the form route and ledger tabs are verified."
  },
  {
    id: "ai-human-review",
    title: "AI human-review agent",
    setupIds: ["terms-review", "privacy-review", "lgpd-contact"],
    aiCan: "Prepare a no-submit handoff with every AI-drafted legal, tax, privacy, and compliance artifact that needs human approval.",
    humanMust: "Lawyer, accountant, founder, or operator signs off the relevant artifact and records dates in public-config.js before live mode.",
    evidence: "AI_LEGAL_HANDOFF.md reviewed, terms/privacy review dates set, Brazil compliance review date set, and AI handoff review date set.",
    stopRule: "Do not treat AI output as legal, accounting, privacy, or tax approval."
  }
];
const ACQUISITION_LEAD_SOURCES = ["referral", "email", "form", "direct", "partner"];
const REVENUE_START_LANES = [
  {
    id: "strange-company",
    label: "Strange Company lane",
    owner: "Sealed reinvestment company",
    posture: "Operate the private control system without taking direct customer money.",
    tasks: [
      {
        id: "sealed-boundary",
        title: "Sealed boundary confirmed",
        detail: "No private governance material, secrets, customer records, or payment data move into the public repo.",
        required: true
      },
      {
        id: "online-gate-reviewed",
        title: "Online Gate reviewed",
        detail: "The current launch phase is checked before making any public or commercial claim.",
        required: true
      },
      {
        id: "treasury-hold",
        title: "Treasury hold active",
        detail: "Strange Company does not invoice customers directly; any revenue proof comes through the second company lane.",
        required: true
      },
      {
        id: "receipt-chain-baseline",
        title: "Receipt chain baseline ready",
        detail: "Material revenue-start state can be sealed after the operator issues the start packet.",
        required: true
      }
    ]
  },
  {
    id: "second-company",
    label: "Second company lane",
    owner: "Strange Works Studio",
    posture: "Run the manual paid pilot as a normal for-profit operator with separate books.",
    tasks: [
      {
        id: "setup-evidence",
        title: "External setup evidence checked",
        detail: "Brazilian entity/CNPJ, tax regime, NFS-e, bank/payment, support, LGPD, Sheet, Form, terms, and privacy evidence are reviewed outside the repo.",
        required: true
      },
      {
        id: "qualified-lead",
        title: "First qualified lead ready",
        detail: "A real external buyer has a scoped request that fits the no-regulated-data v0 boundary.",
        required: true
      },
      {
        id: "manual-invoice-route",
        title: "Manual invoice route ready",
        detail: "Manual payment request, Sheet ledger, and NFS-e/receipt paths are configured before the first invoice is sent.",
        required: true
      },
      {
        id: "daily-run",
        title: "Daily pilot run started",
        detail: "The workday is tracked through the Daily pilot run console with stop rules available.",
        required: true
      },
      {
        id: "delivery-closeout",
        title: "Delivery closeout route ready",
        detail: "Delivery artifact, acceptance note, incident route, and receipt-chain seal are part of the day-one loop.",
        required: true
      }
    ]
  }
];
const DAILY_RUN_CHECKS = [
  { id: "review-requests", title: "Review new requests", detail: "Sheet Requests tab, support inbox, and Order Desk submissions." },
  { id: "qualify-customer", title: "Qualify customer", detail: "Real external buyer, allowed service, consumer-law status checked, no regulated data in the request." },
  { id: "manual-payment", title: "Create manual payment request", detail: "Manually create the reviewed hosted payment/invoice route and copy the URL." },
  { id: "ledger-update", title: "Update ledger", detail: "Payment URL and fiscal/NFS-e status pasted into the order or ledger row." },
  { id: "track-payment", title: "Track payment", detail: "Move the order to Paid only after settlement." },
  { id: "deliver", title: "Deliver", detail: "Send the scoped proof packet; record artifact URL and acceptance note." },
  { id: "log-incidents", title: "Log incidents", detail: "Anything off-script becomes an incident row in the Sheet and the chain." },
  { id: "seal-chain", title: "Seal receipt chain", detail: "Decisions view: capture the day's root before closing the run." }
];
const DAILY_RUN_STOP_RULES = [
  { id: "payment-hold", title: "Payment route on hold", detail: "Payment provider, bank, or payout route has flagged, restricted, or held the account or payouts." },
  { id: "bank-restricted", title: "Business bank/payment account restricted", detail: "The Brazilian operator's bank or payment account is frozen, restricted, or under review." },
  { id: "regulated-data", title: "Regulated or sensitive data submitted", detail: "An intake included regulated source documents, secrets, or sensitive personal data the operator did not solicit." },
  { id: "fiscal-route-blocked", title: "Fiscal receipt route blocked", detail: "NFS-e, receipt, tax, or accounting route is blocked or unreconciled." },
  { id: "sheet-outage", title: "Sheet ledger outage", detail: "The Google Sheet ledger is inaccessible or out of sync with payment/fiscal evidence." },
  { id: "support-outage", title: "Support inbox outage", detail: "The support inbox is unmonitored or unreachable for the day." },
  { id: "terms-change", title: "Terms or privacy change required", detail: "Terms or privacy require an unscheduled change before sending more invoices." }
];
const ADAPTIVE_DAMAGE_ROUTES = [
  {
    id: "live-gate",
    label: "Live gate blocker",
    lane: "public-config.js / OPERATOR_FAST_START.md / LIVE_HANDOFF_CHECKLIST.md / OPERATIONS_START_PACKET.md",
    countermeasure: "Keep liveMode false, record the missing external evidence, and rerun the live audit only after the artifact is real."
  },
  {
    id: "brazil-compliance",
    label: "Brazil compliance blocker",
    lane: "BRAZIL_COMPLIANCE.md / BRAZIL_COMPLIANCE_AGENTS.md / AI_LEGAL_HANDOFF.md",
    countermeasure: "Prepare the smallest legal, tax, LGPD, fiscal, or AI handoff packet and leave final closure to the responsible human."
  },
  {
    id: "google-form",
    label: "Google Form or ledger blocker",
    lane: "GOOGLE_FORM_INTAKE.md / tools/google_apps_script_create_intake_form.gs / GOOGLE_SHEET_LEDGER.md",
    countermeasure: "Narrow the intake route to a manual Form or Sheet verification step, then require one safe test response before marking the route verified."
  },
  {
    id: "support-incident",
    label: "Support or incident failure",
    lane: "SUPPORT.md / SUPPORT_INBOX_EVIDENCE.md / OPERATIONS_RUNBOOK.md",
    countermeasure: "Pause affected work, record the incident response, and verify the monitored inbox or escalation owner before reopening the lane."
  },
  {
    id: "customer-order",
    label: "Customer order or delivery failure",
    lane: "ORDER_DESK.md / OPERATIONS_RUNBOOK.md / receipt-chain order timeline",
    countermeasure: "Keep the order in its current safe state, add missing payment, fiscal, delivery, or acceptance evidence, and avoid advancing the status early."
  },
  {
    id: "growth-experiment",
    label: "Experiment or spend weakness",
    lane: "AUTONOMOUS_CYCLE.md / OUTCOME_REVIEW.md / CAPITAL_ROUTER.md",
    countermeasure: "Route the weak outcome to revise or kill, narrow the next experiment, and require a Research Gate receipt before new spend."
  },
  {
    id: "security-resilience",
    label: "Security or resilience weakness",
    lane: "RESILIENCE_MODEL.md / RESILIENCE_DRILLS.md / tools/survival_check.js",
    countermeasure: "Issue a hardening packet, add a survival check if the weakness is structural, and keep private state off the public surface."
  },
  {
    id: "failed-command",
    label: "Failed command or workflow",
    lane: "ADAPTIVE_OPERATOR_PROTOCOL.md / OPERATING_SYSTEM.md",
    countermeasure: "Capture the exact failure, change one condition, retry only when the cause is addressed, and leave a reproducible command for the next operator."
  },
  {
    id: "customer-objection",
    label: "Customer objection or rejection",
    lane: "CUSTOMER_ACQUISITION.md / GROWTH_MANAGEMENT.md / ORDER_DESK.md",
    countermeasure: "Turn the objection into a qualification note, narrow the offer or refund path, and do not scale the channel until the concern is resolved."
  }
];

let activeScenario = "base";
let loopAnimationId = 0;
let activeStrictness = "high";
let gateRuns = loadGateRuns();
let treasuryProposals = loadTreasuryProposals();
let executionPackets = loadExecutionPackets();
let autonomousOutcomes = loadAutonomousOutcomes();
let outcomeReviews = loadOutcomeReviews();
let cooldownLanes = loadCooldownLanes();
let resilienceDrills = loadResilienceDrills();
let launchGate = loadLaunchGate();
let receiptSeal = loadReceiptSeal();
let revenuePilot = loadRevenuePilot();
let satelliteCompany = loadSatelliteCompany();
let salesLeads = loadSalesLeads();
let operations = loadOperations();
let revenueStart = loadRevenueStart();
let operationIncidents = loadOperationIncidents();
let dailyPilotRun = loadDailyPilotRun();
let externalSignals = loadExternalSignals();
let setupEvidence = loadSetupEvidence();
let customerAcquisition = loadCustomerAcquisition();
let adaptiveOperator = loadAdaptiveOperator();

function activateView(target) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === target);
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    const isActive = button.dataset.target === target;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function renderBuckets() {
  const surplus = Number(document.querySelector("#surplusInput").value) || 0;
  const grid = document.querySelector("#bucketGrid");
  const data = scenarios[activeScenario];
  grid.innerHTML = data
    .map(([name, percent, description, color]) => {
      const amount = Math.round((surplus * percent) / 100);
      return `
        <article class="bucket-card">
          <div class="bucket-top">
            <div>
              <span class="metric-label">${percent}% allocation</span>
              <strong>${name}</strong>
            </div>
            <span class="pill">${money.format(amount)}</span>
          </div>
          <div class="bar" style="--accent: ${color}; --bar: ${percent}%"><span></span></div>
          <p>${description}</p>
        </article>
      `;
    })
    .join("");
  document.querySelector("#allocatedTotal").textContent = money.format(surplus);
  renderTreasuryGuard();
}

function renderTreasuryGuard() {
  const summary = document.querySelector("#treasuryGuardSummary");
  if (!summary) {
    return;
  }
  const surplus = Number(document.querySelector("#surplusInput").value) || 0;
  const eligible = treasuryProposals
    .filter((proposal) => !proposal.approved && isGatePassing(proposal.recommendation))
    .reduce((total, proposal) => total + Number(proposal.amount || 0), 0);
  const approved = treasuryProposals
    .filter((proposal) => proposal.approved)
    .reduce((total, proposal) => total + Number(proposal.amount || 0), 0);
  const blocked = treasuryProposals
    .filter((proposal) => proposal.status === "blocked")
    .reduce((total, proposal) => total + Number(proposal.amount || 0), 0);
  const reserveMonths = Math.max(3, Math.min(18, Math.round(6 + surplus / 12000)));

  summary.innerHTML = `
    <article class="treasury-guard-card">
      <span class="metric-label">Eligible spend</span>
      <strong>${money.format(eligible)}</strong>
      <p>Unlocked by passing Research Gate receipts.</p>
    </article>
    <article class="treasury-guard-card">
      <span class="metric-label">Approved moves</span>
      <strong>${money.format(approved)}</strong>
      <p>Capital cleared for execution packets.</p>
    </article>
    <article class="treasury-guard-card">
      <span class="metric-label">Blocked spend</span>
      <strong>${money.format(blocked)}</strong>
      <p>Claims that need stronger evidence or bridges.</p>
    </article>
    <article class="treasury-guard-card">
      <span class="metric-label">Reserve posture</span>
      <strong>${reserveMonths} months</strong>
      <p>Estimated runway shield at current surplus mode.</p>
    </article>
  `;
}

function renderTreasuryProposals() {
  const list = document.querySelector("#treasuryProposalList");
  if (!list) {
    return;
  }
  list.innerHTML = treasuryProposals
    .map((proposal) => {
      const tone = toneForProposal(proposal);
      const canApprove = isGatePassing(proposal.recommendation) && !proposal.approved;
      const canIssuePacket = proposal.approved && !proposal.packetId;
      const status = proposal.approved ? "approved" : proposal.status.replace("_", " ");
      const score = Number(proposal.effectiveness || 0).toFixed(3);
      return `
        <article class="treasury-proposal" data-proposal-id="${escapeHtml(proposal.id)}">
          <div>
            <span class="metric-label">Class ${escapeHtml(proposal.className)} / ${escapeHtml(proposal.bucket)}</span>
            <h4>${escapeHtml(proposal.title)}</h4>
            <p>${escapeHtml(proposal.note)}</p>
          </div>
          <strong>${money.format(Number(proposal.amount || 0))}</strong>
          <div>
            <span class="state ${tone}">${escapeHtml(status)}</span>
            <p>${escapeHtml(proposal.recommendation)} / ${escapeHtml(proposal.polarity)} / ${score}</p>
          </div>
          <div class="proposal-actions">
            <button type="button" data-run-proposal="${escapeHtml(proposal.id)}">${proposal.status === "running" ? "Running" : "Run gate"}</button>
            <button class="approve-action" type="button" data-approve-proposal="${escapeHtml(proposal.id)}" ${canApprove ? "" : "disabled"}>Approve</button>
            <button class="packet-action" type="button" data-issue-packet="${escapeHtml(proposal.id)}" ${canIssuePacket ? "" : "disabled"}>${proposal.packetId ? "Packet issued" : "Issue packet"}</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-run-proposal]").forEach((button) => {
    button.addEventListener("click", () => runTreasuryProposalGate(button.dataset.runProposal));
  });
  document.querySelectorAll("[data-approve-proposal]").forEach((button) => {
    button.addEventListener("click", () => approveTreasuryProposal(button.dataset.approveProposal));
  });
  document.querySelectorAll("[data-issue-packet]").forEach((button) => {
    button.addEventListener("click", () => issueExecutionPacket(button.dataset.issuePacket));
  });
}

function renderCooldownLanes() {
  const list = document.querySelector("#cooldownList");
  if (!list) {
    return;
  }

  if (!cooldownLanes.length) {
    list.innerHTML = `
      <article class="cooldown-card">
        <div>
          <span class="metric-label">Capital firewall</span>
          <h4>No lanes cooled</h4>
          <p>Weak spend lanes will appear here after kill outcomes are routed.</p>
        </div>
        <span class="state green">Clear</span>
        <strong>0 cycles</strong>
      </article>
    `;
    return;
  }

  list.innerHTML = cooldownLanes
    .map(
      (lane) => `
        <article class="cooldown-card">
          <div>
            <span class="metric-label">${escapeHtml(lane.source || "Autonomous cycle")}</span>
            <h4>${escapeHtml(lane.lane)}</h4>
            <p>${escapeHtml(lane.reason)}</p>
          </div>
          <span class="state red">Cooled</span>
          <strong>${escapeHtml(lane.expires || "2 cycles")}</strong>
        </article>
      `
    )
    .join("");
}

function renderLaunchGate() {
  const verdict = document.querySelector("#launchVerdict");
  const metrics = document.querySelector("#launchMetrics");
  const phaseList = document.querySelector("#launchPhaseList");
  const checkList = document.querySelector("#launchCheckList");
  if (!verdict || !metrics || !phaseList || !checkList) {
    return;
  }

  const decision = buildLaunchDecision();
  const launchPacket = findLaunchPacket();
  const checkedAt = launchGate.checkedAt
    ? new Date(launchGate.checkedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "Not checked";

  verdict.innerHTML = `
    <div>
      <span class="metric-label">Gate verdict</span>
      <h3>${escapeHtml(decision.headline)}</h3>
      <p>${escapeHtml(decision.detail)}</p>
    </div>
    <div class="launch-mode-card ${decision.tone}">
      <span class="metric-label">Recommended mode</span>
      <strong>${escapeHtml(decision.mode)}</strong>
      <span class="state ${decision.tone}">${escapeHtml(decision.state)}</span>
    </div>
  `;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Gate service</span>
      <strong>${escapeHtml(formatServiceStatus(launchGate.serviceStatus))}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Blocking checks</span>
      <strong>${decision.blockers}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Launch packet</span>
      <strong>${escapeHtml(launchPacket ? launchPacket.state : "None")}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Last check</span>
      <strong>${escapeHtml(checkedAt)}</strong>
    </article>
  `;

  phaseList.innerHTML = launchPhases(decision.mode)
    .map(
      (phase) => `
        <article class="launch-phase">
          <div>
            <span class="metric-label">${escapeHtml(phase.window)}</span>
            <h4>${escapeHtml(phase.name)}</h4>
            <p>${escapeHtml(phase.detail)}</p>
          </div>
          <span class="state ${phase.tone}">${escapeHtml(phase.status)}</span>
          <strong>${escapeHtml(phase.when)}</strong>
        </article>
      `
    )
    .join("");

  checkList.innerHTML = decision.checks
    .map(
      (check) => `
        <article class="launch-check">
          <div>
            <span class="metric-label">${escapeHtml(check.phase)}</span>
            <h4>${escapeHtml(check.title)}</h4>
            <p>${escapeHtml(check.evidence)}</p>
          </div>
          <span class="state ${check.passed ? "green" : check.tone}">${check.passed ? "Pass" : "Block"}</span>
          <strong>${escapeHtml(check.fix)}</strong>
        </article>
      `
    )
    .join("");

  renderLiveEvidencePanel();
}

function publicOrderConfig() {
  return window.PUBLIC_ORDER_CONFIG && typeof window.PUBLIC_ORDER_CONFIG === "object"
    ? window.PUBLIC_ORDER_CONFIG
    : {};
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

function googleFormUrlReady(value) {
  const url = safeHttpsUrl(value);
  return Boolean(url && url.startsWith("https://docs.google.com/forms/"));
}

function coreLiveEvidenceRows(config) {
  return [
    {
      id: "support-inbox",
      title: "Support inbox verified",
      field: "supportEmail + supportInboxVerified",
      passed: Boolean(String(config.supportEmail || "").trim() && config.supportInboxVerified === true),
      evidence: "SUPPORT_INBOX_EVIDENCE.md plus the support section of EXTERNAL_LIVE_PACKET.local.json.",
      fix: "Record monitored inbox owner, cadence, test received timestamp, and reply timestamp."
    },
    {
      id: "google-form-url",
      title: "Google Form URL public and safe",
      field: "googleFormUrl",
      passed: googleFormUrlReady(config.googleFormUrl),
      evidence: "GOOGLE_FORM_INTAKE.md and the Google section of EXTERNAL_LIVE_PACKET.local.json.",
      fix: "Create the Form, link it to the private Sheet, then paste only the public Form URL."
    },
    {
      id: "google-form-verified",
      title: "Google Form test response verified",
      field: "googleFormVerified",
      passed: config.googleFormVerified === true,
      evidence: "Safe test response timestamp in the private Sheet ledger and external live packet.",
      fix: "Submit one safe test response and confirm it lands in the Responses ledger."
    },
    {
      id: "terms-review",
      title: "Terms reviewed by human",
      field: "termsReviewedAt",
      passed: isIsoDate(config.termsReviewedAt),
      evidence: "TERMS.md / TERMOS.md review note and external live packet legalReview section.",
      fix: "Record the actual human review date as YYYY-MM-DD."
    },
    {
      id: "privacy-review",
      title: "Privacy reviewed by human",
      field: "privacyReviewedAt",
      passed: isIsoDate(config.privacyReviewedAt),
      evidence: "PRIVACY.md / AVISO_DE_PRIVACIDADE.md review note and external live packet legalReview section.",
      fix: "Record the actual privacy review date as YYYY-MM-DD."
    },
    {
      id: "brazil-compliance-review",
      title: "Brazil compliance review closed",
      field: "brazilComplianceReviewedAt",
      passed: isIsoDate(config.brazilComplianceReviewedAt),
      evidence: "BRAZIL_COMPLIANCE.md, BRAZIL_COMPLIANCE_AGENTS.md, and human accounting/legal review notes.",
      fix: "Close CNPJ/fiscal/LGPD/payment support review with a responsible human."
    },
    {
      id: "ai-handoff-review",
      title: "AI legal handoff reviewed",
      field: "aiHandoffReviewedAt",
      passed: isIsoDate(config.aiHandoffReviewedAt),
      evidence: "AI_LEGAL_HANDOFF.md and the responsible human review record.",
      fix: "Confirm which AI-prepared text remains draft-only and which human-owned changes are accepted."
    },
    {
      id: "brazil-config",
      title: "Public config remains Brazil-first",
      field: "jurisdiction + aiGeneratedLegalDocsRequireHumanReview",
      passed: config.jurisdiction === "BR" && config.aiGeneratedLegalDocsRequireHumanReview === true,
      evidence: "public-config.js jurisdiction and AI review flags.",
      fix: "Keep jurisdiction BR and require human review for AI-generated legal docs."
    }
  ];
}

function buildLiveEvidenceModel() {
  const config = publicOrderConfig();
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
      evidence: "public-config.js must stay false until all external evidence rows are real.",
      fix: "Set liveMode true only after --require-live passes with real external evidence.",
      stateLabel: config.liveMode === true ? "On" : "Off"
    }
  ];
  const blockers = rows.filter((row) => !row.passed);
  const readyToTurnOn = evidenceBlockers.length === 0 && liveModeSafe;
  return {
    config,
    rows,
    blockers,
    evidenceBlockers,
    readyToTurnOn,
    liveMode: config.liveMode === true,
    state: readyToTurnOn ? "External evidence ready" : "External evidence blocked",
    tone: blockers.length ? "red" : "green",
    nextAction: evidenceBlockers.length
      ? evidenceBlockers[0].fix
      : config.liveMode === true
        ? "Keep monitoring support, intake, reviews, payments, incidents, and receipt-chain seals."
        : "Run the external live packet validator and --require-live before flipping liveMode."
  };
}

function liveEvidencePacket() {
  const model = buildLiveEvidenceModel();
  const config = model.config;
  const missing = model.evidenceBlockers.length
    ? model.evidenceBlockers.map((row) => `- ${row.title} (${row.field}): ${row.fix}`).join("\n")
    : "- No missing external evidence rows detected in the public config.";
  const rows = model.rows
    .map((row) => `- ${row.title}: ${row.passed ? "pass" : "block"} / ${row.field}`)
    .join("\n");
  return [
    "Strange Company external live evidence packet",
    `Generated: ${new Date().toISOString()}`,
    `Operator: ${config.operatorName || "not configured"}`,
    `Jurisdiction: ${config.jurisdiction || "not configured"}`,
    `Live mode: ${config.liveMode === true ? "true" : "false"}`,
    "",
    "[Public Config Snapshot]",
    `supportEmail: ${config.supportEmail || ""}`,
    `supportInboxVerified: ${config.supportInboxVerified === true}`,
    `googleFormUrl: ${config.googleFormUrl || ""}`,
    `googleFormVerified: ${config.googleFormVerified === true}`,
    `termsReviewedAt: ${config.termsReviewedAt || ""}`,
    `privacyReviewedAt: ${config.privacyReviewedAt || ""}`,
    `brazilComplianceReviewedAt: ${config.brazilComplianceReviewedAt || ""}`,
    `aiHandoffReviewedAt: ${config.aiHandoffReviewedAt || ""}`,
    "",
    "[Gate Rows]",
    rows,
    "",
    "[Missing Evidence]",
    missing,
    "",
    "[Validation Commands]",
    "node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live",
    "node tools/audit_company_functionality.js --require-live",
    "",
    "[Stop Rules]",
    "Do not set liveMode true until support, Google Form, terms, privacy, Brazil compliance, and AI handoff evidence are real.",
    "Do not commit EXTERNAL_LIVE_PACKET.local.json, Sheet URLs, Stripe dashboard URLs, bank metadata, private keys, or customer secrets.",
    "Do not treat this packet as legal, tax, privacy, fiscal, payment, or support approval."
  ].join("\n");
}

function renderLiveEvidenceOutput(text, copied) {
  const output = document.querySelector("#liveEvidenceOutput");
  if (!output || !text) {
    return;
  }
  output.classList.add("active");
  output.innerHTML = `
    <article>
      <span class="metric-label">${copied ? "Live evidence packet copied" : "Live evidence packet generated"}</span>
      <pre>${escapeHtml(text)}</pre>
    </article>
  `;
}

function renderLiveEvidencePanel() {
  const panel = document.querySelector("#liveEvidencePanel");
  if (!panel) {
    return;
  }
  const model = buildLiveEvidenceModel();
  const rows = model.rows
    .map((row) => `
      <article class="launch-evidence-row">
        <div>
          <span class="metric-label">${escapeHtml(row.field)}</span>
          <h4>${escapeHtml(row.title)}</h4>
          <p>${escapeHtml(row.evidence)}</p>
        </div>
        <span class="state ${row.passed ? "green" : "red"}">${escapeHtml(row.passed ? row.stateLabel || "Ready" : "Block")}</span>
        <strong>${escapeHtml(row.passed ? "Evidence held" : row.fix)}</strong>
      </article>
    `)
    .join("");
  panel.innerHTML = `
    <article class="launch-evidence-summary ${escapeHtml(model.tone)}">
      <div>
        <span class="metric-label">External live evidence</span>
        <h3>${escapeHtml(model.state)}</h3>
        <p>${escapeHtml(model.nextAction)} This panel reads the public config into the private command center; it does not verify outside accounts by itself.</p>
      </div>
      <div class="launch-evidence-counts">
        <span><strong>${model.evidenceBlockers.length}</strong><small>Evidence gaps</small></span>
        <span><strong>${model.liveMode ? "On" : "Off"}</strong><small>liveMode</small></span>
      </div>
    </article>
    ${rows}
  `;
}

async function copyLiveEvidencePacket(button) {
  const packet = liveEvidencePacket();
  let copied = false;
  try {
    await navigator.clipboard.writeText(packet);
    copied = true;
  } catch {
    copied = false;
  }
  renderLiveEvidenceOutput(packet, copied);
  if (button) {
    const previous = button.getAttribute("title") || "Copy live evidence packet";
    button.setAttribute("title", copied ? "Copied" : "Copy failed");
    setTimeout(() => {
      button.setAttribute("title", previous);
    }, 1500);
  }
}

function buildLaunchDecision() {
  const checks = buildLaunchChecks();
  const sandboxBlockers = checks.filter((check) => check.phase === "Private sandbox" && !check.passed);
  const betaBlockers = checks.filter((check) => check.phase === "Public beta" && !check.passed);
  const liveBlockers = checks.filter((check) => check.phase === "Live operation" && !check.passed);
  const blockers = checks.filter((check) => !check.passed).length;
  const sandboxReady = sandboxBlockers.length === 0;
  const betaReady = sandboxReady && betaBlockers.length === 0;
  const liveReady = betaReady && liveBlockers.length === 0;

  if (!sandboxReady) {
    return {
      mode: "Offline prototype",
      state: "Hold",
      tone: "red",
      blockers,
      checks,
      headline: "Keep it offline until the private sandbox kit is delivered.",
      detail: nextLaunchDetail(sandboxBlockers)
    };
  }

  if (!betaReady) {
    return {
      mode: "Private sandbox",
      state: "Limited online",
      tone: "amber",
      blockers,
      checks,
      headline: "Turn it online only behind private access.",
      detail: nextLaunchDetail(betaBlockers)
    };
  }

  if (!liveReady) {
    return {
      mode: "Public beta",
      state: "Controlled",
      tone: "amber",
      blockers,
      checks,
      headline: "Public beta is possible, but live autonomous operation stays blocked.",
      detail: nextLaunchDetail(liveBlockers)
    };
  }

  return {
    mode: "Live operation",
    state: "Ready",
    tone: "green",
    blockers,
    checks,
    headline: "The launch gate is clear for controlled live operation.",
    detail: "Keep monitoring gate receipts, drills, incidents, and launch packet outcomes."
  };
}

function buildLaunchChecks() {
  const launchPacket = findLaunchPacket();
  const launchDelivered = launchPacket && launchPacket.state === "Delivered";
  const drillsRun = resilienceDrills.filter((drill) => drill.status !== "Queued").length;
  const weakWithoutPacket = resilienceDrills.filter((drill) => drill.status === "Weak" && !drill.packetId).length;
  const routedOutcomes = autonomousOutcomes.filter((outcome) => outcome.proposalId || outcome.cooldownId).length;
  const gateReceipts = gateRuns.length + treasuryProposals.filter((proposal) => proposal.reportId).length;
  const hardeningPackets = executionPackets.filter((packet) => packet.drillId).length;
  const pilotReadiness = buildPilotReadiness();
  const satelliteModel = buildSatelliteCompanyModel();
  const operationsModel = buildOperationsModel();

  return [
    {
      title: "Research Gate service reachable",
      phase: "Private sandbox",
      passed: launchGate.serviceStatus === "ok",
      tone: "red",
      evidence: `Current service status: ${formatServiceStatus(launchGate.serviceStatus)}.`,
      fix: "Run local gate API"
    },
    {
      title: "Charter and operating docs exist",
      phase: "Private sandbox",
      passed: true,
      tone: "red",
      evidence: "Charter, operating system, treasury, resilience, and execution docs are present.",
      fix: "Keep locked"
    },
    {
      title: "Treasury approvals require gate receipts",
      phase: "Private sandbox",
      passed: true,
      tone: "red",
      evidence: "Treasury proposals cannot approve unless the Research Gate accepts the claim.",
      fix: "Keep enforced"
    },
    {
      title: "Private sandbox launch kit delivered",
      phase: "Private sandbox",
      passed: Boolean(launchDelivered),
      tone: "red",
      evidence: launchPacket ? `Launch packet state: ${launchPacket.state}.` : "No launch packet exists yet.",
      fix: launchPacket ? "Deliver launch packet" : "Draft launch packet"
    },
    {
      title: "At least one live gate receipt exists",
      phase: "Public beta",
      passed: gateReceipts > 0,
      tone: "amber",
      evidence: `${gateReceipts} gate receipt${gateReceipts === 1 ? "" : "s"} recorded.`,
      fix: "Run a real claim"
    },
    {
      title: "At least two attack drills have run",
      phase: "Public beta",
      passed: drillsRun >= 2,
      tone: "amber",
      evidence: `${drillsRun} drill${drillsRun === 1 ? "" : "s"} run.`,
      fix: "Run drills"
    },
    {
      title: "Weak drills have hardening packets",
      phase: "Public beta",
      passed: weakWithoutPacket === 0,
      tone: "amber",
      evidence: `${weakWithoutPacket} weak drill${weakWithoutPacket === 1 ? "" : "s"} without a packet.`,
      fix: "Issue hardening"
    },
    {
      title: "Outcome receipts are routed",
      phase: "Public beta",
      passed: routedOutcomes > 0,
      tone: "amber",
      evidence: `${routedOutcomes} outcome route${routedOutcomes === 1 ? "" : "s"} recorded.`,
      fix: "Route outcomes"
    },
    {
      title: "Revenue pilot has a commitment",
      phase: "Public beta",
      passed: pilotReadiness.committedMrr > 0,
      tone: "amber",
      evidence: `${money.format(pilotReadiness.committedMrr)} committed MRR recorded.`,
      fix: "Advance a lead"
    },
    {
      title: "Hardening work exists in the market",
      phase: "Public beta",
      passed: hardeningPackets > 0,
      tone: "amber",
      evidence: `${hardeningPackets} resilience hardening packet${hardeningPackets === 1 ? "" : "s"} issued.`,
      fix: "Issue packet"
    },
    {
      title: "Satellite profit layer is separated",
      phase: "Public beta",
      passed: satelliteModel.externalRevenue > 0,
      tone: "amber",
      evidence: `${money.format(satelliteModel.externalRevenue)} external satellite revenue modeled.`,
      fix: "Sell externally"
    },
    {
      title: "Operations console has intake",
      phase: "Public beta",
      passed: operationsModel.orders.length > 0,
      tone: "amber",
      evidence: `${operationsModel.orders.length} order${operationsModel.orders.length === 1 ? "" : "s"} in the operating ledger.`,
      fix: "Add order"
    },
    {
      title: "Public trust and legal review complete",
      phase: "Live operation",
      passed: false,
      tone: "red",
      evidence: "External counsel, accounting, privacy, support, and incident communications are not represented in this prototype.",
      fix: "External review"
    },
    {
      title: "Payment blockers cleared",
      phase: "Live operation",
      passed: pilotReadiness.blockers.length === 0,
      tone: "red",
      evidence: `${pilotReadiness.blockers.length} critical payment blocker${pilotReadiness.blockers.length === 1 ? "" : "s"} open.`,
      fix: "Clear blockers"
    },
    {
      title: "Satellite controls closed",
      phase: "Live operation",
      passed: satelliteModel.openCriticalControls.length === 0,
      tone: "red",
      evidence: `${satelliteModel.openCriticalControls.length} critical satellite control${satelliteModel.openCriticalControls.length === 1 ? "" : "s"} open.`,
      fix: "Close controls"
    },
    {
      title: "Operations controls closed",
      phase: "Live operation",
      passed: operationsModel.openCriticalControls.length === 0,
      tone: "red",
      evidence: `${operationsModel.openCriticalControls.length} critical operations control${operationsModel.openCriticalControls.length === 1 ? "" : "s"} open.`,
      fix: "Close ops"
    }
  ];
}

function launchPhases(currentMode) {
  const order = ["Offline prototype", "Private sandbox", "Public beta", "Live operation"];
  const currentIndex = order.indexOf(currentMode);
  return [
    {
      name: "Offline prototype",
      window: "Now",
      detail: "Local design, simulation, and internal operator testing only.",
      when: "Until launch kit is delivered",
      status: currentMode === "Offline prototype" ? "Current" : "Passed",
      tone: currentMode === "Offline prototype" ? "red" : "green"
    },
    {
      name: "Private sandbox",
      window: "First online step",
      detail: "Put it behind private access with no public payments and no autonomous external spend.",
      when: "After sandbox checks pass",
      status: currentMode === "Private sandbox" ? "Current" : currentIndex > 1 ? "Passed" : "Locked",
      tone: currentMode === "Private sandbox" ? "amber" : currentIndex > 1 ? "green" : "red"
    },
    {
      name: "Public beta",
      window: "Controlled public",
      detail: "Allow public inspection or waitlist traffic while treasury movement stays tightly capped.",
      when: "After drills and routes pass",
      status: currentMode === "Public beta" ? "Current" : currentIndex > 2 ? "Passed" : "Locked",
      tone: currentMode === "Public beta" ? "amber" : currentIndex > 2 ? "green" : "red"
    },
    {
      name: "Live operation",
      window: "Real business",
      detail: "Real users, real payments, public trust obligations, and external legal/accounting review.",
      when: "After external review",
      status: currentMode === "Live operation" ? "Current" : "Locked",
      tone: currentMode === "Live operation" ? "green" : "red"
    }
  ];
}

function nextLaunchDetail(blockers) {
  if (!blockers.length) {
    return "No blockers remain at this phase.";
  }
  return `Next blocker: ${blockers[0].title}. Required action: ${blockers[0].fix}.`;
}

function formatServiceStatus(status) {
  if (status === "ok") {
    return "Online";
  }
  if (status === "checking") {
    return "Checking";
  }
  if (status === "offline") {
    return "Offline";
  }
  return "Unknown";
}

function findLaunchPacket() {
  return executionPackets.find((packet) => packet.id === launchGate.launchPacketId) ||
    executionPackets.find((packet) => packet.id === "launch-sandbox-kit");
}

function renderExperiments() {
  const board = document.querySelector("#experimentBoard");
  board.innerHTML = experiments
    .map((experiment) => {
      const tone =
        experiment.status === "Scale"
          ? "green"
          : experiment.status === "Kill"
            ? "red"
            : "amber";
      return `
        <article class="experiment-card">
          <header>
            <h3>${experiment.title}</h3>
            <span class="state ${tone}">${experiment.status}</span>
          </header>
          <p>${experiment.note}</p>
          <div class="experiment-meta">
            <span>Budget ${experiment.budget}</span>
            <span>Payback ${experiment.payback}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCycleMetrics() {
  const metrics = document.querySelector("#cycleMetrics");
  if (!metrics) {
    return;
  }
  const total = autonomousOutcomes.length;
  const scale = autonomousOutcomes.filter((outcome) => outcome.decision === "scale").length;
  const revise = autonomousOutcomes.filter((outcome) => outcome.decision === "revise").length;
  const kill = autonomousOutcomes.filter((outcome) => outcome.decision === "kill").length;
  const reviewed = autonomousOutcomes.filter((outcome) => {
    const review = latestOutcomeReview(outcome.id);
    return review && review.decision === "approved";
  }).length;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Outcomes</span>
      <strong>${total}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Scale</span>
      <strong>${scale}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Revise</span>
      <strong>${revise}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Kill signals</span>
      <strong>${kill}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Reviewed</span>
      <strong>${reviewed}</strong>
    </article>
  `;
}

function renderOutcomes() {
  const list = document.querySelector("#outcomeList");
  if (!list) {
    return;
  }
  renderCycleMetrics();
  if (!autonomousOutcomes.length) {
    list.innerHTML = `
      <article class="outcome-card">
        <div>
          <span class="metric-label">Autonomous cycle</span>
          <h4>No outcomes recorded</h4>
          <p>Delivered work packets have not produced receipts yet.</p>
        </div>
        <span class="state amber">Waiting</span>
        <div>
          <strong>Next</strong>
          <p class="outcome-next">Deliver a packet</p>
        </div>
      </article>
    `;
    return;
  }

  list.innerHTML = autonomousOutcomes
    .map((outcome) => {
      const tone = toneForOutcome(outcome.decision);
      const action = actionForOutcome(outcome);
      const artifact = outcome.artifactUrl ? safeHttpsUrl(outcome.artifactUrl) : "";
      const artifactLine = artifact
        ? `<a class="outcome-artifact" href="${escapeHtml(artifact)}" target="_blank" rel="noreferrer noopener">Delivery artifact</a>`
        : `<span class="state amber">No artifact attached</span>`;
      const measurementLine =
        outcome.measuredBefore || outcome.measuredAfter
          ? `<p class="outcome-measure"><strong>Before:</strong> ${escapeHtml(outcome.measuredBefore || "—")} <strong>After:</strong> ${escapeHtml(outcome.measuredAfter || "—")}</p>`
          : `<p class="outcome-measure outcome-measure-missing">No before/after measurement attached.</p>`;
      const gateRun = outcome.gateRunId
        ? gateRuns.find((run) => run.id === outcome.gateRunId)
        : null;
      const gateLine = gateRun
        ? `<p class="outcome-gate"><strong>Gate receipt:</strong> ${escapeHtml(gateRun.recommendation || "ungated")} — ${escapeHtml((gateRun.claim || "").slice(0, 90))}</p>`
        : `<p class="outcome-gate outcome-gate-missing">No Research Gate receipt attached. Drafted proposals will start ungated.</p>`;
      const signalLine = outcome.sourceSignalId
        ? `<p class="outcome-signal"><strong>Signal context:</strong> ${escapeHtml(outcome.sourceSignalSource || "External signal")} - ${escapeHtml(outcome.sourceSignalSubject || "untitled signal")} ${outcome.sourceSignalReference ? `<code>${escapeHtml(outcome.sourceSignalReference)}</code>` : ""}</p>`
        : `<p class="outcome-signal outcome-signal-missing">No external signal attached. Signals are optional review context only.</p>`;
      const review = latestOutcomeReview(outcome.id);
      const reviewIssues = validateOutcomeForReview(outcome);
      const reviewTone = toneForOutcomeReview(review, reviewIssues);
      const staleApprovedReview = review && review.decision === "approved" && reviewIssues.length;
      const reviewLabel = review
        ? staleApprovedReview
          ? "Evidence review blocked"
          : review.decision === "approved"
          ? "Evidence review approved"
          : "Evidence review rejected"
        : reviewIssues.length
          ? "Evidence review blocked"
          : "Evidence review pending";
      const reviewNote = review && review.note ? ` Note: ${review.note}` : "";
      const reviewLine = review
        ? staleApprovedReview
          ? `Approved receipt ${review.id} is stale: ${reviewIssues.join("; ")}.`
          : `${reviewLabel} ${formatReceiptDate(review.createdAt)}.${reviewNote}`
        : reviewIssues.length
          ? `Resolve before routing: ${reviewIssues.join("; ")}.`
          : "Operator review receipt required before routing.";
      const routeBlock = action.disabled ? "" : outcomeRouteBlockedReason(outcome);
      return `
        <article class="outcome-card">
          <div>
            <span class="metric-label">${escapeHtml(outcome.source || "Autonomous cycle")}</span>
            <h4>${escapeHtml(outcome.title)}</h4>
            <p>${escapeHtml(outcome.metric || outcome.evidence || "Outcome captured")}</p>
            <div class="outcome-evidence">
              ${artifactLine}
              ${measurementLine}
              ${gateLine}
              ${signalLine}
              <p class="outcome-review ${reviewTone}"><strong>${escapeHtml(reviewLabel)}:</strong> ${escapeHtml(reviewLine)}</p>
            </div>
          </div>
          <span class="state ${tone}">${escapeHtml(formatOutcomeDecision(outcome.decision))}</span>
          <div class="outcome-route">
            <strong>Next</strong>
            <p class="outcome-next">${escapeHtml(outcome.nextClaim || outcome.next || "Route to gate")}</p>
            <div class="outcome-review-tools" ${action.disabled ? "hidden" : ""}>
              <input id="outcome-review-note-${escapeHtml(outcome.id)}" type="text" maxlength="180" placeholder="Evidence review note" />
              <div>
                <button type="button" data-approve-outcome-review="${escapeHtml(outcome.id)}">Approve review</button>
                <button type="button" data-reject-outcome-review="${escapeHtml(outcome.id)}">Reject</button>
              </div>
            </div>
            ${routeBlock ? `<p class="outcome-route-blocker">${escapeHtml(routeBlock)}</p>` : ""}
            <button type="button" data-route-outcome="${escapeHtml(outcome.id)}" ${action.disabled || routeBlock ? "disabled" : ""}>
              ${escapeHtml(action.label)}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-route-outcome]").forEach((button) => {
    button.addEventListener("click", () => routeOutcome(button.dataset.routeOutcome));
  });
  document.querySelectorAll("[data-approve-outcome-review]").forEach((button) => {
    button.addEventListener("click", () => approveOutcomeReview(button.dataset.approveOutcomeReview));
  });
  document.querySelectorAll("[data-reject-outcome-review]").forEach((button) => {
    button.addEventListener("click", () => rejectOutcomeReview(button.dataset.rejectOutcomeReview));
  });
}

function renderScores() {
  renderResilienceSummary();
  const list = document.querySelector("#scoreList");
  list.innerHTML = scores
    .map(([name, score]) => {
      const percent = (score / 5) * 100;
      const color = score >= 4.2 ? "#267a55" : score >= 3.8 ? "#a96c16" : "#bd3d2a";
      return `
        <article class="score-item">
          <strong>${name}</strong>
          <div class="bar" style="--accent: ${color}; --bar: ${percent}%"><span></span></div>
          <span>${score.toFixed(1)}</span>
        </article>
      `;
    })
    .join("");
}

function renderResilienceSummary() {
  const score = calculateResilienceScore();
  const value = document.querySelector("#resilienceScoreValue");
  const title = document.querySelector("#scoreTitle");
  const ring = document.querySelector("#ringValue");
  if (value) {
    value.textContent = score.toFixed(1);
  }
  if (title) {
    title.textContent = `Overall resilience score is ${score.toFixed(1)} out of 5`;
  }
  if (ring) {
    const circumference = 389;
    const offset = circumference - (score / 5) * circumference;
    ring.style.strokeDashoffset = String(Math.max(20, Math.min(170, offset)));
  }
}

function renderDrillMetrics() {
  const metrics = document.querySelector("#drillMetrics");
  if (!metrics) {
    return;
  }
  const run = resilienceDrills.filter((drill) => drill.status !== "Queued").length;
  const passed = resilienceDrills.filter((drill) => drill.status === "Passed").length;
  const weak = resilienceDrills.filter((drill) => drill.status === "Weak").length;
  const packets = resilienceDrills.filter((drill) => drill.packetId).length;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Drills run</span>
      <strong>${run}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Passed</span>
      <strong>${passed}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Weak points</span>
      <strong>${weak}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Hardening packets</span>
      <strong>${packets}</strong>
    </article>
  `;
}

function renderResilienceDrills() {
  const list = document.querySelector("#drillList");
  if (!list) {
    return;
  }
  renderResilienceSummary();
  renderDrillMetrics();

  list.innerHTML = resilienceDrills
    .map((drill) => {
      const tone = toneForDrill(drill);
      const status = drill.status || "Queued";
      const canIssuePacket = status === "Weak" && !drill.packetId;
      const primaryLabel = status === "Queued" ? "Run" : "Rerun";
      return `
        <article class="drill-card">
          <div>
            <span class="metric-label">Class ${escapeHtml(drill.severity)} / ${escapeHtml(drill.vector)}</span>
            <h4>${escapeHtml(drill.title)}</h4>
            <p>${escapeHtml(drill.probe)}</p>
          </div>
          <span class="state ${tone}">${escapeHtml(status)}</span>
          <div>
            <span class="metric-label">Response</span>
            <p>${escapeHtml(drill.response)}</p>
          </div>
          <div class="drill-actions">
            <button type="button" data-run-drill="${escapeHtml(drill.id)}">${primaryLabel}</button>
            <button type="button" data-issue-drill-packet="${escapeHtml(drill.id)}" ${canIssuePacket ? "" : "disabled"}>
              ${drill.packetId ? "Packet issued" : "Issue packet"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-run-drill]").forEach((button) => {
    button.addEventListener("click", () => runResilienceDrill(button.dataset.runDrill));
  });
  document.querySelectorAll("[data-issue-drill-packet]").forEach((button) => {
    button.addEventListener("click", () => issueDrillHardeningPacket(button.dataset.issueDrillPacket));
  });
}

function renderBounties() {
  const list = document.querySelector("#bountyList");
  if (!list) {
    return;
  }
  renderExecutionMetrics();
  list.innerHTML = executionPackets
    .map((packet) => {
      const tone = toneForPacket(packet.state);
      const needsEvidence = packet.state === "Delivered" && !packet.outcomeId;
      const actionLabel =
        packet.state === "Draft"
          ? "Open"
          : packet.state === "Open"
            ? "Award"
            : packet.state === "Awarded"
              ? "Deliver"
              : packet.outcomeId
                ? "Archive"
                : "Attach evidence";
      const card = `
        <article class="bounty-item">
          <div>
            <h3>${escapeHtml(packet.title)}</h3>
            <p>${escapeHtml(packet.detail)}</p>
            <span class="packet-source">${escapeHtml(packet.source || "Execution packet")}</span>
          </div>
          <strong>${money.format(Number(packet.budget || 0))}</strong>
          <span>${escapeHtml(packet.due)}</span>
          <span class="state ${tone}">${escapeHtml(packet.state)}</span>
          <div class="packet-actions">
            <button type="button" data-advance-packet="${escapeHtml(packet.id)}">${actionLabel}</button>
          </div>
        </article>
      `;
      return needsEvidence ? card + renderEvidenceForm(packet) : card;
    })
    .join("");

  document.querySelectorAll("[data-advance-packet]").forEach((button) => {
    button.addEventListener("click", () => advanceExecutionPacket(button.dataset.advancePacket));
  });

  document.querySelectorAll("[data-evidence-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitOutcomeEvidence(form);
    });
  });
}

function renderEvidenceForm(packet) {
  const gateOptions = gateRuns
    .map(
      (run) => `
        <option value="${escapeHtml(run.id)}">
          ${escapeHtml(run.recommendation || "ungated")} — ${escapeHtml((run.claim || "").slice(0, 80))}
        </option>
      `
    )
    .join("");
  const signalOptions = eligibleOutcomeSignals()
    .map(
      (signal) => `
        <option value="${escapeHtml(signal.id)}">
          ${escapeHtml(signal.source)} - ${escapeHtml((signal.subject || "").slice(0, 80))}
        </option>
      `
    )
    .join("");

  return `
    <form class="bounty-evidence" data-evidence-form="${escapeHtml(packet.id)}" autocomplete="off">
      <p class="evidence-form-kicker">Outcome receipt evidence</p>
      <p class="evidence-form-hint">
        A delivered packet does not become an outcome receipt until artifact, measurement, and the next claim are recorded.
        A Research Gate receipt is optional but the proposal it drafts will be flagged ungated until one is attached.
      </p>
      <div class="field-row">
        <div class="field">
          <label for="evidence-artifact-${escapeHtml(packet.id)}">Delivery artifact (https URL)</label>
          <input id="evidence-artifact-${escapeHtml(packet.id)}" name="artifactUrl" type="url" placeholder="https://..." required />
        </div>
        <div class="field">
          <label for="evidence-gate-${escapeHtml(packet.id)}">Research Gate receipt</label>
          <select id="evidence-gate-${escapeHtml(packet.id)}" name="gateRunId">
            <option value="">No gate receipt attached</option>
            ${gateOptions}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="evidence-signal-${escapeHtml(packet.id)}">External signal context</label>
        <select id="evidence-signal-${escapeHtml(packet.id)}" name="sourceSignalId">
          <option value="">No external signal attached</option>
          ${signalOptions}
        </select>
        <p class="evidence-form-hint">Only routed, boundary-confirmed signals appear here. Signals add review context; they never approve spend.</p>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="evidence-before-${escapeHtml(packet.id)}">Measured before</label>
          <input id="evidence-before-${escapeHtml(packet.id)}" name="measuredBefore" type="text" placeholder="State or value before the delivery" required />
        </div>
        <div class="field">
          <label for="evidence-after-${escapeHtml(packet.id)}">Measured after</label>
          <input id="evidence-after-${escapeHtml(packet.id)}" name="measuredAfter" type="text" placeholder="State or value after the delivery" required />
        </div>
      </div>
      <div class="field">
        <label for="evidence-next-${escapeHtml(packet.id)}">Next claim</label>
        <textarea id="evidence-next-${escapeHtml(packet.id)}" name="nextClaim" rows="3" placeholder="The single follow-on claim this outcome should route into the gate or treasury." required></textarea>
      </div>
      <div class="evidence-form-actions">
        <button class="primary-action" type="submit">
          <i data-lucide="file-check-2"></i>
          <span>Emit outcome receipt</span>
        </button>
        <p class="evidence-form-error" data-evidence-error="${escapeHtml(packet.id)}" hidden></p>
      </div>
    </form>
  `;
}

function submitOutcomeEvidence(form) {
  const packetId = form.dataset.evidenceForm;
  const error = document.querySelector(`[data-evidence-error="${packetId}"]`);
  const showError = (message) => {
    if (!error) {
      return;
    }
    error.textContent = message;
    error.hidden = false;
  };
  const clearError = () => {
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  };

  const packet = executionPackets.find((item) => item.id === packetId);
  if (!packet) {
    showError("Packet no longer exists.");
    return;
  }

  const formData = new FormData(form);
  const artifactInput = String(formData.get("artifactUrl") || "").trim();
  const measuredBefore = String(formData.get("measuredBefore") || "").trim();
  const measuredAfter = String(formData.get("measuredAfter") || "").trim();
  const nextClaim = String(formData.get("nextClaim") || "").trim();
  const gateRunId = String(formData.get("gateRunId") || "").trim();
  const sourceSignalId = String(formData.get("sourceSignalId") || "").trim();

  const artifactUrl = safeHttpsUrl(artifactInput);
  if (!artifactUrl) {
    showError("Delivery artifact must be a valid https:// URL.");
    return;
  }
  if (!measuredBefore || !measuredAfter) {
    showError("Measured before and measured after are both required.");
    return;
  }
  if (!nextClaim) {
    showError("A single next claim is required so the outcome can route somewhere.");
    return;
  }

  const findings = findSensitiveData(`${measuredBefore}\n${measuredAfter}\n${nextClaim}`);
  if (findings.length) {
    showError(`Evidence text contains ${findings.join(", ")}. Strip the sensitive text and resubmit.`);
    return;
  }

  if (gateRunId && !gateRuns.some((run) => run.id === gateRunId)) {
    showError("Selected Research Gate receipt no longer exists. Pick another.");
    return;
  }

  const sourceSignal = sourceSignalId ? externalSignals.find((signal) => signal.id === sourceSignalId) : null;
  if (sourceSignalId && !sourceSignal) {
    showError("Selected external signal no longer exists. Pick another.");
    return;
  }
  if (sourceSignal && (sourceSignal.status !== "routed" || !sourceSignal.boundary_confirmed)) {
    showError("Selected external signal must be routed and boundary-confirmed.");
    return;
  }
  if (sourceSignal) {
    const signalFindings = signalSensitiveFindings(sourceSignal);
    if (signalFindings.length) {
      showError(`Selected external signal contains ${signalFindings.join(", ")}. Reject or sanitize that signal first.`);
      return;
    }
  }

  clearError();
  createOutcomeFromPacket(packetId, {
    artifactUrl,
    measuredBefore,
    measuredAfter,
    nextClaim,
    gateRunId,
    sourceSignalId: sourceSignal ? sourceSignal.id : "",
    sourceSignalSource: sourceSignal ? sourceSignal.source : "",
    sourceSignalSubject: sourceSignal ? sourceSignal.subject : "",
    sourceSignalReference: sourceSignal ? sourceSignal.evidence_reference : ""
  });
}

function eligibleOutcomeSignals() {
  return externalSignals.filter(
    (signal) =>
      signal &&
      signal.status === "routed" &&
      signal.boundary_confirmed &&
      signalSensitiveFindings(signal).length === 0
  );
}

function signalEvidenceText(record) {
  if (!record || !record.sourceSignalId) {
    return "";
  }
  const source = record.sourceSignalSource || "External signal";
  const subject = record.sourceSignalSubject || "untitled signal";
  const reference = record.sourceSignalReference ? ` Reference: ${record.sourceSignalReference}.` : "";
  return `Signal context: ${source} - ${subject}.${reference} This supports review only and does not approve spend.`;
}

function toneForPacket(state) {
  if (state === "Delivered") {
    return "green";
  }
  if (state === "Awarded" || state === "Open") {
    return "amber";
  }
  return "";
}

function toneForOutcome(decision) {
  if (decision === "scale") {
    return "green";
  }
  if (decision === "kill") {
    return "red";
  }
  return "amber";
}

function toneForDrill(drill) {
  if (drill.status === "Passed") {
    return "green";
  }
  if (drill.status === "Weak") {
    return "red";
  }
  return "amber";
}

function calculateResilienceScore() {
  const run = resilienceDrills.filter((drill) => drill.status !== "Queued");
  if (!run.length) {
    return 4.1;
  }
  const average = run.reduce((total, drill) => total + Number(drill.score || 0), 0) / run.length;
  const openWeak = resilienceDrills.filter((drill) => drill.status === "Weak" && !drill.packetId).length;
  const hardening = resilienceDrills.filter((drill) => drill.packetId).length * 0.12;
  return Math.max(2.8, Math.min(4.8, average - openWeak * 0.18 + hardening));
}

function formatOutcomeDecision(decision) {
  const labels = {
    scale: "Scale",
    revise: "Revise",
    kill: "Kill"
  };
  return labels[decision] || "Review";
}

function actionForOutcome(outcome) {
  if (outcome.decision === "kill") {
    const cooled = outcome.cooldownId && cooldownLanes.some((lane) => lane.id === outcome.cooldownId);
    return {
      label: cooled ? "Lane cooled" : "Cool down lane",
      disabled: cooled
    };
  }

  const drafted =
    outcome.proposalId && treasuryProposals.some((proposal) => proposal.id === outcome.proposalId);
  return {
    label: drafted ? "Proposal drafted" : outcome.decision === "revise" ? "Draft revision" : "Draft proposal",
    disabled: drafted
  };
}

function latestOutcomeReview(outcomeId) {
  return outcomeReviews
    .filter((review) => review.outcomeId === outcomeId)
    .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))[0] || null;
}

function toneForOutcomeReview(review, issues = []) {
  if (issues.length) {
    return "red";
  }
  if (review && review.decision === "approved") {
    return "green";
  }
  if (review && review.decision === "rejected") {
    return "red";
  }
  return "amber";
}

function validateOutcomeForReview(outcome) {
  const issues = [];
  const artifact = outcome.artifactUrl ? safeHttpsUrl(outcome.artifactUrl) : "";
  if (!artifact) {
    issues.push("missing https delivery artifact");
  }
  if (!String(outcome.measuredBefore || "").trim()) {
    issues.push("missing before measurement");
  }
  if (!String(outcome.measuredAfter || "").trim()) {
    issues.push("missing after measurement");
  }
  if (!String(outcome.nextClaim || outcome.next || "").trim()) {
    issues.push("missing next claim");
  }

  const sensitiveFindings = findSensitiveData([
    outcome.title,
    outcome.metric,
    outcome.evidence,
    outcome.measuredBefore,
    outcome.measuredAfter,
    outcome.nextClaim,
    outcome.sourceSignalSubject,
    outcome.sourceSignalReference
  ].join("\n"));
  if (sensitiveFindings.length) {
    issues.push(`sensitive data: ${sensitiveFindings.join(", ")}`);
  }

  if (outcome.gateRunId && !gateRuns.some((run) => run.id === outcome.gateRunId)) {
    issues.push("missing Research Gate receipt");
  }

  if (outcome.sourceSignalId) {
    const sourceSignal = externalSignals.find((signal) => signal.id === outcome.sourceSignalId);
    if (!sourceSignal) {
      issues.push("attached external signal is missing");
    } else {
      if (sourceSignal.status !== "routed" || !sourceSignal.boundary_confirmed) {
        issues.push("attached external signal is not routed and boundary-confirmed");
      }
      const signalFindings = signalSensitiveFindings(sourceSignal);
      if (signalFindings.length) {
        issues.push(`attached signal sensitive data: ${signalFindings.join(", ")}`);
      }
    }
  }

  return issues;
}

function outcomeRouteBlockedReason(outcome) {
  const issues = validateOutcomeForReview(outcome);
  if (issues.length) {
    return `Evidence review blockers: ${issues.join("; ")}.`;
  }
  const review = latestOutcomeReview(outcome.id);
  if (!review) {
    return "Approve an evidence review receipt before routing.";
  }
  if (review.decision !== "approved") {
    return "Latest evidence review rejected this route.";
  }
  return "";
}

function readOutcomeReviewNote(outcomeId) {
  const input = document.querySelector(`#outcome-review-note-${CSS.escape(outcomeId)}`);
  return input ? input.value.trim() : "";
}

function addOutcomeReview(outcomeId, decision) {
  const outcome = autonomousOutcomes.find((item) => item.id === outcomeId);
  if (!outcome) {
    return;
  }

  const note = readOutcomeReviewNote(outcomeId);
  const noteFindings = findSensitiveData(note);
  if (noteFindings.length) {
    outcomeReviews.unshift({
      id: `review-${Date.now().toString(36)}`,
      outcomeId,
      decision: "rejected",
      note: `Review note rejected for sensitive data: ${noteFindings.join(", ")}`,
      blockers: noteFindings,
      sourceSignalId: outcome.sourceSignalId || "",
      createdAt: new Date().toISOString()
    });
    saveOutcomeReviews();
    renderOutcomes();
    renderReceiptChain();
    renderLogs();
    return;
  }

  const blockers = validateOutcomeForReview(outcome);
  const safeDecision = decision === "approved" && blockers.length ? "rejected" : decision;
  const review = {
    id: `review-${Date.now().toString(36)}`,
    outcomeId,
    decision: safeDecision,
    note: note || (safeDecision === "approved" ? "Required evidence reviewed for routing." : "Evidence route rejected by operator."),
    blockers,
    sourceSignalId: outcome.sourceSignalId || "",
    sourceSignalSource: outcome.sourceSignalSource || "",
    sourceSignalSubject: outcome.sourceSignalSubject || "",
    sourceSignalReference: outcome.sourceSignalReference || "",
    createdAt: new Date().toISOString()
  };
  outcomeReviews.unshift(review);
  saveOutcomeReviews();
  renderOutcomes();
  renderReceiptChain();
  renderLogs();
}

function approveOutcomeReview(outcomeId) {
  addOutcomeReview(outcomeId, "approved");
}

function rejectOutcomeReview(outcomeId) {
  addOutcomeReview(outcomeId, "rejected");
}

function renderExecutionMetrics() {
  const metrics = document.querySelector("#executionMetrics");
  if (!metrics) {
    return;
  }
  const open = executionPackets.filter((packet) => packet.state === "Open").length;
  const awarded = executionPackets.filter((packet) => packet.state === "Awarded").length;
  const delivered = executionPackets.filter((packet) => packet.state === "Delivered").length;
  const budget = executionPackets
    .filter((packet) => packet.state !== "Delivered")
    .reduce((total, packet) => total + Number(packet.budget || 0), 0);
  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Open packets</span>
      <strong>${open}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Awarded</span>
      <strong>${awarded}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Delivered</span>
      <strong>${delivered}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Market budget</span>
      <strong>${money.format(budget)}</strong>
    </article>
  `;
}

function toneForRecommendation(recommendation) {
  if (recommendation === "accept" || recommendation === "accept_with_caveats") {
    return "green";
  }
  if (recommendation === "reject") {
    return "red";
  }
  return "amber";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const GOOGLE_FORM_URLS = ["https://docs.google.com/forms/"];
const GOOGLE_SHEET_URLS = ["https://docs.google.com/spreadsheets/"];
const APPS_SCRIPT_URLS = ["https://script.google.com/macros/"];
const STRIPE_DASHBOARD_URLS = ["https://dashboard.stripe.com/"];
const STRIPE_INVOICE_URLS = ["https://invoice.stripe.com/"];

function safeExternalUrl(value, allowedPrefixes) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return "";
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") {
      return "";
    }
    const normalized = url.href;
    return allowedPrefixes.some((prefix) => normalized.startsWith(prefix)) ? normalized : "";
  } catch {
    return "";
  }
}

function safeExternalLink(value, allowedPrefixes, label, missingLabel) {
  const url = safeExternalUrl(value, allowedPrefixes);
  if (!url) {
    return `<span class="state amber">${escapeHtml(missingLabel)}</span>`;
  }
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function cleanConfiguredUrl(value, allowedPrefixes) {
  return safeExternalUrl(value, allowedPrefixes);
}

function safeHttpsUrl(value) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return "";
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") {
      return "";
    }
    if (!url.hostname || /\s/.test(url.hostname)) {
      return "";
    }
    return url.href;
  } catch {
    return "";
  }
}

function findSensitiveData(text) {
  const value = String(text || "");
  const checks = [
    ["protected health information", /\b(PHI|patient|diagnosis|medical record|MRN|health record|treatment|prescription)\b/i],
    ["payment card data", /\b(?:\d[ -]*?){13,19}\b/],
    ["social security number", /\b\d{3}-\d{2}-\d{4}\b/],
    ["customer-private records", /\b(customer record|customer file|client record|support transcript|private customer|non-public customer)\b/i],
    ["API key material", /\b(sk_live_[A-Za-z0-9]+|pk_live_[A-Za-z0-9]+|ghp_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]+)\b/],
    ["password or secret", /\b(password|passcode|secret|private key|api[_ -]?key|access token|bearer token)\b/i],
    ["private key material", /-----BEGIN [A-Z ]*PRIVATE KEY-----/i]
  ];
  return checks.filter(([, pattern]) => pattern.test(value)).map(([label]) => label);
}

function requestSensitiveFindings({ customer, contact, need }) {
  return findSensitiveData([customer, contact, need].join("\n"));
}

function loadGateRuns() {
  try {
    return JSON.parse(localStorage.getItem(GATE_RUNS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveGateRuns() {
  try {
    localStorage.setItem(GATE_RUNS_KEY, JSON.stringify(gateRuns.slice(0, 12)));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function defaultTreasuryProposals() {
  return [
    {
      id: "scale-compliance-tracker",
      title: "Scale dental compliance tracker",
      bucket: "Growth experiments",
      amount: 4200,
      className: "B",
      note: "Move the working concierge pilot into paid acquisition and product automation.",
      claim: "The compliance tracker works in production",
      argument:
        "It works in simulation. The simulation has been validated against production traces. Therefore it works in production.",
      context: "Strange Company treasury review",
      status: "needs_gate",
      recommendation: "ungated",
      polarity: "pending",
      effectiveness: 0,
      confidence: 0,
      issueCount: 0,
      reportId: "",
      approved: false
    },
    {
      id: "search-ads-scale",
      title: "Restart search ads at scale",
      bucket: "Growth experiments",
      amount: 3600,
      className: "A",
      note: "A fast channel test that must prove intent before it receives compounding budget.",
      claim: "The ad campaign should scale",
      argument: "There is no evidence against search ads, therefore the ad campaign should scale.",
      context: "Strange Company treasury review",
      status: "needs_gate",
      recommendation: "ungated",
      polarity: "pending",
      effectiveness: 0,
      confidence: 0,
      issueCount: 0,
      reportId: "",
      approved: false
    },
    {
      id: "payment-backup",
      title: "Fund backup payment route",
      bucket: "Security compliance",
      amount: 1800,
      className: "B",
      note: "Reduce payment processor concentration before sales experiments expand.",
      claim: "The backup payment route reduces platform risk",
      argument:
        "The backup payment route reduces platform risk. Therefore the backup payment route reduces platform risk.",
      context: "Strange Company treasury review",
      status: "needs_gate",
      recommendation: "ungated",
      polarity: "pending",
      effectiveness: 0,
      confidence: 0,
      issueCount: 0,
      reportId: "",
      approved: false
    },
    {
      id: "license-database",
      title: "Acquire licensing database",
      bucket: "Acquisitions",
      amount: 8000,
      className: "B",
      note: "Potential data moat for regulated small-business compliance products.",
      claim: "This data set is commercially viable",
      argument:
        "It is not legally impossible to acquire this data set. Therefore this data set is commercially viable.",
      context: "Strange Company treasury review",
      status: "needs_gate",
      recommendation: "ungated",
      polarity: "pending",
      effectiveness: 0,
      confidence: 0,
      issueCount: 0,
      reportId: "",
      approved: false
    }
  ];
}

function loadTreasuryProposals() {
  try {
    const stored = JSON.parse(localStorage.getItem(TREASURY_PROPOSALS_KEY) || "null");
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
  } catch {
    // Fall through to the built-in proposal set.
  }
  return defaultTreasuryProposals();
}

function saveTreasuryProposals() {
  try {
    localStorage.setItem(TREASURY_PROPOSALS_KEY, JSON.stringify(treasuryProposals));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadExecutionPackets() {
  try {
    const stored = JSON.parse(localStorage.getItem(EXECUTION_PACKETS_KEY) || "null");
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
  } catch {
    // Fall through to the built-in packet set.
  }
  return defaultExecutionPackets();
}

function saveExecutionPackets() {
  try {
    localStorage.setItem(EXECUTION_PACKETS_KEY, JSON.stringify(executionPackets));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadAutonomousOutcomes() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTONOMOUS_OUTCOMES_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored;
    }
  } catch {
    // Fall through to the built-in outcome ledger.
  }
  return defaultAutonomousOutcomes();
}

function saveAutonomousOutcomes() {
  try {
    localStorage.setItem(AUTONOMOUS_OUTCOMES_KEY, JSON.stringify(autonomousOutcomes));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadOutcomeReviews() {
  try {
    const stored = JSON.parse(localStorage.getItem(OUTCOME_REVIEWS_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored;
    }
  } catch {
    // Fall through to the empty review ledger.
  }
  return [];
}

function saveOutcomeReviews() {
  try {
    localStorage.setItem(OUTCOME_REVIEWS_KEY, JSON.stringify(outcomeReviews.slice(0, 80)));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadCooldownLanes() {
  try {
    const stored = JSON.parse(localStorage.getItem(COOLDOWN_LANES_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored;
    }
  } catch {
    // Fall through to the built-in cooldown lane set.
  }
  return defaultCooldownLanes();
}

function saveCooldownLanes() {
  try {
    localStorage.setItem(COOLDOWN_LANES_KEY, JSON.stringify(cooldownLanes));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadResilienceDrills() {
  try {
    const stored = JSON.parse(localStorage.getItem(RESILIENCE_DRILLS_KEY) || "null");
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
  } catch {
    // Fall through to the built-in drill set.
  }
  return defaultResilienceDrills();
}

function saveResilienceDrills() {
  try {
    localStorage.setItem(RESILIENCE_DRILLS_KEY, JSON.stringify(resilienceDrills));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadLaunchGate() {
  try {
    const stored = JSON.parse(localStorage.getItem(LAUNCH_GATE_KEY) || "null");
    if (stored && typeof stored === "object") {
      return { ...defaultLaunchGate(), ...stored };
    }
  } catch {
    // Fall through to the built-in launch gate state.
  }
  return defaultLaunchGate();
}

function saveLaunchGate() {
  try {
    localStorage.setItem(LAUNCH_GATE_KEY, JSON.stringify(launchGate));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function defaultReceiptSeal() {
  return {
    rootHash: "",
    count: 0,
    sealedAt: ""
  };
}

function loadReceiptSeal() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECEIPT_SEAL_KEY) || "null");
    if (stored && typeof stored === "object") {
      return { ...defaultReceiptSeal(), ...stored };
    }
  } catch {
    // Fall through to an unsealed chain.
  }
  return defaultReceiptSeal();
}

function saveReceiptSeal() {
  try {
    localStorage.setItem(RECEIPT_SEAL_KEY, JSON.stringify(receiptSeal));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadRevenuePilot() {
  try {
    const stored = JSON.parse(localStorage.getItem(REVENUE_PILOT_KEY) || "null");
    if (stored && typeof stored === "object") {
      const base = defaultRevenuePilot();
      return {
        offer: { ...base.offer, ...(stored.offer || {}) },
        blockers: Array.isArray(stored.blockers) && stored.blockers.length ? stored.blockers : base.blockers,
        leads: Array.isArray(stored.leads) ? stored.leads : base.leads
      };
    }
  } catch {
    // Fall through to the built-in pilot state.
  }
  return defaultRevenuePilot();
}

function saveRevenuePilot() {
  try {
    localStorage.setItem(REVENUE_PILOT_KEY, JSON.stringify(revenuePilot));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadSatelliteCompany() {
  try {
    const stored = JSON.parse(localStorage.getItem(SATELLITE_COMPANY_KEY) || "null");
    if (stored && typeof stored === "object") {
      const base = defaultSatelliteCompany();
      return {
        companyName: stored.companyName || base.companyName,
        purpose: stored.purpose || base.purpose,
        targetNetProfit: Number(stored.targetNetProfit || base.targetNetProfit),
        services: Array.isArray(stored.services) && stored.services.length ? stored.services : base.services,
        controls: Array.isArray(stored.controls) && stored.controls.length ? stored.controls : base.controls
      };
    }
  } catch {
    // Fall through to the built-in satellite model.
  }
  return defaultSatelliteCompany();
}

function saveSatelliteCompany() {
  try {
    localStorage.setItem(SATELLITE_COMPANY_KEY, JSON.stringify(satelliteCompany));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function defaultSalesLeads() {
  return [];
}

function normalizeSalesLead(lead) {
  if (!lead || typeof lead !== "object") {
    return null;
  }
  const stage = salesLeadStages.includes(lead.stage) ? lead.stage : "prospect";
  const customer = String(lead.customer || lead.name || "").slice(0, 160);
  if (!customer) {
    return null;
  }
  const amount = Number(lead.amount || lead.value || 0);
  const sourceCategoryRaw = String(lead.sourceCategory || "").trim().toLowerCase();
  const sourceCategory = ACQUISITION_LEAD_SOURCES.includes(sourceCategoryRaw) ? sourceCategoryRaw : "";
  return {
    id: typeof lead.id === "string" && lead.id ? lead.id : `sales-lead-${slugify(customer)}-${Date.now()}`,
    createdAt: typeof lead.createdAt === "string" ? lead.createdAt : new Date().toISOString(),
    updatedAt: typeof lead.updatedAt === "string" ? lead.updatedAt : new Date().toISOString(),
    customer,
    contact: String(lead.contact || "").slice(0, 180),
    serviceId: String(lead.serviceId || "proof-sprint").slice(0, 80),
    amount: Number.isFinite(amount) && amount > 0 ? amount : 750,
    source: String(lead.source || "Manual").slice(0, 120),
    sourceCategory,
    need: String(lead.need || "Need not recorded").slice(0, 900),
    stage,
    qualificationNote: String(lead.qualificationNote || "").slice(0, 900),
    rejectionReason: String(lead.rejectionReason || "").slice(0, 500),
    orderId: String(lead.orderId || "").slice(0, 140)
  };
}

function defaultSetupEvidence() {
  return SETUP_EVIDENCE_SLOTS.map((slot) => ({
    id: slot.id,
    label: slot.label,
    detail: slot.detail,
    status: "missing",
    evidenceUrl: "",
    verifiedAt: "",
    operatorNote: "",
    updatedAt: ""
  }));
}

function normalizeSetupEvidence(record, slot) {
  const base = record && typeof record === "object" ? record : {};
  const status = SETUP_EVIDENCE_STATUSES.includes(base.status) ? base.status : "missing";
  const evidenceUrlRaw = typeof base.evidenceUrl === "string" ? base.evidenceUrl : "";
  const evidenceUrl = evidenceUrlRaw ? safeHttpsUrl(evidenceUrlRaw) : "";
  const verifiedAtRaw = typeof base.verifiedAt === "string" ? base.verifiedAt : "";
  const verifiedAt = status === "verified" && verifiedAtRaw ? verifiedAtRaw : "";
  return {
    id: slot.id,
    label: slot.label,
    detail: slot.detail,
    status,
    evidenceUrl,
    verifiedAt,
    operatorNote: String(base.operatorNote || "").slice(0, 900),
    updatedAt: typeof base.updatedAt === "string" ? base.updatedAt : ""
  };
}

function loadSetupEvidence() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETUP_EVIDENCE_KEY) || "null");
    if (Array.isArray(stored)) {
      const byId = new Map(stored.filter((r) => r && r.id).map((r) => [r.id, r]));
      return SETUP_EVIDENCE_SLOTS.map((slot) => normalizeSetupEvidence(byId.get(slot.id), slot));
    }
  } catch {
    // Fall through.
  }
  return defaultSetupEvidence();
}

function saveSetupEvidence() {
  try {
    localStorage.setItem(SETUP_EVIDENCE_KEY, JSON.stringify(setupEvidence));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function defaultCustomerAcquisition() {
  return {
    dailyOutreachTarget: 5,
    log: []
  };
}

function normalizeOutreachLogEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const source = String(entry.source || "").trim().toLowerCase();
  const sourceCategory = ACQUISITION_LEAD_SOURCES.includes(source) ? source : "direct";
  const attempts = Number(entry.attempts || 0);
  if (!Number.isFinite(attempts) || attempts <= 0) {
    return null;
  }
  const at = typeof entry.at === "string" ? entry.at : new Date().toISOString();
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : `outreach-${Date.now().toString(36)}`,
    at,
    source: sourceCategory,
    attempts: Math.min(Math.floor(attempts), 999),
    note: String(entry.note || "").slice(0, 500)
  };
}

function loadCustomerAcquisition() {
  try {
    const stored = JSON.parse(localStorage.getItem(CUSTOMER_ACQUISITION_KEY) || "null");
    if (stored && typeof stored === "object") {
      const target = Number(stored.dailyOutreachTarget);
      const log = Array.isArray(stored.log) ? stored.log.map(normalizeOutreachLogEntry).filter(Boolean).slice(0, 90) : [];
      return {
        dailyOutreachTarget: Number.isFinite(target) && target >= 0 ? Math.min(Math.floor(target), 999) : 5,
        log
      };
    }
  } catch {
    // Fall through.
  }
  return defaultCustomerAcquisition();
}

function saveCustomerAcquisition() {
  try {
    localStorage.setItem(CUSTOMER_ACQUISITION_KEY, JSON.stringify(customerAcquisition));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function defaultAdaptiveOperator() {
  return {
    receipts: []
  };
}

function adaptiveRouteFor(damageType) {
  return ADAPTIVE_DAMAGE_ROUTES.find((route) => route.id === damageType) || ADAPTIVE_DAMAGE_ROUTES[0];
}

function normalizeAdaptiveReceipt(receipt) {
  if (!receipt || typeof receipt !== "object") {
    return null;
  }
  const route = adaptiveRouteFor(receipt.damageType);
  const damage = String(receipt.damage || receipt.description || "").trim().slice(0, 1200);
  if (!damage) {
    return null;
  }
  const status = ["open", "routed", "closed"].includes(receipt.status) ? receipt.status : "open";
  return {
    id: typeof receipt.id === "string" && receipt.id ? receipt.id : `adapt-${Date.now().toString(36)}`,
    createdAt: typeof receipt.createdAt === "string" ? receipt.createdAt : new Date().toISOString(),
    closedAt: typeof receipt.closedAt === "string" ? receipt.closedAt : "",
    damageType: route.id,
    damage,
    revealed: String(receipt.revealed || "").trim().slice(0, 1200),
    countermeasure: String(receipt.countermeasure || route.countermeasure).trim().slice(0, 1200),
    nextEvolution: String(receipt.nextEvolution || "").trim().slice(0, 900),
    routeLane: String(receipt.routeLane || route.lane).trim().slice(0, 300),
    routedAt: typeof receipt.routedAt === "string" ? receipt.routedAt : "",
    routeTargetType: typeof receipt.routeTargetType === "string" ? receipt.routeTargetType : "",
    routeTargetId: typeof receipt.routeTargetId === "string" ? receipt.routeTargetId : "",
    cooldownId: typeof receipt.cooldownId === "string" ? receipt.cooldownId : "",
    status
  };
}

function loadAdaptiveOperator() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADAPTIVE_OPERATOR_KEY) || "null");
    if (stored && typeof stored === "object") {
      const receipts = Array.isArray(stored.receipts)
        ? stored.receipts.map((receipt) => normalizeAdaptiveReceipt(receipt)).filter(Boolean).slice(0, 50)
        : [];
      return { receipts };
    }
  } catch {
    // Fall through to an empty adaptive operator log.
  }
  return defaultAdaptiveOperator();
}

function saveAdaptiveOperator() {
  try {
    localStorage.setItem(ADAPTIVE_OPERATOR_KEY, JSON.stringify({
      receipts: (adaptiveOperator.receipts || []).slice(0, 50)
    }));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadSalesLeads() {
  try {
    const stored = JSON.parse(localStorage.getItem(SALES_LEADS_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored.map((lead) => normalizeSalesLead(lead)).filter(Boolean).slice(0, 80);
    }
  } catch {
    // Fall through to default.
  }
  return defaultSalesLeads();
}

function saveSalesLeads() {
  try {
    localStorage.setItem(SALES_LEADS_KEY, JSON.stringify(salesLeads.slice(0, 80)));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadOperations() {
  try {
    const stored = JSON.parse(localStorage.getItem(OPERATIONS_KEY) || "null");
    if (stored && typeof stored === "object") {
      const base = defaultOperations();
      const rawIntegration = { ...base.integration, ...(stored.integration || {}) };
      const integration = {
        googleSheetUrl: safeExternalUrl(rawIntegration.googleSheetUrl, GOOGLE_SHEET_URLS),
        googleFormUrl: safeExternalUrl(rawIntegration.googleFormUrl, GOOGLE_FORM_URLS),
        appsScriptUrl: safeExternalUrl(rawIntegration.appsScriptUrl, APPS_SCRIPT_URLS),
        stripeDashboardUrl: safeExternalUrl(rawIntegration.stripeDashboardUrl, STRIPE_DASHBOARD_URLS),
        termsReviewedAt: rawIntegration.termsReviewedAt || "",
        privacyReviewedAt: rawIntegration.privacyReviewedAt || ""
      };
      const launchChecklist = mergeChecklist(base.launchChecklist, stored.launchChecklist);
      return {
        operatorName: stored.operatorName || base.operatorName,
        supportEmail: stored.supportEmail || base.supportEmail,
        paymentMode: stored.paymentMode || base.paymentMode,
        invoicePrefix: stored.invoicePrefix || base.invoicePrefix,
        nextInvoiceNumber: Number(stored.nextInvoiceNumber || base.nextInvoiceNumber),
        integration,
        launchChecklist,
        controls: Array.isArray(stored.controls) && stored.controls.length ? stored.controls : base.controls,
        orders: Array.isArray(stored.orders) ? stored.orders.map((order) => normalizeOperationOrder(order)) : base.orders
      };
    }
  } catch {
    // Fall through to the built-in operations state.
  }
  return defaultOperations();
}

function normalizeRevenueStartTask(storedTask, definition) {
  const source = storedTask && typeof storedTask === "object" ? storedTask : {};
  return {
    id: definition.id,
    done: Boolean(source.done),
    completedAt: typeof source.completedAt === "string" ? source.completedAt : ""
  };
}

function normalizeRevenueStartLane(storedLane, definition) {
  const taskMap = new Map(
    Array.isArray(storedLane?.tasks)
      ? storedLane.tasks.filter((task) => task && task.id).map((task) => [task.id, task])
      : []
  );
  return {
    id: definition.id,
    tasks: definition.tasks.map((task) => normalizeRevenueStartTask(taskMap.get(task.id), task))
  };
}

function normalizeRevenueStartPacket(packet) {
  if (!packet || typeof packet !== "object") {
    return null;
  }
  const defaultTotalTasks = REVENUE_START_LANES.reduce((sum, lane) => sum + lane.tasks.length, 0);
  const lanes = Array.isArray(packet.lanes)
    ? packet.lanes.map((lane) => normalizeRevenueStartPacketLane(lane)).filter(Boolean).slice(0, 4)
    : [];
  const parsedCompletedTasks = Number(packet.completedTasks);
  const parsedTotalTasks = Number(packet.totalTasks);
  const laneCompletedTasks = lanes.reduce((sum, lane) => sum + lane.completed, 0);
  const laneTotalTasks = lanes.reduce((sum, lane) => sum + lane.total, 0);
  return {
    id: typeof packet.id === "string" && packet.id ? packet.id : `revenue-start-${Date.now().toString(36)}`,
    createdAt: typeof packet.createdAt === "string" ? packet.createdAt : new Date().toISOString(),
    state: typeof packet.state === "string" ? packet.state : "Draft",
    tone: typeof packet.tone === "string" ? packet.tone : "amber",
    completedTasks: Number.isFinite(parsedCompletedTasks) && parsedCompletedTasks >= 0 ? parsedCompletedTasks : laneCompletedTasks,
    totalTasks: Number.isFinite(parsedTotalTasks) && parsedTotalTasks > 0 ? parsedTotalTasks : (laneTotalTasks || defaultTotalTasks),
    blockers: Array.isArray(packet.blockers) ? packet.blockers.map((item) => String(item).slice(0, 180)).slice(0, 20) : [],
    nextAction: typeof packet.nextAction === "string" ? packet.nextAction : "",
    readinessState: typeof packet.readinessState === "string" ? packet.readinessState : "",
    operationsState: typeof packet.operationsState === "string" ? packet.operationsState : "",
    launchMode: typeof packet.launchMode === "string" ? packet.launchMode : "",
    issuedBy: typeof packet.issuedBy === "string" ? packet.issuedBy : "Operations console",
    lanes
  };
}

function normalizeRevenueStartPacketLane(lane) {
  if (!lane || typeof lane !== "object") {
    return null;
  }
  const definition = REVENUE_START_LANES.find((item) => item.id === lane.id) || {};
  const definitionTasks = Array.isArray(definition.tasks) ? definition.tasks : [];
  const tasks = Array.isArray(lane.tasks)
    ? lane.tasks
        .filter((task) => task && typeof task === "object")
        .map((task) => ({
          id: typeof task.id === "string" && task.id ? task.id : "",
          title: typeof task.title === "string" && task.title ? task.title.slice(0, 120) : "Start task",
          detail: typeof task.detail === "string" ? task.detail.slice(0, 240) : "",
          done: Boolean(task.done),
          completedAt: typeof task.completedAt === "string" ? task.completedAt : ""
        }))
        .slice(0, 20)
    : [];
  const parsedCompleted = Number(lane.completed);
  const parsedTotal = Number(lane.total);
  return {
    id: typeof lane.id === "string" && lane.id ? lane.id : definition.id || "company-lane",
    label: typeof lane.label === "string" && lane.label ? lane.label.slice(0, 80) : definition.label || "Company lane",
    owner: typeof lane.owner === "string" && lane.owner ? lane.owner.slice(0, 120) : definition.owner || "Operator",
    posture: typeof lane.posture === "string" && lane.posture ? lane.posture.slice(0, 240) : definition.posture || "",
    completed: Number.isFinite(parsedCompleted) && parsedCompleted >= 0 ? parsedCompleted : tasks.filter((task) => task.done).length,
    total: Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : (tasks.length || definitionTasks.length),
    tasks
  };
}

function loadRevenueStart() {
  const base = defaultRevenueStart();
  try {
    const stored = JSON.parse(localStorage.getItem(REVENUE_START_KEY) || "null");
    if (stored && typeof stored === "object") {
      const laneMap = new Map(
        Array.isArray(stored.lanes)
          ? stored.lanes.filter((lane) => lane && lane.id).map((lane) => [lane.id, lane])
          : []
      );
      const packets = Array.isArray(stored.packets)
        ? stored.packets.map((packet) => normalizeRevenueStartPacket(packet)).filter(Boolean).slice(0, 12)
        : [];
      return {
        lanes: REVENUE_START_LANES.map((lane) => normalizeRevenueStartLane(laneMap.get(lane.id), lane)),
        packets
      };
    }
  } catch {
    // Fall through to the built-in start board.
  }
  return base;
}

function saveRevenueStart() {
  try {
    localStorage.setItem(REVENUE_START_KEY, JSON.stringify(revenueStart));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function normalizeOperationOrder(order) {
  const artifactRaw = order.deliveryArtifactUrl || "";
  return {
    ...order,
    stripeInvoiceUrl: safeExternalUrl(order.stripeInvoiceUrl, STRIPE_INVOICE_URLS),
    deliveryArtifactUrl: artifactRaw ? safeHttpsUrl(artifactRaw) : "",
    acceptanceNote: typeof order.acceptanceNote === "string" ? order.acceptanceNote : "",
    invoiceSentAt: typeof order.invoiceSentAt === "string" ? order.invoiceSentAt : "",
    paidAt: typeof order.paidAt === "string" ? order.paidAt : "",
    deliveredAt: typeof order.deliveredAt === "string" ? order.deliveredAt : "",
    incidentIds: Array.isArray(order.incidentIds) ? order.incidentIds.filter((id) => typeof id === "string" && id) : []
  };
}

function defaultOperationIncidents() {
  return [];
}

function loadOperationIncidents() {
  try {
    const stored = JSON.parse(localStorage.getItem(OPERATION_INCIDENTS_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored.map((incident) => normalizeOperationIncident(incident)).filter(Boolean);
    }
  } catch {
    // Fall through to default.
  }
  return defaultOperationIncidents();
}

function saveOperationIncidents() {
  try {
    localStorage.setItem(OPERATION_INCIDENTS_KEY, JSON.stringify(operationIncidents));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function defaultDailyPilotRun() {
  return {
    current: null,
    history: []
  };
}

function normalizeDailyRunRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }
  const allowedChecks = new Set(DAILY_RUN_CHECKS.map((entry) => entry.id));
  const allowedRules = new Set(DAILY_RUN_STOP_RULES.map((entry) => entry.id));
  const checks = {};
  if (record.checks && typeof record.checks === "object") {
    for (const id of allowedChecks) {
      checks[id] = Boolean(record.checks[id]);
    }
  } else {
    for (const id of allowedChecks) {
      checks[id] = false;
    }
  }
  const stopRules = {};
  if (record.stopRules && typeof record.stopRules === "object") {
    for (const id of allowedRules) {
      stopRules[id] = Boolean(record.stopRules[id]);
    }
  } else {
    for (const id of allowedRules) {
      stopRules[id] = false;
    }
  }
  const orderIds = Array.isArray(record.orderIds)
    ? record.orderIds.filter((id) => typeof id === "string" && id)
    : [];
  const incidentIds = Array.isArray(record.incidentIds)
    ? record.incidentIds.filter((id) => typeof id === "string" && id)
    : [];
  return {
    id: typeof record.id === "string" && record.id ? record.id : `run-${Date.now().toString(36)}`,
    runDate:
      typeof record.runDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(record.runDate)
        ? record.runDate
        : new Date().toISOString().slice(0, 10),
    startedAt: typeof record.startedAt === "string" ? record.startedAt : new Date().toISOString(),
    closedAt: typeof record.closedAt === "string" ? record.closedAt : "",
    receiptRoot: typeof record.receiptRoot === "string" ? record.receiptRoot : "",
    checks,
    stopRules,
    orderIds,
    incidentIds
  };
}

function loadDailyPilotRun() {
  try {
    const stored = JSON.parse(localStorage.getItem(DAILY_PILOT_RUN_KEY) || "null");
    if (stored && typeof stored === "object") {
      const current = stored.current ? normalizeDailyRunRecord(stored.current) : null;
      const history = Array.isArray(stored.history)
        ? stored.history.map((entry) => normalizeDailyRunRecord(entry)).filter(Boolean).slice(0, 30)
        : [];
      return { current, history };
    }
  } catch {
    // Fall through to default.
  }
  return defaultDailyPilotRun();
}

function saveDailyPilotRun() {
  try {
    localStorage.setItem(DAILY_PILOT_RUN_KEY, JSON.stringify(dailyPilotRun));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function activeStopRules() {
  const current = dailyPilotRun.current;
  if (!current) {
    return [];
  }
  return DAILY_RUN_STOP_RULES.filter((rule) => current.stopRules[rule.id]);
}

function dailyRunPausedReason() {
  const rules = activeStopRules();
  if (!rules.length) {
    return "";
  }
  return `Daily pilot run paused by ${rules.map((rule) => rule.title).join(", ")}.`;
}

function startDailyPilotRun() {
  if (dailyPilotRun.current) {
    return;
  }
  const now = new Date();
  dailyPilotRun.current = normalizeDailyRunRecord({
    id: `run-${now.getTime().toString(36)}`,
    runDate: now.toISOString().slice(0, 10),
    startedAt: now.toISOString()
  });
  saveDailyPilotRun();
  renderDailyPilotRun();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function toggleDailyRunCheck(checkId, done) {
  if (!dailyPilotRun.current) {
    return;
  }
  if (!DAILY_RUN_CHECKS.some((entry) => entry.id === checkId)) {
    return;
  }
  dailyPilotRun.current.checks[checkId] = Boolean(done);
  saveDailyPilotRun();
  renderDailyPilotRun();
  renderReceiptChain();
  renderLogs();
}

function toggleDailyRunStopRule(ruleId, active) {
  if (!dailyPilotRun.current) {
    return;
  }
  if (!DAILY_RUN_STOP_RULES.some((entry) => entry.id === ruleId)) {
    return;
  }
  dailyPilotRun.current.stopRules[ruleId] = Boolean(active);
  saveDailyPilotRun();
  renderDailyPilotRun();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function updateDailyRunIncidentIds(value) {
  if (!dailyPilotRun.current) {
    return;
  }
  const ids = String(value || "")
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  dailyPilotRun.current.incidentIds = Array.from(new Set(ids));
  saveDailyPilotRun();
  renderReceiptChain();
  renderLogs();
}

function collectDailyRunOrderIds() {
  const current = dailyPilotRun.current;
  if (!current) {
    return [];
  }
  const startedAt = current.startedAt ? new Date(current.startedAt).getTime() : 0;
  return (operations.orders || [])
    .filter((order) => {
      const updatedTs = order.updatedAt ? new Date(order.updatedAt).getTime() : 0;
      return updatedTs >= startedAt;
    })
    .map((order) => order.id);
}

function closeDailyPilotRun() {
  if (!dailyPilotRun.current) {
    return;
  }
  const now = new Date().toISOString();
  const orderIds = collectDailyRunOrderIds();
  const chain = buildReceiptChain();
  const closed = normalizeDailyRunRecord({
    ...dailyPilotRun.current,
    closedAt: now,
    orderIds,
    receiptRoot: chain && typeof chain.root === "string" ? chain.root : ""
  });
  dailyPilotRun.history = [closed, ...(dailyPilotRun.history || [])].slice(0, 30);
  dailyPilotRun.current = null;
  saveDailyPilotRun();
  renderDailyPilotRun();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function resetDailyPilotRun() {
  dailyPilotRun = defaultDailyPilotRun();
  saveDailyPilotRun();
  renderDailyPilotRun();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function normalizeOperationIncident(incident) {
  if (!incident || typeof incident !== "object") {
    return null;
  }
  const severity = INCIDENT_SEVERITIES.includes(incident.severity) ? incident.severity : "low";
  const status = INCIDENT_STATUSES.includes(incident.status) ? incident.status : "open";
  const id = typeof incident.id === "string" && incident.id ? incident.id : `incident-${Date.now()}`;
  return {
    id,
    orderId: typeof incident.orderId === "string" ? incident.orderId : "",
    invoiceNumber: typeof incident.invoiceNumber === "string" ? incident.invoiceNumber : "",
    severity,
    status,
    summary: typeof incident.summary === "string" ? incident.summary : "",
    response: typeof incident.response === "string" ? incident.response : "",
    createdAt: typeof incident.createdAt === "string" ? incident.createdAt : new Date().toISOString(),
    updatedAt: typeof incident.updatedAt === "string" ? incident.updatedAt : new Date().toISOString()
  };
}

function mergeChecklist(baseList, storedList) {
  if (!Array.isArray(storedList) || !storedList.length) {
    return baseList;
  }
  return baseList.map((item) => {
    const match = storedList.find((entry) => entry && entry.id === item.id);
    if (!match) {
      return item;
    }
    return {
      ...item,
      done: Boolean(match.done),
      completedAt: typeof match.completedAt === "string" ? match.completedAt : ""
    };
  });
}

function saveOperations() {
  try {
    localStorage.setItem(OPERATIONS_KEY, JSON.stringify(operations));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function loadExternalSignals() {
  try {
    const stored = JSON.parse(localStorage.getItem(EXTERNAL_SIGNALS_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored.map((signal) => normalizeExternalSignal(signal)).filter(Boolean);
    }
  } catch {
    // Fall through to the built-in signal state.
  }
  return defaultExternalSignals();
}

function saveExternalSignals() {
  try {
    localStorage.setItem(EXTERNAL_SIGNALS_KEY, JSON.stringify(externalSignals.slice(0, 50)));
  } catch {
    // Local storage can be unavailable in hardened browser contexts.
  }
}

function normalizeExternalSignal(signal) {
  if (!signal || typeof signal !== "object") {
    return null;
  }
  const source = signalSources.includes(signal.source) ? signal.source : signalSources[0];
  const status = signalStatuses.includes(signal.status) ? signal.status : "observed";
  const observedAt = signal.observed_at || signal.observedAt || signal.createdAt || new Date().toISOString();
  return {
    id: signal.id || `signal-${Date.now().toString(36)}`,
    source,
    observed_at: observedAt,
    subject: String(signal.subject || "").slice(0, 160),
    summary: String(signal.summary || "").slice(0, 1200),
    evidence_reference: String(signal.evidence_reference || signal.evidenceReference || "").slice(0, 280),
    operator_note: String(signal.operator_note || signal.operatorNote || "").slice(0, 700),
    status,
    boundary_confirmed: Boolean(signal.boundary_confirmed || signal.boundaryConfirmed),
    createdAt: signal.createdAt || new Date().toISOString(),
    updatedAt: signal.updatedAt || observedAt
  };
}

function signalSensitiveFindings(signal) {
  return findSensitiveData([
    signal.subject,
    signal.summary,
    signal.evidence_reference,
    signal.operator_note
  ].join("\n"));
}

function localDateTimeValue(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.valueOf())) {
    return "";
  }
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function buildPilotReadiness() {
  const blockers = revenuePilot.blockers || [];
  const leads = revenuePilot.leads || [];
  const criticalBlockers = blockers.filter((blocker) => blocker.critical && !blocker.done);
  const doneBlockers = blockers.filter((blocker) => blocker.done).length;
  const committedLeads = leads.filter((lead) => lead.stage === "Committed" || lead.stage === "Ready to invoice");
  const committedMrr = committedLeads.reduce((total, lead) => total + Number(lead.value || 0), 0);
  const warmLeads = leads.filter((lead) => lead.stage !== "Prospect").length;
  const targetMrr = Number(revenuePilot.offer.targetMrr || 0);
  const firstRevenueReady = criticalBlockers.length === 0 && committedMrr > 0;
  const targetReady = firstRevenueReady && committedMrr >= targetMrr;

  if (targetReady) {
    return {
      state: "Paid sandbox ready",
      tone: "green",
      headline: "The first revenue loop can move into a paid sandbox.",
      detail: "Commitments meet the target and the critical payment blockers are cleared.",
      blockers: criticalBlockers,
      committedMrr,
      warmLeads,
      doneBlockers,
      targetMrr
    };
  }

  if (firstRevenueReady) {
    return {
      state: "Invoice cautiously",
      tone: "amber",
      headline: "One customer can be invoiced under the pilot controls.",
      detail: "The payment gate is clear, but the monthly target still needs more commitments.",
      blockers: criticalBlockers,
      committedMrr,
      warmLeads,
      doneBlockers,
      targetMrr
    };
  }

  if (committedMrr > 0) {
    return {
      state: "Do not charge yet",
      tone: "red",
      headline: "Commitments exist, but payment blockers remain.",
      detail: `${criticalBlockers.length} critical blocker${criticalBlockers.length === 1 ? "" : "s"} must clear before money moves.`,
      blockers: criticalBlockers,
      committedMrr,
      warmLeads,
      doneBlockers,
      targetMrr
    };
  }

  return {
    state: "Validate offer",
    tone: "amber",
    headline: "Keep it in customer-discovery mode.",
    detail: "The pilot needs at least one explicit commitment before it can become a revenue operation.",
    blockers: criticalBlockers,
    committedMrr,
    warmLeads,
    doneBlockers,
    targetMrr
  };
}

function renderRevenuePilot() {
  const verdict = document.querySelector("#pilotVerdict");
  const metrics = document.querySelector("#pilotMetrics");
  const offer = document.querySelector("#pilotOffer");
  const checklist = document.querySelector("#pilotChecklist");
  const leadList = document.querySelector("#pilotLeadList");
  if (!verdict || !metrics || !offer || !checklist || !leadList) {
    return;
  }

  const readiness = buildPilotReadiness();
  const openBlockers = readiness.blockers.length;
  const leadCount = revenuePilot.leads.length;

  verdict.innerHTML = `
    <div>
      <span class="metric-label">Pilot verdict</span>
      <h3>${escapeHtml(readiness.headline)}</h3>
      <p>${escapeHtml(readiness.detail)}</p>
    </div>
    <div class="pilot-mode-card ${readiness.tone}">
      <span class="metric-label">Revenue mode</span>
      <strong>${escapeHtml(readiness.state)}</strong>
      <span class="state ${readiness.tone}">${escapeHtml(readiness.state)}</span>
    </div>
  `;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Committed MRR</span>
      <strong>${money.format(readiness.committedMrr)}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Target MRR</span>
      <strong>${money.format(readiness.targetMrr)}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Warm leads</span>
      <strong>${readiness.warmLeads}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Critical blockers</span>
      <strong>${openBlockers}</strong>
    </article>
  `;

  offer.innerHTML = `
    <span class="metric-label">${escapeHtml(revenuePilot.offer.niche)}</span>
    <h3>${escapeHtml(revenuePilot.offer.title)}</h3>
    <p>${escapeHtml(revenuePilot.offer.promise)}</p>
    <p>${escapeHtml(revenuePilot.offer.delivery)}</p>
    <div class="pilot-offer-meta">
      <span>${money.format(Number(revenuePilot.offer.price || 0))} / month</span>
      <span>${escapeHtml(revenuePilot.offer.status)}</span>
      <span>Target ${money.format(readiness.targetMrr)} MRR</span>
      <span>${leadCount} lead${leadCount === 1 ? "" : "s"}</span>
    </div>
  `;

  checklist.innerHTML = revenuePilot.blockers
    .map((blocker) => {
      const tone = blocker.done ? "green" : blocker.critical ? "red" : "amber";
      return `
        <article class="pilot-blocker">
          <div>
            <span class="metric-label">${blocker.critical ? "Critical" : "Support"}</span>
            <h4>${escapeHtml(blocker.title)}</h4>
            <p>${escapeHtml(blocker.detail)}</p>
          </div>
          <span class="state ${tone}">${blocker.done ? "Clear" : "Open"}</span>
          <label class="pilot-switch">
            <input type="checkbox" data-pilot-blocker="${escapeHtml(blocker.id)}" ${blocker.done ? "checked" : ""} />
            <span>Done</span>
          </label>
        </article>
      `;
    })
    .join("");

  leadList.innerHTML = revenuePilot.leads
    .map((lead) => {
      const tone = toneForPilotStage(lead.stage);
      const canAdvance = lead.stage !== pilotStages[pilotStages.length - 1];
      return `
        <article class="pilot-lead">
          <div>
            <span class="metric-label">${escapeHtml(lead.source || "Pipeline")}</span>
            <h4>${escapeHtml(lead.name)}</h4>
            <p>${escapeHtml(lead.need || "Need not recorded")}</p>
          </div>
          <strong>${money.format(Number(lead.value || 0))}</strong>
          <span class="state ${tone}">${escapeHtml(lead.stage)}</span>
          <div class="pilot-actions">
            <button type="button" data-advance-lead="${escapeHtml(lead.id)}" ${canAdvance ? "" : "disabled"}>Advance</button>
            <button type="button" data-remove-lead="${escapeHtml(lead.id)}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-pilot-blocker]").forEach((input) => {
    input.addEventListener("change", () => togglePilotBlocker(input.dataset.pilotBlocker, input.checked));
  });
  document.querySelectorAll("[data-advance-lead]").forEach((button) => {
    button.addEventListener("click", () => advancePilotLead(button.dataset.advanceLead));
  });
  document.querySelectorAll("[data-remove-lead]").forEach((button) => {
    button.addEventListener("click", () => removePilotLead(button.dataset.removeLead));
  });
}

function toneForPilotStage(stage) {
  if (stage === "Ready to invoice") {
    return "green";
  }
  if (stage === "Committed") {
    return "amber";
  }
  return "";
}

function togglePilotBlocker(blockerId, done) {
  revenuePilot.blockers = revenuePilot.blockers.map((blocker) =>
    blocker.id === blockerId ? { ...blocker, done: Boolean(done), updatedAt: new Date().toISOString() } : blocker
  );
  saveRevenuePilot();
  renderRevenuePilot();
  renderLogs();
}

function advancePilotLead(leadId) {
  const readiness = buildPilotReadiness();
  revenuePilot.leads = revenuePilot.leads.map((lead) => {
    if (lead.id !== leadId) {
      return lead;
    }
    const index = pilotStages.indexOf(lead.stage);
    const nextStage = pilotStages[Math.min(index + 1, pilotStages.length - 1)];
    const gatedStage = nextStage === "Ready to invoice" && readiness.blockers.length > 0 ? "Committed" : nextStage;
    return {
      ...lead,
      stage: gatedStage,
      updatedAt: new Date().toISOString()
    };
  });
  saveRevenuePilot();
  renderRevenuePilot();
  renderLogs();
}

function removePilotLead(leadId) {
  revenuePilot.leads = revenuePilot.leads.filter((lead) => lead.id !== leadId);
  saveRevenuePilot();
  renderRevenuePilot();
  renderLogs();
}

function addPilotLead(form) {
  const formData = new FormData(form);
  const name = String(formData.get("leadName") || "").trim();
  if (!name) {
    return;
  }
  const now = new Date().toISOString();
  revenuePilot.leads.unshift({
    id: `lead-${slugify(name)}-${Date.now()}`,
    name,
    source: String(formData.get("leadSource") || "Manual").trim(),
    need: String(formData.get("leadNeed") || "Need not recorded").trim(),
    stage: "Prospect",
    value: Number(formData.get("leadValue") || revenuePilot.offer.price || 0),
    createdAt: now,
    updatedAt: now
  });
  saveRevenuePilot();
  renderRevenuePilot();
  renderLogs();
}

function proofSprintUnitProfit() {
  const service = (satelliteCompany.services || []).find((entry) => entry.id === "proof-sprint")
    || defaultSatelliteCompany().services.find((entry) => entry.id === "proof-sprint");
  const unitProfit = Number(service?.price || 0) - Number(service?.unitCost || 0);
  return unitProfit > 0 ? unitProfit : 540;
}

function customersNeededForProfit(targetProfit, currentProfit) {
  const gap = Number(targetProfit || 0) - Number(currentProfit || 0);
  if (gap <= 0) {
    return 0;
  }
  return Math.ceil(gap / proofSprintUnitProfit());
}

function buildSatelliteCompanyModel() {
  const services = satelliteCompany.services || [];
  const controls = satelliteCompany.controls || [];
  const activeServices = services.filter((service) => service.active);
  const externalActiveServices = activeServices.filter((service) => !service.relatedParty);
  const revenue = activeServices.reduce(
    (total, service) => total + Number(service.price || 0) * Number(service.customers || 0),
    0
  );
  const costs = activeServices.reduce(
    (total, service) => total + Number(service.unitCost || 0) * Number(service.customers || 0),
    0
  );
  const netProfit = revenue - costs;
  const margin = revenue > 0 ? netProfit / revenue : 0;
  const externalRevenue = externalActiveServices.reduce(
    (total, service) => total + Number(service.price || 0) * Number(service.customers || 0),
    0
  );
  const externalCosts = externalActiveServices.reduce(
    (total, service) => total + Number(service.unitCost || 0) * Number(service.customers || 0),
    0
  );
  const externalProfit = externalRevenue - externalCosts;
  const relatedPartyRevenue = activeServices
    .filter((service) => service.relatedParty)
    .reduce((total, service) => total + Number(service.price || 0) * Number(service.customers || 0), 0);
  const openCriticalControls = controls.filter((control) => control.critical && !control.done);
  const targetNetProfit = Number(satelliteCompany.targetNetProfit || 0);
  const externalReady = externalRevenue > 0;
  const controlsReady = openCriticalControls.length === 0;
  const targetReady = netProfit >= targetNetProfit;
  const customersNeededFor3k = customersNeededForProfit(3000, externalProfit);
  const customersNeededFor5k = customersNeededForProfit(5000, externalProfit);
  const shared = {
    services,
    controls,
    openCriticalControls,
    revenue,
    costs,
    netProfit,
    margin,
    externalRevenue,
    externalCosts,
    externalProfit,
    relatedPartyRevenue,
    targetNetProfit,
    customersNeededFor3k,
    customersNeededFor5k
  };

  if (!externalReady) {
    return {
      ...shared,
      state: "No market proof",
      tone: "red",
      headline: "The satellite cannot profit until it has external customers.",
      detail: "Do not count Strange Company payments as profit proof. The second company must survive on normal market revenue first."
    };
  }

  if (!controlsReady) {
    return {
      ...shared,
      state: "Controls open",
      tone: "red",
      headline: "The profit math works, but the transaction controls are not ready.",
      detail: `${openCriticalControls.length} critical control${openCriticalControls.length === 1 ? "" : "s"} must close before the satellite goes online as a paid operator.`
    };
  }

  if (!targetReady) {
    return {
      ...shared,
      state: "Needs volume",
      tone: "amber",
      headline: "The satellite can sell cleanly, but it has not hit the profit target.",
      detail: "Grow external proof-sprint and template revenue before adding related-party service contracts."
    };
  }

  return {
    ...shared,
    state: "Profit-ready",
    tone: "green",
    headline: "The satellite can go online as the first profit engine.",
    detail: "External revenue clears the target and controls are closed. Related-party work may be offered only with market pricing and replaceable-vendor rules."
  };
}

function renderSatelliteCompany() {
  const verdict = document.querySelector("#satelliteVerdict");
  const metrics = document.querySelector("#satelliteMetrics");
  const profitTracker = document.querySelector("#satelliteProfitTracker");
  const serviceList = document.querySelector("#satelliteServiceList");
  const controlList = document.querySelector("#satelliteControlList");
  if (!verdict || !metrics || !serviceList || !controlList) {
    return;
  }

  const model = buildSatelliteCompanyModel();
  const marginPercent = `${Math.round(model.margin * 100)}%`;

  verdict.innerHTML = `
    <div>
      <span class="metric-label">${escapeHtml(satelliteCompany.companyName)}</span>
      <h3>${escapeHtml(model.headline)}</h3>
      <p>${escapeHtml(model.detail)}</p>
    </div>
    <div class="satellite-mode-card ${model.tone}">
      <span class="metric-label">Satellite mode</span>
      <strong>${escapeHtml(model.state)}</strong>
      <span class="state ${model.tone}">${escapeHtml(model.state)}</span>
    </div>
  `;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Modeled MRR</span>
      <strong>${money.format(model.revenue)}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Net profit</span>
      <strong>${money.format(model.netProfit)}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Profit target</span>
      <strong>${money.format(model.targetNetProfit)}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Margin</span>
      <strong>${marginPercent}</strong>
    </article>
  `;

  if (profitTracker) {
    const collectedMrr = (operations.orders || [])
      .filter((order) => order.status === "Paid" || order.status === "Delivered")
      .reduce((total, order) => total + Number(order.amount || 0), 0);
    profitTracker.innerHTML = `
      <article class="satellite-profit-card">
        <span class="metric-label">Profit target tracker</span>
        <h3>${escapeHtml(satelliteCompany.companyName)} can profit only through external customers first.</h3>
        <div class="profit-target-grid">
          <span><strong>${money.format(model.externalProfit)}</strong><small>External-only modeled profit</small></span>
          <span><strong>${money.format(collectedMrr)}</strong><small>Collected MRR in Operations</small></span>
          <span><strong>${model.customersNeededFor3k}</strong><small>Proof-sprint customers to $3K</small></span>
          <span><strong>${model.customersNeededFor5k}</strong><small>Proof-sprint customers to $5K</small></span>
        </div>
        <p>Related-party work is never market proof. Keep the first profit evidence tied to normal invoices, external buyers, the reviewed payment route, fiscal evidence, and the Sheet ledger.</p>
      </article>
    `;
  }

  serviceList.innerHTML = model.services
    .map((service) => {
      const customers = Number(service.customers || 0);
      const revenue = Number(service.price || 0) * customers;
      const profit = revenue - Number(service.unitCost || 0) * customers;
      const tone = toneForSatelliteService(service, profit);
      return `
        <article class="satellite-service">
          <div>
            <span class="metric-label">${escapeHtml(service.source)}</span>
            <h4>${escapeHtml(service.title)}</h4>
            <p>${escapeHtml(service.detail)}</p>
          </div>
          <strong>${money.format(revenue)}</strong>
          <span class="state ${tone}">${service.active ? `${customers} buyer${customers === 1 ? "" : "s"}` : "Paused"}</span>
          <div class="satellite-stepper">
            <button type="button" data-adjust-service="${escapeHtml(service.id)}" data-adjust-delta="-1" ${customers <= 0 ? "disabled" : ""}>-</button>
            <button type="button" data-adjust-service="${escapeHtml(service.id)}" data-adjust-delta="1">+</button>
            <button type="button" data-toggle-service="${escapeHtml(service.id)}">${service.active ? "Pause" : "Run"}</button>
          </div>
        </article>
      `;
    })
    .join("");

  controlList.innerHTML = model.controls
    .map((control) => {
      const tone = control.done ? "green" : control.critical ? "red" : "amber";
      return `
        <article class="satellite-control">
          <div>
            <span class="metric-label">${control.critical ? "Critical" : "Support"}</span>
            <h4>${escapeHtml(control.title)}</h4>
            <p>${escapeHtml(control.detail)}</p>
          </div>
          <span class="state ${tone}">${control.done ? "Clear" : "Open"}</span>
          <label class="pilot-switch">
            <input type="checkbox" data-satellite-control="${escapeHtml(control.id)}" ${control.done ? "checked" : ""} />
            <span>Done</span>
          </label>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-adjust-service]").forEach((button) => {
    button.addEventListener("click", () =>
      adjustSatelliteService(button.dataset.adjustService, Number(button.dataset.adjustDelta || 0))
    );
  });
  document.querySelectorAll("[data-toggle-service]").forEach((button) => {
    button.addEventListener("click", () => toggleSatelliteService(button.dataset.toggleService));
  });
  document.querySelectorAll("[data-satellite-control]").forEach((input) => {
    input.addEventListener("change", () => toggleSatelliteControl(input.dataset.satelliteControl, input.checked));
  });
}

function toneForSatelliteService(service, profit) {
  if (!service.active) {
    return "amber";
  }
  if (service.relatedParty) {
    return "amber";
  }
  return profit > 0 ? "green" : "red";
}

function adjustSatelliteService(serviceId, delta) {
  satelliteCompany.services = satelliteCompany.services.map((service) => {
    if (service.id !== serviceId) {
      return service;
    }
    const nextCustomers = Math.max(0, Number(service.customers || 0) + delta);
    return {
      ...service,
      customers: nextCustomers,
      active: nextCustomers > 0 ? true : service.active,
      updatedAt: new Date().toISOString()
    };
  });
  saveSatelliteCompany();
  renderSatelliteCompany();
  renderOperations();
  renderLogs();
}

function toggleSatelliteService(serviceId) {
  satelliteCompany.services = satelliteCompany.services.map((service) =>
    service.id === serviceId ? { ...service, active: !service.active, updatedAt: new Date().toISOString() } : service
  );
  saveSatelliteCompany();
  renderSatelliteCompany();
  renderOperations();
  renderLogs();
}

function toggleSatelliteControl(controlId, done) {
  satelliteCompany.controls = satelliteCompany.controls.map((control) =>
    control.id === controlId ? { ...control, done: Boolean(done), updatedAt: new Date().toISOString() } : control
  );
  saveSatelliteCompany();
  renderSatelliteCompany();
  renderLogs();
}

function operationServices() {
  const externalServices = (satelliteCompany.services || []).filter((service) => !service.relatedParty);
  return externalServices.length ? externalServices : defaultSatelliteCompany().services.filter((service) => !service.relatedParty);
}

function labelForLeadStage(stage) {
  return String(stage || "prospect").replace(/_/g, " ");
}

function toneForLeadStage(stage) {
  if (stage === "rejected") return "red";
  if (stage === "paid" || stage === "delivered") return "green";
  if (stage === "invoice_ready" || stage === "invoice_sent") return "amber";
  return "";
}

function nextLeadStage(stage) {
  const sequence = ["prospect", "qualified", "invoice_ready", "invoice_sent", "paid", "delivered"];
  const index = sequence.indexOf(stage);
  if (index < 0 || index >= sequence.length - 1) {
    return stage;
  }
  return sequence[index + 1];
}

function leadService(lead) {
  return operationServices().find((service) => service.id === lead.serviceId) || operationServices()[0];
}

function leadStageForOrderStatus(status) {
  if (status === "Sent") return "invoice_sent";
  if (status === "Paid") return "paid";
  if (status === "Delivered") return "delivered";
  return "invoice_ready";
}

function syncSalesLeadsFromOrders() {
  let changed = false;
  salesLeads = salesLeads.map((lead) => {
    if (!lead.orderId || lead.stage === "rejected") {
      return lead;
    }
    const order = (operations.orders || []).find((entry) => entry.id === lead.orderId);
    if (!order) {
      return lead;
    }
    const nextStage = leadStageForOrderStatus(order.status);
    if (nextStage === lead.stage) {
      return lead;
    }
    changed = true;
    return {
      ...lead,
      stage: nextStage,
      updatedAt: order.updatedAt || new Date().toISOString()
    };
  });
  if (changed) {
    saveSalesLeads();
  }
}

function leadSensitiveFindings(lead) {
  return findSensitiveData([
    lead.customer,
    lead.contact,
    lead.need,
    lead.qualificationNote,
    lead.rejectionReason
  ].join("\n"));
}

function leadToLedgerCells(lead) {
  const service = leadService(lead);
  return [
    lead.createdAt || "",
    lead.id || "",
    lead.customer || "",
    lead.contact || "",
    service?.title || lead.serviceId || "",
    String(Number(lead.amount || 0)),
    lead.source || "",
    lead.stage || "",
    lead.qualificationNote || "",
    lead.orderId || "",
    lead.need || lead.rejectionReason || ""
  ].map((cell) => String(cell || "").replace(/\t/g, " ").replace(/\r?\n/g, " ").trim());
}

function leadToLedgerRow(lead) {
  return leadToLedgerCells(lead).join("\t");
}

function allLeadsLedgerTsv() {
  const rows = salesLeads.map((lead) => leadToLedgerRow(lead));
  return [LEADS_HEADERS.join("\t"), ...rows].join("\n");
}

function leadQualificationPacket(lead) {
  const service = leadService(lead);
  return [
    `Lead: ${lead.id}`,
    `Customer: ${lead.customer}`,
    `Contact: ${lead.contact || "Not recorded"}`,
    `Service: ${service?.title || lead.serviceId}`,
    `Monthly amount: ${money.format(Number(lead.amount || 0))}`,
    `Stage: ${labelForLeadStage(lead.stage)}`,
    `Source: ${lead.source || "Manual"}`,
    "",
    "Need:",
    lead.need || "Need not recorded",
    "",
    "Qualification:",
    lead.qualificationNote || "Not qualified yet.",
    "",
    "Boundary:",
    "No protected health information, payment card data, credentials, private keys, or customer-private records accepted in v0."
  ].join("\n");
}

function leadInvoicePacket(lead) {
  const service = leadService(lead);
  return [
    `Manual payment and fiscal packet for ${lead.customer}`,
    `Lead id: ${lead.id}`,
    `Contact: ${lead.contact || "Not recorded"}`,
    `Service: ${service?.title || lead.serviceId}`,
    `Monthly amount: ${money.format(Number(lead.amount || 0))}`,
    `Qualification note: ${lead.qualificationNote || "Not recorded"}`,
    "",
    "Manual steps:",
    "1. Create the reviewed hosted payment request or manual invoice for the Brazilian operator.",
    "2. Confirm the NFS-e or fiscal receipt step with the accountant-approved process.",
    "3. Copy the hosted payment/invoice URL.",
    "4. Convert or update the Operations order.",
    "5. Paste the hosted URL into the order and Sheet ledger.",
    "6. Mark Sent only after the payment request is actually sent.",
    "",
    "Static site boundary: no card data, no auto-created invoices, no customer-private records."
  ].join("\n");
}

function dailyRunCloseoutSummary(entry) {
  if (!entry) {
    return "";
  }
  const completedChecks = Object.entries(entry.checks || {}).filter(([, on]) => on).map(([id]) => id);
  const stopRules = Object.entries(entry.stopRules || {}).filter(([, on]) => on).map(([id]) => id);
  return [
    `Daily run: ${entry.id}`,
    `Run date: ${entry.runDate || ""}`,
    `Started: ${entry.startedAt || ""}`,
    `Closed: ${entry.closedAt || "not closed"}`,
    `Completed checks: ${completedChecks.join(", ") || "none"}`,
    `Stop rules: ${stopRules.join(", ") || "none"}`,
    `Order ids: ${(entry.orderIds || []).join(", ") || "none"}`,
    `Incident ids: ${(entry.incidentIds || []).join(", ") || "none"}`,
    `Receipt root: ${entry.receiptRoot || "not captured"}`,
    "",
    "Closeout boundary: operator receipt only; not accounting software, spend approval, customer notice, refund approval, or Stripe automation."
  ].join("\n");
}

function buildSetupEvidenceModel() {
  const records = setupEvidence;
  const verified = records.filter((r) => r.status === "verified");
  const pending = records.filter((r) => r.status === "pending");
  const blocked = records.filter((r) => r.status === "blocked");
  const missing = records.filter((r) => r.status === "missing");
  const unverified = records.filter((r) => r.status !== "verified");
  let state = "Setup gap";
  let tone = "amber";
  if (blocked.length) {
    state = "Setup blocked";
    tone = "red";
  } else if (!unverified.length) {
    state = "Operator-verified";
    tone = "green";
  } else if (missing.length === records.length) {
    state = "Not started";
    tone = "red";
  }
  return {
    records,
    verifiedIds: verified.map((r) => r.id),
    pendingIds: pending.map((r) => r.id),
    blockedIds: blocked.map((r) => r.id),
    missingIds: missing.map((r) => r.id),
    unverifiedRecords: unverified,
    allVerified: unverified.length === 0,
    state,
    tone
  };
}

function buildBrazilComplianceAgentsModel() {
  const setupModel = buildSetupEvidenceModel();
  const byId = new Map(setupModel.records.map((record) => [record.id, record]));
  const agents = BRAZIL_COMPLIANCE_AGENTS.map((agent) => {
    const records = agent.setupIds
      .map((id) => byId.get(id))
      .filter(Boolean);
    const verified = records.filter((record) => record.status === "verified");
    const pending = records.filter((record) => record.status === "pending");
    const blocked = records.filter((record) => record.status === "blocked");
    const missing = records.filter((record) => record.status === "missing");
    const openRecords = records.filter((record) => record.status !== "verified");
    let status = "Missing evidence";
    let tone = "red";
    if (blocked.length) {
      status = "Blocked";
      tone = "red";
    } else if (records.length && verified.length === records.length) {
      status = "Ready for human sign-off";
      tone = "green";
    } else if (pending.length || verified.length) {
      status = "In review";
      tone = "amber";
    }
    const nextRecord = openRecords[0];
    const nextAction = nextRecord
      ? `Close Setup Evidence: ${nextRecord.label}.`
      : "Record the human sign-off dates before enabling live mode.";
    return {
      ...agent,
      records,
      verifiedCount: verified.length,
      totalCount: records.length,
      pendingCount: pending.length,
      blockedCount: blocked.length,
      missingCount: missing.length,
      openRecords,
      allVerified: records.length > 0 && verified.length === records.length,
      status,
      tone,
      nextAction
    };
  });
  const ready = agents.filter((agent) => agent.allVerified);
  const blockedAgents = agents.filter((agent) => agent.blockedCount > 0);
  const missingAgents = agents.filter((agent) => agent.missingCount > 0);
  let state = "Human closure needed";
  let tone = "amber";
  if (blockedAgents.length) {
    state = "Compliance blocked";
    tone = "red";
  } else if (ready.length === agents.length) {
    state = "Prepared for final review";
    tone = "green";
  } else if (ready.length === 0 && missingAgents.length === agents.length) {
    state = "Not started";
    tone = "red";
  }
  const firstOpen = agents.find((agent) => !agent.allVerified);
  return {
    agents,
    readyCount: ready.length,
    blockedCount: blockedAgents.length,
    missingCount: missingAgents.length,
    totalCount: agents.length,
    state,
    tone,
    nextAction: firstOpen ? firstOpen.nextAction : "Have the lawyer/accountant/operator review the final Brazil and AI handoff gates."
  };
}

function brazilComplianceAgentPacket(agentId) {
  const model = buildBrazilComplianceAgentsModel();
  const agent = model.agents.find((item) => item.id === agentId) || model.agents[0];
  if (!agent) {
    return "No Brazil compliance agent found.";
  }
  const evidenceRows = agent.records.length
    ? agent.records.map((record) => {
      const verifiedAt = record.verifiedAt ? `; verified ${formatReceiptDate(record.verifiedAt)}` : "";
      const url = record.evidenceUrl ? `; evidence ${record.evidenceUrl}` : "";
      const note = record.operatorNote ? `; note ${record.operatorNote}` : "";
      return `- ${record.label}: ${record.status}${verifiedAt}${url}${note}`;
    })
    : ["- No linked Setup Evidence rows."];
  return [
    `Brazil compliance agent: ${agent.title}`,
    `Status: ${agent.status}`,
    `Next action: ${agent.nextAction}`,
    "",
    "AI can prepare:",
    agent.aiCan,
    "",
    "Human must close:",
    agent.humanMust,
    "",
    "Evidence required:",
    agent.evidence,
    "",
    "Linked Setup Evidence:",
    ...evidenceRows,
    "",
    "Stop rule:",
    agent.stopRule,
    "",
    "Boundary: AI output is draft preparation only. It is not legal, tax, accounting, privacy, payment-provider, or public-authority approval."
  ].join("\n");
}

function buildProfitReadiness() {
  const satelliteModel = buildSatelliteCompanyModel();
  const operationsModel = buildOperationsModel();
  const setupModel = buildSetupEvidenceModel();
  const qualifiedLeads = salesLeads.filter((lead) =>
    ["qualified", "invoice_ready", "invoice_sent", "paid", "delivered"].includes(lead.stage)
  );
  const invoiceReadyLeads = salesLeads.filter((lead) => lead.stage === "invoice_ready");
  const paidOrders = (operations.orders || []).filter((order) => order.status === "Paid" || order.status === "Delivered");
  const publicIntakeReady = Boolean(
    operationsModel.sheetReady
      && operationsModel.intakeReady
      && operationsModel.stripeReady
      && operationsModel.termsReviewed
      && operationsModel.privacyReviewed
  );
  const externalSetupVerified = setupModel.allVerified;
  const checklistComplete = operationsModel.openLaunchItems.length === 0 && operationsModel.openCriticalControls.length === 0;
  const externalSetupReady = externalSetupVerified && checklistComplete;
  const pipelineReady = qualifiedLeads.length > 0;
  const lifecycleReady = !operationsModel.pausedReason && operationServices().length > 0;
  const blockers = [];
  if (!externalSetupReady) {
    if (!externalSetupVerified) {
      for (const record of setupModel.unverifiedRecords) {
        blockers.push(`unverified evidence: ${record.label}`);
      }
    }
    if (externalSetupVerified && !checklistComplete) blockers.push("external setup checklist");
  }
  if (!publicIntakeReady) blockers.push("public intake config");
  if (!pipelineReady) blockers.push("qualified customer pipeline");
  if (!lifecycleReady) blockers.push("operational order lifecycle");
  let state = "Blocked";
  let tone = "red";
  let nextAction = "Close external setup and public intake blockers before asking for payment.";
  if (!blockers.length && paidOrders.length > 0) {
    state = "Profit proving";
    tone = "green";
    nextAction = "Reconcile paid orders against Stripe and the Sheet ledger, then close the daily run.";
  } else if (!blockers.length && invoiceReadyLeads.length > 0) {
    state = "Invoice ready";
    tone = "green";
    nextAction = "Create the manual payment request and fiscal evidence packet for the invoice-ready lead.";
  } else if (!blockers.length) {
    state = "Sell today";
    tone = "green";
    nextAction = "Move a qualified lead to invoice-ready, create the order, and issue the manual invoice.";
  } else if (publicIntakeReady && pipelineReady && lifecycleReady) {
    state = "Setup gap";
    tone = "amber";
    nextAction = "Finish the remaining external setup checklist before marking invoices sent.";
  } else if (pipelineReady) {
    state = "Pipeline warming";
    tone = "amber";
    nextAction = "Convert qualified leads only after intake, Stripe, Sheet, terms, and privacy routes are ready.";
  }
  return {
    state,
    tone,
    blockers,
    nextAction,
    targetNetProfit: satelliteModel.targetNetProfit,
    currentExternalProfit: satelliteModel.externalProfit,
    customersNeededFor3k: satelliteModel.customersNeededFor3k,
    customersNeededFor5k: satelliteModel.customersNeededFor5k,
    qualifiedLeadCount: qualifiedLeads.length,
    invoiceReadyLeadCount: invoiceReadyLeads.length,
    paidOrderCount: paidOrders.length,
    collectedMrr: operationsModel.collectedMrr,
    setupEvidenceState: setupModel.state,
    setupEvidenceVerifiedCount: setupModel.verifiedIds.length,
    setupEvidenceTotal: setupModel.records.length,
    setupEvidenceVerified: externalSetupVerified
  };
}

function buildCustomerAcquisitionModel() {
  const target = customerAcquisition.dailyOutreachTarget;
  const today = new Date().toISOString().slice(0, 10);
  const log = customerAcquisition.log || [];
  const todayAttempts = log
    .filter((entry) => entry.at && entry.at.slice(0, 10) === today)
    .reduce((sum, entry) => sum + Number(entry.attempts || 0), 0);
  const cutoff = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const last7 = log.filter((entry) => entry.at && entry.at.slice(0, 10) >= cutoff);
  const last7Attempts = last7.reduce((sum, e) => sum + Number(e.attempts || 0), 0);
  const leadsBySource = { unspecified: 0 };
  for (const s of ACQUISITION_LEAD_SOURCES) leadsBySource[s] = 0;
  for (const lead of salesLeads) {
    if (lead.sourceCategory && ACQUISITION_LEAD_SOURCES.includes(lead.sourceCategory)) {
      leadsBySource[lead.sourceCategory]++;
    } else {
      leadsBySource.unspecified++;
    }
  }
  const conversions = { prospect: 0, qualified: 0, invoice_ready: 0, invoice_sent: 0, paid: 0, delivered: 0, rejected: 0 };
  for (const lead of salesLeads) {
    if (Object.prototype.hasOwnProperty.call(conversions, lead.stage)) conversions[lead.stage]++;
  }
  return {
    target,
    todayAttempts,
    todayMet: target === 0 ? false : todayAttempts >= target,
    last7Attempts,
    last7,
    leadsBySource,
    conversions,
    totalLeads: salesLeads.length
  };
}

function buildOperationsModel() {
  const controls = operations.controls || [];
  const orders = operations.orders || [];
  const launchChecklist = operations.launchChecklist || [];
  const integration = operations.integration || {};
  const openCriticalControls = controls.filter((control) => control.critical && !control.done);
  const openLaunchItems = launchChecklist.filter((item) => !item.done);
  const launchDone = launchChecklist.length - openLaunchItems.length;
  const draftOrders = orders.filter((order) => order.status === "Draft").length;
  const sentOrders = orders.filter((order) => order.status === "Sent").length;
  const paidOrders = orders.filter((order) => order.status === "Paid" || order.status === "Delivered");
  const invoicedMrr = orders
    .filter((order) => order.status === "Sent" || order.status === "Paid" || order.status === "Delivered")
    .reduce((total, order) => total + Number(order.amount || 0), 0);
  const collectedMrr = paidOrders.reduce((total, order) => total + Number(order.amount || 0), 0);
  const sheetReady = Boolean(integration.googleSheetUrl);
  const intakeReady = Boolean(integration.googleFormUrl || integration.appsScriptUrl);
  const stripeReady = Boolean(integration.stripeDashboardUrl);
  const termsReviewed = Boolean(integration.termsReviewedAt);
  const privacyReviewed = Boolean(integration.privacyReviewedAt);
  const integrationGaps = [];
  if (!sheetReady) integrationGaps.push("Google Sheet ledger");
  if (!intakeReady) integrationGaps.push("Google Form or Apps Script intake");
  if (!stripeReady) integrationGaps.push("Stripe dashboard link");
  if (!termsReviewed) integrationGaps.push("terms reviewed date");
  if (!privacyReviewed) integrationGaps.push("privacy reviewed date");
  const pausedReason = dailyRunPausedReason();

  const baseModel = {
    controls,
    orders,
    launchChecklist,
    integration,
    openCriticalControls,
    openLaunchItems,
    launchDone,
    draftOrders,
    sentOrders,
    invoicedMrr,
    collectedMrr,
    sheetReady,
    intakeReady,
    stripeReady,
    termsReviewed,
    privacyReviewed,
    integrationGaps,
    pausedReason
  };

  if (pausedReason) {
    return {
      ...baseModel,
      state: "Paused",
      tone: "red",
      headline: "Daily pilot run is paused.",
      detail: pausedReason
    };
  }

  if (openCriticalControls.length > 0) {
    return {
      ...baseModel,
      state: "Setup blocked",
      tone: "red",
      headline: "The operations console works, but commercial launch is blocked.",
      detail: `${openCriticalControls.length} critical control${openCriticalControls.length === 1 ? "" : "s"} must close before invoices can be marked paid.`
    };
  }

  if (openLaunchItems.length > 0) {
    return {
      ...baseModel,
      state: "Launch incomplete",
      tone: "amber",
      headline: "Operating console is wired, but the manual paid pilot is not yet live.",
      detail: `${openLaunchItems.length} launch item${openLaunchItems.length === 1 ? "" : "s"} still open: ${openLaunchItems.map((item) => item.title).join(", ")}.`
    };
  }

  if (integrationGaps.length > 0) {
    return {
      ...baseModel,
      state: "Integration incomplete",
      tone: "amber",
      headline: "Launch checklist is clear; integration config is not.",
      detail: `Fill in: ${integrationGaps.join(", ")}.`
    };
  }

  if (!orders.length) {
    return {
      ...baseModel,
      state: "Ready for intake",
      tone: "amber",
      headline: "The operating lane is ready to accept the first order.",
      detail: "Add an external customer order, issue the reviewed manual payment request, and deliver only the scoped service."
    };
  }

  if (collectedMrr === 0) {
    return {
      ...baseModel,
      state: "Ready to invoice",
      tone: "amber",
      headline: "Orders can move through manual Stripe invoicing.",
      detail: "Create the payment request, paste the hosted URL into the order, and mark Paid only after funds settle and fiscal evidence reconciles."
    };
  }

  return {
    ...baseModel,
    state: "Operational",
    tone: "green",
    headline: "The satellite has a functional order-to-delivery loop.",
    detail: "Keep every order scoped, invoiced through Stripe, recorded in the Sheet ledger, and detached from the sealed Strange Company treasury."
  };
}

function renderProfitReadiness() {
  const panel = document.querySelector("#profitReadinessPanel");
  if (!panel) {
    return;
  }
  const readiness = buildProfitReadiness();
  const blockers = readiness.blockers.length
    ? readiness.blockers.map((blocker) => `<span class="state red">${escapeHtml(blocker)}</span>`).join("")
    : `<span class="state green">clear</span>`;
  panel.innerHTML = `
    <article class="profit-readiness-card ${escapeHtml(readiness.tone)}">
      <div>
        <span class="metric-label">Profit readiness</span>
        <h3>${escapeHtml(readiness.state)}</h3>
        <p>${escapeHtml(readiness.nextAction)}</p>
      </div>
      <div class="profit-readiness-metrics">
        <span><strong>${money.format(readiness.currentExternalProfit)}</strong><small>External profit model</small></span>
        <span><strong>${money.format(readiness.collectedMrr)}</strong><small>Collected MRR</small></span>
        <span><strong>${readiness.qualifiedLeadCount}</strong><small>Qualified leads</small></span>
        <span><strong>${readiness.invoiceReadyLeadCount}</strong><small>Invoice-ready leads</small></span>
        <span><strong>${readiness.setupEvidenceVerifiedCount}/${readiness.setupEvidenceTotal}</strong><small>Verified evidence</small></span>
        <span><strong>${readiness.customersNeededFor3k}</strong><small>Customers to $3K</small></span>
        <span><strong>${readiness.customersNeededFor5k}</strong><small>Customers to $5K</small></span>
      </div>
      <div class="profit-readiness-blockers">${blockers}</div>
    </article>
  `;
}

function revenueStartLaneState(definition, storedLane) {
  const taskMap = new Map(
    Array.isArray(storedLane?.tasks)
      ? storedLane.tasks.filter((task) => task && task.id).map((task) => [task.id, task])
      : []
  );
  const tasks = definition.tasks.map((task) => {
    const storedTask = taskMap.get(task.id) || {};
    return {
      ...task,
      done: Boolean(storedTask.done),
      completedAt: typeof storedTask.completedAt === "string" ? storedTask.completedAt : ""
    };
  });
  const completed = tasks.filter((task) => task.done).length;
  const requiredOpen = tasks.filter((task) => task.required && !task.done);
  return {
    ...definition,
    tasks,
    completed,
    total: tasks.length,
    requiredOpen
  };
}

function snapshotRevenueStartLanes(lanes) {
  return lanes.map((lane) => ({
    id: lane.id,
    label: lane.label,
    owner: lane.owner,
    posture: lane.posture,
    completed: lane.completed,
    total: lane.total,
    tasks: lane.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      detail: task.detail,
      done: Boolean(task.done),
      completedAt: task.completedAt || ""
    }))
  }));
}

function buildRevenueStartModel() {
  const laneMap = new Map(
    Array.isArray(revenueStart.lanes)
      ? revenueStart.lanes.filter((lane) => lane && lane.id).map((lane) => [lane.id, lane])
      : []
  );
  const lanes = REVENUE_START_LANES.map((lane) => revenueStartLaneState(lane, laneMap.get(lane.id)));
  const totalTasks = lanes.reduce((sum, lane) => sum + lane.total, 0);
  const completedTasks = lanes.reduce((sum, lane) => sum + lane.completed, 0);
  const openRequired = lanes.reduce((items, lane) => items.concat(lane.requiredOpen.map((task) => `${lane.label}: ${task.title}`)), []);
  const readiness = buildProfitReadiness();
  const operationsModel = buildOperationsModel();
  const launchDecision = buildLaunchDecision();
  const latestPacket = (revenueStart.packets || [])[0] || null;
  const timestamps = [];
  lanes.forEach((lane) => {
    lane.tasks.forEach((task) => {
      if (task.completedAt) timestamps.push(task.completedAt);
    });
  });
  (revenueStart.packets || []).forEach((packet) => {
    if (packet.createdAt) timestamps.push(packet.createdAt);
  });
  const blockers = openRequired.slice();
  if (operationsModel.pausedReason) blockers.push(operationsModel.pausedReason);
  readiness.blockers.slice(0, 8).forEach((blocker) => blockers.push(`profit readiness: ${blocker}`));

  let state = "Start checklist open";
  let tone = "red";
  let nextAction = "Complete both company-lane start tasks before treating the pilot as revenue-ready.";
  if (!openRequired.length && operationsModel.pausedReason) {
    state = "Paused";
    tone = "red";
    nextAction = operationsModel.pausedReason;
  } else if (!openRequired.length && !readiness.blockers.length && readiness.paidOrderCount > 0) {
    state = "Revenue operating";
    tone = "green";
    nextAction = "Reconcile paid orders, finish delivery closeout, and seal the receipt chain.";
  } else if (!openRequired.length && !readiness.blockers.length && readiness.invoiceReadyLeadCount > 0) {
    state = "Invoice ready";
    tone = "green";
    nextAction = "Create the manual payment request, handle the fiscal evidence, and move the order through the Sheet ledger.";
  } else if (!openRequired.length && !readiness.blockers.length) {
    state = "Sell today";
    tone = "green";
    nextAction = "Move the qualified lead to invoice-ready, issue the manual invoice, and close the daily run.";
  } else if (!openRequired.length && readiness.qualifiedLeadCount > 0) {
    state = "Revenue warmup";
    tone = "amber";
    nextAction = "Keep outreach active while setup evidence, intake, and invoice blockers close.";
  } else if (!openRequired.length) {
    state = "Start packet staged";
    tone = "amber";
    nextAction = "Issue the start packet as a blocker record, then qualify the first external buyer.";
  }

  return {
    lanes,
    totalTasks,
    completedTasks,
    openRequired,
    blockers,
    readiness,
    operationsModel,
    launchDecision,
    latestPacket,
    latestAt: timestamps.sort().pop() || "baseline",
    state,
    tone,
    nextAction
  };
}

function renderRevenueStart() {
  const panel = document.querySelector("#revenueStartPanel");
  if (!panel) {
    return;
  }
  const model = buildRevenueStartModel();
  const blockerMarkup = model.blockers.length
    ? model.blockers.slice(0, 10).map((blocker) => `<span class="state red">${escapeHtml(blocker)}</span>`).join("")
    : `<span class="state green">clear</span>`;
  const laneMarkup = model.lanes
    .map((lane) => {
      const laneTone = lane.requiredOpen.length ? "red" : "green";
      const taskMarkup = lane.tasks
        .map((task) => {
          const stamp = task.completedAt ? `<small>${escapeHtml(formatReceiptDate(task.completedAt))}</small>` : "<small>Not checked</small>";
          return `
            <label class="revenue-start-task ${task.done ? "done" : ""}">
              <input type="checkbox" data-revenue-start-task="${escapeHtml(`${lane.id}:${task.id}`)}" ${task.done ? "checked" : ""} />
              <span>
                <strong>${escapeHtml(task.title)}</strong>
                <small>${escapeHtml(task.detail)}</small>
                ${stamp}
              </span>
            </label>
          `;
        })
        .join("");
      return `
        <article class="revenue-start-lane ${laneTone}">
          <div class="revenue-start-lane-head">
            <div>
              <span class="metric-label">${escapeHtml(lane.owner)}</span>
              <h4>${escapeHtml(lane.label)}</h4>
              <p>${escapeHtml(lane.posture)}</p>
            </div>
            <span class="state ${laneTone}">${lane.completed}/${lane.total}</span>
          </div>
          <div class="revenue-start-task-list">${taskMarkup}</div>
        </article>
      `;
    })
    .join("");
  const packetMarkup = (revenueStart.packets || []).length
    ? revenueStart.packets
        .slice(0, 4)
        .map((packet) => `
          <article class="revenue-start-packet">
            <div>
              <span class="metric-label">${escapeHtml(formatReceiptDate(packet.createdAt))}</span>
              <h4>${escapeHtml(packet.id)}</h4>
              <p>${escapeHtml(packet.state)} / ${packet.completedTasks}/${packet.totalTasks} tasks / ${packet.blockers.length} blocker${packet.blockers.length === 1 ? "" : "s"}</p>
            </div>
            <button type="button" data-copy-revenue-start-packet="${escapeHtml(packet.id)}">Copy packet</button>
          </article>
        `)
        .join("")
    : `<article class="revenue-start-packet empty"><span class="metric-label">No start packet issued yet</span><p>Issue one when the operator is ready to record day-one revenue posture.</p></article>`;

  panel.innerHTML = `
    <article class="revenue-start-card ${escapeHtml(model.tone)}">
      <div>
        <span class="metric-label">Revenue start</span>
        <h3>${escapeHtml(model.state)}</h3>
        <p>${escapeHtml(model.nextAction)}</p>
      </div>
      <div class="revenue-start-metrics">
        <span><strong>${model.completedTasks}/${model.totalTasks}</strong><small>Start tasks</small></span>
        <span><strong>${escapeHtml(model.launchDecision.mode)}</strong><small>Strange Company gate</small></span>
        <span><strong>${escapeHtml(model.operationsModel.state)}</strong><small>Second company ops</small></span>
        <span><strong>${escapeHtml(model.readiness.state)}</strong><small>Profit readiness</small></span>
      </div>
      <div class="revenue-start-blockers">${blockerMarkup}</div>
    </article>
    <div class="revenue-start-lanes">${laneMarkup}</div>
    <div class="revenue-start-output" id="revenueStartOutput" aria-live="polite"></div>
    <div class="revenue-start-packets">${packetMarkup}</div>
  `;

  document.querySelectorAll("[data-revenue-start-task]").forEach((input) => {
    input.addEventListener("change", () => toggleRevenueStartTask(input.dataset.revenueStartTask, input.checked));
  });
  document.querySelectorAll("[data-copy-revenue-start-packet]").forEach((button) => {
    button.addEventListener("click", () => copyRevenueStartPacket(button.dataset.copyRevenueStartPacket, button));
  });
}

function toggleRevenueStartTask(key, done) {
  const [laneId, taskId] = String(key || "").split(":");
  if (!laneId || !taskId) {
    return;
  }
  const now = new Date().toISOString();
  revenueStart.lanes = REVENUE_START_LANES.map((definition) => {
    const current = revenueStart.lanes.find((lane) => lane.id === definition.id) || { id: definition.id, tasks: [] };
    const taskMap = new Map((current.tasks || []).map((task) => [task.id, task]));
    return {
      id: definition.id,
      tasks: definition.tasks.map((task) => {
        const currentTask = taskMap.get(task.id) || { id: task.id, done: false, completedAt: "" };
        if (definition.id !== laneId || task.id !== taskId) {
          return currentTask;
        }
        return {
          id: task.id,
          done: Boolean(done),
          completedAt: done ? (currentTask.completedAt || now) : ""
        };
      })
    };
  });
  saveRevenueStart();
  renderRevenueStart();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function resetRevenueStart() {
  revenueStart = defaultRevenueStart();
  saveRevenueStart();
  renderRevenueStart();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function revenueStartPacket(packet) {
  const model = buildRevenueStartModel();
  const issued = packet || model.latestPacket || {};
  const packetLanes = Array.isArray(issued.lanes) && issued.lanes.length
    ? issued.lanes
    : snapshotRevenueStartLanes(model.lanes);
  const completedTasks = Number.isFinite(Number(issued.completedTasks)) ? Number(issued.completedTasks) : model.completedTasks;
  const totalTasks = Number.isFinite(Number(issued.totalTasks)) && Number(issued.totalTasks) > 0 ? Number(issued.totalTasks) : model.totalTasks;
  const blockersSource = Array.isArray(issued.blockers) ? issued.blockers : model.blockers;
  const lanes = packetLanes.map((lane) => {
    const taskLines = lane.tasks.map((task) => `- [${task.done ? "x" : " "}] ${task.title}: ${task.detail}`);
    return [`${lane.label} (${lane.owner})`, lane.posture, ...taskLines].join("\n");
  });
  const blockers = blockersSource.length
    ? blockersSource.map((blocker) => `- ${blocker}`)
    : ["- none recorded"];
  return [
    "Revenue start packet",
    `Packet id: ${issued.id || "draft"}`,
    `Issued: ${issued.createdAt || new Date().toISOString()}`,
    `State: ${issued.state || model.state}`,
    `Strange Company launch mode: ${issued.launchMode || model.launchDecision.mode}`,
    `Second company operations mode: ${issued.operationsState || model.operationsModel.state}`,
    `Profit readiness: ${issued.readinessState || model.readiness.state}`,
    `Tasks: ${completedTasks}/${totalTasks}`,
    `Next action: ${issued.nextAction || model.nextAction}`,
    "",
    "Company lanes:",
    lanes.join("\n\n"),
    "",
    "Current blockers:",
    blockers.join("\n"),
    "",
    "Day-one sequence:",
    "1. Keep Strange Company sealed; do not invoice customers directly from the sealed lane.",
    "2. Run revenue through Strange Works Studio only after external setup evidence and commercial controls are real.",
    "3. Use a manually created payment request or hosted invoice and mirror the row into the Sheet ledger.",
    "4. Start and close the Daily pilot run, attach incidents if any, and seal the receipt chain after material changes.",
    "",
    "Boundary: this packet is an operator receipt. It is not legal formation, tax advice, accounting software, payment automation, or customer-data storage."
  ].join("\n");
}

function renderRevenueStartOutput(packet, copied) {
  const output = document.querySelector("#revenueStartOutput");
  if (!output || !packet) {
    return;
  }
  output.innerHTML = `
    <article>
      <span class="metric-label">${copied ? "Revenue start packet copied" : "Revenue start packet issued"}</span>
      <strong>${escapeHtml(packet.id)}</strong>
      <p>${escapeHtml(packet.state)} / ${packet.completedTasks}/${packet.totalTasks} tasks / ${packet.blockers.length} blocker${packet.blockers.length === 1 ? "" : "s"}</p>
      <pre>${escapeHtml(revenueStartPacket(packet))}</pre>
    </article>
  `;
}

async function issueRevenueStartPacket(button) {
  const model = buildRevenueStartModel();
  const packet = normalizeRevenueStartPacket({
    id: `revenue-start-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    state: model.state,
    tone: model.tone,
    completedTasks: model.completedTasks,
    totalTasks: model.totalTasks,
    blockers: model.blockers,
    nextAction: model.nextAction,
    readinessState: model.readiness.state,
    operationsState: model.operationsModel.state,
    launchMode: model.launchDecision.mode,
    issuedBy: "Operations console",
    lanes: snapshotRevenueStartLanes(model.lanes)
  });
  revenueStart.packets = [packet, ...(revenueStart.packets || [])].slice(0, 12);
  saveRevenueStart();
  let copied = false;
  try {
    await navigator.clipboard.writeText(revenueStartPacket(packet));
    copied = true;
  } catch {
    copied = false;
  }
  renderRevenueStart();
  renderRevenueStartOutput(packet, copied);
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
  if (button) {
    const label = button.querySelector("span") || button;
    const previous = label.textContent;
    label.textContent = copied ? "Packet copied" : "Packet issued";
    setTimeout(() => {
      label.textContent = previous;
    }, 1500);
  }
}

async function copyRevenueStartPacket(packetId, button) {
  const packet = (revenueStart.packets || []).find((entry) => entry.id === packetId);
  if (!packet || !button) {
    return;
  }
  const previous = button.textContent;
  let copied = false;
  try {
    await navigator.clipboard.writeText(revenueStartPacket(packet));
    copied = true;
  } catch {
    copied = false;
  }
  button.textContent = copied ? "Copied" : "Copy failed";
  renderRevenueStartOutput(packet, copied);
  setTimeout(() => {
    button.textContent = previous;
  }, 1500);
}

function buildGrowthReviewModel() {
  const acquisition = buildCustomerAcquisitionModel();
  const readiness = buildProfitReadiness();
  const operationsModel = buildOperationsModel();
  const revenueStartModel = buildRevenueStartModel();
  const attemptsBySource = {};
  ACQUISITION_LEAD_SOURCES.forEach((source) => {
    attemptsBySource[source] = 0;
  });
  (customerAcquisition.log || []).forEach((entry) => {
    if (Object.prototype.hasOwnProperty.call(attemptsBySource, entry.source)) {
      attemptsBySource[entry.source] += Number(entry.attempts || 0);
    }
  });
  const channels = ACQUISITION_LEAD_SOURCES.map((source) => ({
    source,
    attempts: attemptsBySource[source] || 0,
    leads: acquisition.leadsBySource[source] || 0
  }));
  channels.push({
    source: "unspecified",
    attempts: 0,
    leads: acquisition.leadsBySource.unspecified || 0
  });
  const bestChannel = channels
    .slice()
    .sort((a, b) => (b.leads - a.leads) || (b.attempts - a.attempts))[0] || { source: "referral", attempts: 0, leads: 0 };
  const blockers = [];
  if (revenueStartModel.openRequired.length) {
    blockers.push(...revenueStartModel.openRequired.slice(0, 6));
  }
  if (operationsModel.pausedReason) {
    blockers.push(operationsModel.pausedReason);
  }
  readiness.blockers.slice(0, 8).forEach((blocker) => blockers.push(`profit readiness: ${blocker}`));

  let state = "Growth blocked";
  let tone = "red";
  let nextAction = "Close the company-lane and commercial readiness blockers before scaling outreach.";
  if (!revenueStartModel.openRequired.length && operationsModel.pausedReason) {
    state = "Growth paused";
    tone = "red";
    nextAction = operationsModel.pausedReason;
  } else if (!revenueStartModel.openRequired.length && acquisition.target > 0 && !acquisition.todayMet) {
    state = "Outreach open";
    tone = "amber";
    nextAction = `Log ${Math.max(acquisition.target - acquisition.todayAttempts, 0)} more outreach attempt${acquisition.target - acquisition.todayAttempts === 1 ? "" : "s"} today before adding new spend.`;
  } else if (!revenueStartModel.openRequired.length && !acquisition.totalLeads) {
    state = "Need prospects";
    tone = "amber";
    nextAction = "Use the safest channel with a clear buyer list, then log the outreach receipt.";
  } else if (!revenueStartModel.openRequired.length && !readiness.qualifiedLeadCount) {
    state = "Qualify pipeline";
    tone = "amber";
    nextAction = "Convert a real external buyer into a qualified lead before spending on broader growth.";
  } else if (!revenueStartModel.openRequired.length && !readiness.invoiceReadyLeadCount) {
    state = "Prepare invoice";
    tone = "amber";
    nextAction = "Move a qualified lead to invoice-ready only after setup, terms, privacy, Stripe, and Sheet routes are real.";
  } else if (!revenueStartModel.openRequired.length && readiness.invoiceReadyLeadCount && !readiness.paidOrderCount) {
    state = "Close first payment";
    tone = "amber";
    nextAction = "Send one manual hosted invoice and reconcile settlement before scaling acquisition.";
  } else if (!blockers.length && readiness.paidOrderCount > 0) {
    state = "Scale measured source";
    tone = "green";
    nextAction = `Increase the ${bestChannel.source} channel only while delivery closeout and receipt sealing stay current.`;
  }

  const latestTimes = [
    ...(customerAcquisition.log || []).map((entry) => entry.at),
    ...(salesLeads || []).map((lead) => lead.updatedAt || lead.createdAt),
    ...(operations.orders || []).map((order) => order.updatedAt || order.createdAt),
    revenueStartModel.latestAt
  ].filter((value) => value && value !== "baseline");

  return {
    acquisition,
    readiness,
    operationsModel,
    revenueStartModel,
    channels,
    bestChannel,
    blockers: [...new Set(blockers)].slice(0, 12),
    state,
    tone,
    nextAction,
    latestAt: latestTimes.sort().pop() || "baseline"
  };
}

function growthReviewPacket() {
  const model = buildGrowthReviewModel();
  const channelLines = model.channels.map((channel) => `- ${channel.source}: ${channel.attempts} attempts / ${channel.leads} leads`);
  const blockerLines = model.blockers.length
    ? model.blockers.map((blocker) => `- ${blocker}`)
    : ["- none recorded"];
  return [
    "Strange Company growth review",
    `State: ${model.state}`,
    `Next action: ${model.nextAction}`,
    `Daily outreach: ${model.acquisition.todayAttempts}/${model.acquisition.target}`,
    `Last 7 days: ${model.acquisition.last7Attempts} attempts`,
    `Pipeline: ${model.acquisition.totalLeads} leads / ${model.readiness.qualifiedLeadCount} qualified / ${model.readiness.invoiceReadyLeadCount} invoice-ready / ${model.readiness.paidOrderCount} paid`,
    `Best current source: ${model.bestChannel.source}`,
    `Revenue start: ${model.revenueStartModel.completedTasks}/${model.revenueStartModel.totalTasks} tasks`,
    `Profit readiness: ${model.readiness.state}`,
    "",
    "Channels:",
    channelLines.join("\n"),
    "",
    "Blockers:",
    blockerLines.join("\n"),
    "",
    "Boundary: this is a management receipt. It does not automate outreach, spend, legal setup, payment collection, or customer delivery."
  ].join("\n");
}

function renderGrowthReviewOutput(text, copied) {
  const output = document.querySelector("#growthReviewOutput");
  if (!output) {
    return;
  }
  output.innerHTML = `
    <article>
      <span class="metric-label">${copied ? "Growth review copied" : "Growth review generated"}</span>
      <pre>${escapeHtml(text)}</pre>
    </article>
  `;
}

function renderGrowthReview() {
  const panel = document.querySelector("#growthReviewPanel");
  if (!panel) {
    return;
  }
  const model = buildGrowthReviewModel();
  const blockers = model.blockers.length
    ? model.blockers.slice(0, 8).map((blocker) => `<span class="state red">${escapeHtml(blocker)}</span>`).join("")
    : `<span class="state green">clear</span>`;
  const channelMarkup = model.channels
    .map((channel) => `
      <article class="growth-channel ${channel.source === model.bestChannel.source ? "active" : ""}">
        <span class="metric-label">${escapeHtml(channel.source)}</span>
        <strong>${channel.leads}</strong>
        <p>${channel.attempts} logged attempts</p>
      </article>
    `)
    .join("");
  panel.innerHTML = `
    <article class="growth-review-card ${escapeHtml(model.tone)}">
      <div>
        <span class="metric-label">Growth review</span>
        <h3>${escapeHtml(model.state)}</h3>
        <p>${escapeHtml(model.nextAction)}</p>
      </div>
      <div class="growth-review-metrics">
        <span><strong>${model.acquisition.todayAttempts}/${model.acquisition.target}</strong><small>Today outreach</small></span>
        <span><strong>${model.acquisition.last7Attempts}</strong><small>7-day attempts</small></span>
        <span><strong>${model.readiness.qualifiedLeadCount}</strong><small>Qualified</small></span>
        <span><strong>${model.readiness.invoiceReadyLeadCount}</strong><small>Invoice-ready</small></span>
        <span><strong>${model.readiness.paidOrderCount}</strong><small>Paid</small></span>
        <span><strong>${escapeHtml(model.bestChannel.source)}</strong><small>Best source</small></span>
      </div>
      <div class="growth-review-blockers">${blockers}</div>
    </article>
    <div class="growth-channels">${channelMarkup}</div>
    <div class="growth-review-output" id="growthReviewOutput" aria-live="polite"></div>
  `;
}

async function copyGrowthReviewPacket(button) {
  const packet = growthReviewPacket();
  let copied = false;
  try {
    await navigator.clipboard.writeText(packet);
    copied = true;
  } catch {
    copied = false;
  }
  renderGrowthReviewOutput(packet, copied);
  if (button) {
    const previous = button.getAttribute("aria-label") || "Copy growth review";
    button.setAttribute("aria-label", copied ? "Growth review copied" : "Copy failed");
    setTimeout(() => {
      button.setAttribute("aria-label", previous);
    }, 1500);
  }
}

function buildGrowthTreasuryProposal(model) {
  const now = new Date().toISOString();
  const dateKey = now.slice(0, 10);
  const channel = model.bestChannel.source || "referral";
  const target = model.readiness.paidOrderCount > 0 ? "one additional paid external order" : "one qualified external lead";
  const amount = model.readiness.paidOrderCount > 0 ? 750 : 250;
  return {
    id: `growth-review-${dateKey}`,
    title: `Run capped ${channel} growth test`,
    bucket: "Growth experiments",
    amount,
    className: "A",
    note: `Drafted from Growth Review. State: ${model.state}. Next action: ${model.nextAction}`,
    claim: `The ${channel} channel can produce ${target} within one week without violating the v0 data boundary`,
    argument: [
      `The current growth review has ${model.acquisition.todayAttempts}/${model.acquisition.target} outreach attempts today.`,
      `The pipeline has ${model.readiness.qualifiedLeadCount} qualified, ${model.readiness.invoiceReadyLeadCount} invoice-ready, and ${model.readiness.paidOrderCount} paid records.`,
      "The test is capped, manually operated, and blocked from spend until the Research Gate and Treasury approval both pass.",
      `Therefore the ${channel} channel should receive a capped one-week growth test.`
    ].join(" "),
    context: "Strange Company growth review",
    status: "needs_gate",
    recommendation: "ungated",
    polarity: "pending",
    effectiveness: 0,
    confidence: 0,
    issueCount: 0,
    reportId: "",
    approved: false,
    generatedFromGrowthReview: true,
    growthReviewAt: now
  };
}

function draftGrowthTreasuryProposal(button) {
  const model = buildGrowthReviewModel();
  if (model.blockers.length) {
    renderGrowthReviewOutput([
      "Growth proposal blocked",
      "Resolve these blockers before drafting spend:",
      ...model.blockers.map((blocker) => `- ${blocker}`),
      "",
      "Boundary: the growth review may suggest action, but it cannot bypass setup, payment, support, privacy, or treasury gates."
    ].join("\n"), false);
    return;
  }
  const proposal = buildGrowthTreasuryProposal(model);
  treasuryProposals = [proposal, ...treasuryProposals.filter((item) => item.id !== proposal.id)];
  saveTreasuryProposals();
  renderTreasuryProposals();
  renderGrowthReviewOutput([
    "Growth treasury proposal drafted",
    `Proposal id: ${proposal.id}`,
    `Title: ${proposal.title}`,
    `Bucket: ${proposal.bucket}`,
    `Amount: ${money.format(proposal.amount)}`,
    "Next gate: run the Research Gate from Treasury before any approval."
  ].join("\n"), false);
  renderReceiptChain();
  renderLogs();
  if (button) {
    const label = button.querySelector("span") || button;
    const previous = label.textContent;
    label.textContent = "Proposal drafted";
    setTimeout(() => {
      label.textContent = previous;
    }, 1500);
  }
}

function buildAdaptiveOperatorModel() {
  const receipts = adaptiveOperator.receipts || [];
  const latestReceipt = receipts[0] || null;
  const openReceipts = receipts.filter((receipt) => receipt.status === "open");
  const routedReceipts = receipts.filter((receipt) => receipt.status === "routed" || receipt.routeTargetId);
  const setupModel = buildSetupEvidenceModel();
  const complianceModel = buildBrazilComplianceAgentsModel();
  const revenueStartModel = buildRevenueStartModel();
  const operationsModel = buildOperationsModel();
  const launchDecision = buildLaunchDecision();
  const currentDamage = [];
  if (launchDecision.blockers && launchDecision.blockers.length) currentDamage.push("live gate blockers");
  if (!setupModel.allVerified) currentDamage.push("missing setup evidence");
  if (setupModel.blockedIds.length) currentDamage.push("blocked setup evidence");
  if (complianceModel.blockedCount) currentDamage.push("Brazil compliance blockers");
  if (operationsModel.pausedReason) currentDamage.push("daily run stop rules");
  if (revenueStartModel.blockers.length) currentDamage.push("revenue start blockers");

  let state = "Protocol armed";
  let tone = "amber";
  let nextAction = "Use the protocol when a command, plan, customer step, or live gate fails.";
  if (openReceipts.length) {
    state = "Adaptation open";
    tone = "red";
    nextAction = `Close or route ${openReceipts.length} open adaptation receipt${openReceipts.length === 1 ? "" : "s"}.`;
  } else if (currentDamage.length) {
    state = "Damage detected";
    tone = "amber";
    nextAction = `Record the highest-risk signal: ${currentDamage[0]}.`;
  } else if (latestReceipt) {
    state = "Adapted";
    tone = "green";
    nextAction = "Keep the latest countermeasure in the receipt chain and watch for the next blocker.";
  }

  return {
    receipts,
    latestReceipt,
    openReceipts,
    routedReceipts,
    currentDamage: Array.from(new Set(currentDamage)),
    state,
    tone,
    nextAction
  };
}

function adaptiveReceiptPacket(receipt) {
  const route = adaptiveRouteFor(receipt.damageType);
  return [
    "Strange Company adaptive operator receipt",
    `Receipt id: ${receipt.id}`,
    `Created: ${receipt.createdAt}`,
    `Status: ${receipt.status}`,
    `Damage type: ${route.label}`,
    `Routing lane: ${receipt.routeLane || route.lane}`,
    receipt.routeTargetId ? `Route target: ${receipt.routeTargetType || "execution-packet"} / ${receipt.routeTargetId}` : "Route target: not issued",
    receipt.cooldownId ? `Cooldown lane: ${receipt.cooldownId}` : "",
    "",
    "[Damage Received]",
    receipt.damage,
    "",
    "[Adaptation Complete]",
    receipt.revealed || "Not recorded.",
    "",
    "[Countermeasure]",
    receipt.countermeasure || route.countermeasure,
    "",
    "[Next Evolution]",
    receipt.nextEvolution || "If this countermeasure fails, narrow the scope and issue a human handoff or hardening packet.",
    "",
    "Boundary: this receipt cannot turn on live intake, certify legal/tax/privacy review, accept payment, expose private state, or replace external evidence."
  ].join("\n");
}

function renderAdaptiveOperatorOutput(text, copied) {
  const output = document.querySelector("#adaptiveOperatorOutput");
  if (!output || !text) {
    return;
  }
  output.innerHTML = `
    <article>
      <span class="metric-label">${copied ? "Adaptive receipt copied" : "Adaptive receipt generated"}</span>
      <pre>${escapeHtml(text)}</pre>
    </article>
  `;
}

function renderAdaptiveOperator() {
  const panel = document.querySelector("#adaptiveOperatorPanel");
  if (!panel) {
    return;
  }
  const model = buildAdaptiveOperatorModel();
  const routeOptions = ADAPTIVE_DAMAGE_ROUTES
    .map((route) => `<option value="${escapeHtml(route.id)}">${escapeHtml(route.label)}</option>`)
    .join("");
  const currentDamage = model.currentDamage.length
    ? model.currentDamage.map((item) => `<span class="state amber">${escapeHtml(item)}</span>`).join("")
    : `<span class="state green">no automatic blocker signal</span>`;
  const receiptCards = model.receipts.length
    ? model.receipts.slice(0, 8).map((receipt) => {
        const route = adaptiveRouteFor(receipt.damageType);
        const tone = receipt.status === "closed" ? "green" : receipt.status === "routed" ? "amber" : "red";
        const routeDisabled = receipt.routeTargetId || receipt.status === "closed" ? "disabled" : "";
        const routedLine = receipt.routeTargetId
          ? `<p><strong>Routed:</strong> ${escapeHtml(receipt.routeTargetType || "execution-packet")} / ${escapeHtml(receipt.routeTargetId)}</p>`
          : "";
        const cooldownLine = receipt.cooldownId
          ? `<p><strong>Cooldown:</strong> ${escapeHtml(receipt.cooldownId)}</p>`
          : "";
        return `
          <article class="adaptive-receipt-card">
            <div>
              <span class="metric-label">${escapeHtml(formatReceiptDate(receipt.createdAt))}</span>
              <h4>${escapeHtml(route.label)}</h4>
              <p>${escapeHtml(receipt.damage)}</p>
              <p><strong>Route:</strong> ${escapeHtml(receipt.routeLane || route.lane)}</p>
              ${routedLine}
              ${cooldownLine}
            </div>
            <span class="state ${tone}">${escapeHtml(receipt.status)}</span>
            <div class="adaptive-receipt-actions">
              <button type="button" data-route-adaptive-receipt="${escapeHtml(receipt.id)}" ${routeDisabled}>Route</button>
              <button type="button" data-copy-adaptive-receipt="${escapeHtml(receipt.id)}">Copy</button>
              <button type="button" data-close-adaptive-receipt="${escapeHtml(receipt.id)}" ${receipt.status === "closed" ? "disabled" : ""}>Close</button>
              <button type="button" data-remove-adaptive-receipt="${escapeHtml(receipt.id)}">Remove</button>
            </div>
          </article>
        `;
      }).join("")
    : `
      <article class="adaptive-receipt-card empty">
        <span class="metric-label">No adaptation receipts yet</span>
        <p>Record one when a command fails, an external gate blocks progress, a customer objects, or a plan needs to change.</p>
      </article>
    `;

  panel.innerHTML = `
    <article class="adaptive-operator-card ${escapeHtml(model.tone)}">
      <div>
        <span class="metric-label">Adaptive operator protocol</span>
        <h3>${escapeHtml(model.state)}</h3>
        <p>${escapeHtml(model.nextAction)} Damage is information; the next action must become smaller, safer, or better evidenced.</p>
      </div>
      <div class="adaptive-operator-metrics">
        <span><strong>${model.receipts.length}</strong><small>Receipts</small></span>
        <span><strong>${model.openReceipts.length}</strong><small>Open</small></span>
        <span><strong>${model.currentDamage.length}</strong><small>Current blockers</small></span>
        <span><strong>${escapeHtml(model.latestReceipt ? adaptiveRouteFor(model.latestReceipt.damageType).label : "None")}</strong><small>Latest route</small></span>
      </div>
      <div class="growth-review-blockers">${currentDamage}</div>
    </article>
    <form class="adaptive-operator-form" id="adaptiveOperatorForm" autocomplete="off">
      <div class="field-row">
        <label class="field" for="adaptiveDamageType">
          <span>Damage type</span>
          <select id="adaptiveDamageType" name="damageType">${routeOptions}</select>
        </label>
        <label class="field" for="adaptiveStatus">
          <span>Status</span>
          <select id="adaptiveStatus" name="status">
            <option value="open">open</option>
            <option value="routed">routed</option>
            <option value="closed">closed</option>
          </select>
        </label>
      </div>
      <label class="field" for="adaptiveDamage">
        <span>Damage received</span>
        <textarea id="adaptiveDamage" name="damage" rows="3" required placeholder="What failed, changed, became unsafe, or blocked progress?"></textarea>
      </label>
      <label class="field" for="adaptiveRevealed">
        <span>What the damage revealed</span>
        <textarea id="adaptiveRevealed" name="revealed" rows="2" placeholder="What assumption was weak or incomplete?"></textarea>
      </label>
      <label class="field" for="adaptiveCountermeasure">
        <span>Countermeasure</span>
        <textarea id="adaptiveCountermeasure" name="countermeasure" rows="2" placeholder="Next smallest safe action. Leave blank to use the route default."></textarea>
      </label>
      <label class="field" for="adaptiveNextEvolution">
        <span>Next evolution if this fails</span>
        <textarea id="adaptiveNextEvolution" name="nextEvolution" rows="2" placeholder="What to try next if this countermeasure fails?"></textarea>
      </label>
      <button class="primary-action" type="submit">
        <i data-lucide="file-plus-2"></i>
        <span>Record adaptation</span>
      </button>
      <p class="evidence-form-error" id="adaptiveOperatorError" hidden></p>
    </form>
    <div class="adaptive-operator-output" id="adaptiveOperatorOutput" aria-live="polite"></div>
    <div class="adaptive-receipt-list">${receiptCards}</div>
  `;

  const form = document.querySelector("#adaptiveOperatorForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      recordAdaptiveReceipt(form);
    });
  }
  document.querySelectorAll("[data-copy-adaptive-receipt]").forEach((button) => {
    button.addEventListener("click", () => copyAdaptiveReceipt(button.dataset.copyAdaptiveReceipt, button));
  });
  document.querySelectorAll("[data-route-adaptive-receipt]").forEach((button) => {
    button.addEventListener("click", () => routeAdaptiveReceipt(button.dataset.routeAdaptiveReceipt));
  });
  document.querySelectorAll("[data-close-adaptive-receipt]").forEach((button) => {
    button.addEventListener("click", () => closeAdaptiveReceipt(button.dataset.closeAdaptiveReceipt));
  });
  document.querySelectorAll("[data-remove-adaptive-receipt]").forEach((button) => {
    button.addEventListener("click", () => removeAdaptiveReceipt(button.dataset.removeAdaptiveReceipt));
  });
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function showAdaptiveOperatorError(message) {
  const target = document.querySelector("#adaptiveOperatorError");
  if (!target) return;
  target.textContent = message || "";
  target.hidden = !message;
}

function recordAdaptiveReceipt(form) {
  const formData = new FormData(form);
  const damageType = String(formData.get("damageType") || "");
  const route = adaptiveRouteFor(damageType);
  const damage = String(formData.get("damage") || "").trim();
  const revealed = String(formData.get("revealed") || "").trim();
  const countermeasure = String(formData.get("countermeasure") || "").trim() || route.countermeasure;
  const nextEvolution = String(formData.get("nextEvolution") || "").trim();
  const status = String(formData.get("status") || "open");
  if (!damage) {
    showAdaptiveOperatorError("Record what failed or changed first.");
    return;
  }
  const sensitive = findSensitiveData([damage, revealed, countermeasure, nextEvolution].join("\n"));
  if (sensitive.length) {
    showAdaptiveOperatorError(`Receipt text contains ${sensitive.join(", ")}. Strip and retry.`);
    return;
  }
  const receipt = normalizeAdaptiveReceipt({
    id: `adapt-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    damageType: route.id,
    damage,
    revealed,
    countermeasure,
    nextEvolution,
    routeLane: route.lane,
    status
  });
  if (!receipt) {
    showAdaptiveOperatorError("Unable to create adaptation receipt.");
    return;
  }
  adaptiveOperator.receipts = [receipt, ...(adaptiveOperator.receipts || [])].slice(0, 50);
  saveAdaptiveOperator();
  form.reset();
  renderAdaptiveOperator();
  renderAdaptiveOperatorOutput(adaptiveReceiptPacket(receipt), false);
  renderReceiptChain();
  renderLogs();
}

async function copyAdaptiveReceipt(receiptId, button) {
  const receipt = (adaptiveOperator.receipts || []).find((item) => item.id === receiptId);
  if (!receipt) {
    return;
  }
  const packet = adaptiveReceiptPacket(receipt);
  let copied = false;
  try {
    await navigator.clipboard.writeText(packet);
    copied = true;
  } catch {
    copied = false;
  }
  renderAdaptiveOperatorOutput(packet, copied);
  if (button) {
    const previous = button.textContent;
    button.textContent = copied ? "Copied" : "Copy failed";
    setTimeout(() => {
      button.textContent = previous;
    }, 1500);
  }
}

function copyLatestAdaptiveReceipt(button) {
  const latest = (adaptiveOperator.receipts || [])[0];
  if (!latest) {
    renderAdaptiveOperatorOutput("No adaptive receipt exists yet.", false);
    return;
  }
  copyAdaptiveReceipt(latest.id, button);
}

function adaptiveReceiptNeedsCooldown(receipt) {
  return ["growth-experiment", "customer-objection"].includes(receipt.damageType);
}

function adaptiveRouteDue(receipt) {
  if (["live-gate", "brazil-compliance", "google-form", "support-incident", "customer-order"].includes(receipt.damageType)) {
    return "1 day";
  }
  if (receipt.damageType === "security-resilience") {
    return "2 days";
  }
  return "3 days";
}

function adaptiveRoutePacketTitle(receipt) {
  const route = adaptiveRouteFor(receipt.damageType);
  if (receipt.damageType === "security-resilience") {
    return `Harden adaptive weakness: ${route.label}`;
  }
  return `Route adaptive receipt: ${route.label}`;
}

function adaptiveRoutePacketDetail(receipt) {
  return [
    `Damage: ${receipt.damage}`,
    receipt.revealed ? `Revealed: ${receipt.revealed}` : "",
    `Countermeasure: ${receipt.countermeasure || adaptiveRouteFor(receipt.damageType).countermeasure}`,
    receipt.nextEvolution ? `Next evolution: ${receipt.nextEvolution}` : ""
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 1800);
}

function issueAdaptiveExecutionPacket(receipt) {
  const route = adaptiveRouteFor(receipt.damageType);
  const packetId = `adaptive-packet-${slugify(receipt.id) || Date.now().toString(36)}`;
  const existing = executionPackets.find((packet) => packet.id === packetId);
  if (existing) {
    return existing;
  }
  const packet = {
    id: packetId,
    title: adaptiveRoutePacketTitle(receipt),
    detail: adaptiveRoutePacketDetail(receipt),
    budget: 0,
    due: adaptiveRouteDue(receipt),
    state: "Open",
    source: `Adaptive operator / ${receipt.id}`,
    acceptance: [
      `Execute the recorded countermeasure for ${route.label}.`,
      "Keep public live intake closed unless external evidence and review dates are real.",
      receipt.damageType === "security-resilience" ? "Add or update a survival check if the weakness is structural." : ""
    ].filter(Boolean).join(" "),
    adaptiveReceiptId: receipt.id,
    adaptiveDamageType: receipt.damageType,
    createdAt: new Date().toISOString()
  };
  executionPackets.unshift(packet);
  return packet;
}

function issueAdaptiveCooldownLane(receipt) {
  if (!adaptiveReceiptNeedsCooldown(receipt)) {
    return "";
  }
  const cooldownId = `cooldown-adapt-${slugify(receipt.id) || Date.now().toString(36)}`;
  const existing = cooldownLanes.find((lane) => lane.id === cooldownId);
  if (existing) {
    return existing.id;
  }
  const route = adaptiveRouteFor(receipt.damageType);
  cooldownLanes.unshift({
    id: cooldownId,
    lane: receipt.damageType === "customer-objection" ? "Customer objection route" : "Experiment or spend route",
    reason: [
      receipt.damage,
      receipt.revealed ? `Revealed: ${receipt.revealed}` : "",
      `Countermeasure: ${receipt.countermeasure || route.countermeasure}`
    ].filter(Boolean).join(" "),
    source: `Adaptive operator / ${receipt.id}`,
    sourceAdaptationId: receipt.id,
    expires: "2 cycles",
    createdAt: new Date().toISOString()
  });
  return cooldownId;
}

function routeAdaptiveReceipt(receiptId) {
  const receipt = (adaptiveOperator.receipts || []).find((item) => item.id === receiptId);
  if (!receipt) {
    return;
  }
  const sensitive = findSensitiveData([
    receipt.damage,
    receipt.revealed,
    receipt.countermeasure,
    receipt.nextEvolution
  ].join("\n"));
  if (sensitive.length) {
    showAdaptiveOperatorError(`Receipt text contains ${sensitive.join(", ")}. Strip and retry.`);
    return;
  }

  const packet = issueAdaptiveExecutionPacket(receipt);
  const cooldownId = issueAdaptiveCooldownLane(receipt) || receipt.cooldownId || "";
  const routedAt = receipt.routedAt || new Date().toISOString();
  adaptiveOperator.receipts = (adaptiveOperator.receipts || []).map((item) =>
    item.id === receipt.id
      ? {
          ...item,
          status: "routed",
          routedAt,
          routeTargetType: "execution-packet",
          routeTargetId: packet.id,
          cooldownId
        }
      : item
  );

  saveExecutionPackets();
  if (cooldownId) {
    saveCooldownLanes();
  }
  saveAdaptiveOperator();
  renderAdaptiveOperator();
  renderBounties();
  renderCooldownLanes();
  renderReceiptChain();
  renderLogs();
  renderAdaptiveOperatorOutput([
    "Adaptive receipt routed",
    `Receipt id: ${receipt.id}`,
    `Execution packet: ${packet.id}`,
    cooldownId ? `Cooldown lane: ${cooldownId}` : "",
    "",
    "Boundary: this is a private no-spend action packet. It does not turn on live intake or certify external evidence."
  ].filter((line) => line !== "").join("\n"), false);
}

function closeAdaptiveReceipt(receiptId) {
  const now = new Date().toISOString();
  adaptiveOperator.receipts = (adaptiveOperator.receipts || []).map((receipt) =>
    receipt.id === receiptId
      ? { ...receipt, status: "closed", closedAt: receipt.closedAt || now }
      : receipt
  );
  saveAdaptiveOperator();
  renderAdaptiveOperator();
  renderReceiptChain();
  renderLogs();
}

function removeAdaptiveReceipt(receiptId) {
  adaptiveOperator.receipts = (adaptiveOperator.receipts || []).filter((receipt) => receipt.id !== receiptId);
  saveAdaptiveOperator();
  renderAdaptiveOperator();
  renderReceiptChain();
  renderLogs();
}

function resetAdaptiveOperator() {
  adaptiveOperator = defaultAdaptiveOperator();
  saveAdaptiveOperator();
  renderAdaptiveOperator();
  renderReceiptChain();
  renderLogs();
}

function renderSetupEvidence() {
  const panel = document.querySelector("#setupEvidencePanel");
  if (!panel) return;
  const model = buildSetupEvidenceModel();
  const verifiedCount = model.verifiedIds.length;
  const total = model.records.length;
  const cards = model.records
    .map((record) => {
      const tone = record.status === "verified" ? "green" : record.status === "blocked" ? "red" : record.status === "pending" ? "amber" : "";
      const verifiedLine = record.verifiedAt
        ? `<p class="setup-evidence-stamp">Verified ${escapeHtml(formatReceiptDate(record.verifiedAt))}</p>`
        : "";
      const urlLine = record.evidenceUrl
        ? `<a class="setup-evidence-link" href="${escapeHtml(record.evidenceUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(record.evidenceUrl)}</a>`
        : `<span class="metric-label">No https evidence URL yet</span>`;
      const noteLine = record.operatorNote
        ? `<p class="setup-evidence-note">${escapeHtml(record.operatorNote)}</p>`
        : "";
      return `
        <article class="setup-evidence-card" data-evidence-id="${escapeHtml(record.id)}">
          <div>
            <span class="metric-label">${escapeHtml(record.label)}</span>
            <p>${escapeHtml(record.detail)}</p>
            ${urlLine}
            ${verifiedLine}
            ${noteLine}
          </div>
          <span class="state ${tone}">${escapeHtml(record.status)}</span>
          <div class="setup-evidence-fields">
            <label>
              <span>Evidence URL (https only)</span>
              <input type="url" inputmode="url" placeholder="https://..." value="${escapeHtml(record.evidenceUrl || "")}" data-evidence-url="${escapeHtml(record.id)}" />
            </label>
            <label>
              <span>Operator note</span>
              <textarea rows="2" placeholder="What was checked; who confirmed it." data-evidence-note="${escapeHtml(record.id)}">${escapeHtml(record.operatorNote || "")}</textarea>
            </label>
            <label>
              <span>Status</span>
              <select data-evidence-status="${escapeHtml(record.id)}">
                ${SETUP_EVIDENCE_STATUSES.map((s) => `<option value="${escapeHtml(s)}" ${s === record.status ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="setup-evidence-actions">
            <button type="button" data-save-evidence="${escapeHtml(record.id)}">Save</button>
            <button type="button" data-verify-evidence="${escapeHtml(record.id)}" ${record.status === "verified" ? "disabled" : ""}>Verify</button>
            <button type="button" data-clear-evidence="${escapeHtml(record.id)}">Clear</button>
            <p class="evidence-form-error" data-evidence-error="${escapeHtml(record.id)}" hidden></p>
          </div>
        </article>
      `;
    })
    .join("");
  panel.innerHTML = `
    <article class="setup-evidence-summary ${escapeHtml(model.tone)}">
      <div>
        <span class="metric-label">Setup evidence</span>
        <h3>${escapeHtml(model.state)}</h3>
        <p>Operator-asserted proof of external setup. The repo cannot certify Brazilian entity, CNPJ, tax regime, NFS-e, bank/payment, support, or LGPD completion by itself; verified rows mean the operator confirmed the artifact outside this prototype.</p>
      </div>
      <div class="setup-evidence-counts">
        <span><strong>${verifiedCount}/${total}</strong><small>Verified</small></span>
        <span><strong>${model.pendingIds.length}</strong><small>Pending</small></span>
        <span><strong>${model.blockedIds.length}</strong><small>Blocked</small></span>
        <span><strong>${model.missingIds.length}</strong><small>Missing</small></span>
      </div>
    </article>
    <div class="setup-evidence-list">${cards}</div>
  `;

  document.querySelectorAll("[data-evidence-url]").forEach((input) => {
    input.addEventListener("change", () => updateSetupEvidenceUrl(input.dataset.evidenceUrl, input.value));
  });
  document.querySelectorAll("[data-evidence-note]").forEach((textarea) => {
    textarea.addEventListener("change", () => updateSetupEvidenceNote(textarea.dataset.evidenceNote, textarea.value));
  });
  document.querySelectorAll("[data-evidence-status]").forEach((select) => {
    select.addEventListener("change", () => updateSetupEvidenceStatus(select.dataset.evidenceStatus, select.value));
  });
  document.querySelectorAll("[data-verify-evidence]").forEach((btn) => {
    btn.addEventListener("click", () => verifySetupEvidence(btn.dataset.verifyEvidence));
  });
  document.querySelectorAll("[data-clear-evidence]").forEach((btn) => {
    btn.addEventListener("click", () => clearSetupEvidence(btn.dataset.clearEvidence));
  });
  document.querySelectorAll("[data-save-evidence]").forEach((btn) => {
    btn.addEventListener("click", () => saveSetupEvidenceCard(btn.dataset.saveEvidence, btn));
  });
  renderBrazilComplianceAgents();
}

function renderBrazilComplianceAgents() {
  const panel = document.querySelector("#brazilComplianceAgentsPanel");
  if (!panel) return;
  const model = buildBrazilComplianceAgentsModel();
  const agentCards = model.agents
    .map((agent) => {
      const rows = agent.records
        .map((record) => {
          const tone = record.status === "verified" ? "green" : record.status === "blocked" ? "red" : record.status === "pending" ? "amber" : "";
          return `
            <li>
              <span>${escapeHtml(record.label)}</span>
              <strong class="state ${tone}">${escapeHtml(record.status)}</strong>
            </li>
          `;
        })
        .join("");
      return `
        <article class="compliance-agent-card ${escapeHtml(agent.tone)}">
          <div class="compliance-agent-head">
            <div>
              <span class="metric-label">AI prep / human closure</span>
              <h4>${escapeHtml(agent.title)}</h4>
            </div>
            <span class="state ${escapeHtml(agent.tone)}">${escapeHtml(agent.status)}</span>
          </div>
          <p>${escapeHtml(agent.nextAction)}</p>
          <dl class="compliance-agent-work">
            <div>
              <dt>AI prepares</dt>
              <dd>${escapeHtml(agent.aiCan)}</dd>
            </div>
            <div>
              <dt>Human closes</dt>
              <dd>${escapeHtml(agent.humanMust)}</dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>${escapeHtml(agent.evidence)}</dd>
            </div>
          </dl>
          <ul class="compliance-agent-evidence">${rows}</ul>
          <div class="compliance-agent-footer">
            <span>${escapeHtml(agent.stopRule)}</span>
            <button type="button" data-copy-compliance-agent="${escapeHtml(agent.id)}">
              <i data-lucide="copy"></i>
              <span>Copy packet</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
  panel.innerHTML = `
    <article class="compliance-agent-summary ${escapeHtml(model.tone)}">
      <div>
        <span class="metric-label">Brazil compliance agents</span>
        <h3>${escapeHtml(model.state)}</h3>
        <p>${escapeHtml(model.nextAction)} Agents organize draft work for CNPJ/entity, tax, NFS-e, LGPD, consumer terms, payment, intake, support, and AI handoff. They do not certify legal compliance.</p>
      </div>
      <div class="compliance-agent-counts">
        <span><strong>${model.readyCount}/${model.totalCount}</strong><small>Ready</small></span>
        <span><strong>${model.blockedCount}</strong><small>Blocked</small></span>
        <span><strong>${model.missingCount}</strong><small>Missing</small></span>
      </div>
    </article>
    <div class="compliance-agent-list">${agentCards}</div>
    <div class="compliance-agent-output" id="complianceAgentOutput" aria-live="polite"></div>
  `;
  document.querySelectorAll("[data-copy-compliance-agent]").forEach((button) => {
    button.addEventListener("click", () => copyBrazilComplianceAgentPacket(button.dataset.copyComplianceAgent, button));
  });
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderComplianceAgentOutput(text, copied) {
  const output = document.querySelector("#complianceAgentOutput");
  if (!output) return;
  output.innerHTML = `
    <article>
      <span class="metric-label">${copied ? "Agent packet copied" : "Agent packet generated"}</span>
      <pre>${escapeHtml(text)}</pre>
    </article>
  `;
}

async function copyBrazilComplianceAgentPacket(agentId, button) {
  const packet = brazilComplianceAgentPacket(agentId);
  let copied = false;
  try {
    await navigator.clipboard.writeText(packet);
    copied = true;
  } catch {
    copied = false;
  }
  renderComplianceAgentOutput(packet, copied);
  if (button) {
    const label = button.querySelector("span") || button;
    const previous = label.textContent;
    label.textContent = copied ? "Copied" : "Copy failed";
    setTimeout(() => {
      label.textContent = previous;
    }, 1500);
  }
}

function showSetupEvidenceError(slotId, message) {
  const target = document.querySelector(`[data-evidence-error="${slotId}"]`);
  if (!target) return;
  if (!message) {
    target.hidden = true;
    target.textContent = "";
    return;
  }
  target.hidden = false;
  target.textContent = message;
}

function patchSetupEvidence(slotId, patch) {
  let touched = false;
  setupEvidence = setupEvidence.map((record) => {
    if (record.id !== slotId) return record;
    touched = true;
    return { ...record, ...patch, updatedAt: new Date().toISOString() };
  });
  if (touched) saveSetupEvidence();
  return touched;
}

function updateSetupEvidenceUrl(slotId, value) {
  const raw = String(value || "").trim();
  const safe = raw ? safeHttpsUrl(raw) : "";
  if (raw && !safe) {
    showSetupEvidenceError(slotId, "Evidence URL must start with https://.");
    return;
  }
  showSetupEvidenceError(slotId, "");
  patchSetupEvidence(slotId, { evidenceUrl: safe });
  renderSetupEvidence();
  renderProfitReadiness();
  renderReceiptChain();
  renderLogs();
}

function updateSetupEvidenceNote(slotId, value) {
  const note = String(value || "").slice(0, 900);
  const findings = findSensitiveData(note);
  if (findings.length) {
    showSetupEvidenceError(slotId, `Operator note contains ${findings.join(", ")}. Strip and retry.`);
    return;
  }
  showSetupEvidenceError(slotId, "");
  patchSetupEvidence(slotId, { operatorNote: note });
  renderSetupEvidence();
  renderReceiptChain();
  renderLogs();
}

function updateSetupEvidenceStatus(slotId, value) {
  if (!SETUP_EVIDENCE_STATUSES.includes(value)) return;
  const patch = { status: value };
  if (value === "verified") {
    patch.verifiedAt = new Date().toISOString();
  } else {
    patch.verifiedAt = "";
  }
  patchSetupEvidence(slotId, patch);
  renderSetupEvidence();
  renderProfitReadiness();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function verifySetupEvidence(slotId) {
  const record = setupEvidence.find((r) => r.id === slotId);
  if (!record) return;
  if (!record.evidenceUrl) {
    showSetupEvidenceError(slotId, "Paste an https evidence URL before verifying.");
    return;
  }
  if (!record.operatorNote.trim()) {
    showSetupEvidenceError(slotId, "Record an operator note before verifying.");
    return;
  }
  showSetupEvidenceError(slotId, "");
  patchSetupEvidence(slotId, { status: "verified", verifiedAt: new Date().toISOString() });
  renderSetupEvidence();
  renderProfitReadiness();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function clearSetupEvidence(slotId) {
  showSetupEvidenceError(slotId, "");
  patchSetupEvidence(slotId, { status: "missing", evidenceUrl: "", verifiedAt: "", operatorNote: "" });
  renderSetupEvidence();
  renderProfitReadiness();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function saveSetupEvidenceCard(slotId, button) {
  const card = document.querySelector(`[data-evidence-id="${slotId}"]`);
  if (!card) return;
  const url = card.querySelector("[data-evidence-url]").value;
  const note = card.querySelector("[data-evidence-note]").value;
  const status = card.querySelector("[data-evidence-status]").value;
  const raw = String(url || "").trim();
  const safe = raw ? safeHttpsUrl(raw) : "";
  if (raw && !safe) {
    showSetupEvidenceError(slotId, "Evidence URL must start with https://.");
    return;
  }
  const findings = findSensitiveData(note);
  if (findings.length) {
    showSetupEvidenceError(slotId, `Operator note contains ${findings.join(", ")}. Strip and retry.`);
    return;
  }
  if (!SETUP_EVIDENCE_STATUSES.includes(status)) {
    showSetupEvidenceError(slotId, "Invalid status.");
    return;
  }
  showSetupEvidenceError(slotId, "");
  const patch = {
    evidenceUrl: safe,
    operatorNote: String(note || "").slice(0, 900),
    status
  };
  patch.verifiedAt = status === "verified" ? new Date().toISOString() : "";
  patchSetupEvidence(slotId, patch);
  renderSetupEvidence();
  renderProfitReadiness();
  renderOperations();
  renderReceiptChain();
  renderLogs();
  if (button) {
    const original = button.textContent;
    button.textContent = "Saved";
    setTimeout(() => { button.textContent = original; }, 1200);
  }
}

function resetSetupEvidence() {
  setupEvidence = defaultSetupEvidence();
  saveSetupEvidence();
  renderSetupEvidence();
  renderProfitReadiness();
  renderOperations();
  renderReceiptChain();
  renderLogs();
}

function outreachPacket() {
  const model = buildCustomerAcquisitionModel();
  const lines = [
    "Strange Works Studio - daily outreach packet",
    `Daily target: ${model.target}`,
    `Today's logged attempts: ${model.todayAttempts}`,
    `7-day attempts: ${model.last7Attempts}`,
    "",
    "Conversions:",
    `- prospect: ${model.conversions.prospect}`,
    `- qualified: ${model.conversions.qualified}`,
    `- invoice-ready: ${model.conversions.invoice_ready}`,
    `- invoice-sent: ${model.conversions.invoice_sent}`,
    `- paid: ${model.conversions.paid}`,
    `- delivered: ${model.conversions.delivered}`,
    "",
    "Leads by source:",
    ...ACQUISITION_LEAD_SOURCES.map((s) => `- ${s}: ${model.leadsBySource[s] || 0}`),
    `- unspecified: ${model.leadsBySource.unspecified || 0}`,
    "",
    "Outreach boundary: contact only operators or companies you can name in public. Do not paste PHI, payment data, credentials, or private records into the log."
  ];
  return lines.join("\n");
}

function renderCustomerAcquisition() {
  const panel = document.querySelector("#customerAcquisitionPanel");
  if (!panel) return;
  const model = buildCustomerAcquisitionModel();
  const targetInput = document.querySelector("#outreachTargetInput");
  if (targetInput && document.activeElement !== targetInput) {
    targetInput.value = String(model.target);
  }
  const ack = customerAcquisition.log
    .slice(0, 20)
    .map((entry) => {
      const stamp = entry.at ? formatReceiptDate(entry.at) : "baseline";
      const note = entry.note ? `<p class="acq-log-note">${escapeHtml(entry.note)}</p>` : "";
      return `
        <li class="acq-log-entry">
          <div>
            <span class="metric-label">${escapeHtml(entry.source)}</span>
            <strong>${entry.attempts} attempt${entry.attempts === 1 ? "" : "s"}</strong>
            <time>${escapeHtml(stamp)}</time>
          </div>
          ${note}
          <button type="button" data-remove-outreach="${escapeHtml(entry.id)}">Remove</button>
        </li>
      `;
    })
    .join("");
  const conversionItems = ["prospect", "qualified", "invoice_ready", "invoice_sent", "paid", "delivered", "rejected"]
    .map((stage) => `<span><strong>${model.conversions[stage] || 0}</strong><small>${escapeHtml(stage.replace(/_/g, " "))}</small></span>`)
    .join("");
  const sourceItems = ACQUISITION_LEAD_SOURCES.map((source) =>
    `<span><strong>${model.leadsBySource[source] || 0}</strong><small>${escapeHtml(source)}</small></span>`
  ).join("") + `<span><strong>${model.leadsBySource.unspecified || 0}</strong><small>unspecified</small></span>`;
  const targetTone = model.target === 0 ? "amber" : model.todayMet ? "green" : "red";
  panel.innerHTML = `
    <article class="acq-summary ${escapeHtml(targetTone)}">
      <div>
        <span class="metric-label">Customer acquisition</span>
        <h3>${model.todayMet ? "Daily target met" : model.target === 0 ? "No daily target set" : "Daily target open"}</h3>
        <p>Tracks operator-led outreach and the pipeline that follows. It is not automated outreach, lead generation, or autonomous email sending.</p>
      </div>
      <div class="acq-counts">
        <span><strong>${model.todayAttempts}/${model.target}</strong><small>Today vs target</small></span>
        <span><strong>${model.last7Attempts}</strong><small>7-day attempts</small></span>
        <span><strong>${model.totalLeads}</strong><small>Total leads</small></span>
      </div>
    </article>
    <div class="acq-target-row">
      <label class="acq-target-label">
        <span>Daily outreach target</span>
        <input id="outreachTargetInput" type="number" min="0" step="1" value="${model.target}" />
      </label>
      <button type="button" id="saveOutreachTarget" class="primary-action">
        <span>Save target</span>
      </button>
      <button type="button" id="copyOutreachPacket" class="primary-action">
        <span>Copy outreach packet</span>
      </button>
    </div>
    <form class="acq-log-form" id="outreachLogForm">
      <div class="field-row">
        <div class="field">
          <label for="outreachSource">Source</label>
          <select id="outreachSource" name="source">
            ${ACQUISITION_LEAD_SOURCES.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="outreachAttempts">Attempts</label>
          <input id="outreachAttempts" name="attempts" type="number" min="1" step="1" value="1" />
        </div>
      </div>
      <div class="field">
        <label for="outreachNote">Note (no PHI, no credentials, no customer-private records)</label>
        <textarea id="outreachNote" name="note" rows="2"></textarea>
      </div>
      <button class="primary-action" type="submit">
        <i data-lucide="plus"></i>
        <span>Log outreach</span>
      </button>
      <p class="evidence-form-error" id="outreachLogError" hidden></p>
    </form>
    <div class="acq-conversions">
      <span class="metric-label">Conversion counts</span>
      <div class="acq-grid">${conversionItems}</div>
    </div>
    <div class="acq-sources">
      <span class="metric-label">Leads by source</span>
      <div class="acq-grid">${sourceItems}</div>
    </div>
    <ol class="acq-log">${ack || `<li class="acq-log-empty">No outreach logged yet.</li>`}</ol>
  `;

  const targetButton = document.querySelector("#saveOutreachTarget");
  if (targetButton) targetButton.addEventListener("click", () => {
    const value = document.querySelector("#outreachTargetInput")?.value;
    updateOutreachTarget(value);
  });
  const copyButton = document.querySelector("#copyOutreachPacket");
  if (copyButton) copyButton.addEventListener("click", () => copyOutreachPacket(copyButton));
  const form = document.querySelector("#outreachLogForm");
  if (form) form.addEventListener("submit", (event) => { event.preventDefault(); submitOutreachLog(form); });
  document.querySelectorAll("[data-remove-outreach]").forEach((btn) => {
    btn.addEventListener("click", () => removeOutreachEntry(btn.dataset.removeOutreach));
  });
}

function showOutreachError(message) {
  const target = document.querySelector("#outreachLogError");
  if (!target) return;
  if (!message) {
    target.hidden = true;
    target.textContent = "";
    return;
  }
  target.hidden = false;
  target.textContent = message;
}

function updateOutreachTarget(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw < 0) return;
  customerAcquisition.dailyOutreachTarget = Math.min(Math.floor(raw), 999);
  saveCustomerAcquisition();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function submitOutreachLog(form) {
  const formData = new FormData(form);
  const source = String(formData.get("source") || "").trim().toLowerCase();
  const attempts = Number(formData.get("attempts") || 0);
  const note = String(formData.get("note") || "").trim();
  if (!ACQUISITION_LEAD_SOURCES.includes(source)) {
    showOutreachError(`Source must be one of ${ACQUISITION_LEAD_SOURCES.join(", ")}.`);
    return;
  }
  if (!Number.isFinite(attempts) || attempts <= 0) {
    showOutreachError("Attempts must be a positive whole number.");
    return;
  }
  const findings = findSensitiveData(note);
  if (findings.length) {
    showOutreachError(`Note contains ${findings.join(", ")}. Strip and retry.`);
    return;
  }
  showOutreachError("");
  const entry = normalizeOutreachLogEntry({
    id: `outreach-${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    source,
    attempts,
    note
  });
  if (!entry) return;
  customerAcquisition.log.unshift(entry);
  customerAcquisition.log = customerAcquisition.log.slice(0, 90);
  saveCustomerAcquisition();
  form.reset();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function removeOutreachEntry(entryId) {
  customerAcquisition.log = (customerAcquisition.log || []).filter((entry) => entry.id !== entryId);
  saveCustomerAcquisition();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function resetCustomerAcquisition() {
  customerAcquisition = defaultCustomerAcquisition();
  saveCustomerAcquisition();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function renderSalesPipeline() {
  const form = document.querySelector("#salesLeadForm");
  const serviceSelect = document.querySelector("#salesLeadService");
  const amountInput = document.querySelector("#salesLeadAmount");
  const leadList = document.querySelector("#salesLeadList");
  if (!leadList) {
    return;
  }
  const services = operationServices();
  if (serviceSelect) {
    const selectedService = serviceSelect.value || services[0]?.id || "";
    serviceSelect.innerHTML = services
      .map(
        (service) => `
          <option value="${escapeHtml(service.id)}" data-price="${Number(service.price || 0)}">
            ${escapeHtml(service.title)} / ${money.format(Number(service.price || 0))}
          </option>
        `
      )
      .join("");
    if (services.some((service) => service.id === selectedService)) {
      serviceSelect.value = selectedService;
    }
    const selected = services.find((service) => service.id === serviceSelect.value) || services[0];
    if (amountInput && selected && !amountInput.value) {
      amountInput.value = String(Number(selected.price || 0));
    }
  }

  if (!salesLeads.length) {
    leadList.innerHTML = `
      <article class="sales-lead-card">
        <div>
          <span class="metric-label">Sales pipeline</span>
          <h4>No leads yet</h4>
          <p>Add a prospect before creating invoice requests. Qualification keeps payment pressure away from unready buyers.</p>
        </div>
      </article>
    `;
    return;
  }

  leadList.innerHTML = salesLeads
    .map((lead) => {
      const service = leadService(lead);
      const tone = toneForLeadStage(lead.stage);
      const linkedOrder = lead.orderId ? (operations.orders || []).find((order) => order.id === lead.orderId) : null;
      const canConvert = ["qualified", "invoice_ready"].includes(lead.stage) && !lead.orderId;
      const canAdvance = !["delivered", "rejected"].includes(lead.stage);
      return `
        <article class="sales-lead-card">
          <div>
            <span class="metric-label">${escapeHtml(lead.source || "Manual")}</span>
            <h4>${escapeHtml(lead.customer)}</h4>
            <p>${escapeHtml(service?.title || lead.serviceId)} / ${money.format(Number(lead.amount || 0))}</p>
            <p>${escapeHtml(lead.need || "Need not recorded")}</p>
            ${lead.qualificationNote ? `<p><strong>Qualification:</strong> ${escapeHtml(lead.qualificationNote)}</p>` : ""}
            ${lead.rejectionReason ? `<p class="sales-lead-rejected"><strong>Rejected:</strong> ${escapeHtml(lead.rejectionReason)}</p>` : ""}
            ${linkedOrder ? `<p class="ops-order-meta">Order: ${escapeHtml(linkedOrder.invoiceNumber || linkedOrder.id)} / ${escapeHtml(linkedOrder.status)}</p>` : ""}
          </div>
          <strong>${escapeHtml(lead.contact || "No contact")}</strong>
          <span class="state ${tone}">${escapeHtml(labelForLeadStage(lead.stage))}</span>
          <div class="ops-actions sales-lead-actions">
            <button type="button" data-copy-lead-qualification="${escapeHtml(lead.id)}">Qualification</button>
            <button type="button" data-copy-lead-invoice="${escapeHtml(lead.id)}">Invoice packet</button>
            <button type="button" data-copy-lead-row="${escapeHtml(lead.id)}">Copy row</button>
            <button type="button" data-advance-sales-lead="${escapeHtml(lead.id)}" ${canAdvance ? "" : "disabled"}>Advance</button>
            <button type="button" data-convert-sales-lead="${escapeHtml(lead.id)}" ${canConvert ? "" : "disabled"}>Create order</button>
            <button type="button" data-reject-sales-lead="${escapeHtml(lead.id)}" ${lead.stage === "rejected" ? "disabled" : ""}>Reject</button>
            <button type="button" data-remove-sales-lead="${escapeHtml(lead.id)}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-copy-lead-qualification]").forEach((button) => {
    button.addEventListener("click", () => copyLeadQualificationPacket(button.dataset.copyLeadQualification, button));
  });
  document.querySelectorAll("[data-copy-lead-invoice]").forEach((button) => {
    button.addEventListener("click", () => copyLeadInvoicePacket(button.dataset.copyLeadInvoice, button));
  });
  document.querySelectorAll("[data-copy-lead-row]").forEach((button) => {
    button.addEventListener("click", () => copyLeadLedgerRow(button.dataset.copyLeadRow, button));
  });
  document.querySelectorAll("[data-advance-sales-lead]").forEach((button) => {
    button.addEventListener("click", () => advanceSalesLead(button.dataset.advanceSalesLead));
  });
  document.querySelectorAll("[data-convert-sales-lead]").forEach((button) => {
    button.addEventListener("click", () => convertSalesLeadToOrder(button.dataset.convertSalesLead));
  });
  document.querySelectorAll("[data-reject-sales-lead]").forEach((button) => {
    button.addEventListener("click", () => rejectSalesLead(button.dataset.rejectSalesLead));
  });
  document.querySelectorAll("[data-remove-sales-lead]").forEach((button) => {
    button.addEventListener("click", () => removeSalesLead(button.dataset.removeSalesLead));
  });

}

function renderOperations() {
  const verdict = document.querySelector("#operationsVerdict");
  const metrics = document.querySelector("#operationsMetrics");
  const policy = document.querySelector("#operationsPolicy");
  const serviceSelect = document.querySelector("#orderService");
  const controlList = document.querySelector("#operationsControlList");
  const orderList = document.querySelector("#operationsOrderList");
  const launchList = document.querySelector("#operationsLaunchList");
  if (!verdict || !metrics || !policy || !serviceSelect || !controlList || !orderList) {
    return;
  }
  syncOperationsConfigForm();
  syncSalesLeadsFromOrders();

  const model = buildOperationsModel();
  renderProfitReadiness();
  renderRevenueStart();
  renderSalesPipeline();
  renderBrazilComplianceAgents();
  renderAdaptiveOperator();
  renderGrowthReview();
  const services = operationServices();
  const selectedService = serviceSelect.value || services[0]?.id || "";
  serviceSelect.innerHTML = services
    .map(
      (service) => `
        <option value="${escapeHtml(service.id)}" data-price="${Number(service.price || 0)}">
          ${escapeHtml(service.title)} / ${money.format(Number(service.price || 0))}
        </option>
      `
    )
    .join("");
  if (services.some((service) => service.id === selectedService)) {
    serviceSelect.value = selectedService;
  }

  verdict.innerHTML = `
    <div>
      <span class="metric-label">${escapeHtml(operations.operatorName)}</span>
      <h3>${escapeHtml(model.headline)}</h3>
      <p>${escapeHtml(model.detail)}</p>
    </div>
    <div class="ops-mode-card ${model.tone}">
      <span class="metric-label">Operations mode</span>
      <strong>${escapeHtml(model.state)}</strong>
      <span class="state ${model.tone}">${escapeHtml(model.state)}</span>
    </div>
  `;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Draft orders</span>
      <strong>${model.draftOrders}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Sent invoices</span>
      <strong>${model.sentOrders}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Invoiced MRR</span>
      <strong>${money.format(model.invoicedMrr)}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Collected MRR</span>
      <strong>${money.format(model.collectedMrr)}</strong>
    </article>
  `;

  const integration = operations.integration || {};
  const sheetLink = safeExternalLink(integration.googleSheetUrl, GOOGLE_SHEET_URLS, "Sheet ledger", "Sheet not set");
  const stripeLink = safeExternalLink(integration.stripeDashboardUrl, STRIPE_DASHBOARD_URLS, "Stripe", "Stripe not set");
  const intakeLink = integration.googleFormUrl
    ? safeExternalLink(integration.googleFormUrl, GOOGLE_FORM_URLS, "Form intake", "Form URL blocked")
    : integration.appsScriptUrl
      ? safeExternalLink(integration.appsScriptUrl, APPS_SCRIPT_URLS, "Apps Script", "Apps Script URL blocked")
      : `<span class="state amber">Intake not set</span>`;

  policy.innerHTML = `
    <span class="metric-label">Operating route</span>
    <h3>${escapeHtml(operations.paymentMode)}</h3>
    <p>Manual payment requests are created outside the static site. The static site never collects payment data. Each row is mirrored to the Sheet ledger and reconciled with the fiscal route.</p>
    <div class="ops-link-grid">
      <a href="TERMOS.md" target="_blank" rel="noreferrer">Termos</a>
      <a href="AVISO_DE_PRIVACIDADE.md" target="_blank" rel="noreferrer">Privacidade</a>
      <a href="SUPPORT.md" target="_blank" rel="noreferrer">Support</a>
      <a href="RUN_LIVE_PILOT.md" target="_blank" rel="noreferrer">Live pilot</a>
      <span>${escapeHtml(operations.supportEmail)}</span>
      ${sheetLink}
      ${stripeLink}
      ${intakeLink}
    </div>
  `;

  if (launchList) {
    launchList.innerHTML = (model.launchChecklist || [])
      .map((item) => {
        const tone = item.done ? "green" : "red";
        const stamp = item.completedAt ? formatLaunchDate(item.completedAt) : "Not yet";
        return `
          <article class="ops-launch-item">
            <div>
              <span class="metric-label">${item.done ? "Cleared" : "Open"}</span>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.detail)}</p>
            </div>
            <span class="state ${tone}">${item.done ? "Done" : "Open"}</span>
            <span class="ops-launch-date">${escapeHtml(stamp)}</span>
            <label class="pilot-switch">
              <input type="checkbox" data-launch-item="${escapeHtml(item.id)}" ${item.done ? "checked" : ""} />
              <span>Done</span>
            </label>
          </article>
        `;
      })
      .join("");
  }

  controlList.innerHTML = model.controls
    .map((control) => {
      const tone = control.done ? "green" : control.critical ? "red" : "amber";
      return `
        <article class="ops-control">
          <div>
            <span class="metric-label">${control.critical ? "Critical" : "Support"}</span>
            <h4>${escapeHtml(control.title)}</h4>
            <p>${escapeHtml(control.detail)}</p>
          </div>
          <span class="state ${tone}">${control.done ? "Clear" : "Open"}</span>
          <label class="pilot-switch">
            <input type="checkbox" data-operation-control="${escapeHtml(control.id)}" ${control.done ? "checked" : ""} />
            <span>Done</span>
          </label>
        </article>
      `;
    })
    .join("");

  if (!model.orders.length) {
    orderList.innerHTML = `
      <article class="ops-order">
        <div>
          <span class="metric-label">Order ledger</span>
          <h4>No orders yet</h4>
          <p>Add a customer order to create the first invoice packet.</p>
        </div>
        <strong>${money.format(0)}</strong>
        <span class="state amber">Empty</span>
        <div class="ops-actions"></div>
      </article>
    `;
  } else {
    orderList.innerHTML = model.orders
      .map((order) => {
        const tone = toneForOperationStatus(order.status);
        const canAdvance = order.status !== "Delivered";
        const blockReason = orderAdvanceBlock(order, model);
        const safeStripeInvoiceUrl = safeExternalUrl(order.stripeInvoiceUrl, STRIPE_INVOICE_URLS);
        const stripeMissing = order.status === "Draft" && !safeStripeInvoiceUrl;
        const safeArtifact = safeHttpsUrl(order.deliveryArtifactUrl || "");
        const stripeLine = safeStripeInvoiceUrl
          ? `<a href="${escapeHtml(safeStripeInvoiceUrl)}" target="_blank" rel="noreferrer">Hosted invoice</a>`
          : stripeMissing
            ? `<span class="state amber">Paste payment URL before send</span>`
            : `<span class="metric-label">No payment URL yet</span>`;
        const dueLine = order.deliveryDue
          ? `Delivery due ${escapeHtml(order.deliveryDue)}`
          : "Delivery date not set";
        const timeline = [];
        if (order.invoiceSentAt) timeline.push(`Sent ${escapeHtml(formatReceiptDate(order.invoiceSentAt))}`);
        if (order.paidAt) timeline.push(`Paid ${escapeHtml(formatReceiptDate(order.paidAt))}`);
        if (order.deliveredAt) timeline.push(`Delivered ${escapeHtml(formatReceiptDate(order.deliveredAt))}`);
        const timelineLine = timeline.length ? `<p class="ops-order-meta">${timeline.join(" / ")}</p>` : "";
        const artifactLine = safeArtifact
          ? `<a class="ops-order-artifact" href="${escapeHtml(safeArtifact)}" target="_blank" rel="noreferrer noopener">Delivery artifact</a>`
          : order.status === "Paid" || order.status === "Delivered"
            ? `<span class="state amber">No https artifact attached</span>`
            : "";
        const acceptanceLine = order.acceptanceNote
          ? `<p class="ops-order-acceptance"><strong>Acceptance:</strong> ${escapeHtml(order.acceptanceNote)}</p>`
          : order.status === "Paid" || order.status === "Delivered"
            ? `<p class="ops-order-acceptance ops-order-acceptance-missing">No acceptance note yet.</p>`
            : "";
        const linkedIncidents = (order.incidentIds || [])
          .map((incidentId) => operationIncidents.find((entry) => entry.id === incidentId))
          .filter(Boolean);
        const incidentLine = linkedIncidents.length
          ? `<p class="ops-order-incidents"><strong>Incidents:</strong> ${linkedIncidents
              .map((entry) => `${escapeHtml(entry.severity)} ${escapeHtml(entry.status)}: ${escapeHtml((entry.summary || "").slice(0, 80))}`)
              .join(" / ")}</p>`
          : "";
        const blockLine = blockReason && canAdvance
          ? `<p class="ops-order-block">${escapeHtml(blockReason)}</p>`
          : "";
        return `
          <article class="ops-order">
            <div>
              <span class="metric-label">${escapeHtml(order.invoiceNumber || "Draft invoice")}</span>
              <h4>${escapeHtml(order.customer)}</h4>
              <p>${escapeHtml(order.serviceTitle)} / ${escapeHtml(order.need || "Need not recorded")}</p>
              <p class="ops-order-meta">${escapeHtml(dueLine)} / ${stripeLine}</p>
              ${timelineLine}
              ${artifactLine ? `<p class="ops-order-meta">${artifactLine}</p>` : ""}
              ${acceptanceLine}
              ${incidentLine}
              ${blockLine}
            </div>
            <strong>${money.format(Number(order.amount || 0))}</strong>
            <span class="state ${tone}">${escapeHtml(order.status)}</span>
            <div class="ops-order-fields">
              <label>
                <span>Hosted payment/invoice URL</span>
                <input type="text" inputmode="url" placeholder="https://invoice.stripe.com/i/..." value="${escapeHtml(order.stripeInvoiceUrl || "")}" data-stripe-url-order="${escapeHtml(order.id)}" />
              </label>
              <label>
                <span>Delivery due</span>
                <input type="date" value="${escapeHtml(order.deliveryDue || "")}" data-delivery-due-order="${escapeHtml(order.id)}" />
              </label>
              <label>
                <span>Delivery artifact URL (https)</span>
                <input type="url" inputmode="url" placeholder="https://..." value="${escapeHtml(order.deliveryArtifactUrl || "")}" data-artifact-url-order="${escapeHtml(order.id)}" />
              </label>
              <label>
                <span>Acceptance note</span>
                <textarea rows="2" placeholder="What the customer accepted; what was delivered." data-acceptance-note-order="${escapeHtml(order.id)}">${escapeHtml(order.acceptanceNote || "")}</textarea>
              </label>
            </div>
            <div class="ops-actions">
              <button type="button" data-copy-operation-packet="${escapeHtml(order.id)}">Packet</button>
              <button type="button" data-copy-ledger-row="${escapeHtml(order.id)}">Copy row</button>
              <button type="button" data-save-stripe-order="${escapeHtml(order.id)}">Save URL</button>
              <button type="button" data-save-delivery-order="${escapeHtml(order.id)}">Save delivery</button>
              <button type="button" data-advance-operation-order="${escapeHtml(order.id)}" ${canAdvance && !blockReason ? "" : "disabled"}>${nextOperationAction(order.status)}</button>
              <button type="button" data-open-incident-form="${escapeHtml(order.id)}">Log incident</button>
              <button type="button" data-remove-operation-order="${escapeHtml(order.id)}">Remove</button>
            </div>
            ${renderOrderTimeline(order)}
            <form class="ops-incident-form" data-incident-form="${escapeHtml(order.id)}" hidden autocomplete="off">
              <p class="evidence-form-kicker">Incident receipt</p>
              <div class="field-row">
                <label class="field">
                  <span>Severity</span>
                  <select name="severity">
                    ${INCIDENT_SEVERITIES.map((sev) => `<option value="${escapeHtml(sev)}" ${sev === "low" ? "selected" : ""}>${escapeHtml(sev)}</option>`).join("")}
                  </select>
                </label>
                <label class="field">
                  <span>Status</span>
                  <select name="status">
                    ${INCIDENT_STATUSES.map((st) => `<option value="${escapeHtml(st)}" ${st === "open" ? "selected" : ""}>${escapeHtml(st)}</option>`).join("")}
                  </select>
                </label>
              </div>
              <label class="field">
                <span>Summary</span>
                <textarea name="summary" rows="2" required placeholder="What went wrong, observed from outside."></textarea>
              </label>
              <label class="field">
                <span>Response</span>
                <textarea name="response" rows="2" required placeholder="What the operator did; what the customer was told."></textarea>
              </label>
              <div class="evidence-form-actions">
                <button class="primary-action" type="submit">Record incident</button>
                <button type="button" data-cancel-incident-form="${escapeHtml(order.id)}">Cancel</button>
                <p class="evidence-form-error" data-incident-error="${escapeHtml(order.id)}" hidden></p>
              </div>
            </form>
          </article>
        `;
      })
      .join("");
  }

  document.querySelectorAll("[data-operation-control]").forEach((input) => {
    input.addEventListener("change", () => toggleOperationControl(input.dataset.operationControl, input.checked));
  });
  document.querySelectorAll("[data-copy-operation-packet]").forEach((button) => {
    button.addEventListener("click", () => copyOperationPacket(button.dataset.copyOperationPacket));
  });
  document.querySelectorAll("[data-copy-ledger-row]").forEach((button) => {
    button.addEventListener("click", () => copyOrderLedgerRow(button.dataset.copyLedgerRow, button));
  });
  document.querySelectorAll("[data-save-stripe-order]").forEach((button) => {
    button.addEventListener("click", () => saveOrderStripeUrl(button.dataset.saveStripeOrder));
  });
  document.querySelectorAll("[data-advance-operation-order]").forEach((button) => {
    button.addEventListener("click", () => advanceOperationOrder(button.dataset.advanceOperationOrder));
  });
  document.querySelectorAll("[data-remove-operation-order]").forEach((button) => {
    button.addEventListener("click", () => removeOperationOrder(button.dataset.removeOperationOrder));
  });
  document.querySelectorAll("[data-launch-item]").forEach((input) => {
    input.addEventListener("change", () => toggleLaunchItem(input.dataset.launchItem, input.checked));
  });
  document.querySelectorAll("[data-stripe-url-order]").forEach((input) => {
    input.addEventListener("change", () => updateOrderField(input.dataset.stripeUrlOrder, "stripeInvoiceUrl", input.value));
  });
  document.querySelectorAll("[data-delivery-due-order]").forEach((input) => {
    input.addEventListener("change", () => updateOrderField(input.dataset.deliveryDueOrder, "deliveryDue", input.value));
  });
  document.querySelectorAll("[data-artifact-url-order]").forEach((input) => {
    input.addEventListener("change", () => updateOrderField(input.dataset.artifactUrlOrder, "deliveryArtifactUrl", input.value));
  });
  document.querySelectorAll("[data-acceptance-note-order]").forEach((textarea) => {
    textarea.addEventListener("change", () => updateOrderField(textarea.dataset.acceptanceNoteOrder, "acceptanceNote", textarea.value));
  });
  document.querySelectorAll("[data-save-delivery-order]").forEach((button) => {
    button.addEventListener("click", () => saveOrderDeliveryFields(button.dataset.saveDeliveryOrder, button));
  });
  document.querySelectorAll("[data-open-incident-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.openIncidentForm;
      const form = document.querySelector(`[data-incident-form="${CSS.escape(orderId)}"]`);
      if (form) {
        form.hidden = false;
        const summary = form.querySelector("[name='summary']");
        if (summary) summary.focus();
      }
    });
  });
  document.querySelectorAll("[data-cancel-incident-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.cancelIncidentForm;
      const form = document.querySelector(`[data-incident-form="${CSS.escape(orderId)}"]`);
      if (form) {
        form.hidden = true;
        form.reset();
      }
    });
  });
  document.querySelectorAll("[data-incident-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitOrderIncident(form);
    });
  });

  renderDailyPilotRun();
}

function renderDailyPilotRun() {
  const container = document.querySelector("#operationsDailyRun");
  const startButton = document.querySelector("#startDailyPilotRun");
  const closeButton = document.querySelector("#closeDailyPilotRun");
  if (!container) {
    return;
  }
  const current = dailyPilotRun.current;
  const history = dailyPilotRun.history || [];
  const activeRules = activeStopRules();
  if (startButton) {
    startButton.disabled = Boolean(current);
  }
  if (closeButton) {
    closeButton.disabled = !current;
  }

  const checksMarkup = current
    ? DAILY_RUN_CHECKS.map((entry) => {
        const done = Boolean(current.checks[entry.id]);
        return `
          <label class="ops-daily-check">
            <input type="checkbox" data-daily-check="${escapeHtml(entry.id)}" ${done ? "checked" : ""} />
            <span>
              <strong>${escapeHtml(entry.title)}</strong>
              <small>${escapeHtml(entry.detail)}</small>
            </span>
          </label>
        `;
      }).join("")
    : "";

  const rulesMarkup = current
    ? DAILY_RUN_STOP_RULES.map((entry) => {
        const active = Boolean(current.stopRules[entry.id]);
        return `
          <label class="ops-daily-rule ${active ? "active" : ""}">
            <input type="checkbox" data-daily-stop-rule="${escapeHtml(entry.id)}" ${active ? "checked" : ""} />
            <span>
              <strong>${escapeHtml(entry.title)}</strong>
              <small>${escapeHtml(entry.detail)}</small>
            </span>
          </label>
        `;
      }).join("")
    : "";

  const touchedOrderIds = current ? collectDailyRunOrderIds() : [];
  const touchedOrders = touchedOrderIds
    .map((orderId) => (operations.orders || []).find((order) => order.id === orderId))
    .filter(Boolean);
  const touchedMarkup = touchedOrders.length
    ? touchedOrders
        .map(
          (order) => `<li>${escapeHtml(order.invoiceNumber || order.id)} / ${escapeHtml(order.customer || "")} / ${escapeHtml(order.status || "")}</li>`
        )
        .join("")
    : "<li>No orders touched since the run started.</li>";

  const currentPanel = current
    ? `
      <article class="ops-daily-current ${activeRules.length ? "paused" : ""}">
        <div class="ops-daily-header">
          <span class="metric-label">Run ${escapeHtml(current.runDate)}</span>
          <h4>${activeRules.length ? "Paused" : "Active"}</h4>
          <p>Started ${escapeHtml(formatReceiptDate(current.startedAt))}</p>
          ${activeRules.length ? `<p class="ops-daily-paused-line">${escapeHtml(dailyRunPausedReason())}</p>` : ""}
        </div>
        <div class="ops-daily-section">
          <span class="metric-label">Checklist</span>
          <div class="ops-daily-checks">${checksMarkup}</div>
        </div>
        <div class="ops-daily-section">
          <span class="metric-label">Stop rules</span>
          <p class="ops-daily-rule-hint">Any active rule pauses new orders from advancing to Sent.</p>
          <div class="ops-daily-rules">${rulesMarkup}</div>
        </div>
        <div class="ops-daily-section">
          <span class="metric-label">Orders touched this run</span>
          <ul class="ops-daily-touched">${touchedMarkup}</ul>
        </div>
        <div class="ops-daily-section">
          <label class="ops-daily-incidents-label">
            <span class="metric-label">Incident ids (comma or whitespace separated)</span>
            <textarea id="operationsDailyRunIncidents" rows="2" placeholder="incident-... incident-...">${escapeHtml((current.incidentIds || []).join(", "))}</textarea>
          </label>
        </div>
      </article>
    `
    : `
      <article class="ops-daily-empty">
        <span class="metric-label">No run in progress</span>
        <h4>Start a run for today.</h4>
        <p>The run captures checks, stop rules, orders moved, linked incidents, and the receipt-chain root at close. While a run is open, any active stop rule pauses Draft to Sent transitions.</p>
      </article>
    `;

  const historyMarkup = history.length
    ? history
        .map((entry) => {
          const doneCount = Object.values(entry.checks || {}).filter(Boolean).length;
          const stopCount = Object.values(entry.stopRules || {}).filter(Boolean).length;
          const root = entry.receiptRoot
            ? `<code>${escapeHtml(entry.receiptRoot.slice(0, 12))}</code>`
            : "<span>No root captured</span>";
          return `
            <article class="ops-daily-history-card">
              <span class="metric-label">${escapeHtml(entry.runDate)}</span>
              <h4>${stopCount ? "Closed with stop rules" : "Closed clean"}</h4>
              <p>${doneCount}/${DAILY_RUN_CHECKS.length} checks. ${stopCount} stop rule${stopCount === 1 ? "" : "s"}. ${entry.orderIds.length} order${entry.orderIds.length === 1 ? "" : "s"} touched. ${entry.incidentIds.length} incident id${entry.incidentIds.length === 1 ? "" : "s"} attached.</p>
              <p>Closed ${escapeHtml(formatReceiptDate(entry.closedAt))} / Root ${root}</p>
              <div class="ops-actions ops-daily-history-actions">
                <button type="button" data-copy-daily-run="${escapeHtml(entry.id)}">Copy closeout</button>
              </div>
            </article>
          `;
        })
        .join("")
    : "";

  container.innerHTML = `
    ${currentPanel}
    ${historyMarkup ? `<div class="ops-daily-history">${historyMarkup}</div>` : ""}
  `;

  document.querySelectorAll("[data-daily-check]").forEach((input) => {
    input.addEventListener("change", () => toggleDailyRunCheck(input.dataset.dailyCheck, input.checked));
  });
  document.querySelectorAll("[data-daily-stop-rule]").forEach((input) => {
    input.addEventListener("change", () => toggleDailyRunStopRule(input.dataset.dailyStopRule, input.checked));
  });
  const incidentsField = document.querySelector("#operationsDailyRunIncidents");
  if (incidentsField) {
    incidentsField.addEventListener("change", () => updateDailyRunIncidentIds(incidentsField.value));
  }
  document.querySelectorAll("[data-copy-daily-run]").forEach((button) => {
    button.addEventListener("click", () => copyDailyRunSummary(button.dataset.copyDailyRun, button));
  });
}

function formatLaunchDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

function toggleLaunchItem(itemId, done) {
  const now = new Date().toISOString();
  operations.launchChecklist = (operations.launchChecklist || []).map((item) => {
    if (item.id !== itemId) {
      return item;
    }
    return {
      ...item,
      done: Boolean(done),
      completedAt: done ? (item.completedAt || now) : ""
    };
  });
  saveOperations();
  renderOperations();
  renderOrderDesk();
  renderLogs();
}

function updateOrderField(orderId, field, value) {
  let nextValue = value;
  if (field === "stripeInvoiceUrl") {
    nextValue = cleanConfiguredUrl(value, STRIPE_INVOICE_URLS);
  } else if (field === "deliveryArtifactUrl") {
    nextValue = safeHttpsUrl(value);
  } else if (field === "acceptanceNote") {
    nextValue = String(value || "");
  }
  operations.orders = operations.orders.map((order) =>
    order.id === orderId
      ? { ...order, [field]: nextValue, updatedAt: new Date().toISOString() }
      : order
  );
  saveOperations();
  renderOperations();
  renderLogs();
}

async function saveOrderDeliveryFields(orderId, button) {
  const order = (operations.orders || []).find((entry) => entry.id === orderId);
  if (!order || !button) {
    return;
  }
  const artifactInput = document.querySelector(`[data-artifact-url-order="${CSS.escape(orderId)}"]`);
  const noteInput = document.querySelector(`[data-acceptance-note-order="${CSS.escape(orderId)}"]`);
  const previous = button.textContent;
  if (artifactInput) {
    updateOrderField(orderId, "deliveryArtifactUrl", artifactInput.value);
  }
  if (noteInput) {
    updateOrderField(orderId, "acceptanceNote", noteInput.value);
  }
  button.textContent = "Saved";
  setTimeout(() => {
    button.textContent = previous;
  }, 1500);
}

function submitOrderIncident(form) {
  const orderId = form.dataset.incidentForm;
  const order = (operations.orders || []).find((entry) => entry.id === orderId);
  const errorBox = document.querySelector(`[data-incident-error="${CSS.escape(orderId)}"]`);
  const showError = (message) => {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.hidden = false;
  };
  const clearError = () => {
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.hidden = true;
    }
  };
  if (!order) {
    showError("Order no longer exists.");
    return;
  }
  const formData = new FormData(form);
  const severity = String(formData.get("severity") || "low");
  const status = String(formData.get("status") || "open");
  const summary = String(formData.get("summary") || "").trim();
  const response = String(formData.get("response") || "").trim();

  if (!INCIDENT_SEVERITIES.includes(severity)) {
    showError("Severity must be one of " + INCIDENT_SEVERITIES.join(", ") + ".");
    return;
  }
  if (!INCIDENT_STATUSES.includes(status)) {
    showError("Status must be one of " + INCIDENT_STATUSES.join(", ") + ".");
    return;
  }
  if (!summary) {
    showError("Summary is required.");
    return;
  }
  if (!response) {
    showError("Response is required.");
    return;
  }
  const sensitive = findSensitiveData(`${summary}\n${response}`);
  if (sensitive.length) {
    showError(`Incident text contains ${sensitive.join(", ")}. Strip and retry.`);
    return;
  }

  clearError();
  const now = new Date().toISOString();
  const incident = normalizeOperationIncident({
    id: `incident-${slugify(order.invoiceNumber || order.id)}-${Date.now().toString(36)}`,
    orderId: order.id,
    invoiceNumber: order.invoiceNumber || "",
    severity,
    status,
    summary,
    response,
    createdAt: now,
    updatedAt: now
  });
  operationIncidents.unshift(incident);
  saveOperationIncidents();
  operations.orders = operations.orders.map((entry) =>
    entry.id === order.id
      ? {
          ...entry,
          incidentIds: Array.from(new Set([...(entry.incidentIds || []), incident.id])),
          updatedAt: now
        }
      : entry
  );
  saveOperations();
  form.reset();
  form.hidden = true;
  renderOperations();
  renderLogs();
}

function syncOperationsConfigForm() {
  const form = document.querySelector("#operationsConfigForm");
  if (!form) {
    return;
  }
  const integration = operations.integration || {};
  const map = {
    supportEmail: operations.supportEmail || "",
    invoicePrefix: operations.invoicePrefix || "",
    googleSheetUrl: integration.googleSheetUrl || "",
    googleFormUrl: integration.googleFormUrl || "",
    appsScriptUrl: integration.appsScriptUrl || "",
    stripeDashboardUrl: integration.stripeDashboardUrl || "",
    termsReviewedAt: integration.termsReviewedAt || "",
    privacyReviewedAt: integration.privacyReviewedAt || ""
  };
  Object.entries(map).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (input && input.value !== value) {
      input.value = value;
    }
  });
}

function saveOperationsConfig(form) {
  const formData = new FormData(form);
  const supportEmail = String(formData.get("supportEmail") || "").trim();
  const invoicePrefix = String(formData.get("invoicePrefix") || operations.invoicePrefix || "SWS").trim();
  operations.supportEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail) ? supportEmail : operations.supportEmail;
  operations.invoicePrefix = invoicePrefix || operations.invoicePrefix;
  operations.integration = {
    ...(operations.integration || {}),
    googleSheetUrl: cleanConfiguredUrl(formData.get("googleSheetUrl"), GOOGLE_SHEET_URLS),
    googleFormUrl: cleanConfiguredUrl(formData.get("googleFormUrl"), GOOGLE_FORM_URLS),
    appsScriptUrl: cleanConfiguredUrl(formData.get("appsScriptUrl"), APPS_SCRIPT_URLS),
    stripeDashboardUrl: cleanConfiguredUrl(formData.get("stripeDashboardUrl"), STRIPE_DASHBOARD_URLS),
    termsReviewedAt: String(formData.get("termsReviewedAt") || "").trim(),
    privacyReviewedAt: String(formData.get("privacyReviewedAt") || "").trim()
  };
  saveOperations();
  renderOperations();
  renderOrderDesk();
  renderLogs();
}

function renderOrderDesk() {
  const verdict = document.querySelector("#orderDeskVerdict");
  const offer = document.querySelector("#orderDeskOffer");
  const serviceSelect = document.querySelector("#requestService");
  const handoff = document.querySelector("#orderDeskHandoff");
  if (!verdict || !offer || !serviceSelect) {
    return;
  }

  const model = buildOperationsModel();
  const services = operationServices();
  const selectedService = serviceSelect.value || services[0]?.id || "";
  serviceSelect.innerHTML = services
    .map(
      (service) => `
        <option value="${escapeHtml(service.id)}" data-price="${Number(service.price || 0)}">
          ${escapeHtml(service.title)} / ${money.format(Number(service.price || 0))}
        </option>
      `
    )
    .join("");
  if (services.some((service) => service.id === selectedService)) {
    serviceSelect.value = selectedService;
  }

  const integration = operations.integration || {};
  const intakeReady = Boolean(integration.googleFormUrl || integration.appsScriptUrl);
  const canRequest = model.openCriticalControls.length === 0;
  const tone = canRequest && intakeReady ? "green" : "amber";
  const state = canRequest
    ? intakeReady
      ? "Invoice requests open"
      : "Local-only requests"
    : "Request queue only";
  const detail = canRequest
    ? intakeReady
      ? "Requests are routed by copyable packet, email handoff, and the configured Google Form. Payment never moves through this site."
      : "Operator can draft requests locally. Configure a Google Form or Apps Script in Operations to route requests off-site."
    : "You can draft a request, but the operator must clear legal, payment, bookkeeping, and support controls before accepting money.";

  verdict.innerHTML = `
    <div>
      <span class="metric-label">Manual order desk</span>
      <h3>${canRequest ? "Request a scoped proof packet." : "Draft the request before money moves."}</h3>
      <p>${escapeHtml(detail)}</p>
    </div>
    <div class="order-mode-card ${tone}">
      <span class="metric-label">Desk mode</span>
      <strong>${escapeHtml(state)}</strong>
      <span class="state ${tone}">${escapeHtml(state)}</span>
    </div>
  `;

  const firstService = services.find((service) => service.id === serviceSelect.value) || services[0];
  offer.innerHTML = `
    <span class="metric-label">${escapeHtml(operations.operatorName)}</span>
    <h3>${escapeHtml(firstService?.title || "Manual proof service")}</h3>
    <p>${escapeHtml(firstService?.detail || "A scoped compliance proof packet service for the first operating loop.")}</p>
    <p>Use this desk for invoice requests only. Do not submit protected health information, payment credentials, passwords, private keys, or regulated source documents.</p>
    <div class="ops-link-grid">
      <a href="TERMOS.md" target="_blank" rel="noreferrer">Termos</a>
      <a href="AVISO_DE_PRIVACIDADE.md" target="_blank" rel="noreferrer">Privacidade</a>
      <a href="SUPPORT.md" target="_blank" rel="noreferrer">Support</a>
      <span>${escapeHtml(operations.supportEmail)}</span>
    </div>
  `;

  if (handoff) {
    const sheetRow = safeExternalLink(integration.googleSheetUrl, GOOGLE_SHEET_URLS, "Open Sheet ledger", "Sheet ledger not configured");
    const formRow = safeExternalLink(integration.googleFormUrl, GOOGLE_FORM_URLS, "Open Google Form intake", "Google Form not configured");
    const appsRow = integration.appsScriptUrl
      ? safeExternalLink(integration.appsScriptUrl, APPS_SCRIPT_URLS, "Apps Script endpoint", "Apps Script URL blocked")
      : `<span class="metric-label">Apps Script endpoint not set (optional)</span>`;
    handoff.innerHTML = `
      <article class="order-handoff-card">
        <div>
          <span class="metric-label">Where the request goes</span>
          <p>Submitting on this page records the request in the private local ledger, prepares an email packet, and opens the configured Google Form for manual confirmation. Apps Script remains an internal sandbox route. The static site does not collect payment data.</p>
        </div>
        <div class="ops-link-grid">
          ${sheetRow}
          ${formRow}
          ${appsRow}
        </div>
      </article>
    `;
  }
}

function toneForOperationStatus(status) {
  if (status === "Delivered" || status === "Paid") {
    return "green";
  }
  if (status === "Sent") {
    return "amber";
  }
  return "";
}

function nextOperationAction(status) {
  if (status === "Draft") {
    return "Send";
  }
  if (status === "Sent") {
    return "Paid";
  }
  if (status === "Paid") {
    return "Deliver";
  }
  return "Done";
}

function buildOrderTimeline(order) {
  const events = [];
  if (order.createdAt) {
    const evidence = [];
    if (order.invoiceNumber) evidence.push({ label: "Invoice", value: order.invoiceNumber });
    if (order.serviceTitle) evidence.push({ label: "Service", value: order.serviceTitle });
    if (order.amount) evidence.push({ label: "Amount", value: money.format(Number(order.amount)) });
    if (order.contact) evidence.push({ label: "Contact", value: order.contact });
    events.push({
      at: order.createdAt,
      actor: order.source || "Operations console",
      transition: "Created → Draft",
      tone: "amber",
      evidence
    });
  }
  if (order.invoiceSentAt) {
    const stripeUrl = safeExternalUrl(order.stripeInvoiceUrl, STRIPE_INVOICE_URLS);
    const evidence = [];
    if (stripeUrl) evidence.push({ label: "Stripe URL", value: stripeUrl, href: stripeUrl });
    if (order.deliveryDue) evidence.push({ label: "Delivery due", value: order.deliveryDue });
    events.push({
      at: order.invoiceSentAt,
      actor: "Operations console",
      transition: "Draft → Sent",
      tone: "amber",
      evidence
    });
  }
  if (order.paidAt) {
    const stripeUrl = safeExternalUrl(order.stripeInvoiceUrl, STRIPE_INVOICE_URLS);
    const evidence = [];
    if (stripeUrl) evidence.push({ label: "Stripe URL", value: stripeUrl, href: stripeUrl });
    events.push({
      at: order.paidAt,
      actor: "Operations console",
      transition: "Sent → Paid",
      tone: "green",
      evidence
    });
  }
  if (order.deliveredAt) {
    const artifact = safeHttpsUrl(order.deliveryArtifactUrl || "");
    const evidence = [];
    if (artifact) evidence.push({ label: "Artifact", value: artifact, href: artifact });
    if (order.acceptanceNote) evidence.push({ label: "Acceptance", value: order.acceptanceNote });
    events.push({
      at: order.deliveredAt,
      actor: "Operations console",
      transition: "Paid → Delivered",
      tone: "green",
      evidence
    });
  }
  if (order.blockedAt && order.blockReason) {
    events.push({
      at: order.blockedAt,
      actor: "Operations console",
      transition: `Blocked at ${order.status}`,
      tone: "red",
      evidence: [{ label: "Reason", value: order.blockReason }]
    });
  }
  (order.incidentIds || []).forEach((incidentId) => {
    const incident = operationIncidents.find((entry) => entry.id === incidentId);
    if (!incident) return;
    const baseEvidence = [];
    if (incident.summary) baseEvidence.push({ label: "Summary", value: incident.summary });
    if (incident.response) baseEvidence.push({ label: "Response", value: incident.response });
    const tone = incident.severity === "high" ? "red" : incident.severity === "medium" ? "amber" : "";
    events.push({
      at: incident.createdAt,
      actor: "Operations console",
      transition: `Incident logged (${incident.severity} · ${incident.status})`,
      tone,
      evidence: baseEvidence
    });
    if (incident.updatedAt && incident.updatedAt !== incident.createdAt) {
      events.push({
        at: incident.updatedAt,
        actor: "Operations console",
        transition: `Incident → ${incident.severity} · ${incident.status}`,
        tone,
        evidence: baseEvidence
      });
    }
  });
  return events.sort((a, b) => String(a.at || "").localeCompare(String(b.at || "")));
}

function renderOrderTimeline(order) {
  const events = buildOrderTimeline(order);
  const summaryLabel = events.length
    ? `${events.length} event${events.length === 1 ? "" : "s"}`
    : "No events yet";
  if (!events.length) {
    return `
      <details class="ops-order-timeline">
        <summary>
          <span class="metric-label">Receipt chain timeline</span>
          <span>${escapeHtml(summaryLabel)}</span>
        </summary>
        <p class="ops-order-timeline-empty">No state transitions recorded for this order yet.</p>
      </details>
    `;
  }
  const items = events
    .map((event) => {
      const stamp = event.at ? formatReceiptDate(event.at) : "baseline";
      const evidenceMarkup = event.evidence.length
        ? `<ul class="ops-order-timeline-evidence">${event.evidence
            .map((entry) => {
              const label = `<span class="ops-order-timeline-evidence-label">${escapeHtml(entry.label)}</span>`;
              if (entry.href) {
                return `<li>${label}<a href="${escapeHtml(entry.href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(entry.value)}</a></li>`;
              }
              return `<li>${label}<span>${escapeHtml(entry.value)}</span></li>`;
            })
            .join("")}</ul>`
        : "";
      return `
        <li class="ops-order-timeline-event">
          <div class="ops-order-timeline-head">
            <time>${escapeHtml(stamp)}</time>
            <span class="state ${escapeHtml(event.tone)}">${escapeHtml(event.transition)}</span>
            <span class="ops-order-timeline-actor">${escapeHtml(event.actor)}</span>
          </div>
          ${evidenceMarkup}
        </li>
      `;
    })
    .join("");
  return `
    <details class="ops-order-timeline">
      <summary>
        <span class="metric-label">Receipt chain timeline</span>
        <span>${escapeHtml(summaryLabel)}</span>
      </summary>
      <ol class="ops-order-timeline-list">${items}</ol>
    </details>
  `;
}

function toggleOperationControl(controlId, done) {
  operations.controls = operations.controls.map((control) =>
    control.id === controlId ? { ...control, done: Boolean(done), updatedAt: new Date().toISOString() } : control
  );
  saveOperations();
  renderOperations();
  renderOrderDesk();
  renderLogs();
}

function createOperationOrder({ customer, contact, serviceId, amount, need, source, deliveryDue, notes }) {
  if (!customer) {
    return null;
  }
  const service = operationServices().find((item) => item.id === serviceId) || operationServices()[0];
  const invoiceNumber = `${operations.invoicePrefix}-${operations.nextInvoiceNumber}`;
  const now = new Date().toISOString();
  const order = {
    id: `order-${slugify(customer)}-${Date.now()}`,
    invoiceNumber,
    customer,
    contact: contact || "",
    serviceId: service?.id || "custom",
    serviceTitle: service?.title || "Custom service",
    need: need || "Need not recorded",
    amount: Number(amount || service?.price || 0),
    status: "Draft",
    source: source || "Operations console",
    stripeInvoiceUrl: "",
    deliveryDue: deliveryDue || "",
    notes: notes || "",
    createdAt: now,
    updatedAt: now
  };
  operations.orders.unshift(order);
  operations.nextInvoiceNumber = Number(operations.nextInvoiceNumber || 1001) + 1;
  saveOperations();
  return order;
}

function addOperationOrder(form) {
  const formData = new FormData(form);
  const customer = String(formData.get("orderCustomer") || "").trim();
  const order = createOperationOrder({
    customer,
    contact: String(formData.get("orderContact") || "").trim(),
    serviceId: String(formData.get("orderService") || "").trim(),
    amount: Number(formData.get("orderAmount") || 0),
    need: String(formData.get("orderNeed") || "Need not recorded").trim(),
    deliveryDue: String(formData.get("orderDeliveryDue") || "").trim(),
    source: "Operations console"
  });
  if (!order) {
    return;
  }
  form.reset();
  renderOperations();
  renderOrderDesk();
  renderLogs();
}

function showSalesLeadError(message) {
  const error = document.querySelector("#salesLeadError");
  if (!error) {
    return;
  }
  error.textContent = message || "";
  error.hidden = !message;
}

function addSalesLead(form) {
  const formData = new FormData(form);
  const customer = String(formData.get("leadCustomer") || "").trim();
  const contact = String(formData.get("leadContact") || "").trim();
  const serviceId = String(formData.get("leadService") || "").trim();
  const amount = Number(formData.get("leadAmount") || 0);
  const source = String(formData.get("leadSource") || "Manual").trim();
  const sourceCategoryRaw = String(formData.get("leadSourceCategory") || "").trim().toLowerCase();
  const sourceCategory = ACQUISITION_LEAD_SOURCES.includes(sourceCategoryRaw) ? sourceCategoryRaw : "";
  const need = String(formData.get("leadNeed") || "").trim();
  const qualificationNote = String(formData.get("leadQualificationNote") || "").trim();
  const sensitive = findSensitiveData([customer, contact, need, qualificationNote].join("\n"));
  if (!customer) {
    showSalesLeadError("Customer is required.");
    return;
  }
  if (contact && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) {
    showSalesLeadError("Contact must be a valid email when set.");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    showSalesLeadError("Monthly amount must be a positive number.");
    return;
  }
  if (sensitive.length) {
    showSalesLeadError(`Lead text contains ${sensitive.join(", ")}. Strip and retry.`);
    return;
  }
  const now = new Date().toISOString();
  const lead = normalizeSalesLead({
    id: `sales-lead-${slugify(customer)}-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    customer,
    contact,
    serviceId,
    amount,
    source,
    sourceCategory,
    need: need || "Need not recorded",
    stage: qualificationNote ? "qualified" : "prospect",
    qualificationNote
  });
  if (!lead) {
    showSalesLeadError("Lead could not be created.");
    return;
  }
  salesLeads.unshift(lead);
  saveSalesLeads();
  showSalesLeadError("");
  form.reset();
  renderSalesPipeline();
  renderProfitReadiness();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function advanceSalesLead(leadId) {
  const now = new Date().toISOString();
  salesLeads = salesLeads.map((lead) => {
    if (lead.id !== leadId) {
      return lead;
    }
    return {
      ...lead,
      stage: nextLeadStage(lead.stage),
      updatedAt: now
    };
  });
  saveSalesLeads();
  renderSalesPipeline();
  renderProfitReadiness();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function rejectSalesLead(leadId) {
  const now = new Date().toISOString();
  salesLeads = salesLeads.map((lead) =>
    lead.id === leadId
      ? {
          ...lead,
          stage: "rejected",
          rejectionReason: lead.rejectionReason || "Rejected before invoice request.",
          updatedAt: now
        }
      : lead
  );
  saveSalesLeads();
  renderSalesPipeline();
  renderProfitReadiness();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function removeSalesLead(leadId) {
  salesLeads = salesLeads.filter((lead) => lead.id !== leadId);
  saveSalesLeads();
  renderSalesPipeline();
  renderProfitReadiness();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function convertSalesLeadToOrder(leadId) {
  const lead = salesLeads.find((entry) => entry.id === leadId);
  if (!lead || lead.orderId || !["qualified", "invoice_ready"].includes(lead.stage)) {
    return;
  }
  const sensitive = leadSensitiveFindings(lead);
  if (sensitive.length) {
    showSalesLeadError(`Lead text contains ${sensitive.join(", ")}. Strip and retry.`);
    return;
  }
  const order = createOperationOrder({
    customer: lead.customer,
    contact: lead.contact,
    serviceId: lead.serviceId,
    amount: lead.amount,
    need: lead.need,
    source: `Sales pipeline / ${lead.source || "Manual"}`,
    notes: lead.qualificationNote ? `Qualified lead ${lead.id}: ${lead.qualificationNote}` : `Qualified lead ${lead.id}`
  });
  if (!order) {
    return;
  }
  const now = new Date().toISOString();
  salesLeads = salesLeads.map((entry) =>
    entry.id === lead.id
      ? {
          ...entry,
          stage: "invoice_ready",
          orderId: order.id,
          updatedAt: now
        }
      : entry
  );
  saveSalesLeads();
  showSalesLeadError("");
  renderSalesPipeline();
  renderOperations();
  renderOrderDesk();
  renderCustomerAcquisition();
  renderGrowthReview();
  renderReceiptChain();
  renderLogs();
}

function orderAdvanceBlock(order, model) {
  const pausedReason = model.pausedReason || dailyRunPausedReason();
  if (order.status === "Draft" && pausedReason) {
    return pausedReason;
  }
  if (order.status === "Draft" && !safeExternalUrl(order.stripeInvoiceUrl, STRIPE_INVOICE_URLS)) {
    return "Paste the reviewed hosted payment/invoice URL before marking Sent.";
  }
  if (order.status === "Sent" && model.openCriticalControls.length > 0) {
    return `Close ${model.openCriticalControls.length} critical control${model.openCriticalControls.length === 1 ? "" : "s"} before marking Paid.`;
  }
  if (order.status === "Paid") {
    if (!safeHttpsUrl(order.deliveryArtifactUrl || "")) {
      return "Attach an https:// delivery artifact URL before marking Delivered.";
    }
    if (!String(order.acceptanceNote || "").trim()) {
      return "Record an acceptance note before marking Delivered.";
    }
    const sensitive = findSensitiveData(String(order.acceptanceNote || ""));
    if (sensitive.length) {
      return `Acceptance note contains ${sensitive.join(", ")}; remove and resubmit.`;
    }
  }
  return "";
}

function advanceOperationOrder(orderId) {
  const model = buildOperationsModel();
  const now = new Date().toISOString();
  operations.orders = operations.orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }
    const blockReason = orderAdvanceBlock(order, model);
    if (blockReason) {
      return {
        ...order,
        blockedAt: now,
        blockReason,
        updatedAt: now
      };
    }
    const currentIndex = operationStages.indexOf(order.status);
    const nextStatus = operationStages[Math.min(currentIndex + 1, operationStages.length - 1)];
    const next = {
      ...order,
      status: nextStatus,
      blockedAt: "",
      blockReason: "",
      updatedAt: now
    };
    if (order.status === "Draft" && nextStatus === "Sent") {
      next.invoiceSentAt = now;
    } else if (order.status === "Sent" && nextStatus === "Paid") {
      next.paidAt = now;
    } else if (order.status === "Paid" && nextStatus === "Delivered") {
      next.deliveredAt = now;
    }
    return next;
  });
  saveOperations();
  syncSalesLeadsFromOrders();
  renderOperations();
  renderOrderDesk();
  renderLogs();
}

function parseLedgerTsv(text) {
  const normalized = String(text || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n").map((line) => line.replace(/\s+$/, "")).filter((line) => line.length > 0);
  if (!lines.length) {
    return { headers: LEDGER_HEADERS.slice(), rows: [], skippedHeader: false };
  }

  let cursor = 0;
  const firstCells = lines[0].split("\t").map((cell) => cell.trim().toLowerCase());
  const headerMatches =
    firstCells.length === LEDGER_HEADERS.length && LEDGER_HEADERS.every((header, index) => firstCells[index] === header);
  if (headerMatches) {
    cursor = 1;
  }

  const rows = [];
  for (let lineIndex = cursor; lineIndex < lines.length; lineIndex += 1) {
    const cells = lines[lineIndex].split("\t");
    const columnCount = cells.length;
    if (cells.length < LEDGER_HEADERS.length) {
      while (cells.length < LEDGER_HEADERS.length) {
        cells.push("");
      }
    }
    if (cells.length > LEDGER_HEADERS.length) {
      cells.length = LEDGER_HEADERS.length;
    }
    const row = {};
    LEDGER_HEADERS.forEach((header, index) => {
      row[header] = String(cells[index] || "").trim();
    });
    row.__columnCount = columnCount;
    rows.push({ lineNumber: lineIndex + 1, raw: row });
  }
  return { headers: LEDGER_HEADERS.slice(), rows, skippedHeader: cursor === 1 };
}

function validateLedgerRow(raw) {
  const errors = [];
  const invoiceId = String(raw.invoice_id || "").trim();
  const customer = String(raw.customer || "").trim();
  const contact = String(raw.contact || "").trim();
  const service = String(raw.service || "").trim();
  const amountRaw = String(raw.amount || "").trim();
  const status = String(raw.status || "").trim();
  const stripeRaw = String(raw.stripe_invoice_url || "").trim();
  const deliveryDue = String(raw.delivery_due || "").trim();
  const notes = String(raw.notes || "").trim();
  const source = String(raw.source || "").trim();
  const createdAt = String(raw.created_at || "").trim();
  const columnCount = Number(raw.__columnCount || 0);

  if (columnCount > LEDGER_HEADERS.length) {
    errors.push(`row has ${columnCount} columns; expected ${LEDGER_HEADERS.length}. Remove extra Sheet columns before import.`);
  }

  if (!invoiceId) {
    errors.push("invoice_id is required as the upsert key.");
  }
  if (!customer) {
    errors.push("customer is required.");
  }
  const amountNumber = Number(amountRaw.replace(/[$,\s]/g, ""));
  if (!amountRaw) {
    errors.push("amount is required.");
  } else if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    errors.push("amount must be a finite, positive number.");
  }
  if (!status) {
    errors.push("status is required.");
  } else if (!LEDGER_STATUSES.includes(status)) {
    errors.push(`status must be one of ${LEDGER_STATUSES.join(", ")}.`);
  }
  if (contact && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) {
    errors.push("contact must be a valid email when set.");
  }
  let stripeUrl = "";
  if (stripeRaw) {
    stripeUrl = safeExternalUrl(stripeRaw, STRIPE_INVOICE_URLS);
    if (!stripeUrl) {
      errors.push("stripe_invoice_url must be an https://invoice.stripe.com/ URL.");
    }
  }
  if (deliveryDue && !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDue)) {
    errors.push("delivery_due must be blank or YYYY-MM-DD.");
  }
  if (createdAt) {
    const parsed = new Date(createdAt);
    if (Number.isNaN(parsed.valueOf())) {
      errors.push("created_at must be blank or an ISO date.");
    }
  }
  const joined = [customer, contact, service, notes, source, raw.invoice_id || ""].join("\n");
  const sensitive = findSensitiveData(joined);
  if (sensitive.length) {
    errors.push(`row contains ${sensitive.join(", ")}.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: {
      invoiceId,
      customer,
      contact,
      service,
      amount: amountNumber,
      status,
      stripeInvoiceUrl: stripeUrl,
      deliveryDue,
      notes,
      source,
      createdAt
    }
  };
}

function previewLedgerImport(text) {
  const parsed = parseLedgerTsv(text);
  const summary = {
    totalRows: parsed.rows.length,
    skippedHeader: parsed.skippedHeader,
    willCreate: 0,
    willUpdate: 0,
    rejected: [],
    valid: []
  };
  if (!parsed.rows.length) {
    return summary;
  }
  const seenInvoiceIds = new Set();
  parsed.rows.forEach((entry) => {
    const result = validateLedgerRow(entry.raw);
    if (!result.ok) {
      summary.rejected.push({ lineNumber: entry.lineNumber, errors: result.errors });
      return;
    }
    if (seenInvoiceIds.has(result.normalized.invoiceId)) {
      summary.rejected.push({
        lineNumber: entry.lineNumber,
        errors: [`invoice_id ${result.normalized.invoiceId} appears more than once in the paste; resolve in the Sheet first.`]
      });
      return;
    }
    seenInvoiceIds.add(result.normalized.invoiceId);
    const existing = (operations.orders || []).find((order) => order.invoiceNumber === result.normalized.invoiceId);
    if (existing) {
      summary.willUpdate += 1;
    } else {
      summary.willCreate += 1;
    }
    summary.valid.push({ lineNumber: entry.lineNumber, normalized: result.normalized });
  });
  return summary;
}

function importLedger(text) {
  const preview = previewLedgerImport(text);
  if (!preview.valid.length) {
    return preview;
  }
  const now = new Date().toISOString();
  const services = operationServices();
  const orders = operations.orders || [];
  preview.valid.forEach((entry) => {
    const incoming = entry.normalized;
    const existingIndex = orders.findIndex((order) => order.invoiceNumber === incoming.invoiceId);
    const matchedService = services.find((service) => service.title === incoming.service || service.id === incoming.service);
    if (existingIndex >= 0) {
      const existing = orders[existingIndex];
      orders[existingIndex] = {
        ...existing,
        customer: incoming.customer || existing.customer,
        contact: incoming.contact || existing.contact,
        serviceId: matchedService?.id || existing.serviceId,
        serviceTitle: incoming.service || existing.serviceTitle,
        amount: Number.isFinite(incoming.amount) && incoming.amount > 0 ? incoming.amount : existing.amount,
        status: incoming.status || existing.status,
        stripeInvoiceUrl: incoming.stripeInvoiceUrl || existing.stripeInvoiceUrl,
        deliveryDue: incoming.deliveryDue || existing.deliveryDue,
        notes: incoming.notes || existing.notes,
        source: incoming.source || existing.source,
        ledgerSyncedAt: now,
        updatedAt: now
      };
    } else {
      orders.unshift({
        id: `order-ledger-${slugify(incoming.invoiceId)}-${Date.now()}`,
        invoiceNumber: incoming.invoiceId,
        customer: incoming.customer,
        contact: incoming.contact,
        serviceId: matchedService?.id || "imported",
        serviceTitle: incoming.service || "Sheet import",
        need: "Imported from Sheet ledger.",
        amount: Number.isFinite(incoming.amount) ? incoming.amount : 0,
        status: incoming.status,
        source: incoming.source || "Sheet ledger",
        stripeInvoiceUrl: incoming.stripeInvoiceUrl,
        deliveryDue: incoming.deliveryDue,
        notes: incoming.notes,
        createdAt: incoming.createdAt || now,
        updatedAt: now,
        ledgerSyncedAt: now
      });
    }
  });
  operations.orders = orders;
  saveOperations();
  return preview;
}

function orderToLedgerCells(order) {
  return [
    order.createdAt || "",
    order.source || "Operations console",
    order.invoiceNumber || "",
    order.customer || "",
    order.contact || "",
    order.serviceTitle || "",
    String(Number(order.amount || 0)),
    order.status || "Draft",
    order.stripeInvoiceUrl || "",
    order.deliveryDue || "",
    (order.notes || "").replace(/[\t\r\n]+/g, " ")
  ];
}

function orderToLedgerRow(order) {
  return orderToLedgerCells(order).join("\t");
}

function allOrdersLedgerTsv() {
  const header = LEDGER_HEADERS.join("\t");
  const rows = (operations.orders || []).map((order) => orderToLedgerRow(order));
  return [header, ...rows].join("\n");
}

function removeOperationOrder(orderId) {
  operations.orders = operations.orders.filter((order) => order.id !== orderId);
  saveOperations();
  renderOperations();
  renderOrderDesk();
  renderLogs();
}

function operationPacket(order) {
  const integration = operations.integration || {};
  return [
    `Invoice: ${order.invoiceNumber || "Draft"}`,
    `Operator: ${operations.operatorName}`,
    `Customer: ${order.customer}`,
    `Contact: ${order.contact || "Not recorded"}`,
    `Service: ${order.serviceTitle}`,
    `Monthly amount: ${money.format(Number(order.amount || 0))}`,
    `Status: ${order.status}`,
    `Source: ${order.source || "Operations console"}`,
    `Payment route: ${operations.paymentMode}`,
    `Hosted payment/invoice URL: ${order.stripeInvoiceUrl || "Not yet created"}`,
    `Delivery due: ${order.deliveryDue || "Not set"}`,
    `Sheet ledger: ${integration.googleSheetUrl || "Not configured"}`,
    "",
    "Scope:",
    order.need || "Need not recorded",
    "",
    "Notes:",
    order.notes || "None",
    "",
    "Acceptance:",
    "Deliver a monthly compliance proof packet with evidence map, exception notes, and exportable receipt.",
    "",
    "Controls:",
    "Do not request protected health information, payment credentials, passwords, or regulated source documents in v0.",
    "Payment is collected only through a reviewed manual payment or hosted invoice route. The static site never collects card data."
  ].join("\n");
}

function orderMailto(order) {
  const subject = `Invoice request ${order.invoiceNumber || ""} / ${order.customer}`.trim();
  return `mailto:${encodeURIComponent(operations.supportEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(operationPacket(order))}`;
}

async function copyOperationPacket(orderId) {
  const output = document.querySelector("#operationPacketOutput");
  const order = operations.orders.find((item) => item.id === orderId);
  if (!output || !order) {
    return;
  }
  const packet = operationPacket(order);
  let copied = false;
  try {
    await navigator.clipboard.writeText(packet);
    copied = true;
  } catch {
    copied = false;
  }
  output.classList.add("active");
  output.innerHTML = `
    <span class="metric-label">${copied ? "Copied invoice packet" : "Invoice packet"}</span>
    <strong>${escapeHtml(order.invoiceNumber || "Draft invoice")}</strong>
    <div class="order-output-actions">
      <a href="${orderMailto(order)}">Open email draft</a>
    </div>
    <pre>${escapeHtml(packet)}</pre>
  `;
}

async function copyOrderLedgerRow(orderId, button) {
  const order = (operations.orders || []).find((item) => item.id === orderId);
  if (!order || !button) {
    return;
  }
  const row = orderToLedgerRow(order);
  const previous = button.textContent;
  let copied = false;
  try {
    await navigator.clipboard.writeText(row);
    copied = true;
  } catch {
    copied = false;
  }
  button.textContent = copied ? "Row copied" : "Copy failed";
  setTimeout(() => {
    button.textContent = previous;
  }, 1500);
}

async function copyAllLedgerRows(button) {
  if (!button) {
    return;
  }
  const tsv = allOrdersLedgerTsv();
  const previous = button.getAttribute("aria-label") || "";
  let copied = false;
  try {
    await navigator.clipboard.writeText(tsv);
    copied = true;
  } catch {
    copied = false;
  }
  button.setAttribute("aria-label", copied ? "All orders copied as TSV" : "Copy failed");
  button.classList.add(copied ? "ledger-copy-ok" : "ledger-copy-fail");
  setTimeout(() => {
    button.setAttribute("aria-label", previous);
    button.classList.remove("ledger-copy-ok", "ledger-copy-fail");
  }, 1500);
}

async function copyLeadText(leadId, button, buildText) {
  const lead = salesLeads.find((item) => item.id === leadId);
  if (!lead || !button) {
    return;
  }
  const previous = button.textContent;
  let copied = false;
  try {
    await navigator.clipboard.writeText(buildText(lead));
    copied = true;
  } catch {
    copied = false;
  }
  button.textContent = copied ? "Copied" : "Copy failed";
  setTimeout(() => {
    button.textContent = previous;
  }, 1500);
}

function copyLeadQualificationPacket(leadId, button) {
  copyLeadText(leadId, button, leadQualificationPacket);
}

function copyLeadInvoicePacket(leadId, button) {
  copyLeadText(leadId, button, leadInvoicePacket);
}

function copyLeadLedgerRow(leadId, button) {
  copyLeadText(leadId, button, leadToLedgerRow);
}

async function copyAllLeadRows(button) {
  if (!button) {
    return;
  }
  const previous = button.getAttribute("aria-label") || "";
  let copied = false;
  try {
    await navigator.clipboard.writeText(allLeadsLedgerTsv());
    copied = true;
  } catch {
    copied = false;
  }
  button.setAttribute("aria-label", copied ? "All leads copied as TSV" : "Copy failed");
  button.classList.add(copied ? "ledger-copy-ok" : "ledger-copy-fail");
  setTimeout(() => {
    button.setAttribute("aria-label", previous);
    button.classList.remove("ledger-copy-ok", "ledger-copy-fail");
  }, 1500);
}

async function copyDailyRunSummary(runId, button) {
  const run = (dailyPilotRun.history || []).find((entry) => entry.id === runId);
  if (!run || !button) {
    return;
  }
  const previous = button.textContent;
  let copied = false;
  try {
    await navigator.clipboard.writeText(dailyRunCloseoutSummary(run));
    copied = true;
  } catch {
    copied = false;
  }
  button.textContent = copied ? "Closeout copied" : "Copy failed";
  setTimeout(() => {
    button.textContent = previous;
  }, 1500);
}

async function copyOutreachPacket(button) {
  if (!button) return;
  const previous = button.textContent;
  let copied = false;
  try {
    await navigator.clipboard.writeText(outreachPacket());
    copied = true;
  } catch {
    copied = false;
  }
  button.textContent = copied ? "Packet copied" : "Copy failed";
  setTimeout(() => {
    button.textContent = previous;
  }, 1500);
}

function submitOrderRequest(form) {
  const output = document.querySelector("#orderRequestOutput");
  const formData = new FormData(form);
  const customer = String(formData.get("requestCustomer") || "").trim();
  const contact = String(formData.get("requestContact") || "").trim();
  const serviceId = String(formData.get("requestService") || "").trim();
  const amount = Number(formData.get("requestAmount") || 0);
  const need = String(formData.get("requestNeed") || "").trim();
  const clean = Boolean(formData.get("requestClean"));
  const accepted = Boolean(formData.get("requestTerms"));

  if (!output) {
    return;
  }

  if (!customer || !contact || !need) {
    output.classList.add("active");
    output.innerHTML = `
      <span class="metric-label">Request blocked</span>
      <strong>Customer, contact, and need are required.</strong>
    `;
    return;
  }

  if (!clean || !accepted) {
    output.classList.add("active");
    output.innerHTML = `
      <span class="metric-label">Request blocked</span>
      <strong>Confirm the data boundary and manual invoice acknowledgement first.</strong>
    `;
    return;
  }

  const sensitiveFindings = requestSensitiveFindings({ customer, contact, need });
  if (sensitiveFindings.length) {
    output.classList.add("active");
    output.innerHTML = `
      <span class="metric-label">Request blocked</span>
      <strong>Remove ${escapeHtml(sensitiveFindings.join(", "))} before creating an invoice packet.</strong>
    `;
    return;
  }

  const order = createOperationOrder({
    customer,
    contact,
    serviceId,
    amount,
    need,
    source: "Order Desk"
  });
  if (!order) {
    return;
  }

  const packet = operationPacket(order);
  const integration = operations.integration || {};
  const handoffActions = [];
  handoffActions.push(`<a href="${orderMailto(order)}">Open email draft</a>`);
  const googleFormUrl = buildGoogleFormHandoff(integration.googleFormUrl);
  const googleSheetUrl = safeExternalUrl(integration.googleSheetUrl, GOOGLE_SHEET_URLS);
  const appsScriptUrl = safeExternalUrl(integration.appsScriptUrl, APPS_SCRIPT_URLS);
  if (googleFormUrl) {
    handoffActions.push(`<a href="${escapeHtml(googleFormUrl)}" target="_blank" rel="noreferrer">Open Google Form intake</a>`);
  }
  if (googleSheetUrl) {
    handoffActions.push(`<a href="${escapeHtml(googleSheetUrl)}" target="_blank" rel="noreferrer">Open Sheet ledger</a>`);
  }
  handoffActions.push(`<button type="button" data-copy-order-request="${escapeHtml(order.id)}">Copy packet</button>`);

  output.classList.add("active");
  const intakeNote = appsScriptUrl
    ? `<p class="metric-label">Posting sanitized request to internal Apps Script web app...</p>`
    : googleFormUrl
      ? `<p class="metric-label">Open the Google Form and paste the packet if needed. The static site does not auto-submit the form.</p>`
      : `<p class="metric-label">No external intake configured. Forward this packet manually.</p>`;
  output.innerHTML = `
    <span class="metric-label">Invoice request created</span>
    <strong>${escapeHtml(order.invoiceNumber)} / ${escapeHtml(order.customer)}</strong>
    ${intakeNote}
    <div class="order-output-actions">
      ${handoffActions.join("")}
    </div>
    <pre>${escapeHtml(packet)}</pre>
  `;

  const copyButton = output.querySelector("[data-copy-order-request]");
  if (copyButton) {
    copyButton.addEventListener("click", () => copyOperationPacket(order.id));
  }

  if (appsScriptUrl) {
    postRequestToAppsScript(appsScriptUrl, order, output);
  }

  form.reset();
  renderOrderDesk();
  renderOperations();
  renderLogs();
}

function sanitizeForLedger(order) {
  return {
    created_at: order.createdAt,
    source: order.source || "Order Desk",
    invoice_id: order.invoiceNumber,
    customer: order.customer,
    contact: order.contact,
    service: order.serviceTitle,
    amount: Number(order.amount || 0),
    status: order.status,
    stripe_invoice_url: order.stripeInvoiceUrl || "",
    delivery_due: order.deliveryDue || "",
    notes: order.notes || ""
  };
}

function buildGoogleFormHandoff(formUrl) {
  return safeExternalUrl(formUrl, GOOGLE_FORM_URLS);
}

function saveOrderStripeUrl(orderId) {
  const input = Array.from(document.querySelectorAll("[data-stripe-url-order]")).find(
    (item) => item.dataset.stripeUrlOrder === orderId
  );
  updateOrderField(orderId, "stripeInvoiceUrl", input ? input.value : "");
}

function postRequestToAppsScript(endpoint, order, output) {
  const safeEndpoint = safeExternalUrl(endpoint, APPS_SCRIPT_URLS);
  if (!safeEndpoint) {
    return;
  }
  const payload = sanitizeForLedger(order);
  fetch(safeEndpoint, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(() => {
      if (output) {
        const note = output.querySelector(".metric-label + .metric-label, p.metric-label");
        if (note) {
          note.textContent = "Sanitized request posted to Apps Script web app.";
        }
      }
    })
    .catch(() => {
      if (output) {
        const note = output.querySelector("p.metric-label");
        if (note) {
          note.textContent = "Apps Script post failed. Forward the packet manually.";
        }
      }
    });
}

function canonicalize(value) {
  if (value === undefined) {
    return "null";
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(",")}}`;
}

function fnv32(text, seed) {
  let hash = seed;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function hashString(input) {
  const first = fnv32(input, 0x811c9dc5);
  const second = fnv32(`${input.length}|${first}|${input}`, 0x811c9dc5);
  return `${first}${second}`;
}

function receiptSortKey(event) {
  const at = event.at && event.at !== "baseline" ? event.at : "0000-00-00T00:00:00.000Z";
  return `${at}|${event.type}|${event.id}`;
}

function collectReceiptEvents() {
  const events = [];
  const push = (type, id, title, owner, state, at, payload) => {
    events.push({
      type,
      id: String(id || `${slugify(type)}-${events.length + 1}`),
      title: String(title || type),
      owner: String(owner || "Strange Company"),
      state: String(state || "Recorded"),
      at: at || "baseline",
      payload: payload || {}
    });
  };

  if (launchGate.serviceStatus !== "unknown" || launchGate.checkedAt || launchGate.launchPacketId) {
    const decision = buildLaunchDecision();
    push("Launch", "online-gate", "Online gate readiness", "Launch gate", decision.state, launchGate.checkedAt, {
      blockers: decision.blockers,
      launchPacketId: launchGate.launchPacketId,
      mode: decision.mode,
      serviceStatus: launchGate.serviceStatus
    });
  }

  const liveEvidence = buildLiveEvidenceModel();
  push("Live Evidence", "external-live-evidence", "External live evidence packet", "Launch gate", liveEvidence.state, "baseline", {
    blockers: liveEvidence.evidenceBlockers.map((row) => row.id),
    liveMode: liveEvidence.liveMode,
    readyToTurnOn: liveEvidence.readyToTurnOn
  });

  const pilotReadiness = buildPilotReadiness();
  const pilotTimes = [
    ...(revenuePilot.leads || []).map((lead) => lead.updatedAt || lead.createdAt),
    ...(revenuePilot.blockers || []).map((blocker) => blocker.updatedAt)
  ].filter(Boolean);
  const pilotAt = pilotTimes.sort().pop() || "baseline";
  push("Pilot", "revenue-pilot", revenuePilot.offer.title, "Revenue pilot", pilotReadiness.state, pilotAt, {
    committedMrr: pilotReadiness.committedMrr,
    criticalBlockers: pilotReadiness.blockers.length,
    leadCount: revenuePilot.leads.length,
    offerId: revenuePilot.offer.id,
    targetMrr: pilotReadiness.targetMrr
  });

  revenuePilot.leads.forEach((lead) => {
    push("Lead", lead.id, lead.name, "Revenue pilot", lead.stage, lead.updatedAt || lead.createdAt, {
      source: lead.source,
      value: Number(lead.value || 0)
    });
  });

  salesLeads.forEach((lead) => {
    push("Sales Lead", lead.id, lead.customer, "Paid pilot pipeline", labelForLeadStage(lead.stage), lead.updatedAt || lead.createdAt, {
      amount: Number(lead.amount || 0),
      contact: lead.contact || "",
      orderId: lead.orderId || "",
      serviceId: lead.serviceId || "",
      source: lead.source || ""
    });
  });

  const satelliteModel = buildSatelliteCompanyModel();
  const satelliteTimes = [
    ...(satelliteCompany.services || []).map((service) => service.updatedAt),
    ...(satelliteCompany.controls || []).map((control) => control.updatedAt)
  ].filter(Boolean);
  const satelliteAt = satelliteTimes.sort().pop() || "baseline";
  push(
    "Satellite",
    "satellite-company",
    satelliteCompany.companyName,
    "Satellite company",
    satelliteModel.state,
    satelliteAt,
    {
      externalRevenue: satelliteModel.externalRevenue,
      externalProfit: satelliteModel.externalProfit,
      customersNeededFor3k: satelliteModel.customersNeededFor3k,
      customersNeededFor5k: satelliteModel.customersNeededFor5k,
      netProfit: satelliteModel.netProfit,
      openCriticalControls: satelliteModel.openCriticalControls.length,
      relatedPartyRevenue: satelliteModel.relatedPartyRevenue,
      revenue: satelliteModel.revenue
    }
  );

  const operationsModel = buildOperationsModel();
  const profitReadiness = buildProfitReadiness();
  const operationsTimes = [
    ...(operations.orders || []).map((order) => order.updatedAt || order.createdAt),
    ...(salesLeads || []).map((lead) => lead.updatedAt || lead.createdAt),
    ...(operations.controls || []).map((control) => control.updatedAt)
  ].filter(Boolean);
  const operationsAt = operationsTimes.sort().pop() || "baseline";
  push("Operations", "operations-console", operations.operatorName, "Operations console", operationsModel.state, operationsAt, {
    collectedMrr: operationsModel.collectedMrr,
    invoicedMrr: operationsModel.invoicedMrr,
    openCriticalControls: operationsModel.openCriticalControls.length,
    orderCount: operationsModel.orders.length,
    profitReadinessState: profitReadiness.state,
    qualifiedLeadCount: profitReadiness.qualifiedLeadCount,
    salesLeadCount: salesLeads.length,
    setupEvidenceVerified: profitReadiness.setupEvidenceVerifiedCount,
    setupEvidenceTotal: profitReadiness.setupEvidenceTotal
  });

  const revenueStartModel = buildRevenueStartModel();
  push(
    "Revenue Start",
    "two-company-revenue-start",
    "Two-company revenue start",
    "Operations console",
    revenueStartModel.state,
    revenueStartModel.latestAt,
    {
      blockers: revenueStartModel.blockers.slice(0, 20),
      completedTasks: revenueStartModel.completedTasks,
      launchMode: revenueStartModel.launchDecision.mode,
      latestPacketId: revenueStartModel.latestPacket ? revenueStartModel.latestPacket.id : "",
      operationsState: revenueStartModel.operationsModel.state,
      profitReadinessState: revenueStartModel.readiness.state,
      totalTasks: revenueStartModel.totalTasks
    }
  );

  (revenueStart.packets || []).forEach((packet) => {
    push("Revenue Packet", packet.id, "Revenue start packet", packet.issuedBy || "Operations console", packet.state, packet.createdAt, {
      blockers: packet.blockers || [],
      completedTasks: packet.completedTasks,
      laneSnapshots: (packet.lanes || []).map((lane) => `${lane.label}: ${lane.completed}/${lane.total}`),
      launchMode: packet.launchMode || "",
      nextAction: packet.nextAction || "",
      operationsState: packet.operationsState || "",
      readinessState: packet.readinessState || "",
      totalTasks: packet.totalTasks
    });
  });

  const setupModel = buildSetupEvidenceModel();
  setupModel.records.forEach((record) => {
    push("Setup Evidence", record.id, record.label, "Operations console", record.status, record.updatedAt || record.verifiedAt || "baseline", {
      evidenceUrl: record.evidenceUrl || "",
      verifiedAt: record.verifiedAt || "",
      hasNote: Boolean(record.operatorNote)
    });
  });

  const acquisition = buildCustomerAcquisitionModel();
  const acquisitionAt = (customerAcquisition.log[0] && customerAcquisition.log[0].at) || "baseline";
  push("Acquisition", "customer-acquisition", "Customer acquisition", "Operations console", `${acquisition.todayAttempts}/${acquisition.target} today`, acquisitionAt, {
    dailyTarget: acquisition.target,
    todayAttempts: acquisition.todayAttempts,
    last7Attempts: acquisition.last7Attempts,
    totalLeads: acquisition.totalLeads,
    conversions: acquisition.conversions,
    leadsBySource: acquisition.leadsBySource
  });

  const growthReview = buildGrowthReviewModel();
  push("Growth Review", "growth-management", "Operator growth review", "Operations console", growthReview.state, growthReview.latestAt, {
    bestChannel: growthReview.bestChannel.source,
    blockers: growthReview.blockers.slice(0, 12),
    invoiceReadyLeadCount: growthReview.readiness.invoiceReadyLeadCount,
    nextAction: growthReview.nextAction,
    paidOrderCount: growthReview.readiness.paidOrderCount,
    qualifiedLeadCount: growthReview.readiness.qualifiedLeadCount,
    todayAttempts: growthReview.acquisition.todayAttempts,
    outreachTarget: growthReview.acquisition.target
  });

  const adaptiveModel = buildAdaptiveOperatorModel();
  push(
    "Adaptation",
    "adaptive-operator",
    "Adaptive operator protocol",
    "Operations console",
    adaptiveModel.state,
    adaptiveModel.latestReceipt ? adaptiveModel.latestReceipt.createdAt : "baseline",
    {
      currentDamage: adaptiveModel.currentDamage.slice(0, 12),
      latestReceiptId: adaptiveModel.latestReceipt ? adaptiveModel.latestReceipt.id : "",
      openReceipts: adaptiveModel.openReceipts.length,
      routedReceipts: adaptiveModel.routedReceipts.length,
      receiptCount: adaptiveModel.receipts.length
    }
  );
  adaptiveModel.receipts.forEach((receipt) => {
    const route = adaptiveRouteFor(receipt.damageType);
    push("Adaptation Receipt", receipt.id, route.label, "Adaptive operator", receipt.status, receipt.closedAt || receipt.routedAt || receipt.createdAt, {
      countermeasure: receipt.countermeasure,
      damage: receipt.damage,
      cooldownId: receipt.cooldownId || "",
      nextEvolution: receipt.nextEvolution,
      revealed: receipt.revealed,
      routeLane: receipt.routeLane || route.lane,
      routedAt: receipt.routedAt || "",
      routeTargetId: receipt.routeTargetId || "",
      routeTargetType: receipt.routeTargetType || ""
    });
  });

  operations.orders.forEach((order) => {
    push("Order", order.id, order.customer, "Operations console", order.status, order.updatedAt || order.createdAt, {
      acceptanceNote: order.acceptanceNote || "",
      amount: Number(order.amount || 0),
      contact: order.contact || "",
      deliveredAt: order.deliveredAt || "",
      deliveryArtifactUrl: safeHttpsUrl(order.deliveryArtifactUrl || ""),
      incidentIds: Array.isArray(order.incidentIds) ? order.incidentIds.slice() : [],
      invoiceNumber: order.invoiceNumber || "",
      invoiceSentAt: order.invoiceSentAt || "",
      paidAt: order.paidAt || "",
      source: order.source || "",
      serviceTitle: order.serviceTitle || ""
    });
  });

  operationIncidents.forEach((incident) => {
    push(
      "Incident",
      incident.id,
      incident.summary || incident.invoiceNumber || incident.orderId,
      "Operations console",
      `${incident.severity} ${incident.status}`,
      incident.updatedAt || incident.createdAt,
      {
        invoiceNumber: incident.invoiceNumber || "",
        orderId: incident.orderId || "",
        response: incident.response || "",
        severity: incident.severity,
        status: incident.status,
        summary: incident.summary || ""
      }
    );
  });

  const runEvents = [];
  if (dailyPilotRun.current) {
    const activeRules = activeStopRules().map((rule) => rule.id);
    runEvents.push({
      ...dailyPilotRun.current,
      orderIds: collectDailyRunOrderIds(),
      state: activeRules.length ? "Paused" : "Active",
      activeRules
    });
  }
  (dailyPilotRun.history || []).forEach((entry) => {
    const stopRules = Object.entries(entry.stopRules || [])
      .filter(([, on]) => on)
      .map(([id]) => id);
    runEvents.push({
      ...entry,
      state: stopRules.length ? "Closed with stop rules" : "Closed clean",
      activeRules: stopRules
    });
  });
  runEvents.forEach((entry) => {
    const completedChecks = Object.entries(entry.checks || {})
      .filter(([, on]) => on)
      .map(([id]) => id);
    push(
      "Run",
      entry.id,
      `Daily pilot run ${entry.runDate}`,
      "Operations console",
      entry.state,
      entry.closedAt || entry.startedAt,
      {
        completedChecks,
        incidentIds: Array.isArray(entry.incidentIds) ? entry.incidentIds.slice() : [],
        orderIds: Array.isArray(entry.orderIds) ? entry.orderIds.slice() : [],
        receiptRoot: entry.receiptRoot || "",
        runDate: entry.runDate || "",
        startedAt: entry.startedAt || "",
        stopRules: entry.activeRules || []
      }
    );
  });

  externalSignals.forEach((signal) => {
    push("Signal", signal.id, signal.subject, signal.source, signalLabel(signal.status), signal.updatedAt || signal.observed_at, {
      boundary_confirmed: Boolean(signal.boundary_confirmed),
      evidence_reference: signal.evidence_reference,
      observed_at: signal.observed_at,
      source: signal.source,
      status: signal.status
    });
  });

  outcomeReviews.forEach((review) => {
    push("Review", review.id, `Outcome evidence review: ${review.outcomeId}`, "Evidence review", review.decision, review.createdAt, {
      blockers: review.blockers || [],
      note: review.note || "",
      outcomeId: review.outcomeId,
      sourceSignalId: review.sourceSignalId || "",
      sourceSignalReference: review.sourceSignalReference || "",
      sourceSignalSource: review.sourceSignalSource || "",
      sourceSignalSubject: review.sourceSignalSubject || ""
    });
  });

  gateRuns.forEach((run, index) => {
    push("Gate", run.id || `gate-${index + 1}`, run.claim, "Effective Boolean Filter", run.recommendation, run.createdAt, {
      argument: run.argument,
      confidence: Number(run.confidence || 0),
      context: run.context,
      effectiveness: Number(run.effectiveness || 0),
      issueCount: Number(run.issueCount || 0),
      polarity: run.polarity
    });
  });

  treasuryProposals.forEach((proposal) => {
    push(
      "Treasury",
      proposal.id,
      proposal.title,
      "H.A.T.E. engine",
      proposal.approved ? "Approved" : proposal.status || proposal.recommendation,
      proposal.issuedAt || proposal.approvedAt || proposal.checkedAt || proposal.createdAt,
      {
        amount: Number(proposal.amount || 0),
        approved: Boolean(proposal.approved),
        bucket: proposal.bucket,
        className: proposal.className,
        evidenceArtifactUrl: proposal.evidenceArtifactUrl || "",
        evidenceGateRunId: proposal.evidenceGateRunId || "",
        evidenceMeasuredAfter: proposal.evidenceMeasuredAfter || "",
        evidenceMeasuredBefore: proposal.evidenceMeasuredBefore || "",
        evidenceReviewId: proposal.evidenceReviewId || "",
        evidenceReviewNote: proposal.evidenceReviewNote || "",
        generatedFromGrowthReview: Boolean(proposal.generatedFromGrowthReview),
        growthReviewAt: proposal.growthReviewAt || "",
        outcomeId: proposal.outcomeId || "",
        packetId: proposal.packetId || "",
        recommendation: proposal.recommendation || "ungated",
        reportId: proposal.reportId || "",
        sourceSignalId: proposal.sourceSignalId || "",
        sourceSignalReference: proposal.sourceSignalReference || "",
        sourceSignalSource: proposal.sourceSignalSource || "",
        sourceSignalSubject: proposal.sourceSignalSubject || ""
      }
    );
  });

  executionPackets.forEach((packet) => {
    push("Packet", packet.id, packet.title, "Execution market", packet.state, packet.outcomeAt || packet.updatedAt || packet.createdAt, {
      budget: Number(packet.budget || 0),
      adaptiveDamageType: packet.adaptiveDamageType || "",
      adaptiveReceiptId: packet.adaptiveReceiptId || "",
      due: packet.due,
      launchGate: Boolean(packet.launchGate),
      outcomeId: packet.outcomeId || "",
      proposalId: packet.proposalId || "",
      source: packet.source || ""
    });
  });

  autonomousOutcomes.forEach((outcome) => {
    const review = latestOutcomeReview(outcome.id);
    push(
      "Outcome",
      outcome.id,
      outcome.title,
      "Autonomous cycle",
      formatOutcomeDecision(outcome.decision),
      outcome.routedAt || outcome.createdAt,
      {
        artifactUrl: outcome.artifactUrl || "",
        cooldownId: outcome.cooldownId || "",
        decision: outcome.decision,
        gateRunId: outcome.gateRunId || "",
        evidenceReviewId: review ? review.id : "",
        evidenceReviewDecision: review ? review.decision : "",
        measuredAfter: outcome.measuredAfter || "",
        measuredBefore: outcome.measuredBefore || "",
        metric: outcome.metric,
        nextClaim: outcome.nextClaim || "",
        proposalId: outcome.proposalId || "",
        sourceSignalId: outcome.sourceSignalId || "",
        sourceSignalReference: outcome.sourceSignalReference || "",
        sourceSignalSource: outcome.sourceSignalSource || "",
        sourceSignalSubject: outcome.sourceSignalSubject || "",
        sourcePacketId: outcome.sourcePacketId || ""
      }
    );
  });

  cooldownLanes.forEach((lane) => {
    push("Cooldown", lane.id, lane.lane, "Capital firewall", "Cooldown", lane.createdAt, {
      artifactUrl: lane.artifactUrl || "",
      evidenceReviewId: lane.evidenceReviewId || "",
      evidenceReviewNote: lane.evidenceReviewNote || "",
      expires: lane.expires,
      reason: lane.reason,
      source: lane.source,
      sourceSignalId: lane.sourceSignalId || "",
      sourceSignalReference: lane.sourceSignalReference || "",
      sourceSignalSource: lane.sourceSignalSource || "",
      sourceSignalSubject: lane.sourceSignalSubject || "",
      sourceAdaptationId: lane.sourceAdaptationId || "",
      sourceOutcomeId: lane.sourceOutcomeId || ""
    });
  });

  resilienceDrills.forEach((drill) => {
    push("Drill", drill.id, drill.title, "Resilience engine", drill.status, drill.packetIssuedAt || drill.lastRunAt, {
      packetId: drill.packetId || "",
      score: Number(drill.score || 0),
      severity: drill.severity,
      vector: drill.vector
    });
  });

  return events.sort((left, right) => receiptSortKey(left).localeCompare(receiptSortKey(right)));
}

function buildReceiptChain() {
  let previous = "0000000000000000";
  const receipts = collectReceiptEvents().map((event, index) => {
    const body = canonicalize({ ...event, index: index + 1 });
    const hash = hashString(`${previous}|${body}`);
    const receipt = {
      ...event,
      index: index + 1,
      previous,
      hash
    };
    previous = hash;
    return receipt;
  });

  return {
    count: receipts.length,
    receipts,
    root: previous
  };
}

function receiptState(chain) {
  if (!receiptSeal.rootHash) {
    return "Unsealed";
  }
  return receiptSeal.rootHash === chain.root && Number(receiptSeal.count || 0) === chain.count
    ? "Sealed"
    : "Changed";
}

function receiptTone(chain) {
  const state = receiptState(chain);
  if (state === "Sealed") {
    return "green";
  }
  if (state === "Changed") {
    return "red";
  }
  return "amber";
}

function toneForReceiptEvent(receipt) {
  const state = receipt.state.toLowerCase();
  if (
    state.includes("approved") ||
    state.includes("accept") ||
    state.includes("delivered") ||
    state.includes("invoice") ||
    state.includes("online") ||
    state.includes("paid sandbox") ||
    state.includes("passed") ||
    state.includes("operating") ||
    state.includes("sell today") ||
    state.includes("scale") ||
    state.includes("resolved") ||
    state.includes("closed")
  ) {
    return "green";
  }
  if (
    state.includes("blocked") ||
    state.includes("cooldown") ||
    state.includes("do not") ||
    state.includes("kill") ||
    state.includes("offline") ||
    state.includes("checklist open") ||
    state.includes("reject") ||
    state.includes("weak") ||
    state.includes("high open") ||
    state.includes("high mitigating")
  ) {
    return "red";
  }
  return "amber";
}

function formatReceiptDate(value) {
  if (!value || value === "baseline") {
    return "Baseline";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function renderReceiptChain() {
  const summary = document.querySelector("#receiptChainSummary");
  const list = document.querySelector("#receiptChainList");
  if (!summary || !list) {
    return;
  }

  const chain = buildReceiptChain();
  const state = receiptState(chain);
  const tone = receiptTone(chain);
  const sealedAt = receiptSeal.sealedAt ? formatReceiptDate(receiptSeal.sealedAt) : "Not sealed";
  const rootNote = receiptSeal.rootHash
    ? `Sealed root ${receiptSeal.rootHash.slice(0, 8)}`
    : "Seal the current state to create a baseline.";
  const stateNote =
    state === "Changed"
      ? "Material state changed after the last seal."
      : state === "Sealed"
        ? "Current receipts match the last sealed root."
        : "No baseline seal has been recorded.";

  summary.innerHTML = `
    <article class="receipt-summary-card">
      <span class="metric-label">Chain state</span>
      <strong>${escapeHtml(state)}</strong>
      <p>${escapeHtml(stateNote)}</p>
    </article>
    <article class="receipt-summary-card">
      <span class="metric-label">Current root</span>
      <strong>${escapeHtml(chain.root)}</strong>
      <p>${escapeHtml(rootNote)}</p>
    </article>
    <article class="receipt-summary-card">
      <span class="metric-label">Receipts</span>
      <strong>${chain.count}</strong>
      <p>Launch, pilot, leads, treasury, packets, gates, outcomes, and drills.</p>
    </article>
    <article class="receipt-summary-card">
      <span class="metric-label">Last seal</span>
      <strong>${escapeHtml(sealedAt)}</strong>
      <p><span class="state ${tone}">${escapeHtml(state)}</span></p>
    </article>
  `;

  list.innerHTML = chain.receipts
    .slice(-8)
    .reverse()
    .map((receipt) => {
      const receiptToneClass = toneForReceiptEvent(receipt);
      return `
        <article class="receipt-card">
          <span class="receipt-index">#${receipt.index} ${escapeHtml(receipt.type)}</span>
          <div>
            <h4>${escapeHtml(receipt.title)}</h4>
            <p>${escapeHtml(receipt.owner)} - ${escapeHtml(formatReceiptDate(receipt.at))} - prev ${escapeHtml(receipt.previous.slice(0, 8))}</p>
          </div>
          <span class="state ${receiptToneClass}">${escapeHtml(receipt.state)}</span>
          <code class="receipt-hash">${escapeHtml(receipt.hash)}</code>
        </article>
      `;
    })
    .join("");
}

function sealReceiptChain() {
  const chain = buildReceiptChain();
  receiptSeal = {
    count: chain.count,
    rootHash: chain.root,
    sealedAt: new Date().toISOString()
  };
  saveReceiptSeal();
  renderReceiptChain();
  renderLogs();
}

function isGatePassing(recommendation) {
  return recommendation === "accept" || recommendation === "accept_with_caveats";
}

function toneForProposal(proposal) {
  if (proposal.approved) {
    return "green";
  }
  if (proposal.status === "blocked" || proposal.recommendation === "reject") {
    return "red";
  }
  if (proposal.status === "ready" || isGatePassing(proposal.recommendation)) {
    return "green";
  }
  return "amber";
}

function setGateStatus(status, tone = "") {
  const statusEl = document.querySelector("#gateStatus");
  statusEl.textContent = status;
  statusEl.className = tone ? `state ${tone}` : "";
}

function renderGateResult(report) {
  const recommendation = report.recommendation || "unknown";
  const tone = toneForRecommendation(recommendation);
  document.querySelector("#gateRecommendation").innerHTML =
    `<span class="state ${tone}">${escapeHtml(recommendation)}</span>`;
  document.querySelector("#gatePolarity").textContent = report.effective_polarity || "unknown";
  document.querySelector("#gateEffectiveness").textContent =
    Number(report.effectiveness_score || 0).toFixed(3);
  document.querySelector("#gateConfidence").textContent =
    Number(report.confidence || 0).toFixed(3);

  const issues = Array.isArray(report.issues) ? report.issues : [];
  const probes = Array.isArray(report.probes) ? report.probes : [];
  document.querySelector("#gateIssues").innerHTML = issues.length
    ? issues
        .slice(0, 5)
        .map((issue) => `<li>${escapeHtml(issue.code)}: ${escapeHtml(issue.message)}</li>`)
        .join("")
    : "<li>No structural issues detected.</li>";
  document.querySelector("#gateProbes").innerHTML = probes.length
    ? probes
        .slice(0, 5)
        .map((probe) => `<li>${escapeHtml(probe.question)}</li>`)
        .join("")
    : "<li>No probes generated.</li>";
  setGateStatus("Recorded", tone);
}

function addGateRun(report, payload) {
  const recommendation = report.recommendation || "unknown";
  gateRuns.unshift({
    id: report.id || `gate_${Date.now()}`,
    claim: payload.claim,
    argument: payload.argument,
    context: payload.context,
    recommendation,
    polarity: report.effective_polarity || "unknown",
    effectiveness: Number(report.effectiveness_score || 0),
    confidence: Number(report.confidence || 0),
    issueCount: Array.isArray(report.issues) ? report.issues.length : 0,
    createdAt: new Date().toISOString()
  });
  gateRuns = gateRuns.slice(0, 12);
  saveGateRuns();
}

function renderGateRuns() {
  const list = document.querySelector("#gateRunList");
  if (!list) {
    return;
  }
  if (!gateRuns.length) {
    list.innerHTML = `
      <article class="gate-run">
        <div>
          <h4>No receipts yet</h4>
          <p>Run a claim through the gate to create the first receipt.</p>
        </div>
        <span class="state amber">Waiting</span>
        <strong>0.000</strong>
      </article>
    `;
    return;
  }
  list.innerHTML = gateRuns
    .map((run) => {
      const tone = toneForRecommendation(run.recommendation);
      return `
        <article class="gate-run">
          <div>
            <h4>${escapeHtml(run.claim)}</h4>
            <p>${escapeHtml(run.argument)}</p>
          </div>
          <span class="state ${tone}">${escapeHtml(run.recommendation)}</span>
          <strong>${Number(run.effectiveness || 0).toFixed(3)}</strong>
        </article>
      `;
    })
    .join("");
}

function renderGateChecks() {
  const list = document.querySelector("#gateCheckList");
  list.innerHTML = gateChecks
    .map((check) => {
      const tone =
        check.status === "Blocked"
          ? "red"
          : check.status === "Needs bridge"
            ? "amber"
            : "green";
      return `
        <article class="experiment-card">
          <header>
            <h3>${check.title}</h3>
            <span class="state ${tone}">${check.status}</span>
          </header>
          <p>${check.note}</p>
          <div class="experiment-meta">
            <span>${check.budget}</span>
            <span>${check.payback}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderExternalSignals() {
  const metrics = document.querySelector("#signalMetrics");
  const list = document.querySelector("#signalList");
  if (!metrics || !list) {
    return;
  }

  const total = externalSignals.length;
  const routed = externalSignals.filter((signal) => signal.status === "routed").length;
  const rejected = externalSignals.filter((signal) => signal.status === "rejected").length;
  const confirmed = externalSignals.filter((signal) => signal.boundary_confirmed).length;

  metrics.innerHTML = `
    <article class="metric-card">
      <span class="metric-label">Signals</span>
      <strong>${total}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Boundary confirmed</span>
      <strong>${confirmed}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Routed to gate</span>
      <strong>${routed}</strong>
    </article>
    <article class="metric-card">
      <span class="metric-label">Rejected</span>
      <strong>${rejected}</strong>
    </article>
  `;

  if (!externalSignals.length) {
    list.innerHTML = `
      <article class="signal-empty">
        <span class="metric-label">No signal packets</span>
        <h3>Add the first read-only evidence snapshot.</h3>
        <p>Use plugin output or operator review notes as public, sanitized evidence. The packet stays private and local.</p>
      </article>
    `;
    return;
  }

  list.innerHTML = externalSignals
    .map((signal) => {
      const tone = toneForSignal(signal);
      return `
        <article class="signal-card" data-signal-id="${escapeHtml(signal.id)}">
          <div>
            <span class="metric-label">${escapeHtml(signal.source)} / ${escapeHtml(formatDate(signal.observed_at))}</span>
            <h4>${escapeHtml(signal.subject)}</h4>
            <p>${escapeHtml(signal.summary)}</p>
            <code>${escapeHtml(signal.evidence_reference)}</code>
            ${signal.operator_note ? `<p class="signal-note">${escapeHtml(signal.operator_note)}</p>` : ""}
          </div>
          <span class="state ${tone}">${escapeHtml(signalLabel(signal.status))}</span>
          <select class="signal-status-select" data-signal-status="${escapeHtml(signal.id)}" aria-label="Signal status">
            ${signalStatuses
              .map((status) => `<option value="${escapeHtml(status)}" ${status === signal.status ? "selected" : ""}>${escapeHtml(signalLabel(status))}</option>`)
              .join("")}
          </select>
          <div class="signal-actions">
            <button type="button" data-copy-signal-gate="${escapeHtml(signal.id)}">Gate prompt</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-signal-status]").forEach((select) => {
    select.addEventListener("change", () => updateExternalSignalStatus(select.dataset.signalStatus, select.value));
  });

  document.querySelectorAll("[data-copy-signal-gate]").forEach((button) => {
    button.addEventListener("click", () => copyExternalSignalGatePrompt(button.dataset.copySignalGate, button));
  });
}

function toneForSignal(signal) {
  if (signal.status === "routed") {
    return "green";
  }
  if (signal.status === "rejected") {
    return "red";
  }
  return "amber";
}

function signalLabel(status) {
  return String(status || "observed")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return "not dated";
  }
  return date.toISOString().slice(0, 10);
}

function addExternalSignal(form) {
  const output = document.querySelector("#signalOutput");
  const formData = new FormData(form);
  const candidate = normalizeExternalSignal({
    id: `SIG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`,
    source: String(formData.get("source") || ""),
    observed_at: formData.get("observed_at")
      ? new Date(String(formData.get("observed_at"))).toISOString()
      : new Date().toISOString(),
    subject: String(formData.get("subject") || "").trim(),
    summary: String(formData.get("summary") || "").trim(),
    evidence_reference: String(formData.get("evidence_reference") || "").trim(),
    operator_note: String(formData.get("operator_note") || "").trim(),
    status: "observed",
    boundary_confirmed: Boolean(formData.get("boundary_confirmed")),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (!candidate || !candidate.subject || !candidate.summary || !candidate.evidence_reference) {
    renderSignalOutput("Signal blocked", "Source, subject, summary, and evidence reference are required.", "red");
    return;
  }

  if (!candidate.boundary_confirmed) {
    renderSignalOutput("Signal blocked", "Confirm the read-only evidence boundary first.", "red");
    return;
  }

  const sensitiveFindings = signalSensitiveFindings(candidate);
  if (sensitiveFindings.length) {
    renderSignalOutput("Signal blocked", `Remove ${sensitiveFindings.join(", ")} before creating a signal packet.`, "red");
    return;
  }

  externalSignals.unshift(candidate);
  saveExternalSignals();
  renderExternalSignals();
  renderLogs();
  form.reset();
  setSignalObservedDefault();
  renderSignalOutput("Signal packet created", `${candidate.source} / ${candidate.subject}`, "green");
  if (output) {
    output.dataset.lastSignalId = candidate.id;
  }
}

function renderSignalOutput(label, message, tone) {
  const output = document.querySelector("#signalOutput");
  if (!output) {
    return;
  }
  output.innerHTML = `
    <span class="metric-label">${escapeHtml(label)}</span>
    <strong>${escapeHtml(message)}</strong>
    <span class="state ${tone}">Private only</span>
    <p>External signals can draft Research Gate prompts, but they cannot approve spend, touch money, or alter public intake.</p>
  `;
}

function updateExternalSignalStatus(signalId, status) {
  if (!signalStatuses.includes(status)) {
    return;
  }
  externalSignals = externalSignals.map((signal) =>
    signal.id === signalId
      ? {
          ...signal,
          status,
          updatedAt: new Date().toISOString()
        }
      : signal
  );
  saveExternalSignals();
  renderExternalSignals();
  renderLogs();
}

function externalSignalGatePrompt(signal) {
  return [
    "Claim:",
    `The ${signal.source} signal about "${signal.subject}" is sufficient to draft a Strange Company research question.`,
    "",
    "Argument:",
    `Read-only public/operator evidence summary: ${signal.summary}`,
    `Evidence reference: ${signal.evidence_reference}`,
    "",
    "Context:",
    "External Signals console. This signal may inform a Research Gate question only. It cannot approve treasury spend, trade assets, invoice customers, process customer data, or change the public Order Desk.",
    "",
    "Strictness:",
    "high"
  ].join("\n");
}

async function copyExternalSignalGatePrompt(signalId, button) {
  const signal = externalSignals.find((item) => item.id === signalId);
  if (!signal) {
    return;
  }
  const prompt = externalSignalGatePrompt(signal);
  try {
    await navigator.clipboard.writeText(prompt);
    if (button) {
      button.textContent = "Copied";
    }
    renderSignalOutput("Gate prompt copied", `${signal.source} / ${signal.subject}`, "green");
  } catch {
    if (button) {
      button.textContent = "Copy unavailable";
    }
    renderSignalOutput("Copy unavailable", "Use the signal summary to manually draft the gate prompt.", "amber");
  }
}

function setSignalObservedDefault() {
  const input = document.querySelector("#signalObservedAt");
  if (input) {
    input.value = localDateTimeValue(new Date().toISOString());
  }
}

function renderLogs() {
  const log = document.querySelector("#decisionLog");
  renderLaunchGate();
  renderReceiptChain();
  if (!log) {
    return;
  }
  const receiptChain = buildReceiptChain();
  const receiptRows = [[
    "Proof",
    `Receipt chain root: ${receiptChain.root}`,
    "Local hash chain",
    receiptState(receiptChain),
    receiptTone(receiptChain)
  ]];
  const launchDecision = buildLaunchDecision();
  const launchRows = launchGate.checkedAt || launchGate.launchPacketId ? [[
    "Launch",
    `Online Gate: ${launchDecision.mode}`,
    "Launch gate",
    launchDecision.state,
    launchDecision.tone
  ]] : [];
  const pilotReadiness = buildPilotReadiness();
  const pilotRows = [[
    "Pilot",
    `Revenue Pilot: ${revenuePilot.offer.title}`,
    "Revenue pilot",
    pilotReadiness.state,
    pilotReadiness.tone
  ]];
  const satelliteModel = buildSatelliteCompanyModel();
  const satelliteRows = [[
    "Satellite",
    `${satelliteCompany.companyName}: ${money.format(satelliteModel.netProfit)} net profit model`,
    "Satellite company",
    satelliteModel.state,
    satelliteModel.tone
  ]];
  const operationsModel = buildOperationsModel();
  const operationsRows = [[
    "Ops",
    `${operations.operatorName}: ${money.format(operationsModel.collectedMrr)} collected MRR`,
    "Operations console",
    operationsModel.state,
    operationsModel.tone
  ]];
  const readiness = buildProfitReadiness();
  const profitRows = [[
    "Profit",
    `Paid pilot readiness: ${readiness.state}`,
    "Profit readiness",
    readiness.blockers.length ? readiness.blockers.join(", ") : readiness.nextAction,
    readiness.tone
  ]];
  const revenueStartModel = buildRevenueStartModel();
  const revenueStartRows = [[
    "Start",
    `Revenue start: ${revenueStartModel.completedTasks}/${revenueStartModel.totalTasks} tasks`,
    "Two-company operations",
    revenueStartModel.state,
    revenueStartModel.tone
  ]];
  if (revenueStartModel.latestPacket) {
    revenueStartRows.push([
      "Packet",
      `Issued: ${revenueStartModel.latestPacket.id}`,
      "Revenue start",
      revenueStartModel.latestPacket.state,
      revenueStartModel.latestPacket.tone || revenueStartModel.tone
    ]);
  }
  const growthReview = buildGrowthReviewModel();
  const growthRows = [[
    "Growth",
    `Growth review: ${growthReview.acquisition.todayAttempts}/${growthReview.acquisition.target} outreach today`,
    "Operations console",
    growthReview.state,
    growthReview.tone
  ]];
  const adaptiveModel = buildAdaptiveOperatorModel();
  const adaptiveRows = [[
    "Adapt",
    `Adaptive operator: ${adaptiveModel.receipts.length} receipt${adaptiveModel.receipts.length === 1 ? "" : "s"}`,
    "Operations console",
    adaptiveModel.state,
    adaptiveModel.tone
  ]];
  const signalRows = externalSignals.slice(0, 4).map((signal) => [
    "Signal",
    `${signal.source}: ${signal.subject}`,
    "External Signals",
    signalLabel(signal.status),
    toneForSignal(signal)
  ]);
  const routeRows = autonomousOutcomes
    .filter(
      (outcome) =>
        (outcome.proposalId && treasuryProposals.some((proposal) => proposal.id === outcome.proposalId)) ||
        (outcome.cooldownId && cooldownLanes.some((lane) => lane.id === outcome.cooldownId))
    )
    .slice(0, 4)
    .map((outcome) => {
      if (outcome.cooldownId) {
        return [
          "Route",
          `Cooled: ${laneNameForOutcome(outcome)}`,
          "Capital firewall",
          "Cooldown",
          "red"
        ];
      }
      return [
        "Route",
        `Drafted gate proposal: ${outcome.title}`,
        "Capital router",
        "Gate",
        "amber"
      ];
    });
  const outcomeRows = autonomousOutcomes.slice(0, 4).map((outcome) => [
    "Outcome",
    `${formatOutcomeDecision(outcome.decision)}: ${outcome.title}`,
    "Autonomous cycle",
    formatOutcomeDecision(outcome.decision),
    toneForOutcome(outcome.decision)
  ]);
  const executionRows = executionPackets
    .filter((packet) => packet.state === "Awarded" || packet.state === "Delivered")
    .slice(0, 4)
    .map((packet) => [
      "Packet",
      `${packet.state}: ${packet.title}`,
      "Execution market",
      packet.state,
      toneForPacket(packet.state)
    ]);
  const drillRows = resilienceDrills
    .filter((drill) => drill.status !== "Queued")
    .slice(0, 4)
    .map((drill) => [
      "Drill",
      `${drill.status}: ${drill.title}`,
      "Resilience engine",
      drill.packetId ? "Packet" : drill.status,
      drill.packetId ? "amber" : toneForDrill(drill)
    ]);
  const treasuryRows = treasuryProposals
    .filter((proposal) => proposal.approved || proposal.status === "blocked")
    .slice(0, 4)
    .map((proposal) => [
      "Treasury",
      `${proposal.approved ? "Approved" : "Blocked"}: ${proposal.title}`,
      "H.A.T.E. engine",
      proposal.approved ? "Approved" : proposal.recommendation,
      toneForProposal(proposal)
    ]);
  const gateLogRows = gateRuns.slice(0, 4).map((run) => [
    "Gate",
    `Research Gate: ${run.claim}`,
    "Effective Boolean Filter",
    run.recommendation,
    toneForRecommendation(run.recommendation)
  ]);
  log.innerHTML = [...receiptRows, ...launchRows, ...pilotRows, ...satelliteRows, ...operationsRows, ...profitRows, ...revenueStartRows, ...growthRows, ...adaptiveRows, ...signalRows, ...drillRows, ...routeRows, ...outcomeRows, ...executionRows, ...treasuryRows, ...gateLogRows, ...logs]
    .map(
      ([className, entry, owner, state, tone]) => `
        <div class="log-row" role="row">
          <span role="cell"><strong>${escapeHtml(className)}</strong></span>
          <span role="cell">${escapeHtml(entry)}</span>
          <span role="cell">${escapeHtml(owner)}</span>
          <span role="cell"><span class="state ${tone}">${escapeHtml(state)}</span></span>
        </div>
      `
    )
    .join("");
}

function setupNavigation() {
  document.querySelectorAll("[data-target]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const target = element.dataset.target;
      if (target) {
        activateView(target);
        history.replaceState(null, "", `#${target}`);
      }
    });
  });

  const initial = location.hash.replace("#", "");
  if (initial && document.getElementById(initial)) {
    activateView(initial);
  }

  window.addEventListener("hashchange", () => {
    const target = location.hash.replace("#", "");
    if (target && document.getElementById(target)) {
      activateView(target);
    }
  });
}

function setupTreasury() {
  const input = document.querySelector("#surplusInput");
  const range = document.querySelector("#surplusRange");

  input.addEventListener("input", () => {
    range.value = input.value;
    renderBuckets();
  });

  range.addEventListener("input", () => {
    input.value = range.value;
    renderBuckets();
  });

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      activeScenario = button.dataset.scenario;
      document.querySelectorAll("[data-scenario]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderBuckets();
    });
  });

  const resetButton = document.querySelector("#resetTreasuryProposals");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      treasuryProposals = defaultTreasuryProposals();
      saveTreasuryProposals();
      renderTreasuryGuard();
      renderTreasuryProposals();
      renderLogs();
    });
  }
}

function setupResearchGate() {
  const form = document.querySelector("#gateForm");
  if (!form) {
    return;
  }

  document.querySelectorAll("[data-strictness]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStrictness = button.dataset.strictness;
      document.querySelectorAll("[data-strictness]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      claim: document.querySelector("#gateClaim").value.trim(),
      argument: document.querySelector("#gateArgument").value.trim(),
      context: document.querySelector("#gateContext").value.trim(),
      task: "Strange Company decision gate",
      strictness: activeStrictness
    };

    if (!payload.claim || !payload.argument) {
      setGateStatus("Missing input", "red");
      return;
    }

    setGateStatus("Running", "amber");
    try {
      const response = await fetch(GATE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Gate returned ${response.status}`);
      }
      const report = await response.json();
      renderGateResult(report);
      addGateRun(report, payload);
      renderGateRuns();
      renderLogs();
    } catch (error) {
      setGateStatus("API offline", "red");
      document.querySelector("#gateIssues").innerHTML =
        `<li>${escapeHtml(error.message || "Unable to reach the local gate API.")}</li>`;
      document.querySelector("#gateProbes").innerHTML = "<li>Start the local filter service and retry.</li>";
    }
  });

  document.querySelector("#clearGateRuns").addEventListener("click", () => {
    gateRuns = [];
    saveGateRuns();
    renderGateRuns();
    renderLogs();
    setGateStatus("Cleared", "amber");
  });
}

function setupExecutionMarket() {
  const resetButton = document.querySelector("#resetExecutionPackets");
  if (!resetButton) {
    return;
  }
  resetButton.addEventListener("click", () => {
    executionPackets = defaultExecutionPackets();
    treasuryProposals = treasuryProposals.map((proposal) => ({
      ...proposal,
      packetId: ""
    }));
    resilienceDrills = resilienceDrills.map((drill) => ({
      ...drill,
      packetId: ""
    }));
    saveExecutionPackets();
    saveTreasuryProposals();
    saveResilienceDrills();
    renderBounties();
    renderTreasuryProposals();
    renderResilienceDrills();
    renderLogs();
  });
}

function setupAutonomousCycle() {
  const resetButton = document.querySelector("#resetAutonomousOutcomes");
  if (!resetButton) {
    return;
  }
  resetButton.addEventListener("click", () => {
    autonomousOutcomes = defaultAutonomousOutcomes();
    outcomeReviews = [];
    cooldownLanes = defaultCooldownLanes();
    treasuryProposals = treasuryProposals.filter((proposal) => !proposal.generatedFromOutcome);
    executionPackets = executionPackets.map((packet) => {
      const { outcomeId, outcomeAt, ...rest } = packet;
      return rest;
    });
    saveAutonomousOutcomes();
    saveOutcomeReviews();
    saveCooldownLanes();
    saveExecutionPackets();
    saveTreasuryProposals();
    renderOutcomes();
    renderBounties();
    renderCooldownLanes();
    renderTreasuryGuard();
    renderTreasuryProposals();
    renderLogs();
  });
}

function setupResilienceDrills() {
  const runButton = document.querySelector("#runResilienceDrill");
  const resetButton = document.querySelector("#resetResilienceDrills");

  if (runButton) {
    runButton.addEventListener("click", runNextResilienceDrill);
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resilienceDrills = defaultResilienceDrills();
      executionPackets = executionPackets.filter((packet) => !packet.drillId);
      saveResilienceDrills();
      saveExecutionPackets();
      renderResilienceDrills();
      renderBounties();
      renderLogs();
    });
  }
}

function setupLaunchGate() {
  const runButton = document.querySelector("#runLaunchCheck");
  const draftButton = document.querySelector("#draftLaunchPacket");
  const copyEvidenceButton = document.querySelector("#copyLiveEvidencePacket");

  if (runButton) {
    runButton.addEventListener("click", refreshLaunchGateStatus);
  }

  if (draftButton) {
    draftButton.addEventListener("click", issueLaunchPacket);
  }

  if (copyEvidenceButton) {
    copyEvidenceButton.addEventListener("click", () => copyLiveEvidencePacket(copyEvidenceButton));
  }
}

function setupRevenuePilot() {
  const form = document.querySelector("#pilotLeadForm");
  const resetButton = document.querySelector("#resetRevenuePilot");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      addPilotLead(form);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      revenuePilot = defaultRevenuePilot();
      saveRevenuePilot();
      renderRevenuePilot();
      renderLogs();
    });
  }
}

function setupSatelliteCompany() {
  const resetButton = document.querySelector("#resetSatelliteCompany");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      satelliteCompany = defaultSatelliteCompany();
      saveSatelliteCompany();
      renderSatelliteCompany();
      renderLogs();
    });
  }
}

function setupOperations() {
  const form = document.querySelector("#operationOrderForm");
  const serviceSelect = document.querySelector("#orderService");
  const amountInput = document.querySelector("#orderAmount");
  const leadForm = document.querySelector("#salesLeadForm");
  const leadServiceSelect = document.querySelector("#salesLeadService");
  const leadAmountInput = document.querySelector("#salesLeadAmount");
  const copyAllLeadRowsButton = document.querySelector("#copyAllLeadRows");
  const resetButton = document.querySelector("#resetOperations");
  const configForm = document.querySelector("#operationsConfigForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      addOperationOrder(form);
    });
  }

  if (serviceSelect && amountInput) {
    serviceSelect.addEventListener("change", () => {
      const service = operationServices().find((item) => item.id === serviceSelect.value);
      if (service) {
        amountInput.value = String(Number(service.price || 0));
      }
    });
  }

  if (leadForm) {
    leadForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addSalesLead(leadForm);
    });
  }

  if (leadServiceSelect && leadAmountInput) {
    leadServiceSelect.addEventListener("change", () => {
      const service = operationServices().find((item) => item.id === leadServiceSelect.value);
      if (service) {
        leadAmountInput.value = String(Number(service.price || 0));
      }
    });
  }

  if (configForm) {
    configForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveOperationsConfig(configForm);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      operations = defaultOperations();
      operationIncidents = defaultOperationIncidents();
      salesLeads = defaultSalesLeads();
      saveOperations();
      saveOperationIncidents();
      saveSalesLeads();
      renderOperations();
      renderOrderDesk();
      renderLogs();
    });
  }

  if (copyAllLeadRowsButton) {
    copyAllLeadRowsButton.addEventListener("click", () => copyAllLeadRows(copyAllLeadRowsButton));
  }

  const resetSetupEvidenceButton = document.querySelector("#resetSetupEvidence");
  if (resetSetupEvidenceButton) {
    resetSetupEvidenceButton.addEventListener("click", () => resetSetupEvidence());
  }
  const resetAcquisitionButton = document.querySelector("#resetCustomerAcquisition");
  if (resetAcquisitionButton) {
    resetAcquisitionButton.addEventListener("click", () => resetCustomerAcquisition());
  }
  const copyLatestAdaptiveButton = document.querySelector("#copyLatestAdaptiveReceipt");
  if (copyLatestAdaptiveButton) {
    copyLatestAdaptiveButton.addEventListener("click", () => copyLatestAdaptiveReceipt(copyLatestAdaptiveButton));
  }
  const resetAdaptiveButton = document.querySelector("#resetAdaptiveOperator");
  if (resetAdaptiveButton) {
    resetAdaptiveButton.addEventListener("click", resetAdaptiveOperator);
  }
  const copyGrowthReviewButton = document.querySelector("#copyGrowthReview");
  if (copyGrowthReviewButton) {
    copyGrowthReviewButton.addEventListener("click", () => copyGrowthReviewPacket(copyGrowthReviewButton));
  }
  const draftGrowthProposalButton = document.querySelector("#draftGrowthProposal");
  if (draftGrowthProposalButton) {
    draftGrowthProposalButton.addEventListener("click", () => draftGrowthTreasuryProposal(draftGrowthProposalButton));
  }
  const issueRevenueStartButton = document.querySelector("#issueRevenueStartPacket");
  if (issueRevenueStartButton) {
    issueRevenueStartButton.addEventListener("click", () => issueRevenueStartPacket(issueRevenueStartButton));
  }
  const resetRevenueStartButton = document.querySelector("#resetRevenueStart");
  if (resetRevenueStartButton) {
    resetRevenueStartButton.addEventListener("click", resetRevenueStart);
  }

  const bridgeForm = document.querySelector("#operationsLedgerBridgeForm");
  const bridgeTextarea = document.querySelector("#operationsLedgerTsv");
  const bridgeOutput = document.querySelector("#operationsLedgerOutput");
  const bridgePreview = document.querySelector("#operationsLedgerPreview");
  const bridgeImport = document.querySelector("#operationsLedgerImport");
  const bridgeClear = document.querySelector("#operationsLedgerClear");

  const renderBridgeOutput = (preview, tone = "amber", label = "Preview") => {
    if (!bridgeOutput) {
      return;
    }
    if (!preview || preview.totalRows === 0) {
      bridgeOutput.innerHTML = `
        <article class="ops-bridge-output-card">
          <span class="metric-label">${escapeHtml(label)}</span>
          <p>No TSV rows detected. Paste rows copied from the Sheet, with or without the header line.</p>
        </article>
      `;
      if (bridgeImport) {
        bridgeImport.disabled = true;
      }
      return;
    }
    const rejectedList = preview.rejected
      .map(
        (entry) => `
          <li>
            <strong>Line ${entry.lineNumber}:</strong> ${escapeHtml(entry.errors.join(" "))}
          </li>
        `
      )
      .join("");
    const validList = preview.valid
      .map(
        (entry) => `
          <li>
            Line ${entry.lineNumber}: ${escapeHtml(entry.normalized.invoiceId)} / ${escapeHtml(entry.normalized.customer)}
            (${escapeHtml(entry.normalized.status)})
          </li>
        `
      )
      .join("");
    bridgeOutput.innerHTML = `
      <article class="ops-bridge-output-card">
        <span class="metric-label">${escapeHtml(label)}</span>
        <p>
          Rows parsed: ${preview.totalRows}.
          Will create: ${preview.willCreate}.
          Will update: ${preview.willUpdate}.
          Rejected: ${preview.rejected.length}.
          ${preview.skippedHeader ? "Header row detected and skipped." : ""}
        </p>
        ${preview.rejected.length ? `<details open><summary>Rejected rows</summary><ul class="ops-bridge-rejected">${rejectedList}</ul></details>` : ""}
        ${preview.valid.length ? `<details><summary>Valid rows</summary><ul class="ops-bridge-valid">${validList}</ul></details>` : ""}
      </article>
    `;
    if (bridgeImport) {
      bridgeImport.disabled = preview.valid.length === 0;
    }
  };

  if (bridgePreview) {
    bridgePreview.addEventListener("click", () => {
      const text = bridgeTextarea ? bridgeTextarea.value : "";
      const preview = previewLedgerImport(text);
      renderBridgeOutput(preview, "amber", "Preview");
    });
  }

  if (bridgeForm) {
    bridgeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = bridgeTextarea ? bridgeTextarea.value : "";
      const preview = importLedger(text);
      renderBridgeOutput(preview, "green", "Imported");
      if (bridgeTextarea && preview.valid.length) {
        bridgeTextarea.value = "";
      }
      if (preview.valid.length) {
        renderOperations();
        renderOrderDesk();
        renderLogs();
      }
    });
  }

  if (bridgeClear) {
    bridgeClear.addEventListener("click", () => {
      if (bridgeOutput) {
        bridgeOutput.innerHTML = "";
      }
      if (bridgeImport) {
        bridgeImport.disabled = true;
      }
    });
  }

  const copyAllButton = document.querySelector("#copyAllLedgerRows");
  if (copyAllButton) {
    copyAllButton.addEventListener("click", () => copyAllLedgerRows(copyAllButton));
  }

  const startRunButton = document.querySelector("#startDailyPilotRun");
  const closeRunButton = document.querySelector("#closeDailyPilotRun");
  const resetRunButton = document.querySelector("#resetDailyPilotRun");
  if (startRunButton) {
    startRunButton.addEventListener("click", startDailyPilotRun);
  }
  if (closeRunButton) {
    closeRunButton.addEventListener("click", closeDailyPilotRun);
  }
  if (resetRunButton) {
    resetRunButton.addEventListener("click", resetDailyPilotRun);
  }
}

function setupOrderDesk() {
  const form = document.querySelector("#orderRequestForm");
  const serviceSelect = document.querySelector("#requestService");
  const amountInput = document.querySelector("#requestAmount");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitOrderRequest(form);
    });
  }

  if (serviceSelect && amountInput) {
    serviceSelect.addEventListener("change", () => {
      const service = operationServices().find((item) => item.id === serviceSelect.value);
      if (service) {
        amountInput.value = String(Number(service.price || 0));
        renderOrderDesk();
      }
    });
  }
}

function setupExternalSignals() {
  const form = document.querySelector("#signalForm");
  const sourceSelect = document.querySelector("#signalSource");
  const resetButton = document.querySelector("#resetExternalSignals");

  if (sourceSelect) {
    sourceSelect.innerHTML = signalSources
      .map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`)
      .join("");
  }
  setSignalObservedDefault();

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      addExternalSignal(form);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      externalSignals = defaultExternalSignals();
      saveExternalSignals();
      renderExternalSignals();
      renderLogs();
      renderSignalOutput("Signals reset", "External signal packets cleared from local storage.", "amber");
    });
  }
}

function setupReceiptChain() {
  const sealButton = document.querySelector("#sealReceiptChain");
  if (sealButton) {
    sealButton.addEventListener("click", sealReceiptChain);
  }
}

async function refreshLaunchGateStatus() {
  launchGate.serviceStatus = "checking";
  renderLaunchGate();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch("http://127.0.0.1:8000/health", {
      signal: controller.signal
    });
    const payload = await response.json();
    launchGate.serviceStatus = response.ok && payload.status === "ok" ? "ok" : "offline";
  } catch {
    launchGate.serviceStatus = "offline";
  } finally {
    window.clearTimeout(timeout);
  }

  launchGate.checkedAt = new Date().toISOString();
  saveLaunchGate();
  renderLaunchGate();
  renderLogs();
}

function issueLaunchPacket() {
  const existing = findLaunchPacket();
  if (existing) {
    launchGate.launchPacketId = existing.id;
    saveLaunchGate();
    renderLaunchGate();
    return;
  }

  const packetId = "launch-sandbox-kit";
  executionPackets.unshift({
    id: packetId,
    title: "Prepare private sandbox launch kit",
    detail: "Deploy a private online surface with auth, status monitoring, rollback, privacy copy, and support route.",
    budget: 2400,
    due: "12 days",
    state: "Open",
    source: "Online Gate",
    acceptance: "Private URL, access control, status monitor, rollback runbook, privacy notice, support inbox",
    launchGate: true,
    createdAt: new Date().toISOString()
  });
  launchGate.launchPacketId = packetId;
  launchGate.checkedAt = new Date().toISOString();
  saveExecutionPackets();
  saveLaunchGate();
  renderLaunchGate();
  renderBounties();
  renderLogs();
}

function runNextResilienceDrill() {
  const next = resilienceDrills.find((drill) => drill.status === "Queued") || resilienceDrills[0];
  if (next) {
    runResilienceDrill(next.id);
  }
}

function runResilienceDrill(drillId) {
  const drill = resilienceDrills.find((item) => item.id === drillId);
  if (!drill) {
    return;
  }

  const score = Number(drill.score || 0);
  drill.status = score >= 4.1 ? "Passed" : "Weak";
  drill.lastRunAt = new Date().toISOString();
  drill.receipt = drill.status === "Passed"
    ? "Controls held under simulated pressure."
    : "Weak point found; hardening packet required.";
  saveResilienceDrills();
  renderResilienceDrills();
  renderLogs();
}

function issueDrillHardeningPacket(drillId) {
  const drill = resilienceDrills.find((item) => item.id === drillId);
  if (!drill || drill.status !== "Weak" || drill.packetId) {
    return;
  }

  const packetId = `drill-packet-${drill.id}`;
  const existing = executionPackets.find((packet) => packet.id === packetId);
  if (existing) {
    drill.packetId = existing.id;
    saveResilienceDrills();
    renderResilienceDrills();
    renderBounties();
    renderLogs();
    return;
  }

  executionPackets.unshift({
    id: packetId,
    title: drill.packetTitle,
    detail: drill.response,
    budget: drill.packetBudget,
    due: drill.due,
    state: "Open",
    source: `Resilience drill / ${drill.title}`,
    acceptance: drill.acceptance,
    drillId: drill.id,
    createdAt: new Date().toISOString()
  });
  drill.packetId = packetId;
  drill.packetIssuedAt = new Date().toISOString();
  saveExecutionPackets();
  saveResilienceDrills();
  renderResilienceDrills();
  renderBounties();
  renderLogs();
}

function routeOutcome(outcomeId) {
  const outcome = autonomousOutcomes.find((item) => item.id === outcomeId);
  if (!outcome) {
    return;
  }
  const routeBlock = outcomeRouteBlockedReason(outcome);
  if (routeBlock) {
    renderOutcomes();
    renderLogs();
    return;
  }

  if (outcome.decision === "kill") {
    coolDownOutcomeLane(outcome);
  } else {
    draftTreasuryProposalFromOutcome(outcome);
  }

  saveAutonomousOutcomes();
  renderOutcomes();
  renderCooldownLanes();
  renderTreasuryGuard();
  renderTreasuryProposals();
  renderLogs();
}

function draftTreasuryProposalFromOutcome(outcome) {
  if (outcome.proposalId && treasuryProposals.some((proposal) => proposal.id === outcome.proposalId)) {
    return;
  }

  const proposalId = `auto-${slugify(outcome.id)}`;
  const existing = treasuryProposals.find((proposal) => proposal.id === proposalId);
  if (existing) {
    outcome.proposalId = existing.id;
    return;
  }

  const isRevision = outcome.decision === "revise";
  const title = `${isRevision ? "Revise" : "Scale"} ${outcome.title}`;
  const operatorClaim = (outcome.nextClaim || "").trim();
  const claim = operatorClaim || `${outcome.title} should receive capped follow-on capital`;
  const metric = outcome.metric || "the recorded outcome";
  const before = outcome.measuredBefore || "";
  const after = outcome.measuredAfter || "";
  const measurementLine = before || after ? `Measured before: ${before || "—"}. Measured after: ${after || "—"}.` : "";
  const artifact = outcome.artifactUrl ? safeHttpsUrl(outcome.artifactUrl) : "";
  const artifactLine = artifact ? `Delivery artifact: ${artifact}.` : "";
  const gateRun = outcome.gateRunId ? gateRuns.find((run) => run.id === outcome.gateRunId) : null;
  const gateLine = gateRun
    ? `Outcome gate receipt: ${gateRun.recommendation} (${gateRun.id}).`
    : "Outcome gate receipt: none attached. Proposal must run the gate before approval.";
  const signalLine = signalEvidenceText(outcome);
  const review = latestOutcomeReview(outcome.id);
  const reviewLine = review
    ? `Outcome evidence review: ${review.decision} (${review.id}). ${review.note || ""}`
    : "Outcome evidence review: missing.";
  const note = [
    `Autonomous draft from outcome receipt: ${metric}.`,
    measurementLine,
    artifactLine,
    gateLine,
    signalLine,
    reviewLine,
    `Next route: ${outcome.nextClaim || outcome.next || "gate review"}.`
  ]
    .filter(Boolean)
    .join(" ");
  const argument = [
    `${outcome.title} produced the measured outcome "${metric}".`,
    measurementLine,
    artifactLine,
    signalLine,
    reviewLine,
    "The outcome receipt is evidence for a capped follow-on packet.",
    `Therefore ${claim}.`
  ]
    .filter(Boolean)
    .join(" ");
  const now = new Date().toISOString();

  treasuryProposals.unshift({
    id: proposalId,
    title,
    bucket: bucketForOutcome(outcome),
    amount: amountForOutcome(outcome),
    className: isRevision ? "C" : "B",
    note,
    claim,
    argument,
    context: "Strange Company autonomous outcome routing",
    status: "needs_gate",
    recommendation: "ungated",
    polarity: "pending",
    effectiveness: 0,
    confidence: 0,
    issueCount: 0,
    reportId: "",
    approved: false,
    outcomeId: outcome.id,
    generatedFromOutcome: true,
    evidenceArtifactUrl: artifact,
    evidenceMeasuredBefore: before,
    evidenceMeasuredAfter: after,
    evidenceGateRunId: outcome.gateRunId || "",
    evidenceReviewId: review ? review.id : "",
    evidenceReviewNote: review ? review.note || "" : "",
    sourceSignalId: outcome.sourceSignalId || "",
    sourceSignalSource: outcome.sourceSignalSource || "",
    sourceSignalSubject: outcome.sourceSignalSubject || "",
    sourceSignalReference: outcome.sourceSignalReference || "",
    createdAt: now
  });

  outcome.proposalId = proposalId;
  outcome.routedAt = now;
  outcome.next = "Gate drafted proposal";
  saveTreasuryProposals();
}

function coolDownOutcomeLane(outcome) {
  if (outcome.cooldownId && cooldownLanes.some((lane) => lane.id === outcome.cooldownId)) {
    return;
  }

  const cooldownId = `cooldown-${slugify(outcome.id)}`;
  const existing = cooldownLanes.find((lane) => lane.id === cooldownId);
  if (existing) {
    outcome.cooldownId = existing.id;
    return;
  }

  const now = new Date().toISOString();
  const before = outcome.measuredBefore || "";
  const after = outcome.measuredAfter || "";
  const measurementLine = before || after ? `Before: ${before || "—"}. After: ${after || "—"}.` : "";
  const artifact = outcome.artifactUrl ? safeHttpsUrl(outcome.artifactUrl) : "";
  const signalLine = signalEvidenceText(outcome);
  const review = latestOutcomeReview(outcome.id);
  const reviewLine = review ? `Evidence review: ${review.decision} (${review.id}). ${review.note || ""}` : "";
  const reason = [`${outcome.metric || "Kill signal recorded"}.`, measurementLine, signalLine, reviewLine, outcome.evidence || ""]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
  cooldownLanes.unshift({
    id: cooldownId,
    lane: laneNameForOutcome(outcome),
    reason,
    source: outcome.source || "Autonomous cycle",
    sourceOutcomeId: outcome.id,
    expires: "2 cycles",
    artifactUrl: artifact,
    evidenceReviewId: review ? review.id : "",
    evidenceReviewNote: review ? review.note || "" : "",
    sourceSignalId: outcome.sourceSignalId || "",
    sourceSignalSource: outcome.sourceSignalSource || "",
    sourceSignalSubject: outcome.sourceSignalSubject || "",
    sourceSignalReference: outcome.sourceSignalReference || "",
    createdAt: now
  });

  outcome.cooldownId = cooldownId;
  outcome.routedAt = now;
  outcome.next = "Lane cooled for 2 cycles";
  saveCooldownLanes();
}

function bucketForOutcome(outcome) {
  const text = `${outcome.title} ${outcome.source} ${outcome.evidence}`.toLowerCase();
  if (text.includes("payment") || text.includes("backup") || text.includes("security") || text.includes("storage")) {
    return "Security compliance";
  }
  if (text.includes("license") || text.includes("data")) {
    return "Acquisitions";
  }
  if (text.includes("proof") || text.includes("audit")) {
    return "Product automation";
  }
  return "Growth experiments";
}

function amountForOutcome(outcome) {
  const text = `${outcome.title} ${outcome.metric}`.toLowerCase();
  if (outcome.decision === "revise") {
    return 1200;
  }
  if (text.includes("payment") || text.includes("backup") || text.includes("security")) {
    return 1800;
  }
  if (text.includes("template")) {
    return 1400;
  }
  if (text.includes("proof") || text.includes("audit")) {
    return 2600;
  }
  return 2200;
}

function laneNameForOutcome(outcome) {
  const text = `${outcome.title} ${outcome.evidence}`.toLowerCase();
  if (text.includes("search")) {
    return "Search ads scale lane";
  }
  if (text.includes("license") || text.includes("data")) {
    return "Unproven data acquisition lane";
  }
  return outcome.title;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function runTreasuryProposalGate(proposalId) {
  const proposal = treasuryProposals.find((item) => item.id === proposalId);
  if (!proposal || proposal.status === "running") {
    return;
  }

  proposal.status = "running";
  saveTreasuryProposals();
  renderTreasuryProposals();
  renderTreasuryGuard();

  const payload = {
    claim: proposal.claim,
    argument: proposal.argument,
    context: proposal.context,
    task: "Strange Company treasury proposal gate",
    strictness: "high"
  };

  try {
    const response = await fetch(GATE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Gate returned ${response.status}`);
    }
    const report = await response.json();
    proposal.reportId = report.id || "";
    proposal.recommendation = report.recommendation || "unknown";
    proposal.polarity = report.effective_polarity || "unknown";
    proposal.effectiveness = Number(report.effectiveness_score || 0);
    proposal.confidence = Number(report.confidence || 0);
    proposal.issueCount = Array.isArray(report.issues) ? report.issues.length : 0;
    proposal.checkedAt = new Date().toISOString();
    proposal.status = isGatePassing(proposal.recommendation) ? "ready" : "blocked";
    addGateRun(report, payload);
    saveGateRuns();
  } catch (error) {
    proposal.status = "blocked";
    proposal.recommendation = "api_offline";
    proposal.polarity = "unknown";
    proposal.effectiveness = 0;
    proposal.issueCount = 1;
    proposal.lastError = error.message || "Unable to reach the local gate API.";
  }

  saveTreasuryProposals();
  renderTreasuryGuard();
  renderTreasuryProposals();
  renderGateRuns();
  renderLogs();
}

function approveTreasuryProposal(proposalId) {
  const proposal = treasuryProposals.find((item) => item.id === proposalId);
  if (!proposal || !isGatePassing(proposal.recommendation)) {
    return;
  }
  proposal.approved = true;
  proposal.status = "approved";
  proposal.approvedAt = new Date().toISOString();
  saveTreasuryProposals();
  renderTreasuryGuard();
  renderTreasuryProposals();
  renderLogs();
}

function issueExecutionPacket(proposalId) {
  const proposal = treasuryProposals.find((item) => item.id === proposalId);
  if (!proposal || !proposal.approved || proposal.packetId) {
    return;
  }
  const packetId = `packet-${proposal.id}`;
  const due =
    proposal.bucket === "Security compliance"
      ? "9 days"
      : proposal.bucket === "Acquisitions"
        ? "21 days"
        : "14 days";
  executionPackets.unshift({
    id: packetId,
    title: proposal.title,
    detail: proposal.note,
    budget: proposal.amount,
    due,
    state: "Open",
    source: `Treasury / ${proposal.reportId || "gate receipt"}`,
    acceptance: `Deliver evidence for: ${proposal.claim}`,
    proposalId: proposal.id,
    createdAt: new Date().toISOString()
  });
  proposal.packetId = packetId;
  proposal.issuedAt = new Date().toISOString();
  saveExecutionPackets();
  saveTreasuryProposals();
  renderBounties();
  renderTreasuryProposals();
  renderLogs();
}

function deriveOutcome(packet) {
  const text = `${packet.title} ${packet.detail} ${packet.acceptance} ${packet.source}`.toLowerCase();
  const createdAt = new Date().toISOString();
  const base = {
    id: `outcome-${packet.id}`,
    title: packet.title,
    source: packet.source || "Execution market",
    sourcePacketId: packet.id,
    evidence: packet.acceptance || packet.detail || "Accepted delivery",
    createdAt
  };

  if (text.includes("search ads") || text.includes("campaign")) {
    return {
      ...base,
      decision: "kill",
      metric: "Low-intent spend lane closed",
      next: "Return budget to gated proposals"
    };
  }

  if (text.includes("interview") || text.includes("buyer trigger")) {
    return {
      ...base,
      decision: "revise",
      metric: "Buyer trigger evidence captured",
      next: "Narrow claim and rerun gate"
    };
  }

  if (
    text.includes("payment") ||
    text.includes("backup") ||
    text.includes("security") ||
    text.includes("storage")
  ) {
    return {
      ...base,
      decision: "scale",
      metric: "Single-point failure reduced",
      next: "Issue resilience follow-up packet"
    };
  }

  if (text.includes("proof") || text.includes("audit") || text.includes("compliance")) {
    return {
      ...base,
      decision: "scale",
      metric: "Reusable proof asset created",
      next: "Route asset into product automation"
    };
  }

  return {
    ...base,
    decision: "revise",
    metric: "Delivery accepted",
    next: "Attach stronger measurement"
  };
}

function createOutcomeFromPacket(packetId, evidence) {
  const packet = executionPackets.find((item) => item.id === packetId);
  if (!packet || packet.state !== "Delivered") {
    return;
  }
  if (!evidence) {
    return;
  }

  const existing = autonomousOutcomes.find((outcome) => outcome.sourcePacketId === packet.id);
  if (existing) {
    packet.outcomeId = existing.id;
    saveExecutionPackets();
    renderBounties();
    renderOutcomes();
    renderReceiptChain();
    renderLogs();
    return;
  }

  const base = deriveOutcome(packet);
  const outcome = {
    ...base,
    artifactUrl: evidence.artifactUrl || "",
    measuredBefore: evidence.measuredBefore || "",
    measuredAfter: evidence.measuredAfter || "",
    nextClaim: evidence.nextClaim || base.next || "",
    gateRunId: evidence.gateRunId || "",
    sourceSignalId: evidence.sourceSignalId || "",
    sourceSignalSource: evidence.sourceSignalSource || "",
    sourceSignalSubject: evidence.sourceSignalSubject || "",
    sourceSignalReference: evidence.sourceSignalReference || "",
    next: evidence.nextClaim || base.next || ""
  };
  autonomousOutcomes.unshift(outcome);
  packet.outcomeId = outcome.id;
  packet.outcomeAt = outcome.createdAt;
  packet.updatedAt = outcome.createdAt;
  saveAutonomousOutcomes();
  saveExecutionPackets();
  renderBounties();
  renderOutcomes();
  renderReceiptChain();
  renderLogs();
}

function advanceExecutionPacket(packetId) {
  const packet = executionPackets.find((item) => item.id === packetId);
  if (!packet) {
    return;
  }
  if (packet.state === "Draft") {
    packet.state = "Open";
  } else if (packet.state === "Open") {
    packet.state = "Awarded";
  } else if (packet.state === "Awarded") {
    packet.state = "Delivered";
  } else if (!packet.outcomeId) {
    const focusInput = document.querySelector(`#evidence-artifact-${CSS.escape(packetId)}`);
    if (focusInput) {
      focusInput.scrollIntoView({ behavior: "smooth", block: "center" });
      focusInput.focus({ preventScroll: true });
    }
    return;
  } else {
    executionPackets = executionPackets.filter((item) => item.id !== packetId);
  }
  packet.updatedAt = new Date().toISOString();
  saveExecutionPackets();
  renderBounties();
  renderOutcomes();
  renderLogs();
}

function drawLoop() {
  const canvas = document.querySelector("#loopCanvas");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.31;
  const time = performance.now() / 1000;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, width, height);

  const nodes = [
    { label: "Treasury", angle: -Math.PI / 2, color: "#f1c15b" },
    { label: "Products", angle: 0, color: "#6bb7df" },
    { label: "Growth", angle: Math.PI / 2, color: "#63c18b" },
    { label: "Defense", angle: Math.PI, color: "#e47860" }
  ];

  ctx.strokeStyle = "rgba(246, 239, 228, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + i * 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(246, 239, 228, 0.33)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  nodes.forEach((node, index) => {
    const x = centerX + Math.cos(node.angle) * radius;
    const y = centerY + Math.sin(node.angle) * radius;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  nodes.forEach((node, index) => {
    const x = centerX + Math.cos(node.angle) * radius;
    const y = centerY + Math.sin(node.angle) * radius;
    const pulse = 6 + Math.sin(time * 2 + index) * 2;

    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(x, y, 10 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#141414";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f6efe4";
    ctx.font = "800 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(node.label, x, y + 34);
  });

  for (let i = 0; i < 20; i += 1) {
    const angle = time * 0.6 + i * 0.74;
    const distance = radius * 0.22 + (i % 5) * 32;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle * 1.2) * distance;
    ctx.fillStyle = i % 3 === 0 ? "#63c18b" : i % 3 === 1 ? "#6bb7df" : "#f1c15b";
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#f6efe4";
  ctx.font = "800 28px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("H.A.T.E.", centerX, centerY - 5);
  ctx.font = "700 12px Inter, sans-serif";
  ctx.fillStyle = "rgba(246, 239, 228, 0.68)";
  ctx.fillText("Hardened Autonomous Treasury Engine", centerX, centerY + 22);

  loopAnimationId = requestAnimationFrame(drawLoop);
}

function bootIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

setupNavigation();
setupTreasury();
setupResearchGate();
setupExecutionMarket();
setupAutonomousCycle();
setupResilienceDrills();
setupLaunchGate();
setupRevenuePilot();
setupSatelliteCompany();
setupOperations();
setupOrderDesk();
setupExternalSignals();
setupReceiptChain();
renderBuckets();
renderOrderDesk();
renderLaunchGate();
renderRevenuePilot();
renderSatelliteCompany();
renderOperations();
renderSetupEvidence();
renderCustomerAcquisition();
renderExternalSignals();
renderReceiptChain();
renderTreasuryProposals();
renderCooldownLanes();
renderExperiments();
renderOutcomes();
renderScores();
renderResilienceDrills();
renderBounties();
renderGateChecks();
renderGateRuns();
renderLogs();
drawLoop();
window.addEventListener("resize", () => {
  cancelAnimationFrame(loopAnimationId);
  drawLoop();
});
window.addEventListener("load", bootIcons);
