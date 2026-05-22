# Strange Company Resilience Drills

The company now tests its immune system with repeatable attack drills.

Core rule:

```text
Every serious weakness must become a hardening packet.
```

## Drill Loop

```text
Threat scenario
-> Drill run
-> Pass or weak receipt
-> Decision log
-> Hardening packet when weak
-> Execution market
```

## Current Drill Classes

- Governance capture: signer or guardian attempts to bypass the charter.
- Vendor lock-in: a critical provider traps data, pricing, or access.
- Claim laundering: a weak growth claim is disguised as a safety claim.
- Data loss: audit records become unavailable during proof export.

## Packet Boundary

A weak drill can issue an execution packet, but it cannot select a vendor, approve payment, or mark the fix delivered.

The Execution Market still handles scoped work and acceptance criteria.

## Prototype Behavior

The Resilience view now contains:

- drill metrics,
- drill receipts,
- per-drill run controls,
- hardening packet creation for weak drills,
- and a resilience score that changes as drills run and packets are issued.

The Decisions view records drill results, and the Bounties view receives hardening packets.

## Repo Survival Check

Run the repo-level survival drill before claiming the company can survive a launch attempt:

```bash
node tools/survival_check.js
```

The script passes when the guarded prototype survives: public/private separation holds, the charter and resilience model still exist, receipt-chain and hardening-packet code is present, Brazil/AI legal gates remain documented, normal audits pass, and `--require-live` fails while external evidence is missing.
