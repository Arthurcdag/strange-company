from __future__ import annotations

import json
import hashlib
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "local_evidence_status.js"
LIVE_REVIEW_TEMPLATE = ROOT / "LIVE_REVIEW_CLOSURE.template.json"
README = ROOT / "README.md"
EVOLUTION_LOG = ROOT / "EVOLUTION_LOG.md"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
PAGES_WORKFLOW = ROOT / ".github" / "workflows" / "pages.yml"
BUILD_PUBLIC_SITE = ROOT / "tools" / "build_public_site.js"
REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1"
REVIEW_DATE_FIELDS = (
    "termsReviewedAt",
    "privacyReviewedAt",
    "brazilComplianceReviewedAt",
    "aiHandoffReviewedAt",
)


def review_document_digest(canonical_path: str) -> str:
    text = (ROOT / canonical_path).read_text(encoding="utf-8")
    normalized = text.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath={canonical_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def run_status(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(SCRIPT.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def live_review_ready_payload() -> dict[str, object]:
    payload = json.loads(LIVE_REVIEW_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    for gate_id, field in (
        ("terms", "termsReviewedAt"),
        ("privacy", "privacyReviewedAt"),
        ("brazilCompliance", "brazilComplianceReviewedAt"),
        ("aiHandoff", "aiHandoffReviewedAt"),
    ):
        gate = payload["reviewGates"][gate_id]
        gate["reviewer"] = f"{gate_id}-reviewer"
        gate["reviewedAt"] = "2026-07-01"
        gate["humanApprovedForPublicConfig"] = True
        gate["aiOnlyApproval"] = False
        gate["documentDigests"] = {
            document: review_document_digest(document)
            for document in gate["documentsReviewed"]
        }
        payload["publicConfigPatch"][field] = "2026-07-01"

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
        reviewedAt="2026-07-01",
        noPrivateEvidenceInRepo=True,
        noLegalTaxPrivacyApprovalFromAi=True,
        liveModeStaysFalse=True,
        externalLivePacketStillRequired=True,
        revenuePaymentFiscalEvidenceStillRequired=True,
    )
    return payload


def write_public_config(path: pathlib.Path, dates: dict[str, str]) -> pathlib.Path:
    config = {
        "jurisdiction": "BR",
        "aiGeneratedLegalDocsRequireHumanReview": True,
        **dates,
        "liveMode": False,
    }
    path.write_text(
        f"window.PUBLIC_ORDER_CONFIG = {json.dumps(config)};\n",
        encoding="utf-8",
    )
    return path


class LocalEvidenceStatusTests(unittest.TestCase):
    def test_missing_lanes_report_public_safe_status(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            result = run_status("--json", "--local-dir", workspace)

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            self.assertEqual(data["system"], "STRANGE_COMPANY_LOCAL_EVIDENCE_STATUS")
            self.assertTrue(data["publicSafe"])
            self.assertTrue(data["allTemplatesValid"])
            self.assertEqual(data["readyLaneCount"], 0)
            self.assertEqual(data["missingLaneCount"], data["laneCount"])
            self.assertNotIn(workspace, result.stdout)

            lane = next(item for item in data["lanes"] if item["id"] == "liveReviewClosure")
            self.assertEqual(lane["status"], "missing")
            self.assertEqual(lane["phase"], "missing")
            self.assertFalse(lane["ready"])
            self.assertFalse(lane["finalReady"])
            self.assertIn("draft_live_review_closure.js", lane["commands"]["draft"])
            self.assertIn("--require-ready", lane["commands"]["validateDocuments"])
            self.assertNotIn("--public-config", lane["commands"]["validateDocuments"])
            self.assertIn(
                "--require-ready --public-config public-config.js",
                lane["commands"]["validateConfigBinding"],
            )

    def test_invalid_live_review_closure_has_explicit_invalid_phase(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            target = pathlib.Path(workspace) / "LIVE_REVIEW_CLOSURE.local.json"
            target.write_text("{", encoding="utf-8")

            result = run_status("--json", "--local-dir", workspace)

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            lane = next(item for item in data["lanes"] if item["id"] == "liveReviewClosure")
            self.assertEqual(lane["status"], "invalid")
            self.assertEqual(lane["phase"], "invalid")
            self.assertFalse(lane["ready"])
            self.assertFalse(lane["finalReady"])
            self.assertNotIn("could not read JSON", result.stdout)

    def test_document_stale_live_review_closure_is_invalid(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            workspace_path = pathlib.Path(workspace)
            payload = live_review_ready_payload()
            payload["reviewGates"]["terms"]["documentDigests"]["TERMOS.md"] = "0" * 64
            (workspace_path / "LIVE_REVIEW_CLOSURE.local.json").write_text(
                json.dumps(payload, indent=2),
                encoding="utf-8",
            )

            result = run_status("--json", "--local-dir", workspace)

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            lane = next(item for item in data["lanes"] if item["id"] == "liveReviewClosure")
            self.assertEqual(lane["status"], "invalid")
            self.assertEqual(lane["phase"], "invalid")
            self.assertFalse(lane["ready"])
            self.assertEqual(data["invalidLaneCount"], 1)

    def test_document_ready_live_review_closure_stays_unbound(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            workspace_path = pathlib.Path(workspace)
            target = pathlib.Path(workspace) / "LIVE_REVIEW_CLOSURE.local.json"
            payload = live_review_ready_payload()
            target.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            public_config = write_public_config(
                workspace_path / "public-config.js",
                {field: "" for field in REVIEW_DATE_FIELDS},
            )

            result = run_status(
                "--json",
                "--local-dir",
                workspace,
                "--public-config",
                str(public_config),
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            lane = next(item for item in data["lanes"] if item["id"] == "liveReviewClosure")
            checks = {check["id"]: check for check in lane["checks"]}
            self.assertEqual(lane["status"], "partial")
            self.assertEqual(lane["phase"], "document_ready_unbound")
            self.assertFalse(lane["ready"])
            self.assertFalse(lane["finalReady"])
            self.assertTrue(checks["document_ready"]["passed"])
            self.assertFalse(checks["config_bound_ready"]["passed"])
            self.assertFalse(checks["document_ready"]["bindsPublicConfig"])
            self.assertTrue(checks["config_bound_ready"]["bindsPublicConfig"])
            self.assertIn("Apply only the four approved review dates", lane["nextAction"])
            self.assertNotIn("terms-reviewer", result.stdout)

    def test_config_bound_live_review_closure_is_finally_ready(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            workspace_path = pathlib.Path(workspace)
            payload = live_review_ready_payload()
            target = workspace_path / "LIVE_REVIEW_CLOSURE.local.json"
            target.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            public_config = write_public_config(
                workspace_path / "public-config.js",
                {
                    field: str(payload["publicConfigPatch"][field])
                    for field in REVIEW_DATE_FIELDS
                },
            )

            result = run_status(
                "--json",
                "--local-dir",
                workspace,
                "--public-config",
                str(public_config),
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            lane = next(item for item in data["lanes"] if item["id"] == "liveReviewClosure")
            checks = {check["id"]: check for check in lane["checks"]}
            self.assertEqual(lane["status"], "ready")
            self.assertEqual(lane["phase"], "config_bound_ready")
            self.assertTrue(lane["ready"])
            self.assertTrue(lane["finalReady"])
            self.assertEqual(data["readyLaneCount"], 1)
            self.assertTrue(checks["document_ready"]["passed"])
            self.assertTrue(checks["config_bound_ready"]["passed"])
            self.assertNotIn("terms-reviewer", result.stdout)

    def test_invalid_local_packet_is_reported_without_validator_stderr(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            target = pathlib.Path(workspace) / "PUBLIC_AMA_QUEUE.local.json"
            target.write_text("{", encoding="utf-8")

            result = run_status("--json", "--local-dir", workspace)

            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            lane = next(item for item in data["lanes"] if item["id"] == "publicAmaQueue")
            self.assertEqual(lane["status"], "invalid")
            self.assertEqual(data["invalidLaneCount"], 1)
            self.assertEqual(result.stderr, "")
            self.assertNotIn("could not read JSON", result.stdout)

    def test_docs_ci_and_bundle_reference_status_tool(self) -> None:
        self.assertIn("tools/local_evidence_status.js", README.read_text(encoding="utf-8"))
        self.assertIn("Local Evidence Status Matrix", EVOLUTION_LOG.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/local_evidence_status.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/local_evidence_status.js --json", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/local_evidence_status.js --json", PAGES_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("tools/local_evidence_status.js", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
