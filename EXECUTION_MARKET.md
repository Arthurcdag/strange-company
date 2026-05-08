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

## Next Evolution

The next layer is to require evidence attachments for every outcome receipt:

- delivery artifact,
- measured result,
- next claim,
- Research Gate receipt,
- and budget route.
