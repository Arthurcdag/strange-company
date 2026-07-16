from __future__ import annotations

import argparse
import copy
import json
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


SYSTEM_NAME = "VAU_COMPANY_EVOLUTION"
CONTINUOUS_EVOLUTION_OBJECTIVE = (
    "Continuously evolve Strange Company through the next smallest verified "
    "improvement while preserving launch gates, public/private separation, "
    "and the sealed-company boundary."
)
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PUBLIC_CONFIG = ROOT / "public-config.js"
DEFAULT_REVIEWER_TRACKER = ROOT / "REVIEWER_CANDIDATE_TRACKER.local.json"
DEFAULT_REVENUE_EVIDENCE_INDEX = ROOT / "REVENUE_SETUP_EVIDENCE_INDEX.local.json"
DEFAULT_EXTERNAL_LIVE_PACKET = ROOT / "EXTERNAL_LIVE_PACKET.local.json"
DEFAULT_PUBLIC_LIVE_RECEIPT = ROOT / "public-live-receipt.js"
DEFAULT_TERMS_DOCUMENT = ROOT / "TERMOS.md"
DEFAULT_PRIVACY_DOCUMENT = ROOT / "AVISO_DE_PRIVACIDADE.md"
DEFAULT_PUBLIC_AMA_QUEUE = ROOT / "PUBLIC_AMA_QUEUE.local.json"
DEFAULT_PUBLIC_AMA_ANSWERS = ROOT / "public-ama-answers.js"
DEFAULT_DELIVERY_REVIEW_CHECKLIST = ROOT / "DELIVERY_REVIEW_CHECKLIST.local.json"
DEFAULT_LIVE_REVIEW_CLOSURE = ROOT / "LIVE_REVIEW_CLOSURE.local.json"

REVIEWER_REVIEW_STATUSES = {
    "contacted",
    "responded",
    "paid_test_ready",
}
REQUIRED_REVIEWER_ROLES = {
    "terms_consumer_law",
    "privacy_lgpd",
    "tax_nfse_accounting",
    "payment_reconciliation",
}
AMA_SCREENED_BOUNDARY_DECISIONS = {
    "public_safe",
    "route_to_human",
    "reject_sensitive",
}
LIVE_REVIEW_FIELDS = {
    "terms": "termsReviewedAt",
    "privacy": "privacyReviewedAt",
    "brazilCompliance": "brazilComplianceReviewedAt",
    "aiHandoff": "aiHandoffReviewedAt",
}
LIVE_REVIEW_GATE_NAMES = (
    "termsReviewed",
    "privacyReviewed",
    "brazilComplianceReviewed",
    "aiHandoffReviewed",
)
LIVE_REVIEW_CLOSURE_EVIDENCE = "validator:passed; public-dates:matched"
LIVE_REVIEW_REQUIRED_DOCUMENTS = {
    "terms": {"TERMOS.md", "TERMS.md"},
    "privacy": {"AVISO_DE_PRIVACIDADE.md", "PRIVACY.md"},
    "brazilCompliance": {
        "BRAZIL_COMPLIANCE.md",
        "BRAZIL_COMPLIANCE_AGENTS.md",
        "CONKA8_LAW_INSTRUCTIONS.md",
    },
    "aiHandoff": {"AI_LEGAL_HANDOFF.md", "HUMAN_REVIEW_PACKET.md"},
}
LIVE_REVIEW_REQUIRED_FLAGS = {
    "terms": {
        "offerFlowReviewed",
        "refundCancellationReviewed",
        "supportFlowReviewed",
        "humanApprovedForPublicConfig",
    },
    "privacy": {
        "lgpdContactReviewed",
        "retentionReviewed",
        "processorsReviewed",
        "dataSubjectRightsReviewed",
        "humanApprovedForPublicConfig",
    },
    "brazilCompliance": {
        "cnpjOrEntityRouteReviewed",
        "fiscalReceiptRouteReviewed",
        "paymentSupportReviewed",
        "lgpdRouteReviewed",
        "humanApprovedForPublicConfig",
    },
    "aiHandoff": {
        "aiPreparedTextReviewed",
        "acceptedChangedOrRejected",
        "automatedDecisionStopRuleConfirmed",
        "humanApprovedForPublicConfig",
    },
}


@dataclass(frozen=True)
class CompanyEvent:
    name: str
    domain: str
    probability_hint: float
    strategic_value: float
    tags: tuple[str, ...] = ()
    state_delta: dict[str, Any] = field(default_factory=dict)
    requires_real_evidence: bool = False
    reason: str = ""
    next_action: str = ""

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CompanyEvent":
        tags = data.get("tags", ())
        return cls(
            name=str(data["name"]),
            domain=str(data.get("domain", "observed")),
            probability_hint=float(data.get("probability_hint", 0.5)),
            strategic_value=float(data.get("strategic_value", 1.0)),
            tags=tuple(str(tag) for tag in tags),
            state_delta=dict(data.get("state_delta", {})),
            requires_real_evidence=bool(data.get("requires_real_evidence", False)),
            reason=str(data.get("reason", "")),
            next_action=str(data.get("next_action", "")),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "domain": self.domain,
            "probability_hint": round(self.probability_hint, 4),
            "strategic_value": round(self.strategic_value, 4),
            "tags": list(self.tags),
            "state_delta": self.state_delta,
            "requires_real_evidence": self.requires_real_evidence,
            "reason": self.reason,
            "next_action": self.next_action,
        }


@dataclass
class CompanyFuture:
    state: dict[str, Any]
    timeline: list[CompanyEvent] = field(default_factory=list)
    probability: float = 1.0
    evolution_score: float = 1.0
    confidence: float = 1.0
    observed_events: int = 0

    @property
    def branch_score(self) -> float:
        return self.probability * max(0.1, self.evolution_score)

    @property
    def next_predicted_event(self) -> CompanyEvent | None:
        if self.observed_events < len(self.timeline):
            return self.timeline[self.observed_events]
        return None

    def clone(self) -> "CompanyFuture":
        return CompanyFuture(
            state=copy.deepcopy(self.state),
            timeline=list(self.timeline),
            probability=self.probability,
            evolution_score=self.evolution_score,
            confidence=self.confidence,
            observed_events=self.observed_events,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "probability": round(self.probability, 6),
            "evolution_score": round(self.evolution_score, 6),
            "branch_score": round(self.branch_score, 6),
            "confidence": round(self.confidence, 6),
            "observed_events": self.observed_events,
            "next_predicted_event": (
                self.next_predicted_event.to_dict()
                if self.next_predicted_event is not None
                else None
            ),
            "timeline": [event.to_dict() for event in self.timeline],
            "state": self.state,
        }


def clamp(value: float, lower: float = 0.01, upper: float = 0.99) -> float:
    return max(lower, min(upper, value))


def get_path(data: dict[str, Any], path: str, default: Any = None) -> Any:
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return default
        current = current[part]
    return current


def set_path(data: dict[str, Any], path: str, value: Any) -> None:
    current = data
    parts = path.split(".")
    for part in parts[:-1]:
        next_value = current.get(part)
        if not isinstance(next_value, dict):
            next_value = {}
            current[part] = next_value
        current = next_value
    current[parts[-1]] = value


