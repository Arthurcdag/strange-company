from __future__ import annotations

import pathlib
import subprocess
import tempfile
import textwrap
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
AUDIT = ROOT / "tools" / "audit_evolution_log.js"
README = ROOT / "README.md"
EVOLUTION_LOG = ROOT / "EVOLUTION_LOG.md"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"


def run_audit(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(AUDIT.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def write_temp_log(text: str) -> pathlib.Path:
    temp = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".md", delete=False)
    temp.write(text)
    temp.close()
    return pathlib.Path(temp.name)


VALID_LOG = textwrap.dedent(
    """
    # Evolution Log

    This log records public-safe repo evolution passes. It is not customer evidence,
    legal approval, payment proof, tax proof, privacy approval, or launch approval.
    Private/local evidence remains in ignored `*.local.json` files.

    ## 2026-06-12 - Example Pass

    Objective: make one verified repo improvement.

    Changed:

    - `tools/example.js`

    Verified with:

    - `node tools/example.js`

    Result: the example check passed.
    """
).strip()


class EvolutionLogAuditTests(unittest.TestCase):
    def test_current_evolution_log_passes(self) -> None:
        result = run_audit()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Evolution log audit passed", result.stdout)

    def test_valid_temp_log_passes(self) -> None:
        result = run_audit("--input", str(write_temp_log(VALID_LOG)))

        self.assertEqual(result.returncode, 0, result.stderr)

    def test_missing_verified_section_fails(self) -> None:
        broken = VALID_LOG.replace("Verified with:", "Checked manually:")
        result = run_audit("--input", str(write_temp_log(broken)))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing Verified with", result.stderr)

    def test_private_claim_fails(self) -> None:
        broken = f"{VALID_LOG}\n\nCNPJ: 00.000.000/0001-00\n"
        result = run_audit("--input", str(write_temp_log(broken)))

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("forbidden approval or private-data claim", result.stderr)

    def test_docs_and_ci_reference_audit(self) -> None:
        self.assertIn("tools/audit_evolution_log.js", README.read_text(encoding="utf-8"))
        self.assertIn("Evolution Pass Audit", EVOLUTION_LOG.read_text(encoding="utf-8"))
        self.assertIn("node --check tools/audit_evolution_log.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))
        self.assertIn("node tools/audit_evolution_log.js", VALIDATE_WORKFLOW.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
