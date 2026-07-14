from __future__ import annotations

import copy
import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]

READ_ME = ROOT / "README.md"
HUMAN_REVENUE = ROOT / "HUMAN_REVENUE_INSTRUCTIONS.md"
EVIDENCE_PACKET = ROOT / "REVENUE_SETUP_EVIDENCE_PACKET.md"
REVENUE_SETUP_TEMPLATE = ROOT / "REVENUE_SETUP_EVIDENCE_INDEX.template.json"
VALIDATOR = ROOT / "tools" / "validate_revenue_setup_evidence_index.js"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
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


def valid_evidence_payload() -> dict[str, object]:
    payload = json.loads(REVENUE_SETUP_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["operator"] = {
        "responsibleOperator": "ops",
        "legalBusinessName": "Strange Works Studio",
        "businessAddressForInvoices": "Example Street, 1",
        "supportOwner": "Support",
        "accountingOwner": "Accountant",
        "lgpdPrivacyOwner": "Privacy Officer",
        "paymentReconciliationOwner": "Finance",
        "refundOwner": "Support",
        "dailyInboxCheckTime": "09:00",
    }
    payload["entity"] = {
        "entityEvidenceId": "entity-001",
        "cnpjOrRoute": "CNPJ-ROUTE-001",
        "reviewerName": "Founder",
        "reviewDate": "2026-06-10",
        "allowedToInvoiceServices": True,
        "blockers": "no known blockers",
        "verified": True,
    }
    payload["tax"] = {
        "taxEvidenceId": "tax-001",
        "taxRegime": "Simples Nacional",
        "cnae": "6201-5/02",
        "nfseRoute": "municipal",
        "municipalRegistrationNeeded": True,
        "fiscalDocumentOwner": "accountant",
        "testNfseOrReceiptStatus": "test done",
        "accountantReviewedAt": "2026-06-01",
        "monthlyReconciliationOwner": "Accountant",
        "verified": True,
    }
    payload["payment"] = {
        "paymentEvidenceId": "pay-001",
        "provider": "Stripe",
        "businessAccountName": "Strange Works Studio",
        "payoutDestinationVerified": True,
        "testPaymentId": "pi_test_123",
        "testPayoutStatus": "ok",
        "refundTestOrProcedure": "test chargeback script",
        "chargebackOrDisputeProcedure": "manual dispute tracker",
        "feesReviewed": True,
        "reconciliationOwner": "Finance",
        "dashboardAllowlistHostsConfirmed": True,
        "verified": True,
    }
    payload["support"] = {
        "supportEvidenceId": "support-001",
        "supportEmail": "support@example.com",
        "testSentAt": "2026-06-01",
        "testReceivedAt": "2026-06-01",
        "dailyCheckTime": "09:00",
        "incidentOwner": "Support",
        "refundOwner": "Support",
        "privacyOwner": "Privacy Officer",
        "verified": True,
    }
    payload["privacy"] = {
        "privacyEvidenceId": "privacy-001",
        "privacyReviewedAt": "2026-06-01",
        "lgpdContact": "privacy@example.com",
        "processorListLocation": "internal doc",
        "retentionDecision": "90 days",
        "rightsRequestOwner": "Privacy Officer",
        "sensitiveDataBoundaryConfirmed": True,
        "verified": True,
    }
    payload["terms"] = {
        "termsEvidenceId": "terms-001",
        "termsReviewedAt": "2026-06-01",
        "reviewer": "Reviewer",
        "refundPath": "Cancel anytime before delivery",
        "cancellationPath": "Case by case",
        "customerType": "private / B2B",
        "offerScopeConfirmed": True,
        "verified": True,
    }
    payload["ledger"] = {
        "ledgerEvidenceId": "ledger-001",
        "googleFormUrl": "https://docs.google.com/forms/d/e/example/viewform",
        "googleSheetUrl": "https://docs.google.com/spreadsheets/d/example",
        "testSubmissionId": "sub-001",
        "tabsVerified": True,
        "columnNamesVerified": True,
        "allowedStatusValuesVerified": True,
        "owner": "Ops",
        "verified": True,
    }
    payload["publicConfig"] = {
        "operatorName": "Strange Works Studio",
        "jurisdiction": "BR",
        "supportEmail": "support@example.com",
        "googleFormUrl": "https://docs.google.com/forms/d/e/example/viewform",
        "supportInboxVerified": True,
        "googleFormVerified": True,
        "termsReviewedAt": "2026-06-01",
        "privacyReviewedAt": "2026-06-01",
        "brazilComplianceReviewedAt": "2026-06-01",
        "aiHandoffReviewedAt": "2026-06-01",
        "liveMode": False,
    }
    payload["attestation"] = {
        "operator": "Ops",
        "reviewedAt": "2026-06-01",
        "noSecretsInRepo": True,
        "strangeCompanyRemainsSealed": True,
        "satelliteIsRevenueOperator": True,
        "aiDidNotApproveLegalTaxPaymentOrPrivacy": True,
    }
    return payload


def write_payload(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


def write_public_config(**overrides: object) -> pathlib.Path:
    config: dict[str, object] = {
        "operatorName": "Strange Works Studio",
        "jurisdiction": "BR",
        "supportEmail": "support@example.com",
        "googleFormUrl": "https://docs.google.com/forms/d/e/example/viewform",
        "supportInboxVerified": True,
        "googleFormVerified": True,
        "termsReviewedAt": "2026-06-01",
        "privacyReviewedAt": "2026-06-01",
        "brazilComplianceReviewedAt": "2026-06-01",
        "aiHandoffReviewedAt": "2026-06-01",
        "liveMode": False,
    }
    config.update(overrides)
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False)
    tmp.write(f"window.PUBLIC_ORDER_CONFIG = {json.dumps(config)};\n")
    tmp.close()
    return pathlib.Path(tmp.name)


class RevenueSetupEvidenceIndexTests(unittest.TestCase):
    def test_required_files_exist(self) -> None:
        for path in (REVENUE_SETUP_TEMPLATE, READ_ME, HUMAN_REVENUE, EVIDENCE_PACKET, VALIDATOR, VALIDATE_WORKFLOW, PAGES_YML):
            with self.subTest(file=path.name):
                self.assertTrue(path.exists(), f"missing {path.name}")

    def test_template_shape(self) -> None:
        data = json.loads(REVENUE_SETUP_TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "template")
        self.assertIn("entity", data)
        self.assertIn("tax", data)
        self.assertIn("payment", data)
        self.assertIn("support", data)
        self.assertIn("privacy", data)
        self.assertIn("terms", data)
        self.assertIn("ledger", data)
        self.assertIn("attestation", data)
        self.assertIn("publicConfig", data)

    def test_template_validator_passes(self) -> None:
        result = run_validator("--template-ok")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_require_entity_gate_fails_on_template(self) -> None:
        result = run_validator(str(REVENUE_SETUP_TEMPLATE), "--require-entity")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("is required", result.stderr)

    def test_all_gates_pass_on_complete_payload(self) -> None:
        with tempfile.TemporaryDirectory() as _tmp:
            payload = write_payload(valid_evidence_payload())
            result = run_validator(
                str(payload),
                "--require-all",
                "--public-config",
                str(write_public_config()),
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("all gates are validated", result.stdout)

    def test_require_all_fails_closed_without_public_config(self) -> None:
        result = run_validator(str(write_payload(valid_evidence_payload())), "--require-all")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("require --public-config <path>", result.stderr)

    def test_require_all_rejects_non_local_modes(self) -> None:
        for mode in ("template", "local-draft", "simulation"):
            with self.subTest(mode=mode):
                payload = valid_evidence_payload()
                payload["mode"] = mode
                result = run_validator(
                    str(write_payload(payload)),
                    "--require-all",
                    "--public-config",
                    str(write_public_config()),
                )

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("packet mode must be local", result.stderr)

    def test_every_individual_evidence_gate_requires_local_mode(self) -> None:
        config_sensitive_gates = {
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
        }
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
        )
        for gate in gates:
            extra = (
                "--public-config",
                str(write_public_config()),
            ) if gate in config_sensitive_gates else ()
            for mode in ("simulation", "template", "local-draft"):
                with self.subTest(gate=gate, mode=mode):
                    payload = valid_evidence_payload()
                    payload["mode"] = mode
                    result = run_validator(str(write_payload(payload)), gate, *extra)

                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn("packet mode must be local", result.stderr)

            with self.subTest(gate=gate, mode="local"):
                result = run_validator(
                    str(write_payload(valid_evidence_payload())),
                    gate,
                    *extra,
                )
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_template_diagnostics_remain_available_for_non_local_modes(self) -> None:
        for mode in ("template", "local-draft", "simulation"):
            with self.subTest(mode=mode):
                payload = valid_evidence_payload()
                payload["mode"] = mode
                result = run_validator(str(write_payload(payload)), "--template-ok")

                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn("template validation passed", result.stdout)

    def test_config_sensitive_individual_gates_require_current_config_binding(self) -> None:
        for gate in (
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
        ):
            with self.subTest(gate=gate, binding="missing"):
                result = run_validator(str(write_payload(valid_evidence_payload())), gate)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("require --public-config <path>", result.stderr)

            with self.subTest(gate=gate, binding="stale"):
                result = run_validator(
                    str(write_payload(valid_evidence_payload())),
                    gate,
                    "--public-config",
                    str(write_public_config(supportEmail="changed@example.com")),
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("must match the current public-config.js value", result.stderr)

    def test_payment_gate_requires_verified_flags(self) -> None:
        payload = valid_evidence_payload()
        payload["payment"]["verified"] = False
        payload_path = write_payload(payload)
        result = run_validator(str(payload_path), "--require-payment")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("must be true to pass this readiness gate", result.stderr)

    def test_every_individual_gate_requires_no_secrets_attestation(self) -> None:
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
        )
        for gate in gates:
            with self.subTest(gate=gate):
                payload = valid_evidence_payload()
                payload["attestation"]["noSecretsInRepo"] = False
                result = run_validator(str(write_payload(payload)), gate)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("attestation.noSecretsInRepo must be true", result.stderr)

    def test_legal_tax_payment_and_privacy_gates_require_human_approval_attestation(self) -> None:
        for gate in ("--require-tax", "--require-payment", "--require-privacy", "--require-terms"):
            with self.subTest(gate=gate):
                payload = valid_evidence_payload()
                payload["attestation"]["aiDidNotApproveLegalTaxPaymentOrPrivacy"] = False
                extra = (
                    "--public-config",
                    str(write_public_config()),
                ) if gate in ("--require-privacy", "--require-terms") else ()
                result = run_validator(str(write_payload(payload)), gate, *extra)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(
                    "attestation.aiDidNotApproveLegalTaxPaymentOrPrivacy must be true",
                    result.stderr,
                )

    def test_every_evidence_gate_rejects_contradictory_lane_attestations(self) -> None:
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        )
        config_sensitive_gates = {
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        }
        for gate in gates:
            for field in ("strangeCompanyRemainsSealed", "satelliteIsRevenueOperator"):
                with self.subTest(gate=gate, field=field):
                    payload = valid_evidence_payload()
                    payload["attestation"][field] = False
                    extra = (
                        "--public-config",
                        str(write_public_config()),
                    ) if gate in config_sensitive_gates else ()
                    result = run_validator(str(write_payload(payload)), gate, *extra)

                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(f"attestation.{field} must be true", result.stderr)

    def test_every_evidence_gate_requires_pre_live_public_snapshot(self) -> None:
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        )
        config_sensitive_gates = {
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        }
        for gate in gates:
            with self.subTest(gate=gate):
                payload = valid_evidence_payload()
                payload["publicConfig"]["liveMode"] = True
                extra = (
                    "--public-config",
                    str(write_public_config(liveMode=True)),
                ) if gate in config_sensitive_gates else ()
                result = run_validator(str(write_payload(payload)), gate, *extra)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("publicConfig.liveMode must be false", result.stderr)

    def test_dated_individual_evidence_gates_reject_future_dates(self) -> None:
        cases = (
            ("--require-entity", "entity", "reviewDate", None),
            ("--require-tax", "tax", "accountantReviewedAt", None),
            ("--require-support", "support", "testSentAt", None),
            ("--require-support", "support", "testReceivedAt", None),
            ("--require-privacy", "privacy", "privacyReviewedAt", "privacyReviewedAt"),
            ("--require-terms", "terms", "termsReviewedAt", "termsReviewedAt"),
        )
        for gate, section, field, public_field in cases:
            with self.subTest(gate=gate, field=f"{section}.{field}"):
                payload = valid_evidence_payload()
                payload[section][field] = "2999-12-31"
                overrides = {}
                if public_field:
                    payload["publicConfig"][public_field] = "2999-12-31"
                    overrides[public_field] = "2999-12-31"
                extra = (
                    "--public-config",
                    str(write_public_config(**overrides)),
                ) if gate in ("--require-support", "--require-privacy", "--require-terms") else ()

                result = run_validator(str(write_payload(payload)), gate, *extra)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(f"sections.{section}.{field} must not be in the future", result.stderr)

    def test_every_evidence_gate_rejects_future_attestation_date(self) -> None:
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        )
        config_sensitive_gates = {
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        }
        for gate in gates:
            with self.subTest(gate=gate):
                payload = valid_evidence_payload()
                payload["attestation"]["reviewedAt"] = "2999-12-31"
                extra = (
                    "--public-config",
                    str(write_public_config()),
                ) if gate in config_sensitive_gates else ()

                result = run_validator(str(write_payload(payload)), gate, *extra)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(
                    "sections.attestation.reviewedAt must not be in the future",
                    result.stderr,
                )

    def test_every_evidence_gate_requires_operator_ownership_fields(self) -> None:
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        )
        config_sensitive_gates = {
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        }
        for gate in gates:
            with self.subTest(gate=gate):
                payload = valid_evidence_payload()
                payload["operator"] = {}
                extra = (
                    "--public-config",
                    str(write_public_config()),
                ) if gate in config_sensitive_gates else ()

                result = run_validator(str(write_payload(payload)), gate, *extra)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("sections.operator.responsibleOperator is required", result.stderr)
                self.assertIn("sections.operator.paymentReconciliationOwner is required", result.stderr)

    def test_every_evidence_gate_requires_attestation_owner_and_review_date(self) -> None:
        gates = (
            "--require-entity",
            "--require-tax",
            "--require-payment",
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        )
        config_sensitive_gates = {
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        }
        for gate in gates:
            with self.subTest(gate=gate):
                payload = valid_evidence_payload()
                payload["attestation"]["operator"] = ""
                payload["attestation"]["reviewedAt"] = ""
                extra = (
                    "--public-config",
                    str(write_public_config()),
                ) if gate in config_sensitive_gates else ()

                result = run_validator(str(write_payload(payload)), gate, *extra)

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("sections.attestation.operator is required", result.stderr)
                self.assertIn("sections.attestation.reviewedAt must be YYYY-MM-DD", result.stderr)

    def test_require_all_rejects_future_dated_revenue_evidence(self) -> None:
        cases = (
            ("entity", "reviewDate", None),
            ("tax", "accountantReviewedAt", None),
            ("support", "testSentAt", None),
            ("support", "testReceivedAt", None),
            ("privacy", "privacyReviewedAt", "privacyReviewedAt"),
            ("terms", "termsReviewedAt", "termsReviewedAt"),
        )
        for section, field, public_field in cases:
            with self.subTest(field=f"{section}.{field}"):
                payload = valid_evidence_payload()
                payload[section][field] = "2999-12-31"
                overrides = {}
                if public_field:
                    payload["publicConfig"][public_field] = "2999-12-31"
                    overrides[public_field] = "2999-12-31"

                result = run_validator(
                    str(write_payload(payload)),
                    "--require-all",
                    "--public-config",
                    str(write_public_config(**overrides)),
                )

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(f"sections.{section}.{field} must not be in the future", result.stderr)

    def test_config_bound_gates_reject_future_public_review_dates(self) -> None:
        gates = (
            "--require-support",
            "--require-privacy",
            "--require-terms",
            "--require-ledger",
            "--require-all",
        )
        public_fields = (
            "termsReviewedAt",
            "privacyReviewedAt",
            "brazilComplianceReviewedAt",
            "aiHandoffReviewedAt",
        )
        for gate in gates:
            for field in public_fields:
                with self.subTest(gate=gate, field=field):
                    payload = valid_evidence_payload()
                    payload["publicConfig"][field] = "2999-12-31"
                    result = run_validator(
                        str(write_payload(payload)),
                        gate,
                        "--public-config",
                        str(write_public_config(**{field: "2999-12-31"})),
                    )

                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(f"publicConfig.{field} must not be in the future", result.stderr)

    def test_all_gate_can_bind_to_the_current_public_config(self) -> None:
        payload = write_payload(valid_evidence_payload())

        matching = run_validator(
            str(payload),
            "--require-all",
            "--public-config",
            str(write_public_config()),
        )
        stale = run_validator(
            str(payload),
            "--require-all",
            "--public-config",
            str(write_public_config(supportEmail="changed@example.com")),
        )

        self.assertEqual(matching.returncode, 0, matching.stderr)
        self.assertNotEqual(stale.returncode, 0)
        self.assertIn(
            "publicConfig.supportEmail must match the current public-config.js value",
            stale.stderr,
        )

    def test_all_gate_rejects_stale_internal_evidence_with_current_public_snapshot(self) -> None:
        cases = (
            (
                "support email",
                "supportEmail",
                "changed@example.com",
                "support.supportEmail must match publicConfig.supportEmail",
            ),
            (
                "Google Form URL",
                "googleFormUrl",
                "https://docs.google.com/forms/d/e/changed/viewform",
                "ledger.googleFormUrl must match publicConfig.googleFormUrl",
            ),
            (
                "terms review date",
                "termsReviewedAt",
                "2026-06-02",
                "terms.termsReviewedAt must match publicConfig.termsReviewedAt",
            ),
            (
                "privacy review date",
                "privacyReviewedAt",
                "2026-06-03",
                "privacy.privacyReviewedAt must match publicConfig.privacyReviewedAt",
            ),
            (
                "support verification flag",
                "supportInboxVerified",
                False,
                "support.verified must match publicConfig.supportInboxVerified",
            ),
            (
                "Google Form verification flag",
                "googleFormVerified",
                False,
                "ledger.verified must match publicConfig.googleFormVerified",
            ),
        )

        for label, public_field, new_value, expected_error in cases:
            with self.subTest(field=label):
                payload = valid_evidence_payload()
                payload["publicConfig"][public_field] = new_value
                result = run_validator(
                    str(write_payload(payload)),
                    "--require-all",
                    "--public-config",
                    str(write_public_config(**{public_field: new_value})),
                )

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(expected_error, result.stderr)

    def test_ledger_gate_checks_urls(self) -> None:
        payload = valid_evidence_payload()
        payload["ledger"]["googleFormUrl"] = "https://example.com/not-google-form"
        payload_path = write_payload(payload)
        result = run_validator(str(payload_path), "--require-ledger")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Google Form URL", result.stderr)

    def test_docs_and_workflow_references(self) -> None:
        self.assertIn("tools/draft_revenue_setup_evidence_index.js", READ_ME.read_text(encoding="utf-8"))
        self.assertIn("tools/validate_revenue_setup_evidence_index.js", READ_ME.read_text(encoding="utf-8"))
        self.assertIn("tools/draft_revenue_setup_evidence_index.js", HUMAN_REVENUE.read_text(encoding="utf-8"))
        self.assertIn("tools/validate_revenue_setup_evidence_index.js", HUMAN_REVENUE.read_text(encoding="utf-8"))
        self.assertIn("REVENUE_SETUP_EVIDENCE_INDEX.template.json", EVIDENCE_PACKET.read_text(encoding="utf-8"))
        self.assertIn("tools/validate_revenue_setup_evidence_index.js --template-ok", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/build_public_site.js --check", PAGES_YML.read_text(encoding="utf-8"))
        self.assertIn("tools/draft_revenue_setup_evidence_index.js", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))
        self.assertIn("tools/validate_revenue_setup_evidence_index.js", BUILD_PUBLIC_SITE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
