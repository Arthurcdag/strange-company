from __future__ import annotations

import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
EXPORT = ROOT / "tools" / "export_public_ama_answers.js"
TEMPLATE = ROOT / "PUBLIC_AMA_QUEUE.template.json"
ANSWERS_TEMPLATE = ROOT / "PUBLIC_AMA_ANSWERS.template.json"
PUBLIC_ANSWERS_JS = ROOT / "public-ama-answers.js"


def run_exporter(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(EXPORT.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def published_queue_payload() -> dict[str, object]:
    payload = json.loads(TEMPLATE.read_text(encoding="utf-8"))
    payload["mode"] = "local"
    payload["questionRecords"] = [
        {
            "questionId": "AMA-20260612-001",
            "receivedAt": "2026-06-12",
            "topic": "launch-gates",
            "nameAlias": "Public asker 001",
            "contactRef": "support-thread-ama-001",
            "questionSummary": "Asked whether the public AMA can run before paid intake.",
            "publicSafeQuestion": "Can the public AMA run while paid intake is closed?",
            "status": "published",
            "boundaryDecision": "public_safe",
            "evidenceRef": "ama-private-log-001",
            "publicAnswer": "Yes. Public-safe questions can be answered while paid intake remains closed.",
            "answerReviewedAt": "2026-06-12",
            "publishedAt": "2026-06-13",
            "humanScreened": True,
            "humanApprovedForPublication": True,
        }
    ]
    payload["attestation"].update(
        {
            "operator": "Ops",
            "reviewedAt": "2026-06-12",
        }
    )
    return payload


def write_payload(payload: dict[str, object]) -> pathlib.Path:
    tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
    json.dump(payload, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    return pathlib.Path(tmp.name)


class PublicAmaAnswersTests(unittest.TestCase):
    def test_template_and_public_archive_start_empty(self) -> None:
        template = json.loads(ANSWERS_TEMPLATE.read_text(encoding="utf-8"))
        archive_js = PUBLIC_ANSWERS_JS.read_text(encoding="utf-8")

        self.assertEqual(template["schemaVersion"], 1)
        self.assertEqual(template["answers"], [])
        self.assertTrue(template["attestation"]["noPrivateContactData"])
        self.assertIn("window.PUBLIC_AMA_ANSWERS", archive_js)
        self.assertIn('"answers": []', archive_js)

    def test_template_check_passes(self) -> None:
        result = run_exporter("--template-ok")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("template validation passed", result.stdout)

    def test_exporter_writes_only_public_fields(self) -> None:
        queue = write_payload(published_queue_payload())
        output_handle = tempfile.NamedTemporaryFile(suffix=".js", delete=False)
        output_handle.close()
        output = pathlib.Path(output_handle.name)

        result = run_exporter("--input", str(queue), "--output", str(output), "--require-published", "--force")

        self.assertEqual(result.returncode, 0, result.stderr)
        text = output.read_text(encoding="utf-8")
        self.assertIn("window.PUBLIC_AMA_ANSWERS", text)
        self.assertIn("Can the public AMA run while paid intake is closed?", text)
        self.assertIn("Public-safe questions can be answered", text)
        for private_snippet in ("nameAlias", "contactRef", "support-thread-ama-001", "evidenceRef", "ama-private-log-001"):
            with self.subTest(private_snippet=private_snippet):
                self.assertNotIn(private_snippet, text)

    def test_exporter_rejects_private_content_in_public_answer(self) -> None:
        payload = published_queue_payload()
        payload["questionRecords"][0]["publicAnswer"] = "Email person@example.com for the private answer."
        queue = write_payload(payload)

        result = run_exporter("--input", str(queue), "--require-published")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("private-data-like content", result.stderr)


if __name__ == "__main__":
    unittest.main()
