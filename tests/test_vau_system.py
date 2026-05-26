from __future__ import annotations

import copy
import unittest

from tools.vau_system import (
    DEFAULT_CURRENT_STATE,
    Event,
    create_initial_future,
    simulate_futures,
    update_current_state,
    update_futures_with_real_event,
)


class VAUSystemTests(unittest.TestCase):
    def test_simulation_keeps_requested_top_branches_sorted(self) -> None:
        futures = create_initial_future(copy.deepcopy(DEFAULT_CURRENT_STATE))

        predicted = simulate_futures(
            futures=futures,
            depth=2,
            max_branches_to_keep=3,
        )

        self.assertEqual(len(predicted), 3)
        self.assertEqual(
            [future.probability for future in predicted],
            sorted((future.probability for future in predicted), reverse=True),
        )
        self.assertTrue(all(len(future.timeline) == 2 for future in predicted))

    def test_reviewer_pool_completion_closes_human_review_gate(self) -> None:
        state = copy.deepcopy(DEFAULT_CURRENT_STATE)
        state["metrics"]["human_reviewers_found"] = 3

        predicted = simulate_futures(
            futures=create_initial_future(state),
            depth=1,
            max_branches_to_keep=8,
        )

        completed = next(
            future
            for future in predicted
            if future.timeline[-1].name == "reviewer_pool_completed"
        )
        self.assertTrue(completed.state["gates"]["humanReviewersReady"])
        self.assertEqual(completed.state["metrics"]["human_reviewers_found"], 4)

    def test_reality_correction_keeps_matching_future(self) -> None:
        predicted = simulate_futures(
            futures=create_initial_future(copy.deepcopy(DEFAULT_CURRENT_STATE)),
            depth=1,
            max_branches_to_keep=10,
        )
        real_event = Event(
            name="reviewer_outreach_reply",
            kind="human_review",
            tags=("reviewers", "operations"),
            state_delta={"metrics.human_reviewers_found": {"op": "increment", "value": 1}},
        )

        surviving = update_futures_with_real_event(predicted, real_event)
        updated_state = update_current_state(copy.deepcopy(DEFAULT_CURRENT_STATE), real_event)

        self.assertEqual(surviving[0].timeline[0].name, "reviewer_outreach_reply")
        self.assertGreaterEqual(surviving[0].confidence, 1.0)
        self.assertEqual(updated_state["metrics"]["human_reviewers_found"], 1)

    def test_reality_correction_falls_back_when_no_future_matches(self) -> None:
        predicted = simulate_futures(
            futures=create_initial_future(copy.deepcopy(DEFAULT_CURRENT_STATE)),
            depth=1,
            max_branches_to_keep=3,
        )
        real_event = Event(
            name="bank_account_blocked",
            kind="finance",
            tags=("bank", "manual_review"),
            state_delta={
                "notes": {
                    "op": "append_unique",
                    "value": "Unexpected finance blocker appeared.",
                }
            },
        )

        surviving = update_futures_with_real_event(predicted, real_event)

        self.assertEqual(len(surviving), 1)
        self.assertEqual(surviving[0].timeline[0].name, "bank_account_blocked")
        self.assertEqual(surviving[0].confidence, 0.35)


if __name__ == "__main__":
    unittest.main()
