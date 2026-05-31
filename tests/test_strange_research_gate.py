from __future__ import annotations

import unittest

from tools.strange_research_gate import (
    StrangeGuardrailIssue,
    apply_strange_guardrails,
    detect_strange_guardrails,
)


class StrangeResearchGateGuardrailTests(unittest.TestCase):
    def test_blocks_replacing_human_reviewers(self) -> None:
        issues = detect_strange_guardrails(
            claim="VAU should replace human reviewers entirely",
            argument=(
                "Because VAU simulates futures, human reviewers are unnecessary "
                "for compliance, localization, and delivery quality."
            ),
        )

        self.assertIn("hard_human_review_required", {issue.code for issue in issues})

    def test_blocks_skipping_brazil_compliance(self) -> None:
        issues = detect_strange_guardrails(
            claim="Strange Company can skip LGPD review",
            argument="The reactive score accepts the argument, so privacy and Brazil compliance are optional.",
        )

        self.assertIn("hard_brazil_compliance_required", {issue.code for issue in issues})

    def test_blocks_live_mode_without_evidence(self) -> None:
        issues = detect_strange_guardrails(
            claim="Enable liveMode before verification",
            argument="We should go live without form, support, terms, privacy, or compliance evidence.",
        )

        self.assertIn("hard_live_evidence_required", {issue.code for issue in issues})

    def test_blocks_simulation_as_production_proof(self) -> None:
        issues = detect_strange_guardrails(
            claim="VAU proves live launch is safe",
            argument="The simulation guarantees client revenue and therefore live production is safe.",
        )

        self.assertIn("hard_simulation_is_not_proof", {issue.code for issue in issues})

    def test_blocks_fake_evidence(self) -> None:
        issues = detect_strange_guardrails(
            claim="Backdate review evidence",
            argument="We can invent verification evidence so the launch packet looks complete.",
        )

        self.assertIn("hard_no_fake_evidence", {issue.code for issue in issues})

    def test_vague_slop_verdict_requires_specifics(self) -> None:
        issues = detect_strange_guardrails(
            claim="Verdict: slop",
            argument="The Strange Company repository is slop.",
        )

        self.assertIn("critique_requires_specifics", {issue.code for issue in issues})
        self.assertEqual([issue for issue in issues if issue.severity == "error"], [])

    def test_actionable_repo_critique_routes_to_signal_noise_review(self) -> None:
        issues = detect_strange_guardrails(
            claim="The repo has too many docs",
            argument=(
                "README.md install steps are unclear, the dashboard value is hard "
                "to see, and VAU claims too much like a proof engine."
            ),
        )

        codes = {issue.code for issue in issues}
        self.assertIn("repo_signal_to_noise_review", codes)
        self.assertNotIn("critique_requires_specifics", codes)

    def test_allows_human_review_requirement_claim(self) -> None:
        issues = detect_strange_guardrails(
            claim="VAU should not replace human reviewers",
            argument=(
                "VAU can propose futures, but human review remains mandatory before "
                "client delivery or live-mode decisions."
            ),
        )

        self.assertEqual([issue for issue in issues if issue.severity == "error"], [])

    def test_guardrails_override_accept_recommendation(self) -> None:
        accepted_report = {
            "id": "eval_test",
            "recommendation": "accept",
            "effective_polarity": "effective_yes",
            "effectiveness_score": 0.875,
            "bogusness_score": 0.125,
            "confidence": 0.55,
            "issues": [],
            "probes": [],
        }
        guarded = apply_strange_guardrails(
            accepted_report,
            [
                StrangeGuardrailIssue(
                    code="hard_human_review_required",
                    severity="error",
                    message="Human review cannot be replaced.",
                    evidence="replace human reviewers",
                )
            ],
        )

        self.assertEqual(guarded["reactive_recommendation"], "accept")
        self.assertEqual(guarded["recommendation"], "reject")
        self.assertLessEqual(guarded["effectiveness_score"], 0.25)
        self.assertGreaterEqual(guarded["bogusness_score"], 0.75)

    def test_warning_guardrails_turn_accept_into_accept_with_caveats(self) -> None:
        accepted_report = {
            "id": "eval_warning",
            "recommendation": "accept",
            "effective_polarity": "effective_yes",
            "effectiveness_score": 0.7,
            "bogusness_score": 0.2,
            "confidence": 0.55,
            "issues": [],
            "probes": [],
        }
        guarded = apply_strange_guardrails(
            accepted_report,
            [
                StrangeGuardrailIssue(
                    code="critique_requires_specifics",
                    severity="warning",
                    message="Ask for concrete files.",
                    evidence="slop",
                )
            ],
        )

        self.assertEqual(guarded["reactive_recommendation"], "accept")
        self.assertEqual(guarded["recommendation"], "accept_with_caveats")


if __name__ == "__main__":
    unittest.main()
