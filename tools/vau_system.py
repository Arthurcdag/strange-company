from __future__ import annotations

import argparse
import copy
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


SYSTEM_NAME = "VAU_SYSTEM"


DEFAULT_CURRENT_STATE: dict[str, Any] = {
    "company": "Strange Company",
    "phase": "pre_launch",
    "liveMode": False,
    "gates": {
        "humanReviewersReady": False,
        "supportInboxVerified": False,
        "googleFormVerified": False,
        "termsReviewed": False,
        "privacyReviewed": False,
        "brazilComplianceReviewed": False,
        "aiHandoffReviewed": False,
    },
    "metrics": {
        "human_reviewers_found": 0,
        "pilot_requests": 0,
        "evidence_gaps": 0,
    },
    "notes": [],
}


@dataclass
class Event:
    name: str
    kind: str
    probability_hint: float = 0.5
    tags: tuple[str, ...] = ()
    state_delta: dict[str, Any] = field(default_factory=dict)
    reason: str = ""

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Event":
        tags = data.get("tags", ())
        if isinstance(tags, str):
            tags = tuple(tag.strip() for tag in tags.split(",") if tag.strip())
        return cls(
            name=str(data["name"]),
            kind=str(data.get("kind", "observed")),
            probability_hint=float(data.get("probability_hint", 0.5)),
            tags=tuple(str(tag) for tag in tags),
            state_delta=dict(data.get("state_delta", {})),
            reason=str(data.get("reason", "")),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "kind": self.kind,
            "probability_hint": round(self.probability_hint, 4),
            "tags": list(self.tags),
            "state_delta": self.state_delta,
            "reason": self.reason,
        }


