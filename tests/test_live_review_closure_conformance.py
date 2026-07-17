from __future__ import annotations

import json
import pathlib
import subprocess
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
CHECKER = ROOT / "tools" / "check_live_review_closure_conformance.js"
EXPECTED_PHASES = [
    "missing",
    "invalid",
    "document_ready_unbound",
    "config_bound_ready",
]


def run_checker(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(CHECKER.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=120,
    )


class LiveReviewClosureConformanceTests(unittest.TestCase):
    def test_json_report_covers_all_four_phases(self) -> None:
        result = run_checker("--json")

        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(
            report["system"],
            "STRANGE_COMPANY_LIVE_REVIEW_CLOSURE_CONFORMANCE",
        )
        self.assertTrue(report["passed"])
        self.assertTrue(report["publicSafe"])
        self.assertEqual(
            [row["fixture"] for row in report["phases"]],
            EXPECTED_PHASES,
        )
        self.assertEqual(
            [row["phase"] for row in report["phases"]],
            EXPECTED_PHASES,
        )
        for row in report["phases"]:
            self.assertEqual(row["localEvidencePhase"], row["phase"])
            self.assertEqual(row["evolutionGoalPhase"], row["phase"])
            self.assertEqual(row["nextPacketPhase"], row["phase"])
            should_be_ready = row["phase"] == "config_bound_ready"
            self.assertEqual(row["vauClosureReady"], should_be_ready)
            self.assertTrue(row["vauPriorityConsistent"])
            self.assertEqual(row["closureBlocked"], not should_be_ready)
            self.assertEqual(row["selectedHandoffAdvanced"], should_be_ready)

        transition = report["bindingTransition"]
        self.assertEqual(transition["fromPhase"], "document_ready_unbound")
        self.assertEqual(transition["toPhase"], "config_bound_ready")
        self.assertEqual(transition["transition"], "bind_and_revoke")
        self.assertEqual(transition["stagedReceiptStatus"], "not_issued")
        self.assertEqual(transition["appliedReceiptStatus"], "not_issued")
        self.assertTrue(transition["planWasNonMutating"])
        self.assertTrue(transition["exactApplyArgumentsUsed"])
        self.assertTrue(transition["exactPlanIdConsumed"])
        self.assertTrue(transition["allStatusSurfacesReobserved"])
        self.assertTrue(transition["closureBlockerCleared"])
        self.assertTrue(transition["vauClosureReady"])

    def test_text_report_is_concise_and_public_safe(self) -> None:
        result = run_checker()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Live review closure conformance passed.", result.stdout)
        for phase in EXPECTED_PHASES:
            self.assertIn(f"- {phase}: {phase}", result.stdout)
        self.assertIn(
            "- binding transition: document_ready_unbound -> config_bound_ready",
            result.stdout,
        )
        self.assertNotIn("documentDigests", result.stdout)
        self.assertNotIn("fixture-reviewer", result.stdout)
        self.assertNotIn("strange-company-live-review-conformance-", result.stdout)

    def test_checker_exercises_every_status_surface_without_repo_outputs(self) -> None:
        source = CHECKER.read_text(encoding="utf-8")

        for command in (
            "tools/local_evidence_status.js",
            "tools/evolution_goal_status.js",
            "tools/generate_evolution_next_packet.js",
            "tools/vau_company_evolution.py",
            "tools/export_public_live_receipt.js",
            "tools/bind_live_review_closure.js",
        ):
            self.assertIn(command, source)
        self.assertIn("planWasNonMutating", source)
        self.assertIn("plan.applyArguments.slice(1)", source)
        self.assertIn("inspectWrittenFixture", source)
        self.assertIn("fs.mkdtempSync", source)
        self.assertIn("fs.rmSync", source)
        self.assertNotIn("--write-local", source)


if __name__ == "__main__":
    unittest.main()
