from __future__ import annotations

import json
import hashlib
import os
import pathlib
import subprocess
import tempfile
import time
import unittest
from datetime import datetime, timedelta, timezone


ROOT = pathlib.Path(__file__).resolve().parents[1]
EXPORTER = ROOT / "tools" / "export_public_live_receipt.js"
PUBLIC_RECEIPT = ROOT / "public-live-receipt.js"
EXTERNAL_TEMPLATE = ROOT / "EXTERNAL_LIVE_PACKET.template.json"
REVENUE_TEMPLATE = ROOT / "REVENUE_SETUP_EVIDENCE_INDEX.template.json"
REVIEWER_TEMPLATE = ROOT / "REVIEWER_CANDIDATE_TRACKER.template.json"
DELIVERY_TEMPLATE = ROOT / "DELIVERY_REVIEW_CHECKLIST.template.json"
CLOSURE_TEMPLATE = ROOT / "LIVE_REVIEW_CLOSURE.template.json"
ACTIVE_STATUS = "local_packet_validators_passed"
PUBLIC_REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1"
REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1"
PUBLIC_LIVE_CORE_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2"
PUBLIC_LIVE_RECEIPT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V4"
REVIEW_DOCUMENT_PATHS = (
    "TERMOS.md",
    "TERMS.md",
    "AVISO_DE_PRIVACIDADE.md",
    "PRIVACY.md",
    "BRAZIL_COMPLIANCE.md",
    "BRAZIL_COMPLIANCE_AGENTS.md",
    "CONKA8_LAW_INSTRUCTIONS.md",
    "AI_LEGAL_HANDOFF.md",
    "HUMAN_REVIEW_PACKET.md",
)


