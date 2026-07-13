from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "draft_live_review_closure.js"


def run_node(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(SCRIPT), *args],
        cwd=str(cwd or ROOT),
        capture_output=True,
        text=True,
    )


class DraftLiveReviewClosureTests(unittest.TestCase):
    def test_draft_is_valid_json_and_keeps_live_mode_false(self) -> None:
        process = run_node(["--operator", "OpsBot"])
        self.assertEqual(process.returncode, 0, process.stderr)

        payload = json.loads(process.stdout.strip())

        self.assertEqual(payload["mode"], "local-draft")
        self.assertEqual(payload["attestation"]["operator"], "OpsBot")
        self.assertEqual(payload["source"], "public-config.js")
        self.assertFalse(payload["publicConfigPatch"]["liveMode"])
        self.assertIn("reviewGates", payload)
        self.assertIn("draftInstructions", payload)

    def test_write_local_file_respects_force(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            target = Path(workspace) / "LIVE_REVIEW_CLOSURE.local.json"
            process = run_node(["--write-local", "--output", str(target), "--reviewed-at", "2026-06-12"])
            self.assertEqual(process.returncode, 0, process.stderr)

            payload = json.loads(target.read_text(encoding="utf-8"))
            self.assertEqual(payload["attestation"]["reviewedAt"], "2026-06-12")
            self.assertFalse(payload["publicConfigPatch"]["liveMode"])

            process = run_node(["--write-local", "--output", str(target)])
            self.assertNotEqual(process.returncode, 0)
            self.assertIn("Refusing to overwrite", process.stderr)

            process = run_node(["--write-local", "--output", str(target), "--force"])
            self.assertEqual(process.returncode, 0, process.stderr)


if __name__ == "__main__":
    unittest.main()
