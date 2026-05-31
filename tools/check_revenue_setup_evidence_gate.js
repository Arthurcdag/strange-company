const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "REVENUE_SETUP_EVIDENCE_INDEX.template.json");
const readyPath = path.join(os.tmpdir(), `strange-revenue-ready-${process.pid}-${Date.now()}.json`);
const privatePath = path.join(os.tmpdir(), `strange-revenue-private-${process.pid}-${Date.now()}.json`);

function runValidator(args) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "validate_revenue_setup_evidence.js"),
    ...args
  ], {
    cwd: root,
    encoding: "utf8"
  });
}

function outputOf(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function fail(message, output = "") {
  console.error("Revenue setup evidence gate regression failed:");
  console.error(`- ${message}`);
  if (output) {
    console.error(output);
  }
  process.exit(1);
}

function loadTemplate() {
  return JSON.parse(fs.readFileSync(templatePath, "utf8"));
}

function readyEvidenceIndex() {
  const index = loadTemplate();
  index.status = "ready_review_fixture";
  index.last_updated = "2026-05-31";
  index.live_mode_requested = true;
  index.live_payment_intake_allowed = true;
  index.public_config_gate = {
    termsReviewedAt: "2026-05-31",
    privacyReviewedAt: "2026-05-31",
    brazilComplianceReviewedAt: "2026-05-31",
    aiHandoffReviewedAt: "2026-05-31",
    liveMode: true,
    status: "ready_review_fixture"
  };
  index.gates = index.gates.map((gate) => ({
    ...gate,
    evidence_id: `SWS-REVSET-${gate.gate_id.toUpperCase()}-20260531-01`,
    status: "approved",
    reviewer_role: `${gate.gate_id} human reviewer`,
    reviewed_at: "2026-05-31",
    allowed_scope: "narrow paid pilot fixture only",
    blocker_summary: "none",
    private_location_hint: `operator private drive / revenue setup / ${gate.gate_id} / 2026-05-31`,
    next_step: "keep private artifacts outside git and run live checks"
  }));
  return index;
}

function privateDataEvidenceIndex() {
  const index = readyEvidenceIndex();
  index.gates[0].private_location_hint = "https://private.example.test/revenue/entity";
  return index;
}

try {
  const templateResult = runValidator([]);
  if (templateResult.status !== 0) {
    fail("validator rejected the public-safe template in default mode.", outputOf(templateResult));
  }

  const blockedReadyResult = runValidator(["--require-ready"]);
  const blockedReadyOutput = outputOf(blockedReadyResult);
  if (blockedReadyResult.status === 0) {
    fail("validator accepted the blank template as ready evidence.", blockedReadyOutput);
  }
  for (const expected of [
    "all required gates must have status approved for ready evidence.",
    "public_config_gate.liveMode must be true for ready evidence.",
    "entity.evidence_id must replace the placeholder."
  ]) {
    if (!blockedReadyOutput.includes(expected)) {
      fail(`validator did not report expected ready-blocker: ${expected}`, blockedReadyOutput);
    }
  }

  fs.writeFileSync(readyPath, `${JSON.stringify(readyEvidenceIndex(), null, 2)}\n`, "utf8");
  const readyResult = runValidator([readyPath, "--require-ready"]);
  if (readyResult.status !== 0) {
    fail("validator rejected a complete public-safe ready evidence fixture.", outputOf(readyResult));
  }

  fs.writeFileSync(privatePath, `${JSON.stringify(privateDataEvidenceIndex(), null, 2)}\n`, "utf8");
  const privateResult = runValidator([privatePath, "--require-ready"]);
  const privateOutput = outputOf(privateResult);
  if (privateResult.status === 0) {
    fail("validator accepted a private URL in private_location_hint.", privateOutput);
  }
  if (!privateOutput.includes("must be a non-secret location hint, not a private URL")) {
    fail("validator did not report the private URL blocker.", privateOutput);
  }

  console.log("Revenue setup evidence gate regression passed.");
} finally {
  for (const file of [readyPath, privatePath]) {
    try {
      fs.unlinkSync(file);
    } catch {
      // Temporary file cleanup best effort.
    }
  }
}
