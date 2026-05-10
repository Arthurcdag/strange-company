# Receipt Chain

Strange Company needs evidence that its own memory has not silently shifted. The prototype now keeps a local receipt chain over material operating state.

## Rule

Every material event becomes a receipt:

- launch gate checks,
- Research Gate runs,
- treasury proposals and approvals,
- execution packets,
- delivered outcomes,
- outcome evidence reviews,
- cooled capital lanes,
- resilience drills.

The receipts are sorted, serialized in a stable form, and linked with the prior receipt hash. The final root is the current proof surface.

## Seal Behavior

When the operator presses **Seal chain**, the current root, receipt count, and seal time are stored locally.

After that:

- **Sealed** means the current state still matches the stored root.
- **Changed** means at least one material receipt changed after the last seal.
- **Unsealed** means no baseline root has been recorded yet.

The seal is not included in the chain itself. Otherwise sealing would change the root it was trying to preserve.

## Outcome Reviews

Outcome evidence reviews are material receipts.

Each review records the reviewed outcome id, decision, note, blockers, and optional External Signal metadata. Treasury proposals and cooldown lanes also carry the approved review id forward, so a sealed chain can show whether capital routing followed a human review receipt instead of raw delivery evidence alone.

## Limits

This is a local tamper-evidence mechanism for the prototype. It is not a legal audit system, not cryptographic notarization, and not a replacement for accounting records, bank records, contracts, counsel review, or externally witnessed logs.

The production version should move receipts to append-only storage, use browser or server cryptographic digests, anchor periodic roots outside the operating environment, and separate write access from review access.
