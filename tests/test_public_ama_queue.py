from __future__ import annotations

import copy
import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]

README = ROOT / "README.md"
PUBLIC_AMA = ROOT / "PUBLIC_AMA.md"
TEMPLATE = ROOT / "PUBLIC_AMA_QUEUE.template.json"
VALIDATOR = ROOT / "tools" / "validate_public_ama_queue.js"
DRAFT = ROOT / "tools" / "draft_public_ama_queue.js"
EXPORT = ROOT / "tools" / "export_public_ama_answers.js"
BUILD_PUBLIC_SITE = ROOT / "tools" / "build_public_site.js"
ANSWERS_TEMPLATE = ROOT / "PUBLIC_AMA_ANSWERS.template.json"
PUBLIC_ANSWERS_JS = ROOT / "public-ama-answers.js"
GITIGNORE = ROOT / ".gitignore"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
PAGES_YML = ROOT / ".github" / "workflows" / "pages.yml"
PREFLIGHT = ROOT / "tools" / "preflight_public_launch.js"
AUDIT = ROOT / "tools" / "audit_company_functionality.js"
SURVIVAL = ROOT / "tools" / "survival_check.js"


def run_validator(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(VALIDATOR.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def valid_queue_payload(answer_ready: bool = False) -> dict[str, object]:
    payload = json.loads(TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["questionRecords"] = [
        {
            "questionId": "AMA-20260612-001",
            "receivedAt": "2026-06-12",
            "topic": "launch-gates",
            "nameAlias": "Public asker 001",
            "contactRef": "support-thread-ama-001",
            "questionSummary": "Asked when public AMA can run while paid intake remains closed.",
            "publicSafeQuestion": "Can the project run an AMA before paid intake is live?",
            "status": "answer_ready" if answer_ready else "screened",
            "boundaryDecision": "public_safe",
            "evidenceRef": "ama-log-2026-06-12-001",
            "humanScreened": True,
        }
    ]
    if answer_ready:
        payload["questionRecords"][0].update(
            {
                "publicAnswer": "Yes. The AMA can answer public-safe questions while paid intake remains closed.",
                "answerReviewedAt": "2026-06-12",
                "humanApprovedForPublication": True,
            }
        )
    payload["attestation"] = {
        "operator": "Ops",
        "reviewedAt": "2026-06-12",
        "noSecretsInRepo": True,
        "privateEvidenceStaysOutOfRepo": True,
        "aiDidNotApproveLegalTaxPaymentOrPrivacy": True,
        "noPaymentOrderOrLaunchApprovalCreated": True,
        "strangeCompanyRemainsSealed": True,
    }
    return payload


def write_payload(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


class PublicAmaQueueTests(unittest.TestCase):
    def test_required_files_exist(self) -> None:
        for path in (PUBLIC_AMA, TEMPLATE, ANSWERS_TEMPLATE, VALIDATOR, DRAFT, EXPORT, BUILD_PUBLIC_SITE, PUBLIC_ANSWERS_JS, VALIDATE_WORKFLOW, PAGES_YML):
            with self.subTest(file=path.name):
                self.assertTrue(path.exists(), f"missing {path.name}")

    def test_template_shape(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "template")
        self.assertEqual(data["questionRecords"], [])
        self.assertIn("public_safe", data["allowedBoundaryDecisions"])
        self.assertTrue(data["attestation"]["noSecretsInRepo"])
        self.assertTrue(data["attestation"]["strangeCompanyRemainsSealed"])

    def test_template_validator_passes(self) -> None:
        result = run_validator("--template-ok")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_template_fails_require_one(self) -> None:
        result = run_validator(str(TEMPLATE), "--require-one")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("at least one screened AMA question is required", result.stderr)

    def test_one_question_gate_passes_without_answer_ready(self) -> None:
        packet = write_payload(valid_queue_payload(answer_ready=False))

        one = run_validator(str(packet), "--require-one")
        answer = run_validator(str(packet), "--require-answer-ready")

        self.assertEqual(one.returncode, 0, one.stderr)
        self.assertIn("at least one screened question", one.stdout)
        self.assertNotEqual(answer.returncode, 0)
        self.assertIn("answer_ready record", answer.stderr)

    def test_answer_ready_gate_passes(self) -> None:
        packet = write_payload(valid_queue_payload(answer_ready=True))

        result = run_validator(str(packet), "--require-answer-ready")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("answer-ready public-safe question", result.stdout)

    def test_tracker_rejects_direct_email_values(self) -> None:
        payload = valid_queue_payload(answer_ready=False)
        payload["questionRecords"][0]["contactRef"] = "person@example.com"
        packet = write_payload(payload)

        result = run_validator(str(packet), "--require-one")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("private-data-like value", result.stderr)

    def test_docs_workflows_and_guards_reference_queue(self) -> None:
        for path in (README, PUBLIC_AMA, PREFLIGHT, AUDIT, SURVIVAL):
            text = path.read_text(encoding="utf-8")
            with self.subTest(file=path.name):
                self.assertIn("PUBLIC_AMA_QUEUE", text)
                self.assertIn("validate_public_ama_queue", text)

        self.assertIn("PUBLIC_AMA_QUEUE.local.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("!PUBLIC_AMA_QUEUE.template.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("PUBLIC_AMA_ANSWERS.local.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("!PUBLIC_AMA_ANSWERS.template.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/validate_public_ama_queue.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/export_public_ama_answers.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/build_public_site.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/build_public_site.js --check", PAGES_YML.read_text(encoding="utf-8"))
        self.assertIn("PUBLIC_AMA_QUEUE.template.json", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))
        self.assertIn("PUBLIC_AMA_ANSWERS.template.json", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))
        self.assertIn("public-ama-answers.js", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
