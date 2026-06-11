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
            result = run_validator(str(payload), "--require-all")
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("all gates are validated", result.stdout)

    def test_payment_gate_requires_verified_flags(self) -> None:
        payload = valid_evidence_payload()
        payload["payment"]["verified"] = False
        payload_path = write_payload(payload)
        result = run_validator(str(payload_path), "--require-payment")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("must be true to pass this readiness gate", result.stderr)

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
        self.assertIn("tools/draft_revenue_setup_evidence_index.js", PAGES_YML.read_text(encoding="utf-8"))
        self.assertIn("tools/validate_revenue_setup_evidence_index.js", PAGES_YML.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
