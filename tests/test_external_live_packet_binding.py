from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import textwrap
import unittest
from datetime import datetime, timedelta, timezone

from tests.test_evolution_goal_status import valid_external_live_payload


ROOT = pathlib.Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "tools" / "validate_external_live_packet.js"


def write_json(payload: dict[str, object]) -> pathlib.Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, temp, indent=2)
    temp.close()
    return pathlib.Path(temp.name)


def write_public_config(
    *,
    support_email: str = "support@example.com",
    live_mode: str = "false",
    terms_reviewed_at: str = "2026-07-13",
) -> pathlib.Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".js", delete=False)
    temp.write(
        textwrap.dedent(
            f"""
            window.PUBLIC_ORDER_CONFIG = {{
              operatorName: "Strange Works Studio",
              jurisdiction: "BR",
              aiGeneratedLegalDocsRequireHumanReview: true,
              supportEmail: "{support_email}",
              googleFormUrl: "https://docs.google.com/forms/d/e/example/viewform",
              supportInboxVerified: true,
              googleFormVerified: true,
              termsReviewedAt: "{terms_reviewed_at}",
              privacyReviewedAt: "2026-07-13",
              brazilComplianceReviewedAt: "2026-07-13",
              aiHandoffReviewedAt: "2026-07-13",
              liveMode: {live_mode},
            }};
            """
        )
    )
    temp.close()
    return pathlib.Path(temp.name)


def run_validator(packet: pathlib.Path, config: pathlib.Path | None) -> subprocess.CompletedProcess[str]:
    args = [
        "node",
        str(VALIDATOR.relative_to(ROOT)),
        str(packet),
        "--require-live",
    ]
    if config is not None:
        args.extend(["--public-config", str(config)])
    return subprocess.run(
        args,
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


class ExternalLivePacketBindingTests(unittest.TestCase):
    def test_live_packet_must_match_current_public_config(self) -> None:
        packet = write_json(valid_external_live_payload())

        matching = run_validator(packet, write_public_config())
        stale = run_validator(packet, write_public_config(support_email="changed@example.com"))

        self.assertEqual(matching.returncode, 0, matching.stderr)
        self.assertNotEqual(stale.returncode, 0)
        self.assertIn(
            "publicConfig.supportEmail must match the current public-config.js value",
            stale.stderr,
        )

    def test_two_phase_live_mode_difference_is_allowed(self) -> None:
        packet = write_json(valid_external_live_payload())

        for live_mode in ("false", "true"):
            with self.subTest(live_mode=live_mode):
                result = run_validator(packet, write_public_config(live_mode=live_mode))
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_require_live_rejects_non_local_mode(self) -> None:
        payload = valid_external_live_payload()
        payload["mode"] = "simulation"

        result = run_validator(write_json(payload), write_public_config())

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("packet mode must be local", result.stderr)

    def test_require_live_requires_external_form_collection_to_stay_closed_pre_launch(self) -> None:
        payload = valid_external_live_payload()
        payload["google"]["acceptingResponses"] = True

        result = run_validator(write_json(payload), write_public_config())

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Google Form pre-live response collection must be false", result.stderr)

    def test_require_live_fails_closed_without_public_config(self) -> None:
        result = run_validator(write_json(valid_external_live_payload()), None)

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("requires --public-config", result.stderr)

    def test_require_live_rejects_malformed_and_future_test_timestamps(self) -> None:
        cases = (
            ("support", "testReceivedAt", "not-a-timestamp", "must be an ISO-8601 UTC timestamp"),
            (
                "google",
                "testResponseTimestamp",
                (datetime.now(timezone.utc) + timedelta(hours=1))
                .replace(microsecond=0)
                .isoformat()
                .replace("+00:00", "Z"),
                "must not be in the future",
            ),
        )
        for section, field, value, expected in cases:
            with self.subTest(field=f"{section}.{field}"):
                payload = valid_external_live_payload()
                payload[section][field] = value
                result = run_validator(write_json(payload), write_public_config())

                self.assertNotEqual(result.returncode, 0)
                self.assertIn(expected, result.stderr)

    def test_require_live_rejects_stale_tests_and_reply_before_receipt(self) -> None:
        stale = valid_external_live_payload()
        stale["google"]["testResponseTimestamp"] = (
            (datetime.now(timezone.utc) - timedelta(days=31))
            .replace(microsecond=0)
            .isoformat()
            .replace("+00:00", "Z")
        )
        stale_result = run_validator(write_json(stale), write_public_config())

        reversed_support = valid_external_live_payload()
        reversed_support["support"]["testReceivedAt"] = (
            (datetime.now(timezone.utc) - timedelta(minutes=5))
            .replace(microsecond=0)
            .isoformat()
            .replace("+00:00", "Z")
        )
        reversed_support["support"]["testRepliedAt"] = (
            (datetime.now(timezone.utc) - timedelta(minutes=10))
            .replace(microsecond=0)
            .isoformat()
            .replace("+00:00", "Z")
        )
        reversed_result = run_validator(
            write_json(reversed_support), write_public_config()
        )

        self.assertNotEqual(stale_result.returncode, 0)
        self.assertIn("must be no more than 30 days old", stale_result.stderr)
        self.assertNotEqual(reversed_result.returncode, 0)
        self.assertIn(
            "support.testRepliedAt must be at or after support.testReceivedAt",
            reversed_result.stderr,
        )

    def test_require_live_rejects_future_review_dates(self) -> None:
        payload = valid_external_live_payload()
        payload["legalReview"]["termsReviewedAt"] = "2099-01-01"
        payload["publicConfig"]["termsReviewedAt"] = "2099-01-01"

        result = run_validator(
            write_json(payload),
            write_public_config(terms_reviewed_at="2099-01-01"),
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn(
            "legalReview.termsReviewedAt must not be in the future",
            result.stderr,
        )
        self.assertIn(
            "publicConfig.termsReviewedAt must not be in the future",
            result.stderr,
        )


if __name__ == "__main__":
    unittest.main()
