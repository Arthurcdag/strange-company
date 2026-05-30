from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable


ROOT = Path(__file__).resolve().parents[1]
FILTER_SRC = (
    ROOT
    / "external"
    / "reactive-research-tools"
    / "projects"
    / "effective_boolean_filter"
    / "src"
)

DEFAULT_CLAIM = "This experiment improves durable growth"
DEFAULT_ARGUMENT = (
    "The pilot works in simulation, therefore it will improve production revenue"
)
DEFAULT_CONTEXT = "Strange Company growth review"


@dataclass(frozen=True)
class StrangeGuardrailIssue:
    code: str
    severity: str
    message: str
    evidence: str


def _contains_negated_phrase(text: str, phrase: str) -> bool:
    phrase_pattern = re.escape(phrase).replace(r"\ ", r"\s+")
    return bool(
        re.search(
            rf"\b(?:do\s+not|don't|should\s+not|must\s+not|cannot|can't|never)\s+"
            rf"(?:fully\s+|entirely\s+)?{phrase_pattern}\b",
            text,
            re.I,
        )
    )


def _first_match(text: str, patterns: list[re.Pattern[str]]) -> str | None:
    for pattern in patterns:
        match = pattern.search(text)
        if match:
            return match.group(0)
    return None


HUMAN_REVIEW_REPLACEMENT_PATTERNS = [
    re.compile(
        r"\b(?:ai|vau|reactive|automation|the\s+system)\s+"
        r"(?:can|should|will|must)\s+replace\s+(?:all\s+)?(?:human\s+)?review(?:ers)?\b",
        re.I,
    ),
    re.compile(
        r"\b(?:replace|remove|skip|eliminate|avoid|bypass)\s+"
        r"(?:all\s+)?(?:human\s+)?review(?:ers)?\b",
        re.I,
    ),
    re.compile(
        r"\b(?:human\s+)?review(?:ers)?\s+"
        r"(?:are|is)\s+(?:unnecessary|optional|obsolete|not\s+needed)\b",
        re.I,
    ),
    re.compile(r"\bdeliver\b.*\bwithout\s+human\s+review\b", re.I),
    re.compile(r"\bai-only\b.*\b(?:delivery|deliver|review|approval)\b", re.I),
]

COMPLIANCE_SKIP_PATTERNS = [
    re.compile(
        r"\b(?:skip|ignore|bypass|avoid|remove)\b.*"
        r"\b(?:lgpd|brazil(?:ian)?\s+compliance|compliance|privacy|terms|tax|cnpj|nfs-e|legal)\b",
        re.I,
    ),
    re.compile(
        r"\b(?:no\s+need|unnecessary|optional)\b.*"
        r"\b(?:lgpd|brazil(?:ian)?\s+compliance|privacy|terms|tax|cnpj|nfs-e|legal)\b",
        re.I,
    ),
]

LIVE_WITHOUT_EVIDENCE_PATTERNS = [
    re.compile(
        r"\b(?:open|enable|turn\s+on|set)\s+(?:liveMode|live\s+mode)\b.*"
        r"\b(?:without|before|skip|ignore|no\s+need)\b.*"
        r"\b(?:evidence|verified|verification|gate|review|terms|privacy|compliance|support|form)\b",
        re.I,
    ),
    re.compile(
        r"\b(?:go\s+live|start\s+operations|accept\s+clients?|open\s+intake)\b.*"
        r"\b(?:without|before|skip|ignore|no\s+need)\b.*"
        r"\b(?:evidence|verified|verification|gate|review|terms|privacy|compliance|support|form)\b",
        re.I,
    ),
]

SIMULATION_PROOF_PATTERNS = [
    re.compile(
        r"\b(?:simulation|simulate|simulated|vau)\b.*"
        r"\b(?:proves?|guarantees?|certifies?|therefore)\b.*"
        r"\b(?:production|live|client|real[-\s]?world|revenue|safe)\b",
        re.I,
    ),
    re.compile(
        r"\b(?:production|live|client|real[-\s]?world|revenue|safe)\b.*"
        r"\b(?:proves?|guarantees?|certifies?)\b.*"
        r"\b(?:simulation|simulate|simulated|vau)\b",
        re.I,
    ),
]

