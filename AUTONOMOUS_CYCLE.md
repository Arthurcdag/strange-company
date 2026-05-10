# Strange Company Autonomous Cycle

The company now has a primitive learning loop.

Core rule:

```text
No delivery is complete until it becomes an outcome receipt.
```

## Loop

```text
Treasury proposal
-> Research Gate receipt
-> Execution packet
-> Delivered work
-> Outcome receipt
-> Experiment portfolio
-> Capital route
-> Next treasury claim
```

## Outcome Decisions

Every outcome receipt produces one of three operating decisions:

- `scale`: the delivery created a reusable growth, product, or resilience asset.
- `revise`: the delivery produced useful evidence, but the claim needs narrower measurement.
- `kill`: the delivery exposed a weak spend lane or failed growth thesis.

These labels are not final judgments. They are routing instructions for the next capital cycle.

## Current Prototype Behavior

The Experiments view now contains an outcome ledger, cycle metrics, and routing actions.

The Bounties view now lets delivered packets emit outcome receipts before archival.

The Treasury view now shows cooled spend lanes created from kill outcomes.

The Decisions view now mirrors outcome and routing receipts beside treasury, gate, and packet events.

Browser local storage keeps the prototype state across reloads.

## Outcome Receipt Evidence

A delivered packet no longer becomes an outcome receipt automatically.

The operator must attach:

- a delivery artifact (https URL),
- measured before and measured after values,
- a single next claim,
- an optional Research Gate receipt,
- and an optional routed, boundary-confirmed External Signal.

The artifact URL is rejected unless it parses as `https://`. Measurement and next-claim text are rejected if the sensitive-data scan flags PHI, payment card data, secrets, or private keys.

These fields ride with the outcome into:

- the Experiments view outcome card,
- the drafted Treasury proposal note and argument,
- the cooldown lane reason for `kill` outcomes,
- and the receipt-chain canonical form for outcomes, treasury proposals, and cooldown lanes.

External Signal context is copied as `sourceSignal*` metadata only. It can support review context, but it cannot replace artifact or measurement evidence and cannot approve spend.

A Research Gate receipt is optional. When missing, the drafted Treasury proposal still starts in the `needs_gate` state and the outcome card flags it.

## Hardening Path

The next version should add:

- cooldown expiry and re-entry criteria,
- proposal quality scores before gate submission,
- a resilience-score threshold for autonomous-drafted proposals,
- a budget-bucket capacity check before any proposal can issue a packet,
- and an externally anchored receipt root.
