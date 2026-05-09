# Operations Runbook

This runbook turns the satellite company from a concept into a small manual operating loop.

The current loop is intentionally boring:

```text
order intent -> invoice packet -> payment confirmation -> scoped delivery -> receipt
```

Public requests can begin in the Order Desk. The Order Desk creates the same draft order and invoice packet used by the internal Operations console, then prepares an email handoff for manual review.

## Operating Boundary

Strange Company remains sealed and non-distributive.

The operational business is the satellite company, currently named `Strange Works Studio` in the prototype. It can sell services and net profit only as a normal for-profit vendor with its own books, invoices, support route, and obligations.

## Before Taking Money

Do not mark an order as paid until these controls are real:

- entity and tax identity ready,
- payment route ready,
- bookkeeping lane ready,
- support inbox monitored,
- terms published,
- privacy notice published.

The command center enforces this by blocking `Sent -> Paid` while critical controls are open.

## First Service

Start with the compliance proof sprint.

Scope:

- evidence inventory,
- compliance checklist cleanup,
- monthly proof packet,
- exception notes,
- renewal watchlist,
- exportable receipt.

Do not accept protected health information, payment credentials, passwords, or regulated source documents in v0.

## Daily Operating Loop

1. Add each customer intent in the Operations tab.
2. Generate the invoice packet.
3. Send the packet manually through the real support or sales route.
4. Mark `Sent` after the invoice is sent.
5. Mark `Paid` only after funds settle.
6. Mark `Delivered` only after acceptance criteria are met.
7. Seal the receipt chain after material state changes.

## Weekly Operating Loop

- Reconcile invoices against the bookkeeping ledger.
- Review support messages and incidents.
- Review customer delivery evidence.
- Update the Satellite Company service mix.
- Move recurring work into execution packets or automation.

## Functional Definition

The satellite is operational when:

- at least one order can move from draft to sent,
- all critical commercial controls are closed,
- a payment can be reconciled,
- a scoped proof packet can be delivered,
- the receipt chain records the order state.

Strange Company is live only after the Online Gate clears its separate legal, trust, payment, support, and public-risk requirements.

## Operational V1

Operational v1 is the real US manual paid pilot. It moves the loop above onto real external systems:

- US LLC, EIN, business bank account, and a Stripe account active for the LLC.
- A monitored support inbox.
- A Google Sheet ledger with `Requests`, `Invoices`, `Customers`, `Delivery`, and `Incidents` tabs sharing the columns `created_at`, `source`, `invoice_id`, `customer`, `contact`, `service`, `amount`, `status`, `stripe_invoice_url`, `delivery_due`, `notes`.
- A Google Form or Apps Script web app intake that writes sanitized rows into that Sheet.
- Manual Stripe Hosted Invoices for every payment. The static site never collects card data.

The Operations tab tracks this as the **Operational launch** checklist and the **Integration config** panel. The exact daily loop for v1 is in [RUN_LIVE_PILOT.md](RUN_LIVE_PILOT.md).
