from __future__ import annotations

import pathlib
import unittest

from tools.vau_chess_example import (
    MissingChessDependency,
    build_vau_chess_payload,
    parse_pgn_headers,
    read_pgn,
)


ROOT = pathlib.Path(__file__).resolve().parents[1]
PGN = ROOT / "VAU_CHESS_CHESSCOM_TEST.pgn"


class VAUChessExampleTests(unittest.TestCase):
    def test_parses_chesscom_pgn_headers(self) -> None:
        headers = parse_pgn_headers(read_pgn(PGN))

        self.assertEqual(headers["Event"], "VAU Chess Tactical Test")
        self.assertEqual(headers["Site"], "Chess.com Analysis Import")
        self.assertEqual(headers["FEN"], "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4")

    def test_builds_full_vau_payload_when_python_chess_is_available(self) -> None:
        try:
            payload = build_vau_chess_payload(PGN, top_n=12)
        except MissingChessDependency as exc:
            self.skipTest(str(exc))

        validation = payload["reference_validation"]
        solution = validation["solution_from_pgn"]

        self.assertEqual(payload["system"], "VAU_CHESS_EXAMPLE")
        self.assertEqual(validation["legal_move_count"], 43)
        self.assertEqual(solution["san"], "Qxf7#")
        self.assertEqual(solution["uci"], "h5f7")
        self.assertTrue(solution["is_legal"])
        self.assertTrue(solution["is_capture"])
        self.assertTrue(solution["gives_check"])
        self.assertTrue(solution["is_checkmate"])
        self.assertEqual(solution["result_after"], "1-0")

        top_future = payload["predicted_futures"][0]["next_predicted_event"]["move"]
        self.assertEqual(top_future["san"], "Qxf7#")
        self.assertEqual(
            payload["surviving_futures_after_observed_event"][0]["next_predicted_event"]["move"]["uci"],
            "h5f7",
        )


if __name__ == "__main__":
    unittest.main()
