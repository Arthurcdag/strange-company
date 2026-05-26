from __future__ import annotations

import argparse
import io
import json
import re
import sys
from pathlib import Path
from typing import Any


SYSTEM_NAME = "VAU_CHESS_EXAMPLE"
DEFAULT_PGN = Path(__file__).resolve().parents[1] / "VAU_CHESS_CHESSCOM_TEST.pgn"

HEADER_RE = re.compile(r'^\[(?P<key>[A-Za-z0-9_]+)\s+"(?P<value>.*)"\]\s*$')


class MissingChessDependency(RuntimeError):
    pass


def import_chess_module() -> Any:
    try:
        import chess
        import chess.pgn
    except ModuleNotFoundError as exc:
        raise MissingChessDependency(
            "python-chess is required for full VAU chess validation. "
            "Install chess==1.11.2 or set PYTHONPATH to the local python-chess cache."
        ) from exc
    return chess


def read_pgn(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_pgn_headers(raw_pgn: str) -> dict[str, str]:
    headers: dict[str, str] = {}
    for line in raw_pgn.splitlines():
        line = line.strip()
        if not line:
            if headers:
                break
            continue
        match = HEADER_RE.match(line)
        if match:
            headers[match.group("key")] = match.group("value")
    return headers


def parse_game(raw_pgn: str, chess: Any) -> Any:
    game = chess.pgn.read_game(io.StringIO(raw_pgn))
    if game is None:
        raise ValueError("PGN did not contain a readable game.")
    return game


def event_name_from_san(san: str) -> str:
    normalized = "".join(char if char.isalnum() else "_" for char in san).strip("_")
    normalized = "_".join(part for part in normalized.split("_") if part)
    return f"move_{normalized or 'unknown'}"


def score_move(board: Any, move: Any, after_board: Any, san: str) -> float:
    if after_board.is_checkmate():
        return 1.0

    score = 0.18
    if after_board.is_check():
        score += 0.28
    if board.is_capture(move):
        score += 0.17
    if san.startswith(("Q", "R", "B", "N")):
        score += 0.04
    if san.endswith("#"):
        score += 0.4
    elif san.endswith("+"):
        score += 0.12
    return round(min(score, 0.99), 4)


def move_to_record(board: Any, move: Any, chess: Any) -> dict[str, Any]:
    piece = board.piece_at(move.from_square)
    san = board.san(move)
    after = board.copy(stack=False)
    after.push(move)

    capture = board.is_capture(move)
    gives_check = after.is_check()
    checkmate = after.is_checkmate()
    tags = ["chess", "legal_move"]
    if capture:
        tags.append("capture")
    if gives_check:
        tags.append("check")
    if checkmate:
        tags.append("checkmate")

    record = {
        "san": san,
        "uci": move.uci(),
        "piece": piece.symbol().upper() if piece else None,
        "from": chess.square_name(move.from_square),
        "to": chess.square_name(move.to_square),
        "is_capture": capture,
        "gives_check": gives_check,
        "is_checkmate": checkmate,
        "score": score_move(board, move, after, san),
        "tags": tags,
        "fen_after": after.fen(),
        "result_after": after.result(claim_draw=True),
    }
    return record


def move_record_to_event(record: dict[str, Any]) -> dict[str, Any]:
    if record["is_checkmate"]:
        reason = "The move immediately checkmates, so it is the strongest VAU future."
    elif record["gives_check"]:
        reason = "The move gives check but does not finish the position."
    elif record["is_capture"]:
        reason = "The move wins material but does not end the tactical test."
    else:
        reason = "The move is legal but does not resolve the tactic."

    return {
        "name": event_name_from_san(record["san"]),
        "kind": "chess_move",
        "probability_hint": record["score"],
        "tags": record["tags"],
        "state_delta": {
            "best_move.san": record["san"],
            "best_move.uci": record["uci"],
            "position.fen_after": record["fen_after"],
            "position.result_after": record["result_after"],
            "position.is_checkmate": record["is_checkmate"],
        },
        "reason": reason,
        "move": record,
    }


def future_from_event(
    event: dict[str, Any],
    probability: float,
    fen_before: str,
) -> dict[str, Any]:
    record = event["move"]
    return {
        "probability": round(probability, 6),
        "confidence": 1.0 if record["is_checkmate"] else 0.72,
        "observed_events": 0,
        "next_predicted_event": event,
        "timeline": [event],
        "state": {
            "domain": "chess_tactic",
            "fen_before": fen_before,
            "candidate_san": record["san"],
            "candidate_uci": record["uci"],
            "checkmate_after": record["is_checkmate"],
            "result_after": record["result_after"],
        },
    }


def build_vau_chess_payload(pgn_path: Path, top_n: int = 12) -> dict[str, Any]:
    chess = import_chess_module()
    raw_pgn = read_pgn(pgn_path)
    headers = parse_pgn_headers(raw_pgn)
    game = parse_game(raw_pgn, chess)

    board = game.board()
    mainline_moves = list(game.mainline_moves())
    if not mainline_moves:
        raise ValueError("PGN has no mainline moves to validate.")

    solution_move = mainline_moves[0]
    solution_san = board.san(solution_move)
    solution_uci = solution_move.uci()

    legal_moves = [move_to_record(board, move, chess) for move in board.legal_moves]
    legal_moves.sort(
        key=lambda item: (
            item["score"],
            item["is_checkmate"],
            item["gives_check"],
            item["is_capture"],
            item["san"],
        ),
        reverse=True,
    )

    events = [move_record_to_event(record) for record in legal_moves]
    total_score = sum(event["probability_hint"] for event in events) or 1.0
    predicted_futures = [
        future_from_event(
            event,
            probability=event["probability_hint"] / total_score,
            fen_before=board.fen(),
        )
        for event in events[:top_n]
    ]

    solution_record = next(
        record for record in legal_moves if record["uci"] == solution_uci
    )
    solution_event = move_record_to_event(solution_record)
    surviving_futures = [
        future
        for future in predicted_futures
        if future["next_predicted_event"]["move"]["uci"] == solution_uci
    ]

    return {
        "system": SYSTEM_NAME,
        "source": {
            "pgn_path": str(pgn_path),
            "pgn_headers": headers,
            "raw_pgn": raw_pgn,
        },
        "position": {
            "fen": board.fen(),
            "turn": "white" if board.turn == chess.WHITE else "black",
            "fullmove_number": board.fullmove_number,
            "halfmove_clock": board.halfmove_clock,
            "castling_rights": headers.get("FEN", board.fen()).split()[2],
        },
        "reference_validation": {
            "library": "python-chess",
            "library_version": getattr(chess, "__version__", "unknown"),
            "legal_move_count": len(legal_moves),
            "solution_from_pgn": {
                "san": solution_san,
                "uci": solution_uci,
                "is_legal": any(record["uci"] == solution_uci for record in legal_moves),
                "is_capture": solution_record["is_capture"],
                "gives_check": solution_record["gives_check"],
                "is_checkmate": solution_record["is_checkmate"],
                "result_after": solution_record["result_after"],
                "fen_after": solution_record["fen_after"],
            },
            "all_legal_moves": legal_moves,
        },
        "llm_ai_developer_example": {
            "task": "Given the FEN and legal_moves_san, identify the move that immediately checkmates.",
            "input_schema": {
                "fen": "string",
                "turn": "white|black",
                "legal_moves_san": ["string"],
                "objective": "string",
            },
            "llm_input": {
                "fen": board.fen(),
                "turn": "white" if board.turn == chess.WHITE else "black",
                "legal_moves_san": [record["san"] for record in legal_moves],
                "objective": "Find an immediate checkmate. Do not invent illegal moves.",
            },
            "expected_model_output": {
                "best_move_san": solution_san,
                "best_move_uci": solution_uci,
                "claim": "Qxf7# is legal and checkmates black.",
            },
        },
        "observed_event": solution_event,
        "predicted_futures": predicted_futures,
        "surviving_futures_after_observed_event": surviving_futures,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a VAU-style chess tactic payload for LLM/AI developer tests."
    )
    parser.add_argument("--pgn", type=Path, default=DEFAULT_PGN)
    parser.add_argument("--top-n", type=int, default=12)
    parser.add_argument("--format", choices=("text", "json"), default="text")
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def write_or_print(payload: dict[str, Any], args: argparse.Namespace) -> None:
    if args.format == "json":
        rendered = json.dumps(payload, indent=2)
    else:
        validation = payload["reference_validation"]
        solution = validation["solution_from_pgn"]
        lines = [
            f"{SYSTEM_NAME}",
            f"PGN: {payload['source']['pgn_path']}",
            f"FEN: {payload['position']['fen']}",
            f"Legal moves: {validation['legal_move_count']}",
            (
                "Solution: "
                f"{solution['san']} ({solution['uci']}), "
                f"legal={solution['is_legal']}, "
                f"checkmate={solution['is_checkmate']}, "
                f"result={solution['result_after']}"
            ),
            "",
            "Top VAU futures:",
        ]
        for index, future in enumerate(payload["predicted_futures"], start=1):
            event = future["next_predicted_event"]
            move = event["move"]
            lines.append(
                f"{index}. p={future['probability']:.6f} "
                f"score={move['score']:.2f} :: {move['san']} "
                f"({move['uci']}) checkmate={move['is_checkmate']}"
            )
        rendered = "\n".join(lines)

    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


def main() -> int:
    args = parse_args()
    try:
        payload = build_vau_chess_payload(args.pgn, top_n=args.top_n)
    except MissingChessDependency as exc:
        print(str(exc), file=sys.stderr)
        return 2
    write_or_print(payload, args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
