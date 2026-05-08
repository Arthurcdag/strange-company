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
- satellite profit layer separated from the sealed company.

### Live Operation

The company may operate as a real public business.

Required:

- external legal review,
- accounting and tax review,
- privacy and support paths,
- incident communication process,
- payment blockers cleared,
- satellite transaction controls closed,
- payment and data recovery rehearsal.

The current prototype should not claim this phase by itself.

## Prototype Behavior

The Online Gate view now computes the recommended launch phase from local receipts.

It can draft a private sandbox launch packet. That packet must move through the Execution Market and reach `Delivered` before private sandbox launch is allowed.

The Decisions view records Online Gate checks.

GitHub Pages deployment is allowed only for the static prototype surface. It does not mean the company is commercially live.
