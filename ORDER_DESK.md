# Order Desk

The Order Desk is the public request surface for the satellite company.

It is intentionally simple:

```text
request -> invoice packet -> email handoff -> manual review -> operations ledger
```

## What It Does

The Order Desk creates a local invoice request packet and records it in the Operations ledger as a draft order.

It can also open a prefilled email draft to the support route.

## What It Does Not Do

The Order Desk does not:

- collect payment,
- guarantee acceptance,
- create a legal contract by itself,
- accept protected health information,
- accept credentials, payment data, private keys, or regulated source documents,
- bypass the Operations controls.

## Required Handoff

Before money is accepted, the operator must verify:

- the request is scoped,
- the customer accepted the data boundary,
- the terms and privacy notice are visible,
- the real support inbox exists,
- the payment and bookkeeping route exists,
- the invoice is sent manually through the approved route.

## Current Functional State

The static site can now:

- accept a request locally,
- create an invoice number,
- generate a packet,
- open an email handoff,
- record the request in the Operations ledger,
- post a sanitized request to a configured Google Apps Script web app,
- open a prefilled Google Form intake when the form URL is set,
- expose links to the Google Sheet ledger and the Stripe dashboard,
- include the order in the receipt chain.

That makes the software operational for a manual v0 workflow. It does not replace forming the actual satellite entity, bank route, support inbox, Sheet ledger, Stripe account, or bookkeeping process.

## Operational V1 Handoff

Operational v1 binds the Order Desk to real external systems:

- the Google Sheet ledger is the source of truth (`Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents` tabs),
- a Google Form or Apps Script web app appends sanitized rows to that Sheet,
- Stripe Hosted Invoices are created manually from the dashboard,
- the static site never collects card data and never auto-charges.

See [RUN_LIVE_PILOT.md](RUN_LIVE_PILOT.md) for the daily operating loop.
