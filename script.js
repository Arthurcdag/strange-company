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
        detail: "Bank account, processor, receipt format, and refund path are defined.",
        done: false,
        critical: true
      },
      {
        id: "accounting",
        title: "Accounting lane ready",
        detail: "Bookkeeping, tax category, and monthly reconciliation owner are defined.",
        done: false,
        critical: true
      },
      {
        id: "terms",
        title: "Terms and privacy copy ready",
        detail: "Scope, data handling, support, cancellation, and limits are visible.",
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

const pilotStages = ["Prospect", "Contacted", "Call booked", "Committed", "Ready to invoice"];

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

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const GATE_API_URL = "http://127.0.0.1:8000/evaluate_argument";
const GATE_RUNS_KEY = "strange-company-gate-runs";
const TREASURY_PROPOSALS_KEY = "strange-company-treasury-proposals";
const EXECUTION_PACKETS_KEY = "strange-company-execution-packets";
const AUTONOMOUS_OUTCOMES_KEY = "strange-company-outcomes";
const COOLDOWN_LANES_KEY = "strange-company-cooldown-lanes";
const RESILIENCE_DRILLS_KEY = "strange-company-resilience-drills";
const LAUNCH_GATE_KEY = "strange-company-launch-gate";
const RECEIPT_SEAL_KEY = "strange-company-receipt-seal";
const REVENUE_PILOT_KEY = "strange-company-revenue-pilot";

let activeScenario = "base";
let loopAnimationId = 0;
let activeStrictness = "high";
let gateRuns = loadGateRuns();
let treasuryProposals = loadTreasuryProposals();
let executionPackets = loadExecutionPackets();
let autonomousOutcomes = loadAutonomousOutcomes();
let cooldownLanes = loadCooldownLanes();
let resilienceDrills = loadResilienceDrills();
let launchGate = loadLaunchGate();
let receiptSeal = loadReceiptSeal();
let revenuePilot = loadRevenuePilot();

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
      return `
        <article class="outcome-card">
          <div>
            <span class="metric-label">${escapeHtml(outcome.source || "Autonomous cycle")}</span>
            <h4>${escapeHtml(outcome.title)}</h4>
            <p>${escapeHtml(outcome.metric || outcome.evidence || "Outcome captured")}</p>
          </div>
          <span class="state ${tone}">${escapeHtml(formatOutcomeDecision(outcome.decision))}</span>
          <div class="outcome-route">
            <strong>Next</strong>
            <p class="outcome-next">${escapeHtml(outcome.next || "Route to gate")}</p>
            <button type="button" data-route-outcome="${escapeHtml(outcome.id)}" ${action.disabled ? "disabled" : ""}>
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
      const actionLabel =
        packet.state === "Draft"
          ? "Open"
          : packet.state === "Open"
            ? "Award"
            : packet.state === "Awarded"
              ? "Deliver"
              : packet.outcomeId
                ? "Archive"
                : "Outcome";
      return `
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
    })
    .join("");

  document.querySelectorAll("[data-advance-packet]").forEach((button) => {
    button.addEventListener("click", () => advanceExecutionPacket(button.dataset.advancePacket));
  });
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
        packetId: proposal.packetId || "",
        recommendation: proposal.recommendation || "ungated",
        reportId: proposal.reportId || ""
      }
    );
  });

  executionPackets.forEach((packet) => {
    push("Packet", packet.id, packet.title, "Execution market", packet.state, packet.outcomeAt || packet.updatedAt || packet.createdAt, {
      budget: Number(packet.budget || 0),
      due: packet.due,
      launchGate: Boolean(packet.launchGate),
      outcomeId: packet.outcomeId || "",
      proposalId: packet.proposalId || "",
      source: packet.source || ""
    });
  });

  autonomousOutcomes.forEach((outcome) => {
    push(
      "Outcome",
      outcome.id,
      outcome.title,
      "Autonomous cycle",
      formatOutcomeDecision(outcome.decision),
      outcome.routedAt || outcome.createdAt,
      {
        cooldownId: outcome.cooldownId || "",
        decision: outcome.decision,
        metric: outcome.metric,
        proposalId: outcome.proposalId || "",
        sourcePacketId: outcome.sourcePacketId || ""
      }
    );
  });

  cooldownLanes.forEach((lane) => {
    push("Cooldown", lane.id, lane.lane, "Capital firewall", "Cooldown", lane.createdAt, {
      expires: lane.expires,
      reason: lane.reason,
      source: lane.source,
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
    state.includes("scale")
  ) {
    return "green";
  }
  if (
    state.includes("blocked") ||
    state.includes("cooldown") ||
    state.includes("do not") ||
    state.includes("kill") ||
    state.includes("offline") ||
    state.includes("reject") ||
    state.includes("weak")
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
  log.innerHTML = [...receiptRows, ...launchRows, ...pilotRows, ...drillRows, ...routeRows, ...outcomeRows, ...executionRows, ...treasuryRows, ...gateLogRows, ...logs]
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
    cooldownLanes = defaultCooldownLanes();
    treasuryProposals = treasuryProposals.filter((proposal) => !proposal.generatedFromOutcome);
    executionPackets = executionPackets.map((packet) => {
      const { outcomeId, outcomeAt, ...rest } = packet;
      return rest;
    });
    saveAutonomousOutcomes();
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

  if (runButton) {
    runButton.addEventListener("click", refreshLaunchGateStatus);
  }

  if (draftButton) {
    draftButton.addEventListener("click", issueLaunchPacket);
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
  const claim = `${outcome.title} should receive capped follow-on capital`;
  const metric = outcome.metric || "the recorded outcome";
  const now = new Date().toISOString();

  treasuryProposals.unshift({
    id: proposalId,
    title,
    bucket: bucketForOutcome(outcome),
    amount: amountForOutcome(outcome),
    className: isRevision ? "C" : "B",
    note: `Autonomous draft from outcome receipt: ${metric}. Next route: ${outcome.next || "gate review"}.`,
    claim,
    argument:
      `${outcome.title} produced the measured outcome "${metric}". ` +
      `The outcome receipt is evidence for a capped follow-on packet. Therefore ${claim}.`,
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
  cooldownLanes.unshift({
    id: cooldownId,
    lane: laneNameForOutcome(outcome),
    reason: `${outcome.metric || "Kill signal recorded"}. ${outcome.evidence || ""}`.trim(),
    source: outcome.source || "Autonomous cycle",
    sourceOutcomeId: outcome.id,
    expires: "2 cycles",
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

function createOutcomeFromPacket(packetId) {
  const packet = executionPackets.find((item) => item.id === packetId);
  if (!packet || packet.state !== "Delivered") {
    return;
  }

  const existing = autonomousOutcomes.find((outcome) => outcome.sourcePacketId === packet.id);
  if (existing) {
    packet.outcomeId = existing.id;
    saveExecutionPackets();
    renderBounties();
    renderOutcomes();
    renderLogs();
    return;
  }

  const outcome = deriveOutcome(packet);
  autonomousOutcomes.unshift(outcome);
  packet.outcomeId = outcome.id;
  packet.outcomeAt = outcome.createdAt;
  packet.updatedAt = outcome.createdAt;
  saveAutonomousOutcomes();
  saveExecutionPackets();
  renderBounties();
  renderOutcomes();
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
    createOutcomeFromPacket(packetId);
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
setupReceiptChain();
renderBuckets();
renderLaunchGate();
renderRevenuePilot();
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
