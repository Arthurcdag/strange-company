from __future__ import annotations

import json
import pathlib
import subprocess
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
RENDERER = ROOT / "tools" / "render_public_live_shutdown_patch.js"
PUBLIC_CONFIG = ROOT / "public-config.js"


def run_renderer(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(RENDERER.relative_to(ROOT)), *args],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


class PublicLiveShutdownPatchTests(unittest.TestCase):
    def test_json_patch_is_exact_fail_closed_and_does_not_mutate_config(self) -> None:
        before = PUBLIC_CONFIG.read_bytes()

        result = run_renderer("--json")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(PUBLIC_CONFIG.read_bytes(), before)
        plan = json.loads(result.stdout)
        self.assertEqual(plan["system"], "STRANGE_COMPANY_PUBLIC_LIVE_SHUTDOWN_PATCH")
        self.assertTrue(plan["publicSafe"])
        self.assertFalse(plan["mutatesFiles"])
        self.assertEqual(
            plan["publicConfigPatch"],
            {
                "googleFormUrl": "",
                "googleFormVerified": False,
                "liveMode": False,
            },
        )
        self.assertIn("Disable external Google Form responses", plan["order"][0])
        self.assertIn("--revoke", plan["revokeCommand"])
        self.assertIn("--deployment", plan["deploymentPreflightCommand"])

    def test_text_output_is_an_operator_patch_not_a_write_claim(self) -> None:
        result = run_renderer()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Output only: no files were changed.", result.stdout)
        self.assertIn('"googleFormUrl": ""', result.stdout)
        self.assertIn('"googleFormVerified": false', result.stdout)
        self.assertIn('"liveMode": false', result.stdout)
        self.assertIn("Disable external Google Form responses first", result.stdout)

    def test_unknown_option_fails_without_mutating_config(self) -> None:
        before = PUBLIC_CONFIG.read_bytes()

        result = run_renderer("--write-local")

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("unknown argument", result.stderr)
        self.assertEqual(PUBLIC_CONFIG.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
