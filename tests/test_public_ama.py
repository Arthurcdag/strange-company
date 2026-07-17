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
REVIEW_DOCUMENT_DIGEST_DOMAIN = "STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1"
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


def public_review_document_contents() -> dict[str, str]:
    return {
        document_path: (ROOT / document_path).read_text(encoding="utf-8")
        for document_path in REVIEW_DOCUMENT_PATHS
    }


def review_document_digest(document_path: str, contents: str) -> str:
    normalized = contents.removeprefix("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    payload = f"{REVIEW_DOCUMENT_DIGEST_DOMAIN}\npath={document_path}\n{normalized}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def review_document_core(contents: dict[str, str] | None = None) -> dict[str, str]:
    documents = public_review_document_contents() if contents is None else contents
    return {
        document_path: review_document_digest(document_path, documents[document_path])
        for document_path in REVIEW_DOCUMENT_PATHS
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
    review_documents: dict[str, str] | None = None,
    served_receipt: dict[str, object] | None = None,
    refresh_from_server: bool = False,
) -> dict[str, object]:
    documents = public_review_document_contents() if review_documents is None else review_documents
    served_receipt_payload = receipt if served_receipt is None else served_receipt
    receipt_script = render_receipt(served_receipt_payload)
    with tempfile.TemporaryDirectory() as fixture_tmp:
        documents_path = pathlib.Path(fixture_tmp) / "review-documents.json"
        documents_path.write_text(
            json.dumps(documents, ensure_ascii=False),
            encoding="utf-8",
        )
        runner = f"""
      const fs = require("fs");
      const vm = require("vm");
      const reviewDocuments = JSON.parse(fs.readFileSync({json.dumps(str(documents_path))}, "utf8"));
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
          const found = Object.prototype.hasOwnProperty.call(reviewDocuments, key);
          return {{ ok: found, text: async () => found ? reviewDocuments[key] : "" }};
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


def run_browser_refresh_probe(
    receipts: list[dict[str, object]],
    probe_source: str,
    *,
    config: dict[str, object] | None = None,
) -> dict[str, object]:
    public_config = config or ready_public_config(live_mode=True)
    documents = public_review_document_contents()
    receipt_scripts = [render_receipt(receipt) for receipt in receipts]
    with tempfile.TemporaryDirectory() as fixture_tmp:
        documents_path = pathlib.Path(fixture_tmp) / "review-documents.json"
        documents_path.write_text(
            json.dumps(documents, ensure_ascii=False),
            encoding="utf-8",
        )
        runner = f"""
          const fs = require("fs");
          const vm = require("vm");
          const reviewDocuments = JSON.parse(fs.readFileSync({json.dumps(str(documents_path))}, "utf8"));
          const receiptScripts = {json.dumps(receipt_scripts)};
          let receiptFetches = 0;
          let documentFetches = 0;
          const context = {{
            window: {{
              PUBLIC_ORDER_CONFIG: {json.dumps(public_config)},
              PUBLIC_LIVE_RECEIPT: {json.dumps(receipts[0] if receipts else {})},
              setTimeout() {{ return 1; }},
              clearTimeout() {{}},
              setInterval() {{ return 1; }},
            }},
            document: {{ addEventListener() {{}}, querySelector() {{ return null; }}, visibilityState: "visible" }},
            crypto: require("crypto").webcrypto,
            TextEncoder,
            Intl,
            URL,
            fetch: async (resource) => {{
              const key = String(resource);
              if (key === "public-live-receipt.js") {{
                const index = Math.min(receiptFetches, receiptScripts.length - 1);
                receiptFetches += 1;
                return {{ ok: index >= 0, text: async () => index >= 0 ? receiptScripts[index] : "" }};
              }}
              documentFetches += 1;
              const found = Object.prototype.hasOwnProperty.call(reviewDocuments, key);
              return {{ ok: found, text: async () => found ? reviewDocuments[key] : "" }};
            }},
          }};
          vm.createContext(context);
          vm.runInContext(fs.readFileSync({json.dumps(str(PUBLIC_JS))}, "utf8"), context);
          (async () => {{
            {probe_source}
          }})().catch((error) => {{ console.error(error); process.exit(1); }});
        """
        result = subprocess.run(
            ["node", "-e", runner],
            cwd=ROOT,
            check=False,
            encoding="utf-8",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=15,
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
        f"STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2\n{core_json}".encode("utf-8")
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
    envelope_json = json.dumps(envelope, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    receipt["envelopeSha256"] = hashlib.sha256(
        f"STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V4\n{envelope_json}".encode("utf-8")
    ).hexdigest()
    return receipt


def issued_receipt(
    config: dict[str, object], generation: int = 1
) -> dict[str, object]:
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
        "reviewDocuments": review_document_core(),
        "services": config["services"],
    }
    issued_at = datetime.now(timezone.utc).replace(microsecond=0)
    valid_until = issued_at + timedelta(days=7)
    receipt = {
        "schemaVersion": 4,
        "generation": generation,
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
            "liveReviewClosureValidatorPassed": True,
            "reviewerCandidateTrackerReady": True,
            "deliveryReviewChecklistReady": True,
            "operationalValidatorsPassed": True,
            "digestCoversCanonicalPublicCoreExceptLiveMode": True,
            "digestCoversReceiptEnvelopeExceptLiveMode": True,
        },
    }
    return recompute_receipt_digests(receipt)


def placeholder_receipt(
    config: dict[str, object], generation: int
) -> dict[str, object]:
    receipt = issued_receipt(config, generation)
    receipt["status"] = "not_issued"
    receipt["issuedAt"] = ""
    receipt["validUntil"] = ""
    receipt["coreSha256"] = ""
    receipt["envelopeSha256"] = ""
    for field in (
        "localPacketValidatorsPassed",
        "liveReviewClosureValidatorPassed",
        "reviewerCandidateTrackerReady",
        "deliveryReviewChecklistReady",
        "operationalValidatorsPassed",
    ):
        receipt["attestations"][field] = False
    return receipt


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
        self.assertIn("PUBLIC_LIVE_RECEIPT_REFRESH_IN_FLIGHT", js)
        self.assertIn("PUBLIC_LIVE_RECEIPT_REFRESH_CURRENT_PASS_FORCED", js)
        self.assertIn("PUBLIC_LIVE_RECEIPT_REFRESH_CURRENT_PASS_REVALIDATES_DOCUMENTS", js)
        self.assertIn("PUBLIC_LIVE_RECEIPT_FORCE_REVALIDATION_REQUESTED", js)
        self.assertIn("PUBLIC_REVIEW_DOCUMENT_VERIFICATION_TTL_MS = 15 * 60 * 1000", js)
        self.assertIn('document.addEventListener("visibilitychange"', js)
        self.assertIn("controller.abort()", js)
        self.assertIn("5000", js)
        self.assertIn('"STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1"', js)
        self.assertIn("Promise.all(PUBLIC_REVIEW_DOCUMENT_PATHS.map", js)
        self.assertIn("receipt.schemaVersion === 4", js)
        self.assertIn("HIGHEST_PUBLIC_LIVE_RECEIPT_GENERATION", js)
        self.assertIn("STRANGE_COMPANY_PUBLIC_LIVE_CORE_V2", js)
        self.assertIn("STRANGE_COMPANY_PUBLIC_LIVE_RECEIPT_V4", js)
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
            "await refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });",
            paid_setup,
        )

        ama_setup = js[js.index("function setupAmaForm()") : js.index("function renderPacket(")]
        self.assertNotIn("refreshPublicLiveReceiptVerification", ama_setup)
        dom_ready = js[js.index('document.addEventListener("DOMContentLoaded"') :]
        self.assertNotIn('document.addEventListener("DOMContentLoaded", async', dom_ready)
        self.assertLess(dom_ready.index("setupAmaForm();"), dom_ready.index("refreshPublicLiveReceiptVerification"))
        self.assertLess(dom_ready.index("setupForm();"), dom_ready.index("refreshPublicLiveReceiptVerification"))

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

    def test_dom_ready_attaches_handlers_before_receipt_fetch_and_ama_is_independent(self) -> None:
        config = ready_public_config(live_mode=True)
        config["supportInboxVerified"] = False
        receipt_script = render_receipt({})
        runner = f"""
          const fs = require("fs");
          const vm = require("vm");
          const handlers = {{}};
          const documentHandlers = {{}};
          const makeElement = (name) => ({{
            hidden: false,
            disabled: false,
            value: "",
            innerHTML: "",
            classList: {{ add() {{}} }},
            setAttribute() {{}},
            reset() {{}},
            addEventListener(type, callback) {{ handlers[`${{name}}:${{type}}`] = callback; }}
          }});
          const elements = {{
            "#publicAmaForm": makeElement("ama"),
            "#publicAmaOutput": makeElement("ama-output"),
            "#publicOrderForm": makeElement("order"),
            "#publicOrderFields": makeElement("order-fields"),
            "#publicOrderClosed": makeElement("order-closed"),
            "#publicService": makeElement("service"),
            "#publicAmount": makeElement("amount")
          }};
          let receiptFetches = 0;
          let documentFetches = 0;
          let resolveReceipt;
          const context = {{
            window: {{
              PUBLIC_ORDER_CONFIG: {json.dumps(config)},
              PUBLIC_LIVE_RECEIPT: {{}},
              setTimeout() {{ return 1; }},
              clearTimeout() {{}},
              setInterval() {{ return 1; }}
            }},
            document: {{
              visibilityState: "visible",
              querySelector(selector) {{ return elements[selector] || null; }},
              addEventListener(type, callback) {{ documentHandlers[type] = callback; }}
            }},
            crypto: require("crypto").webcrypto,
            TextEncoder,
            Intl,
            URL,
            fetch: async (resource) => {{
              if (String(resource) === "public-live-receipt.js") {{
                receiptFetches += 1;
                return new Promise((resolve) => {{
                  resolveReceipt = () => resolve({{ ok: true, text: async () => {json.dumps(receipt_script)} }});
                }});
              }}
              documentFetches += 1;
              return {{ ok: false, text: async () => "" }};
            }}
          }};
          vm.createContext(context);
          vm.runInContext(fs.readFileSync({json.dumps(str(PUBLIC_JS))}, "utf8"), context);
          (async () => {{
            const domReturnValue = documentHandlers.DOMContentLoaded();
            const handlersAttachedImmediately = Boolean(handlers["ama:submit"] && handlers["order:submit"]);
            const fetchesBeforeAma = receiptFetches;
            handlers["ama:submit"]({{ preventDefault() {{}} }});
            const amaTriggeredReceiptFetch = receiptFetches !== fetchesBeforeAma;
            const amaTriggeredDocumentFetch = documentFetches !== 0;
            resolveReceipt();
            await context.waitForLatestPublicLiveReceiptRefresh();
            process.stdout.write(JSON.stringify({{
              domReturnedPromise: Boolean(domReturnValue && typeof domReturnValue.then === "function"),
              handlersAttachedImmediately,
              amaTriggeredReceiptFetch,
              amaTriggeredDocumentFetch,
              receiptFetches,
              documentFetches
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

        self.assertFalse(outcome["domReturnedPromise"])
        self.assertTrue(outcome["handlersAttachedImmediately"])
        self.assertFalse(outcome["amaTriggeredReceiptFetch"])
        self.assertFalse(outcome["amaTriggeredDocumentFetch"])
        self.assertEqual(outcome["receiptFetches"], 1)
        self.assertEqual(outcome["documentFetches"], 0)

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
        drifted_documents = public_review_document_contents()
        drifted_documents["AI_LEGAL_HANDOFF.md"] += "\nMaterial review drift after receipt issuance.\n"
        review_document_drift = evaluate_public_readiness(
            config,
            valid_receipt,
            review_documents=drifted_documents,
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
        self.assertFalse(review_document_drift["receiptReady"])
        self.assertFalse(review_document_drift["liveReady"])

    def test_review_document_manifest_fails_closed_on_shape_and_fetch_drift(self) -> None:
        config = ready_public_config(live_mode=True)

        malformed_receipts: list[dict[str, object]] = []

        missing = issued_receipt(config)
        del missing["core"]["reviewDocuments"]["HUMAN_REVIEW_PACKET.md"]
        malformed_receipts.append(recompute_receipt_digests(missing))

        extra = issued_receipt(config)
        extra["core"]["reviewDocuments"]["UNREVIEWED.md"] = "a" * 64
        malformed_receipts.append(recompute_receipt_digests(extra))

        substituted = issued_receipt(config)
        digest = substituted["core"]["reviewDocuments"].pop("BRAZIL_COMPLIANCE.md")
        substituted["core"]["reviewDocuments"]["docs/BRAZIL_COMPLIANCE.md"] = digest
        malformed_receipts.append(recompute_receipt_digests(substituted))

        uppercase = issued_receipt(config)
        uppercase["core"]["reviewDocuments"]["TERMS.md"] = "A" * 64
        malformed_receipts.append(recompute_receipt_digests(uppercase))

        for receipt in malformed_receipts:
            with self.subTest(review_documents=receipt["core"]["reviewDocuments"]):
                model = evaluate_public_readiness(config, receipt)
                self.assertFalse(model["receiptReady"])
                self.assertFalse(model["liveReady"])

        unavailable_documents = public_review_document_contents()
        del unavailable_documents["CONKA8_LAW_INSTRUCTIONS.md"]
        unavailable = evaluate_public_readiness(
            config,
            issued_receipt(config),
            review_documents=unavailable_documents,
        )
        self.assertFalse(unavailable["receiptReady"])
        self.assertFalse(unavailable["liveReady"])

    def test_review_document_hashes_normalize_bom_and_line_endings(self) -> None:
        config = ready_public_config(live_mode=True)
        documents = public_review_document_contents()
        normalized = (
            documents["BRAZIL_COMPLIANCE_AGENTS.md"]
            .removeprefix("\ufeff")
            .replace("\r\n", "\n")
            .replace("\r", "\n")
        )
        documents["BRAZIL_COMPLIANCE_AGENTS.md"] = "\ufeff" + normalized.replace("\n", "\r\n")

        model = evaluate_public_readiness(
            config,
            issued_receipt(config),
            review_documents=documents,
        )

        self.assertTrue(model["receiptReady"])
        self.assertTrue(model["liveReady"])

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

    def test_open_page_generation_high_water_rejects_post_revoke_replay(self) -> None:
        config = ready_public_config(live_mode=True)
        active_one = issued_receipt(config, generation=1)
        revoked_two = placeholder_receipt(config, generation=2)
        active_three = issued_receipt(config, generation=3)

        outcome = run_browser_refresh_probe(
            [active_one, revoked_two, active_one, active_three],
            """
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterIssue = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterRevoke = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterReplay = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterNewIssue = context.publicReadinessModel();
              const highWater = vm.runInContext("HIGHEST_PUBLIC_LIVE_RECEIPT_GENERATION", context);
              process.stdout.write(JSON.stringify({
                afterIssue,
                afterRevoke,
                afterReplay,
                afterNewIssue,
                highWater,
                receiptFetches,
                documentFetches
              }));
            """,
            config=config,
        )

        self.assertTrue(outcome["afterIssue"]["liveReady"])
        self.assertFalse(outcome["afterRevoke"]["liveReady"])
        self.assertFalse(outcome["afterReplay"]["receiptReady"])
        self.assertFalse(outcome["afterReplay"]["liveReady"])
        self.assertTrue(outcome["afterNewIssue"]["liveReady"])
        self.assertEqual(outcome["highWater"], 3)
        self.assertEqual(outcome["receiptFetches"], 4)
        self.assertEqual(outcome["documentFetches"], 18)

    def test_loaded_placeholder_generation_blocks_older_and_same_generation_active_receipts(self) -> None:
        config = ready_public_config(live_mode=True)
        revoked_two = placeholder_receipt(config, generation=2)
        active_one = issued_receipt(config, generation=1)
        active_two = issued_receipt(config, generation=2)
        active_three = issued_receipt(config, generation=3)

        outcome = run_browser_refresh_probe(
            [revoked_two, active_one, active_two, active_three],
            """
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterLoadedPlaceholder = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterOldActive = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterSameGenerationActive = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterNewActive = context.publicReadinessModel();
              const highWater = vm.runInContext("HIGHEST_PUBLIC_LIVE_RECEIPT_GENERATION", context);
              process.stdout.write(JSON.stringify({
                afterLoadedPlaceholder,
                afterOldActive,
                afterSameGenerationActive,
                afterNewActive,
                highWater,
                receiptFetches,
                documentFetches
              }));
            """,
            config=config,
        )

        self.assertFalse(outcome["afterLoadedPlaceholder"]["liveReady"])
        self.assertFalse(outcome["afterOldActive"]["receiptReady"])
        self.assertFalse(outcome["afterOldActive"]["liveReady"])
        self.assertFalse(outcome["afterSameGenerationActive"]["receiptReady"])
        self.assertFalse(outcome["afterSameGenerationActive"]["liveReady"])
        self.assertTrue(outcome["afterNewActive"]["liveReady"])
        self.assertEqual(outcome["highWater"], 3)
        self.assertEqual(outcome["receiptFetches"], 4)
        self.assertEqual(outcome["documentFetches"], 9)

    def test_same_generation_active_fork_is_rejected_but_exact_repeat_is_allowed(self) -> None:
        config = ready_public_config(live_mode=True)
        active_one = issued_receipt(config, generation=1)
        fork_one = issued_receipt(config, generation=1)
        fork_time = datetime.now(timezone.utc).replace(microsecond=0) - timedelta(minutes=3)
        fork_one["issuedAt"] = fork_time.isoformat(timespec="milliseconds").replace(
            "+00:00", "Z"
        )
        fork_one["validUntil"] = (fork_time + timedelta(days=7)).isoformat(
            timespec="milliseconds"
        ).replace("+00:00", "Z")
        recompute_receipt_digests(fork_one)
        active_two = issued_receipt(config, generation=2)

        outcome = run_browser_refresh_probe(
            [active_one, active_one, fork_one, active_two],
            """
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterInitial = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterExactRepeat = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterFork = context.publicReadinessModel();
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterHigherGeneration = context.publicReadinessModel();
              const identity = vm.runInContext("HIGHEST_PUBLIC_LIVE_RECEIPT_IDENTITY", context);
              process.stdout.write(JSON.stringify({
                afterInitial,
                afterExactRepeat,
                afterFork,
                afterHigherGeneration,
                identity,
                receiptFetches,
                documentFetches
              }));
            """,
            config=config,
        )

        self.assertTrue(outcome["afterInitial"]["liveReady"])
        self.assertTrue(outcome["afterExactRepeat"]["liveReady"])
        self.assertFalse(outcome["afterFork"]["receiptReady"])
        self.assertFalse(outcome["afterFork"]["liveReady"])
        self.assertTrue(outcome["afterHigherGeneration"]["liveReady"])
        self.assertTrue(outcome["identity"].endswith(active_two["envelopeSha256"]))
        self.assertEqual(outcome["receiptFetches"], 4)
        self.assertEqual(outcome["documentFetches"], 27)

    def test_receipt_refresh_coalesces_and_bounds_document_rechecks(self) -> None:
        config = ready_public_config(live_mode=True)
        active_receipt = issued_receipt(config)
        changed_receipt = issued_receipt(config, generation=2)
        changed_issued_at = datetime.now(timezone.utc).replace(microsecond=0) - timedelta(minutes=2)
        changed_receipt["issuedAt"] = changed_issued_at.isoformat(timespec="milliseconds").replace("+00:00", "Z")
        changed_receipt["validUntil"] = (changed_issued_at + timedelta(days=7)).isoformat(
            timespec="milliseconds"
        ).replace("+00:00", "Z")
        recompute_receipt_digests(changed_receipt)

        outcome = run_browser_refresh_probe(
            [active_receipt, active_receipt, active_receipt, active_receipt, changed_receipt],
            """
              const firstForced = context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const secondForced = context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const forcedCallsCoalesced = firstForced === secondForced;
              await Promise.all([firstForced, secondForced]);
              const afterCoalesced = { receiptFetches, documentFetches };

              await context.refreshPublicLiveReceiptVerification();
              const afterLightweightPoll = { receiptFetches, documentFetches };

              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterForcedRecheck = { receiptFetches, documentFetches };

              vm.runInContext(
                "PUBLIC_REVIEW_DOCUMENTS_VERIFIED_AT -= PUBLIC_REVIEW_DOCUMENT_VERIFICATION_TTL_MS + 1",
                context
              );
              await context.refreshPublicLiveReceiptVerification();
              const afterTtlExpiry = { receiptFetches, documentFetches };

              await context.refreshPublicLiveReceiptVerification();
              const afterEnvelopeChange = { receiptFetches, documentFetches };
              process.stdout.write(JSON.stringify({
                forcedCallsCoalesced,
                afterCoalesced,
                afterLightweightPoll,
                afterForcedRecheck,
                afterTtlExpiry,
                afterEnvelopeChange,
                finalReadiness: context.publicReadinessModel()
              }));
            """,
            config=config,
        )

        self.assertTrue(outcome["forcedCallsCoalesced"])
        self.assertEqual(outcome["afterCoalesced"], {"receiptFetches": 1, "documentFetches": 9})
        self.assertEqual(outcome["afterLightweightPoll"], {"receiptFetches": 2, "documentFetches": 9})
        self.assertEqual(outcome["afterForcedRecheck"], {"receiptFetches": 3, "documentFetches": 18})
        self.assertEqual(outcome["afterTtlExpiry"], {"receiptFetches": 4, "documentFetches": 27})
        self.assertEqual(outcome["afterEnvelopeChange"], {"receiptFetches": 5, "documentFetches": 36})
        self.assertTrue(outcome["finalReadiness"]["liveReady"])

    def test_malformed_and_placeholder_receipts_skip_document_fetches(self) -> None:
        config = ready_public_config(live_mode=True)
        malformed = issued_receipt(config)
        del malformed["core"]["reviewDocuments"]["HUMAN_REVIEW_PACKET.md"]
        recompute_receipt_digests(malformed)

        outcome = run_browser_refresh_probe(
            [{}, malformed],
            """
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              await Promise.resolve();
              const afterPlaceholder = { receiptFetches, documentFetches };
              await context.refreshPublicLiveReceiptVerification({ forceDocumentCheck: true });
              const afterMalformed = { receiptFetches, documentFetches };
              process.stdout.write(JSON.stringify({
                afterPlaceholder,
                afterMalformed,
                readiness: context.publicReadinessModel()
              }));
            """,
            config=config,
        )

        self.assertEqual(outcome["afterPlaceholder"], {"receiptFetches": 1, "documentFetches": 0})
        self.assertEqual(outcome["afterMalformed"], {"receiptFetches": 2, "documentFetches": 0})
        self.assertFalse(outcome["readiness"]["receiptReady"])
        self.assertFalse(outcome["readiness"]["liveReady"])

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
