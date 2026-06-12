from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]

PACKET = ROOT / "REVIEWER_CANDIDATE_PACKET.md"
TEMPLATE = ROOT / "REVIEWER_CANDIDATE_TRACKER.template.json"
VALIDATOR = ROOT / "tools" / "validate_reviewer_candidate_tracker.js"
README = ROOT / "README.md"
AI_HANDOFF = ROOT / "AI_LEGAL_HANDOFF.md"
HUMAN_REVENUE = ROOT / "HUMAN_REVENUE_INSTRUCTIONS.md"
GITIGNORE = ROOT / ".gitignore"
PAGES_YML = ROOT / ".github" / "workflows" / "pages.yml"
BUILD_PUBLIC_SITE = ROOT / "tools" / "build_public_site.js"


def run_validator(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(VALIDATOR.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def candidate(candidate_id: str, role: str) -> dict[str, object]:
    return {
        "candidateId": candidate_id,
        "candidateLabel": f"Private reviewer {candidate_id}",
        "reviewRole": role,
        "contactStatus": "paid_test_ready",
        "contactedAt": "2026-06-11",
        "scope": "Review the role-specific launch blocker before any live intake.",
        "rateBand": "BRL 150-300 paid test",
        "availability": "Can answer within 2 business days",
        "paidTestTask": "30-minute blocker memo on the assigned lane.",
        "conflictCheck": "No known conflict recorded by operator",
        "readyForPaidTest": True,
        "humanRecorded": True,
        "evidenceRef": f"private-note-2026-06-11-{candidate_id}",
        "operatorNotes": "",
    }


class ReviewerCandidateTrackerTests(unittest.TestCase):
    def test_required_files_exist(self) -> None:
        for path in (PACKET, TEMPLATE, VALIDATOR):
            with self.subTest(file=path.name):
                self.assertTrue(path.exists(), f"missing {path.name}")

    def test_template_shape(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "template")
        self.assertEqual(data["requiredReadyReviewerCount"], 4)
        self.assertEqual(data["candidateRecords"], [])
        self.assertIn("terms_consumer_law", data["requiredReadyRoles"])
        self.assertIn("paid_test_ready", data["contactStatuses"])
        self.assertTrue(data["attestation"]["noSecretsInRepo"])
        self.assertTrue(data["attestation"]["aiDidNotApproveReviewer"])

    def test_pages_contract_includes_reviewer_candidate_artifacts(self) -> None:
        workflow = PAGES_YML.read_text(encoding="utf-8")
        builder = BUILD_PUBLIC_SITE.read_text(encoding="utf-8")
        self.assertIn("node tools/build_public_site.js --check", workflow)
        self.assertIn("REVIEWER_CANDIDATE_TRACKER.template.json", builder)
        self.assertIn("tools/draft_reviewer_candidate_tracker.js", builder)
        self.assertIn("tools/validate_reviewer_candidate_tracker.js", builder)

    def test_docs_cross_reference_tracker_and_validator(self) -> None:
        for path in (PACKET, README, AI_HANDOFF, HUMAN_REVENUE):
            text = path.read_text(encoding="utf-8")
            with self.subTest(file=path.name):
                self.assertIn("REVIEWER_CANDIDATE_TRACKER.template.json", text)
                self.assertIn("tools/validate_reviewer_candidate_tracker.js", text)
                self.assertIn("tools/draft_reviewer_candidate_tracker.js", text)

    def test_gitignore_keeps_local_tracker_out_and_template_in(self) -> None:
        text = GITIGNORE.read_text(encoding="utf-8")

        self.assertIn("REVIEWER_CANDIDATE_TRACKER.local.json", text)
        self.assertIn("REVIEWER_CANDIDATE_TRACKER.*.json", text)
        self.assertIn("!REVIEWER_CANDIDATE_TRACKER.template.json", text)

    def test_template_validator_passes(self) -> None:
        result = run_validator("--template-ok")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_template_fails_require_one(self) -> None:
        result = run_validator(str(TEMPLATE), "--require-one")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("at least one candidate record is required", result.stderr)

    def test_one_candidate_gate_passes_without_ready_pool(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))
        data["mode"] = "local"
        data["candidateRecords"] = [candidate("reviewer-001", "terms_consumer_law")]
        data["candidateRecords"][0]["contactStatus"] = "contacted"
        data["candidateRecords"][0]["readyForPaidTest"] = False
        data["attestation"]["operator"] = "human-operator"
        data["attestation"]["reviewedAt"] = "2026-06-11"

        with tempfile.TemporaryDirectory() as tmp:
            packet = pathlib.Path(tmp) / "tracker.local.json"
            packet.write_text(json.dumps(data), encoding="utf-8")

            one = run_validator(str(packet), "--require-one")
            ready = run_validator(str(packet), "--require-ready")

        self.assertEqual(one.returncode, 0, one.stderr)
        self.assertIn("at least one recorded candidate", one.stdout)
        self.assertNotEqual(ready.returncode, 0)
        self.assertIn("ready reviewer pool", ready.stderr)

    def test_ready_pool_gate_passes_with_four_roles(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))
        data["mode"] = "local"
        data["candidateRecords"] = [
            candidate("reviewer-001", "terms_consumer_law"),
            candidate("reviewer-002", "privacy_lgpd"),
            candidate("reviewer-003", "tax_nfse_accounting"),
            candidate("reviewer-004", "payment_reconciliation"),
        ]
        data["attestation"]["operator"] = "human-operator"
        data["attestation"]["reviewedAt"] = "2026-06-11"

        with tempfile.TemporaryDirectory() as tmp:
            packet = pathlib.Path(tmp) / "tracker.local.json"
            packet.write_text(json.dumps(data), encoding="utf-8")

            result = run_validator(str(packet), "--require-ready")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("ready reviewer pool", result.stdout)


if __name__ == "__main__":
    unittest.main()
