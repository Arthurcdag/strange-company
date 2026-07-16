from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import textwrap
import unittest
from datetime import datetime, timedelta, timezone

from tests.test_delivery_review_checklist import ready_payload as ready_delivery_payload
from tests.test_local_evidence_status import live_review_ready_payload as base_live_review_ready_payload
from tests.test_revenue_setup_evidence_index import valid_evidence_payload
from tests.test_reviewer_candidate_tracker import candidate


ROOT = pathlib.Path(__file__).resolve().parents[1]
STATUS = ROOT / "tools" / "evolution_goal_status.js"
EXPORT_PUBLIC_LIVE_RECEIPT = ROOT / "tools" / "export_public_live_receipt.js"
README = ROOT / "README.md"
EVOLUTION_LOG = ROOT / "EVOLUTION_LOG.md"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
REVIEWER_TEMPLATE = ROOT / "REVIEWER_CANDIDATE_TRACKER.template.json"
EXTERNAL_LIVE_TEMPLATE = ROOT / "EXTERNAL_LIVE_PACKET.template.json"


def recent_utc_timestamp(minutes_ago: int) -> str:
    value = datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)
    return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def run_status(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(STATUS.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def write_temp_config(
    terms: str = "",
    privacy: str = "",
    brazil: str = "",
    ai_handoff: str = "",
    live_mode: str = "false",
    support_verified: str = "true",
    google_form_verified: str = "true",
) -> pathlib.Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False)
    temp.write(
        textwrap.dedent(
            f"""
            window.PUBLIC_ORDER_CONFIG = {{
              operatorName: "Strange Works Studio",
              jurisdiction: "BR",
              complianceMode: "brazil-draft",
              aiGeneratedLegalDocsRequireHumanReview: true,
              supportEmail: "support@example.com",
              googleFormUrl: "https://docs.google.com/forms/d/e/example/viewform",
              supportInboxVerified: {support_verified},
              googleFormVerified: {google_form_verified},
              termsReviewedAt: "{terms}",
              privacyReviewedAt: "{privacy}",
              brazilComplianceReviewedAt: "{brazil}",
              aiHandoffReviewedAt: "{ai_handoff}",
              liveMode: {live_mode},
              services: [{{
                id: "proof-sprint",
                title: "Compliance proof sprint",
                detail: "Public test offer",
                price: 750,
              }}],
            }};
            """
        )
    )
    temp.close()
    return pathlib.Path(temp.name)


def write_json(path: pathlib.Path, payload: dict[str, object]) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def live_review_ready_payload(review_date: str = "2026-07-01") -> dict[str, object]:
    payload = base_live_review_ready_payload()
    for gate_id, field in (
        ("terms", "termsReviewedAt"),
        ("privacy", "privacyReviewedAt"),
        ("brazilCompliance", "brazilComplianceReviewedAt"),
        ("aiHandoff", "aiHandoffReviewedAt"),
    ):
        payload["reviewGates"][gate_id]["reviewedAt"] = review_date
        payload["publicConfigPatch"][field] = review_date
    payload["attestation"]["reviewedAt"] = review_date
    return payload


def valid_external_live_payload(review_date: str = "2026-07-13") -> dict[str, object]:
    payload = json.loads(EXTERNAL_LIVE_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["support"].update(
        supportEmail="support@example.com",
        owner="Human operator",
        monitoringCadence="daily",
        testReceivedAt=recent_utc_timestamp(15),
        testRepliedAt=recent_utc_timestamp(10),
        verified=True,
    )
    payload["google"].update(
        sheetUrl="https://docs.google.com/spreadsheets/d/example/edit",
        formUrl="https://docs.google.com/forms/d/e/example/viewform",
        testResponseTimestamp=recent_utc_timestamp(5),
        requestsHeaderVerified=True,
        invoicesHeaderVerified=True,
        leadsHeaderVerified=True,
        formLinkedToSheet=True,
        verified=True,
    )
    payload["legalReview"].update(
        termsReviewedAt=review_date,
        privacyReviewedAt=review_date,
        supportReviewedAt=review_date,
        brazilComplianceReviewedAt=review_date,
        aiHandoffReviewedAt=review_date,
        reviewer="Human reviewer",
    )
    payload["stripe"].update(
        dashboardUrl="https://dashboard.stripe.com/test/dashboard",
        testInvoiceId="in_test_ready",
        testHostedInvoiceUrl="https://invoice.stripe.com/i/acct/test",
        payoutRouteVerifiedBy="Human operator",
        reconciliationOwner="Human operator",
        weeklyReconciliationDay="Friday",
        hostedInvoicesEnabled=True,
        verified=True,
    )
    payload["bank"].update(
        entityName="Strange Works Studio",
        responsiblePartyRecorded=True,
        bankName="Test Bank",
        bankAccountLast4="4242",
        stripePayoutTestStatus="test payout route checked",
        reconciliationOwner="Human operator",
        verified=True,
    )
    payload["publicConfig"].update(
        supportEmail="support@example.com",
        googleFormUrl="https://docs.google.com/forms/d/e/example/viewform",
        supportInboxVerified=True,
        googleFormVerified=True,
        termsReviewedAt=review_date,
        privacyReviewedAt=review_date,
        brazilComplianceReviewedAt=review_date,
        aiHandoffReviewedAt=review_date,
        liveMode=True,
    )
    payload["attestation"].update(
        operator="Human operator",
        reviewedAt=review_date,
        noSecretsInRepo=True,
        strangeCompanyRemainsSealed=True,
        satelliteIsRevenueOperator=True,
    )
    return payload


def write_ready_local_lanes(
    workspace: str,
    *,
    external: bool = True,
    revenue: bool = True,
    reviewers: bool = False,
    delivery: bool = False,
    closure: bool = True,
    review_date: str = "2026-06-12",
) -> None:
    root = pathlib.Path(workspace)
    if closure:
        write_json(
            root / "LIVE_REVIEW_CLOSURE.local.json",
            live_review_ready_payload(review_date),
        )
    if external:
        write_json(
            root / "EXTERNAL_LIVE_PACKET.local.json",
            valid_external_live_payload(review_date),
        )
    if revenue:
        revenue_payload = valid_evidence_payload()
        revenue_payload["publicConfig"].update(
            termsReviewedAt=review_date,
            privacyReviewedAt=review_date,
            brazilComplianceReviewedAt=review_date,
            aiHandoffReviewedAt=review_date,
        )
        revenue_payload["privacy"]["privacyReviewedAt"] = review_date
        revenue_payload["terms"]["termsReviewedAt"] = review_date
        write_json(root / "REVENUE_SETUP_EVIDENCE_INDEX.local.json", revenue_payload)
    if reviewers:
        tracker = json.loads(REVIEWER_TEMPLATE.read_text(encoding="utf-8"))
        tracker["mode"] = "local"
        tracker["candidateRecords"] = [
            candidate("reviewer-001", "terms_consumer_law"),
            candidate("reviewer-002", "privacy_lgpd"),
            candidate("reviewer-003", "tax_nfse_accounting"),
            candidate("reviewer-004", "payment_reconciliation"),
        ]
        tracker["attestation"]["operator"] = "human-operator"
        tracker["attestation"]["reviewedAt"] = "2026-07-13"
        write_json(root / "REVIEWER_CANDIDATE_TRACKER.local.json", tracker)
    if delivery:
        write_json(root / "DELIVERY_REVIEW_CHECKLIST.local.json", ready_delivery_payload())


def issue_public_live_receipt(
    workspace: str,
    public_config: pathlib.Path,
    terms_document: pathlib.Path = ROOT / "TERMOS.md",
    privacy_document: pathlib.Path = ROOT / "AVISO_DE_PRIVACIDADE.md",
) -> pathlib.Path:
    root = pathlib.Path(workspace)
    output = root / "public-live-receipt.js"
    result = subprocess.run(
        [
            "node",
            str(EXPORT_PUBLIC_LIVE_RECEIPT.relative_to(ROOT)),
            "--external-live-packet",
            str(root / "EXTERNAL_LIVE_PACKET.local.json"),
            "--revenue-index",
            str(root / "REVENUE_SETUP_EVIDENCE_INDEX.local.json"),
            "--reviewer-tracker",
            str(root / "REVIEWER_CANDIDATE_TRACKER.local.json"),
            "--delivery-review-checklist",
            str(root / "DELIVERY_REVIEW_CHECKLIST.local.json"),
            "--live-review-closure",
            str(root / "LIVE_REVIEW_CLOSURE.local.json"),
            "--public-config",
            str(public_config),
            "--terms-doc",
            str(terms_document),
            "--privacy-doc",
            str(privacy_document),
            "--output",
            str(output),
        ],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise AssertionError(result.stderr)
    return output


class EvolutionGoalStatusTests(unittest.TestCase):
    def test_current_status_reports_active_goal_and_blockers(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            result = run_status("--json", "--local-evidence-dir", workspace)

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["system"], "STRANGE_COMPANY_EVOLUTION_STATUS")
        self.assertEqual(data["goalStatus"], "active")
        self.assertEqual(data["mode"], "burn_down_hard_blockers")
        self.assertIn("termsReviewedAt", data["hardBlockers"])
        self.assertIn("privatePaymentFiscalEvidence", data["hardBlockers"])
        self.assertIn("privateExternalLiveEvidence", data["hardBlockers"])
        self.assertIn("humanReviewClosureEvidence", data["hardBlockers"])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "humanReviewClosureEvidence")
        self.assertEqual(data["selectedHandoff"]["laneStatus"], "missing")
        self.assertEqual(data["selectedHandoff"]["lanePhase"], "missing")
        self.assertEqual(data["liveReviewClosurePhase"], "missing")
        self.assertIn("draft_live_review_closure.js", data["selectedHandoff"]["command"])
        self.assertIn(
            "--require-ready --public-config public-config.js",
            data["selectedHandoff"]["validatorCommand"],
        )
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", data["reviewClosureActions"][0])
        self.assertTrue(any("render_live_review_public_config_patch.js" in action for action in data["reviewClosureActions"]))
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", data["nextActions"][0])
        self.assertIn("privatePaymentFiscalEvidence", data["revenueBlockers"][0]["id"])
        self.assertEqual(data["localEvidence"]["system"], "STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS")
        self.assertGreaterEqual(data["localEvidence"]["laneCount"], 6)
        self.assertTrue(any(lane["id"] == "liveReviewClosure" for lane in data["localEvidence"]["lanes"]))
        self.assertGreaterEqual(data["evolutionPassCount"], 3)
        self.assertEqual(data["latestPass"]["title"], "Atomic Review Closure Control Plane")

    def test_text_output_names_latest_pass(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            result = run_status("--local-evidence-dir", workspace)

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("STRANGE_COMPANY_EVOLUTION_STATUS", result.stdout)
        self.assertIn("Latest pass:", result.stdout)
        self.assertIn("Hard blockers:", result.stdout)
        self.assertIn("Review closure workflow:", result.stdout)
        self.assertIn("Operational blockers:", result.stdout)
        self.assertIn("Local evidence:", result.stdout)
        self.assertIn("render_live_review_public_config_patch.js", result.stdout)

    def test_document_ready_unbound_packet_selects_date_only_patch_without_mutation(self) -> None:
        config_before = (ROOT / "public-config.js").read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as workspace:
            write_json(
                pathlib.Path(workspace) / "LIVE_REVIEW_CLOSURE.local.json",
                live_review_ready_payload(),
            )
            files_before = sorted(path.name for path in pathlib.Path(workspace).iterdir())
            result = run_status("--json", "--local-evidence-dir", workspace)
            files_after = sorted(path.name for path in pathlib.Path(workspace).iterdir())

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["selectedHandoff"]["blockerId"], "humanReviewClosureEvidence")
        self.assertEqual(data["selectedHandoff"]["laneStatus"], "partial")
        self.assertEqual(data["selectedHandoff"]["lanePhase"], "document_ready_unbound")
        self.assertEqual(data["liveReviewClosurePhase"], "document_ready_unbound")
        self.assertIn("render_live_review_public_config_patch.js", data["selectedHandoff"]["command"])
        self.assertIn(
            "--require-ready --public-config public-config.js",
            data["selectedHandoff"]["validatorCommand"],
        )
        self.assertEqual(files_before, files_after)
        self.assertEqual(config_before, (ROOT / "public-config.js").read_text(encoding="utf-8"))

    def test_custom_local_evidence_dir_reports_missing_lanes_without_paths(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            result = run_status("--json", "--local-evidence-dir", workspace)

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            self.assertEqual(data["localEvidence"]["missingLaneCount"], data["localEvidence"]["laneCount"])
            self.assertNotIn(workspace, result.stdout)

    def test_closed_public_dates_keep_missing_revenue_as_hard_blocker(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, revenue=False)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "burn_down_hard_blockers")
        self.assertEqual(data["hardBlockers"], ["privatePaymentFiscalEvidence"])
        self.assertEqual(data["liveReviewClosurePhase"], "config_bound_ready")
        self.assertNotIn("humanReviewClosureEvidence", data["hardBlockers"])
        self.assertEqual(data["reviewClosureActions"], [])
        self.assertFalse(data["publicLiveReady"])

    def test_populated_public_dates_do_not_bypass_missing_closure_evidence(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, closure=False)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertIn("humanReviewClosureEvidence", data["hardBlockers"])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "humanReviewClosureEvidence")
        self.assertEqual(data["selectedHandoff"]["laneStatus"], "missing")
        self.assertFalse(data["publicLiveReady"])

    def test_invalid_or_date_stale_closure_evidence_stays_hard_blocked(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            root = pathlib.Path(workspace)
            write_ready_local_lanes(workspace, closure=False)
            (root / "LIVE_REVIEW_CLOSURE.local.json").write_text("{", encoding="utf-8")
            invalid_result = run_status(
                "--json", "--public-config", str(config), "--local-evidence-dir", workspace
            )

            write_json(
                root / "LIVE_REVIEW_CLOSURE.local.json",
                live_review_ready_payload("2026-06-11"),
            )
            stale_result = run_status(
                "--json", "--public-config", str(config), "--local-evidence-dir", workspace
            )

        self.assertEqual(invalid_result.returncode, 0, invalid_result.stderr)
        invalid_data = json.loads(invalid_result.stdout)
        invalid_lane = next(
            lane for lane in invalid_data["localEvidence"]["lanes"]
            if lane["id"] == "liveReviewClosure"
        )
        self.assertEqual(invalid_lane["status"], "invalid")
        self.assertEqual(invalid_lane["phase"], "invalid")
        self.assertIn("humanReviewClosureEvidence", invalid_data["hardBlockers"])
        self.assertIn("Inspect and repair", invalid_data["reviewClosureActions"][0])
        self.assertNotIn("draft_live_review_closure.js", invalid_data["reviewClosureActions"][0])

        self.assertEqual(stale_result.returncode, 0, stale_result.stderr)
        stale_data = json.loads(stale_result.stdout)
        stale_lane = next(
            lane for lane in stale_data["localEvidence"]["lanes"]
            if lane["id"] == "liveReviewClosure"
        )
        self.assertEqual(stale_lane["status"], "partial")
        self.assertEqual(stale_lane["phase"], "document_ready_unbound")
        self.assertFalse(stale_lane["ready"])
        self.assertEqual(stale_data["liveReviewClosurePhase"], "document_ready_unbound")
        self.assertIn("humanReviewClosureEvidence", stale_data["hardBlockers"])
        self.assertEqual(stale_data["selectedHandoff"]["laneId"], "liveReviewClosure")
        self.assertIn(
            "render_live_review_public_config_patch.js",
            stale_data["selectedHandoff"]["command"],
        )

    def test_future_public_review_dates_remain_hard_blockers(self) -> None:
        config = write_temp_config(
            terms="2099-01-01",
            privacy="2099-01-01",
            brazil="2099-01-01",
            ai_handoff="2099-01-01",
        )
        with tempfile.TemporaryDirectory() as workspace:
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        for field in (
            "termsReviewedAt",
            "privacyReviewedAt",
            "brazilComplianceReviewedAt",
            "aiHandoffReviewedAt",
        ):
            self.assertIn(field, data["hardBlockers"])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "humanReviewClosureEvidence")

    def test_missing_external_live_packet_blocks_human_live_decision(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, external=False, reviewers=True, delivery=True)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "burn_down_hard_blockers")
        self.assertEqual(data["hardBlockers"], ["privateExternalLiveEvidence"])
        self.assertFalse(data["publicLiveReady"])
        self.assertFalse(data["companyOperationalReady"])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "privateExternalLiveEvidence")
        self.assertIn("draft_external_live_packet.js", data["selectedHandoff"]["command"])

    def test_stale_external_packet_cannot_unlock_current_public_config(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace)
            write_json(
                pathlib.Path(workspace) / "EXTERNAL_LIVE_PACKET.local.json",
                valid_external_live_payload("2026-07-13"),
            )
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertIn("privateExternalLiveEvidence", data["hardBlockers"])
        external_lane = next(
            lane for lane in data["localEvidence"]["lanes"] if lane["id"] == "externalLivePacket"
        )
        self.assertFalse(external_lane["ready"])
        self.assertFalse(data["publicLiveReady"])

    def test_live_mode_cannot_bypass_missing_external_live_packet(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
            live_mode="true",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, external=False, reviewers=True, delivery=True)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "burn_down_hard_blockers")
        self.assertFalse(data["publicLiveReady"])
        live_row = next(row for row in data["publicGateRows"] if row["id"] == "liveMode")
        self.assertFalse(live_row["passed"])

    def test_ready_revenue_evidence_moves_to_harden_operations_mode(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "harden_operations")
        self.assertEqual(data["hardBlockers"], [])
        self.assertEqual(data["reviewClosureActions"], [])
        self.assertEqual(data["revenueBlockers"], [])
        self.assertEqual(data["externalLiveBlockers"], [])
        self.assertFalse(data["publicLiveReady"])
        self.assertFalse(data["companyOperationalReady"])
        self.assertEqual(
            {blocker["id"] for blocker in data["operationalBlockers"]},
            {"humanReviewerCapacity", "deliveryReviewLoop"},
        )
        self.assertEqual(data["selectedHandoff"]["blockerId"], "humanReviewerCapacity")
        self.assertNotIn("privatePaymentFiscalEvidence", result.stdout)

    def test_ready_operational_lanes_require_human_live_decision(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            receipt = issue_public_live_receipt(workspace, config)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
                "--public-live-receipt",
                str(receipt),
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "ready_for_human_live_decision")
        self.assertIn("human operator decision", data["nextLoop"])
        self.assertTrue(data["publicLiveReady"])
        self.assertTrue(data["companyOperationalReady"])
        self.assertEqual(data["operationalBlockers"], [])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "humanLiveModeDecision")
        self.assertTrue(data["selectedHandoff"]["liveModeRemainsFalse"])

    def test_missing_public_live_receipt_keeps_paid_intake_not_ready(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["hardBlockers"], [])
        self.assertEqual(data["publicRouteBlockers"], ["publicLiveReceipt"])
        self.assertFalse(data["publicLiveReady"])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "publicLiveReceipt")
        self.assertIn("export_public_live_receipt.js", data["selectedHandoff"]["command"])
        self.assertIn("--live-review-closure LIVE_REVIEW_CLOSURE.local.json", data["selectedHandoff"]["command"])

    def test_legal_document_drift_reopens_public_receipt_blocker(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        with tempfile.TemporaryDirectory() as workspace:
            root = pathlib.Path(workspace)
            terms_document = root / "TERMOS.md"
            privacy_document = root / "AVISO_DE_PRIVACIDADE.md"
            terms_document.write_text(
                (ROOT / "TERMOS.md").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            privacy_document.write_text(
                (ROOT / "AVISO_DE_PRIVACIDADE.md").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            receipt = issue_public_live_receipt(
                workspace,
                config,
                terms_document,
                privacy_document,
            )
            terms_document.write_text(
                f"{terms_document.read_text(encoding='utf-8')}\nMaterial legal drift.\n",
                encoding="utf-8",
            )
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
                "--public-live-receipt",
                str(receipt),
                "--terms-doc",
                str(terms_document),
                "--privacy-doc",
                str(privacy_document),
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertFalse(data["publicLiveReceiptReady"])
        self.assertFalse(data["publicLiveReady"])
        self.assertIn("publicLiveReceipt", data["publicRouteBlockers"])

    def test_live_mode_keeps_readiness_and_moves_to_operate_mode(self) -> None:
        issuance_config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
            live_mode="true",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            receipt = issue_public_live_receipt(workspace, issuance_config)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
                "--public-live-receipt",
                str(receipt),
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "operate_measure_adapt")
        self.assertTrue(data["publicLiveReady"])
        self.assertTrue(data["companyOperationalReady"])
        live_row = next(row for row in data["publicGateRows"] if row["id"] == "liveMode")
        self.assertTrue(live_row["passed"])
        self.assertEqual(data["selectedHandoff"]["blockerId"], "liveOperationsReview")
        self.assertFalse(data["selectedHandoff"]["liveModeRemainsFalse"])

    def test_missing_public_route_cannot_reach_human_decision_mode(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
            support_verified="false",
        )
        with tempfile.TemporaryDirectory() as workspace:
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "burn_down_hard_blockers")
        self.assertIn("supportInboxVerified", data["publicRouteBlockers"])
        self.assertIn("publicLiveReceipt", data["publicRouteBlockers"])
        self.assertIn("privateExternalLiveEvidence", data["hardBlockers"])
        self.assertFalse(data["publicLiveReady"])
        self.assertFalse(data["companyOperationalReady"])

    def test_docs_and_ci_reference_status_command(self) -> None:
        self.assertIn("tools/evolution_goal_status.js", README.read_text(encoding="utf-8"))
        self.assertIn("Evolution Status Report", EVOLUTION_LOG.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/evolution_goal_status.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/evolution_goal_status.js --json", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