def public_review_document_digest(document_path: str, contents: str) -> str:
    normalized = contents.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{PUBLIC_REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath={document_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def review_document_digest(document_path: str, contents: str) -> str:
    normalized = contents.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath={document_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def recompute_public_receipt_digests(
    receipt: dict[str, object],
) -> dict[str, object]:
    core = json.loads(json.dumps(receipt["core"]))
    core["flags"].pop("liveMode", None)
    core_json = json.dumps(core, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    receipt["coreSha256"] = hashlib.sha256(
        f"{PUBLIC_LIVE_CORE_DIGEST_DOMAIN}\n{core_json}".encode("utf-8")
    ).hexdigest()
    envelope = {
        "schemaVersion": receipt["schemaVersion"],
        "generation": receipt["generation"],
        "mode": receipt["mode"],
        "status": receipt["status"],
        "issuedAt": receipt["issuedAt"],
        "validUntil": receipt["validUntil"],
        "core": core,
        "coreSha256": receipt["coreSha256"],
        "attestations": receipt["attestations"],
    }
    envelope_json = json.dumps(
        envelope, ensure_ascii=False, separators=(",", ":"), sort_keys=True
    )
    receipt["envelopeSha256"] = hashlib.sha256(
        f"{PUBLIC_LIVE_RECEIPT_DIGEST_DOMAIN}\n{envelope_json}".encode("utf-8")
    ).hexdigest()
    return receipt


def convert_to_legacy_v3(receipt: dict[str, object]) -> dict[str, object]:
    legacy = json.loads(json.dumps(receipt))
    legacy["schemaVersion"] = 3
    legacy.pop("generation", None)
    core = json.loads(json.dumps(legacy["core"]))
    core["flags"].pop("liveMode", None)
    envelope = {
        "schemaVersion": legacy["schemaVersion"],
        "mode": legacy["mode"],
        "status": legacy["status"],
        "issuedAt": legacy["issuedAt"],
        "validUntil": legacy["validUntil"],
        "core": core,
        "coreSha256": legacy["coreSha256"],
        "attestations": legacy["attestations"],
    }
    envelope_json = json.dumps(
        envelope, ensure_ascii=False, separators=(",", ":"), sort_keys=True
    )
    legacy["envelopeSha256"] = hashlib.sha256(
        f"STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V3\n{envelope_json}".encode("utf-8")
    ).hexdigest()
    return legacy


def run_exporter(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(EXPORTER.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def write_json(folder: pathlib.Path, name: str, payload: dict[str, object]) -> pathlib.Path:
    target = folder / name
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return target


def write_public_config(folder: pathlib.Path, config: dict[str, object]) -> pathlib.Path:
    target = folder / "public-config.js"
    target.write_text(
        f"window.PUBLIC_ORDER_CONFIG = {json.dumps(config, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    return target


def render_receipt(receipt: dict[str, object]) -> str:
    return f"window.PUBLIC_LIVE_RECEIPT = Object.freeze({json.dumps(receipt, ensure_ascii=False, indent=2)});\n"


def read_receipt(path: pathlib.Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    prefix = "window.PUBLIC_LIVE_RECEIPT = Object.freeze("
    if not text.startswith(prefix) or not text.rstrip().endswith(");"):
        raise AssertionError("unexpected public receipt JavaScript wrapper")
    return json.loads(text[len(prefix) : text.rfind(");")])


def ready_public_config(live_mode: bool = False) -> dict[str, object]:
    return {
        "operatorName": "Strange Works Studio",
        "jurisdiction": "BR",
        "complianceMode": "brazil-human-reviewed",
        "aiGeneratedLegalDocsRequireHumanReview": True,
        "supportEmail": "support@example.com",
        "googleFormUrl": "https://docs.google.com/forms/d/e/public-receipt/viewform",
        "supportInboxVerified": True,
        "googleFormVerified": True,
        "termsReviewedAt": "2026-07-10",
        "privacyReviewedAt": "2026-07-10",
        "brazilComplianceReviewedAt": "2026-07-10",
        "aiHandoffReviewedAt": "2026-07-10",
        "liveMode": live_mode,
        "services": [
            {
                "id": "proof-sprint",
                "title": "Compliance proof sprint",
                "detail": "Public scope and price.",
                "price": 750,
            },
            {
                "id": "template-pack",
                "title": "Compliance template pack",
                "detail": "Public templates.",
                "price": 79,
            },
        ],
    }


def packet_public_config(config: dict[str, object], *, live_mode: bool) -> dict[str, object]:
    return {
        "operatorName": config["operatorName"],
        "jurisdiction": config["jurisdiction"],
        "aiGeneratedLegalDocsRequireHumanReview": config["aiGeneratedLegalDocsRequireHumanReview"],
        "supportEmail": config["supportEmail"],
        "googleFormUrl": config["googleFormUrl"],
        "supportInboxVerified": config["supportInboxVerified"],
        "googleFormVerified": config["googleFormVerified"],
        "termsReviewedAt": config["termsReviewedAt"],
        "privacyReviewedAt": config["privacyReviewedAt"],
        "brazilComplianceReviewedAt": config["brazilComplianceReviewedAt"],
        "aiHandoffReviewedAt": config["aiHandoffReviewedAt"],
        "liveMode": live_mode,
    }


def ready_external_packet(config: dict[str, object]) -> dict[str, object]:
    payload = json.loads(EXTERNAL_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["support"] = {
        "supportEmail": config["supportEmail"],
        "owner": "Support operator",
        "monitoringCadence": "daily",
        "testReceivedAt": (
            datetime.now(timezone.utc) - timedelta(minutes=15)
        ).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "testRepliedAt": (
            datetime.now(timezone.utc) - timedelta(minutes=10)
        ).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "fallbackContact": "documented fallback",
        "verified": True,
    }
    payload["google"] = {
        "sheetUrl": "https://docs.google.com/spreadsheets/d/public-receipt-test",
        "formUrl": config["googleFormUrl"],
        "testResponseTimestamp": (
            datetime.now(timezone.utc) - timedelta(minutes=5)
        ).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "requestsHeaderVerified": True,
        "invoicesHeaderVerified": True,
        "leadsHeaderVerified": True,
        "formLinkedToSheet": True,
        "acceptingResponses": False,
        "verified": True,
    }
    payload["legalReview"] = {
        "termsReviewedAt": config["termsReviewedAt"],
        "privacyReviewedAt": config["privacyReviewedAt"],
        "supportReviewedAt": "2026-07-10",
        "brazilComplianceReviewedAt": config["brazilComplianceReviewedAt"],
        "aiHandoffReviewedAt": config["aiHandoffReviewedAt"],
        "reviewer": "Human reviewer",
        "documentsChanged": False,
    }
    payload["stripe"] = {
        "dashboardUrl": "https://dashboard.stripe.com/test/dashboard",
        "testInvoiceId": "PRIVATE_INVOICE_CANARY_8R",
        "testHostedInvoiceUrl": "https://invoice.stripe.com/i/test-public-receipt",
        "payoutRouteVerifiedBy": "Finance operator",
        "reconciliationOwner": "Finance operator",
        "weeklyReconciliationDay": "Monday",
        "hostedInvoicesEnabled": True,
        "verified": True,
    }
    payload["bank"] = {
        "entityName": "Strange Works Studio",
        "responsiblePartyRecorded": True,
        "bankName": "PRIVATE_BANK_CANARY_7Q",
        "bankAccountLast4": "4821",
        "stripePayoutTestStatus": "passed",
        "reconciliationOwner": "Finance operator",
        "verified": True,
    }
    payload["publicConfig"] = packet_public_config(config, live_mode=True)
    payload["attestation"] = {
        "operator": "Human operator",
        "reviewedAt": "2026-07-10",
        "noSecretsInRepo": True,
        "strangeCompanyRemainsSealed": True,
        "satelliteIsRevenueOperator": True,
    }
    return payload


def ready_revenue_index(config: dict[str, object]) -> dict[str, object]:
    payload = json.loads(REVENUE_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["operator"] = {
        "responsibleOperator": "Ops",
        "legalBusinessName": "Strange Works Studio",
        "businessAddressForInvoices": "PRIVATE_ADDRESS_CANARY_9S",
        "supportOwner": "Support",
        "accountingOwner": "Accountant",
        "lgpdPrivacyOwner": "Privacy",
        "paymentReconciliationOwner": "Finance",
        "refundOwner": "Support",
        "dailyInboxCheckTime": "09:00",
    }
    payload["entity"] = {
        "entityEvidenceId": "entity-001",
        "cnpjOrRoute": "private entity route",
        "reviewerName": "Human reviewer",
        "reviewDate": "2026-07-10",
        "allowedToInvoiceServices": True,
        "blockers": "none",
        "verified": True,
    }
    payload["tax"] = {
        "taxEvidenceId": "tax-001",
        "taxRegime": "reviewed regime",
        "cnae": "reviewed classification",
        "nfseRoute": "reviewed route",
        "municipalRegistrationNeeded": False,
        "fiscalDocumentOwner": "Accountant",
        "testNfseOrReceiptStatus": "passed",
        "accountantReviewedAt": "2026-07-10",
        "monthlyReconciliationOwner": "Accountant",
        "verified": True,
    }
    payload["payment"] = {
        "paymentEvidenceId": "payment-001",
        "provider": "Stripe",
        "businessAccountName": "Strange Works Studio",
        "payoutDestinationVerified": True,
        "testPaymentId": "PRIVATE_PAYMENT_CANARY_6P",
        "testPayoutStatus": "passed",
        "refundTestOrProcedure": "reviewed procedure",
        "chargebackOrDisputeProcedure": "reviewed procedure",
        "feesReviewed": True,
        "reconciliationOwner": "Finance",
        "dashboardAllowlistHostsConfirmed": True,
        "verified": True,
    }
    payload["support"] = {
        "supportEvidenceId": "support-001",
        "supportEmail": config["supportEmail"],
        "testSentAt": "2026-07-10",
        "testReceivedAt": "2026-07-10",
        "dailyCheckTime": "09:00",
        "incidentOwner": "Support",
        "refundOwner": "Support",
        "privacyOwner": "Privacy",
        "verified": True,
    }
    payload["privacy"] = {
        "privacyEvidenceId": "privacy-001",
        "privacyReviewedAt": config["privacyReviewedAt"],
        "lgpdContact": "Privacy",
        "processorListLocation": "private evidence index",
        "retentionDecision": "reviewed",
        "rightsRequestOwner": "Privacy",
        "sensitiveDataBoundaryConfirmed": True,
        "verified": True,
    }
    payload["terms"] = {
        "termsEvidenceId": "terms-001",
        "termsReviewedAt": config["termsReviewedAt"],
        "reviewer": "Human reviewer",
        "refundPath": "reviewed",
        "cancellationPath": "reviewed",
        "customerType": "B2B",
        "offerScopeConfirmed": True,
        "verified": True,
    }
    payload["ledger"] = {
        "ledgerEvidenceId": "ledger-001",
        "googleFormUrl": config["googleFormUrl"],
        "googleSheetUrl": "https://docs.google.com/spreadsheets/d/public-receipt-test",
        "testSubmissionId": "submission-001",
        "tabsVerified": True,
        "columnNamesVerified": True,
        "allowedStatusValuesVerified": True,
        "owner": "Ops",
        "verified": True,
    }
    payload["publicConfig"] = packet_public_config(config, live_mode=False)
    payload["attestation"] = {
        "operator": "Human operator",
        "reviewedAt": "2026-07-10",
        "noSecretsInRepo": True,
        "strangeCompanyRemainsSealed": True,
        "satelliteIsRevenueOperator": True,
        "aiDidNotApproveLegalTaxPaymentOrPrivacy": True,
    }
    return payload


def ready_reviewer_tracker() -> dict[str, object]:
    payload = json.loads(REVIEWER_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    roles = [
        "terms_consumer_law",
        "privacy_lgpd",
        "tax_nfse_accounting",
        "payment_reconciliation",
    ]
    payload["candidateRecords"] = [
        {
            "candidateId": f"reviewer-{index:03d}",
            "candidateLabel": f"Private reviewer {index}",
            "reviewRole": role,
            "contactStatus": "paid_test_ready",
            "contactedAt": "2026-07-10",
            "scope": "Review the role-specific launch blocker before live intake.",
            "rateBand": "BRL 150-300 paid test",
            "availability": "Within two business days",
            "paidTestTask": "Review the assigned launch blocker.",
            "conflictCheck": "No known conflict recorded",
            "readyForPaidTest": True,
            "humanRecorded": True,
            "evidenceRef": f"private-reviewer-{index:03d}",
            "operatorNotes": "",
        }
        for index, role in enumerate(roles, start=1)
    ]
    payload["attestation"]["operator"] = "Human operator"
    payload["attestation"]["reviewedAt"] = "2026-07-10"
    return payload


def ready_delivery_checklist() -> dict[str, object]:
    payload = json.loads(DELIVERY_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["generatedAt"] = "2026-07-10T00:00:00.000Z"
    payload["deliveryLoop"] = {
        "serviceName": "Compliance proof sprint",
        "orderId": "order-001",
        "customerRef": "customer-redacted-001",
        "scopeEvidenceRef": "scope-001",
        "intakeAccepted": True,
        "dataBoundaryConfirmed": True,
        "aiDraftCreated": True,
        "humanReviewCompleted": True,
        "humanReviewer": "Human reviewer",
        "humanReviewDate": "2026-07-10",
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
        "operator": "Human operator",
        "reviewedAt": "2026-07-10",
        "noSecretsInRepo": True,
        "noCustomerPrivateDataInRepo": True,
        "aiDidNotApproveFinalDelivery": True,
        "strangeCompanyRemainsSealed": True,
        "satelliteIsDeliveryOperator": True,
    }
    return payload


def ready_live_review_closure(
    config: dict[str, object],
    *,
    document_overrides: dict[str, pathlib.Path] | None = None,
) -> dict[str, object]:
    payload = json.loads(CLOSURE_TEMPLATE.read_text(encoding="utf-8"))
    payload["schemaVersion"] = 2
    payload["mode"] = "local"
    overrides = document_overrides or {}

    review_dates = {
        "terms": config["termsReviewedAt"],
        "privacy": config["privacyReviewedAt"],
        "brazilCompliance": config["brazilComplianceReviewedAt"],
        "aiHandoff": config["aiHandoffReviewedAt"],
    }
    required_true_flags = {
        "terms": (
            "offerFlowReviewed",
            "refundCancellationReviewed",
            "supportFlowReviewed",
            "humanApprovedForPublicConfig",
        ),
        "privacy": (
            "lgpdContactReviewed",
            "retentionReviewed",
            "processorsReviewed",
            "dataSubjectRightsReviewed",
            "humanApprovedForPublicConfig",
        ),
        "brazilCompliance": (
            "cnpjOrEntityRouteReviewed",
            "fiscalReceiptRouteReviewed",
            "paymentSupportReviewed",
            "lgpdRouteReviewed",
            "humanApprovedForPublicConfig",
        ),
        "aiHandoff": (
            "aiPreparedTextReviewed",
            "acceptedChangedOrRejected",
            "automatedDecisionStopRuleConfirmed",
            "humanApprovedForPublicConfig",
        ),
    }
    for gate_name, reviewed_at in review_dates.items():
        gate = payload["reviewGates"][gate_name]
        gate["reviewer"] = f"PRIVATE_CLOSURE_REVIEWER_CANARY_{gate_name}"
        gate["reviewedAt"] = reviewed_at
        gate["aiOnlyApproval"] = False
        for flag in required_true_flags[gate_name]:
            gate[flag] = True
        gate["documentDigests"] = {
            canonical_path: review_document_digest(
                canonical_path,
                (overrides.get(canonical_path) or ROOT / canonical_path).read_text(
                    encoding="utf-8"
                ),
            )
            for canonical_path in gate["documentsReviewed"]
        }

    payload["publicConfigPatch"] = {
        "jurisdiction": "BR",
        "aiGeneratedLegalDocsRequireHumanReview": True,
        "termsReviewedAt": config["termsReviewedAt"],
        "privacyReviewedAt": config["privacyReviewedAt"],
        "brazilComplianceReviewedAt": config["brazilComplianceReviewedAt"],
        "aiHandoffReviewedAt": config["aiHandoffReviewedAt"],
        "liveMode": False,
    }
    payload["attestation"]["operator"] = "PRIVATE_CLOSURE_OPERATOR_CANARY_5T"
    payload["attestation"]["reviewedAt"] = config["termsReviewedAt"]
    return payload


def ready_files(folder: pathlib.Path) -> tuple[pathlib.Path, pathlib.Path, pathlib.Path]:
    config = ready_public_config(live_mode=False)
    config_path = write_public_config(folder, config)
    external = write_json(folder, "EXTERNAL_LIVE_PACKET.local.json", ready_external_packet(config))
    revenue = write_json(folder, "REVENUE_SETUP_EVIDENCE_INDEX.local.json", ready_revenue_index(config))
    write_json(folder, "REVIEWER_CANDIDATE_TRACKER.local.json", ready_reviewer_tracker())
    write_json(folder, "DELIVERY_REVIEW_CHECKLIST.local.json", ready_delivery_checklist())
    write_json(
        folder,
        "LIVE_REVIEW_CLOSURE.local.json",
        ready_live_review_closure(config),
    )
    return config_path, external, revenue


def generation_args(
    config: pathlib.Path,
    external: pathlib.Path,
    revenue: pathlib.Path,
    output: pathlib.Path,
    *extra: str,
) -> tuple[str, ...]:
    return (
        "--public-config",
        str(config),
        "--external-live-packet",
        str(external),
        "--revenue-index",
        str(revenue),
        "--reviewer-tracker",
        str(config.parent / "REVIEWER_CANDIDATE_TRACKER.local.json"),
        "--delivery-review-checklist",
        str(config.parent / "DELIVERY_REVIEW_CHECKLIST.local.json"),
        "--live-review-closure",
        str(config.parent / "LIVE_REVIEW_CLOSURE.local.json"),
        "--output",
        str(output),
        *extra,
    )


def copy_review_documents(folder: pathlib.Path) -> dict[str, pathlib.Path]:
    document_root = folder / "review-documents"
    document_root.mkdir()
    documents: dict[str, pathlib.Path] = {}
    for document_path in REVIEW_DOCUMENT_PATHS:
        target = document_root / document_path
        target.write_bytes((ROOT / document_path).read_bytes())
        documents[document_path] = target
    return documents


def start_paused_receipt_issuance(
    config: pathlib.Path,
    external: pathlib.Path,
    revenue: pathlib.Path,
    output: pathlib.Path,
    barrier: pathlib.Path,
    *extra: str,
) -> subprocess.Popen[str]:
    environment = os.environ.copy()
    environment["NODE_ENV"] = "test"
    environment["STRANGE_COMPANY_TEST_RECEIPT_SNAPSHOT_BARRIER"] = str(barrier)
    return subprocess.Popen(
        [
            "node",
            str(EXPORTER.relative_to(ROOT)),
            *generation_args(config, external, revenue, output, *extra, "--force"),
        ],
        cwd=ROOT,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=environment,
    )


def start_paused_receipt_revocation(
    config: pathlib.Path,
    output: pathlib.Path,
    barrier: pathlib.Path,
    *extra: str,
) -> subprocess.Popen[str]:
    environment = os.environ.copy()
    environment["NODE_ENV"] = "test"
    environment["STRANGE_COMPANY_TEST_RECEIPT_REVOKE_SNAPSHOT_BARRIER"] = str(
        barrier
    )
    return subprocess.Popen(
        [
            "node",
            str(EXPORTER.relative_to(ROOT)),
            "--revoke",
            "--public-config",
            str(config),
            "--output",
            str(output),
            *extra,
        ],
        cwd=ROOT,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=environment,
    )


def wait_for_snapshot_barrier(
    process: subprocess.Popen[str],
    barrier: pathlib.Path,
) -> pathlib.Path:
    ready_marker = pathlib.Path(f"{barrier}.ready")
    deadline = time.monotonic() + 10
    while not ready_marker.exists() and process.poll() is None:
        if time.monotonic() >= deadline:
            raise AssertionError("receipt exporter did not reach the snapshot barrier")
        time.sleep(0.01)
    if process.poll() is not None:
        stdout, stderr = process.communicate()
        raise AssertionError(
            f"receipt exporter exited before snapshot barrier: {stdout}{stderr}"
        )
    return pathlib.Path(f"{barrier}.release")


class PublicLiveReceiptTests(unittest.TestCase):
    def test_cli_rejects_missing_flag_valued_duplicate_alias_and_unknown_options(self) -> None:
        for option in ("--document-root", "--terms-doc", "--privacy-doc"):
            with self.subTest(option=option, case="bare"):
                result = run_exporter(option)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(f"{option} requires a non-option value", result.stderr)
            with self.subTest(option=option, case="flag-valued"):
                result = run_exporter(option, "--force")
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(f"{option} requires a non-option value", result.stderr)

        duplicate_alias = run_exporter(
            "--external-live-packet",
            "first.json",
            "--external-packet",
            "second.json",
        )
        self.assertNotEqual(duplicate_alias.returncode, 0)
        self.assertIn("duplicate aliases are not allowed", duplicate_alias.stderr)

        duplicate_option = run_exporter(
            "--terms-doc",
            "TERMOS.md",
            "--terms-doc",
            "TERMOS.md",
        )
        self.assertNotEqual(duplicate_option.returncode, 0)
        self.assertIn("duplicate option: --terms-doc", duplicate_option.stderr)

        unknown = run_exporter("--untrusted-receipt-override")
        self.assertNotEqual(unknown.returncode, 0)
        self.assertIn("unknown option", unknown.stderr)

    def test_committed_placeholder_is_public_and_fail_closed(self) -> None:
        receipt = read_receipt(PUBLIC_RECEIPT)

        self.assertEqual(receipt["schemaVersion"], 4)
        self.assertIsInstance(receipt["generation"], int)
        self.assertGreater(receipt["generation"], 0)
        self.assertEqual(receipt["status"], "not_issued")
        self.assertEqual(receipt["issuedAt"], "")
        self.assertEqual(receipt["validUntil"], "")
        self.assertEqual(receipt["coreSha256"], "")
        self.assertEqual(receipt["envelopeSha256"], "")
        self.assertFalse(receipt["core"]["flags"]["liveMode"])
        self.assertEqual(set(receipt["core"]["reviewDocuments"]), set(REVIEW_DOCUMENT_PATHS))
        self.assertFalse(receipt["attestations"]["localPacketValidatorsPassed"])
        self.assertFalse(receipt["attestations"]["liveReviewClosureValidatorPassed"])
        self.assertFalse(receipt["attestations"]["operationalValidatorsPassed"])

        checked = run_exporter("--check-public-js")
        self.assertEqual(checked.returncode, 0, checked.stderr)
        self.assertIn("fail-closed placeholder validation passed", checked.stdout)

        required = run_exporter("--check-public-js", "--require-issued")
        self.assertNotEqual(required.returncode, 0)
        self.assertIn("issued receipt", required.stderr)

    def test_public_asset_text_limit_applies_to_issue_check_and_revoke(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            documents = copy_review_documents(folder)
            document_root = documents["TERMOS.md"].parent
            documents["AI_LEGAL_HANDOFF.md"].write_text(
                "x" * 1_000_001,
                encoding="utf-8",
            )
            output = folder / "public-live-receipt.js"
            cases = {
                "issue": generation_args(
                    config,
                    external,
                    revenue,
                    output,
                    "--document-root",
                    str(document_root),
                ),
                "check": (
                    "--check-public-js",
                    "--public-config",
                    str(config),
                    "--public-js",
                    str(PUBLIC_RECEIPT),
                    "--document-root",
                    str(document_root),
                ),
                "revoke": (
                    "--revoke",
                    "--public-config",
                    str(config),
                    "--output",
                    str(output),
                    "--document-root",
                    str(document_root),
                ),
            }

            for mode, command in cases.items():
                with self.subTest(mode=mode):
                    result = run_exporter(*command)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(
                        "exceeds 1000000 decoded text code units",
                        result.stderr,
                    )
            self.assertFalse(output.exists())

    def test_export_generates_only_public_fields_and_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"

            result = run_exporter(
                *generation_args(config, external, revenue, output, "--force", "--json")
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            stdout_receipt = json.loads(result.stdout)
            file_receipt = read_receipt(output)
            self.assertEqual(stdout_receipt, file_receipt)
            self.assertEqual(file_receipt["schemaVersion"], 4)
            self.assertEqual(file_receipt["generation"], 1)
            self.assertEqual(file_receipt["status"], ACTIVE_STATUS)
            self.assertRegex(file_receipt["coreSha256"], r"^[a-f0-9]{64}$")
            self.assertRegex(file_receipt["envelopeSha256"], r"^[a-f0-9]{64}$")
            self.assertTrue(file_receipt["issuedAt"].endswith("Z"))
            self.assertTrue(file_receipt["validUntil"].endswith("Z"))
            self.assertTrue(file_receipt["attestations"]["operationalValidatorsPassed"])
            self.assertTrue(
                file_receipt["attestations"]["liveReviewClosureValidatorPassed"]
            )
            self.assertEqual(file_receipt["core"]["operatorName"], "Strange Works Studio")
            self.assertEqual(file_receipt["core"]["jurisdiction"], "BR")
            self.assertEqual(file_receipt["core"]["complianceMode"], "brazil-human-reviewed")
            self.assertTrue(file_receipt["core"]["aiGeneratedLegalDocsRequireHumanReview"])
            self.assertIn("support", file_receipt["core"])
            self.assertIn("form", file_receipt["core"])
            self.assertIn("flags", file_receipt["core"])
            self.assertEqual(
                set(file_receipt["core"]["reviewDocuments"]),
                set(REVIEW_DOCUMENT_PATHS),
            )
            for document_path in REVIEW_DOCUMENT_PATHS:
                with self.subTest(document_path=document_path):
                    self.assertEqual(
                        file_receipt["core"]["reviewDocuments"][document_path],
                        public_review_document_digest(
                            document_path,
                            (ROOT / document_path).read_text(encoding="utf-8"),
                        ),
                    )
            self.assertEqual(len(file_receipt["core"]["reviewDates"]), 4)
            self.assertEqual(len(file_receipt["core"]["services"]), 2)

            public_text = output.read_text(encoding="utf-8")
            for private_canary in (
                "PRIVATE_INVOICE_CANARY_8R",
                "PRIVATE_BANK_CANARY_7Q",
                "PRIVATE_ADDRESS_CANARY_9S",
                "PRIVATE_PAYMENT_CANARY_6P",
                "PRIVATE_CLOSURE_REVIEWER_CANARY_terms",
                "PRIVATE_CLOSURE_REVIEWER_CANARY_privacy",
                "PRIVATE_CLOSURE_REVIEWER_CANARY_brazilCompliance",
                "PRIVATE_CLOSURE_REVIEWER_CANARY_aiHandoff",
                "PRIVATE_CLOSURE_OPERATOR_CANARY_5T",
            ):
                with self.subTest(private_canary=private_canary):
                    self.assertNotIn(private_canary, public_text)
            self.assertNotIn('"packetHash":', public_text)
            self.assertNotIn('"privatePacketHash":', public_text)
            self.assertNotIn('"sourcePacketHash":', public_text)
            self.assertNotIn('"reviewGates":', public_text)
            self.assertNotIn('"documentDigests":', public_text)
            self.assertNotIn('"publicConfigPatch":', public_text)
            closure = json.loads(
                (folder / "LIVE_REVIEW_CLOSURE.local.json").read_text(encoding="utf-8")
            )
            for gate in closure["reviewGates"].values():
                for private_digest in gate["documentDigests"].values():
                    with self.subTest(private_closure_digest=private_digest):
                        self.assertNotIn(private_digest, public_text)

            self.assertEqual(
                set(file_receipt["attestations"]),
                {
                    "publicOnly",
                    "privatePacketDataExcluded",
                    "privatePacketHashesExcluded",
                    "localPacketValidatorsPassed",
                    "liveReviewClosureValidatorPassed",
                    "reviewerCandidateTrackerReady",
                    "deliveryReviewChecklistReady",
                    "operationalValidatorsPassed",
                    "digestCoversCanonicalPublicCoreExceptLiveMode",
                    "digestCoversReceiptEnvelopeExceptLiveMode",
                },
            )

    def test_check_rejects_manifest_shape_or_stale_digest_after_digest_recomputation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(
                *generation_args(config, external, revenue, output)
            )
            self.assertEqual(generated.returncode, 0, generated.stderr)
            original = read_receipt(output)

            for case in ("missing", "extra", "substituted", "stale"):
                with self.subTest(case=case):
                    receipt = json.loads(json.dumps(original))
                    manifest = receipt["core"]["reviewDocuments"]
                    if case == "missing":
                        manifest.pop("AI_LEGAL_HANDOFF.md")
                    elif case == "extra":
                        manifest["UNREVIEWED.md"] = "0" * 64
                    elif case == "substituted":
                        digest = manifest.pop("HUMAN_REVIEW_PACKET.md")
                        manifest["HUMAN_REVIEW_PACKET-copy.md"] = digest
                    else:
                        manifest["BRAZIL_COMPLIANCE.md"] = "0" * 64
                    recompute_public_receipt_digests(receipt)
                    candidate = folder / f"public-live-receipt-{case}.js"
                    candidate.write_text(render_receipt(receipt), encoding="utf-8")

                    checked = run_exporter(
                        "--check-public-js",
                        "--require-issued",
                        "--public-js",
                        str(candidate),
                        "--public-config",
                        str(config),
                    )

                    self.assertNotEqual(checked.returncode, 0)
                    if case == "stale":
                        self.assertIn("stale public core", checked.stderr)
                    else:
                        self.assertIn("must contain only", checked.stderr)

    def test_non_portuguese_review_document_drift_invalidates_issued_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            documents = copy_review_documents(folder)
            document_root = documents["TERMOS.md"].parent
            write_json(
                folder,
                "LIVE_REVIEW_CLOSURE.local.json",
                ready_live_review_closure(
                    ready_public_config(live_mode=False),
                    document_overrides=documents,
                ),
            )
            output = folder / "public-live-receipt.js"
            generated = run_exporter(
                *generation_args(
                    config,
                    external,
                    revenue,
                    output,
                    "--document-root",
                    str(document_root),
                )
            )
            self.assertEqual(generated.returncode, 0, generated.stderr)

            brazil_document = documents["BRAZIL_COMPLIANCE.md"]
            brazil_document.write_text(
                brazil_document.read_text(encoding="utf-8")
                + "\nMaterial post-review compliance drift.\n",
                encoding="utf-8",
            )
            checked = run_exporter(
                "--check-public-js",
                "--require-issued",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--document-root",
                str(document_root),
            )

            self.assertNotEqual(checked.returncode, 0)
            self.assertIn("stale public core", checked.stderr)

    def test_issuance_input_cas_aborts_when_snapshot_set_drifts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            documents = copy_review_documents(folder)
            document_root = documents["TERMOS.md"].parent
            closure_path = write_json(
                folder,
                "LIVE_REVIEW_CLOSURE.local.json",
                ready_live_review_closure(
                    ready_public_config(live_mode=False),
                    document_overrides=documents,
                ),
            )
            original_brazil_text = documents["BRAZIL_COMPLIANCE.md"].read_text(
                encoding="utf-8"
            )
            output = folder / "public-live-receipt.js"
            barrier = folder / "receipt-snapshot-barrier"
            process = start_paused_receipt_issuance(
                config,
                external,
                revenue,
                output,
                barrier,
                "--document-root",
                str(document_root),
            )
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)

                swapped_config = ready_public_config(live_mode=False)
                swapped_config["operatorName"] = "Swapped operator after snapshot"
                write_public_config(folder, swapped_config)
                swapped_brazil_text = (
                    original_brazil_text + "\nSwapped compliance bytes after snapshot.\n"
                )
                documents["BRAZIL_COMPLIANCE.md"].write_text(
                    swapped_brazil_text,
                    encoding="utf-8",
                )
                swapped_closure = json.loads(
                    closure_path.read_text(encoding="utf-8")
                )
                swapped_closure["mode"] = "template"
                write_json(folder, closure_path.name, swapped_closure)
                release_marker.write_text("release\n", encoding="utf-8")

                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn(
                "Issuance input changed during validation (public config)",
                stderr,
            )
            self.assertFalse(output.exists())

    def test_issuance_input_cas_rejects_isolated_live_mode_flip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            barrier = folder / "receipt-live-mode-flip"
            process = start_paused_receipt_issuance(
                config, external, revenue, output, barrier
            )
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)
                source = config.read_text(encoding="utf-8")
                self.assertIn('"liveMode": false', source)
                config.write_text(
                    source.replace('"liveMode": false', '"liveMode": true', 1),
                    encoding="utf-8",
                )
                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn(
                "Issuance input changed during validation (public config)",
                stderr,
            )
            self.assertFalse(output.exists())

    def test_public_config_expression_cannot_read_private_issuance_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            closure = folder / "LIVE_REVIEW_CLOSURE.local.json"
            output = folder / "public-live-receipt.js"
            canary = folder / "private-issuance-leak.txt"
            expression = (
                '(() => { const fs = process.getBuiltinModule("fs"); '
                f"fs.writeFileSync({json.dumps(str(canary))}, "
                f"fs.readFileSync({json.dumps(str(closure))})); "
                "return false; })()"
            )
            config.write_text(
                "window.PUBLIC_ORDER_CONFIG = { "
                f"liveMode: {expression} "
                "};\n",
                encoding="utf-8",
            )

            result = run_exporter(*generation_args(config, external, revenue, output))

            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(output.exists())
            self.assertFalse(canary.exists())
            self.assertNotIn(
                "PRIVATE_CLOSURE_OPERATOR_CANARY_5T",
                result.stdout + result.stderr,
            )

    def test_issuance_input_cas_rejects_isolated_closure_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            closure = folder / "LIVE_REVIEW_CLOSURE.local.json"
            output = folder / "public-live-receipt.js"
            barrier = folder / "receipt-closure-drift"
            process = start_paused_receipt_issuance(
                config, external, revenue, output, barrier
            )
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)
                closure.write_bytes(closure.read_bytes() + b"\n")
                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn(
                "Issuance input changed during validation (LIVE_REVIEW_CLOSURE)",
                stderr,
            )
            self.assertFalse(output.exists())

    def test_issuance_input_cas_rejects_isolated_review_document_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            documents = copy_review_documents(folder)
            document_root = documents["TERMOS.md"].parent
            write_json(
                folder,
                "LIVE_REVIEW_CLOSURE.local.json",
                ready_live_review_closure(
                    ready_public_config(live_mode=False),
                    document_overrides=documents,
                ),
            )
            output = folder / "public-live-receipt.js"
            barrier = folder / "receipt-document-drift"
            process = start_paused_receipt_issuance(
                config,
                external,
                revenue,
                output,
                barrier,
                "--document-root",
                str(document_root),
            )
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)
                document = documents["BRAZIL_COMPLIANCE.md"]
                document.write_bytes(document.read_bytes() + b"\n")
                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn(
                "Issuance input changed during validation "
                "(public review document BRAZIL_COMPLIANCE.md)",
                stderr,
            )
            self.assertFalse(output.exists())

    def test_issuance_input_cas_rejects_each_private_packet_drift(self) -> None:
        packets = {
            "EXTERNAL_LIVE_PACKET.local.json": "EXTERNAL_LIVE_PACKET",
            "REVENUE_SETUP_EVIDENCE_INDEX.local.json": "REVENUE_SETUP_EVIDENCE_INDEX",
            "REVIEWER_CANDIDATE_TRACKER.local.json": "REVIEWER_CANDIDATE_TRACKER",
            "DELIVERY_REVIEW_CHECKLIST.local.json": "DELIVERY_REVIEW_CHECKLIST",
        }
        for packet_name, label in packets.items():
            with self.subTest(packet=packet_name), tempfile.TemporaryDirectory() as tmp:
                folder = pathlib.Path(tmp)
                config, external, revenue = ready_files(folder)
                output = folder / "public-live-receipt.js"
                barrier = folder / f"receipt-{packet_name}-drift"
                process = start_paused_receipt_issuance(
                    config, external, revenue, output, barrier
                )
                try:
                    release_marker = wait_for_snapshot_barrier(process, barrier)
                    packet = folder / packet_name
                    packet.write_bytes(b"{}\n")
                    release_marker.write_text("release\n", encoding="utf-8")
                    stdout, stderr = process.communicate(timeout=30)
                finally:
                    if process.poll() is None:
                        process.kill()
                        process.communicate()

                self.assertNotEqual(process.returncode, 0, stdout)
                self.assertIn(
                    f"Issuance input changed during validation ({label})",
                    stderr,
                )
                self.assertFalse(output.exists())

    def test_export_fails_closed_when_live_review_closure_is_missing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            (folder / "LIVE_REVIEW_CLOSURE.local.json").unlink()
            output = folder / "public-live-receipt.js"

            result = run_exporter(*generation_args(config, external, revenue, output))

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("LIVE_REVIEW_CLOSURE is missing", result.stderr)
            self.assertFalse(output.exists())

    def test_export_fails_closed_when_live_review_closure_digest_is_stale(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            closure_path = folder / "LIVE_REVIEW_CLOSURE.local.json"
            closure = json.loads(closure_path.read_text(encoding="utf-8"))
            closure["reviewGates"]["terms"]["documentDigests"]["TERMOS.md"] = "0" * 64
            write_json(folder, closure_path.name, closure)
            output = folder / "public-live-receipt.js"

            result = run_exporter(*generation_args(config, external, revenue, output))

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("LIVE_REVIEW_CLOSURE validator failed", result.stderr)
            self.assertFalse(output.exists())

    def test_export_rejects_closure_dates_that_do_not_match_public_config(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            closure_path = folder / "LIVE_REVIEW_CLOSURE.local.json"
            closure = json.loads(closure_path.read_text(encoding="utf-8"))
            closure["reviewGates"]["terms"]["reviewedAt"] = "2026-07-09"
            closure["publicConfigPatch"]["termsReviewedAt"] = "2026-07-09"
            write_json(folder, closure_path.name, closure)
            output = folder / "public-live-receipt.js"

            result = run_exporter(*generation_args(config, external, revenue, output))

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("LIVE_REVIEW_CLOSURE validator failed", result.stderr)
            self.assertFalse(output.exists())

    def test_export_refuses_overwrite_without_force(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"

            first = run_exporter(*generation_args(config, external, revenue, output))
            second = run_exporter(*generation_args(config, external, revenue, output))

            self.assertEqual(first.returncode, 0, first.stderr)
            self.assertNotEqual(second.returncode, 0)
            self.assertIn("Refusing to overwrite", second.stderr)
            self.assertIn("--force", second.stderr)

    def test_export_rejects_future_public_review_dates(self) -> None:
        future_date = (datetime.now(timezone.utc) + timedelta(days=1)).date().isoformat()
        review_fields = (
            "termsReviewedAt",
            "privacyReviewedAt",
            "brazilComplianceReviewedAt",
            "aiHandoffReviewedAt",
        )
        for field in review_fields:
            with self.subTest(field=field), tempfile.TemporaryDirectory() as tmp:
                folder = pathlib.Path(tmp)
                config, external, revenue = ready_files(folder)
                future_config = ready_public_config(live_mode=False)
                future_config[field] = future_date
                write_public_config(folder, future_config)
                output = folder / "public-live-receipt.js"

                result = run_exporter(*generation_args(config, external, revenue, output))

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(f"{field} must not be in the future", result.stderr)

    def test_revoke_replaces_an_active_receipt_with_a_closed_placeholder(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)
            issued_generation = read_receipt(output)["generation"]
            for local_packet in (
                external,
                revenue,
                folder / "REVIEWER_CANDIDATE_TRACKER.local.json",
                folder / "DELIVERY_REVIEW_CHECKLIST.local.json",
                folder / "LIVE_REVIEW_CLOSURE.local.json",
            ):
                local_packet.unlink()

            closed_config = ready_public_config(live_mode=False)
            closed_config["googleFormUrl"] = ""
            closed_config["googleFormVerified"] = False
            closed_config["termsReviewedAt"] = "2099-12-31"
            write_public_config(folder, closed_config)
            revoked = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )

            self.assertEqual(revoked.returncode, 0, revoked.stderr)
            self.assertIn("revoked to a fail-closed placeholder", revoked.stdout)
            receipt = read_receipt(output)
            self.assertEqual(receipt["status"], "not_issued")
            self.assertEqual(receipt["generation"], issued_generation + 1)
            self.assertEqual(receipt["core"]["form"]["url"], "")
            self.assertFalse(receipt["core"]["form"]["verified"])
            self.assertEqual(receipt["core"]["reviewDates"]["termsReviewedAt"], "2099-12-31")
            self.assertEqual(receipt["coreSha256"], "")
            self.assertEqual(receipt["envelopeSha256"], "")
            self.assertFalse(receipt["attestations"]["localPacketValidatorsPassed"])
            self.assertFalse(receipt["attestations"]["operationalValidatorsPassed"])

            checked = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
            )
            self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_revoke_refuses_to_overwrite_while_live_mode_is_true(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)

            write_public_config(folder, ready_public_config(live_mode=True))
            revoked = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )

            self.assertNotEqual(revoked.returncode, 0)
            self.assertIn("until public-config.js liveMode is false", revoked.stderr)
            self.assertEqual(read_receipt(output)["status"], ACTIVE_STATUS)

    def test_generation_advances_across_issue_revoke_and_reissue(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"

            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)
            self.assertEqual(read_receipt(output)["generation"], 1)

            revoked = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )
            self.assertEqual(revoked.returncode, 0, revoked.stderr)
            self.assertEqual(read_receipt(output)["generation"], 2)

            reissued = run_exporter(
                *generation_args(config, external, revenue, output, "--force")
            )
            self.assertEqual(reissued.returncode, 0, reissued.stderr)
            receipt = read_receipt(output)
            self.assertEqual(receipt["schemaVersion"], 4)
            self.assertEqual(receipt["generation"], 3)
            self.assertEqual(receipt["status"], ACTIVE_STATUS)

    def test_inflight_revoke_cannot_overwrite_newer_config_revocation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)
            self.assertEqual(read_receipt(output)["generation"], 1)

            barrier = folder / "revoke-config-drift"
            process = start_paused_receipt_revocation(config, output, barrier)
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)

                changed_config = ready_public_config(live_mode=False)
                changed_config["operatorName"] = "Newer operator after revoke snapshot"
                write_public_config(folder, changed_config)
                newer_revoke = run_exporter(
                    "--revoke",
                    "--public-config",
                    str(config),
                    "--output",
                    str(output),
                )
                self.assertEqual(newer_revoke.returncode, 0, newer_revoke.stderr)
                newer_receipt_bytes = output.read_bytes()
                newer_receipt = read_receipt(output)
                self.assertEqual(newer_receipt["generation"], 2)
                self.assertEqual(newer_receipt["status"], "not_issued")
                self.assertEqual(
                    newer_receipt["core"]["operatorName"],
                    "Newer operator after revoke snapshot",
                )

                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn(
                "Revocation input changed during validation (public config)",
                stderr,
            )
            self.assertEqual(output.read_bytes(), newer_receipt_bytes)
            self.assertEqual(read_receipt(output)["generation"], 2)

    def test_inflight_revoke_cannot_overwrite_newer_document_revocation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            documents = copy_review_documents(folder)
            document_root = documents["TERMOS.md"].parent
            write_json(
                folder,
                "LIVE_REVIEW_CLOSURE.local.json",
                ready_live_review_closure(
                    ready_public_config(live_mode=False),
                    document_overrides=documents,
                ),
            )
            output = folder / "public-live-receipt.js"
            issued = run_exporter(
                *generation_args(
                    config,
                    external,
                    revenue,
                    output,
                    "--document-root",
                    str(document_root),
                )
            )
            self.assertEqual(issued.returncode, 0, issued.stderr)
            self.assertEqual(read_receipt(output)["generation"], 1)

            barrier = folder / "revoke-document-drift"
            process = start_paused_receipt_revocation(
                config,
                output,
                barrier,
                "--document-root",
                str(document_root),
            )
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)

                document = documents["BRAZIL_COMPLIANCE.md"]
                document.write_bytes(
                    document.read_bytes() + b"\nNewer reviewed bytes after revoke snapshot.\n"
                )
                newer_revoke = run_exporter(
                    "--revoke",
                    "--public-config",
                    str(config),
                    "--document-root",
                    str(document_root),
                    "--output",
                    str(output),
                )
                self.assertEqual(newer_revoke.returncode, 0, newer_revoke.stderr)
                newer_receipt_bytes = output.read_bytes()
                newer_receipt = read_receipt(output)
                self.assertEqual(newer_receipt["generation"], 2)
                self.assertEqual(newer_receipt["status"], "not_issued")
                self.assertEqual(
                    newer_receipt["core"]["reviewDocuments"][
                        "BRAZIL_COMPLIANCE.md"
                    ],
                    public_review_document_digest(
                        "BRAZIL_COMPLIANCE.md",
                        document.read_text(encoding="utf-8"),
                    ),
                )

                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn(
                "Revocation input changed during validation "
                "(public review document BRAZIL_COMPLIANCE.md)",
                stderr,
            )
            self.assertEqual(output.read_bytes(), newer_receipt_bytes)
            self.assertEqual(read_receipt(output)["generation"], 2)

    def test_inflight_reissue_cannot_overwrite_newer_revocation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)
            self.assertEqual(read_receipt(output)["generation"], 1)

            barrier = folder / "reissue-revoke-race"
            process = start_paused_receipt_issuance(
                config, external, revenue, output, barrier
            )
            try:
                release_marker = wait_for_snapshot_barrier(process, barrier)
                revoked = run_exporter(
                    "--revoke",
                    "--public-config",
                    str(config),
                    "--output",
                    str(output),
                )
                self.assertEqual(revoked.returncode, 0, revoked.stderr)
                revoked_receipt = read_receipt(output)
                self.assertEqual(revoked_receipt["generation"], 2)
                self.assertEqual(revoked_receipt["status"], "not_issued")

                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = process.communicate(timeout=30)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate()

            self.assertNotEqual(process.returncode, 0, stdout)
            self.assertIn("Receipt output changed during issuance validation", stderr)
            final_receipt = read_receipt(output)
            self.assertEqual(final_receipt["generation"], 2)
            self.assertEqual(final_receipt["status"], "not_issued")

    def test_two_inflight_reissues_allow_only_one_commit(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)

            barriers = [folder / "issuer-one", folder / "issuer-two"]
            processes = [
                start_paused_receipt_issuance(
                    config, external, revenue, output, barrier
                )
                for barrier in barriers
            ]
            results: list[tuple[int, str, str]] = []
            try:
                release_markers = [
                    wait_for_snapshot_barrier(process, barrier)
                    for process, barrier in zip(processes, barriers)
                ]
                for release_marker in release_markers:
                    release_marker.write_text("release\n", encoding="utf-8")
                for process in processes:
                    stdout, stderr = process.communicate(timeout=30)
                    results.append((process.returncode, stdout, stderr))
            finally:
                for process in processes:
                    if process.poll() is None:
                        process.kill()
                        process.communicate()

            self.assertEqual(sum(code == 0 for code, _, _ in results), 1, results)
            failed_outputs = "\n".join(
                f"{stdout}\n{stderr}" for code, stdout, stderr in results if code != 0
            )
            self.assertTrue(
                "Receipt output changed during issuance validation" in failed_outputs
                or "Receipt mutation lock already exists" in failed_outputs,
                failed_outputs,
            )
            final_receipt = read_receipt(output)
            self.assertEqual(final_receipt["generation"], 2)
            self.assertEqual(final_receipt["status"], ACTIVE_STATUS)

    def test_schema_three_placeholder_is_migration_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, _, _ = ready_files(folder)
            output = folder / "public-live-receipt.js"
            legacy = read_receipt(PUBLIC_RECEIPT)
            legacy["schemaVersion"] = 3
            legacy.pop("generation", None)
            output.write_text(render_receipt(legacy), encoding="utf-8")

            checked = run_exporter(
                "--check-public-js",
                "--public-config",
                str(config),
                "--public-js",
                str(output),
            )
            self.assertNotEqual(checked.returncode, 0)
            self.assertIn("generation", checked.stderr)

            migrated = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )
            self.assertEqual(migrated.returncode, 0, migrated.stderr)
            receipt = read_receipt(output)
            self.assertEqual(receipt["schemaVersion"], 4)
            self.assertEqual(receipt["generation"], 1)

    def test_emergency_revoke_migrates_schema_three_active_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)
            legacy_active = convert_to_legacy_v3(read_receipt(output))
            output.write_text(render_receipt(legacy_active), encoding="utf-8")

            reissue = run_exporter(
                *generation_args(config, external, revenue, output, "--force")
            )
            self.assertNotEqual(reissue.returncode, 0)
            self.assertIn("schema-v3 not_issued placeholder", reissue.stderr)
            self.assertEqual(read_receipt(output)["schemaVersion"], 3)

            revoked = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )
            self.assertEqual(revoked.returncode, 0, revoked.stderr)
            receipt = read_receipt(output)
            self.assertEqual(receipt["schemaVersion"], 4)
            self.assertEqual(receipt["generation"], 1)
            self.assertEqual(receipt["status"], "not_issued")

    def test_json_output_advances_generation_across_mutations(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.json"

            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)
            receipt = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(receipt["generation"], 1)

            checked = run_exporter(
                "--check-public-js",
                "--require-issued",
                "--public-config",
                str(config),
                "--public-js",
                str(output),
            )
            self.assertEqual(checked.returncode, 0, checked.stderr)

            revoked = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )
            self.assertEqual(revoked.returncode, 0, revoked.stderr)
            self.assertEqual(
                json.loads(output.read_text(encoding="utf-8"))["generation"],
                2,
            )

            reissued = run_exporter(
                *generation_args(config, external, revenue, output, "--force")
            )
            self.assertEqual(reissued.returncode, 0, reissued.stderr)
            self.assertEqual(
                json.loads(output.read_text(encoding="utf-8"))["generation"],
                3,
            )

    def test_output_scoped_lock_refuses_concurrent_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            lock = pathlib.Path(f"{output}.lock")
            lock.write_text("held by another exporter\n", encoding="utf-8")

            result = run_exporter(*generation_args(config, external, revenue, output))

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Receipt mutation lock already exists", result.stderr)
            self.assertTrue(lock.exists())
            self.assertFalse(output.exists())

    def test_standalone_checker_has_no_prior_generation_trust_anchor(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            issued = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(issued.returncode, 0, issued.stderr)
            old_active = output.read_bytes()

            revoked = run_exporter(
                "--revoke",
                "--public-config",
                str(config),
                "--output",
                str(output),
            )
            self.assertEqual(revoked.returncode, 0, revoked.stderr)
            self.assertEqual(read_receipt(output)["generation"], 2)

            output.write_bytes(old_active)
            checked = run_exporter(
                "--check-public-js",
                "--require-issued",
                "--public-config",
                str(config),
                "--public-js",
                str(output),
            )
            # A lone file has no trustworthy prior head. Open-page high-water
            # state and deployment freshness, not this stateless checker, detect rollback.
            self.assertEqual(checked.returncode, 0, checked.stderr)
            self.assertEqual(read_receipt(output)["generation"], 1)

    def test_check_rejects_stale_core_and_digest(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)

            receipt = read_receipt(output)
            receipt["core"]["services"][0]["title"] = "Tampered title"
            output.write_text(render_receipt(receipt), encoding="utf-8")
            tampered = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--require-issued",
            )
            self.assertNotEqual(tampered.returncode, 0)
            self.assertIn("does not match", tampered.stderr)

            generated = run_exporter(*generation_args(config, external, revenue, output, "--force"))
            self.assertEqual(generated.returncode, 0, generated.stderr)
            changed = ready_public_config(live_mode=False)
            changed["operatorName"] = "Changed public operator"
            write_public_config(folder, changed)
            stale = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--require-issued",
            )
            self.assertNotEqual(stale.returncode, 0)
            self.assertIn("stale public core", stale.stderr)

    def test_live_mode_only_flip_does_not_stale_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)
            original_digest = read_receipt(output)["coreSha256"]
            for local_packet in (
                external,
                revenue,
                folder / "REVIEWER_CANDIDATE_TRACKER.local.json",
                folder / "DELIVERY_REVIEW_CHECKLIST.local.json",
                folder / "LIVE_REVIEW_CLOSURE.local.json",
            ):
                local_packet.unlink()

            flipped = ready_public_config(live_mode=True)
            write_public_config(folder, flipped)

            checked = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--require-issued",
            )
            self.assertEqual(checked.returncode, 0, checked.stderr)
            self.assertEqual(read_receipt(output)["coreSha256"], original_digest)

    def test_review_document_digests_normalize_bom_and_line_endings_and_detect_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            terms = folder / "TERMOS.md"
            privacy = folder / "AVISO_DE_PRIVACIDADE.md"
            terms_text = (ROOT / "TERMOS.md").read_text(encoding="utf-8")
            privacy_text = (ROOT / "AVISO_DE_PRIVACIDADE.md").read_text(encoding="utf-8")
            terms_text = f"{terms_text.rstrip()}\n\nOverride-only terms marker.\n"
            privacy_text = f"{privacy_text.rstrip()}\n\nOverride-only privacy marker.\n"
            terms.write_bytes(terms_text.replace("\r\n", "\n").replace("\r", "\n").encode("utf-8"))
            privacy.write_bytes(privacy_text.replace("\r\n", "\n").replace("\r", "\n").encode("utf-8"))
            write_json(
                folder,
                "LIVE_REVIEW_CLOSURE.local.json",
                ready_live_review_closure(
                    ready_public_config(live_mode=False),
                    document_overrides={
                        "TERMOS.md": terms,
                        "AVISO_DE_PRIVACIDADE.md": privacy,
                    },
                ),
            )
            document_args = (
                "--terms-doc",
                str(terms),
                "--privacy-doc",
                str(privacy),
            )

            generated = run_exporter(
                *generation_args(config, external, revenue, output, *document_args)
            )
            self.assertEqual(generated.returncode, 0, generated.stderr)
            issued_terms_digest = read_receipt(output)["core"]["reviewDocuments"]["TERMOS.md"]

            normalized_terms = terms_text.replace("\r\n", "\n").replace("\r", "\n")
            terms.write_bytes(
                b"\xef\xbb\xbf" + normalized_terms.replace("\n", "\r\n").encode("utf-8")
            )
            line_ending_only = run_exporter(
                "--check-public-js",
                "--require-issued",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                *document_args,
            )
            self.assertEqual(line_ending_only.returncode, 0, line_ending_only.stderr)
            self.assertEqual(
                issued_terms_digest,
                public_review_document_digest("TERMOS.md", normalized_terms),
            )

            terms.write_bytes(f"{normalized_terms}\nMaterial legal drift.\n".encode("utf-8"))
            drifted = run_exporter(
                "--check-public-js",
                "--require-issued",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                *document_args,
            )
            self.assertNotEqual(drifted.returncode, 0)
            self.assertIn("stale public core", drifted.stderr)

    def test_envelope_rejects_timestamp_or_attestation_changes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)

            receipt = read_receipt(output)
            receipt["attestations"]["reviewerCandidateTrackerReady"] = False
            output.write_text(render_receipt(receipt), encoding="utf-8")
            changed = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--require-issued",
            )
            self.assertNotEqual(changed.returncode, 0)
            self.assertIn("receipt envelope", changed.stderr)

            generated = run_exporter(*generation_args(config, external, revenue, output, "--force"))
            self.assertEqual(generated.returncode, 0, generated.stderr)
            receipt = read_receipt(output)
            receipt["issuedAt"] = "2030-01-02T03:04:05.000Z"
            output.write_text(render_receipt(receipt), encoding="utf-8")
            changed = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--require-issued",
            )
            self.assertNotEqual(changed.returncode, 0)
            self.assertIn("future", changed.stderr)

    def test_v4_envelope_covers_generation_and_requires_safe_positive_integer(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)

            receipt = read_receipt(output)
            receipt["generation"] += 1
            output.write_text(render_receipt(receipt), encoding="utf-8")
            changed = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
                "--require-issued",
            )
            self.assertNotEqual(changed.returncode, 0)
            self.assertIn("receipt envelope", changed.stderr)

            receipt["generation"] = 0
            recompute_public_receipt_digests(receipt)
            output.write_text(render_receipt(receipt), encoding="utf-8")
            invalid = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config),
            )
            self.assertNotEqual(invalid.returncode, 0)
            self.assertIn("positive safe integer", invalid.stderr)

    def test_export_is_bound_to_current_public_config(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config, external, revenue = ready_files(folder)
            payload = json.loads(external.read_text(encoding="utf-8"))
            payload["publicConfig"]["supportEmail"] = "different@example.com"
            write_json(folder, external.name, payload)
            output = folder / "public-live-receipt.js"

            result = run_exporter(*generation_args(config, external, revenue, output))

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("validator failed", result.stderr)
            self.assertNotIn("PRIVATE_", result.stderr)

    def test_export_rejects_non_local_operational_evidence_modes(self) -> None:
        cases = (
            ("REVIEWER_CANDIDATE_TRACKER.local.json", "simulation"),
            ("DELIVERY_REVIEW_CHECKLIST.local.json", "template"),
        )
        for packet_name, mode in cases:
            with self.subTest(packet=packet_name, mode=mode), tempfile.TemporaryDirectory() as tmp:
                folder = pathlib.Path(tmp)
                config, external, revenue = ready_files(folder)
                packet_path = folder / packet_name
                payload = json.loads(packet_path.read_text(encoding="utf-8"))
                payload["mode"] = mode
                write_json(folder, packet_name, payload)
                output = folder / "public-live-receipt.js"

                result = run_exporter(
                    *generation_args(
                        config,
                        external,
                        revenue,
                        output,
                    )
                )

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("validator failed", result.stderr)
                self.assertFalse(output.exists())

    def test_export_rejects_contradictory_revenue_lane_claims(self) -> None:
        cases = (
            ("attestation", "strangeCompanyRemainsSealed", False),
            ("attestation", "satelliteIsRevenueOperator", False),
            ("attestation", "operator", ""),
            ("attestation", "reviewedAt", ""),
            ("attestation", "reviewedAt", "2999-12-31"),
            ("operator", "responsibleOperator", ""),
            ("entity", "reviewDate", "2999-12-31"),
            ("publicConfig", "liveMode", True),
        )
        for section, field, value in cases:
            with self.subTest(section=section, field=field), tempfile.TemporaryDirectory() as tmp:
                folder = pathlib.Path(tmp)
                config, external, revenue = ready_files(folder)
                payload = json.loads(revenue.read_text(encoding="utf-8"))
                payload[section][field] = value
                write_json(folder, revenue.name, payload)
                output = folder / "public-live-receipt.js"

                result = run_exporter(*generation_args(config, external, revenue, output))

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("REVENUE_SETUP_EVIDENCE_INDEX validator failed", result.stderr)
                self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