@dataclass
class Future:
    state: dict[str, Any]
    timeline: list[Event] = field(default_factory=list)
    probability: float = 1.0
    confidence: float = 1.0
    observed_events: int = 0

    @property
    def next_predicted_event(self) -> Event | None:
        if self.observed_events < len(self.timeline):
            return self.timeline[self.observed_events]
        return None

    def clone(self) -> "Future":
        return Future(
            state=copy.deepcopy(self.state),
            timeline=list(self.timeline),
            probability=self.probability,
            confidence=self.confidence,
            observed_events=self.observed_events,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "probability": round(self.probability, 6),
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


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def create_initial_future(current_state: dict[str, Any]) -> list[Future]:
    return [Future(state=copy.deepcopy(current_state), probability=1.0, confidence=1.0)]


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


def apply_state_delta(state: dict[str, Any], delta: dict[str, Any]) -> dict[str, Any]:
    updated = copy.deepcopy(state)

    for path, value in delta.items():
        if isinstance(value, dict) and "op" in value:
            operation = value["op"]
            current_value = get_path(updated, path, value.get("default", 0))

            if operation == "increment":
                set_path(updated, path, current_value + value.get("value", 1))
            elif operation == "max":
                set_path(updated, path, max(current_value, value.get("value", current_value)))
            elif operation == "append_unique":
                items = list(current_value or [])
                new_value = value.get("value")
                if new_value not in items:
                    items.append(new_value)
                set_path(updated, path, items)
            else:
                raise ValueError(f"Unsupported state delta operation: {operation}")
        else:
            set_path(updated, path, value)

    return updated


def update_current_state(current_state: dict[str, Any], real_event: Event) -> dict[str, Any]:
    return apply_state_delta(current_state, real_event.state_delta)


def generate_possible_next_events(future: Future) -> list[Event]:
    state = future.state
    gates = state.get("gates", {})
    metrics = state.get("metrics", {})
    human_reviewers_found = int(metrics.get("human_reviewers_found", 0))
    live_mode = bool(state.get("liveMode", False))

    events: list[Event] = []

    if human_reviewers_found < 4:
        events.extend(
            [
                Event(
                    name="reviewer_outreach_reply",
                    kind="human_review",
                    probability_hint=0.36 + min(human_reviewers_found, 3) * 0.04,
                    tags=("reviewers", "manual_gate", "operations"),
                    state_delta={
                        "metrics.human_reviewers_found": {"op": "increment", "value": 1},
                        "notes": {
                            "op": "append_unique",
                            "value": "At least one reviewer candidate responded.",
                        },
                    },
                    reason="The next practical gate is finding human reviewers.",
                ),
                Event(
                    name="reviewer_pool_completed",
                    kind="human_review",
                    probability_hint=0.12 + min(human_reviewers_found, 3) * 0.08,
                    tags=("reviewers", "manual_gate", "launch_gate"),
                    state_delta={
                        "metrics.human_reviewers_found": 4,
                        "gates.humanReviewersReady": True,
                        "notes": {
                            "op": "append_unique",
                            "value": "Four human reviewers are ready for paid review tasks.",
                        },
                    },
                    reason="The requested 4-person human review layer can be completed.",
                ),
                Event(
                    name="reviewer_search_stalls",
                    kind="human_review",
                    probability_hint=0.22,
                    tags=("reviewers", "delay", "manual_gate"),
                    state_delta={
                        "notes": {
                            "op": "append_unique",
                            "value": "Reviewer search needs clearer scope, rate, or trial task.",
                        },
                    },
                    reason="Manual hiring often slows if scope and rate are unclear.",
                ),
            ]
        )

    if not gates.get("supportInboxVerified", False):
        events.append(
            Event(
                name="support_inbox_verified",
                kind="evidence_gate",
                probability_hint=0.3,
                tags=("support", "evidence", "launch_gate"),
                state_delta={"gates.supportInboxVerified": True},
                reason="Support inbox verification is a small but required live gate.",
            )
        )

    if not gates.get("googleFormVerified", False):
        events.append(
            Event(
                name="google_form_response_tested",
                kind="evidence_gate",
                probability_hint=0.28,
                tags=("google_form", "evidence", "launch_gate"),
                state_delta={"gates.googleFormVerified": True},
                reason="The intake form needs a real response test before live mode.",
            )
        )

    legal_gate_names = (
        "termsReviewed",
        "privacyReviewed",
        "brazilComplianceReviewed",
        "aiHandoffReviewed",
    )
    if not all(gates.get(gate_name, False) for gate_name in legal_gate_names):
        events.append(
            Event(
                name="human_compliance_review_completed",
                kind="compliance_gate",
                probability_hint=0.2,
                tags=("brazil", "lgpd", "manual_gate", "launch_gate"),
                state_delta={f"gates.{gate_name}": True for gate_name in legal_gate_names},
                reason="Brazil/LGPD and AI handoff documents need human review.",
            )
        )

    ready_to_receive_pilot = bool(
        gates.get("humanReviewersReady")
        and gates.get("supportInboxVerified")
        and gates.get("googleFormVerified")
        and all(gates.get(gate_name, False) for gate_name in legal_gate_names)
    )

    if live_mode or ready_to_receive_pilot:
        events.append(
            Event(
                name="first_pilot_request_arrives",
                kind="client_intake",
                probability_hint=0.25 if live_mode else 0.18,
                tags=("client", "pilot", "revenue"),
                state_delta={"metrics.pilot_requests": {"op": "increment", "value": 1}},
                reason="Once gates are ready, a controlled pilot request can arrive.",
            )
        )
    else:
        events.append(
            Event(
                name="launch_blocked_by_missing_evidence",
                kind="evidence_gate",
                probability_hint=0.33,
                tags=("evidence", "launch_gate", "delay"),
                state_delta={"metrics.evidence_gaps": {"op": "increment", "value": 1}},
                reason="Live mode should remain blocked until evidence gates are real.",
            )
        )

    events.append(
        Event(
            name="no_material_change",
            kind="stasis",
            probability_hint=0.1,
            tags=("delay",),
            state_delta={},
            reason="No external event may happen during the next observation window.",
        )
    )

    return events


def score_event_likelihood(event: Event, future: Future) -> float:
    state = future.state
    score = clamp(event.probability_hint)

    if "manual_gate" in event.tags:
        score *= 0.95

    if event.kind == "client_intake" and not state.get("liveMode", False):
        score *= 0.75

    if event.name == "launch_blocked_by_missing_evidence":
        gaps = int(get_path(state, "metrics.evidence_gaps", 0))
        score *= 1.0 + min(gaps, 2) * 0.1

    return clamp(score, 0.01, 0.99)


def simulate_futures(
    futures: list[Future],
    depth: int,
    max_branches_to_keep: int,
) -> list[Future]:
    if depth < 0:
        raise ValueError("simulation depth must be zero or greater")
    if max_branches_to_keep < 1:
        raise ValueError("max branches to keep must be at least one")

    active_futures = list(futures)
    for _step in range(depth):
        new_futures: list[Future] = []

        for future in active_futures:
            possible_events = generate_possible_next_events(future)

            for event in possible_events:
                new_future = future.clone()
                new_future.timeline.append(event)
                new_future.state = apply_state_delta(new_future.state, event.state_delta)
                event_probability = score_event_likelihood(event, future)
                new_future.probability = future.probability * event_probability
                new_futures.append(new_future)

        new_futures.sort(key=lambda item: item.probability, reverse=True)
        active_futures = new_futures[:max_branches_to_keep]

    return active_futures


def tokenize(value: str) -> set[str]:
    return {
        token
        for token in "".join(char.lower() if char.isalnum() else " " for char in value).split()
        if token
    }


def jaccard(left: set[str], right: set[str]) -> float:
    if not left and not right:
        return 1.0
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def compare(real_event: Event, predicted_event: Event | None) -> float:
    if predicted_event is None:
        return 0.0

    name_similarity = jaccard(tokenize(real_event.name), tokenize(predicted_event.name))
    tag_similarity = jaccard(set(real_event.tags), set(predicted_event.tags))
    kind_similarity = 1.0 if real_event.kind == predicted_event.kind else 0.0

    if real_event.name == predicted_event.name:
        name_similarity = 1.0

    return clamp((name_similarity * 0.45) + (tag_similarity * 0.3) + (kind_similarity * 0.25))


def update_futures_with_real_event(
    predicted_futures: list[Future],
    real_event: Event,
) -> list[Future]:
    surviving_futures: list[Future] = []

    for future in predicted_futures:
        similarity = compare(real_event, future.next_predicted_event)

        if similarity >= 0.7:
            corrected = future.clone()
            corrected.confidence = clamp(corrected.confidence + 0.15)
            corrected.probability *= 1.0 + similarity * 0.1
            corrected.observed_events += 1
            surviving_futures.append(corrected)
        elif similarity >= 0.35:
            corrected = future.clone()
            corrected.confidence = clamp(corrected.confidence * 0.7)
            corrected.probability *= 0.55 + similarity * 0.25
            corrected.observed_events += 1
            surviving_futures.append(corrected)

    surviving_futures.sort(key=lambda item: (item.confidence, item.probability), reverse=True)

    if not surviving_futures:
        fallback_state = apply_state_delta(DEFAULT_CURRENT_STATE, real_event.state_delta)
        fallback = Future(
            state=fallback_state,
            timeline=[real_event],
            probability=1.0,
            confidence=0.35,
            observed_events=1,
        )
        return [fallback]

    return surviving_futures


def show_most_likely_futures(predicted_futures: list[Future]) -> str:
    lines = [f"{SYSTEM_NAME} most likely futures:"]
    for index, future in enumerate(predicted_futures, start=1):
        event_names = " -> ".join(event.name for event in future.timeline) or "(no events)"
        lines.append(
            f"{index}. p={future.probability:.4f} "
            f"confidence={future.confidence:.2f} :: {event_names}"
        )
    return "\n".join(lines)


def load_json_argument(raw_json: str | None, json_file: str | None) -> dict[str, Any] | None:
    if raw_json and json_file:
        raise ValueError("Use either inline JSON or a JSON file, not both.")
    if raw_json:
        return json.loads(raw_json)
    if json_file:
        return json.loads(Path(json_file).read_text(encoding="utf-8"))
    return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Simulate and correct Strange Company futures with VAU_SYSTEM."
    )
    parser.add_argument("--current-state-json")
    parser.add_argument("--current-state-file")
    parser.add_argument("--real-event-json")
    parser.add_argument("--real-event-file")
    parser.add_argument("--simulation-depth", type=int, default=2)
    parser.add_argument("--max-branches-to-keep", type=int, default=5)
    parser.add_argument("--format", choices=("text", "json"), default="text")
    return parser.parse_args()


