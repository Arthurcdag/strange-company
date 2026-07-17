from __future__ import annotations

import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "draft_reviewer_candidate_tracker.js"


def run_node(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(SCRIPT), *args],
        cwd=str(cwd or ROOT),
        capture_output=True,
        text=True,
    )


class DraftReviewerCandidateTrackerTests(unittest.TestCase):
    def test_draft_is_valid_json(self) -> None:
        process = run_node(["--operator", "OpsBot"])
        self.assertEqual(process.returncode, 0, process.stderr)

        payload = json.loads(process.stdout.strip())

        self.assertEqual(payload["mode"], "local-draft")
        self.assertEqual(payload["attestation"]["operator"], "OpsBot")
        self.assertIn("candidateRecords", payload)
        self.assertIsInstance(payload["candidateRecords"], list)
        self.assertEqual(payload["candidateRecords"], [])

    def test_write_local_file_respects_force(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            target = Path(workspace) / "REVIEWER_CANDIDATE_TRACKER.local.json"
            process = run_node(["--output", str(target), "--reviewed-at", "2026-06-11"], workspace)
            self.assertEqual(process.returncode, 0, process.stderr)

            with open(target, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
            self.assertEqual(payload["attestation"]["reviewedAt"], "2026-06-11")

            process = run_node(["--output", str(target)])
            self.assertNotEqual(process.returncode, 0)
            self.assertIn("Refusing to overwrite", process.stderr)

            process = run_node(["--output", str(target), "--force"])
            self.assertEqual(process.returncode, 0, process.stderr)
