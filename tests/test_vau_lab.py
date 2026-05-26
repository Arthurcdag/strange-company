from __future__ import annotations

import unittest

from tools.vau_lab import (
    LabEvent,
    SCENARIOS,
    run_scenario,
    simulate_scenario,
    update_futures_with_observed_event,
)


class VAULabTests(unittest.TestCase):
    def test_all_builtin_scenarios_simulate_and_prune(self) -> None:
        for scenario in SCENARIOS.values():
            with self.subTest(scenario=scenario.name):
                futures = simulate_scenario(
                    scenario,
                    depth=2,
                    max_branches_to_keep=4,
                )

                self.assertEqual(len(futures), 4)
                self.assertEqual(
                    [future.probability for future in futures],
                    sorted((future.probability for future in futures), reverse=True),
                )
                self.assertTrue(all(len(future.timeline) == 2 for future in futures))

    def test_cash_runway_invoice_paid_extends_runway(self) -> None:
        result = run_scenario("cash_runway", depth=1, max_branches_to_keep=5)
        invoice_future = next(
            future
            for future in result["predicted_futures"]
            if future["timeline"][-1]["name"] == "invoice_paid"
        )

        self.assertGreater(invoice_future["state"]["metrics"]["cash_months"], 1.5)

    def test_support_template_can_reduce_queue(self) -> None:
        result = run_scenario("support_queue", depth=1, max_branches_to_keep=5)
        template_future = next(
            future
            for future in result["predicted_futures"]
            if future["timeline"][-1]["name"] == "triage_template_improves_flow"
        )

        self.assertEqual(template_future["state"]["metrics"]["open_tickets"], 4)

    def test_observed_event_keeps_matching_future(self) -> None:
        scenario = SCENARIOS["security_incident"]
        predicted = simulate_scenario(scenario, depth=1, max_branches_to_keep=5)
        observed = LabEvent(
            name="containment_succeeds",
            kind="security",
            probability_hint=0.5,
            tags=("incident", "containment"),
            state_delta={"flags.contained": True},
        )

        surviving = update_futures_with_observed_event(
            predicted,
            observed,
            scenario.initial_state,
        )

        self.assertEqual(surviving[0].timeline[0].name, "containment_succeeds")
        self.assertGreaterEqual(surviving[0].confidence, 1.0)


if __name__ == "__main__":
    unittest.main()
