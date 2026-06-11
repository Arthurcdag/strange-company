from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "draft_revenue_setup_evidence_index.js"


def run_node(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(SCRIPT), *args],
        cwd=str(cwd or ROOT),
        capture_output=True,
        text=True,
    )


class DraftRevenueSetupEvidenceIndexTests(unittest.TestCase):
    def test_draft_is_valid_json(self) -> None:
        process = run_node(["--operator", "OpsBot"])
        self.assertEqual(process.returncode, 0, process.stderr)

        payload = json.loads(process.stdout.strip())

        self.assertEqual(payload["mode"], "local-draft")
        self.assertEqual(payload["attestation"]["operator"], "OpsBot")
        self.assertEqual(payload["source"], "template")
        self.assertIn("attestation", payload)
        self.assertIn("entity", payload)

    def test_write_local_file_respects_force(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            target = Path(workspace) / "REVENUE_SETUP_EVIDENCE_INDEX.local.json"
            process = run_node(["--write-local", "--output", str(target), "--reviewed-at", "2026-06-11"])
            self.assertEqual(process.returncode, 0, process.stderr)

            with open(target, "r", encoding="utf-8") as handle:
                payload = json.load(handle)

            self.assertEqual(payload["attestation"]["reviewedAt"], "2026-06-11")

            process = run_node(["--write-local", "--output", str(target)])
            self.assertNotEqual(process.returncode, 0)
            self.assertIn("Refusing to overwrite", process.stderr)

            process = run_node(["--write-local", "--output", str(target), "--force"])
            self.assertEqual(process.returncode, 0, process.stderr)


if __name__ == "__main__":
    import unittest

    unittest.main()
