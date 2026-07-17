from __future__ import annotations

import json
import hashlib
import pathlib
import shutil
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
REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1"


def review_document_digest(canonical_path: str, contents: str) -> str:
    normalized = contents.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath={canonical_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def read_utf8_exact(file_path: pathlib.Path) -> str:
    return file_path.read_bytes().decode("utf-8")


def run_validator(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(VALIDATOR.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def ready_payload(
    document_root: pathlib.Path = ROOT,
    overrides: dict[str, pathlib.Path] | None = None,
) -> dict[str, object]:
    payload = json.loads(TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    overrides = overrides or {}
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
            canonical_path: review_document_digest(
                canonical_path,
                read_utf8_exact(overrides.get(canonical_path, document_root / canonical_path)),
            )
            for canonical_path in gate["documentsReviewed"]
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


def copy_review_documents(destination: pathlib.Path) -> None:
    template = json.loads(TEMPLATE.read_text(encoding="utf-8"))
    for gate in template["reviewGates"].values():
        for canonical_path in gate["documentsReviewed"]:
            shutil.copyfile(ROOT / canonical_path, destination / canonical_path)


def write_payload(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


def write_public_config(file_path: pathlib.Path, review_dates: dict[str, str]) -> None:
    file_path.write_text(
        f"window.PUBLIC_ORDER_CONFIG = {json.dumps(review_dates, ensure_ascii=False)};\n",
        encoding="utf-8",
    )


class LiveReviewClosureTests(unittest.TestCase):
    def test_template_shape_and_template_validator(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 2)
        self.assertEqual(data["mode"], "template")
        self.assertIn("reviewGates", data)
        self.assertIn("publicConfigPatch", data)
        self.assertFalse(data["publicConfigPatch"]["liveMode"])
        for gate in data["reviewGates"].values():
            self.assertEqual(set(gate["documentDigests"]), set(gate["documentsReviewed"]))
            self.assertTrue(all(value == "" for value in gate["documentDigests"].values()))

        result = run_validator("--template-ok")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_template_cannot_pass_ready_gate(self) -> None:
        result = run_validator(str(TEMPLATE), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("non-evidence", result.stderr)
        self.assertIn("reviewer is required", result.stderr)

    def test_ready_payload_passes_ready_gate(self) -> None:
        result = run_validator(str(write_payload(ready_payload())), "--require-ready")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("ready gate passed", result.stdout)

    def test_local_draft_cannot_pass_ready_gate(self) -> None:
        payload = ready_payload()
        payload["mode"] = "local-draft"

        result = run_validator(str(write_payload(payload)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("non-evidence", result.stderr)

    def test_ready_gate_recomputes_documents_and_rejects_content_tamper(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            document_root = pathlib.Path(tmp)
            copy_review_documents(document_root)
            payload_path = write_payload(ready_payload(document_root))

            passing = run_validator(
                str(payload_path), "--require-ready", "--document-root", str(document_root)
            )
            self.assertEqual(passing.returncode, 0, passing.stderr)

            terms = document_root / "TERMOS.md"
            terms.write_bytes(terms.read_bytes() + b"\nMaterial review drift.\n")
            tampered = run_validator(
                str(payload_path), "--require-ready", "--document-root", str(document_root)
            )
            self.assertNotEqual(tampered.returncode, 0)
            self.assertIn("does not match canonical document TERMOS.md", tampered.stderr)

    def test_ready_gate_rejects_path_substitution_and_extra_digest(self) -> None:
        substituted = ready_payload()
        terms_digests = substituted["reviewGates"]["terms"]["documentDigests"]
        terms_digests["legal/TERMOS.md"] = terms_digests.pop("TERMOS.md")
        substituted["reviewGates"]["terms"]["documentsReviewed"][0] = "legal/TERMOS.md"

        result = run_validator(str(write_payload(substituted)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("documentsReviewed must contain exactly", result.stderr)
        self.assertIn("canonical path keys", result.stderr)

        extra = ready_payload()
        extra["reviewGates"]["privacy"]["documentDigests"]["COPY.md"] = "0" * 64
        result = run_validator(str(write_payload(extra)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("canonical path keys", result.stderr)

    def test_ready_gate_rejects_missing_and_malformed_digest(self) -> None:
        missing = ready_payload()
        del missing["reviewGates"]["aiHandoff"]["documentDigests"]["AI_LEGAL_HANDOFF.md"]

        result = run_validator(str(write_payload(missing)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("canonical path keys", result.stderr)

        malformed = ready_payload()
        malformed["reviewGates"]["brazilCompliance"]["documentDigests"]["BRAZIL_COMPLIANCE.md"] = "ABC123"
        result = run_validator(str(write_payload(malformed)), "--require-ready")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("lowercase SHA-256 hex digest", result.stderr)

    def test_document_digests_normalize_bom_and_line_endings(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            document_root = pathlib.Path(tmp)
            copy_review_documents(document_root)
            for document in document_root.glob("*.md"):
                normalized = read_utf8_exact(document).removeprefix("\ufeff")
                normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
                document.write_bytes(normalized.encode("utf-8"))
            payload_path = write_payload(ready_payload(document_root))

            terms = document_root / "TERMOS.md"
            normalized_terms = read_utf8_exact(terms)
            terms.write_bytes(("\ufeff" + normalized_terms.replace("\n", "\r\n")).encode("utf-8"))
            result = run_validator(
                str(payload_path), "--require-ready", "--document-root", str(document_root)
            )

            self.assertEqual(result.returncode, 0, result.stderr)

    def test_terms_and_privacy_document_overrides_keep_canonical_hash_paths(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            terms = folder / "reviewed-terms.txt"
            privacy = folder / "reviewed-privacy.txt"
            terms.write_text("Reviewed terms copy.\n", encoding="utf-8")
            privacy.write_text("Reviewed privacy copy.\n", encoding="utf-8")
            overrides = {"TERMOS.md": terms, "AVISO_DE_PRIVACIDADE.md": privacy}
            payload_path = write_payload(ready_payload(overrides=overrides))

            result = run_validator(
                str(payload_path),
                "--require-ready",
                "--terms-doc",
                str(terms),
                "--privacy-doc",
                str(privacy),
            )

            self.assertEqual(result.returncode, 0, result.stderr)

    def test_ready_gate_can_require_matching_public_config_dates(self) -> None:
        payload = ready_payload()
        payload_path = write_payload(payload)
        with tempfile.TemporaryDirectory() as tmp:
            public_config = pathlib.Path(tmp) / "public-config.js"
            review_dates = {
                field: payload["publicConfigPatch"][field]
                for field in (
                    "termsReviewedAt",
                    "privacyReviewedAt",
                    "brazilComplianceReviewedAt",
                    "aiHandoffReviewedAt",
                )
            }
            write_public_config(public_config, review_dates)

            result = run_validator(
                "--public-config", str(public_config), str(payload_path), "--require-ready"
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("ready gate passed", result.stdout)

    def test_ready_gate_rejects_public_config_date_mismatch(self) -> None:
        payload = ready_payload()
        payload_path = write_payload(payload)
        with tempfile.TemporaryDirectory() as tmp:
            public_config = pathlib.Path(tmp) / "public-config.js"
            review_dates = {
                field: payload["publicConfigPatch"][field]
                for field in (
                    "termsReviewedAt",
                    "privacyReviewedAt",
                    "brazilComplianceReviewedAt",
                    "aiHandoffReviewedAt",
                )
            }
            review_dates["privacyReviewedAt"] = "2026-06-11"
            write_public_config(public_config, review_dates)

            result = run_validator(
                str(payload_path), "--require-ready", "--public-config", str(public_config)
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("privacyReviewedAt must exactly match public config", result.stderr)

    def test_ready_gate_fails_closed_on_malformed_public_config(self) -> None:
        payload_path = write_payload(ready_payload())
        with tempfile.TemporaryDirectory() as tmp:
            public_config = pathlib.Path(tmp) / "public-config.js"
            public_config.write_text("window.PUBLIC_ORDER_CONFIG = ;\n", encoding="utf-8")

            result = run_validator(
                str(payload_path), "--require-ready", "--public-config", str(public_config)
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("could not load public config", result.stderr)

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