def live_review_dates_ready(state: dict[str, Any]) -> bool:
    gates = state.get("gates", {})
    return isinstance(gates, dict) and all(
        gates.get(gate_name) is True for gate_name in LIVE_REVIEW_GATE_NAMES
    )


def live_review_closure_config_bound(state: dict[str, Any]) -> bool:
    gates = state.get("gates", {})
    evidence = state.get("evidence", {})
    return bool(
        isinstance(gates, dict)
        and isinstance(evidence, dict)
        and gates.get("liveReviewClosureReady") is True
        and live_review_dates_ready(state)
        and evidence.get("liveReviewClosure") == LIVE_REVIEW_CLOSURE_EVIDENCE
    )


def enforce_live_review_invariant(state: dict[str, Any]) -> dict[str, Any]:
    gates = state.get("gates")
    evidence = state.get("evidence")
    if isinstance(gates, dict) and not live_review_closure_config_bound(state):
        if gates.get("liveReviewClosureReady") is True:
            gates["liveReviewClosureReady"] = False
        if isinstance(evidence, dict) and evidence.get("liveReviewClosure"):
            evidence["liveReviewClosure"] = ""
    return state


def apply_state_delta(state: dict[str, Any], delta: dict[str, Any]) -> dict[str, Any]:
    updated = copy.deepcopy(state)
    for path, value in delta.items():
        if isinstance(value, dict) and "op" in value:
            operation = value["op"]
            current = get_path(updated, path, value.get("default", 0))
            amount = value.get("value", 1)
            if operation == "increment":
                set_path(updated, path, current + amount)
            elif operation == "decrement":
                set_path(updated, path, current - amount)
            elif operation == "max":
                set_path(updated, path, max(current, amount))
            elif operation == "min":
                set_path(updated, path, min(current, amount))
            elif operation == "append_unique":
                items = list(current or [])
                if amount not in items:
                    items.append(amount)
                set_path(updated, path, items)
            else:
                raise ValueError(f"Unsupported state delta operation: {operation}")
        else:
            set_path(updated, path, value)
    return enforce_live_review_invariant(updated)


def _read_bool_config(text: str, field_name: str, default: bool = False) -> bool:
    match = re.search(rf"\b{re.escape(field_name)}\s*:\s*(true|false)", text)
    if not match:
        return default
    return match.group(1) == "true"


def _read_string_config(text: str, field_name: str, default: str = "") -> str:
    match = re.search(rf'\b{re.escape(field_name)}\s*:\s*"([^"]*)"', text)
    if not match:
        return default
    return match.group(1)


def _normalize(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower()


def _is_blank(value: Any) -> bool:
    return value is None or str(value).strip() == ""


def _is_iso_date(value: Any) -> bool:
    if _is_blank(value):
        return False
    text = str(value).strip()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return False
    parsed = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", text)
    if not parsed:
        return False
    _year, month, day = map(int, parsed.groups())
    if month < 1 or month > 12 or day < 1 or day > 31:
        return False
    return True


def infer_reviewer_metrics(tracker_path: Path = DEFAULT_REVIEWER_TRACKER) -> tuple[int, bool]:
    if not tracker_path.exists():
        return 0, False

    try:
        tracker = json.loads(tracker_path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return 0, False

    records = tracker.get("candidateRecords") if isinstance(tracker, dict) else None
    if not isinstance(records, list):
        return 0, False

    found_candidates: set[str] = set()
    ready_roles: set[str] = set()

    for record in records:
        if not isinstance(record, dict):
            continue
        status = _normalize(record.get("contactStatus"))
        role = _normalize(record.get("reviewRole"))
        candidate_id = _normalize(record.get("candidateId"))
        candidate_label = _normalize(record.get("candidateLabel"))

        if status not in REVIEWER_REVIEW_STATUSES or not role:
            continue

        key = candidate_id or candidate_label
        if not key:
            continue

        found_candidates.add(key)

        if (
            status == "paid_test_ready"
            and role in REQUIRED_REVIEWER_ROLES
            and record.get("readyForPaidTest") is True
        ):
            ready_roles.add(role)

    is_ready_pool = bool(
        len(found_candidates) >= len(REQUIRED_REVIEWER_ROLES)
        and REQUIRED_REVIEWER_ROLES.issubset(ready_roles)
        and all(role in ready_roles for role in REQUIRED_REVIEWER_ROLES)
        and _node_validator_passes(
            "validate_reviewer_candidate_tracker.js",
            tracker_path,
            "--require-ready",
        )
    )

    return len(found_candidates), is_ready_pool


def _node_validator_passes(
    script_name: str,
    packet_path: Path,
    gate: str,
    *extra_args: str,
) -> bool:
    if not packet_path.exists():
        return False
    try:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "tools" / script_name),
                str(packet_path),
                gate,
                *extra_args,
            ],
            cwd=ROOT,
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired):
        return False
    return result.returncode == 0


def _infer_revenue_evidence(evidence_path: Path, public_config: Path) -> tuple[bool, str]:
    if not evidence_path.exists():
        return False, ""
    if not _node_validator_passes(
        "validate_revenue_setup_evidence_index.js",
        evidence_path,
        "--require-all",
        "--public-config",
        str(public_config),
    ):
        return False, ""

    try:
        data = json.loads(evidence_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return False, ""

    if not isinstance(data, dict):
        return False, ""

    tax = data.get("tax")
    payment = data.get("payment")
    if not isinstance(tax, dict) or not isinstance(payment, dict):
        return False, ""

    required_payment_fields = {
        "paymentEvidenceId",
        "provider",
        "businessAccountName",
        "testPaymentId",
        "testPayoutStatus",
        "reconciliationOwner",
    }
    required_tax_fields = {
        "taxEvidenceId",
        "nfseRoute",
        "cnae",
        "taxRegime",
        "fiscalDocumentOwner",
        "testNfseOrReceiptStatus",
        "accountantReviewedAt",
        "monthlyReconciliationOwner",
    }

    for key in required_payment_fields:
        if _is_blank(payment.get(key)):
            return False, ""
    if payment.get("payoutDestinationVerified") is not True:
        return False, ""
    if payment.get("feesReviewed") is not True:
        return False, ""
    if payment.get("verified") is not True:
        return False, ""

    for key in required_tax_fields:
        if _is_blank(tax.get(key)):
            return False, ""
    if not _is_iso_date(tax.get("accountantReviewedAt")):
        return False, ""
    if tax.get("verified") is not True:
        return False, ""

    payment_ref = str(payment.get("paymentEvidenceId")).strip()
    tax_ref = str(tax.get("taxEvidenceId")).strip()
    return (
        True,
        f"payment:{payment_ref}; tax:{tax_ref}"
        if payment_ref and tax_ref
        else "revenue-evidence-ready",
    )


def _infer_external_live_evidence(evidence_path: Path, public_config: Path) -> tuple[bool, str]:
    ready = _node_validator_passes(
        "validate_external_live_packet.js",
        evidence_path,
        "--require-live",
        "--public-config",
        str(public_config),
    )
    return ready, "validator:passed" if ready else ""


def _infer_live_review_closure(
    closure_path: Path,
    public_config: Path,
    terms_document: Path,
    privacy_document: Path,
) -> tuple[bool, str]:
    if not _node_validator_passes(
        "validate_live_review_closure.js",
        closure_path,
        "--require-ready",
        "--terms-doc",
        str(terms_document),
        "--privacy-doc",
        str(privacy_document),
        "--public-config",
        str(public_config),
    ):
        return False, ""

    try:
        packet = json.loads(closure_path.read_text(encoding="utf-8-sig"))
        config_text = public_config.read_text(encoding="utf-8")
    except (OSError, json.JSONDecodeError):
        return False, ""

    patch = packet.get("publicConfigPatch") if isinstance(packet, dict) else None
    if not isinstance(patch, dict):
        return False, ""

    for config_field in LIVE_REVIEW_FIELDS.values():
        packet_date = str(patch.get(config_field, "")).strip()
        config_date = _read_string_config(config_text, config_field).strip()
        if not packet_date or packet_date != config_date:
            return False, ""

    return True, LIVE_REVIEW_CLOSURE_EVIDENCE


def _infer_public_live_receipt(
    receipt_path: Path,
    public_config: Path,
    terms_document: Path,
    privacy_document: Path,
) -> tuple[bool, str]:
    if not receipt_path.exists():
        return False, ""
    try:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "tools" / "export_public_live_receipt.js"),
                "--check-public-js",
                "--require-issued",
                "--public-config",
                str(public_config),
                "--public-js",
                str(receipt_path),
                "--terms-doc",
                str(terms_document),
                "--privacy-doc",
                str(privacy_document),
            ],
            cwd=ROOT,
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired):
        return False, ""
    ready = result.returncode == 0
    return ready, "public-receipt:issued" if ready else ""


