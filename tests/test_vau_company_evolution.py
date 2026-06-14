from __future__ import annotations

import tempfile
import textwrap
import unittest
from pathlib import Path

from tools.vau_company_evolution import (
    CompanyEvent,
    build_current_state,
    company_operational_ready,
    hard_blockers,
    public_live_ready,
    recommended_next_actions,
    resource_allocation_plan,
    run_cycle,
    simulate_company_futures,
    update_futures_with_real_event,
    create_initial_future,
)


PUBLIC_CONFIG_TEMPLATE = """
window.PUBLIC_ORDER_CONFIG = {
  operatorName: "Strange Works Studio",
  jurisdiction: "BR",
  supportInboxVerified: true,
  googleFormVerified: true,
  termsReviewedAt: "%s",
  privacyReviewedAt: "%s",
  brazilComplianceReviewedAt: "%s",
  aiHandoffReviewedAt: "%s",
  liveMode: false,
};
"""


def write_public_config(
    terms: str = "",
    privacy: str = "",
    brazil: str = "",
    ai_handoff: str = "",
) -> Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False)
    temp.write(PUBLIC_CONFIG_TEMPLATE % (terms, privacy, brazil, ai_handoff))
    temp.close()
    return Path(temp.name)


class VAUCompanyEvolutionTests(unittest.TestCase):
    def test_current_config_state_has_hard_blockers(self) -> None:
        path = write_public_config()
        state = build_current_state(path)

        self.assertFalse(public_live_ready(state))
        self.assertFalse(company_operational_ready(state))
        self.assertIn("termsReviewedAt", hard_blockers(state))
        self.assertIn("private payment/fiscal evidence", hard_blockers(state))

    def test_review_dates_remove_public_review_blockers(self) -> None:
        path = write_public_config(
            terms="2026-05-25",
            privacy="2026-05-25",
            brazil="2026-05-25",
            ai_handoff="2026-05-25",
        )
        state = build_current_state(path)

        blockers = hard_blockers(state)
        self.assertNotIn("termsReviewedAt", blockers)
        self.assertNotIn("privacyReviewedAt", blockers)
        self.assertIn("private payment/fiscal evidence", blockers)

    def test_default_run_prioritizes_evidence_and_review_actions(self) -> None:
        path = write_public_config()
        result = run_cycle(
            build_current_state(path),
            depth=2,
            max_branches_to_keep=8,
        )

        actions = [item["action"] for item in result["recommended_next_actions"]]
        joined_actions = "\n".join(actions)
        self.assertIn("Get human review on terms", joined_actions)
        self.assertIn("private Stripe/bank/fiscal evidence", joined_actions)
        self.assertFalse(result["public_live_ready"])
        self.assertIn("resource_allocation", result)

    def test_revenue_future_only_appears_after_gates_and_reviewers(self) -> None:
        path = write_public_config(
            terms="2026-05-25",
            privacy="2026-05-25",
            brazil="2026-05-25",
            ai_handoff="2026-05-25",
        )
        state = build_current_state(path)
        state["gates"]["privatePaymentFiscalEvidenceReady"] = True
        state["gates"]["humanReviewersReady"] = True
        state["gates"]["deliveryReviewLoopReady"] = True
        state["metrics"]["human_reviewers_found"] = 4

        futures = simulate_company_futures(create_initial_future(state), depth=1, max_branches_to_keep=8)
        event_names = {future.timeline[-1].name for future in futures}

        self.assertTrue(public_live_ready(state))
        self.assertTrue(company_operational_ready(state))
        self.assertIn("controlled_pilot_request_qualified", event_names)
        self.assertIn("live_mode_ready_for_human_flip", event_names)

    def test_observed_reviewer_event_keeps_matching_future(self) -> None:
        path = write_public_config()
        state = build_current_state(path)
        predicted = simulate_company_futures(create_initial_future(state), depth=1, max_branches_to_keep=8)
        real_event = CompanyEvent(
            name="reviewer_candidate_added",
            domain="human_review",
            probability_hint=0.5,
            strategic_value=1.4,
            tags=("manual", "reviewers", "capacity"),
            state_delta={"metrics.human_reviewers_found": {"op": "increment", "value": 1}},
            requires_real_evidence=True,
        )

        surviving = update_futures_with_real_event(predicted, real_event, state)

        self.assertEqual(surviving[0].timeline[0].name, "reviewer_candidate_added")
        self.assertGreaterEqual(surviving[0].confidence, 1.0)

    def test_recommended_actions_are_serializable(self) -> None:
        path = write_public_config()
        state = build_current_state(path)
        futures = simulate_company_futures(create_initial_future(state), depth=1, max_branches_to_keep=5)

        actions = recommended_next_actions(futures)

        self.assertTrue(actions)
        self.assertIsInstance(actions[0]["domains"], list)
        self.assertIsInstance(actions[0]["events"], list)

    def test_resource_allocation_spends_first_on_external_review(self) -> None:
        path = write_public_config()
        state = build_current_state(path)

        allocation = resource_allocation_plan(state)
        lanes = allocation["resource_lanes"]

        self.assertEqual(lanes[0]["lane"], "human_review_dates")
        self.assertTrue(lanes[0]["requires_real_evidence"])
        self.assertIn("liveMode false", allocation["live_mode_policy"])
        self.assertEqual(sum(lane["resource_share_percent"] for lane in lanes), 100)
        self.assertIn("Do not flip liveMode from simulated futures.", allocation["do_not_spend_on"])

    def test_resource_allocation_moves_to_reviewer_bench_after_hard_evidence(self) -> None:
        path = write_public_config(
            terms="2026-05-25",
            privacy="2026-05-25",
            brazil="2026-05-25",
            ai_handoff="2026-05-25",
        )
        state = build_current_state(path)
        state["gates"]["privatePaymentFiscalEvidenceReady"] = True

        allocation = resource_allocation_plan(state)

        self.assertEqual(allocation["resource_lanes"][0]["lane"], "reviewer_bench")
        self.assertIn("Recruit 4 more human reviewers", allocation["resource_lanes"][0]["action"])


if __name__ == "__main__":
    unittest.main()
