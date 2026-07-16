from __future__ import annotations

import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES_WORKFLOW = ROOT / ".github" / "workflows" / "pages.yml"


class PagesDeploymentWorkflowTests(unittest.TestCase):
    def test_pages_deploy_is_main_only_and_cancels_stale_runs(self) -> None:
        workflow = PAGES_WORKFLOW.read_text(encoding="utf-8")

        self.assertIn("cancel-in-progress: true", workflow)
        self.assertNotIn("cancel-in-progress: false", workflow)
        self.assertIn("if: github.ref == 'refs/heads/main'", workflow)
        self.assertIn("name: github-pages", workflow)
        self.assertIn("url: ${{ steps.deployment.outputs.page_url }}", workflow)
        self.assertIn(
            "node tools/render_public_live_shutdown_patch.js --json",
            workflow,
        )

    def test_main_head_is_refetched_and_compared_immediately_before_deploy(self) -> None:
        workflow = PAGES_WORKFLOW.read_text(encoding="utf-8")
        upload_index = workflow.index("- name: Upload artifact")
        guard_index = workflow.index("- name: Verify checkout is still current main")
        deploy_index = workflow.index("- name: Deploy to GitHub Pages")

        self.assertLess(upload_index, guard_index)
        self.assertLess(guard_index, deploy_index)
        self.assertIn(
            'git fetch --no-tags origin "+refs/heads/main:refs/remotes/origin/main"',
            workflow,
        )
        self.assertIn('test "$(git rev-parse HEAD)" =', workflow)
        self.assertIn('"$(git rev-parse refs/remotes/origin/main)"', workflow)
        self.assertIn("Refusing to deploy a stale main checkout.", workflow)


if __name__ == "__main__":
    unittest.main()
