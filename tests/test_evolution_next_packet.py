from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import unittest

from tests.test_revenue_setup_evidence_index import valid_evidence_payload, write_public_config
from tests.test_evolution_goal_status import (
    issue_public_live_receipt,
    write_ready_local_lanes,
    write_temp_config,
)


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "generate_evolution_next_packet.js"
README = ROOT / "README.md"
GITIGNORE = ROOT / ".gitignore"
EVOLUTION_LOG = ROOT / "EVOLUTION_LOG.md"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"


def run_packet(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(SCRIPT.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


class EvolutionNextPacketTests(unittest.TestCase):
    def test_stdout_packet_reports_current_blockers(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            result = run_packet("--local-evidence-dir", workspace)

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Evolution Next Action Packet", result.stdout)
        self.assertIn("## Do This Next", result.stdout)
        self.assertIn("Blocker: humanReviewClosureEvidence", result.stdout)
        self.assertIn("draft_live_review_closure.js", result.stdout)
        self.assertIn("Lane phase: missing", result.stdout)
        self.assertIn("Live review closure phase: missing", result.stdout)
        self.assertIn(
            "--require-ready --public-config public-config.js",
            result.stdout,
        )
        self.assertIn("termsReviewedAt", result.stdout)
        self.assertIn("Review Closure Workflow", result.stdout)
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", result.stdout)
        self.assertIn("bind_live_review_closure.js", result.stdout)
        self.assertIn("Document-Bound Review Closure Prerequisite", result.stdout)
        self.assertIn("document-stale", result.stdout)
        self.assertIn("Local Evidence Matrix", result.stdout)
        self.assertIn("Ready lanes:", result.stdout)
        self.assertIn("liveReviewClosure", result.stdout)
        self.assertIn("node tools/local_evidence_status.js --json", result.stdout)
        self.assertIn("node tools/check_live_review_closure_conformance.js", result.stdout)
        self.assertIn("privatePaymentFiscalEvidence", result.stdout)
        self.assertIn("privateExternalLiveEvidence", result.stdout)
        self.assertIn("External Live Blockers", result.stdout)
        self.assertIn("Operational Blockers", result.stdout)
        self.assertIn("Do not set `liveMode: true`", result.stdout)

    def test_ready_revenue_lane_removes_stale_packet_blocker(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            evidence = pathlib.Path(workspace) / "REVENUE_SETUP_EVIDENCE_INDEX.local.json"
            evidence.write_text(json.dumps(valid_evidence_payload(), indent=2), encoding="utf-8")
            result = run_packet(
                "--local-evidence-dir",
                workspace,
                "--public-config",
                str(write_public_config()),
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("## Revenue Blockers\n\n- none", result.stdout)
        self.assertNotIn("privatePaymentFiscalEvidence", result.stdout)
        self.assertIn("revenueSetupEvidence: ready", result.stdout)
        self.assertIn("privateExternalLiveEvidence", result.stdout)

    def test_live_mode_recovery_packet_orders_shutdown_before_receipt_repair(self) -> None:
        config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
            live_mode="true",
        )
        with tempfile.TemporaryDirectory() as workspace:
            root = pathlib.Path(workspace)
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            result = run_packet(
                "--public-config",
                str(config),
                "--local-evidence-dir",
                workspace,
                "--public-live-receipt",
                str(root / "missing-public-live-receipt.js"),
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Blocker: liveModeRecoveryRequired", result.stdout)
        self.assertIn("Priority: safety_recovery", result.stdout)
        self.assertIn("Do: `node tools/render_public_live_shutdown_patch.js`", result.stdout)
        self.assertIn("Current liveMode: true", result.stdout)
        self.assertIn("Target liveMode: false", result.stdout)
        self.assertNotIn("- liveMode remains false:", result.stdout)
        self.assertNotIn("--live-review-closure", result.stdout)
        self.assertIn(
            "Do not issue or replace a receipt while liveMode is true",
            result.stdout,
        )

        workflow = result.stdout.split("## Live Recovery Workflow", 1)[1].split(
            "## Current Hard Blockers", 1
        )[0]
        ordered_markers = (
            "Disable external Google Form responses",
            "render_public_live_shutdown_patch.js",
            "Apply only googleFormUrl",
            "--revoke",
            "preflight_public_launch.js --deployment",
            "Publish the closed config",
            "Rerun node tools/evolution_goal_status.js --json",
        )
        positions = [workflow.index(marker) for marker in ordered_markers]
        self.assertEqual(positions, sorted(positions))

    def test_live_runtime_packet_operates_while_reissuance_packets_are_unavailable(self) -> None:
        issuance_config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
        )
        runtime_config = write_temp_config(
            terms="2026-06-12",
            privacy="2026-06-12",
            brazil="2026-06-12",
            ai_handoff="2026-06-12",
            live_mode="true",
        )
        with tempfile.TemporaryDirectory() as workspace:
            root = pathlib.Path(workspace)
            write_ready_local_lanes(workspace, reviewers=True, delivery=True)
            receipt = issue_public_live_receipt(workspace, issuance_config)
            for evidence_path in root.glob("*.local.json"):
                evidence_path.unlink()
            result = run_packet(
                "--public-config",
                str(runtime_config),
                "--local-evidence-dir",
                workspace,
                "--public-live-receipt",
                str(receipt),
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Mode: operate_measure_adapt", result.stdout)
        self.assertIn("Public runtime ready: true", result.stdout)
        self.assertIn("Reissuance ready: false", result.stdout)
        self.assertIn("Blocker: liveOperationsReview", result.stdout)
        self.assertIn("## Live Recovery Workflow\n\n- none", result.stdout)
        self.assertIn("privatePaymentFiscalEvidence", result.stdout)
        self.assertIn("privateExternalLiveEvidence", result.stdout)
        self.assertIn("humanReviewerCapacity", result.stdout)
        self.assertIn("deliveryReviewLoop", result.stdout)
        self.assertIn("Do not reissue the public receipt until reissuance readiness is true", result.stdout)
        self.assertNotIn("liveModeRecoveryRequired", result.stdout)
        self.assertNotIn("render_public_live_shutdown_patch.js", result.stdout)
        self.assertNotIn("--live-review-closure", result.stdout)

    def test_write_local_respects_force(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            target = pathlib.Path(workspace) / "EVOLUTION_NEXT_ACTION.local.md"
            result = run_packet("--write-local", "--output", str(target))
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(target.exists())
            self.assertIn("Evolution Next Action Packet", target.read_text(encoding="utf-8"))

            result = run_packet("--write-local", "--output", str(target))
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Refusing to overwrite", result.stderr)

            result = run_packet("--write-local", "--output", str(target), "--force")
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_docs_and_ci_reference_packet_generator(self) -> None:
        self.assertIn("tools/generate_evolution_next_packet.js", README.read_text(encoding="utf-8"))
        self.assertIn("EVOLUTION_NEXT_ACTION.local.md", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("Evolution Next Action Packet", EVOLUTION_LOG.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/generate_evolution_next_packet.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/generate_evolution_next_packet.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
