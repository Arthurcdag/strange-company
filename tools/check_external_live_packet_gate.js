const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const packetPath = path.join(os.tmpdir(), `strange-live-packet-gate-${process.pid}-${Date.now()}.json`);

function testPacketMissingBrazilAndAiReviews() {
  return {
    schemaVersion: 1,
    mode: "gate-regression-test",
    support: {
      supportEmail: "ops@example.com",
      owner: "Human operator",
      monitoringCadence: "daily",
      testReceivedAt: "2026-05-22T00:00:00Z",
      testRepliedAt: "2026-05-22T00:05:00Z",
      fallbackContact: "backup@example.com",
      verified: true
    },
    google: {
      sheetUrl: "https://docs.google.com/spreadsheets/d/test/edit",
      formUrl: "https://docs.google.com/forms/d/e/test/viewform",
      testResponseTimestamp: "2026-05-22T00:10:00Z",
      requestsHeaderVerified: true,
      invoicesHeaderVerified: true,
      leadsHeaderVerified: true,
      formLinkedToSheet: true,
      verified: true
    },
    legalReview: {
      termsReviewedAt: "2026-05-22",
      privacyReviewedAt: "2026-05-22",
      supportReviewedAt: "2026-05-22",
      brazilComplianceReviewedAt: "",
      aiHandoffReviewedAt: "",
      reviewer: "Human reviewer",
      documentsChanged: false
    },
    stripe: {
      dashboardUrl: "https://dashboard.stripe.com/test/dashboard",
      testInvoiceId: "in_test_live_gate_regression",
      testHostedInvoiceUrl: "https://invoice.stripe.com/i/acct/test",
      payoutRouteVerifiedBy: "Human operator",
      reconciliationOwner: "Human operator",
      weeklyReconciliationDay: "Friday",
      hostedInvoicesEnabled: true,
      verified: true
    },
    bank: {
      entityName: "Strange Works Studio",
      responsiblePartyRecorded: true,
      bankName: "Test Bank",
      bankAccountLast4: "4242",
      stripePayoutTestStatus: "test payout route checked",
      reconciliationOwner: "Human operator",
      verified: true
    },
    publicConfig: {
      operatorName: "Strange Works Studio",
      jurisdiction: "BR",
      aiGeneratedLegalDocsRequireHumanReview: true,
      supportEmail: "ops@example.com",
      googleFormUrl: "https://docs.google.com/forms/d/e/test/viewform",
      supportInboxVerified: true,
      googleFormVerified: true,
      termsReviewedAt: "2026-05-22",
      privacyReviewedAt: "2026-05-22",
      brazilComplianceReviewedAt: "",
      aiHandoffReviewedAt: "",
      liveMode: true
    },
    attestation: {
      operator: "Human operator",
      reviewedAt: "2026-05-22",
      noSecretsInRepo: true,
      strangeCompanyRemainsSealed: true,
      satelliteIsRevenueOperator: true
    }
  };
}

function fail(message, output = "") {
  console.error("External live packet gate regression failed:");
  console.error(`- ${message}`);
  if (output) {
    console.error(output);
  }
  process.exit(1);
}

try {
  fs.writeFileSync(packetPath, `${JSON.stringify(testPacketMissingBrazilAndAiReviews(), null, 2)}\n`, "utf8");
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "validate_external_live_packet.js"),
    packetPath,
    "--require-live"
  ], {
    cwd: root,
    encoding: "utf8"
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (result.status === 0) {
    fail("validator accepted a live packet missing Brazil compliance and AI handoff review dates.", output);
  }
  const requiredFailures = [
    "Brazil compliance review date is required at legalReview.brazilComplianceReviewedAt.",
    "AI handoff review date is required at legalReview.aiHandoffReviewedAt.",
    "public Brazil compliance review date is required at publicConfig.brazilComplianceReviewedAt.",
    "public AI handoff review date is required at publicConfig.aiHandoffReviewedAt."
  ];
  const missing = requiredFailures.filter((line) => !output.includes(line));
  if (missing.length) {
    fail(`validator did not report expected failure(s): ${missing.join("; ")}`, output);
  }
  console.log("External live packet gate regression passed.");
} finally {
  try {
    fs.unlinkSync(packetPath);
  } catch {
    // Temporary file cleanup best effort.
  }
}
