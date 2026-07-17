from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from tests.test_public_live_receipt import (
    ready_files,
    start_paused_receipt_issuance,
    start_paused_receipt_revocation,
    wait_for_snapshot_barrier,
)


ROOT = Path(__file__).resolve().parents[1]
BINDER = ROOT / "tools" / "bind_live_review_closure.js"
VALIDATOR = ROOT / "tools" / "validate_live_review_closure.js"
EXPORTER = ROOT / "tools" / "export_public_live_receipt.js"
TEMPLATE = ROOT / "LIVE_REVIEW_CLOSURE.template.json"
REVIEW_DATE = "2026-06-12"
REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_REVIEW_DOCUMENT_V1"
REVIEW_DOCUMENTS = (
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
REVIEW_FIELDS = (
    "termsReviewedAt",
    "privacyReviewedAt",
    "brazilComplianceReviewedAt",
    "aiHandoffReviewedAt",
)


def run_node(
    script: Path,
    *args: str,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    environment = os.environ.copy()
    if env:
        environment.update(env)
    return subprocess.run(
        ["node", str(script), *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        env=environment,
    )


def normalize_document(contents: str) -> str:
    return contents.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")


def document_digest(canonical_path: str, contents: str) -> str:
    payload = (
        f"{REVIEW_DOCUMENT_DIGEST_DOMAIN}\n"
        f"path={canonical_path}\n"
        f"{normalize_document(contents)}"
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def parse_receipt(path: Path) -> dict[str, object]:
    source = path.read_text(encoding="utf-8")
    prefix = "window.PUBLIC_LIVE_RECEIPT = Object.freeze("
    if not source.startswith(prefix) or not source.rstrip().endswith(");"):
        raise AssertionError("unexpected public receipt wrapper")
    return json.loads(source[len(prefix) : source.rfind(");")])


def public_config_source() -> str:
    return """window.PUBLIC_ORDER_CONFIG = {
  operatorName: "Strange Works Studio",
  jurisdiction: "BR",
  complianceMode: "brazil-draft",
  aiGeneratedLegalDocsRequireHumanReview: true,
  supportEmail: "support@example.com",
  googleFormUrl: "",
  supportInboxVerified: true,
  googleFormVerified: false,
  termsReviewedAt: "",
  privacyReviewedAt: "",
  brazilComplianceReviewedAt: "",
  aiHandoffReviewedAt: "",
  liveMode: false,
  services: [
    {
      id: "proof-sprint",
      title: "Proof sprint",
      detail: "Synthetic binder fixture",
      price: 750
    }
  ]
};
"""


class BinderFixture:
    def __init__(self, workspace: Path) -> None:
        self.workspace = workspace
        self.config = workspace / "public-config.js"
        self.receipt = workspace / "public-live-receipt.js"
        self.closure = workspace / "LIVE_REVIEW_CLOSURE.local.json"
        workspace.mkdir(parents=True, exist_ok=True)
        for canonical_path in REVIEW_DOCUMENTS:
            shutil.copyfile(ROOT / canonical_path, workspace / canonical_path)
        self.config.write_text(public_config_source(), encoding="utf-8", newline="")
        self._write_ready_closure()
        seed = run_node(
            EXPORTER,
            "--revoke",
            "--public-config",
            str(self.config),
            "--document-root",
            str(workspace),
            "--output",
            str(self.receipt),
            "--force",
        )
        if seed.returncode != 0:
            raise AssertionError(seed.stderr)

    def _write_ready_closure(self) -> None:
        payload = json.loads(TEMPLATE.read_text(encoding="utf-8"))
        payload["mode"] = "local"
        fields = {
            "terms": "termsReviewedAt",
            "privacy": "privacyReviewedAt",
            "brazilCompliance": "brazilComplianceReviewedAt",
            "aiHandoff": "aiHandoffReviewedAt",
        }
        for gate_id, field in fields.items():
            gate = payload["reviewGates"][gate_id]
            gate["reviewer"] = f"PRIVATE {gate_id} reviewer"
            gate["reviewedAt"] = REVIEW_DATE
            gate["humanApprovedForPublicConfig"] = True
            gate["aiOnlyApproval"] = False
            gate["documentDigests"] = {
                document: document_digest(
                    document,
                    (self.workspace / document).read_text(encoding="utf-8"),
                )
                for document in gate["documentsReviewed"]
            }
            payload["publicConfigPatch"][field] = REVIEW_DATE

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
            operator="PRIVATE fixture operator",
            reviewedAt=REVIEW_DATE,
            noPrivateEvidenceInRepo=True,
            noLegalTaxPrivacyApprovalFromAi=True,
            liveModeStaysFalse=True,
            externalLivePacketStillRequired=True,
            revenuePaymentFiscalEvidenceStillRequired=True,
        )
        self.closure.write_text(
            f"{json.dumps(payload, indent=2)}\n",
            encoding="utf-8",
            newline="",
        )

    def binder_args(self) -> list[str]:
        return [
            str(self.closure),
            "--public-config",
            str(self.config),
            "--public-receipt",
            str(self.receipt),
            "--document-root",
            str(self.workspace),
            "--json",
        ]

    def plan(self) -> tuple[subprocess.CompletedProcess[str], dict[str, object]]:
        result = run_node(BINDER, *self.binder_args())
        return result, json.loads(result.stdout) if result.returncode == 0 else {}

    def apply(
        self,
        plan_id: str,
        *,
        env: dict[str, str] | None = None,
    ) -> subprocess.CompletedProcess[str]:
        return run_node(
            BINDER,
            *self.binder_args(),
            "--apply",
            "--expect-plan-id",
            plan_id,
            env=env,
        )


class BindLiveReviewClosureTests(unittest.TestCase):
    def test_plan_is_deterministic_local_only_and_non_mutating(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            config_before = fixture.config.read_bytes()
            receipt_before = fixture.receipt.read_bytes()

            first_result, first = fixture.plan()
            second_result, second = fixture.plan()

            self.assertEqual(first_result.returncode, 0, first_result.stderr)
            self.assertEqual(second_result.returncode, 0, second_result.stderr)
            self.assertEqual(first["planId"], second["planId"])
            self.assertEqual(first["transition"], "bind_and_revoke")
            self.assertTrue(first["wouldApply"])
            self.assertTrue(first["liveModeRemainsFalse"])
            self.assertFalse(first["externalEvidenceClaimed"])
            self.assertTrue(first["localOnly"])
            self.assertFalse(first["publishPlanId"])
            self.assertTrue(first["containsCommitmentToPrivateClosure"])
            self.assertEqual(first["receiptGenerationBefore"], 1)
            self.assertEqual(first["receiptGenerationAfter"], 2)
            self.assertEqual(
                [change["field"] for change in first["changes"]],
                list(REVIEW_FIELDS),
            )
            self.assertNotIn("PRIVATE", first_result.stdout)
            self.assertNotIn("packetSha", first_result.stdout)
            self.assertEqual(
                first["implementationSha256"]["binder"],
                hashlib.sha256(BINDER.read_bytes()).hexdigest(),
            )
            self.assertEqual(
                first["implementationSha256"]["closure-validator"],
                hashlib.sha256((ROOT / "tools" / "validate_live_review_closure.js").read_bytes()).hexdigest(),
            )
            self.assertEqual(
                first["implementationSha256"]["receipt-exporter"],
                hashlib.sha256(EXPORTER.read_bytes()).hexdigest(),
            )
            self.assertEqual(fixture.config.read_bytes(), config_before)
            self.assertEqual(fixture.receipt.read_bytes(), receipt_before)

    def test_reported_apply_arguments_replay_custom_paths_exactly(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)

            applied = subprocess.run(
                [str(part) for part in plan["applyArguments"]],
                cwd=ROOT,
                check=False,
                encoding="utf-8",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            self.assertEqual(applied.returncode, 0, applied.stderr)
            report = json.loads(applied.stdout)
            self.assertTrue(report["applied"])
            self.assertEqual(Path(plan["applyArguments"][2]), fixture.closure)
            self.assertIn(str(fixture.config), plan["applyArguments"])
            self.assertIn(str(fixture.receipt), plan["applyArguments"])

    def test_apply_binds_exact_dates_refreshes_placeholder_and_is_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            config_before = fixture.config.read_text(encoding="utf-8")
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)

            applied = fixture.apply(str(plan["planId"]))

            self.assertEqual(applied.returncode, 0, applied.stderr)
            report = json.loads(applied.stdout)
            self.assertTrue(report["applied"])
            config_after = fixture.config.read_text(encoding="utf-8")
            for field in REVIEW_FIELDS:
                self.assertIn(f'{field}: "{REVIEW_DATE}"', config_after)
            restored = config_after
            for field in REVIEW_FIELDS:
                restored = re.sub(
                    rf'(^[ \t]*{field}[ \t]*:[ \t]*)"{REVIEW_DATE}"',
                    r'\1""',
                    restored,
                    flags=re.MULTILINE,
                )
            self.assertEqual(restored, config_before)
            self.assertIn("liveMode: false", config_after)

            receipt = parse_receipt(fixture.receipt)
            self.assertEqual(receipt["status"], "not_issued")
            self.assertEqual(receipt["generation"], 2)
            self.assertFalse(receipt["core"]["flags"]["liveMode"])
            self.assertEqual(
                receipt["core"]["reviewDates"],
                {field: REVIEW_DATE for field in REVIEW_FIELDS},
            )

            strict = run_node(
                VALIDATOR,
                str(fixture.closure),
                "--require-ready",
                "--document-root",
                str(fixture.workspace),
                "--public-config",
                str(fixture.config),
            )
            receipt_check = run_node(
                EXPORTER,
                "--check-public-js",
                "--public-config",
                str(fixture.config),
                "--public-js",
                str(fixture.receipt),
                "--document-root",
                str(fixture.workspace),
            )
            self.assertEqual(strict.returncode, 0, strict.stderr)
            self.assertEqual(receipt_check.returncode, 0, receipt_check.stderr)

            receipt_bytes = fixture.receipt.read_bytes()
            config_bytes = fixture.config.read_bytes()
            noop_result, noop_plan = fixture.plan()
            self.assertEqual(noop_result.returncode, 0, noop_result.stderr)
            self.assertEqual(noop_plan["transition"], "already_bound")
            self.assertFalse(noop_plan["wouldApply"])
            self.assertEqual(noop_plan["receiptGenerationBefore"], 2)
            self.assertEqual(noop_plan["receiptGenerationAfter"], 2)

            noop_apply = fixture.apply(str(noop_plan["planId"]))
            self.assertEqual(noop_apply.returncode, 0, noop_apply.stderr)
            noop_report = json.loads(noop_apply.stdout)
            self.assertFalse(noop_report["applied"])
            self.assertTrue(noop_report["noOp"])
            self.assertEqual(fixture.config.read_bytes(), config_bytes)
            self.assertEqual(fixture.receipt.read_bytes(), receipt_bytes)

    def test_stale_plan_after_private_packet_change_is_rejected_without_writes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)
            config_before = fixture.config.read_bytes()
            receipt_before = fixture.receipt.read_bytes()
            packet = json.loads(fixture.closure.read_text(encoding="utf-8"))
            packet["reviewGates"]["terms"]["reviewer"] = "PRIVATE replacement reviewer"
            fixture.closure.write_text(
                f"{json.dumps(packet, indent=2)}\n",
                encoding="utf-8",
                newline="",
            )

            result = fixture.apply(str(plan["planId"]))

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("expected plan ID does not match", result.stderr)
            self.assertNotIn("replacement reviewer", result.stderr)
            self.assertEqual(fixture.config.read_bytes(), config_before)
            self.assertEqual(fixture.receipt.read_bytes(), receipt_before)

    def test_public_js_expressions_cannot_read_private_closure_material(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            for target in ("config", "receipt"):
                with self.subTest(target=target):
                    fixture = BinderFixture(base / target)
                    canary = fixture.workspace / "private-closure-leak.txt"
                    expression = (
                        '(() => { const fs = process.getBuiltinModule("fs"); '
                        f"fs.writeFileSync({json.dumps(str(canary))}, "
                        f"fs.readFileSync({json.dumps(str(fixture.closure))})); "
                        "return false; })()"
                    )
                    if target == "config":
                        fixture.config.write_text(
                            "window.PUBLIC_ORDER_CONFIG = { "
                            f"liveMode: {expression} "
                            "};\n",
                            encoding="utf-8",
                            newline="",
                        )
                    else:
                        fixture.receipt.write_text(
                            "window.PUBLIC_LIVE_RECEIPT = Object.freeze("
                            f'{{"status": {expression}}}'
                            ");\n",
                            encoding="utf-8",
                            newline="",
                        )

                    result = run_node(BINDER, *fixture.binder_args())

                    self.assertNotEqual(result.returncode, 0)
                    self.assertFalse(canary.exists())
                    self.assertNotIn("PRIVATE fixture operator", result.stdout + result.stderr)

    def test_duplicate_missing_and_unsafe_config_fields_fail_before_mutation(self) -> None:
        mutations = {
            "duplicate": (
                '  termsReviewedAt: "",\n',
                '  termsReviewedAt: "",\n  termsReviewedAt: "",\n',
                "exactly one termsReviewedAt property; found 2",
            ),
            "missing": (
                '  privacyReviewedAt: "",\n',
                "",
                "exactly one privacyReviewedAt property; found 0",
            ),
            "live": (
                "  liveMode: false,\n",
                "  liveMode: true,\n",
                "liveMode is not false",
            ),
            "jurisdiction": (
                '  jurisdiction: "BR",\n',
                '  jurisdiction: "US",\n',
                "outside the BR jurisdiction posture",
            ),
            "ai-review": (
                "  aiGeneratedLegalDocsRequireHumanReview: true,\n",
                "  aiGeneratedLegalDocsRequireHumanReview: false,\n",
                "do not require human review",
            ),
        }
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            for name, (old, new, expected) in mutations.items():
                with self.subTest(name=name):
                    fixture = BinderFixture(base / name)
                    source = fixture.config.read_text(encoding="utf-8")
                    fixture.config.write_text(
                        source.replace(old, new),
                        encoding="utf-8",
                        newline="",
                    )
                    config_before = fixture.config.read_bytes()
                    receipt_before = fixture.receipt.read_bytes()

                    result = run_node(BINDER, *fixture.binder_args())

                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(expected, result.stderr)
                    self.assertEqual(fixture.config.read_bytes(), config_before)
                    self.assertEqual(fixture.receipt.read_bytes(), receipt_before)

    def test_existing_lock_rejects_apply_without_writes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)
            config_before = fixture.config.read_bytes()
            receipt_before = fixture.receipt.read_bytes()
            lock = Path(f"{fixture.config}.live-review-bind.lock")
            lock.write_text("held", encoding="utf-8")
            try:
                result = fixture.apply(str(plan["planId"]))
            finally:
                lock.unlink(missing_ok=True)

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("transition lock already exists", result.stderr)
            self.assertEqual(fixture.config.read_bytes(), config_before)
            self.assertEqual(fixture.receipt.read_bytes(), receipt_before)

    def test_receipt_lock_also_guards_an_idempotent_apply(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)
            applied = fixture.apply(str(plan["planId"]))
            self.assertEqual(applied.returncode, 0, applied.stderr)

            no_op_result, no_op_plan = fixture.plan()
            self.assertEqual(no_op_result.returncode, 0, no_op_result.stderr)
            self.assertFalse(no_op_plan["wouldApply"])
            lock = Path(f"{fixture.receipt}.lock")
            lock.write_text("held", encoding="utf-8")
            try:
                blocked = fixture.apply(str(no_op_plan["planId"]))
            finally:
                lock.unlink(missing_ok=True)

            self.assertNotEqual(blocked.returncode, 0)
            self.assertIn("transition lock already exists", blocked.stderr)

    def test_binder_revocation_wins_against_paused_receipt_issuer(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            fixture = BinderFixture(base / "binder")
            issuer_folder = base / "issuer"
            issuer_folder.mkdir()
            issuer_config, issuer_external, issuer_revenue = ready_files(issuer_folder)
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)

            barrier = base / "paused-exporter"
            issuer = start_paused_receipt_issuance(
                issuer_config,
                issuer_external,
                issuer_revenue,
                fixture.receipt,
                barrier,
            )
            try:
                release_marker = wait_for_snapshot_barrier(issuer, barrier)
                applied = fixture.apply(str(plan["planId"]))
                self.assertEqual(applied.returncode, 0, applied.stderr)
                bound_receipt = parse_receipt(fixture.receipt)
                self.assertEqual(bound_receipt["status"], "not_issued")
                self.assertEqual(bound_receipt["generation"], 2)

                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = issuer.communicate(timeout=30)
            finally:
                if issuer.poll() is None:
                    issuer.kill()
                    issuer.communicate()

            self.assertNotEqual(issuer.returncode, 0, stdout)
            self.assertIn("Receipt output changed during issuance validation", stderr)
            final_receipt = parse_receipt(fixture.receipt)
            self.assertEqual(final_receipt["status"], "not_issued")
            self.assertEqual(final_receipt["generation"], 2)

    def test_binder_wins_against_paused_stale_core_revoker(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            fixture = BinderFixture(base / "binder")
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)

            barrier = base / "paused-revoker"
            revoker = start_paused_receipt_revocation(
                fixture.config,
                fixture.receipt,
                barrier,
                "--document-root",
                str(fixture.workspace),
            )
            try:
                release_marker = wait_for_snapshot_barrier(revoker, barrier)
                applied = fixture.apply(str(plan["planId"]))
                self.assertEqual(applied.returncode, 0, applied.stderr)
                bound_config_bytes = fixture.config.read_bytes()
                bound_receipt_bytes = fixture.receipt.read_bytes()
                bound_receipt = parse_receipt(fixture.receipt)
                self.assertEqual(bound_receipt["status"], "not_issued")
                self.assertEqual(bound_receipt["generation"], 2)
                self.assertEqual(
                    bound_receipt["core"]["reviewDates"]["termsReviewedAt"],
                    REVIEW_DATE,
                )

                release_marker.write_text("release\n", encoding="utf-8")
                stdout, stderr = revoker.communicate(timeout=30)
            finally:
                if revoker.poll() is None:
                    revoker.kill()
                    revoker.communicate()

            self.assertNotEqual(revoker.returncode, 0, stdout)
            self.assertIn(
                "Revocation input changed during validation (public config)",
                stderr,
            )
            self.assertEqual(fixture.config.read_bytes(), bound_config_bytes)
            self.assertEqual(fixture.receipt.read_bytes(), bound_receipt_bytes)
            self.assertEqual(parse_receipt(fixture.receipt)["generation"], 2)

    def test_interrupted_receipt_first_commit_is_fail_closed_and_resumable(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = BinderFixture(Path(directory))
            plan_result, plan = fixture.plan()
            self.assertEqual(plan_result.returncode, 0, plan_result.stderr)
            config_before = fixture.config.read_bytes()

            interrupted = fixture.apply(
                str(plan["planId"]),
                env={
                    "NODE_ENV": "test",
                    "STRANGE_COMPANY_TEST_BINDER_INTERRUPT_AFTER_RECEIPT": "1",
                },
            )

            self.assertNotEqual(interrupted.returncode, 0)
            self.assertIn("simulated interruption", interrupted.stderr)
            self.assertEqual(fixture.config.read_bytes(), config_before)
            receipt_ahead = parse_receipt(fixture.receipt)
            self.assertEqual(receipt_ahead["status"], "not_issued")
            self.assertEqual(receipt_ahead["generation"], 2)
            current_check = run_node(
                EXPORTER,
                "--check-public-js",
                "--public-config",
                str(fixture.config),
                "--public-js",
                str(fixture.receipt),
                "--document-root",
                str(fixture.workspace),
            )
            self.assertNotEqual(current_check.returncode, 0)
            self.assertIn("liveMode: false", fixture.config.read_text(encoding="utf-8"))

            recovery_result, recovery_plan = fixture.plan()
            self.assertEqual(recovery_result.returncode, 0, recovery_result.stderr)
            self.assertEqual(recovery_plan["transition"], "resume_receipt_ahead")
            self.assertEqual(recovery_plan["receiptGenerationBefore"], 2)
            self.assertEqual(recovery_plan["receiptGenerationAfter"], 2)
            receipt_bytes = fixture.receipt.read_bytes()

            recovered = fixture.apply(str(recovery_plan["planId"]))

            self.assertEqual(recovered.returncode, 0, recovered.stderr)
            self.assertEqual(fixture.receipt.read_bytes(), receipt_bytes)
            for field in REVIEW_FIELDS:
                self.assertIn(
                    f'{field}: "{REVIEW_DATE}"',
                    fixture.config.read_text(encoding="utf-8"),
                )
            final_check = run_node(
                EXPORTER,
                "--check-public-js",
                "--public-config",
                str(fixture.config),
                "--public-js",
                str(fixture.receipt),
                "--document-root",
                str(fixture.workspace),
            )
            self.assertEqual(final_check.returncode, 0, final_check.stderr)


if __name__ == "__main__":
    unittest.main()
