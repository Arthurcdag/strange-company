# VAUtool

VAUtool is a Godot 4 editor addon for testing VAU-style future simulation.

It adds an editor dock that:

- builds possible future game events from a test game state
- scores event likelihood
- keeps the strongest branches
- lets you choose a real observed event
- discards or lowers confidence on futures that reality did not support

## Install

Copy this folder into a Godot project:

```text
addons/vautool
```

Then open Godot:

```text
Project > Project Settings > Plugins > VAUtool > Enable
```

The `VAUtool` dock appears in the editor.

## Test

1. Choose a scenario.
2. Set `Depth` and `Keep`.
3. Press `Run VAU`.
4. Pick an observed event.
5. Press `Observe`.

The dock shows predicted branches and the surviving futures after reality
correction.

## Notes

This addon is a test harness, not a full game AI. A real game should connect
VAUtool to actual game state, legal actions, and a stronger scoring function.
