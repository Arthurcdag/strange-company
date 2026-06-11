from __future__ import annotations

import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC_HTML = ROOT / "public.html"
PUBLIC_JS = ROOT / "public.js"
PUBLIC_AMA = ROOT / "PUBLIC_AMA.md"
README = ROOT / "README.md"
PREFLIGHT = ROOT / "tools" / "preflight_public_launch.js"
AUDIT = ROOT / "tools" / "audit_company_functionality.js"
SURVIVAL = ROOT / "tools" / "survival_check.js"


class PublicAmaTests(unittest.TestCase):
    def test_public_ama_surface_exists(self) -> None:
        html = PUBLIC_HTML.read_text(encoding="utf-8")

        self.assertIn('id="publicAmaForm"', html)
        self.assertIn('id="publicAmaOutput"', html)
        self.assertIn('href="PUBLIC_AMA.md"', html)
        self.assertIn("Online AMA", html)

    def test_public_ama_javascript_keeps_safe_boundary(self) -> None:
        js = PUBLIC_JS.read_text(encoding="utf-8")

        for snippet in (
            "amaQuestionPacket",
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

    def test_public_ama_runbook_and_guards_are_indexed(self) -> None:
        self.assertIn("PUBLIC_AMA.md", README.read_text(encoding="utf-8"))
        self.assertIn("public-safe question intake", PUBLIC_AMA.read_text(encoding="utf-8"))

        for path in (PREFLIGHT, AUDIT, SURVIVAL):
            text = path.read_text(encoding="utf-8")
            with self.subTest(file=path.name):
                self.assertIn("publicAmaForm", text)
                self.assertIn("amaQuestionPacket", text)


if __name__ == "__main__":
    unittest.main()
