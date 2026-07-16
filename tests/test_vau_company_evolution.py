from __future__ import annotations

import json
import subprocess
import tempfile
import textwrap
import unittest
from pathlib import Path

from tools.vau_company_evolution import (
    CompanyEvent,
    LIVE_REVIEW_CLOSURE_EVIDENCE,
    apply_state_delta,
    build_current_state,
    company_operational_ready,
    continuous_evolution_goal,
    hard_blockers,
    live_review_closure_config_bound,
    live_review_dates_ready,
    operational_blockers,
    public_live_ready,
    recommended_next_actions,
    run_cycle,
    generate_company_events,
    simulate_company_futures,
    update_futures_with_real_event,
    create_initial_future,
)
from tests.test_evolution_goal_status import live_review_ready_payload, valid_external_live_payload
from tests.test_revenue_setup_evidence_index import valid_evidence_payload
from tests.test_reviewer_candidate_tracker import candidate as reviewer_candidate
from tests.test_public_live_receipt import generation_args, ready_files, run_exporter

ROOT = Path(__file__).resolve().parents[1]


PUBLIC_CONFIG_TEMPLATE = """
window.PUBLIC_ORDER_CONFIG = {
  operatorName: "Strange Works Studio",
  jurisdiction: "BR",
  complianceMode: "brazil-draft",
  aiGeneratedLegalDocsRequireHumanReview: true,
  supportEmail: "support@example.com",
  googleFormUrl: "https://docs.google.com/forms/d/e/example/viewform",
  supportInboxVerified: true,
  googleFormVerified: true,
  termsReviewedAt: "%s",
  privacyReviewedAt: "%s",
  brazilComplianceReviewedAt: "%s",
  aiHandoffReviewedAt: "%s",
  liveMode: false,
  services: [{
    id: "proof-sprint",
    title: "Compliance proof sprint",
    detail: "Public test offer",
    price: 750,
  }],
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
DELIVERY_CHECKLIST_TEMPLATE = ROOT / "DELIVERY_REVIEW_CHECKLIST.template.json"


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


def write_revenue_evidence_index(ready: bool = False, review_date: str = "2026-06-01") -> Path:
    payload = valid_evidence_payload() if ready else json.loads(
        EVIDENCE_INDEX_TEMPLATE.read_text(encoding="utf-8")
    )
    if ready:
        payload["publicConfig"].update(
            termsReviewedAt=review_date,
            privacyReviewedAt=review_date,
            brazilComplianceReviewedAt=review_date,
            aiHandoffReviewedAt=review_date,
        )
        payload["privacy"]["privacyReviewedAt"] = review_date
        payload["terms"]["termsReviewedAt"] = review_date
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, temp, ensure_ascii=False, indent=2)
    temp.close()
    return Path(temp.name)


def write_external_live_packet(ready: bool = False, review_date: str = "2026-07-13") -> Path:
    payload = valid_external_live_payload(review_date) if ready else json.loads(
        (ROOT / "EXTERNAL_LIVE_PACKET.template.json").read_text(encoding="utf-8")
    )
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, temp, ensure_ascii=False, indent=2)
    temp.close()
    return Path(temp.name)


def write_live_review_closure(review_date: str = "2026-07-01") -> Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(live_review_ready_payload(review_date), temp, ensure_ascii=False, indent=2)
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


def write_delivery_review_checklist(ready: bool = False) -> Path:
    payload = json.loads(DELIVERY_CHECKLIST_TEMPLATE.read_text(encoding="utf-8"))
    if ready:
        payload["mode"] = "local"
        payload["deliveryLoop"] = {
            "serviceName": "Compliance proof sprint",
            "orderId": "order-001",
            "customerRef": "customer-redacted-001",
            "scopeEvidenceRef": "scope-001",
            "intakeAccepted": True,
            "dataBoundaryConfirmed": True,
            "aiDraftCreated": True,
            "humanReviewCompleted": True,
            "humanReviewer": "Reviewer",
            "humanReviewDate": "2026-06-12",
            "revisionsCompleted": True,
            "acceptanceCriteriaMet": True,
            "deliveryArtifactUrl": "https://example.com/delivery-artifact",
            "receiptChainUpdated": True,
            "incidentReviewCompleted": True,
            "readyForDelivery": True,
        }
        payload["evidence"] = {
            "intakePacketRef": "intake-001",
            "sourceOrderRef": "order-001",
            "draftArtifactRef": "draft-001",
            "reviewNotesRef": "review-001",
            "finalArtifactRef": "artifact-001",
            "receiptRoot": "receipt-root-001",
            "incidentIds": [],
        }
        payload["attestation"] = {
            "operator": "Operator",
            "reviewedAt": "2026-06-12",
            "noSecretsInRepo": True,
            "noCustomerPrivateDataInRepo": True,
            "aiDidNotApproveFinalDelivery": True,
            "strangeCompanyRemainsSealed": True,
            "satelliteIsDeliveryOperator": True,
        }
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, temp, ensure_ascii=False, indent=2)
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
        self.assertIn("private external live evidence", hard_blockers(state))

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
        self.assertIn("humanReviewClosureEvidence", blockers)
        self.assertIn("private payment/fiscal evidence", blockers)
        self.assertIn("private external live evidence", blockers)

    def test_ready_document_bound_closure_matches_public_dates(self) -> None:
        config = write_public_config(
            terms="2026-07-01",
            privacy="2026-07-01",
            brazil="2026-07-01",
            ai_handoff="2026-07-01",
        )
        state = build_current_state(
            config,
            write_reviewer_tracker([]),
            live_review_closure=write_live_review_closure(),
        )

        self.assertTrue(state["gates"]["liveReviewClosureReady"])
        self.assertEqual(
            state["evidence"]["liveReviewClosure"],
            "validator:passed; public-dates:matched",
        )
        self.assertNotIn("humanReviewClosureEvidence", hard_blockers(state))
        self.assertFalse(state["snapshot"]["liveMode"])

    def test_invalid_or_date_stale_closure_fails_closed(self) -> None:
        config = write_public_config(
            terms="2026-07-01",
            privacy="2026-07-01",
            brazil="2026-07-01",
            ai_handoff="2026-07-01",
        )
        invalid = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
        invalid.write("{")
        invalid.close()
        invalid_state = build_current_state(
            config,
            write_reviewer_tracker([]),
            live_review_closure=Path(invalid.name),
        )
        stale_state = build_current_state(
            config,
            write_reviewer_tracker([]),
            live_review_closure=write_live_review_closure("2026-06-30"),
        )

        for state in (invalid_state, stale_state):
            self.assertFalse(state["gates"]["liveReviewClosureReady"])
            self.assertIn("humanReviewClosureEvidence", hard_blockers(state))
            self.assertFalse(public_live_ready(state))

    def test_closure_readiness_is_atomic_and_config_bound_to_all_review_dates(self) -> None:
        config = write_public_config(
            terms="2026-07-01",
            privacy="2026-07-01",
            brazil="2026-07-01",
            ai_handoff="",
        )
        state = build_current_state(
            config,
            write_reviewer_tracker([]),
            live_review_closure=write_live_review_closure("2026-07-01"),
        )

        self.assertFalse(live_review_dates_ready(state))
        self.assertFalse(state["gates"]["liveReviewClosureReady"])
        self.assertFalse(live_review_closure_config_bound(state))
        self.assertEqual(state["evidence"]["liveReviewClosure"], "")
        self.assertEqual(hard_blockers(state)[0], "humanReviewClosureEvidence")
        self.assertIn("aiHandoffReviewedAt", hard_blockers(state))

    def test_impossible_simulated_closure_state_is_normalized_fail_closed(self) -> None:
        state = build_current_state(write_public_config(), write_reviewer_tracker([]))
        state["gates"]["liveReviewClosureReady"] = True
        state["evidence"]["liveReviewClosure"] = "impossible-unbound-claim"

        normalized = create_initial_future(state)[0].state
        delta_normalized = apply_state_delta(
            state,
            {"metrics.tooling_maturity": {"op": "increment", "value": 1}},
        )

        for candidate in (normalized, delta_normalized):
            self.assertFalse(candidate["gates"]["liveReviewClosureReady"])
            self.assertEqual(candidate["evidence"]["liveReviewClosure"], "")
            self.assertEqual(hard_blockers(candidate)[0], "humanReviewClosureEvidence")

    def test_closure_boolean_and_dates_without_canonical_evidence_fail_closed(self) -> None:
        state = build_current_state(
            write_public_config(
                terms="2026-07-01",
                privacy="2026-07-01",
                brazil="2026-07-01",
                ai_handoff="2026-07-01",
            ),
            write_reviewer_tracker([]),
        )
        self.assertTrue(live_review_dates_ready(state))

        for evidence_marker in ("", "validator:passed; dates:not-bound"):
            with self.subTest(evidence_marker=evidence_marker):
                impossible = json.loads(json.dumps(state))
                impossible["gates"]["liveReviewClosureReady"] = True
                impossible["evidence"]["liveReviewClosure"] = evidence_marker

                normalized = create_initial_future(impossible)[0].state

                self.assertFalse(normalized["gates"]["liveReviewClosureReady"])
                self.assertEqual(normalized["evidence"]["liveReviewClosure"], "")
                self.assertFalse(live_review_closure_config_bound(normalized))
                self.assertEqual(
                    hard_blockers(normalized)[0],
                    "humanReviewClosureEvidence",
                )

    def test_depth_one_prioritizes_atomic_config_bound_closure(self) -> None:
        state = build_current_state(write_public_config(), write_reviewer_tracker([]))
        result = run_cycle(state, depth=1, max_branches_to_keep=1)

        self.assertEqual(result["hard_blockers"][0], "humanReviewClosureEvidence")
        self.assertTrue(result["recommended_next_actions"])
        first_action = result["recommended_next_actions"][0]
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", first_action["action"])
        self.assertIn("--require-ready --public-config public-config.js", first_action["action"])
        self.assertEqual(first_action["events"], ["human_review_closure_evidence_ready"])

        predicted = result["predicted_futures"]
        self.assertEqual(len(predicted), 1)
        predicted_state = predicted[0]["state"]
        self.assertTrue(live_review_dates_ready(predicted_state))
        self.assertTrue(live_review_closure_config_bound(predicted_state))
        self.assertTrue(predicted_state["gates"]["liveReviewClosureReady"])

    def test_ready_revenue_evidence_local_index_removes_payment_blocker(self) -> None:
        path = write_public_config(
            terms="2026-06-01",
            privacy="2026-06-01",
            brazil="2026-06-01",
            ai_handoff="2026-06-01",
        )
        tracker = write_reviewer_tracker([])
        evidence = write_revenue_evidence_index(ready=True)
        state = build_current_state(path, tracker, evidence)

        blockers = hard_blockers(state)
        self.assertNotIn("private payment/fiscal evidence", blockers)
        self.assertTrue(state["gates"]["privatePaymentFiscalEvidenceReady"])
        self.assertIn("payment:pay-001", state["evidence"]["privatePaymentFiscalEvidence"])
        self.assertIn("private external live evidence", blockers)

    def test_revenue_evidence_attestations_are_enforced_by_authoritative_validator(self) -> None:
        path = write_public_config(
            terms="2026-06-01",
            privacy="2026-06-01",
            brazil="2026-06-01",
            ai_handoff="2026-06-01",
        )
        tracker = write_reviewer_tracker([])
        ready_payload = write_revenue_evidence_index(ready=True)
        payload = json.loads(ready_payload.read_text(encoding="utf-8"))
        payload["attestation"]["aiDidNotApproveLegalTaxPaymentOrPrivacy"] = False
        invalid = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
        json.dump(payload, invalid, ensure_ascii=False, indent=2)
        invalid.close()

        state = build_current_state(path, tracker, Path(invalid.name))

        self.assertFalse(state["gates"]["privatePaymentFiscalEvidenceReady"])
        self.assertIn("private payment/fiscal evidence", hard_blockers(state))

    def test_valid_external_live_packet_closes_only_external_blocker(self) -> None:
        state = build_current_state(
            write_public_config(
                terms="2026-07-13",
                privacy="2026-07-13",
                brazil="2026-07-13",
                ai_handoff="2026-07-13",
            ),
            write_reviewer_tracker([]),
            external_live_packet=write_external_live_packet(ready=True),
        )

        self.assertTrue(state["gates"]["privateExternalLiveEvidenceReady"])
        self.assertEqual(state["evidence"]["privateExternalLiveEvidence"], "validator:passed")
        self.assertNotIn("private external live evidence", hard_blockers(state))

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

    def test_delivery_review_checklist_can_close_delivery_loop_blocker(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        state = build_current_state(
            path,
            tracker,
            delivery_review_checklist=write_delivery_review_checklist(ready=True),
        )

        self.assertTrue(state["gates"]["deliveryReviewLoopReady"])
        self.assertIn("artifact:artifact-001", state["evidence"]["deliveryReviewLoop"])
        self.assertNotIn("delivery review loop", operational_blockers(state))

    def test_non_local_delivery_checklist_cannot_close_delivery_loop_blocker(self) -> None:
        checklist = write_delivery_review_checklist(ready=True)
        payload = json.loads(checklist.read_text(encoding="utf-8"))
        payload["mode"] = "simulation"
        checklist.write_text(json.dumps(payload), encoding="utf-8")

        state = build_current_state(
            write_public_config(),
            write_reviewer_tracker([]),
            delivery_review_checklist=checklist,
        )

        self.assertFalse(state["gates"]["deliveryReviewLoopReady"])
        self.assertIn("delivery review loop", operational_blockers(state))

    def test_incomplete_delivery_review_checklist_keeps_delivery_loop_blocker(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        state = build_current_state(
            path,
            tracker,
            delivery_review_checklist=write_delivery_review_checklist(ready=False),
        )

        self.assertFalse(state["gates"]["deliveryReviewLoopReady"])
        self.assertIn("delivery review loop", operational_blockers(state))

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
        self.assertIn("LIVE_REVIEW_CLOSURE.local.json", actions[0])
        self.assertIn("--require-ready --public-config public-config.js", actions[0])
        self.assertIn("REVIEWER_CANDIDATE_TRACKER.local.json", joined_actions)
        self.assertIn("--require-one", joined_actions)
        self.assertIn("private Stripe/bank/fiscal evidence", joined_actions)
        self.assertIn("EXTERNAL_LIVE_PACKET.local.json", joined_actions)
        external_action = next(
            action for action in actions if "EXTERNAL_LIVE_PACKET.local.json" in action
        )
        self.assertIn("--require-live --public-config public-config.js", external_action)
        self.assertFalse(result["public_live_ready"])

    def test_continuous_evolution_goal_keeps_guardrails_visible(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])
        state = build_current_state(path, tracker)

        goal = continuous_evolution_goal(state)

        self.assertIn("Continuously evolve Strange Company", goal["objective"])
        self.assertEqual(goal["current_mode"], "burn_down_hard_blockers")
        self.assertIn("keep liveMode false", goal["next_loop"])
        joined_guardrails = "\n".join(goal["guardrails"])
        self.assertIn("Do not set liveMode true", joined_guardrails)
        self.assertIn("simulations, templates, or AI outputs", joined_guardrails)
        self.assertIn("sealed-company material out of the public repo", joined_guardrails)
        self.assertIn("executable check, receipt, report, or documented next action", joined_guardrails)

    def test_run_cycle_includes_continuous_evolution_goal(self) -> None:
        path = write_public_config()
        tracker = write_reviewer_tracker([])

        result = run_cycle(
            build_current_state(path, tracker),
            depth=1,
            max_branches_to_keep=4,
        )

        self.assertIn("continuous_evolution_goal", result)
        self.assertEqual(
            result["continuous_evolution_goal"]["current_mode"],
            "burn_down_hard_blockers",
        )

    def test_goal_mode_changes_after_hard_blockers_are_closed(self) -> None:
        path = write_public_config(
            terms="2026-05-25",
            privacy="2026-05-25",
            brazil="2026-05-25",
            ai_handoff="2026-05-25",
        )
        tracker = write_reviewer_tracker([])
        revenue = write_revenue_evidence_index(ready=True, review_date="2026-05-25")
        external = write_external_live_packet(ready=True, review_date="2026-05-25")
        state = build_current_state(
            path,
            tracker,
            revenue_evidence_index=revenue,
            external_live_packet=external,
            live_review_closure=write_live_review_closure("2026-05-25"),
        )

        goal = continuous_evolution_goal(state)

        self.assertEqual(goal["current_mode"], "harden_operations")
        self.assertIn("reviewer capacity", goal["next_loop"])

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
                reviewer_candidate("r1", "terms_consumer_law"),
                reviewer_candidate("r2", "privacy_lgpd"),
                reviewer_candidate("r3", "tax_nfse_accounting"),
                reviewer_candidate("r4", "payment_reconciliation"),
            ]
        )
        state = build_current_state(path, tracker)

        self.assertEqual(state["metrics"]["human_reviewers_found"], 4)
        self.assertTrue(state["gates"]["humanReviewersReady"])

    def test_non_local_reviewer_pool_cannot_mark_capacity_ready(self) -> None:
        roles = [
            "terms_consumer_law",
            "privacy_lgpd",
            "tax_nfse_accounting",
            "payment_reconciliation",
        ]
        tracker = write_reviewer_tracker(
            [
                {
                    "candidateId": f"r{index}",
                    "candidateLabel": f"Reviewer {index}",
                    "reviewRole": role,
                    "contactStatus": "paid_test_ready",
                    "readyForPaidTest": True,
                    "contactedAt": "2026-06-01",
                    "scope": "Review the assigned launch blocker.",
                    "rateBand": "BRL 150-300 paid test",
                    "availability": "Within two business days",
                    "paidTestTask": "Review assigned blocker.",
                    "conflictCheck": "No known conflict recorded",
                    "humanRecorded": True,
                    "evidenceRef": f"private-reviewer-{index}",
                }
                for index, role in enumerate(roles, start=1)
            ]
        )
        payload = json.loads(tracker.read_text(encoding="utf-8"))
        payload["mode"] = "simulation"
        tracker.write_text(json.dumps(payload), encoding="utf-8")

        state = build_current_state(write_public_config(), tracker)

        self.assertEqual(state["metrics"]["human_reviewers_found"], 4)
        self.assertFalse(state["gates"]["humanReviewersReady"])
        self.assertIn("4 human reviewers", operational_blockers(state))

    def test_four_contacted_reviewers_do_not_close_ready_pool(self) -> None:
        roles = [
            "terms_consumer_law",
            "privacy_lgpd",
            "tax_nfse_accounting",
            "payment_reconciliation",
        ]
        tracker = write_reviewer_tracker(
            [
                {
                    "candidateId": f"r{index}",
                    "candidateLabel": f"Reviewer {index}",
                    "reviewRole": role,
                    "contactStatus": "contacted",
                    "readyForPaidTest": False,
                }
                for index, role in enumerate(roles, start=1)
            ]
        )
        state = build_current_state(write_public_config(), tracker)

        self.assertEqual(state["metrics"]["human_reviewers_found"], 4)
        self.assertFalse(state["gates"]["humanReviewersReady"])
        self.assertIn("4 human reviewers", operational_blockers(state))

    def test_missing_public_route_stays_in_harden_operations_mode(self) -> None:
        state = build_current_state(write_public_config(), write_reviewer_tracker([]))
        state["gates"].update(
            {
                "termsReviewed": True,
                "privacyReviewed": True,
                "brazilComplianceReviewed": True,
                "aiHandoffReviewed": True,
                "privatePaymentFiscalEvidenceReady": True,
                "privateExternalLiveEvidenceReady": True,
                "publicLiveReceiptReady": True,
                "liveReviewClosureReady": True,
                "humanReviewersReady": True,
                "deliveryReviewLoopReady": True,
                "supportInboxVerified": False,
                "googleFormVerified": True,
            }
        )
        state["evidence"]["liveReviewClosure"] = LIVE_REVIEW_CLOSURE_EVIDENCE
        state["metrics"]["human_reviewers_found"] = 4

        goal = continuous_evolution_goal(state)

        self.assertEqual(goal["current_mode"], "harden_operations")
        self.assertIn("public route verification", goal["next_loop"])
        self.assertFalse(public_live_ready(state))

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
        state["gates"]["privateExternalLiveEvidenceReady"] = True
        state["gates"]["publicLiveReceiptReady"] = True
        state["gates"]["liveReviewClosureReady"] = True
        state["evidence"]["liveReviewClosure"] = LIVE_REVIEW_CLOSURE_EVIDENCE
        state["gates"]["humanReviewersReady"] = True
        state["gates"]["deliveryReviewLoopReady"] = True
        state["metrics"]["human_reviewers_found"] = 4

        futures = simulate_company_futures(create_initial_future(state), depth=1, max_branches_to_keep=8)
        event_names = {future.timeline[-1].name for future in futures}

        self.assertTrue(public_live_ready(state))
        self.assertTrue(company_operational_ready(state))
        self.assertIn("controlled_pilot_request_qualified", event_names)
        self.assertIn("live_mode_ready_for_human_flip", event_names)

    def test_missing_external_live_evidence_suppresses_live_flip_future(self) -> None:
        state = build_current_state(
            write_public_config(
                terms="2026-05-25",
                privacy="2026-05-25",
                brazil="2026-05-25",
                ai_handoff="2026-05-25",
            ),
            write_reviewer_tracker([]),
        )
        state["gates"].update(
            privatePaymentFiscalEvidenceReady=True,
            privateExternalLiveEvidenceReady=False,
            publicLiveReceiptReady=True,
            liveReviewClosureReady=True,
            humanReviewersReady=True,
            deliveryReviewLoopReady=True,
        )
        state["evidence"]["liveReviewClosure"] = LIVE_REVIEW_CLOSURE_EVIDENCE
        state["metrics"]["human_reviewers_found"] = 4

        events = generate_company_events(create_initial_future(state)[0])
        event_names = {event.name for event in events}

        self.assertFalse(public_live_ready(state))
        self.assertFalse(company_operational_ready(state))
        self.assertNotIn("controlled_pilot_request_qualified", event_names)
        self.assertNotIn("live_mode_ready_for_human_flip", event_names)

    def test_missing_public_live_receipt_suppresses_live_flip_future(self) -> None:
        state = build_current_state(
            write_public_config(
                terms="2026-05-25",
                privacy="2026-05-25",
                brazil="2026-05-25",
                ai_handoff="2026-05-25",
            ),
            write_reviewer_tracker([]),
        )
        state["gates"].update(
            privatePaymentFiscalEvidenceReady=True,
            privateExternalLiveEvidenceReady=True,
            publicLiveReceiptReady=False,
            liveReviewClosureReady=True,
            humanReviewersReady=True,
            deliveryReviewLoopReady=True,
        )
        state["evidence"]["liveReviewClosure"] = LIVE_REVIEW_CLOSURE_EVIDENCE
        state["metrics"]["human_reviewers_found"] = 4

        events = generate_company_events(create_initial_future(state)[0])
        event_names = {event.name for event in events}

        self.assertIn("public live readiness receipt", hard_blockers(state))
        self.assertIn("public_live_receipt_issued", event_names)
        receipt_event = next(event for event in events if event.name == "public_live_receipt_issued")
        self.assertIn("--live-review-closure LIVE_REVIEW_CLOSURE.local.json", receipt_event.next_action)
        self.assertFalse(public_live_ready(state))
        self.assertNotIn("controlled_pilot_request_qualified", event_names)
        self.assertNotIn("live_mode_ready_for_human_flip", event_names)

    def test_legal_document_drift_invalidates_vau_receipt_gate(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            config, external, revenue = ready_files(folder)
            receipt = folder / "public-live-receipt.js"
            terms_document = folder / "TERMOS.md"
            privacy_document = folder / "AVISO_DE_PRIVACIDADE.md"
            terms_document.write_text(
                (ROOT / "TERMOS.md").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            privacy_document.write_text(
                (ROOT / "AVISO_DE_PRIVACIDADE.md").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            document_args = (
                "--terms-doc",
                str(terms_document),
                "--privacy-doc",
                str(privacy_document),
            )
            generated = run_exporter(
                *generation_args(config, external, revenue, receipt, *document_args)
            )
            self.assertEqual(generated.returncode, 0, generated.stderr)

            state = build_current_state(
                config,
                reviewer_tracker=folder / "REVIEWER_CANDIDATE_TRACKER.local.json",
                revenue_evidence_index=revenue,
                external_live_packet=external,
                public_live_receipt=receipt,
                live_review_closure=folder / "LIVE_REVIEW_CLOSURE.local.json",
                terms_document=terms_document,
                privacy_document=privacy_document,
                delivery_review_checklist=folder / "DELIVERY_REVIEW_CHECKLIST.local.json",
            )
            self.assertTrue(state["gates"]["publicLiveReceiptReady"])

            privacy_document.write_text(
                f"{privacy_document.read_text(encoding='utf-8')}\nMaterial privacy drift.\n",
                encoding="utf-8",
            )
            drifted_state = build_current_state(
                config,
                reviewer_tracker=folder / "REVIEWER_CANDIDATE_TRACKER.local.json",
                revenue_evidence_index=revenue,
                external_live_packet=external,
                public_live_receipt=receipt,
                live_review_closure=folder / "LIVE_REVIEW_CLOSURE.local.json",
                terms_document=terms_document,
                privacy_document=privacy_document,
                delivery_review_checklist=folder / "DELIVERY_REVIEW_CHECKLIST.local.json",
            )

        self.assertFalse(drifted_state["gates"]["publicLiveReceiptReady"])
        self.assertIn("public live readiness receipt", hard_blockers(drifted_state))

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

    def test_incomplete_exact_name_closure_event_cannot_inherit_predicted_evidence(self) -> None:
        state = build_current_state(write_public_config(), write_reviewer_tracker([]))
        predicted = simulate_company_futures(
            create_initial_future(state),
            depth=1,
            max_branches_to_keep=1,
        )
        self.assertTrue(live_review_closure_config_bound(predicted[0].state))

        incomplete_event = CompanyEvent(
            name="human_review_closure_evidence_ready",
            domain="compliance",
            probability_hint=1.0,
            strategic_value=2.2,
            tags=("hard_gate", "manual", "compliance"),
            state_delta={"gates.liveReviewClosureReady": True},
            requires_real_evidence=True,
        )

        surviving = update_futures_with_real_event(predicted, incomplete_event, state)
        observed_state = apply_state_delta(state, incomplete_event.state_delta)

        self.assertFalse(live_review_closure_config_bound(surviving[0].state))
        self.assertFalse(surviving[0].state["gates"]["liveReviewClosureReady"])
        self.assertEqual(surviving[0].state["evidence"]["liveReviewClosure"], "")
        self.assertEqual(surviving[0].state, observed_state)
        self.assertEqual(hard_blockers(surviving[0].state)[0], "humanReviewClosureEvidence")
        self.assertEqual(
            surviving[0].timeline[0].state_delta,
            incomplete_event.state_delta,
        )

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
