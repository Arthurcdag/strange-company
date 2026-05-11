# Operations Runbook

This runbook turns the satellite company from a concept into a small manual operating loop.

The current loop is intentionally boring:

```text
order intent -> invoice packet -> payment confirmation -> scoped delivery -> receipt
```

Public requests can begin in the public Order Desk. The public page creates a copyable invoice request packet and email handoff without exposing the private command center. The local/private Operations console records qualified requests as draft orders.

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

## Daily Pilot Run Console

The Operations view has a `Daily pilot run` panel that captures one workday of the loop as a single receipt.

The operator presses `Start run` once per day. While the run is open, the panel surfaces:

- A checklist for review-requests, qualify-customer, create-Stripe-invoice, update-ledger, track-payment, deliver, log-incidents, and seal-chain. Each item can be ticked independently; tick state is local until the run is closed.
- Stop-rule toggles for Stripe hold, business bank restricted, regulated-data submitted, Sheet ledger outage, support-inbox outage, and terms-or-privacy change. Any active stop rule paints the panel red, sets the Operations console state to `Paused`, and blocks `Draft -> Sent` transitions for new orders. Active drafts can still receive Stripe URLs and acceptance notes, but no new invoices may be marked sent until the stop rule clears.
- A live list of orders whose `updatedAt` is later than the run's `startedAt`. This is captured as `orderIds` when the run closes.
- A freeform textarea for incident ids. Operators paste the ids of incidents the run touched, comma or whitespace separated. The ids are persisted on close.

Pressing `Close run` snapshots the current receipt-chain root (the same root `Seal chain` would record), copies the checklist state and active stop rules into a history entry, and clears the active run. Closed runs are immutable in the local store. The receipt chain carries a `Run` receipt for the active run (state `Active` or `Paused`) and one for every closed run (state `Closed clean` or `Closed with stop rules`), so the audit surface preserves both the in-progress and historical views.

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
- A Google Form intake for the first public route. Apps Script remains an internal/sandbox append template until access and abuse controls are reviewed.
- Manual Stripe Hosted Invoices for every payment. The static site never collects card data.

The Operations tab tracks this as the **Operational launch** checklist and the **Integration config** panel. The exact daily loop for v1 is in [RUN_LIVE_PILOT.md](RUN_LIVE_PILOT.md).
