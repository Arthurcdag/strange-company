from __future__ import annotations

import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
BUILD_PUBLIC_SITE = ROOT / "tools" / "build_public_site.js"


class PublicSiteBundleTests(unittest.TestCase):
    def test_public_site_bundle_builds_expected_files(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            output = pathlib.Path(workspace) / "site"
            result = subprocess.run(
                [
                    "node",
                    str(BUILD_PUBLIC_SITE.relative_to(ROOT)),
                    "--check",
                    "--output",
                    str(output),
                    "--force",
                ],
                cwd=ROOT,
                check=False,
                encoding="utf-8",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("Public site build check passed", result.stdout)
            for relative in (
                "index.html",
                "public.js",
                "public-config.js",
                "public-ama-answers.js",
                "PUBLIC_AMA.md",
                "PUBLIC_AMA_QUEUE.template.json",
                "PUBLIC_AMA_ANSWERS.template.json",
                "tools/export_public_ama_answers.js",
                "tools/build_public_site.js",
                ".nojekyll",
            ):
                with self.subTest(relative=relative):
                    self.assertTrue((output / relative).exists(), f"missing {relative}")

            bundled_names = {path.name for path in output.rglob("*")}
            self.assertNotIn("PUBLIC_AMA_QUEUE.local.json", bundled_names)
            self.assertNotIn("PUBLIC_AMA_ANSWERS.local.json", bundled_names)


if __name__ == "__main__":
    unittest.main()
