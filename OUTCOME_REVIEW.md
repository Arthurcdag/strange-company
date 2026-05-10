# Outcome Evidence Review

Strange Company now has a private review receipt between outcome creation and capital routing.

Core rule:

```text
An outcome receipt can exist before review, but it cannot route capital until review is approved.
```

## Review Gate

The review gate checks that an outcome still has:

- an `https://` delivery artifact,
- measured before and measured after values,
- a single next claim,
- no obvious sensitive data,
- a valid Research Gate receipt when one is referenced,
- and a valid routed, boundary-confirmed External Signal when one is attached.

If any check fails, the route button stays blocked and the review receipt is rejected.

## Operator Receipt

The private Experiments view shows an evidence review note box beside each unrouted outcome.

The operator can:

- approve review,
- reject review,
- or leave the outcome pending.

Review notes are scanned for sensitive data. If a note contains protected health information, credentials, keys, payment-card-like numbers, or similar obvious secrets, the review is rejected and no sensitive text is copied into the route.

## Routing Effect

Approved review is required before:

- a `scale` outcome drafts a Treasury proposal,
- a `revise` outcome drafts a revision proposal,
- or a `kill` outcome cools a spend lane.

The review receipt is copied forward as `evidenceReviewId` and `evidenceReviewNote`. It supports accountability only. It does not approve spend, replace the Research Gate, or create public payment behavior.

## Receipt Chain

Outcome reviews are material events in the local receipt chain.

The chain records:

- review id,
- outcome id,
- decision,
- blockers,
- review note,
- and optional attached signal metadata.

This makes the route history auditable: delivery evidence, signal context, operator review, Treasury draft, cooldown action, and seal state can all be compared after the chain is sealed.
