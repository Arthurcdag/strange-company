from __future__ import annotations

import configparser
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
ADDON = ROOT / "addons" / "vautool"


class GodotVAUtoolAddonTests(unittest.TestCase):
    def test_plugin_cfg_points_to_existing_plugin_script(self) -> None:
        config = configparser.ConfigParser()
        config.read(ADDON / "plugin.cfg", encoding="utf-8")

        self.assertEqual(config["plugin"]["name"], '"VAUtool"')
        script_name = config["plugin"]["script"].strip('"')
        self.assertTrue((ADDON / script_name).exists())

    def test_required_addon_files_exist(self) -> None:
        for relative_path in (
            "plugin.cfg",
            "plugin.gd",
            "vau_runtime.gd",
            "vau_dock.gd",
            "README.md",
        ):
            with self.subTest(file=relative_path):
                self.assertTrue((ADDON / relative_path).exists())

    def test_runtime_exposes_vau_core_functions(self) -> None:
        runtime = (ADDON / "vau_runtime.gd").read_text(encoding="utf-8")

        for function_name in (
            "create_initial_future",
            "generate_possible_next_events",
            "simulate_futures",
            "update_futures_with_real_event",
            "compare_events",
        ):
            with self.subTest(function=function_name):
                self.assertIn(f"static func {function_name}", runtime)

    def test_editor_plugin_registers_dock(self) -> None:
        plugin = (ADDON / "plugin.gd").read_text(encoding="utf-8")

        self.assertIn("extends EditorPlugin", plugin)
        self.assertIn("add_control_to_dock", plugin)
        self.assertIn("remove_control_from_docks", plugin)

    def test_dock_uses_runtime_and_observe_loop(self) -> None:
        dock = (ADDON / "vau_dock.gd").read_text(encoding="utf-8")

        self.assertIn('preload("res://addons/vautool/vau_runtime.gd")', dock)
        self.assertIn("_run_vau", dock)
        self.assertIn("_observe_selected_event", dock)
        self.assertIn("update_futures_with_real_event", dock)


if __name__ == "__main__":
    unittest.main()
