from __future__ import annotations

import json
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
    run_cycle,
    generate_company_events,
    simulate_company_futures,
    update_futures_with_real_event,
    create_initial_future,
)

ROOT = Path(__file__).resolve().parents[1]


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


TRACKER_TEMPLATE = {
    "schemaVersion": 1,
    "mode": "local",
    "requiredReadyReviewerCount": 4,
    "requiredReadyRoles": [
        "terms_consumer_law",
        "privacy_lgpd",
        "tax_nfse_accounting",
        "payment_reconciliation",
    ],
    "allowedRoles": [
        "terms_consumer_law",
        "privacy_lgpd",
        "tax_nfse_accounting",
        "payment_reconciliation",
        "delivery_quality",
    ],
    "contactStatuses": [
        "not_contacted",
        "contacted",
        "responded",
        "paid_test_ready",
        "declined",
        "unavailable",
    ],
    "candidateRecords": [],
    "attestation": {
        "operator": "operator",
        "reviewedAt": "2026-06-01",
        "noSecretsInRepo": True,
        "privateCandidateNotesStayOutOfRepo": True,
        "aiDidNotApproveReviewer": True,
        "strangeCompanyRemainsSealed": True,
        "satelliteIsReviewerContractingLane": True,
    },
}

EVIDENCE_INDEX_TEMPLATE = ROOT / "REVENUE_SETUP_EVIDENCE_INDEX.template.json"
AMA_QUEUE_TEMPLATE = ROOT / "PUBLIC_AMA_QUEUE.template.json"


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


def write_reviewer_tracker(records: list[dict]) -> Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    payload = TRACKER_TEMPLATE.copy()
    payload["candidateRecords"] = records
    json.dump(payload, temp, ensure_ascii=False, indent=2)
    temp.close()
    return Path(temp.name)


def write_revenue_evidence_index(ready: bool = False) -> Path:
    payload = json.loads(EVIDENCE_INDEX_TEMPLATE.read_text(encoding="utf-8"))
    if ready:
        payload["payment"].update(
            {
                "paymentEvidenceId": "evidence-payment-001",
                "provider": "Stripe",
                "businessAccountName": "Strange Works Studio",
                "payoutDestinationVerified": True,
                "testPaymentId": "pi_test_001",
                "testPayoutStatus": "test payout route checked",
                "reconciliationOwner": "Operator",
                "feesReviewed": True,
                "verified": True,
            }
        )
        payload["tax"].update(
            {
                "taxEvidenceId": "evidence-tax-001",
                "taxRegime": "Simples Nacional",
                "cnae": "6201-5/02",
                "nfseRoute": "municipal",
                "fiscalDocumentOwner": "accountant",
                "testNfseOrReceiptStatus": "test NFSe generated and reviewed",
                "accountantReviewedAt": "2026-06-01",
                "monthlyReconciliationOwner": "Operator",
                "verified": True,
            }
        )
        payload["attestation"]["reviewedAt"] = "2026-06-01"
        payload["attestation"]["aiDidNotApproveLegalTaxPaymentOrPrivacy"] = True
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, temp, ensure_ascii=False, indent=2)
    temp.close()
    return Path(temp.name)


def write_public_ama_queue(screened: bool = False, answer_ready: bool = False, published: bool = False) -> Path:
    payload = json.loads(AMA_QUEUE_TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    if screened or answer_ready or published:
        status = "published" if published else "answer_ready" if answer_ready else "screened"
        record = {
            "questionId": "AMA-20260612-001",
            "receivedAt": "2026-06-12",
            "topic": "launch-gates",
            "nameAlias": "Public asker 001",
            "contactRef": "support-thread-ama-001",
            "questionSummary": "Asked whether AMA can run before paid intake.",
            "publicSafeQuestion": "Can public AMA run before paid intake is live?",
            "status": status,
            "boundaryDecision": "public_safe",
            "evidenceRef": "ama-log-001",
            "humanScreened": True,
        }
        if answer_ready or published:
            record.update(
                {
                    "publicAnswer": "Yes, public-safe AMA can run while paid intake remains closed.",
                    "answerReviewedAt": "2026-06-12",
                    "humanApprovedForPublication": True,
                }
            )
        payload["questionRecords"] = [record]
        payload["attestation"].update(
            {
                "operator": "operator",
                "reviewedAt": "2026-06-12",
            }
        )
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, temp, ensure_ascii=False, indent=2)
    temp.close()
    return Path(temp.name)


