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

## Hardening Path

The next version should add:

- artifact links for each delivery,
- measured before and after values,
- Research Gate checks for each next claim,
- cooldown expiry and re-entry criteria,
- proposal quality scores before gate submission,
- and tamper-evident receipt hashes.