FAKE_EVIDENCE_PATTERNS = [
    re.compile(
        r"\b(?:fake|invent|fabricate|backdate)\b.*"
        r"\b(?:evidence|verification|review\s+date|approval|invoice|receipt|test\s+response)\b",
        re.I,
    ),
]

VAGUE_REPO_CRITIQUE_PATTERNS = [
    re.compile(r"\b(?:ai\s+)?slop\b", re.I),
    re.compile(r"\b(?:trash|garbage|nonsense|word\s+salad)\b", re.I),
]

ACTIONABLE_CRITIQUE_MARKERS = [
    re.compile(r"\b[A-Z0-9_./-]+\.(?:md|js|py|html|json|yml|yaml)\b", re.I),
    re.compile(r"\b(?:line|section|file|readme|dashboard|install|test|function|public\s+offer|business\s+model|vau)\b", re.I),
    re.compile(r"\b(?:delete|rewrite|split|reduce|replace|fix|broken|unclear|missing|fails?)\b", re.I),
]

REPO_SIGNAL_NOISE_PATTERNS = [
    re.compile(r"\btoo\s+many\s+docs?\b", re.I),
    re.compile(r"\b(?:no|not\s+enough)\s+(?:runnable|product|code|tests?)\b", re.I),
    re.compile(r"\b(?:install|setup|test(?:ing)?|dashboard)\s+(?:is\s+)?(?:unclear|broken|missing|confusing)\b", re.I),
    re.compile(r"\b(?:business\s+model|public\s+offer|value\s+proposition)\s+(?:is\s+)?(?:unclear|missing|confusing)\b", re.I),
    re.compile(r"\b(?:ai\s+filler|ai-written|inflated\s+language|vague\s+language)\b", re.I),
    re.compile(r"\bvau\b.*\b(?:claims?\s+too\s+much|fake\s+proof|proof\s+engine|overclaim)\b", re.I),
]


def _has_actionable_critique_detail(text: str) -> bool:
    return any(pattern.search(text) for pattern in ACTIONABLE_CRITIQUE_MARKERS)


def detect_strange_guardrails(
    claim: str,
    argument: str,
    context: str = "",
    task: str = "",
) -> list[StrangeGuardrailIssue]:
    text = "\n".join([claim, argument, context, task])
    lowered = text.lower()
    issues: list[StrangeGuardrailIssue] = []

    human_match = _first_match(text, HUMAN_REVIEW_REPLACEMENT_PATTERNS)
    if human_match and not any(
        _contains_negated_phrase(lowered, phrase)
        for phrase in ("replace human review", "replace human reviewers", "skip human review")
    ):
        issues.append(
            StrangeGuardrailIssue(
                code="hard_human_review_required",
                severity="error",
                message=(
                    "Strange Company cannot treat AI, VAU, or reactive tools as a "
                    "replacement for human review."
                ),
                evidence=human_match,
            )
        )

    compliance_match = _first_match(text, COMPLIANCE_SKIP_PATTERNS)
    if compliance_match:
        issues.append(
            StrangeGuardrailIssue(
                code="hard_brazil_compliance_required",
                severity="error",
                message=(
                    "Brazil/LGPD, privacy, terms, fiscal, and legal checks cannot be "
                    "skipped by argument score."
                ),
                evidence=compliance_match,
            )
        )

    live_match = _first_match(text, LIVE_WITHOUT_EVIDENCE_PATTERNS)
    if live_match:
        issues.append(
            StrangeGuardrailIssue(
                code="hard_live_evidence_required",
                severity="error",
                message=(
                    "liveMode and client intake require real evidence gates, not a "
                    "reactive or VAU acceptance alone."
                ),
                evidence=live_match,
            )
        )

    simulation_match = _first_match(text, SIMULATION_PROOF_PATTERNS)
    has_bridge = bool(
        re.search(
            r"\b(?:validated|verified|confirmed|tested)\s+(?:against|in)\s+"
            r"(?:production|real[-\s]?world|live)\b",
            text,
            re.I,
        )
    )
    if simulation_match and not has_bridge:
        issues.append(
            StrangeGuardrailIssue(
                code="hard_simulation_is_not_proof",
                severity="error",
                message=(
                    "Simulation can guide decisions, but it cannot prove production, "
                    "client, revenue, or safety outcomes without external validation."
                ),
                evidence=simulation_match,
            )
        )

    fake_match = _first_match(text, FAKE_EVIDENCE_PATTERNS)
    if fake_match:
        issues.append(
            StrangeGuardrailIssue(
                code="hard_no_fake_evidence",
                severity="error",
                message="Operational evidence must be real; it cannot be invented or backdated.",
                evidence=fake_match,
            )
        )

    vague_match = _first_match(text, VAGUE_REPO_CRITIQUE_PATTERNS)
    if vague_match and not _has_actionable_critique_detail(text):
        issues.append(
            StrangeGuardrailIssue(
                code="critique_requires_specifics",
                severity="warning",
                message=(
                    "A vague repo verdict such as 'slop' is not actionable by itself. "
                    "Ask for 3-5 exact files, sections, or failing workflows to delete, "
                    "rewrite, or turn into runnable value."
                ),
                evidence=vague_match,
            )
        )

    signal_noise_match = _first_match(text, REPO_SIGNAL_NOISE_PATTERNS)
    if signal_noise_match:
        issues.append(
            StrangeGuardrailIssue(
                code="repo_signal_to_noise_review",
                severity="warning",
                message=(
                    "Treat this as a repo signal-to-noise review: separate runnable "
                    "dashboard/functions, install/test path, public offer, business "
                    "model, and VAU claim boundaries before defending the repo."
                ),
                evidence=signal_noise_match,
            )
        )

    return issues