def write_public_ama_answers() -> Path:
    payload = {
        "schemaVersion": 1,
        "mode": "public",
        "generatedAt": "2026-06-12T00:00:00.000Z",
        "sourceQueue": "PUBLIC_AMA_QUEUE.local.json",
        "answers": [
            {
                "questionId": "AMA-20260612-001",
                "topic": "launch-gates",
                "publicSafeQuestion": "Can public AMA run before paid intake is live?",
                "publicAnswer": "Yes, public-safe AMA can run while paid intake remains closed.",
                "answerReviewedAt": "2026-06-12",
                "publishedAt": "2026-06-13",
            }
        ],
        "attestation": {
            "publicOnly": True,
            "noPrivateContactData": True,
            "noPaymentOrderOrLaunchApprovalCreated": True,
            "answersWereHumanApprovedBeforeExport": True,
            "strangeCompanyRemainsSealed": True,
        },
    }
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False)
    temp.write(f"window.PUBLIC_AMA_ANSWERS = Object.freeze({json.dumps(payload, ensure_ascii=False, indent=2)});\n")
    temp.close()
    return Path(temp.name)


class VAUCompanyEvolutionTests(unittest.TestCase):
    def test_current_config_state_has_hard_blockers(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker)

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
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker)

        blockers = hard_blockers(state)
        self.assertNotIn("termsReviewedAt", blockers)
        self.assertNotIn("privacyReviewedAt", blockers)
        self.assertIn("private payment/fiscal evidence", blockers)

    def test_ready_revenue_evidence_local_index_removes_payment_blocker(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        evidence = write_revenue_evidence_index(ready=True)
        state = build_current_state(path, tracker, evidence)

        blockers = hard_blockers(state)
        self.assertNotIn("private payment/fiscal evidence", blockers)
        self.assertTrue(state["gates"]["privatePaymentFiscalEvidenceReady"])
        self.assertIn("payment:evidence-payment-001", state["evidence"]["privatePaymentFiscalEvidence"])

    def test_incomplete_revenue_evidence_index_keeps_payment_blocker(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        evidence = write_revenue_evidence_index(ready=False)
        state = build_current_state(path, tracker, evidence)

        self.assertIn("private payment/fiscal evidence", hard_blockers(state))
        self.assertFalse(state["gates"]["privatePaymentFiscalEvidenceReady"])

    def test_public_ama_queue_metrics_are_read_from_local_queue(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        ama_queue = write_public_ama_queue(screened=True, answer_ready=True)
        state = build_current_state(path, tracker, public_ama_queue=ama_queue)

        self.assertTrue(state["gates"]["publicAmaQueueActive"])
        self.assertTrue(state["gates"]["publicAmaAnswerReady"])
        self.assertEqual(state["metrics"]["public_ama_questions_screened"], 1)
        self.assertEqual(state["metrics"]["public_ama_answers_ready"], 1)
        self.assertIn("answer-ready:1", state["evidence"]["publicAmaQueue"])

        published_state = build_current_state(path, tracker, public_ama_queue=write_public_ama_queue(published=True))
        self.assertTrue(published_state["gates"]["publicAmaAnswerReady"])
        self.assertEqual(published_state["metrics"]["public_ama_answers_published"], 1)

    def test_public_ama_answer_archive_counts_as_published_answer(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker, public_ama_answers=write_public_ama_answers())

        self.assertTrue(state["gates"]["publicAmaQueueActive"])
        self.assertTrue(state["gates"]["publicAmaAnswerReady"])
        self.assertEqual(state["metrics"]["public_ama_answers_published"], 1)
        self.assertIn("published:1", state["evidence"]["publicAmaQueue"])

    def test_public_ama_events_progress_from_screening_to_publication(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])

        no_queue_state = build_current_state(path, tracker)
        no_queue_events = {event.name for event in generate_company_events(create_initial_future(no_queue_state)[0])}
        self.assertIn("public_ama_question_screened", no_queue_events)

        screened_state = build_current_state(
            path,
            tracker,
            public_ama_queue=write_public_ama_queue(screened=True),
        )
        screened_events = {event.name for event in generate_company_events(create_initial_future(screened_state)[0])}
        self.assertIn("public_ama_answer_ready", screened_events)

        ready_state = build_current_state(
            path,
            tracker,
            public_ama_queue=write_public_ama_queue(screened=True, answer_ready=True),
        )
        ready_events = {event.name for event in generate_company_events(create_initial_future(ready_state)[0])}
        self.assertIn("public_ama_answer_published", ready_events)

        published_state = build_current_state(
            path,
            tracker,
            public_ama_queue=write_public_ama_queue(published=True),
        )
        published_events = {event.name for event in generate_company_events(create_initial_future(published_state)[0])}
        self.assertNotIn("public_ama_answer_ready", published_events)
        self.assertNotIn("public_ama_answer_published", published_events)

        archived_state = build_current_state(
            path,
            tracker,
            public_ama_answers=write_public_ama_answers(),
        )
        archived_events = {event.name for event in generate_company_events(create_initial_future(archived_state)[0])}
        self.assertNotIn("public_ama_question_screened", archived_events)
        self.assertNotIn("public_ama_answer_published", archived_events)

    def test_default_run_prioritizes_evidence_and_review_actions(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        result = run_cycle(
            build_current_state(path, tracker),
            depth=2,
            max_branches_to_keep=8,
        )

        actions = [item["action"] for item in result["recommended_next_actions"]]
        joined_actions = "\n".join(actions)
        self.assertIn("Get human review on terms", joined_actions)
        self.assertIn("REVIEWER_CANDIDATE_TRACKER.local.json", joined_actions)
        self.assertIn("--require-one", joined_actions)
        self.assertIn("private Stripe/bank/fiscal evidence", joined_actions)
        self.assertFalse(result["public_live_ready"])

    def test_local_tracker_increases_reviewer_metric(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker(
            [
                {
                    "candidateId": "r1",
                    "candidateLabel": "Alice",
                    "reviewRole": "terms_consumer_law",
                    "contactStatus": "contacted",
                }
            ]
        )
        state = build_current_state(path, tracker)

        self.assertEqual(state["metrics"]["human_reviewers_found"], 1)

    def test_ready_reviewer_pool_in_local_tracker_marks_human_reviewers_ready(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker(
            [
                {
                    "candidateId": "r1",
                    "candidateLabel": "Alice",
                    "reviewRole": "terms_consumer_law",
                    "contactStatus": "paid_test_ready",
                    "readyForPaidTest": True,
                },
                {
                    "candidateId": "r2",
                    "candidateLabel": "Bruno",
                    "reviewRole": "privacy_lgpd",
                    "contactStatus": "paid_test_ready",
                    "readyForPaidTest": True,
                },
                {
                    "candidateId": "r3",
                    "candidateLabel": "Clara",
                    "reviewRole": "tax_nfse_accounting",
                    "contactStatus": "paid_test_ready",
                    "readyForPaidTest": True,
                },
                {
                    "candidateId": "r4",
                    "candidateLabel": "Davi",
                    "reviewRole": "payment_reconciliation",
                    "contactStatus": "paid_test_ready",
                    "readyForPaidTest": True,
                },
            ]
        )
        state = build_current_state(path, tracker)

        self.assertEqual(state["metrics"]["human_reviewers_found"], 4)
        self.assertTrue(state["gates"]["humanReviewersReady"])

    def test_revenue_future_only_appears_after_gates_and_reviewers(self) -> None:
        path = write_public_config(
            terms="2026-05-25",
            privacy="2026-05-25",
            brazil="2026-05-25",
            ai_handoff="2026-05-25",
        )
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker)
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
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker)
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
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker)
        futures = simulate_company_futures(create_initial_future(state), depth=1, max_branches_to_keep=5)

        actions = recommended_next_actions(futures)

        self.assertTrue(actions)
        self.assertIsInstance(actions[0]["domains"], list)
        self.assertIsInstance(actions[0]["events"], list)


if __name__ == "__main__":
    unittest.main()
