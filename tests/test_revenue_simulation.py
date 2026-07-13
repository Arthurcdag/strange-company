from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
SIMULATOR = ROOT / "tools" / "simulate_revenue_scenarios.js"
VALIDATOR = ROOT / "tools" / "validate_revenue_setup_evidence_index.js"
README = ROOT / "README.md"
GITIGNORE = ROOT / ".gitignore"
SIMULATION_DOC = ROOT / "REVENUE_SIMULATION.md"

NODE = shutil.which("node")


@unittest.skipIf(NODE is None, "node binary not available")
class RevenueSimulationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.workdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.workdir.cleanup)
        self.cwd = pathlib.Path(self.workdir.name)

    def _run_simulator(self, *args: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [NODE, str(SIMULATOR), *args],
            cwd=self.cwd,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_simulator_file_exists_and_is_node_parseable(self) -> None:
        self.assertTrue(SIMULATOR.exists())

        check = subprocess.run(
            [NODE, "--check", str(SIMULATOR)],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(check.returncode, 0, check.stderr)

    def test_stdout_only_run_exits_clean_and_mentions_simulation(self) -> None:
        result = self._run_simulator()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Revenue Simulation Summary", result.stdout)
        self.assertIn("SIMULATED", result.stdout)
        self.assertIn("liveMode stays false", result.stdout)

    def test_write_report_produces_simulation_labeled_markdown(self) -> None:
        result = self._run_simulator("--write-report")
        self.assertEqual(result.returncode, 0, result.stderr)

        report = self.cwd / "REVENUE_SIMULATION_REPORT.md"
        self.assertTrue(report.exists())

        text = report.read_text(encoding="utf-8")
        self.assertIn("Revenue Simulation Report", text)
        self.assertIn("All data is simulated", text)
        self.assertIn("Compliance proof sprint", text)
        self.assertIn("Compliance template pack", text)
        self.assertIn("This report does not close any human-review gate", text)

    def test_write_evidence_produces_simulation_mode_json(self) -> None:
        result = self._run_simulator("--write-evidence")
        self.assertEqual(result.returncode, 0, result.stderr)

        evidence_path = self.cwd / "REVENUE_SETUP_EVIDENCE_INDEX.simulation.json"
        self.assertTrue(evidence_path.exists())

        data = json.loads(evidence_path.read_text(encoding="utf-8"))
        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["mode"], "simulation")
        self.assertFalse(data["publicConfig"]["liveMode"])
        self.assertFalse(data["publicConfig"]["supportInboxVerified"])
        self.assertFalse(data["publicConfig"]["googleFormVerified"])
        self.assertEqual(data["publicConfig"]["operatorName"], "Strange Works Studio")

    def test_simulation_evidence_is_structurally_valid(self) -> None:
        result = self._run_simulator("--write-evidence")
        self.assertEqual(result.returncode, 0, result.stderr)

        evidence_path = self.cwd / "REVENUE_SETUP_EVIDENCE_INDEX.simulation.json"
        validation = subprocess.run(
            [NODE, str(VALIDATOR), str(evidence_path)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertEqual(validation.returncode, 0, validation.stderr)
        self.assertIn("template validation passed", validation.stdout)
        self.assertIn("mode is not template", validation.stdout)

    def test_simulation_evidence_cannot_pass_full_readiness(self) -> None:
        result = self._run_simulator("--write-evidence")
        self.assertEqual(result.returncode, 0, result.stderr)

        evidence_path = self.cwd / "REVENUE_SETUP_EVIDENCE_INDEX.simulation.json"
        validation = subprocess.run(
            [NODE, str(VALIDATOR), str(evidence_path), "--require-all"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertNotEqual(validation.returncode, 0)
        self.assertIn("must be true to pass this readiness gate", validation.stderr)
        self.assertNotIn("is required", validation.stderr)

    def test_simulation_evidence_keeps_every_gate_unverified(self) -> None:
        result = self._run_simulator("--write-evidence")
        self.assertEqual(result.returncode, 0, result.stderr)

        evidence_path = self.cwd / "REVENUE_SETUP_EVIDENCE_INDEX.simulation.json"
        data = json.loads(evidence_path.read_text(encoding="utf-8"))

        for section in (
            "entity",
            "tax",
            "payment",
            "support",
            "privacy",
            "terms",
            "ledger",
        ):
            with self.subTest(section=section):
                self.assertFalse(
                    data[section]["verified"],
                    f"section {section!r} must stay verified=false in simulation mode",
                )

    def test_simulation_evidence_records_satellite_attestation(self) -> None:
        result = self._run_simulator("--write-evidence")
        self.assertEqual(result.returncode, 0, result.stderr)

        evidence_path = self.cwd / "REVENUE_SETUP_EVIDENCE_INDEX.simulation.json"
        data = json.loads(evidence_path.read_text(encoding="utf-8"))

        attestation = data["attestation"]
        self.assertTrue(attestation["strangeCompanyRemainsSealed"])
        self.assertTrue(attestation["satelliteIsRevenueOperator"])
        self.assertTrue(attestation["aiDidNotApproveLegalTaxPaymentOrPrivacy"])
        self.assertTrue(attestation["noSecretsInRepo"])

    def test_simulation_summary_is_internally_consistent(self) -> None:
        result = self._run_simulator("--write-evidence")
        self.assertEqual(result.returncode, 0, result.stderr)

        evidence_path = self.cwd / "REVENUE_SETUP_EVIDENCE_INDEX.simulation.json"
        data = json.loads(evidence_path.read_text(encoding="utf-8"))

        summary = data["simulationSummary"]
        per_service = summary["perService"]
        totals = summary["totals"]

        self.assertGreater(len(per_service), 0)
        per_service_total_gross = round(
            sum(bucket["grossBRL"] for bucket in per_service.values()), 2
        )
        per_service_total_net = round(
            sum(bucket["netBRL"] for bucket in per_service.values()), 2
        )
        per_service_count = sum(bucket["scenarioCount"] for bucket in per_service.values())

        self.assertEqual(per_service_count, totals["scenarioCount"])
        self.assertAlmostEqual(per_service_total_gross, totals["grossBRL"], places=2)
        self.assertAlmostEqual(per_service_total_net, totals["netBRL"], places=2)

    def test_gitignore_keeps_simulation_outputs_out(self) -> None:
        text = GITIGNORE.read_text(encoding="utf-8")

        for pattern in (
            "REVENUE_SIMULATION_REPORT.md",
            "REVENUE_SETUP_EVIDENCE_INDEX.*.json",
        ):
            with self.subTest(pattern=pattern):
                self.assertIn(pattern, text)

    def test_readme_lists_simulator_and_doc(self) -> None:
        text = README.read_text(encoding="utf-8")

        self.assertIn("tools/simulate_revenue_scenarios.js", text)
        self.assertIn("REVENUE_SIMULATION.md", text)

    def test_simulation_doc_warns_about_real_gate_separation(self) -> None:
        text = SIMULATION_DOC.read_text(encoding="utf-8")

        self.assertIn("HUMAN_REVENUE_INSTRUCTIONS.md", text)
        self.assertIn("does not", text.lower())
        self.assertIn("liveMode", text)


if __name__ == "__main__":
    unittest.main()