def fallback_evaluate_argument(
    claim: str,
    argument: str,
    context: str = "",
    task: str = "",
    strictness: str = "high",
) -> dict[str, Any]:
    text = "\n".join([claim, argument, context, task])
    caveat_patterns = [
        r"\btoo\s+many\s+docs?\b",
        r"\bunclear|missing|confusing|broken\b",
        r"\bslop|trash|garbage|nonsense|word\s+salad\b",
        r"\bvau\b.*\bproof\b",
    ]
    has_caveat = any(re.search(pattern, text, re.I) for pattern in caveat_patterns)
    return {
        "id": "local-strange-fallback",
        "recommendation": "accept_with_caveats" if has_caveat else "accept",
        "effective_polarity": "effective_yes" if not has_caveat else "needs_review",
        "effectiveness_score": 0.55 if has_caveat else 0.7,
        "bogusness_score": 0.35 if has_caveat else 0.2,
        "confidence": 0.55,
        "issues": [
            {
                "code": "local_fallback_review",
                "severity": "warning",
                "message": (
                    "External reactive tools are not installed; this is the local "
                    "Strange Company fallback plus hard guardrails."
                ),
            }
        ],
        "probes": [
            {
                "type": "local_guardrail",
                "question": "Does the claim violate the Strange Company hard rules?",
                "purpose": f"fallback check with strictness={strictness}",
            }
        ],
    }


def fallback_to_human(report: Any) -> str:
    data = report if isinstance(report, dict) else {}
    return "\n".join(
        [
            "Local Strange Company fallback report",
            f"Recommendation: {data.get('recommendation', 'unknown')}",
            f"Effective polarity: {data.get('effective_polarity', 'unknown')}",
            "External reactive tools were not loaded; local hard guardrails still apply.",
        ]
    )


def fallback_to_json_dict(report: Any) -> dict[str, Any]:
    if isinstance(report, dict):
        return report
    return fallback_evaluate_argument("", "")


def load_reactive_tools() -> tuple[Callable[..., Any], Callable[[Any], str], Callable[[Any], dict[str, Any]]]:
    if not FILTER_SRC.exists():
        return fallback_evaluate_argument, fallback_to_human, fallback_to_json_dict

    if str(FILTER_SRC) not in sys.path:
        sys.path.insert(0, str(FILTER_SRC))

    try:
        from effective_boolean_filter.engine import evaluate_argument  # noqa: PLC0415
        from effective_boolean_filter.report import to_human, to_json_dict  # noqa: PLC0415
    except ModuleNotFoundError:
        return fallback_evaluate_argument, fallback_to_human, fallback_to_json_dict

    return evaluate_argument, to_human, to_json_dict


