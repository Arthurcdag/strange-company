from __future__ import annotations

import base64
import json
import pathlib
import subprocess
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
HARNESS = r"""
const parser = require("./tools/strict_public_data");
const [functionName, encoded, globalName] = process.argv.slice(1);
const source = Buffer.from(encoded, "base64").toString("utf8");
try {
  const value = functionName === "parseFrozenWindowJson"
    ? parser[functionName](source, globalName, "test input")
    : parser[functionName](source, "test input");
  process.stdout.write(`${JSON.stringify(value)}\n`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
"""


def parse_with_node(
    function_name: str,
    source: str,
    global_name: str = "",
) -> subprocess.CompletedProcess[str]:
    encoded = base64.b64encode(source.encode("utf-8")).decode("ascii")
    return subprocess.run(
        ["node", "-e", HARNESS, function_name, encoded, global_name],
        cwd=ROOT,
        check=False,
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


class StrictPublicDataParserTests(unittest.TestCase):
    def test_accepts_current_config_and_frozen_public_archives(self) -> None:
        config = parse_with_node(
            "parsePublicOrderConfig",
            (ROOT / "public-config.js").read_text(encoding="utf-8"),
        )
        receipt = parse_with_node(
            "parseFrozenWindowJson",
            (ROOT / "public-live-receipt.js").read_text(encoding="utf-8"),
            "PUBLIC_LIVE_RECEIPT",
        )
        answers = parse_with_node(
            "parseFrozenWindowJson",
            (ROOT / "public-ama-answers.js").read_text(encoding="utf-8"),
            "PUBLIC_AMA_ANSWERS",
        )

        self.assertEqual(config.returncode, 0, config.stderr)
        self.assertEqual(receipt.returncode, 0, receipt.stderr)
        self.assertEqual(answers.returncode, 0, answers.stderr)
        self.assertEqual(json.loads(config.stdout)["operatorName"], "Strange Works Studio")
        self.assertEqual(json.loads(receipt.stdout)["schemaVersion"], 4)
        self.assertEqual(json.loads(answers.stdout)["schemaVersion"], 1)

    def test_config_mode_accepts_json_keys_compact_values_and_trailing_commas(self) -> None:
        source = '''\ufeff window.PUBLIC_ORDER_CONFIG = {
          "liveMode": false,
          services: [{ id: "proof", title: "Proof", price: 7.5e2, },],
        };\n'''
        result = parse_with_node("parsePublicOrderConfig", source)

        self.assertEqual(result.returncode, 0, result.stderr)
        parsed = json.loads(result.stdout)
        self.assertFalse(parsed["liveMode"])
        self.assertEqual(parsed["services"][0]["price"], 750)

    def test_rejects_duplicate_unsafe_and_executable_config_syntax(self) -> None:
        cases = {
            "duplicate": 'window.PUBLIC_ORDER_CONFIG = { liveMode: false, "liveMode": true };',
            "escaped-duplicate": 'window.PUBLIC_ORDER_CONFIG = { liveMode: false, "live\\u004dode": true };',
            "unsafe": 'window.PUBLIC_ORDER_CONFIG = { nested: { "__proto__": {} } };',
            "getter": 'window.PUBLIC_ORDER_CONFIG = { get liveMode() { return true; } };',
            "computed": 'window.PUBLIC_ORDER_CONFIG = { ["liveMode"]: true };',
            "spread": 'window.PUBLIC_ORDER_CONFIG = { ...{ liveMode: true } };',
            "expression": 'window.PUBLIC_ORDER_CONFIG = { liveMode: (() => true)() };',
            "suffix": 'window.PUBLIC_ORDER_CONFIG = { liveMode: false }; process.exit(0);',
        }
        for name, source in cases.items():
            with self.subTest(name=name):
                result = parse_with_node("parsePublicOrderConfig", source)
                self.assertNotEqual(result.returncode, 0, result.stdout)

    def test_frozen_archive_is_strict_json_with_duplicate_detection(self) -> None:
        cases = {
            "duplicate": 'window.PUBLIC_LIVE_RECEIPT = Object.freeze({"status":"a","status":"b"});',
            "identifier-key": 'window.PUBLIC_LIVE_RECEIPT = Object.freeze({status:"a"});',
            "trailing-comma": 'window.PUBLIC_LIVE_RECEIPT = Object.freeze({"status":"a",});',
            "extra-argument": 'window.PUBLIC_LIVE_RECEIPT = Object.freeze({"status":"a"}, {});',
            "suffix": 'window.PUBLIC_LIVE_RECEIPT = Object.freeze({"status":"a"}); process.exit(0);',
        }
        for name, source in cases.items():
            with self.subTest(name=name):
                result = parse_with_node(
                    "parseFrozenWindowJson",
                    source,
                    "PUBLIC_LIVE_RECEIPT",
                )
                self.assertNotEqual(result.returncode, 0, result.stdout)

    def test_malicious_expressions_cannot_read_private_material_or_write_canary(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = pathlib.Path(tmp)
            private = folder / "LIVE_REVIEW_CLOSURE.local.json"
            canary = folder / "leaked.txt"
            private.write_text("PRIVATE REVIEWER MATERIAL", encoding="utf-8")
            expression = (
                '(() => { const fs = process.getBuiltinModule("fs"); '
                f'fs.writeFileSync({json.dumps(str(canary))}, '
                f'fs.readFileSync({json.dumps(str(private))})); return false; }})()'
            )
            config = parse_with_node(
                "parsePublicOrderConfig",
                f"window.PUBLIC_ORDER_CONFIG = {{ liveMode: {expression} }};",
            )
            receipt = parse_with_node(
                "parseFrozenWindowJson",
                "window.PUBLIC_LIVE_RECEIPT = Object.freeze("
                f"{{\"status\": {expression}}});",
                "PUBLIC_LIVE_RECEIPT",
            )

            self.assertNotEqual(config.returncode, 0)
            self.assertNotEqual(receipt.returncode, 0)
            self.assertFalse(canary.exists())
            self.assertNotIn("PRIVATE REVIEWER MATERIAL", config.stderr + receipt.stderr)


if __name__ == "__main__":
    unittest.main()
