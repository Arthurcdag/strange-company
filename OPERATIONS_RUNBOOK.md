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

1. Add each promising customer intent as a private paid-pilot lead.
2. Qualify the lead and confirm the request fits the v0 data boundary.
3. Convert a qualified lead into an Operations order.
4. Generate the invoice packet.
5. Send the packet manually through the real support or sales route.
6. Mark `Sent` after the invoice is sent.
7. Mark `Paid` only after funds settle.
8. Mark `Delivered` only after acceptance criteria are met.
9. Seal the receipt chain after material state changes.

## Paid Pilot Profit Readiness

The private Operations view has a `Profit readiness` panel and a `Paid pilot pipeline` section. Together they are the manual path from prospect to first paid customer.

Lead stages are:

- `prospect`,
- `qualified`,
- `invoice_ready`,
- `invoice_sent`,
- `paid`,
- `delivered`,
- `rejected`.

A lead stores the customer, contact, service, amount, source, need, qualification note, rejection reason, and linked order id. Lead notes are scanned for PHI, payment card data, credentials, private keys, SSNs, API keys, and customer-private records before they are saved or converted.

Qualified or invoice-ready leads can be converted into Operations orders without retyping the customer, contact, service, amount, or notes. After conversion, the linked lead follows the order lifecycle: `Draft` maps to `invoice_ready`, `Sent` maps to `invoice_sent`, `Paid` maps to `paid`, and `Delivered` maps to `delivered`.

Copy actions support the human loop:

- `Qualification` copies a qualification packet for operator review.
- `Invoice packet` copies manual Stripe Hosted Invoice instructions.
- `Copy row` copies a row for the optional Google Sheet `Leads` tab.
- The pipeline header copy icon copies all lead rows as TSV.
- Closed daily runs can copy a closeout summary for the support/accounting record.

The panel reports whether the satellite can sell today from four gates: external setup, public intake config, qualified customer pipeline, and operational order lifecycle. It also reports current external-only profit, collected MRR, and remaining compliance proof sprint customers needed for `$3K` and `$5K` monthly net profit. Related-party work never counts as market proof.

## Daily Pilot Run Console

The Operations view has a `Daily pilot run` panel that captures one workday of the manual loop as a single private receipt.

The operator presses `Start run` once per day. While the run is open, the panel surfaces:

- checklist items for reviewing requests, qualifying customers, creating the Stripe invoice, updating the ledger, tracking payment, delivering, logging incidents, and sealing the chain;
- stop-rule toggles for Stripe holds, bank restrictions, regulated-data submissions, Sheet outages, support inbox outages, and terms or privacy changes;
- a live list of orders whose `updatedAt` is later than the run's `startedAt`;
- a field for incident ids touched during the run.

Any active stop rule turns Operations to `Paused` and blocks `Draft -> Sent`. It does not approve or reject spending, does not replace the Google Sheet ledger, and does not automate Stripe. Existing draft metadata can still be edited, but no new invoice can be marked sent until the stop rule clears.

Pressing `Close run` snapshots the current receipt-chain root, stores the completed checks, active stop rules, touched orders, and linked incidents, then clears the active run. Closed runs are local operator receipts, not accounting records or autonomous authority.

## Order Lifecycle Receipts

Every order state transition is now stamped with a timestamp and gated by evidence:

- `Draft -> Sent` requires a Stripe Hosted Invoice URL pasted on the order. The transition stamps `invoiceSentAt`.
- `Sent -> Paid` requires every critical commercial control to be closed. The transition stamps `paidAt`.
- `Paid -> Delivered` requires an `https://` delivery artifact URL and an acceptance note on the order. The acceptance note is scanned for PHI, payment card data, secrets, and private key material; rows that flag are blocked. The transition stamps `deliveredAt`.

The order card shows the timeline (`Sent / Paid / Delivered` with dates), the artifact link, the acceptance note, and any linked incidents. The advance button is disabled and the block reason is rendered inline whenever one of these conditions is unmet.

The receipt-chain canonical form now carries `invoiceSentAt`, `paidAt`, `deliveredAt`, `deliveryArtifactUrl`, `acceptanceNote`, and `incidentIds` on every Order receipt. Sealing the chain after a transition preserves the proof that the gate was satisfied.

### Receipt Chain Timeline Panel

Every order card includes a collapsed `Receipt chain timeline` panel under the action buttons. Expanding it reveals every state transition recorded for that order in chronological order. Each event shows:

- the timestamp,
- the actor that produced the transition (intake source for `Created → Draft`, `Operations console` for advance actions),
- the state transition itself (`Draft → Sent`, `Sent → Paid`, `Paid → Delivered`, `Blocked at <stage>`, or an incident transition),
- attached evidence and metadata (invoice number, service, amount, Stripe URL, delivery due date, delivery artifact link, acceptance note, block reason, incident severity, status, summary, and response).

Linked incidents contribute both their `created` and `updated` transitions so that severity and status changes are visible inside the order's audit trail. The panel reads directly from the same local state that feeds the receipt chain, so the events shown match what a `Seal chain` press would canonicalize.

## Incidents

Every order card has a `Log incident` button. The form captures:

- severity (`info`, `low`, `medium`, `high`),
- status (`open`, `mitigating`, `resolved`, `closed`),
- a summary,
- and the operator response.

Submission is blocked if either text field is empty or if the sensitive-data scan flags PHI, payment card data, secrets, or private key material. Accepted incidents are stored locally, linked back to the order via `incidentIds`, and emit a dedicated `Incident` receipt in the decision and audit chain. `high open` and `high mitigating` incidents render red in the chain to make them obvious in the audit surface.

Refunds, disputes, regulated-data submissions, Sheet outages, and Stripe holds should all become incidents before they become quiet operator memory.

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
