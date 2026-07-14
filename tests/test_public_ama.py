from __future__ import annotations

import json
import hashlib
import pathlib
import subprocess
import tempfile
import unittest
from datetime import datetime, timedelta, timezone


ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC_HTML = ROOT / "public.html"
PUBLIC_JS = ROOT / "public.js"
PUBLIC_AMA_ANSWERS_JS = ROOT / "public-ama-answers.js"
PUBLIC_AMA = ROOT / "PUBLIC_AMA.md"
PUBLIC_AMA_PUBLICATION_PACKET = ROOT / "PUBLIC_AMA_PUBLICATION_PACKET.md"
README = ROOT / "README.md"
PREFLIGHT = ROOT / "tools" / "preflight_public_launch.js"
AUDIT = ROOT / "tools" / "audit_company_functionality.js"
SURVIVAL = ROOT / "tools" / "survival_check.js"
LEGAL_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_LEGAL_DOCUMENT_V1"
LEGAL_DOCUMENT_PATHS = ("TERMOS.md", "AVISO_DE_PRIVACIDADE.md")


def public_legal_document_contents() -> dict[str, str]:
    return {
        document_path: (ROOT / document_path).read_text(encoding="utf-8")
        for document_path in LEGAL_DOCUMENT_PATHS
    }


def legal_document_digest(document_path: str, contents: str) -> str:
    normalized = contents.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{LEGAL_DOCUMENT_DIGEST_DOMAIN}\npath={document_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def legal_document_core(contents: dict[str, str] | None = None) -> dict[str, object]:
    documents = contents or public_legal_document_contents()
    return {
        "terms": {
            "path": "TERMOS.md",
            "sha256": legal_document_digest("TERMOS.md", documents["TERMOS.md"]),
        },
        "privacy": {
            "path": "AVISO_DE_PRIVACIDADE.md",
            "sha256": legal_document_digest(
                "AVISO_DE_PRIVACIDADE.md", documents["AVISO_DE_PRIVACIDADE.md"]
            ),
        },
    }


def render_receipt(receipt: dict[str, object]) -> str:
    return (
        "window.PUBLIC_LIVE_RECEIPT = Object.freeze("
        f"{json.dumps(receipt, ensure_ascii=False, indent=2)}"
        ");\n"
    )


def evaluate_public_readiness(
    config: dict[str, object],
    receipt: dict[str, object],
    readiness_now_ms: int | None = None,
    legal_documents: dict[str, str] | None = None,
    served_receipt: dict[str, object] | None = None,
    refresh_from_server: bool = False,
) -> dict[str, object]:
    documents = legal_documents or public_legal_document_contents()
    served_receipt_payload = receipt if served_receipt is None else served_receipt
    receipt_script = render_receipt(served_receipt_payload)
    runner = f"""
      const fs = require("fs");
      const vm = require("vm");
      const legalDocuments = {json.dumps(documents)};
      const receiptScript = {json.dumps(receipt_script)};
      const context = {{
        window: {{ PUBLIC_ORDER_CONFIG: {json.dumps(config)}, PUBLIC_LIVE_RECEIPT: {json.dumps(receipt)} }},
        document: {{ addEventListener() {{}}, querySelector() {{ return null; }}, visibilityState: "visible" }},
        crypto: require("crypto").webcrypto,
        TextEncoder,
        Intl,
        URL,
        fetch: async (resource) => {{
          const key = String(resource);
          if (key === "public-live-receipt.js") {{
            return {{ ok: true, text: async () => receiptScript }};
          }}
          const found = Object.prototype.hasOwnProperty.call(legalDocuments, key);
          return {{ ok: found, text: async () => found ? legalDocuments[key] : "" }};
        }},
      }};
      vm.createContext(context);
      vm.runInContext(fs.readFileSync({json.dumps(str(PUBLIC_JS))}, "utf8"), context);
      (async () => {{
        const readinessNow = {json.dumps(readiness_now_ms)};
        const refreshFromServer = {json.dumps(refresh_from_server)};
        if (refreshFromServer) {{
          await context.refreshPublicLiveReceiptVerification();
          process.stdout.write(JSON.stringify(context.publicReadinessModel(
            undefined,
            readinessNow === null ? Date.now() : readinessNow
          )));
          return;
        }}
        const receiptReady = await context.publicLiveReceiptReady();
        process.stdout.write(JSON.stringify(context.publicReadinessModel(
          receiptReady,
          readinessNow === null ? Date.now() : readinessNow
        )));
      }})().catch((error) => {{ console.error(error); process.exit(1); }});
    """
    result = subprocess.run(
        ["node", "-e", runner],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise AssertionError(result.stderr)
    return json.loads(result.stdout)


def ready_public_config(live_mode: bool = True) -> dict[str, object]:
    return {
        "operatorName": "Strange Works Studio",
        "jurisdiction": "BR",
        "complianceMode": "brazil-human-reviewed",
        "aiGeneratedLegalDocsRequireHumanReview": True,
        "supportEmail": "support@example.com",
        "googleFormUrl": "https://docs.google.com/forms/d/e/example/viewform",
        "supportInboxVerified": True,
        "googleFormVerified": True,
        "termsReviewedAt": "2026-07-14",
        "privacyReviewedAt": "2026-07-14",
        "brazilComplianceReviewedAt": "2026-07-14",
        "aiHandoffReviewedAt": "2026-07-14",
        "liveMode": live_mode,
        "services": [
            {
                "id": "proof-sprint",
                "title": "Compliance proof sprint",
                "detail": "Public test offer",
                "price": 750,
            }
        ],
    }


def recompute_receipt_digests(receipt: dict[str, object]) -> dict[str, object]:
    core = json.loads(json.dumps(receipt["core"]))
    core["flags"].pop("liveMode", None)
    core_json = json.dumps(core, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    receipt["coreSha256"] = hashlib.sha256(
        f"STRANGE_COMPANY_PUBLIC_LIVE_CORE_V1\n{core_json}".encode("utf-8")
    ).hexdigest()
    envelope = {
        "schemaVersion": receipt["schemaVersion"],
        "mode": receipt["mode"],
        "status": receipt["status"],
        "issuedAt": receipt["issuedAt"],
        "validUntil": receipt["validUntil"],
        "core": core,
        "coreSha256": receipt["coreSha256"],
        "attestations": receipt["attestations"],
    }
    envelope_json = json.dumps(envelope, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    receipt["envelopeSha256"] = hashlib.sha256(
        f"STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V2\n{envelope_json}".encode("utf-8")
    ).hexdigest()
    return receipt


def issued_receipt(config: dict[str, object]) -> dict[str, object]:
    core = {
        "operatorName": config["operatorName"],
        "jurisdiction": config["jurisdiction"],
        "complianceMode": config["complianceMode"],
        "aiGeneratedLegalDocsRequireHumanReview": True,
        "support": {"email": config["supportEmail"], "verified": True},
        "form": {"url": config["googleFormUrl"], "verified": True},
        "flags": {
            "supportInboxVerified": True,
            "googleFormVerified": True,
            "liveMode": False,
        },
        "reviewDates": {
            "termsReviewedAt": config["termsReviewedAt"],
            "privacyReviewedAt": config["privacyReviewedAt"],
            "brazilComplianceReviewedAt": config["brazilComplianceReviewedAt"],
            "aiHandoffReviewedAt": config["aiHandoffReviewedAt"],
        },
        "legalDocuments": legal_document_core(),
        "services": config["services"],
    }
    issued_at = datetime.now(timezone.utc).replace(microsecond=0)
    valid_until = issued_at + timedelta(days=7)
    receipt = {
        "schemaVersion": 2,
        "mode": "public",
        "status": "local_packet_validators_passed",
        "issuedAt": issued_at.isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "validUntil": valid_until.isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "core": core,
        "coreSha256": "",
        "attestations": {
            "publicOnly": True,
            "privatePacketDataExcluded": True,
            "privatePacketHashesExcluded": True,
            "localPacketValidatorsPassed": True,
            "reviewerCandidateTrackerReady": True,
            "deliveryReviewChecklistReady": True,
            "operationalValidatorsPassed": True,
            "digestCoversCanonicalPublicCoreExceptLiveMode": True,
            "digestCoversReceiptEnvelopeExceptLiveMode": True,
        },
    }
    return recompute_receipt_digests(receipt)


class PublicAmaTests(unittest.TestCase):
    def test_public_ama_surface_exists(self) -> None:
        html = PUBLIC_HTML.read_text(encoding="utf-8")

        self.assertIn('id="publicAmaForm"', html)
        self.assertIn('id="publicAmaOutput"', html)
        self.assertIn('id="publicAmaAnswers"', html)
        self.assertIn('src="public-ama-answers.js"', html)
        self.assertIn('src="public-live-receipt.js"', html)
        self.assertIn('href="PUBLIC_AMA.md"', html)
        self.assertIn("Online AMA", html)

    def test_public_ama_javascript_keeps_safe_boundary(self) -> None:
        js = PUBLIC_JS.read_text(encoding="utf-8")

        for snippet in (
            "amaQuestionPacket",
            "publicAmaAnswersModel",
            "renderPublicAmaAnswers",
            "setupAmaForm",
            "if (!readiness.supportReady)",
            "Public AMA Desk",
            "No order, invoice, payment request",
            "Brazil personal or company tax ID",
            "renderAmaBlocked",
        ):
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, js)

        self.assertIn('const requestOptions = { cache: "no-store", credentials: "same-origin" };', js)
        self.assertIn('fetchPublicAssetText("public-live-receipt.js")', js)
        self.assertIn("return JSON.parse(source.slice(prefix.length, -2));", js)
        self.assertNotIn("localStorage", js)
        self.assertIn("if (!readiness.liveReady)", js)
        self.assertIn("refreshPublicLiveReceiptVerification();", js)
        self.assertIn("await waitForLatestPublicLiveReceiptRefresh();", js)
        self.assertIn("PUBLIC_LIVE_RECEIPT_REFRESH_EPOCH", js)
        self.assertIn('document.addEventListener("visibilitychange"', js)
        self.assertIn("controller.abort()", js)
        self.assertIn("5000", js)
        self.assertIn("window.PUBLIC_AMA_ANSWERS", PUBLIC_AMA_ANSWERS_JS.read_text(encoding="utf-8"))

    def test_paid_order_desk_fails_closed_and_hands_off_to_ama(self) -> None:
        html = PUBLIC_HTML.read_text(encoding="utf-8")
        js = PUBLIC_JS.read_text(encoding="utf-8")
        paid_setup = js[js.index("function setupForm()") : js.index('document.addEventListener("DOMContentLoaded"')]

        closed_card = html[html.index('id="publicOrderClosed"'):html.index('id="publicOrderForm"')]
        self.assertIn("This site is not accepting paid-intake details.", closed_card)
        self.assertIn("previously shared external intake", closed_card)
        self.assertIn('href="#ama"', closed_card)
        self.assertIn('id="publicOrderForm" hidden aria-hidden="true"', html)
        self.assertIn('id="publicOrderFields" hidden disabled', html)
        self.assertIn(
            "refreshPublicLiveReceiptVerification();\n    await waitForLatestPublicLiveReceiptRefresh();",
            paid_setup,
        )

        for snippet in (
            "function setPublicOrderAvailability()",
            "readiness.liveReady === true",
            "form.hidden = !liveReady",
            "fields.hidden = !liveReady",
            "fields.disabled = !liveReady",
            "closed.hidden = liveReady",
            "setPublicOrderAvailability();",
        ):
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, js)

    def test_live_mode_alone_cannot_open_paid_intake(self) -> None:
        config = ready_public_config(live_mode=True)

        valid_receipt = issued_receipt(config)
        without_receipt = evaluate_public_readiness(config, {})
        with_receipt = evaluate_public_readiness(config, valid_receipt)
        stale_receipt = json.loads(json.dumps(issued_receipt(config)))
        stale_receipt["core"]["services"][0]["price"] = 999
        stale = evaluate_public_readiness(config, stale_receipt)
        fake_digest_receipt = issued_receipt(config)
        fake_digest_receipt["coreSha256"] = "a" * 64
        fake_digest_receipt["envelopeSha256"] = "b" * 64
        fake_digest = evaluate_public_readiness(config, fake_digest_receipt)
        missing_capacity_receipt = issued_receipt(config)
        missing_capacity_receipt["attestations"]["operationalValidatorsPassed"] = False
        recompute_receipt_digests(missing_capacity_receipt)
        missing_capacity = evaluate_public_readiness(config, missing_capacity_receipt)
        extra_field_receipt = issued_receipt(config)
        extra_field_receipt["untrustedOverride"] = True
        extra_field = evaluate_public_readiness(config, extra_field_receipt)
        expiry_ms = int(
            datetime.fromisoformat(str(valid_receipt["validUntil"]).replace("Z", "+00:00")).timestamp()
            * 1000
        )
        expired_open_tab = evaluate_public_readiness(config, valid_receipt, expiry_ms + 1)
        drifted_documents = public_legal_document_contents()
        drifted_documents["TERMOS.md"] += "\nMaterial legal drift after receipt issuance.\n"
        legal_document_drift = evaluate_public_readiness(
            config,
            valid_receipt,
            legal_documents=drifted_documents,
        )

        self.assertFalse(without_receipt["receiptReady"])
        self.assertFalse(without_receipt["liveReady"])
        self.assertTrue(with_receipt["receiptReady"])
        self.assertTrue(with_receipt["liveReady"])
        self.assertFalse(stale["receiptReady"])
        self.assertFalse(stale["liveReady"])
        self.assertFalse(fake_digest["receiptReady"])
        self.assertFalse(fake_digest["liveReady"])
        self.assertFalse(missing_capacity["receiptReady"])
        self.assertFalse(missing_capacity["liveReady"])
        self.assertFalse(extra_field["receiptReady"])
        self.assertFalse(extra_field["liveReady"])
        self.assertFalse(expired_open_tab["receiptReady"])
        self.assertFalse(expired_open_tab["liveReady"])
        self.assertFalse(legal_document_drift["receiptReady"])
        self.assertFalse(legal_document_drift["liveReady"])

    def test_server_side_receipt_revocation_closes_an_already_open_page(self) -> None:
        from tests.test_public_live_receipt import read_receipt

        config = ready_public_config(live_mode=True)
        active_receipt = issued_receipt(config)
        revoked_receipt = read_receipt(ROOT / "public-live-receipt.js")

        before_revalidation = evaluate_public_readiness(config, active_receipt)
        after_revalidation = evaluate_public_readiness(
            config,
            active_receipt,
            served_receipt=revoked_receipt,
            refresh_from_server=True,
        )

        self.assertTrue(before_revalidation["liveReady"])
        self.assertFalse(after_revalidation["receiptReady"])
        self.assertFalse(after_revalidation["liveReady"])

    def test_newer_revocation_wins_when_receipt_refreshes_finish_out_of_order(self) -> None:
        from tests.test_public_live_receipt import read_receipt

        config = ready_public_config(live_mode=True)
        active_receipt = issued_receipt(config)
        revoked_receipt = read_receipt(ROOT / "public-live-receipt.js")
        legal_documents = public_legal_document_contents()
        runner = f"""
          const fs = require("fs");
          const vm = require("vm");
          const legalDocuments = {json.dumps(legal_documents)};
          const receiptScripts = [
            {json.dumps(render_receipt(active_receipt))},
            {json.dumps(render_receipt(revoked_receipt))},
            {json.dumps(render_receipt(active_receipt))},
            {json.dumps(render_receipt(revoked_receipt))}
          ];
          const pendingReceiptResponses = [];
          let receiptFetchIndex = 0;
          const context = {{
            window: {{ PUBLIC_ORDER_CONFIG: {json.dumps(config)}, PUBLIC_LIVE_RECEIPT: {json.dumps(active_receipt)} }},
            document: {{ addEventListener() {{}}, querySelector() {{ return null; }}, visibilityState: "visible" }},
            crypto: require("crypto").webcrypto,
            TextEncoder,
            Intl,
            URL,
            fetch: async (resource) => {{
              const key = String(resource);
              if (key === "public-live-receipt.js") {{
                const body = receiptScripts[receiptFetchIndex++];
                return new Promise((resolve) => {{
                  pendingReceiptResponses.push(() => resolve({{ ok: true, text: async () => body }}));
                }});
              }}
              const found = Object.prototype.hasOwnProperty.call(legalDocuments, key);
              return {{ ok: found, text: async () => found ? legalDocuments[key] : "" }};
            }},
          }};
          vm.createContext(context);
          vm.runInContext(fs.readFileSync({json.dumps(str(PUBLIC_JS))}, "utf8"), context);
          (async () => {{
            const older = context.refreshPublicLiveReceiptVerification();
            const newer = context.refreshPublicLiveReceiptVerification();
            pendingReceiptResponses[1]();
            await newer;
            const afterNewer = context.publicReadinessModel();
            pendingReceiptResponses[0]();
            await older;
            const afterOlder = context.publicReadinessModel();

            const submitRefresh = context.refreshPublicLiveReceiptVerification();
            let submitWaitFinished = false;
            const submitWait = context.waitForLatestPublicLiveReceiptRefresh()
              .then((value) => {{ submitWaitFinished = true; return value; }});
            const newerDuringSubmit = context.refreshPublicLiveReceiptVerification();
            pendingReceiptResponses[2]();
            await submitRefresh;
            await Promise.resolve();
            const submitWaitedForNewer = !submitWaitFinished;
            pendingReceiptResponses[3]();
            await newerDuringSubmit;
            const submitVerified = await submitWait;
            const afterSubmitOverlap = context.publicReadinessModel();
            process.stdout.write(JSON.stringify({{
              afterNewer,
              afterOlder,
              submitWaitedForNewer,
              submitVerified,
              afterSubmitOverlap
            }}));
          }})().catch((error) => {{ console.error(error); process.exit(1); }});
        """
        result = subprocess.run(
            ["node", "-e", runner],
            cwd=ROOT,
            check=False,
            encoding="utf-8",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=10,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        outcome = json.loads(result.stdout)

        self.assertFalse(outcome["afterNewer"]["liveReady"])
        self.assertFalse(outcome["afterOlder"]["receiptReady"])
        self.assertFalse(outcome["afterOlder"]["liveReady"])
        self.assertTrue(outcome["submitWaitedForNewer"])
        self.assertFalse(outcome["submitVerified"])
        self.assertFalse(outcome["afterSubmitOverlap"]["liveReady"])

    def test_browser_accepts_an_untampered_real_exporter_receipt(self) -> None:
        from tests.test_public_live_receipt import (
            generation_args,
            read_receipt,
            ready_files,
            ready_public_config as exporter_public_config,
            run_exporter,
        )

        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config_path, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config_path, external, revenue, output))

            self.assertEqual(generated.returncode, 0, generated.stderr)
            model = evaluate_public_readiness(
                exporter_public_config(live_mode=True),
                read_receipt(output),
            )

        self.assertTrue(model["receiptReady"])
        self.assertTrue(model["liveReady"])

    def test_browser_and_exporter_share_trimmed_public_core_canonicalization(self) -> None:
        from tests.test_public_live_receipt import (
            generation_args,
            read_receipt,
            ready_files,
            ready_public_config as exporter_public_config,
            run_exporter,
            write_public_config,
        )

        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            config_path, external, revenue = ready_files(folder)
            output = folder / "public-live-receipt.js"
            generated = run_exporter(*generation_args(config_path, external, revenue, output))
            self.assertEqual(generated.returncode, 0, generated.stderr)

            padded = exporter_public_config(live_mode=True)
            for field in (
                "operatorName",
                "jurisdiction",
                "complianceMode",
                "supportEmail",
                "googleFormUrl",
                "termsReviewedAt",
                "privacyReviewedAt",
                "brazilComplianceReviewedAt",
                "aiHandoffReviewedAt",
            ):
                padded[field] = f"  {padded[field]}  "
            for service in padded["services"]:
                for field in ("id", "title", "detail"):
                    service[field] = f"  {service[field]}  "
            write_public_config(folder, padded)

            checked = run_exporter(
                "--check-public-js",
                "--public-js",
                str(output),
                "--public-config",
                str(config_path),
                "--require-issued",
            )
            self.assertEqual(checked.returncode, 0, checked.stderr)
            model = evaluate_public_readiness(padded, read_receipt(output))

        self.assertTrue(model["receiptReady"])
        self.assertTrue(model["liveReady"])

    def test_public_ama_runbook_and_guards_are_indexed(self) -> None:
        self.assertIn("PUBLIC_AMA.md", README.read_text(encoding="utf-8"))
        self.assertIn("PUBLIC_AMA_PUBLICATION_PACKET.md", README.read_text(encoding="utf-8"))
        self.assertIn("public-safe question intake", PUBLIC_AMA.read_text(encoding="utf-8"))
        self.assertIn("PUBLIC_AMA_QUEUE.local.json", PUBLIC_AMA.read_text(encoding="utf-8"))
        self.assertIn("Manual Close Sheet", PUBLIC_AMA_PUBLICATION_PACKET.read_text(encoding="utf-8"))
        self.assertIn("node tools/export_public_ama_answers.js", PUBLIC_AMA_PUBLICATION_PACKET.read_text(encoding="utf-8"))

        for path in (PREFLIGHT, AUDIT, SURVIVAL):
            text = path.read_text(encoding="utf-8")
            with self.subTest(file=path.name):
                self.assertIn("publicAmaForm", text)
                self.assertIn("amaQuestionPacket", text)
                self.assertIn("publicAmaAnswers", text)


if __name__ == "__main__":
    unittest.main()
