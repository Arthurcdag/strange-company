from __future__ import annotations

import json
import hashlib
import pathlib
import subprocess
import tempfile
import textwrap
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "render_live_review_public_config_patch.js"
TEMPLATE = ROOT / "LIVE_REVIEW_CLOSURE.template.json"
README = ROOT / "README.md"
HUMAN_REVIEW_PACKET = ROOT / "HUMAN_REVIEW_PACKET.md"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
BUILD_PUBLIC_SITE = ROOT / "tools" / "build_public_site.js"
REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1"


def review_document_digest(canonical_path: str) -> str:
    text = (ROOT / canonical_path).read_text(encoding="utf-8")
    normalized = text.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath={canonical_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def run_renderer(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(SCRIPT.relative_to(ROOT)), *args],
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
        gate["documentDigests"] = {
            document: review_document_digest(document)
            for document in gate["documentsReviewed"]
        }
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


def write_json(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


def write_public_config(live_mode: str = "false") -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False)
    tmp.write(
        textwrap.dedent(
            f"""
            window.PUBLIC_ORDER_CONFIG = {{
              operatorName: "Strange Works Studio",
              jurisdiction: "BR",
              aiGeneratedLegalDocsRequireHumanReview: true,
              termsReviewedAt: "",
              privacyReviewedAt: "",
              brazilComplianceReviewedAt: "",
              aiHandoffReviewedAt: "",
              liveMode: {live_mode},
              services: [{{ id: "proof-sprint", title: "Proof sprint", price: 750 }}]
            }};
            """
        )
    )
    tmp.close()
    return pathlib.Path(tmp.name)


class RenderLiveReviewPublicConfigPatchTests(unittest.TestCase):
    def test_ready_packet_renders_public_safe_json_plan(self) -> None:
        result = run_renderer(str(write_json(ready_payload())), "--public-config", str(write_public_config()), "--json")

        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["system"], "LIVE_REVIEW_PUBLIC_CONFIG_PATCH")
        self.assertTrue(data["previewOnly"])
        self.assertFalse(data["mutatesFiles"])
        self.assertTrue(data["liveModeRemainsFalse"])
        self.assertIn('termsReviewedAt: "2026-06-12"', data["replacementSnippet"])
        self.assertIn("liveMode: false", data["replacementSnippet"])
        self.assertIn("node tools/preflight_public_launch.js", data["nextValidation"])
        self.assertIn(
            "node tools/bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json",
            data["nextValidation"],
        )

    def test_renderer_rejects_template_packet(self) -> None:
        result = run_renderer(str(TEMPLATE), "--public-config", str(write_public_config()))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("packet is not ready", result.stderr)

    def test_renderer_rejects_current_live_mode_true(self) -> None:
        result = run_renderer(str(write_json(ready_payload())), "--public-config", str(write_public_config("true")))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("current public-config.js has liveMode true", result.stderr)

    def test_docs_and_ci_reference_renderer(self) -> None:
        self.assertIn("tools/render_live_review_public_config_patch.js", README.read_text(encoding="utf-8"))
        self.assertIn("tools/render_live_review_public_config_patch.js", HUMAN_REVIEW_PACKET.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/render_live_review_public_config_patch.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("tools/render_live_review_public_config_patch.js", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
