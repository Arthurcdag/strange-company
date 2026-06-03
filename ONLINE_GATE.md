# Strange Company Online Gate

The Online Gate decides when the company can leave local prototype mode.

Core rule:

```text
Do not turn the company online until the launch phase has passed its blockers.
```

Exception:

```text
A static public prototype may be published for inspection if it accepts no payments, signs no customers, and makes no live-operation claim.
```

Operational V1.1 narrows that exception: GitHub Pages publishes the public Order Desk and documents only. The private command center is not the public homepage.

## Launch Phases

### Offline Prototype

Local design, simulation, and internal operator testing only.

This is the default state.

### Private Sandbox

The company may go online behind private access.

Allowed:

- private URL,
- test users,
- no public payments,
- no uncapped autonomous spend,
- visible rollback route.

Required:

- Research Gate reachable,
- charter and treasury rules present,
- private sandbox launch kit delivered.

### Public Beta

The company may accept public attention or a waitlist while capital movement remains capped.

Required:

- at least one live gate receipt,
- at least two attack drills,
- no weak drill without a hardening packet,
- at least one routed outcome,
- at least one revenue pilot commitment,
- hardening work in the execution market,
- satellite profit layer separated from the sealed company,
- operations console has at least one customer intake record.

### Live Operation

The company may operate as a real public business.

Required:

- `LEGAL_PROCEDURE.md` evidence packet generated and reviewed,
- state legal existence, registered agent, and jurisdiction review confirmed outside the repo,
- EIN and human responsible party confirmed outside the repo,
- BOI determination checked against current FinCEN guidance,
- accounting, tax, invoice, bank, payment, and reconciliation lane reviewed,
- privacy, data-security, support, and incident communication process reviewed,
- external legal and accounting signoff recorded,
- payment blockers cleared,
- satellite transaction controls closed,
- operations controls closed,
- payment and data recovery rehearsal.

The current prototype should not claim this phase by itself.

The Launch Gate can copy a legal procedure packet. That packet is a handoff checklist, not a legal filing, compliance certificate, tax opinion, or proof that live operation is allowed.

The Launch Gate can also copy a draft filing packet from `LEGAL_DRAFT_FILINGS.md`. Draft filing mode is useful preparation, but it must read as `not submitted` and cannot close the Live Operation blockers by itself.

The Launch Gate tracks the legal filing dry run from `LEGAL_FILING_EXPERIMENT.md`. A successful dry run means the packet is ready for review, not that the company is ready for live operation.

The Launch Gate differentiates four modes: `Demand` blocks, `Draft` prepares, `Experiment` measures, and outside `Evidence` can close a blocker only after review.

The Launch Gate also renders a try matrix for formation-state, entity-type, responsible-party, BOI, data-minimization, and reviewer-question branches. These branches are experiments, not selected legal positions.

## Prototype Behavior

The Online Gate view now computes the recommended launch phase from local receipts.

It can draft a private sandbox launch packet. That packet must move through the Execution Market and reach `Delivered` before private sandbox launch is allowed.

The Decisions view records Online Gate checks.

GitHub Pages deployment is allowed only for the public request and documentation surface. It does not mean the company is commercially live, and it must not expose the private Operations, Treasury, or Decisions console as the homepage.
