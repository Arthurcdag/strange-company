from __future__ import annotations

import copy
import pathlib
import re
import shutil
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
BUILD_PUBLIC_SITE = ROOT / "tools" / "build_public_site.js"
EXPORT_PUBLIC_LIVE_RECEIPT = ROOT / "tools" / "export_public_live_receipt.js"
PREFLIGHT = ROOT / "tools" / "preflight_public_launch.js"
PAGES_WORKFLOW = ROOT / ".github" / "workflows" / "pages.yml"
VALIDATE_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"
REVIEW_DOCUMENT_PATHS = (
    "TERMOS.md",
    "TERMS.md",
    "AVISO_DE_PRIVACIDADE.md",
    "PRIVACY.md",
    "BRAZIL_COMPLIANCE.md",
    "BRAZIL_COMPLIANCE_AGENTS.md",
    "CONKA8_LAW_INSTRUCTIONS.md",
    "AI_LEGAL_HANDOFF.md",
    "HUMAN_REVIEW_PACKET.md",
)


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
                "public-live-receipt.js",
                "public-ama-answers.js",
                *REVIEW_DOCUMENT_PATHS,
                "PUBLIC_AMA.md",
                "PUBLIC_AMA_QUEUE.template.json",
                "PUBLIC_AMA_ANSWERS.template.json",
                "DELIVERY_REVIEW_LOOP.md",
                "DELIVERY_REVIEW_CHECKLIST.template.json",
                "LIVE_REVIEW_CLOSURE.template.json",
                "EVOLUTION_LOG.md",
                "tools/audit_evolution_log.js",
                "tools/evolution_goal_status.js",
                "tools/generate_evolution_next_packet.js",
                "tools/local_evidence_status.js",
                "tools/check_live_review_closure_conformance.js",
                "tools/vau_company_evolution.py",
                "tools/validate_live_review_closure.js",
                "tools/render_live_review_public_config_patch.js",
                "tools/render_public_live_shutdown_patch.js",
                "tools/export_public_live_receipt.js",
                "tools/validate_delivery_review_checklist.js",
                "tools/export_public_ama_answers.js",
                "tools/build_public_site.js",
                ".nojekyll",
            ):
                with self.subTest(relative=relative):
                    self.assertTrue((output / relative).exists(), f"missing {relative}")

            bundled_conformance = subprocess.run(
                ["node", "tools/check_live_review_closure_conformance.js"],
                cwd=output,
                check=False,
                encoding="utf-8",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120,
            )
            self.assertEqual(bundled_conformance.returncode, 0, bundled_conformance.stderr)
            self.assertIn(
                "Live review closure conformance passed.",
                bundled_conformance.stdout,
            )

            builder = BUILD_PUBLIC_SITE.read_text(encoding="utf-8")
            for review_document in REVIEW_DOCUMENT_PATHS:
                with self.subTest(review_document=review_document):
                    self.assertIn(f'"{review_document}"', builder)
                    self.assertEqual(
                        (output / review_document).read_bytes(),
                        (ROOT / review_document).read_bytes(),
                    )

            bundled_names = {path.name for path in output.rglob("*")}
            self.assertNotIn("PUBLIC_AMA_QUEUE.local.json", bundled_names)
            self.assertNotIn("PUBLIC_AMA_ANSWERS.local.json", bundled_names)
            self.assertNotIn("DELIVERY_REVIEW_CHECKLIST.local.json", bundled_names)
            self.assertNotIn("EVOLUTION_NEXT_ACTION.local.md", bundled_names)
            self.assertNotIn("LIVE_REVIEW_CLOSURE.local.json", bundled_names)

            bundled_html = (output / "index.html").read_text(encoding="utf-8")
            self.assertIn('http-equiv="Content-Security-Policy"', bundled_html)
            self.assertIn("script-src 'self'", bundled_html)
            self.assertNotRegex(bundled_html, r'<script\b[^>]*\bsrc=["\']https?://')

    def test_altered_bundled_non_portuguese_review_document_fails_receipt_check(self) -> None:
        with tempfile.TemporaryDirectory() as workspace:
            output = pathlib.Path(workspace) / "site"
            build = subprocess.run(
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
            self.assertEqual(build.returncode, 0, build.stderr)

            terms = output / "TERMS.md"
            terms.write_bytes(terms.read_bytes() + b"\nPost-build drift.\n")
            receipt_check = subprocess.run(
                [
                    "node",
                    str(EXPORT_PUBLIC_LIVE_RECEIPT.relative_to(ROOT)),
                    "--check-public-js",
                    "--public-config",
                    str(output / "public-config.js"),
                    "--public-js",
                    str(output / "public-live-receipt.js"),
                    "--document-root",
                    str(output),
                ],
                cwd=ROOT,
                check=False,
                encoding="utf-8",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            self.assertNotEqual(receipt_check.returncode, 0)
            self.assertIn("stale public core", receipt_check.stderr)

    def test_deployment_preflight_supports_the_separate_live_flip(self) -> None:
        from tests.test_public_live_receipt import (
            read_receipt,
            ready_delivery_checklist,
            ready_external_packet,
            ready_live_review_closure,
            ready_public_config,
            ready_revenue_index,
            ready_reviewer_tracker,
            write_json,
            write_public_config,
        )

        preflight = PREFLIGHT.read_text(encoding="utf-8")
        self.assertIn('process.argv.includes("--deployment")', preflight)
        self.assertIn('receiptArgs.push("--require-issued")', preflight)
        self.assertIn("if (!deploymentMode)", preflight)
        for workflow in (PAGES_WORKFLOW, VALIDATE_WORKFLOW):
            with self.subTest(workflow=workflow.name):
                self.assertIn(
                    "node tools/preflight_public_launch.js --deployment",
                    workflow.read_text(encoding="utf-8"),
                )

        self.assertIn(
            "python -m unittest discover -s tests",
            PAGES_WORKFLOW.read_text(encoding="utf-8"),
        )

        with tempfile.TemporaryDirectory() as workspace:
            isolated_root = pathlib.Path(workspace) / "repo"
            shutil.copytree(
                ROOT,
                isolated_root,
                ignore=shutil.ignore_patterns(
                    ".git",
                    ".public-site-build.local",
                    "_site",
                    "__pycache__",
                    "*.local.json",
                    "MEI_*",
                ),
            )

            support_match = re.search(
                r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                (ROOT / "SUPPORT_INBOX_EVIDENCE.md").read_text(encoding="utf-8"),
            )
            self.assertIsNotNone(support_match)
            config = ready_public_config(live_mode=False)
            config["supportEmail"] = support_match.group(0)
            config_path = write_public_config(isolated_root, config)
            external = write_json(
                isolated_root,
                "EXTERNAL_LIVE_PACKET.local.json",
                ready_external_packet(config),
            )
            revenue = write_json(
                isolated_root,
                "REVENUE_SETUP_EVIDENCE_INDEX.local.json",
                ready_revenue_index(config),
            )
            reviewer = write_json(
                isolated_root,
                "REVIEWER_CANDIDATE_TRACKER.local.json",
                ready_reviewer_tracker(),
            )
            delivery = write_json(
                isolated_root,
                "DELIVERY_REVIEW_CHECKLIST.local.json",
                ready_delivery_checklist(),
            )
            closure = write_json(
                isolated_root,
                "LIVE_REVIEW_CLOSURE.local.json",
                ready_live_review_closure(config),
            )
            receipt_path = isolated_root / "public-live-receipt.js"

            def run_isolated(*args: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    list(args),
                    cwd=isolated_root,
                    check=False,
                    encoding="utf-8",
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=180,
                )

            issued = run_isolated(
                "node",
                "tools/export_public_live_receipt.js",
                "--live-review-closure",
                str(closure),
                "--external-live-packet",
                str(external),
                "--revenue-index",
                str(revenue),
                "--reviewer-tracker",
                str(reviewer),
                "--delivery-review-checklist",
                str(delivery),
                "--public-config",
                str(config_path),
                "--output",
                str(receipt_path),
                "--force",
            )
            self.assertEqual(issued.returncode, 0, issued.stderr)
            issued_digest = read_receipt(receipt_path)["coreSha256"]

            live_config = copy.deepcopy(config)
            live_config["liveMode"] = True
            write_public_config(isolated_root, live_config)

            receipt_check = run_isolated(
                "node",
                "tools/export_public_live_receipt.js",
                "--check-public-js",
                "--require-issued",
            )
            self.assertEqual(receipt_check.returncode, 0, receipt_check.stderr)
            self.assertEqual(read_receipt(receipt_path)["coreSha256"], issued_digest)

            normal_preflight = run_isolated("node", "tools/preflight_public_launch.js")
            self.assertNotEqual(normal_preflight.returncode, 0)
            self.assertIn(
                "must keep liveMode false by default; use --deployment",
                normal_preflight.stderr,
            )

            deployment_preflight = run_isolated(
                "node",
                "tools/preflight_public_launch.js",
                "--deployment",
            )
            self.assertEqual(deployment_preflight.returncode, 0, deployment_preflight.stderr)

            bundle = run_isolated(
                "node",
                "tools/build_public_site.js",
                "--check",
                "--output",
                str(isolated_root / "_site"),
                "--force",
            )
            self.assertEqual(bundle.returncode, 0, bundle.stderr)
            self.assertIn("Public site build check passed", bundle.stdout)


if __name__ == "__main__":
    unittest.main()
