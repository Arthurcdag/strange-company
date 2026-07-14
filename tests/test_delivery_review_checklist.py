from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "DELIVERY_REVIEW_CHECKLIST.template.json"
VALIDATOR = ROOT / "tools" / "validate_delivery_review_checklist.js"
README = ROOT / "README.md"
RUNBOOK = ROOT / "OPERATIONS_RUNBOOK.md"
VAU_DOC = ROOT / "VAU_COMPANY_EVOLUTION.md"
GITIGNORE = ROOT / ".gitignore"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
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


def ready_payload() -> dict[str, object]:
    payload = json.loads(TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["generatedAt"] = "2026-06-12T00:00:00.000Z"
    payload["deliveryLoop"] = {
        "serviceName": "Compliance proof sprint",
        "orderId": "order-001",
        "customerRef": "customer-redacted-001",
        "scopeEvidenceRef": "scope-001",
        "intakeAccepted": True,
        "dataBoundaryConfirmed": True,
        "aiDraftCreated": True,
        "humanReviewCompleted": True,
        "humanReviewer": "Reviewer",
        "humanReviewDate": "2026-06-12",
        "revisionsCompleted": True,
        "acceptanceCriteriaMet": True,
        "deliveryArtifactUrl": "https://example.com/delivery-artifact",
        "receiptChainUpdated": True,
        "incidentReviewCompleted": True,
        "readyForDelivery": True,
    }
    payload["evidence"] = {
        "intakePacketRef": "intake-001",
        "sourceOrderRef": "order-001",
        "draftArtifactRef": "draft-001",
        "reviewNotesRef": "review-001",
        "finalArtifactRef": "artifact-001",
        "receiptRoot": "receipt-root-001",
        "incidentIds": [],
    }
    payload["attestation"] = {
        "operator": "Operator",
        "reviewedAt": "2026-06-12",
        "noSecretsInRepo": True,
        "noCustomerPrivateDataInRepo": True,
        "aiDidNotApproveFinalDelivery": True,
        "strangeCompanyRemainsSealed": True,
        "satelliteIsDeliveryOperator": True,
    }
    return payload


def write_payload(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


class DeliveryReviewChecklistTests(unittest.TestCase):
    def test_template_shape_and_template_validator(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "template")
        self.assertIn("deliveryLoop", data)
        self.assertIn("evidence", data)
        self.assertIn("attestation", data)

        result = run_validator("--template-ok")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_template_cannot_pass_ready_gate(self) -> None:
        result = run_validator(str(TEMPLATE), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("is required", result.stderr)

    def test_ready_payload_passes_ready_gate(self) -> None:
        result = run_validator(str(write_payload(ready_payload())), "--require-ready")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("ready gate passed", result.stdout)

    def test_ready_gate_rejects_complete_non_local_checklist(self) -> None:
        payload = ready_payload()
        payload["mode"] = "simulation"

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("mode must be local", result.stderr)

    def test_ready_gate_requires_https_delivery_artifact(self) -> None:
        payload = ready_payload()
        payload["deliveryLoop"]["deliveryArtifactUrl"] = "http://example.com/not-safe"

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("https:// URL", result.stderr)

    def test_ready_gate_requires_human_review(self) -> None:
        payload = ready_payload()
        payload["deliveryLoop"]["humanReviewCompleted"] = False

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("humanReviewCompleted must be true", result.stderr)

    def test_docs_and_ci_reference_delivery_loop(self) -> None:
        self.assertIn("DELIVERY_REVIEW_LOOP.md", README.read_text(encoding="utf-8"))
        self.assertIn("DELIVERY_REVIEW_CHECKLIST.template.json", RUNBOOK.read_text(encoding="utf-8"))
        self.assertIn("tools/validate_delivery_review_checklist.js", VAU_DOC.read_text(encoding="utf-8"))
        self.assertIn("DELIVERY_REVIEW_CHECKLIST.local.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("!DELIVERY_REVIEW_CHECKLIST.template.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/validate_delivery_review_checklist.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/validate_delivery_review_checklist.js --template-ok", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("DELIVERY_REVIEW_CHECKLIST.template.json", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
