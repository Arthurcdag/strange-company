from __future__ import annotations

import pathlib
import unittest


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


class PublicAmaTests(unittest.TestCase):
    def test_public_ama_surface_exists(self) -> None:
        html = PUBLIC_HTML.read_text(encoding="utf-8")

        self.assertIn('id="publicAmaForm"', html)
        self.assertIn('id="publicAmaOutput"', html)
        self.assertIn('id="publicAmaAnswers"', html)
        self.assertIn('src="public-ama-answers.js"', html)
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

        self.assertNotIn("fetch(", js)
        self.assertNotIn("localStorage", js)
        self.assertIn("if (!readiness.liveReady)", js)
        self.assertIn("window.PUBLIC_AMA_ANSWERS", PUBLIC_AMA_ANSWERS_JS.read_text(encoding="utf-8"))

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
