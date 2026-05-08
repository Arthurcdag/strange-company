# Strange Company Capital Router

The capital router turns outcome receipts into the next possible capital move.

Core rule:

```text
Outcome receipts may draft routes, but they may not approve spend.
```

## Routes

`scale` outcomes draft a capped follow-on treasury proposal.

`revise` outcomes draft a smaller proposal for measurement, scope repair, or evidence collection.

`kill` outcomes cool down the weak spend lane for two cycles.

## Approval Boundary

The router is not the treasury.

A drafted proposal still needs:

- a Research Gate receipt,
- treasury approval,
- budget availability,
- and an execution packet before capital can leave the company.

This keeps the company adaptive without letting any single receipt become an unchecked spending authority.

## Prototype Behavior

The Experiments view now exposes routing actions on outcome receipts.

The Treasury view now shows cooled spend lanes in the capital firewall.

The Decisions view now records routing events beside outcomes, packets, gate checks, and treasury approvals.