def run_cycle(
    current_state: dict[str, Any],
    simulation_depth: int,
    max_branches_to_keep: int,
    real_event: Event | None = None,
) -> dict[str, Any]:
    futures = create_initial_future(current_state)
    predicted_futures = simulate_futures(
        futures=futures,
        depth=simulation_depth,
        max_branches_to_keep=max_branches_to_keep,
    )

    result: dict[str, Any] = {
        "system": SYSTEM_NAME,
        "current_state": current_state,
        "predicted_futures": [future.to_dict() for future in predicted_futures],
    }

    if real_event is not None:
        corrected_futures = update_futures_with_real_event(predicted_futures, real_event)
        updated_state = update_current_state(current_state, real_event)
        result["real_event"] = real_event.to_dict()
        result["updated_current_state"] = updated_state
        result["surviving_futures"] = [future.to_dict() for future in corrected_futures]

    return result


def main() -> int:
    args = parse_args()
    state_data = load_json_argument(args.current_state_json, args.current_state_file)
    current_state = state_data if state_data is not None else copy.deepcopy(DEFAULT_CURRENT_STATE)

    event_data = load_json_argument(args.real_event_json, args.real_event_file)
    real_event = Event.from_dict(event_data) if event_data is not None else None

    result = run_cycle(
        current_state=current_state,
        simulation_depth=args.simulation_depth,
        max_branches_to_keep=args.max_branches_to_keep,
        real_event=real_event,
    )

    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        futures = [
            Future(
                state=item["state"],
                timeline=[Event.from_dict(event) for event in item["timeline"]],
                probability=item["probability"],
                confidence=item["confidence"],
                observed_events=item["observed_events"],
            )
            for item in result["predicted_futures"]
        ]
        print(show_most_likely_futures(futures))
        if real_event is not None:
            print()
            print("Reality observed:")
            print(json.dumps(real_event.to_dict(), indent=2))
            print()
            print("Surviving futures:")
            print(json.dumps(result["surviving_futures"], indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
