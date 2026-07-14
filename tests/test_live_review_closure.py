from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "LIVE_REVIEW_CLOSURE.template.json"
VALIDATOR = ROOT / "tools" / "validate_live_review_closure.js"
README = ROOT / "README.md"
HUMAN_REVIEW_PACKET = ROOT / "HUMAN_REVIEW_PACKET.md"
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
    for gate_id, field in (
        ("terms", "termsReviewedAt"),
        ("privacy", "privacyReviewedAt"),
        ("brazilCompliance", "brazilComplianceReviewedAt"),
        ("aiHandoff", "aiHandoffReviewedAt"),
    ):
        gate = payload["reviewGates"][gate_id]
        gate["reviewer"] = f"{gate_id}-reviewer"
        gate["reviewedAt"] = "2026-06-12"
        gate["humanApprovedForPublicConfig"] = True
        gate["aiOnlyApproval"] = False
        payload["publicConfigPatch"][field] = "2026-06-12"

    payload["reviewGates"]["terms"].update(
        offerFlowReviewed=True,
        refundCancellationReviewed=True,
        supportFlowReviewed=True,
    )
    payload["reviewGates"]["privacy"].update(
        lgpdContactReviewed=True,
        retentionReviewed=True,
        processorsReviewed=True,
        dataSubjectRightsReviewed=True,
    )
    payload["reviewGates"]["brazilCompliance"].update(
        cnpjOrEntityRouteReviewed=True,
        fiscalReceiptRouteReviewed=True,
        paymentSupportReviewed=True,
        lgpdRouteReviewed=True,
    )
    payload["reviewGates"]["aiHandoff"].update(
        aiPreparedTextReviewed=True,
        acceptedChangedOrRejected=True,
        automatedDecisionStopRuleConfirmed=True,
    )
    payload["attestation"].update(
        operator="Operator",
        reviewedAt="2026-06-12",
        noPrivateEvidenceInRepo=True,
        noLegalTaxPrivacyApprovalFromAi=True,
        liveModeStaysFalse=True,
        externalLivePacketStillRequired=True,
        revenuePaymentFiscalEvidenceStillRequired=True,
    )
    return payload


def write_payload(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


class LiveReviewClosureTests(unittest.TestCase):
    def test_template_shape_and_template_validator(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "template")
        self.assertIn("reviewGates", data)
        self.assertIn("publicConfigPatch", data)
        self.assertFalse(data["publicConfigPatch"]["liveMode"])

        result = run_validator("--template-ok")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_template_cannot_pass_ready_gate(self) -> None:
        result = run_validator(str(TEMPLATE), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("reviewer is required", result.stderr)

    def test_ready_payload_passes_ready_gate(self) -> None:
        result = run_validator(str(write_payload(ready_payload())), "--require-ready")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("ready gate passed", result.stdout)

    def test_ready_gate_rejects_live_mode_true(self) -> None:
        payload = ready_payload()
        payload["publicConfigPatch"]["liveMode"] = True

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("liveMode must remain false", result.stderr)

    def test_ready_gate_requires_gate_date_to_match_public_patch(self) -> None:
        payload = ready_payload()
        payload["publicConfigPatch"]["termsReviewedAt"] = "2026-06-11"

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("terms.reviewedAt must match", result.stderr)

    def test_ready_gate_rejects_ai_only_approval(self) -> None:
        payload = ready_payload()
        payload["reviewGates"]["aiHandoff"]["aiOnlyApproval"] = True

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("aiOnlyApproval must remain false", result.stderr)

    def test_ready_gate_rejects_future_review_dates(self) -> None:
        payload = ready_payload()
        payload["reviewGates"]["terms"]["reviewedAt"] = "2099-01-01"
        payload["publicConfigPatch"]["termsReviewedAt"] = "2099-01-01"

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("terms.reviewedAt must not be in the future", result.stderr)
        self.assertIn("termsReviewedAt must not be in the future", result.stderr)

    def test_docs_and_ci_reference_live_review_closure(self) -> None:
        self.assertIn("LIVE_REVIEW_CLOSURE.template.json", README.read_text(encoding="utf-8"))
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", HUMAN_REVIEW_PACKET.read_text(encoding="utf-8"))
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("!LIVE_REVIEW_CLOSURE.template.json", GITIGNORE.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/validate_live_review_closure.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/validate_live_review_closure.js --template-ok", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("LIVE_REVIEW_CLOSURE.template.json", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