def _read_public_ama_answer_records(answers_path: Path) -> list[dict[str, Any]]:
    if not answers_path.exists():
        return []

    try:
        text = answers_path.read_text(encoding="utf-8-sig")
        if answers_path.suffix.lower() == ".json":
            archive = json.loads(text)
        else:
            match = re.search(
                r"window\.PUBLIC_AMA_ANSWERS\s*=\s*Object\.freeze\((\{.*\})\);\s*$",
                text,
                re.DOTALL,
            )
            if not match:
                return []
            archive = json.loads(match.group(1))
    except (OSError, json.JSONDecodeError):
        return []

    answers = archive.get("answers") if isinstance(archive, dict) else None
    return [answer for answer in answers if isinstance(answer, dict)] if isinstance(answers, list) else []


def infer_public_ama_metrics(
    queue_path: Path = DEFAULT_PUBLIC_AMA_QUEUE,
    answers_path: Path = DEFAULT_PUBLIC_AMA_ANSWERS,
) -> tuple[int, int, int, str]:
    screened_ids: set[str] = set()
    answer_ready_ids: set[str] = set()
    published_ids: set[str] = set()

    if queue_path.exists():
        try:
            queue = json.loads(queue_path.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError):
            queue = {}

        records = queue.get("questionRecords") if isinstance(queue, dict) else None
        if isinstance(records, list):
            for record in records:
                if not isinstance(record, dict):
                    continue
                question_id = _normalize(record.get("questionId")) or _normalize(record.get("questionSummary"))
                if not question_id:
                    continue

                status = _normalize(record.get("status"))
                boundary = _normalize(record.get("boundaryDecision"))
                human_screened = record.get("humanScreened") is True

                if human_screened and boundary in AMA_SCREENED_BOUNDARY_DECISIONS:
                    screened_ids.add(question_id)

                if (
                    status == "answer_ready"
                    and boundary == "public_safe"
                    and human_screened
                    and record.get("humanApprovedForPublication") is True
                    and not _is_blank(record.get("publicAnswer"))
                    and _is_iso_date(record.get("answerReviewedAt"))
                ):
                    answer_ready_ids.add(question_id)

                if (
                    status == "published"
                    and boundary == "public_safe"
                    and human_screened
                    and record.get("humanApprovedForPublication") is True
                    and not _is_blank(record.get("publicAnswer"))
                    and _is_iso_date(record.get("answerReviewedAt"))
                ):
                    published_ids.add(question_id)

    for answer in _read_public_ama_answer_records(answers_path):
        question_id = _normalize(answer.get("questionId")) or _normalize(answer.get("publicSafeQuestion"))
        if (
            question_id
            and not _is_blank(answer.get("publicSafeQuestion"))
            and not _is_blank(answer.get("publicAnswer"))
            and _is_iso_date(answer.get("answerReviewedAt"))
            and _is_iso_date(answer.get("publishedAt"))
        ):
            published_ids.add(question_id)

    evidence = (
        f"questions:{len(screened_ids)}; answer-ready:{len(answer_ready_ids)}; published:{len(published_ids)}"
        if screened_ids or answer_ready_ids or published_ids
        else ""
    )
    return len(screened_ids), len(answer_ready_ids), len(published_ids), evidence


