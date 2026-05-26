from __future__ import annotations

import argparse
import copy
import json
from dataclasses import dataclass, field
from typing import Any, Callable


SYSTEM_NAME = "VAU_LAB"


@dataclass(frozen=True)
class LabEvent:
    name: str
    kind: str
    probability_hint: float
    tags: tuple[str, ...] = ()
    state_delta: dict[str, Any] = field(default_factory=dict)
    reason: str = ""

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
class LabFuture:
    state: dict[str, Any]
    timeline: list[LabEvent] = field(default_factory=list)
    probability: float = 1.0
    confidence: float = 1.0
    observed_events: int = 0

    @property
    def next_predicted_event(self) -> LabEvent | None:
        if self.observed_events < len(self.timeline):
            return self.timeline[self.observed_events]
        return None

    def clone(self) -> "LabFuture":
        return LabFuture(
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


@dataclass(frozen=True)
class Scenario:
    name: str
    description: str
    initial_state: dict[str, Any]
    generator: Callable[[LabFuture], list[LabEvent]]


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
        child = current.get(part)
        if not isinstance(child, dict):
            child = {}
            current[part] = child
        current = child
    current[parts[-1]] = value


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
            elif operation == "min":
                set_path(updated, path, min(current, amount))
            elif operation == "max":
                set_path(updated, path, max(current, amount))
            elif operation == "append_unique":
                items = list(current or [])
                if amount not in items:
                    items.append(amount)
                set_path(updated, path, items)
            else:
                raise ValueError(f"Unsupported operation: {operation}")
        else:
            set_path(updated, path, value)
    return updated


def score_event(event: LabEvent, future: LabFuture) -> float:
    state = future.state
    score = event.probability_hint

    if event.kind == "revenue" and get_path(state, "metrics.pipeline", 0) > 0:
        score *= 1.2
    if event.kind == "risk" and get_path(state, "metrics.open_risks", 0) > 0:
        score *= 1.15
    if "blocked" in event.tags and get_path(state, "metrics.blockers", 0) > 0:
        score *= 1.25
    if "repeatable" in event.tags:
        score *= 1.05

    return clamp(score)


def simulate_scenario(
    scenario: Scenario,
    depth: int,
    max_branches_to_keep: int,
    current_state: dict[str, Any] | None = None,
) -> list[LabFuture]:
    if depth < 0:
        raise ValueError("depth must be zero or greater")
    if max_branches_to_keep < 1:
        raise ValueError("max branches must be at least one")

    futures = [
        LabFuture(
            state=copy.deepcopy(
                current_state if current_state is not None else scenario.initial_state
            )
        )
    ]

    for _ in range(depth):
        new_futures: list[LabFuture] = []
        for future in futures:
            for event in scenario.generator(future):
                new_future = future.clone()
                new_future.timeline.append(event)
                new_future.state = apply_state_delta(new_future.state, event.state_delta)
                new_future.probability *= score_event(event, future)
                new_futures.append(new_future)
        new_futures.sort(key=lambda item: item.probability, reverse=True)
        futures = new_futures[:max_branches_to_keep]

    return futures


def tokenize(text: str) -> set[str]:
    return {
        token
        for token in "".join(char.lower() if char.isalnum() else " " for char in text).split()
        if token
    }


def compare_events(real_event: LabEvent, predicted_event: LabEvent | None) -> float:
    if predicted_event is None:
        return 0.0
    if real_event.name == predicted_event.name:
        return 1.0

    real_tokens = tokenize(real_event.name)
    predicted_tokens = tokenize(predicted_event.name)
    token_similarity = (
        len(real_tokens & predicted_tokens) / len(real_tokens | predicted_tokens)
        if real_tokens or predicted_tokens
        else 0.0
    )
    tag_similarity = (
        len(set(real_event.tags) & set(predicted_event.tags))
        / len(set(real_event.tags) | set(predicted_event.tags))
        if real_event.tags or predicted_event.tags
        else 0.0
    )
    kind_similarity = 1.0 if real_event.kind == predicted_event.kind else 0.0
    return clamp(token_similarity * 0.45 + tag_similarity * 0.3 + kind_similarity * 0.25, 0, 1)


def update_futures_with_observed_event(
    predicted_futures: list[LabFuture],
    observed_event: LabEvent,
    fallback_state: dict[str, Any],
) -> list[LabFuture]:
    surviving: list[LabFuture] = []
    for future in predicted_futures:
        similarity = compare_events(observed_event, future.next_predicted_event)
        if similarity >= 0.7:
            corrected = future.clone()
            corrected.confidence = min(1.0, corrected.confidence + 0.15)
            corrected.probability *= 1.0 + similarity * 0.1
            corrected.observed_events += 1
            surviving.append(corrected)
        elif similarity >= 0.35:
            corrected = future.clone()
            corrected.confidence *= 0.7
            corrected.probability *= 0.55 + similarity * 0.25
            corrected.observed_events += 1
            surviving.append(corrected)

    if not surviving:
        return [
            LabFuture(
                state=apply_state_delta(fallback_state, observed_event.state_delta),
                timeline=[observed_event],
                probability=1.0,
                confidence=0.35,
                observed_events=1,
            )
        ]

    surviving.sort(key=lambda item: (item.confidence, item.probability), reverse=True)
    return surviving


def cash_runway_events(future: LabFuture) -> list[LabEvent]:
    cash_months = float(get_path(future.state, "metrics.cash_months", 1.5))
    return [
        LabEvent(
            "invoice_paid",
            "revenue",
            0.28 if cash_months < 2 else 0.22,
            ("cash", "client", "repeatable"),
            {"metrics.cash_months": {"op": "increment", "value": 0.8}},
            "A pending invoice lands and extends runway.",
        ),
        LabEvent(
            "pilot_lead_closes",
            "revenue",
            0.2,
            ("client", "pipeline"),
            {"metrics.pipeline": {"op": "increment", "value": 1}},
            "A lead becomes a small paid pilot.",
        ),
        LabEvent(
            "expense_cut_found",
            "operations",
            0.24,
            ("cash", "repeatable"),
            {"metrics.cash_months": {"op": "increment", "value": 0.4}},
            "A non-critical cost is removed.",
        ),
        LabEvent(
            "unexpected_cost_hits",
            "risk",
            0.14,
            ("cash", "blocked"),
            {"metrics.cash_months": {"op": "decrement", "value": 0.6}},
            "An external cost reduces runway.",
        ),
        LabEvent("no_cash_change", "stasis", 0.14, ("delay",), {}, "No material cash event."),
    ]


def support_queue_events(future: LabFuture) -> list[LabEvent]:
    tickets = int(get_path(future.state, "metrics.open_tickets", 6))
    return [
        LabEvent(
            "ticket_resolved",
            "operations",
            0.32 if tickets > 0 else 0.05,
            ("support", "repeatable"),
            {"metrics.open_tickets": {"op": "decrement", "value": 1}},
            "A normal support ticket is resolved.",
        ),
        LabEvent(
            "urgent_ticket_arrives",
            "risk",
            0.18,
            ("support", "blocked"),
            {"metrics.open_tickets": {"op": "increment", "value": 2}},
            "A higher-priority customer issue arrives.",
        ),
        LabEvent(
            "triage_template_improves_flow",
            "operations",
            0.22,
            ("support", "repeatable"),
            {"metrics.open_tickets": {"op": "decrement", "value": 2}},
            "A reusable answer or checklist clears multiple tickets.",
        ),
        LabEvent(
            "handoff_delay",
            "risk",
            0.16,
            ("support", "blocked"),
            {"metrics.blockers": {"op": "increment", "value": 1}},
            "The queue waits on a human handoff.",
        ),
        LabEvent("queue_static", "stasis", 0.12, ("delay",), {}, "No queue movement."),
    ]


def security_incident_events(future: LabFuture) -> list[LabEvent]:
    contained = bool(get_path(future.state, "flags.contained", False))
    return [
        LabEvent(
            "containment_succeeds",
            "security",
            0.3 if not contained else 0.08,
            ("incident", "containment"),
            {"flags.contained": True, "metrics.open_risks": {"op": "decrement", "value": 1}},
            "Access is contained before impact spreads.",
        ),
        LabEvent(
            "false_positive_confirmed",
            "security",
            0.18,
            ("incident", "evidence"),
            {"flags.contained": True},
            "Evidence shows the alert was harmless.",
        ),
        LabEvent(
            "scope_expands",
            "risk",
            0.2 if not contained else 0.08,
            ("incident", "blocked"),
            {"metrics.open_risks": {"op": "increment", "value": 1}},
            "More affected assets are discovered.",
        ),
        LabEvent(
            "audit_log_clarifies_path",
            "security",
            0.22,
            ("incident", "evidence", "repeatable"),
            {"flags.evidence_ready": True},
            "Logs show the likely source and next containment step.",
        ),
        LabEvent("no_new_signal", "stasis", 0.1, ("delay",), {}, "No useful new signal appears."),
    ]


SCENARIOS: dict[str, Scenario] = {
    "cash_runway": Scenario(
        "cash_runway",
        "Runway survival under uncertain cash, leads, and costs.",
        {
            "domain": "cash_runway",
            "metrics": {"cash_months": 1.5, "pipeline": 1, "blockers": 0, "open_risks": 1},
            "flags": {},
        },
        cash_runway_events,
    ),
    "support_queue": Scenario(
        "support_queue",
        "Support queue pressure and human handoff risk.",
        {
            "domain": "support_queue",
            "metrics": {"open_tickets": 6, "blockers": 0, "open_risks": 1},
            "flags": {},
        },
        support_queue_events,
    ),
    "security_incident": Scenario(
        "security_incident",
        "Defensive incident triage with containment and scope uncertainty.",
        {
            "domain": "security_incident",
            "metrics": {"open_risks": 1, "blockers": 0},
            "flags": {"contained": False, "evidence_ready": False},
        },
        security_incident_events,
    ),
}


def event_from_dict(data: dict[str, Any]) -> LabEvent:
    tags = data.get("tags", ())
    return LabEvent(
        name=str(data["name"]),
        kind=str(data.get("kind", "observed")),
        probability_hint=float(data.get("probability_hint", 0.5)),
        tags=tuple(tags if isinstance(tags, list) else ()),
        state_delta=dict(data.get("state_delta", {})),
        reason=str(data.get("reason", "")),
    )


def run_scenario(
    scenario_name: str,
    depth: int,
    max_branches_to_keep: int,
    observed_event: LabEvent | None = None,
) -> dict[str, Any]:
    scenario = SCENARIOS[scenario_name]
    predicted = simulate_scenario(scenario, depth, max_branches_to_keep)
    result: dict[str, Any] = {
        "system": SYSTEM_NAME,
        "scenario": scenario.name,
        "description": scenario.description,
        "predicted_futures": [future.to_dict() for future in predicted],
    }
    if observed_event is not None:
        result["observed_event"] = observed_event.to_dict()
        result["surviving_futures"] = [
            future.to_dict()
            for future in update_futures_with_observed_event(
                predicted, observed_event, scenario.initial_state
            )
        ]
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run VAU against generic scenario labs.")
    parser.add_argument("--scenario", choices=sorted(SCENARIOS), default="cash_runway")
    parser.add_argument("--depth", type=int, default=3)
    parser.add_argument("--max-branches-to-keep", type=int, default=5)
    parser.add_argument("--observed-event-json")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    observed = (
        event_from_dict(json.loads(args.observed_event_json))
        if args.observed_event_json
        else None
    )
    result = run_scenario(
        args.scenario,
        depth=args.depth,
        max_branches_to_keep=args.max_branches_to_keep,
        observed_event=observed,
    )

    if args.format == "json":
        print(json.dumps(result, indent=2))
        return 0

    print(f"{SYSTEM_NAME} scenario: {result['scenario']}")
    print(result["description"])
    for index, future in enumerate(result["predicted_futures"], start=1):
        line = " -> ".join(event["name"] for event in future["timeline"])
        print(
            f"{index}. p={future['probability']:.6f} "
            f"confidence={future['confidence']:.2f} :: {line}"
        )
    if observed is not None:
        print("")
        print("Surviving futures after observed event:")
        for index, future in enumerate(result["surviving_futures"], start=1):
            line = " -> ".join(event["name"] for event in future["timeline"])
            print(
                f"{index}. p={future['probability']:.6f} "
                f"confidence={future['confidence']:.2f} :: {line}"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
