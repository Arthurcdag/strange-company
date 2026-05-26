# VAU Chess Developer Example

This is a small LLM/AI developer test for `VAU_SYSTEM` style future scoring on a concrete chess tactic.

The source position is in [VAU_CHESS_CHESSCOM_TEST.pgn](VAU_CHESS_CHESSCOM_TEST.pgn). It contains one Chess.com import position and one observed move:

```text
FEN: r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4
Observed move: 4. Qxf7# 1-0
```

## Run

Use `python-chess` for the reference chess rules. On this machine the validated local cache is:

```powershell
$env:PYTHONPATH="$PWD\.venv\local-cache\python-chess-src\extracted\chess-1.11.2"
& 'C:\Program Files\LibreOffice\program\python.exe' -B tools\vau_chess_example.py --pgn VAU_CHESS_CHESSCOM_TEST.pgn --format json --top-n 12 --output VAU_CHESS_TEST_DATA.generated.json
```

If `python` is available and `chess==1.11.2` is installed, the equivalent command is:

```powershell
python -B tools\vau_chess_example.py --pgn VAU_CHESS_CHESSCOM_TEST.pgn --format json --top-n 12 --output VAU_CHESS_TEST_DATA.generated.json
```

## Developer Payload

The generated JSON includes:

- `source`: raw PGN, headers, and path.
- `position`: FEN, side to move, move number, halfmove clock, and castling rights.
- `reference_validation`: `python-chess` version, full legal move list, legal move count, and the PGN solution validation.
- `llm_ai_developer_example`: a compact input schema, model input, and expected model output.
- `predicted_futures`: top VAU-style futures scored from legal moves.
- `observed_event`: the PGN move converted into the same event shape.
- `surviving_futures_after_observed_event`: the future that survives after observing `Qxf7#`.

Expected validation facts:

```text
legal_move_count: 43
solution_san: Qxf7#
solution_uci: h5f7
solution_is_legal: true
solution_is_capture: true
solution_gives_check: true
solution_is_checkmate: true
result_after_solution: 1-0
```

## LLM/AI Test

Use this as a narrow hallucination and tactical-grounding check:

```json
{
  "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
  "turn": "white",
  "objective": "Find an immediate checkmate. Do not invent illegal moves.",
  "expected_best_move_san": "Qxf7#",
  "expected_best_move_uci": "h5f7"
}
```

The point is not to make VAU a chess engine. The point is to feed a verified finite legal-move set into the same observe-and-survive shape used by the generic VAU tools.

For the broader modeling caveats, sim-to-real transfer rules, evolutionary-search rationale, and observation-effect framing, see [VAU_SIM_TO_REAL_RATIONALE.md](VAU_SIM_TO_REAL_RATIONALE.md).
