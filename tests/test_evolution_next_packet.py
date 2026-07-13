from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import unittest

from tests.test_revenue_setup_evidence_index import valid_evidence_payload


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
        self.assertIn("termsReviewedAt", result.stdout)
        self.assertIn("Review Closure Workflow", result.stdout)
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", result.stdout)
        self.assertIn("render_live_review_public_config_patch.js", result.stdout)
        self.assertIn("Local Evidence Matrix", result.stdout)
        self.assertIn("Ready lanes:", result.stdout)
        self.assertIn("liveReviewClosure", result.stdout)
        self.assertIn("node tools/local_evidence_status.js --json", result.stdout)
        self.assertIn("privatePaymentFiscalEvidence", result.stdout)
        self.assertIn("Operational Blockers", result.stdout)
        self.assertIn("Do not set `liveMode: true`", result.stdout)

    def test_ready_revenue_lane_removes_stale_packet_blocker(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            evidence = pathlib.Path(workspace) / "REVENUE_SETUP_EVIDENCE_INDEX.local.json"
            evidence.write_text(json.dumps(valid_evidence_payload(), indent=2), encoding="utf-8")
            result = run_packet("--local-evidence-dir", workspace)

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("## Revenue Blockers\n\n- none", result.stdout)
        self.assertNotIn("privatePaymentFiscalEvidence", result.stdout)
        self.assertIn("revenueSetupEvidence: ready", result.stdout)

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