def infer_delivery_review_loop(
    checklist_path: Path = DEFAULT_DELIVERY_REVIEW_CHECKLIST,
) -> tuple[bool, str]:
    if not checklist_path.exists():
        return False, ""
    if not _node_validator_passes(
        "validate_delivery_review_checklist.js",
        checklist_path,
        "--require-ready",
    ):
        return False, ""

    try:
        data = json.loads(checklist_path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return False, ""

    if not isinstance(data, dict):
        return False, ""

    loop = data.get("deliveryLoop")
    evidence = data.get("evidence")
    attestation = data.get("attestation")
    if not isinstance(loop, dict) or not isinstance(evidence, dict) or not isinstance(attestation, dict):
        return False, ""

    required_loop_fields = {
        "serviceName",
        "orderId",
        "scopeEvidenceRef",
        "humanReviewer",
        "humanReviewDate",
        "deliveryArtifactUrl",
    }
    required_evidence_fields = {
        "intakePacketRef",
        "sourceOrderRef",
        "draftArtifactRef",
        "reviewNotesRef",
        "finalArtifactRef",
        "receiptRoot",
    }
    required_loop_flags = {
        "intakeAccepted",
        "dataBoundaryConfirmed",
        "aiDraftCreated",
        "humanReviewCompleted",
        "revisionsCompleted",
        "acceptanceCriteriaMet",
        "receiptChainUpdated",
        "incidentReviewCompleted",
        "readyForDelivery",
    }
    required_attestation_flags = {
        "noSecretsInRepo",
        "noCustomerPrivateDataInRepo",
        "aiDidNotApproveFinalDelivery",
        "strangeCompanyRemainsSealed",
        "satelliteIsDeliveryOperator",
    }

    if any(_is_blank(loop.get(key)) for key in required_loop_fields):
        return False, ""
    if not _is_iso_date(loop.get("humanReviewDate")):
        return False, ""
    if not str(loop.get("deliveryArtifactUrl", "")).strip().startswith("https://"):
        return False, ""
    if any(loop.get(key) is not True for key in required_loop_flags):
        return False, ""
    if any(_is_blank(evidence.get(key)) for key in required_evidence_fields):
        return False, ""
    if _is_blank(attestation.get("operator")) or not _is_iso_date(attestation.get("reviewedAt")):
        return False, ""
    if any(attestation.get(key) is not True for key in required_attestation_flags):
        return False, ""

    return (
        True,
        f"order:{str(loop.get('orderId')).strip()}; artifact:{str(evidence.get('finalArtifactRef')).strip()}",
    )


def build_current_state(
    public_config: Path = DEFAULT_PUBLIC_CONFIG,
    reviewer_tracker: Path = DEFAULT_REVIEWER_TRACKER,
    revenue_evidence_index: Path = DEFAULT_REVENUE_EVIDENCE_INDEX,
    external_live_packet: Path = DEFAULT_EXTERNAL_LIVE_PACKET,
    public_live_receipt: Path = DEFAULT_PUBLIC_LIVE_RECEIPT,
    terms_document: Path = DEFAULT_TERMS_DOCUMENT,
    privacy_document: Path = DEFAULT_PRIVACY_DOCUMENT,
    public_ama_queue: Path = DEFAULT_PUBLIC_AMA_QUEUE,
    public_ama_answers: Path = DEFAULT_PUBLIC_AMA_ANSWERS,
    delivery_review_checklist: Path = DEFAULT_DELIVERY_REVIEW_CHECKLIST,
    live_review_closure: Path = DEFAULT_LIVE_REVIEW_CLOSURE,
) -> dict[str, Any]:
    text = public_config.read_text(encoding="utf-8")
    terms_reviewed_at = _read_string_config(text, "termsReviewedAt")
    privacy_reviewed_at = _read_string_config(text, "privacyReviewedAt")
    brazil_reviewed_at = _read_string_config(text, "brazilComplianceReviewedAt")
    ai_handoff_reviewed_at = _read_string_config(text, "aiHandoffReviewedAt")
    review_date_gates = {
        "termsReviewed": bool(terms_reviewed_at),
        "privacyReviewed": bool(privacy_reviewed_at),
        "brazilComplianceReviewed": bool(brazil_reviewed_at),
        "aiHandoffReviewed": bool(ai_handoff_reviewed_at),
    }
    human_reviewers_found, reviewers_ready = infer_reviewer_metrics(reviewer_tracker)
    payment_fiscal_evidence_ready, payment_fiscal_evidence = _infer_revenue_evidence(
        revenue_evidence_index,
        public_config,
    )
    external_live_evidence_ready, external_live_evidence = _infer_external_live_evidence(
        external_live_packet,
        public_config,
    )
    live_review_closure_ready, live_review_closure_evidence = _infer_live_review_closure(
        live_review_closure,
        public_config,
        terms_document,
        privacy_document,
    )
    live_review_closure_ready = bool(
        live_review_closure_ready and all(review_date_gates.values())
    )
    if not live_review_closure_ready:
        live_review_closure_evidence = ""
    public_live_receipt_ready, public_live_receipt_evidence = _infer_public_live_receipt(
        public_live_receipt,
        public_config,
        terms_document,
        privacy_document,
    )
    ama_questions, ama_answers_ready, ama_answers_published, ama_queue_evidence = infer_public_ama_metrics(
        public_ama_queue,
        public_ama_answers,
    )
    delivery_review_loop_ready, delivery_review_loop_evidence = infer_delivery_review_loop(
        delivery_review_checklist
    )

    return {
        "company": "Strange Company",
        "operator": _read_string_config(text, "operatorName", "Strange Works Studio"),
        "jurisdiction": _read_string_config(text, "jurisdiction", "BR"),
        "snapshot": {
            "source": str(public_config),
            "liveMode": _read_bool_config(text, "liveMode"),
        },
        "gates": {
            "supportInboxVerified": _read_bool_config(text, "supportInboxVerified"),
            "googleFormVerified": _read_bool_config(text, "googleFormVerified"),
            **review_date_gates,
            "privatePaymentFiscalEvidenceReady": payment_fiscal_evidence_ready,
            "privateExternalLiveEvidenceReady": external_live_evidence_ready,
            "liveReviewClosureReady": live_review_closure_ready,
            "publicLiveReceiptReady": public_live_receipt_ready,
            "humanReviewersReady": reviewers_ready,
            "publicAmaQueueActive": (ama_questions + ama_answers_published) > 0,
            "publicAmaAnswerReady": (ama_answers_ready + ama_answers_published) > 0,
            "deliveryReviewLoopReady": delivery_review_loop_ready,
            "liveMode": _read_bool_config(text, "liveMode"),
        },
        "evidence": {
            "termsReviewedAt": terms_reviewed_at,
            "privacyReviewedAt": privacy_reviewed_at,
            "brazilComplianceReviewedAt": brazil_reviewed_at,
            "aiHandoffReviewedAt": ai_handoff_reviewed_at,
            "privatePaymentFiscalEvidence": payment_fiscal_evidence,
            "privateExternalLiveEvidence": external_live_evidence,
            "liveReviewClosure": live_review_closure_evidence,
            "publicLiveReceipt": public_live_receipt_evidence,
            "publicAmaQueue": ama_queue_evidence,
            "deliveryReviewLoop": delivery_review_loop_evidence,
        },
        "metrics": {
            "human_reviewers_found": human_reviewers_found,
            "public_ama_questions_screened": ama_questions,
            "public_ama_answers_ready": ama_answers_ready,
            "public_ama_answers_published": ama_answers_published,
            "qualified_leads": 0,
            "pilot_requests": 0,
            "paid_pilots": 0,
            "delivery_capacity": 1,
            "support_load": 0,
            "open_risks": 1,
            "evidence_gaps": 0,
            "tooling_maturity": 2,
        },
        "notes": [],
    }


def hard_blockers(state: dict[str, Any]) -> list[str]:
    gates = state.get("gates", {})
    blockers: list[str] = []
    if not live_review_closure_config_bound(state):
        blockers.append("humanReviewClosureEvidence")
    if not gates.get("termsReviewed"):
        blockers.append("termsReviewedAt")
    if not gates.get("privacyReviewed"):
        blockers.append("privacyReviewedAt")
    if not gates.get("brazilComplianceReviewed"):
        blockers.append("brazilComplianceReviewedAt")
    if not gates.get("aiHandoffReviewed"):
        blockers.append("aiHandoffReviewedAt")
    if not gates.get("privatePaymentFiscalEvidenceReady"):
        blockers.append("private payment/fiscal evidence")
    if not gates.get("privateExternalLiveEvidenceReady"):
        blockers.append("private external live evidence")
    if not gates.get("publicLiveReceiptReady"):
        blockers.append("public live readiness receipt")
    return blockers


def operational_blockers(state: dict[str, Any]) -> list[str]:
    gates = state.get("gates", {})
    blockers = list(hard_blockers(state))
    if not gates.get("humanReviewersReady", False):
        blockers.append("4 human reviewers")
    if not gates.get("deliveryReviewLoopReady", False):
        blockers.append("delivery review loop")
    return blockers


def public_live_ready(state: dict[str, Any]) -> bool:
    gates = state.get("gates", {})
    return (
        gates.get("supportInboxVerified", False)
        and gates.get("googleFormVerified", False)
        and not hard_blockers(state)
    )


def company_operational_ready(state: dict[str, Any]) -> bool:
    return public_live_ready(state) and not operational_blockers(state)


def continuous_evolution_goal(state: dict[str, Any]) -> dict[str, Any]:
    hard = hard_blockers(state)
    setup_hard = [blocker for blocker in hard if blocker != "public live readiness receipt"]
    operational = operational_blockers(state)
    gates = state.get("gates", {})
    public_routes_ready = bool(
        gates.get("supportInboxVerified", False)
        and gates.get("googleFormVerified", False)
    )
    live_mode = bool(get_path(state, "gates.liveMode", False))

    if setup_hard:
        mode = "burn_down_hard_blockers"
        next_loop = "Close one real evidence gate, rerun VAU, and keep liveMode false."
    elif not public_routes_ready or operational:
        mode = "harden_operations"
        next_loop = "Improve public route verification, reviewer capacity, delivery review, or support receipts before scaling."
    elif live_mode:
        mode = "operate_measure_adapt"
        next_loop = "Convert each live outcome into a reviewed receipt, then scale, revise, or kill the lane."
    else:
        mode = "ready_for_human_live_decision"
        next_loop = "Run the live audit and require a human operator decision before flipping liveMode."

    return {
        "objective": CONTINUOUS_EVOLUTION_OBJECTIVE,
        "cadence": "Run after each repo change, real-world receipt, blocker, or completed operator action.",
        "current_mode": mode,
        "next_loop": next_loop,
        "guardrails": [
            "Do not set liveMode true until all hard blockers are closed with real evidence.",
            "Do not let simulations, templates, or AI outputs claim legal, tax, payment, privacy, or launch approval.",
            "Keep local evidence, credentials, private reviewer notes, and sealed-company material out of the public repo.",
            "Every evolution should leave an executable check, receipt, report, or documented next action.",
        ],
    }


def generate_company_events(future: CompanyFuture) -> list[CompanyEvent]:
    state = future.state
    events: list[CompanyEvent] = []
    blockers = operational_blockers(state)
    hard = hard_blockers(state)
    reviewers = int(get_path(state, "metrics.human_reviewers_found", 0))
    ama_questions = int(get_path(state, "metrics.public_ama_questions_screened", 0))
    ama_answers_ready = int(get_path(state, "metrics.public_ama_answers_ready", 0))
    ama_answers_published = int(get_path(state, "metrics.public_ama_answers_published", 0))
    leads = int(get_path(state, "metrics.qualified_leads", 0))
    pilots = int(get_path(state, "metrics.pilot_requests", 0))
    tooling = int(get_path(state, "metrics.tooling_maturity", 2))
    live_mode = bool(get_path(state, "gates.liveMode", False))

    if any(
        blocker in hard
        for blocker in (
            "termsReviewedAt",
            "privacyReviewedAt",
            "brazilComplianceReviewedAt",
            "aiHandoffReviewedAt",
        )
    ):
        events.append(
            CompanyEvent(
                name="human_review_dates_recorded",
                domain="compliance",
                probability_hint=0.26,
                strategic_value=2.1,
                tags=("hard_gate", "manual", "compliance", "evidence"),
                state_delta={
                    "gates.termsReviewed": True,
                    "gates.privacyReviewed": True,
                    "gates.brazilComplianceReviewed": True,
                    "gates.aiHandoffReviewed": True,
                    "notes": {
                        "op": "append_unique",
                        "value": "Human review dates are simulated as complete; repo config still needs real dates.",
                    },
                },
                requires_real_evidence=True,
                reason="The public gate cannot evolve until the four review dates are real.",
                next_action="Get human review on terms, privacy, Brazil compliance, and AI handoff, then record real dates.",
            )
        )

    if "humanReviewClosureEvidence" in hard:
        events.append(
            CompanyEvent(
                name="human_review_closure_evidence_ready",
                domain="compliance",
                probability_hint=0.24,
                strategic_value=2.2,
                tags=(
                    "hard_gate",
                    "top_priority",
                    "manual",
                    "compliance",
                    "document_bound_evidence",
                ),
                state_delta={
                    "gates.termsReviewed": True,
                    "gates.privacyReviewed": True,
                    "gates.brazilComplianceReviewed": True,
                    "gates.aiHandoffReviewed": True,
                    "gates.liveReviewClosureReady": True,
                    "evidence.liveReviewClosure": LIVE_REVIEW_CLOSURE_EVIDENCE,
                },
                requires_real_evidence=True,
                reason=(
                    "Public review dates are not authoritative without a validator-passing closure packet "
                    "bound to the current canonical reviewed documents."
                ),
                next_action=(
                    "Complete LIVE_REVIEW_CLOSURE.local.json with current documentDigests, copy its exact four "
                    "review dates into public-config.js, then run "
                    "node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json "
                    "--require-ready --public-config public-config.js, and keep liveMode false."
                ),
            )
        )

    if "private payment/fiscal evidence" in hard:
        events.append(
            CompanyEvent(
                name="payment_fiscal_evidence_ready",
                domain="finance",
                probability_hint=0.25,
                strategic_value=2.2,
                tags=("hard_gate", "manual", "finance", "evidence"),
                state_delta={
                    "gates.privatePaymentFiscalEvidenceReady": True,
                    "evidence.privatePaymentFiscalEvidence": "ready-private",
                },
                requires_real_evidence=True,
                reason="Revenue can start safely only after private payment and fiscal proof is ready.",
                next_action=(
                    "Prepare private Stripe/bank/fiscal evidence outside git and mark it in "
                    "REVENUE_SETUP_EVIDENCE_INDEX.local.json."
                ),
            )
        )

    if "private external live evidence" in hard:
        events.append(
            CompanyEvent(
                name="external_live_evidence_ready",
                domain="operations",
                probability_hint=0.27,
                strategic_value=2.2,
                tags=("hard_gate", "manual", "operations", "evidence"),
                state_delta={
                    "gates.privateExternalLiveEvidenceReady": True,
                    "evidence.privateExternalLiveEvidence": "validator:passed",
                },
                requires_real_evidence=True,
                reason="A human live decision requires the strict external support, Google, Stripe, bank, and review packet.",
                next_action=(
                    "Complete EXTERNAL_LIVE_PACKET.local.json outside git, then run "
                    "node tools/validate_external_live_packet.js "
                    "EXTERNAL_LIVE_PACKET.local.json --require-live "
                    "--public-config public-config.js."
                ),
            )
        )

    if (
        "public live readiness receipt" in hard
        and get_path(state, "gates.privatePaymentFiscalEvidenceReady", False)
        and get_path(state, "gates.privateExternalLiveEvidenceReady", False)
        and live_review_closure_config_bound(state)
        and get_path(state, "gates.humanReviewersReady", False)
        and get_path(state, "gates.deliveryReviewLoopReady", False)
    ):
        events.append(
            CompanyEvent(
                name="public_live_receipt_issued",
                domain="operations",
                probability_hint=0.3,
                strategic_value=2.1,
                tags=("hard_gate", "manual", "public_receipt"),
                state_delta={
                    "gates.publicLiveReceiptReady": True,
                    "evidence.publicLiveReceipt": "public-receipt:issued",
                },
                requires_real_evidence=True,
                reason="The public desk needs a short-lived, config-bound receipt after document-bound closure plus the four revenue, external-live, reviewer, and delivery validators pass.",
                next_action=(
                    "Run node tools/export_public_live_receipt.js with revenue, external-live, reviewer, and delivery packets "
                    "--live-review-closure LIVE_REVIEW_CLOSURE.local.json while liveMode remains false, "
                    "review the public-only output, and then rerun VAU."
                ),
            )
        )

    if reviewers < 4:
        events.extend(
            [
                CompanyEvent(
                    name="reviewer_candidate_added",
                    domain="human_review",
                    probability_hint=0.34 + min(reviewers, 3) * 0.03,
                    strategic_value=1.4,
                    tags=("manual", "reviewers", "capacity"),
                    state_delta={
                        "metrics.human_reviewers_found": {"op": "increment", "value": 1},
                    },
                    requires_real_evidence=True,
                    reason="The company needs a human review bench before client delivery scales.",
                    next_action=(
                        "Contact one reviewer candidate, record scope, rate, availability, and test task "
                        "in REVIEWER_CANDIDATE_TRACKER.local.json, then run "
                        "node tools/validate_reviewer_candidate_tracker.js "
                        "REVIEWER_CANDIDATE_TRACKER.local.json --require-one."
                    ),
                ),
                CompanyEvent(
                    name="reviewer_pool_ready",
                    domain="human_review",
                    probability_hint=0.1 + min(reviewers, 3) * 0.06,
                    strategic_value=2.0,
                    tags=("manual", "reviewers", "capacity", "hard_gate"),
                    state_delta={
                        "metrics.human_reviewers_found": 4,
                        "gates.humanReviewersReady": True,
                    },
                    requires_real_evidence=True,
                    reason="Four reviewers unlock safer delivery and reduce AI-only risk.",
                    next_action=(
                        "Confirm four reviewers and their paid-test availability in "
                        "REVIEWER_CANDIDATE_TRACKER.local.json, then run "
                        "node tools/validate_reviewer_candidate_tracker.js "
                        "REVIEWER_CANDIDATE_TRACKER.local.json --require-ready."
                    ),
                ),
                CompanyEvent(
                    name="reviewer_search_stalls",
                    domain="human_review",
                    probability_hint=0.16,
                    strategic_value=-0.4,
                    tags=("risk", "reviewers", "delay"),
                    state_delta={
                        "metrics.open_risks": {"op": "increment", "value": 1},
                        "notes": {
                            "op": "append_unique",
                            "value": "Reviewer search needs clearer rate or narrower test task.",
                        },
                    },
                    reason="Manual recruiting can stall if the ask is unclear.",
                    next_action="Rewrite the reviewer ask with exact scope, rate band, and 30-minute paid test.",
                ),
            ]
        )

    if ama_questions + ama_answers_published <= 0:
        events.append(
            CompanyEvent(
                name="public_ama_question_screened",
                domain="community",
                probability_hint=0.36,
                strategic_value=1.2,
                tags=("public", "ama", "safe_growth"),
                state_delta={
                    "metrics.public_ama_questions_screened": {"op": "increment", "value": 1},
                    "gates.publicAmaQueueActive": True,
                    "evidence.publicAmaQueue": "screened-question",
                },
                requires_real_evidence=True,
                reason="The online AMA can create public learning without opening paid intake.",
                next_action=(
                    "Create PUBLIC_AMA_QUEUE.local.json, add one redacted public-safe question, then run "
                    "node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-one."
                ),
            )
        )
    elif ama_answers_ready + ama_answers_published <= 0:
        events.append(
            CompanyEvent(
                name="public_ama_answer_ready",
                domain="community",
                probability_hint=0.3,
                strategic_value=1.35,
                tags=("public", "ama", "human_review"),
                state_delta={
                    "metrics.public_ama_answers_ready": {"op": "increment", "value": 1},
                    "gates.publicAmaAnswerReady": True,
                },
                requires_real_evidence=True,
                reason="A screened AMA question should become a human-approved public answer before publication.",
                next_action=(
                    "Draft one public-safe AMA answer, get human publication approval, then run "
                    "node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-answer-ready."
                ),
            )
        )
    elif ama_answers_published <= 0:
        events.append(
            CompanyEvent(
                name="public_ama_answer_published",
                domain="community",
                probability_hint=0.24,
                strategic_value=1.1,
                tags=("public", "ama", "publication"),
                state_delta={
                    "metrics.public_ama_answers_published": {"op": "increment", "value": 1},
                },
                requires_real_evidence=True,
                reason="Publishing a reviewed AMA answer grows public context while keeping the paid gate closed.",
                next_action="Publish one answer-ready AMA response and keep private queue evidence out of git.",
            )
        )

    if not get_path(state, "gates.deliveryReviewLoopReady", False):
        events.append(
            CompanyEvent(
                name="delivery_review_loop_ready",
                domain="delivery",
                probability_hint=0.24,
                strategic_value=1.6,
                tags=("operations", "review", "capacity"),
                state_delta={
                    "gates.deliveryReviewLoopReady": True,
                    "metrics.delivery_capacity": {"op": "increment", "value": 1},
                },
                reason="Client work needs intake, AI draft, human review, revision, and receipt steps.",
                next_action=(
                    "Create DELIVERY_REVIEW_CHECKLIST.local.json, complete one reviewed delivery loop, "
                    "then run node tools/validate_delivery_review_checklist.js "
                    "DELIVERY_REVIEW_CHECKLIST.local.json --require-ready."
                ),
            )
        )

    if blockers:
        events.append(
            CompanyEvent(
                name="live_mode_correctly_stays_closed",
                domain="governance",
                probability_hint=0.31,
                strategic_value=0.9,
                tags=("safe_block", "governance", "evidence"),
                state_delta={
                    "metrics.evidence_gaps": {"op": "increment", "value": 1},
                    "gates.liveMode": False,
                },
                reason="The right evolution is not opening live mode until blockers are cleared.",
                next_action="Keep liveMode false and burn down the listed hard blockers.",
            )
        )

    if tooling < 5:
        events.append(
            CompanyEvent(
                name="vau_operating_dashboard_improves",
                domain="tooling",
                probability_hint=0.2,
                strategic_value=1.2,
                tags=("tooling", "repeatable"),
                state_delta={"metrics.tooling_maturity": {"op": "increment", "value": 1}},
                reason="A stronger operator loop makes future decisions less ad hoc.",
                next_action="Add one measurable VAU dashboard field or audit command.",
            )
        )

    if public_live_ready(state) and reviewers >= 4:
        events.append(
            CompanyEvent(
                name="controlled_pilot_request_qualified",
                domain="revenue",
                probability_hint=0.24 + min(leads, 2) * 0.04,
                strategic_value=1.7,
                tags=("revenue", "pilot", "client"),
                state_delta={
                    "metrics.qualified_leads": {"op": "increment", "value": 1},
                    "metrics.pilot_requests": {"op": "increment", "value": 1},
                },
                requires_real_evidence=True,
                reason="Once public gate and reviewer capacity exist, a controlled pilot is the next evolution.",
                next_action="Qualify one pilot through the public form and private review checklist.",
            )
        )

    if company_operational_ready(state) and pilots > 0:
        events.append(
            CompanyEvent(
                name="first_paid_pilot_delivered",
                domain="revenue",
                probability_hint=0.2,
                strategic_value=2.2,
                tags=("revenue", "delivery", "evidence"),
                state_delta={
                    "metrics.paid_pilots": {"op": "increment", "value": 1},
                    "metrics.pilot_requests": {"op": "decrement", "value": 1},
                },
                requires_real_evidence=True,
                reason="The company evolves only when paid work closes with evidence and review.",
                next_action="Deliver one paid pilot through the review loop and store a private receipt.",
            )
        )

    if company_operational_ready(state) and not live_mode:
        events.append(
            CompanyEvent(
                name="live_mode_ready_for_human_flip",
                domain="governance",
                probability_hint=0.18,
                strategic_value=1.8,
                tags=("manual", "live_gate", "evidence"),
                state_delta={},
                requires_real_evidence=True,
                reason="VAU may recommend readiness, but a human must flip live mode after evidence review.",
                next_action="Run the live audit and have the operator decide whether to flip liveMode.",
            )
        )

    events.extend(
        [
            CompanyEvent(
                name="lead_unqualified",
                domain="revenue",
                probability_hint=0.14,
                strategic_value=-0.2,
                tags=("revenue", "risk"),
                state_delta={"metrics.open_risks": {"op": "increment", "value": 1}},
                reason="Not every lead is a fit for the compliance proof sprint.",
                next_action="Tighten qualification copy and reject bad-fit work early.",
            ),
            CompanyEvent(
                name="scope_creep_detected",
                domain="delivery",
                probability_hint=0.12,
                strategic_value=-0.3,
                tags=("delivery", "risk", "review"),
                state_delta={"metrics.open_risks": {"op": "increment", "value": 1}},
                reason="New client work can expand beyond the current review loop.",
                next_action="Define out-of-scope language before accepting delivery work.",
            ),
        ]
    )

    return events


def score_event_likelihood(event: CompanyEvent, future: CompanyFuture) -> float:
    state = future.state
    score = event.probability_hint

    if "hard_gate" in event.tags and hard_blockers(state):
        score *= 1.2
    if event.domain == "revenue" and not public_live_ready(state):
        score *= 0.45
    if event.domain == "delivery" and int(get_path(state, "metrics.human_reviewers_found", 0)) < 2:
        score *= 0.8
    if "risk" in event.tags and int(get_path(state, "metrics.open_risks", 0)) > 1:
        score *= 1.1
    if event.name == "live_mode_ready_for_human_flip" and not company_operational_ready(state):
        score *= 0.1

    return clamp(score)


def simulate_company_futures(
    futures: list[CompanyFuture],
    depth: int,
    max_branches_to_keep: int,
) -> list[CompanyFuture]:
    if depth < 0:
        raise ValueError("depth must be zero or greater")
    if max_branches_to_keep < 1:
        raise ValueError("max branches must be at least one")

    active = []
    for future in futures:
        normalized = future.clone()
        normalized.state = enforce_live_review_invariant(normalized.state)
        active.append(normalized)
    for _step in range(depth):
        new_futures: list[CompanyFuture] = []
        for future in active:
            for event in generate_company_events(future):
                new_future = future.clone()
                new_future.timeline.append(event)
                new_future.state = apply_state_delta(new_future.state, event.state_delta)
                new_future.probability *= score_event_likelihood(event, future)
                new_future.evolution_score += event.strategic_value
                new_futures.append(new_future)
        new_futures.sort(
            key=lambda item: (
                bool(
                    item.observed_events < len(item.timeline)
                    and "top_priority" in item.timeline[item.observed_events].tags
                ),
                item.branch_score,
            ),
            reverse=True,
        )
        active = new_futures[:max_branches_to_keep]
    return active


def create_initial_future(current_state: dict[str, Any]) -> list[CompanyFuture]:
    normalized_state = enforce_live_review_invariant(copy.deepcopy(current_state))
    return [CompanyFuture(state=normalized_state)]


def tokenize(text: str) -> set[str]:
    return {
        token
        for token in "".join(char.lower() if char.isalnum() else " " for char in text).split()
        if token
    }


def compare_events(real_event: CompanyEvent, predicted_event: CompanyEvent | None) -> float:
    if predicted_event is None:
        return 0.0
    if real_event.name == predicted_event.name:
        return 1.0
    name_similarity = (
        len(tokenize(real_event.name) & tokenize(predicted_event.name))
        / len(tokenize(real_event.name) | tokenize(predicted_event.name))
        if tokenize(real_event.name) or tokenize(predicted_event.name)
        else 0.0
    )
    tag_similarity = (
        len(set(real_event.tags) & set(predicted_event.tags))
        / len(set(real_event.tags) | set(predicted_event.tags))
        if real_event.tags or predicted_event.tags
        else 0.0
    )
    domain_similarity = 1.0 if real_event.domain == predicted_event.domain else 0.0
    return clamp(name_similarity * 0.45 + tag_similarity * 0.3 + domain_similarity * 0.25, 0.0, 1.0)


def update_futures_with_real_event(
    predicted_futures: list[CompanyFuture],
    real_event: CompanyEvent,
    current_state: dict[str, Any],
) -> list[CompanyFuture]:
    def correct_with_observation(future: CompanyFuture) -> CompanyFuture:
        corrected = future.clone()
        observed_index = corrected.observed_events
        if observed_index < len(corrected.timeline):
            corrected.timeline[observed_index] = real_event
        else:
            corrected.timeline.append(real_event)
        corrected.observed_events = observed_index + 1

        corrected_state = apply_state_delta(current_state, real_event.state_delta)
        for pending_event in corrected.timeline[corrected.observed_events :]:
            corrected_state = apply_state_delta(corrected_state, pending_event.state_delta)
        corrected.state = corrected_state
        return corrected

    surviving: list[CompanyFuture] = []
    for future in predicted_futures:
        similarity = compare_events(real_event, future.next_predicted_event)
        if similarity >= 0.7:
            corrected = correct_with_observation(future)
            corrected.confidence = min(1.0, corrected.confidence + 0.15)
            corrected.probability *= 1.0 + similarity * 0.1
            surviving.append(corrected)
        elif similarity >= 0.35:
            corrected = correct_with_observation(future)
            corrected.confidence *= 0.7
            corrected.probability *= 0.55 + similarity * 0.25
            surviving.append(corrected)

    if not surviving:
        return [
            CompanyFuture(
                state=apply_state_delta(current_state, real_event.state_delta),
                timeline=[real_event],
                probability=1.0,
                evolution_score=1.0 + real_event.strategic_value,
                confidence=0.35,
                observed_events=1,
            )
        ]

    surviving.sort(key=lambda item: (item.confidence, item.branch_score), reverse=True)
    return surviving


def recommended_next_actions(
    futures: list[CompanyFuture],
    limit: int = 6,
) -> list[dict[str, Any]]:
    action_scores: dict[str, dict[str, Any]] = {}
    for future in futures:
        events = future.timeline[future.observed_events :] if future.timeline else []
        for index, event in enumerate(events):
            if not event.next_action:
                continue
            record = action_scores.setdefault(
                event.next_action,
                {
                    "action": event.next_action,
                    "domains": set(),
                    "events": set(),
                    "score": 0.0,
                    "requires_real_evidence": False,
                    "priority": 0,
                },
            )
            urgency_discount = 1.0 / float(index + 1)
            record["domains"].add(event.domain)
            record["events"].add(event.name)
            record["score"] += future.branch_score * urgency_discount
            record["requires_real_evidence"] = (
                record["requires_real_evidence"] or event.requires_real_evidence
            )
            if "top_priority" in event.tags:
                record["priority"] = 1

    ordered = sorted(
        action_scores.values(),
        key=lambda item: (item["priority"], item["score"]),
        reverse=True,
    )
    return [
        {
            "action": item["action"],
            "domains": sorted(item["domains"]),
            "events": sorted(item["events"]),
            "score": round(item["score"], 6),
            "requires_real_evidence": item["requires_real_evidence"],
        }
        for item in ordered[:limit]
    ]


def run_cycle(
    current_state: dict[str, Any],
    depth: int,
    max_branches_to_keep: int,
    real_event: CompanyEvent | None = None,
) -> dict[str, Any]:
    current_state = enforce_live_review_invariant(copy.deepcopy(current_state))
    predicted = simulate_company_futures(
        create_initial_future(current_state),
        depth,
        max_branches_to_keep,
    )
    result: dict[str, Any] = {
        "system": SYSTEM_NAME,
        "continuous_evolution_goal": continuous_evolution_goal(current_state),
        "current_state": current_state,
        "hard_blockers": hard_blockers(current_state),
        "operational_blockers": operational_blockers(current_state),
        "public_live_ready": public_live_ready(current_state),
        "company_operational_ready": company_operational_ready(current_state),
        "predicted_futures": [future.to_dict() for future in predicted],
        "recommended_next_actions": recommended_next_actions(predicted),
    }

    if real_event is not None:
        surviving = update_futures_with_real_event(predicted, real_event, current_state)
        result["real_event"] = real_event.to_dict()
        result["surviving_futures"] = [future.to_dict() for future in surviving]
        result["updated_current_state"] = apply_state_delta(current_state, real_event.state_delta)

    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run VAU across Strange Company as a whole-company evolution model."
        " Use --revenue-evidence-index REVENUE_SETUP_EVIDENCE_INDEX.local.json and"
        " --external-live-packet EXTERNAL_LIVE_PACKET.local.json and"
        " --live-review-closure LIVE_REVIEW_CLOSURE.local.json and"
        " --public-live-receipt public-live-receipt.js and"
        " --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json."
    )
    parser.add_argument("--public-config", default=str(DEFAULT_PUBLIC_CONFIG))
    parser.add_argument("--reviewer-tracker", default=str(DEFAULT_REVIEWER_TRACKER))
    parser.add_argument("--revenue-evidence-index", default=str(DEFAULT_REVENUE_EVIDENCE_INDEX))
    parser.add_argument("--external-live-packet", default=str(DEFAULT_EXTERNAL_LIVE_PACKET))
    parser.add_argument("--live-review-closure", default=str(DEFAULT_LIVE_REVIEW_CLOSURE))
    parser.add_argument("--public-live-receipt", default=str(DEFAULT_PUBLIC_LIVE_RECEIPT))
    parser.add_argument("--terms-doc", default=str(DEFAULT_TERMS_DOCUMENT))
    parser.add_argument("--privacy-doc", default=str(DEFAULT_PRIVACY_DOCUMENT))
    parser.add_argument("--public-ama-queue", default=str(DEFAULT_PUBLIC_AMA_QUEUE))
    parser.add_argument("--public-ama-answers", default=str(DEFAULT_PUBLIC_AMA_ANSWERS))
    parser.add_argument("--delivery-review-checklist", default=str(DEFAULT_DELIVERY_REVIEW_CHECKLIST))
    parser.add_argument("--depth", type=int, default=3)
    parser.add_argument("--max-branches-to-keep", type=int, default=8)
    parser.add_argument("--real-event-json")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    current_state = build_current_state(
        Path(args.public_config),
        reviewer_tracker=Path(args.reviewer_tracker),
        revenue_evidence_index=Path(args.revenue_evidence_index),
        external_live_packet=Path(args.external_live_packet),
        live_review_closure=Path(args.live_review_closure),
        public_live_receipt=Path(args.public_live_receipt),
        terms_document=Path(args.terms_doc),
        privacy_document=Path(args.privacy_doc),
        public_ama_queue=Path(args.public_ama_queue),
        public_ama_answers=Path(args.public_ama_answers),
        delivery_review_checklist=Path(args.delivery_review_checklist),
    )
    real_event = CompanyEvent.from_dict(json.loads(args.real_event_json)) if args.real_event_json else None
    result = run_cycle(
        current_state=current_state,
        depth=args.depth,
        max_branches_to_keep=args.max_branches_to_keep,
        real_event=real_event,
    )

    if args.format == "json":
        print(json.dumps(result, indent=2))
        return 0

    print(f"{SYSTEM_NAME}")
    goal = result["continuous_evolution_goal"]
    print("Continuous evolution goal:")
    print(f"- Objective: {goal['objective']}")
    print(f"- Mode: {goal['current_mode']}")
    print(f"- Next loop: {goal['next_loop']}")
    print("- Guardrails:")
    for guardrail in goal["guardrails"]:
        print(f"  - {guardrail}")
    print("")
    print(f"Public live ready: {result['public_live_ready']}")
    print(f"Company operational ready: {result['company_operational_ready']}")
    print("Hard blockers:")
    for blocker in result["hard_blockers"]:
        print(f"- {blocker}")
    print("")
    print("Most useful next actions:")
    for action in result["recommended_next_actions"]:
        marker = "requires real evidence" if action["requires_real_evidence"] else "repo/action"
        print(f"- [{marker}] {action['action']} (score={action['score']})")
    print("")
    print("Top futures:")
    for index, future in enumerate(result["predicted_futures"], start=1):
        line = " -> ".join(event["name"] for event in future["timeline"])
        print(
            f"{index}. branch={future['branch_score']:.6f} "
            f"p={future['probability']:.6f} evo={future['evolution_score']:.2f} :: {line}"
        )

    if real_event is not None:
        print("")
        print("Surviving futures after observed event:")
        for index, future in enumerate(result["surviving_futures"], start=1):
            line = " -> ".join(event["name"] for event in future["timeline"])
            print(
                f"{index}. branch={future['branch_score']:.6f} "
                f"confidence={future['confidence']:.2f} :: {line}"
            )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