def apply_strange_guardrails(
    report_data: dict[str, Any],
    guardrails: list[StrangeGuardrailIssue],
) -> dict[str, Any]:
    guarded = copy.deepcopy(report_data)
    guarded["reactive_recommendation"] = report_data["recommendation"]
    guarded["strange_guardrails"] = [asdict(issue) for issue in guardrails]

    blocking = [issue for issue in guardrails if issue.severity == "error"]
    if blocking:
        guarded["recommendation"] = "reject"
        guarded["effectiveness_score"] = min(float(guarded["effectiveness_score"]), 0.25)
        guarded["bogusness_score"] = max(float(guarded["bogusness_score"]), 0.75)
        guarded["confidence"] = max(float(guarded["confidence"]), 0.9)
        return guarded

    if guardrails and guarded["recommendation"] == "accept":
        guarded["recommendation"] = "accept_with_caveats"

    return guarded


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run Strange Company decisions through the Effective Boolean Argument Filter."
    )
    parser.add_argument("--claim", default=DEFAULT_CLAIM)
    parser.add_argument("--argument", default=DEFAULT_ARGUMENT)
    parser.add_argument("--context", default=DEFAULT_CONTEXT)
    parser.add_argument("--task", default="Strange Company decision gate")
    parser.add_argument(
        "--strictness",
        choices=("low", "medium", "high"),
        default="high",
    )
    parser.add_argument(
        "--format",
        choices=("summary", "json", "human"),
        default="summary",
    )
    return parser.parse_args()


def summarize(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": data["id"],
        "recommendation": data["recommendation"],
        "reactive_recommendation": data.get("reactive_recommendation", data["recommendation"]),
        "effective_polarity": data["effective_polarity"],
        "effectiveness_score": data["effectiveness_score"],
        "bogusness_score": data["bogusness_score"],
        "confidence": data["confidence"],
        "strange_guardrails": data.get("strange_guardrails", []),
        "issues": [
            {
                "code": issue["code"],
                "severity": issue["severity"],
                "message": issue["message"],
            }
            for issue in data["issues"]
        ],
        "probes": [
            {
                "type": probe["type"],
                "question": probe["question"],
                "purpose": probe["purpose"],
            }
            for probe in data["probes"][:5]
        ],
    }


def evaluate_strange_decision(
    claim: str,
    argument: str,
    context: str = DEFAULT_CONTEXT,
    task: str = "Strange Company decision gate",
    strictness: str = "high",
) -> tuple[Any, dict[str, Any]]:
    evaluate_argument, _to_human, to_json_dict = load_reactive_tools()
    report = evaluate_argument(
        claim=claim,
        argument=argument,
        context=context,
        task=task,
        strictness=strictness,
    )
    data = to_json_dict(report)
    guardrails = detect_strange_guardrails(claim, argument, context, task)
    return report, apply_strange_guardrails(data, guardrails)


def main() -> int:
    args = parse_args()
    report, guarded_data = evaluate_strange_decision(
        claim=args.claim,
        argument=args.argument,
        context=args.context,
        task=args.task,
        strictness=args.strictness,
    )

    if args.format == "json":
        print(json.dumps(guarded_data, indent=2))
    elif args.format == "human":
        _evaluate_argument, to_human, _to_json_dict = load_reactive_tools()
        print(to_human(report))
        if guarded_data.get("strange_guardrails"):
            print("")
            print("Strange Company guardrails:")
            for issue in guarded_data["strange_guardrails"]:
                print(f"  - [{issue['severity']}] {issue['code']}: {issue['message']}")
                print(f"    evidence: {issue['evidence']}")
        print("")
        print(f"Final recommendation: {guarded_data['recommendation']}")
    else:
        print(json.dumps(summarize(guarded_data), indent=2))

    return 0 if guarded_data["recommendation"] in {"accept", "accept_with_caveats"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
