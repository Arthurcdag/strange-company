from __future__ import annotations

import json
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]

INSTRUCTIONS = ROOT / "HUMAN_REVENUE_INSTRUCTIONS.md"
EVIDENCE_PACKET = ROOT / "REVENUE_SETUP_EVIDENCE_PACKET.md"
OUTREACH_PACKET = ROOT / "REVENUE_SETUP_OUTREACH_PACKET.md"
EVIDENCE_INDEX_TEMPLATE = ROOT / "REVENUE_SETUP_EVIDENCE_INDEX.template.json"
README = ROOT / "README.md"
GITIGNORE = ROOT / ".gitignore"


class RevenueSetupPacketTests(unittest.TestCase):
    def test_required_files_exist(self) -> None:
        for path in (
            INSTRUCTIONS,
            EVIDENCE_PACKET,
            OUTREACH_PACKET,
            EVIDENCE_INDEX_TEMPLATE,
        ):
            with self.subTest(file=path.name):
                self.assertTrue(path.exists(), f"missing {path.name}")

    def test_evidence_index_template_parses(self) -> None:
        data = json.loads(EVIDENCE_INDEX_TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "template")

    def test_evidence_index_template_has_seven_gate_sections(self) -> None:
        data = json.loads(EVIDENCE_INDEX_TEMPLATE.read_text(encoding="utf-8"))

        for section in (
            "operator",
            "entity",
            "tax",
            "payment",
            "support",
            "privacy",
            "terms",
            "ledger",
            "publicConfig",
            "attestation",
        ):
            with self.subTest(section=section):
                self.assertIn(section, data)
                self.assertIsInstance(data[section], dict)

    def test_evidence_index_template_keeps_live_mode_false(self) -> None:
        data = json.loads(EVIDENCE_INDEX_TEMPLATE.read_text(encoding="utf-8"))

        self.assertFalse(data["publicConfig"]["liveMode"])
        self.assertFalse(data["publicConfig"]["supportInboxVerified"])
        self.assertFalse(data["publicConfig"]["googleFormVerified"])

    def test_evidence_index_template_records_satellite_revenue_posture(self) -> None:
        data = json.loads(EVIDENCE_INDEX_TEMPLATE.read_text(encoding="utf-8"))

        self.assertEqual(data["publicConfig"]["operatorName"], "Strange Works Studio")
        self.assertTrue(data["attestation"]["strangeCompanyRemainsSealed"])
        self.assertTrue(data["attestation"]["satelliteIsRevenueOperator"])
        self.assertTrue(data["attestation"]["aiDidNotApproveLegalTaxPaymentOrPrivacy"])

    def test_instructions_cross_reference_packets(self) -> None:
        text = INSTRUCTIONS.read_text(encoding="utf-8")

        for reference in (
            "REVENUE_SETUP_EVIDENCE_PACKET.md",
            "REVENUE_SETUP_OUTREACH_PACKET.md",
            "REVENUE_SETUP_EVIDENCE_INDEX.template.json",
            "tools/draft_revenue_setup_evidence_index.js",
            "tools/validate_revenue_setup_evidence_index.js",
        ):
            with self.subTest(reference=reference):
                self.assertIn(reference, text)

    def test_evidence_packet_cross_references_instructions_and_outreach(self) -> None:
        text = EVIDENCE_PACKET.read_text(encoding="utf-8")

        for reference in (
            "HUMAN_REVENUE_INSTRUCTIONS.md",
            "REVENUE_SETUP_OUTREACH_PACKET.md",
            "REVENUE_SETUP_EVIDENCE_INDEX.template.json",
            "tools/draft_revenue_setup_evidence_index.js",
            "tools/validate_revenue_setup_evidence_index.js",
        ):
            with self.subTest(reference=reference):
                self.assertIn(reference, text)

    def test_outreach_packet_cross_references_instructions_and_evidence(self) -> None:
        text = OUTREACH_PACKET.read_text(encoding="utf-8")

        for reference in (
            "HUMAN_REVENUE_INSTRUCTIONS.md",
            "REVENUE_SETUP_EVIDENCE_PACKET.md",
            "REVENUE_SETUP_EVIDENCE_INDEX.template.json",
        ):
            with self.subTest(reference=reference):
                self.assertIn(reference, text)

    def test_outreach_packet_keeps_stripe_only_allowlist_text(self) -> None:
        text = OUTREACH_PACKET.read_text(encoding="utf-8")

        self.assertIn("https://invoice.stripe.com/", text)

    def test_readme_lists_new_files(self) -> None:
        text = README.read_text(encoding="utf-8")

        for reference in (
            "HUMAN_REVENUE_INSTRUCTIONS.md",
            "REVENUE_SETUP_EVIDENCE_PACKET.md",
            "REVENUE_SETUP_OUTREACH_PACKET.md",
            "REVENUE_SETUP_EVIDENCE_INDEX.template.json",
            "tools/draft_revenue_setup_evidence_index.js",
            "tools/validate_revenue_setup_evidence_index.js",
        ):
            with self.subTest(reference=reference):
                self.assertIn(reference, text)

    def test_gitignore_keeps_local_index_out_and_template_in(self) -> None:
        text = GITIGNORE.read_text(encoding="utf-8")

        self.assertIn("REVENUE_SETUP_EVIDENCE_INDEX.local.json", text)
        self.assertIn("REVENUE_SETUP_EVIDENCE_INDEX.*.json", text)
        self.assertIn("!REVENUE_SETUP_EVIDENCE_INDEX.template.json", text)


if __name__ == "__main__":
    unittest.main()
