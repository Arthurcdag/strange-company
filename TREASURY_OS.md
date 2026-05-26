# Strange Company Treasury OS

The treasury has evolved from allocation buckets into a gated capital machine.

Core rule:

```text
No spend proposal can be approved unless it has a passing Research Gate receipt.
```

Finance firewall:

```text
The treasury allocates Strange Company's own retained surplus only. It must not accept, pool, custody, trade, or manage customer/investor funds, and it must not promise fixed, minimum, daily, or monthly returns.
```

Market, crypto, trading, or yield claims may be observed as external context, but they cannot approve treasury spend, create customer obligations, justify public investment language, or bypass legal/regulatory review.

Passing recommendations:

- `accept`
- `accept_with_caveats`

Blocking recommendations:

- `needs_testing`
- `needs_clarification`
- `reject`
- `api_offline`

## Proposal States

```text
needs_gate -> running -> ready -> approved
                   |
                   -> blocked
```

`ready` means the proposal passed the Effective Boolean Argument Filter but has not been approved.

`approved` means capital is cleared for execution packets.

`blocked` means the claim needs better evidence, a narrower scope, or a bridge premise before capital can move.

## Current Proposal Queue

- Scale dental compliance tracker.
- Restart search ads at scale.
- Fund backup payment route.
- Acquire licensing database.

The queue intentionally includes both clean and weak claims. Strange Company should not merely approve growth-shaped sentences; it should force those sentences to survive structure checks.

## Treasury Guard Metrics

The prototype tracks:

- eligible spend,
- approved moves,
- blocked spend,
- reserve posture.

These are operational signals, not accounting records yet.

## Current Evolution

Approved proposals can now issue execution packets. Once a packet is issued, it appears in the Bounties view and can move through the market lifecycle.

This creates the first complete operating loop:

```text
claim -> gate receipt -> treasury approval -> work packet -> outcome receipt -> decision log
```

Outcome receipts now become input for future capital routes. A delivered packet can recommend `scale`, `revise`, or `kill`, and the Treasury OS should treat that recommendation as evidence, not automatic approval.

The Capital Router can draft proposals from `scale` and `revise` receipts. Those proposals still start at `needs_gate`.

`kill` receipts create cooled spend lanes in the treasury firewall. A cooled lane should not receive new capital until the cooldown expires or a stronger claim enters the Research Gate.

## Autonomous Draft Provenance

Proposals drafted from outcome receipts now carry the upstream evidence:

- `evidenceArtifactUrl`,
- `evidenceMeasuredBefore`,
- `evidenceMeasuredAfter`,
- `evidenceGateRunId` (may be empty).

The proposal note and argument quote the measurement and link the artifact. A drafted proposal still starts at `needs_gate`. An outcome-attached gate receipt does not approve the new proposal; the new proposal must run the gate again because its claim is the next claim, not the prior one.

## Next Evolution

The next hardening step is to require:

- a resilience score above threshold,
- a budget bucket with remaining capacity,
- and a decision-log entry that links the outcome receipt, the new gate receipt, and the proposal id

before any proposal can become an executable bounty or vendor contract.
