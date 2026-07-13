from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import textwrap
import unittest

from tests.test_delivery_review_checklist import ready_payload as ready_delivery_payload
from tests.test_revenue_setup_evidence_index import valid_evidence_payload
from tests.test_reviewer_candidate_tracker import candidate


ROOT = pathlib.Path(__file__).resolve().parents[1]
STATUS = ROOT / "tools" / "evolution_goal_status.js"
README = ROOT / "README.md"
EVOLUTION_LOG = ROOT / "EVOLUTION_LOG.md"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
REVIEWER_TEMPLATE = ROOT / "REVIEWER_CANDIDATE_TRACKER.template.json"


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
            }};
            """
        )
    )
    temp.close()
    return pathlib.Path(temp.name)


def write_json(path: pathlib.Path, payload: dict[str, object]) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def write_ready_local_lanes(
    workspace: str,
    *,
    revenue: bool = True,
    reviewers: bool = False,
    delivery: bool = False,
) -> None:
    root = pathlib.Path(workspace)
    if revenue:
        write_json(root / "REVENUE_SETUP_EVIDENCE_INDEX.local.json", valid_evidence_payload())
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
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", data["reviewClosureActions"][0])
        self.assertTrue(any("render_live_review_public_config_patch.js" in action for action in data["reviewClosureActions"]))
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", data["nextActions"][0])
        self.assertIn("privatePaymentFiscalEvidence", data["revenueBlockers"][0]["id"])
        self.assertEqual(data["localEvidence"]["system"], "STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS")
        self.assertGreaterEqual(data["localEvidence"]["laneCount"], 6)
        self.assertTrue(any(lane["id"] == "liveReviewClosure" for lane in data["localEvidence"]["lanes"]))
        self.assertGreaterEqual(data["evolutionPassCount"], 3)
        self.assertEqual(data["latestPass"]["title"], "Evidence Blocker Reconciliation")

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
        self.assertEqual(data["reviewClosureActions"], [])
        self.assertFalse(data["publicLiveReady"])

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
        self.assertTrue(data["publicLiveReady"])
        self.assertFalse(data["companyOperationalReady"])
        self.assertEqual(
            {blocker["id"] for blocker in data["operationalBlockers"]},
            {"humanReviewerCapacity", "deliveryReviewLoop"},
        )
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
            result = run_status(
                "--json",
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["mode"], "ready_for_human_live_decision")
        self.assertIn("human operator decision", data["nextLoop"])
        self.assertTrue(data["publicLiveReady"])
        self.assertTrue(data["companyOperationalReady"])
        self.assertEqual(data["operationalBlockers"], [])

    def test_live_mode_keeps_readiness_and_moves_to_operate_mode(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
            live_mode="true",
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
        self.assertEqual(data["mode"], "operate_measure_adapt")
        self.assertTrue(data["publicLiveReady"])
        self.assertTrue(data["companyOperationalReady"])
        live_row = next(row for row in data["publicGateRows"] if row["id"] == "liveMode")
        self.assertTrue(live_row["passed"])

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
        self.assertEqual(data["mode"], "harden_operations")
        self.assertEqual(data["publicRouteBlockers"], ["supportInboxVerified"])
        self.assertFalse(data["publicLiveReady"])
        self.assertFalse(data["companyOperationalReady"])

    def test_docs_and_ci_reference_status_command(self) -> None:
        self.assertIn("tools/evolution_goal_status.js", README.read_text(encoding="utf-8"))
        self.assertIn("Evolution Status Report", EVOLUTION_LOG.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/evolution_goal_status.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/evolution_goal_status.js --json", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
