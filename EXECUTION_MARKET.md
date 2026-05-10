# Strange Company Execution Market

The company now converts approved treasury moves into work packets.

Core rule:

```text
No employees. Approved capital becomes scoped market work.
```

## Flow

```text
Research Gate receipt
-> Treasury approval
-> Execution packet
-> Open market
-> Awarded
-> Delivered
-> Outcome receipt
-> Decision log
```

## Packet Lifecycle

```text
Draft -> Open -> Awarded -> Delivered -> Outcome -> Archived
```

`Draft` means the packet exists but is not ready for external contributors.

`Open` means the packet can be taken by a contractor, vendor, agent, or bounty participant.

`Awarded` means the packet has an assigned external executor.

`Delivered` means the acceptance criteria were met.

`Outcome` means the accepted delivery has been converted into a learning receipt for the autonomous cycle.

## Treasury Link

Approved treasury proposals can issue packets.

A proposal cannot issue a packet unless:

- it passed the Research Gate,
- it was approved by the Treasury OS,
- and it has not already issued a packet.

This prevents duplicated work and keeps execution tied to a gate receipt.

## Current Prototype Behavior

The Bounties view now tracks:

- open packets,
- awarded packets,
- delivered packets,
- active market budget.

Delivered packets can now emit outcome receipts before archival. That receipt is the bridge from external work into the experiment portfolio.

Outcome receipts can now be routed into new treasury proposals or cooled spend lanes. The execution market still cannot approve its own follow-on work.

Weak resilience drills can now issue hardening packets. These packets use the same open, awarded, delivered, and outcome lifecycle as treasury-funded work.

Packet state is stored in browser local storage. This is not yet an accounting backend, but it proves the operating loop.

## Outcome Receipt Evidence

Outcome receipts now require operator-attached evidence before they leave the Bounties view.

When a packet reaches `Delivered`, the Bounties card surfaces an evidence form. The operator must record:

- a delivery artifact (https URL),
- measured before,
- measured after,
- the single next claim this outcome should route into the gate or treasury,
- optionally a Research Gate receipt id from the `gateRuns` log,
- and optionally a routed, boundary-confirmed External Signal as supporting context.

The handler `submitOutcomeEvidence` validates the artifact through `safeHttpsUrl`, runs `findSensitiveData` over the measurement and next-claim text, verifies the chosen gate receipt still exists, and checks that any selected External Signal is still routed, boundary-confirmed, and clean. Only then does `createOutcomeFromPacket` run; otherwise the form shows the failure reason and the packet remains in `Delivered` without an outcome.

This evidence is carried forward into:

- the drafted Treasury proposal (`evidenceArtifactUrl`, `evidenceMeasuredBefore`, `evidenceMeasuredAfter`, `evidenceGateRunId`, optional `sourceSignal*` metadata, plus the measurement quote in the argument),
- the cooldown lane reason for `kill` outcomes,
- and the receipt-chain canonical form for the Outcome, Treasury, and Cooldown event types.

## Next Evolution

The next layer is to require, before a packet can issue:

- a budget bucket with remaining capacity,
- a resilience score above threshold,
- and a decision-log entry that links the gate receipt, the outcome receipt, and the proposal id.
