from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FILTER_SRC = (
    ROOT
    / "external"
    / "reactive-research-tools"
    / "projects"
    / "effective_boolean_filter"
    / "src"
)

if not FILTER_SRC.exists():
    raise SystemExit(
        "Effective Boolean Filter source not found. "
        "Clone https://github.com/Arthurcdag/reactive-research-tools into "
        "external/reactive-research-tools."
    )

sys.path.insert(0, str(FILTER_SRC))

from effective_boolean_filter.engine import evaluate_argument  # noqa: E402
from effective_boolean_filter.report import to_human, to_json_dict  # noqa: E402


DEFAULT_CLAIM = "This experiment improves durable growth"
DEFAULT_ARGUMENT = (
    "The pilot works in simulation, therefore it will improve production revenue"
)
DEFAULT_CONTEXT = "Strange Company growth review"


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


def summarize(report: Any) -> dict[str, Any]:
    data = to_json_dict(report)
    return {
        "id": data["id"],
        "recommendation": data["recommendation"],
        "effective_polarity": data["effective_polarity"],
        "effectiveness_score": data["effectiveness_score"],
        "bogusness_score": data["bogusness_score"],
        "confidence": data["confidence"],
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


def main() -> int:
    args = parse_args()
    report = evaluate_argument(
        claim=args.claim,
        argument=args.argument,
        context=args.context,
        task=args.task,
        strictness=args.strictness,
    )

    if args.format == "json":
        print(json.dumps(to_json_dict(report), indent=2))
    elif args.format == "human":
        print(to_human(report))
    else:
        print(json.dumps(summarize(report), indent=2))

    return 0 if report.recommendation in {"accept", "accept_with_caveats"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
