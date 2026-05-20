const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const requireLive = process.argv.includes("--require-live");
const failures = [];
const evidence = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(label, detail) {
  evidence.push({ label, detail });
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(file, snippet, label) {
  const contents = read(file);
  assert(contents.includes(snippet), `${file} is missing ${label}.`);
  if (contents.includes(snippet)) {
    record(label, file);
  }
}

function assertAbsent(file, pattern, label) {
  const contents = read(file);
  assert(!pattern.test(contents), `${file} exposes ${label}.`);
}

function loadPublicConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("public-config.js"), sandbox, { filename: "public-config.js" });
  return sandbox.window.PUBLIC_ORDER_CONFIG || {};
}

function externalLiveBlockers(config) {
  const blockers = [];
  if (!config.liveMode) blockers.push("public-config.js liveMode is false");
  if (!config.supportInboxVerified) blockers.push("support inbox is not verified");
  if (!config.googleFormVerified) blockers.push("Google Form route is not verified");
  if (!String(config.googleFormUrl || "").trim()) blockers.push("Google Form URL is blank");
  if (!String(config.termsReviewedAt || "").trim()) blockers.push("terms review date is blank");
  if (!String(config.privacyReviewedAt || "").trim()) blockers.push("privacy review date is blank");
  return blockers;
}

function auditPrivateConsole() {
  assertIncludes("index.html", 'id="satellite"', "satellite company view");
  assertIncludes("index.html", 'id="operations"', "operations console view");
  assertIncludes("index.html", 'id="revenueStartPanel"', "revenue start panel");
  assertIncludes("index.html", 'id="issueRevenueStartPacket"', "revenue start issue action");
  assertIncludes("index.html", 'id="growthReviewPanel"', "growth review panel");
  assertIncludes("index.html", 'id="copyGrowthReview"', "growth review copy action");
  assertIncludes("script.js", "const REVENUE_START_LANES = [", "two-company revenue lanes");
  assertIncludes("script.js", "function buildRevenueStartModel", "revenue start state model");
  assertIncludes("script.js", "function snapshotRevenueStartLanes", "start packet lane snapshots");
  assertIncludes("script.js", "function buildGrowthReviewModel", "growth review state model");
  assertIncludes("script.js", "function growthReviewPacket", "growth review packet");
  assertIncludes("script.js", "function buildProfitReadiness", "satellite profit readiness model");
  assertIncludes("script.js", "function advanceOperationOrder", "manual order lifecycle");
  assertIncludes("script.js", "function buildOrderTimeline(order)", "order receipt-chain timeline model");
  assertIncludes("script.js", "function renderOrderTimeline(order)", "order timeline renderer");
  assertIncludes("script.js", "${renderOrderTimeline(order)}", "order timeline mounted on order cards");
  assertIncludes("script.js", "ops-order-timeline-evidence", "order timeline evidence rows");
  assertIncludes("script.js", "events.sort((a, b) => String(a.at || \"\").localeCompare(String(b.at || \"\")))", "chronological order timeline");
  assertIncludes("script.js", "(order.incidentIds || []).forEach", "incident-linked order timeline events");
  assertIncludes("script.js", '"Revenue Start",', "revenue start receipt");
  assertIncludes("script.js", '"Revenue Packet",', "revenue packet receipt");
  assertIncludes("script.js", '"Growth Review",', "growth review receipt");
}

function auditDocs() {
  assertIncludes("README.md", "REVENUE_START.md", "revenue start README link");
  assertIncludes("README.md", "GROWTH_MANAGEMENT.md", "growth management README link");
  assertIncludes("README.md", "ONLINE_ASAP.md", "online ASAP README link");
  assertIncludes("ONLINE_ASAP.md", "Main Track: Strange Company", "main online ASAP lane");
  assertIncludes("ONLINE_ASAP.md", "Satellite Track: Strange Works Studio", "satellite online ASAP lane");
  assertIncludes("ONLINE_ASAP.md", "Set `liveMode: true` last", "live mode last instruction");
  assertIncludes("OPERATIONS_RUNBOOK.md", "## Functional Definition", "satellite functional definition");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Receipt Chain Timeline Panel", "order timeline runbook section");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Revenue Start Board", "revenue start runbook section");
  assertIncludes("OPERATIONS_RUNBOOK.md", "Growth Management", "growth management runbook note");
  assertIncludes("SATELLITE_COMPANY.md", "## Revenue Start", "satellite revenue start section");
  assertIncludes("REVENUE_START.md", "## Strange Company Lane", "Strange Company lane docs");
  assertIncludes("REVENUE_START.md", "## Second Company Lane", "second company lane docs");
  assertIncludes("GROWTH_MANAGEMENT.md", "## Growth States", "growth states docs");
}

function auditPublicBoundary() {
  const privatePatterns = [
    [/strange-company-revenue-start/, "revenue start storage key"],
    [/revenueStartPanel/, "private revenue start panel"],
    [/issueRevenueStartPacket/, "private revenue start action"],
    [/growthReviewPanel/, "private growth review panel"],
    [/copyGrowthReview/, "private growth review action"],
    [/strange-company-operations/, "operations storage key"],
    [/strange-company-sales-leads/, "sales lead storage key"],
    [/\bPaid pilot pipeline\b/i, "private paid pilot pipeline"],
    [/\bDaily pilot run\b/i, "private daily pilot console"]
  ];
  for (const file of ["public.html", "public.js", "public-config.js"]) {
    for (const [pattern, label] of privatePatterns) {
      assertAbsent(file, pattern, label);
    }
  }
  record("public/private boundary", "public.html, public.js, public-config.js");
}

auditPrivateConsole();
auditDocs();
auditPublicBoundary();

let config = {};
try {
  config = loadPublicConfig();
  record("public config loads", "public-config.js");
} catch (error) {
  failures.push(`public-config.js failed to load: ${error.message}`);
}

const liveBlockers = externalLiveBlockers(config);
if (requireLive && liveBlockers.length) {
  failures.push(`external live-operation gate is blocked: ${liveBlockers.join("; ")}`);
}

if (failures.length) {
  console.error("Company functionality audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Company functionality audit passed.");
console.log("Repo-level functional surfaces:");
evidence.forEach((item) => console.log(`- ${item.label}: ${item.detail}`));

if (liveBlockers.length) {
  console.log("External live-operation gate: blocked");
  liveBlockers.forEach((blocker) => console.log(`- ${blocker}`));
  console.log("Run with --require-live to fail while these outside setup checks remain open.");
} else {
  console.log("External live-operation gate: ready by public-config.js flags.");
}
