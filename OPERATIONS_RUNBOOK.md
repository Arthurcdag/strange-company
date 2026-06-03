# Operations Runbook

This runbook turns the satellite company from a concept into a small manual operating loop. The current launch posture is Brazil-first: the repo may prepare evidence and drafts, but a human operator, accountant, lawyer, bank/payment provider, and public authority workflows must confirm the legal and fiscal setup.

The current loop is intentionally boring:

```text
order intent -> invoice packet -> payment confirmation -> scoped delivery -> receipt
```

Public requests can begin in the public Order Desk. The public page creates a copyable invoice request packet and email handoff without exposing the private command center. The local/private Operations console records qualified requests as draft orders.

## Operating Boundary

Strange Company remains sealed and non-distributive.

The operational business is the satellite company, currently named `Strange Works Studio` in the prototype. It can sell services and net profit only as a normal for-profit vendor with its own books, invoices, support route, LGPD route, fiscal evidence, and obligations.

## Before Taking Money

Do not mark an order as paid until these controls are real:

- Brazilian entity/CNPJ or approved operating route ready,
- tax regime and NFS-e or reviewed fiscal receipt route ready,
- payment route ready,
- bookkeeping lane ready,
- support inbox monitored,
- LGPD contact path ready,
- terms published,
- privacy notice published.

The command center enforces this by blocking `Sent -> Paid` while critical controls are open. `public-config.js` must also keep `liveMode: false` until Brazil setup evidence exists.

## Reviewer Answers

The satellite profit model is intentionally separate from real revenue evidence:

- `$4,092/month` is modeled net profit, not earned revenue.
- `6` proof-sprint buyers and `12` template-pack buyers are assumptions, not a waitlist.
- The three open critical satellite controls are `Written scope and deliverables`, `Invoices and bookkeeping lane`, and `Conflict disclosure review`.
- Owner is the `Satellite operator` / Strange Works Studio launch operator.
- Timeline is `Before first paid invoice`.

The private UI now shows owner, timeline, and evidence needed on both satellite transaction controls and operational controls so a reviewer can tell what remains open without interpreting the model math as revenue.

Use `Copy reviewer answer` in the Satellite view when an outside reviewer asks for the current explanation. The copied packet is a handoff summary only; it does not approve launch, close controls, or prove customer revenue.

## First Service

Start with the compliance proof sprint.

Scope:

- evidence inventory,
- compliance checklist cleanup,
- monthly proof packet,
- exception notes,
- renewal watchlist,
- exportable receipt.

Do not accept protected health information, payment credentials, passwords, sensitive personal data, secrets, or regulated source documents in v0.

## Daily Operating Loop

1. Add each promising customer intent as a private paid-pilot lead.
2. Qualify the lead and confirm the request fits the v0 data boundary.
3. Convert a qualified lead into an Operations order.
4. Generate the invoice/payment packet.
5. Send the packet manually through the real support or sales route.
6. Mark `Sent` after the payment request or hosted invoice is sent.
7. Mark `Paid` only after funds settle and the fiscal path is reconciled.
8. Mark `Delivered` only after acceptance criteria are met.
9. Seal the receipt chain after material state changes.

## Revenue Start Board

The private Operations view now includes a **Revenue start** board for the two-company launch posture.

The board has two lanes:

- **Strange Company lane** keeps the sealed company out of direct customer invoicing. It confirms the public/no-secret boundary, Online Gate review, treasury hold, and receipt-chain baseline.
- **Second company lane** starts the revenue-facing operator, Strange Works Studio. It confirms Brazil external setup evidence, first qualified lead, manual invoice/payment route, NFS-e or receipt route, daily pilot run, and delivery closeout.

Pressing `Issue start packet` records a local revenue-start packet and copies the day-one sequence. The packet snapshots the current lane tasks, blockers, readiness state, and next action so later checklist edits do not rewrite the copied record. The packet is a coordination receipt only. It is not legal formation, tax advice, accounting software, payment automation, fiscal-document issuance, or proof that external setup exists.

## Operational v1.5 - Setup Evidence and Customer Acquisition

Operational v1.5 layers two private panels onto the Operations console without changing the public surface:

- A **Setup Evidence** panel turns the launch checklist into operator-asserted proof. The Brazil-first slots (`entity`, `tax-regime`, `nfse`, `bank`, `payment`, `support-inbox`, `lgpd-contact`, `google-sheet`, `google-form`, `terms-review`, `privacy-review`) store a status (`missing`, `pending`, `verified`, `blocked`), an `https://` evidence URL, an optional `verifiedAt` timestamp, and an operator note. Notes are scanned for PHI, payment card data, credentials, SSNs, private keys, and API keys before they are saved. See [SETUP_EVIDENCE.md](SETUP_EVIDENCE.md).
- The **Launch Gate** view includes an **External live evidence** panel that reads `public-config.js`, lists the remaining public live-intake evidence gaps, and copies a live-evidence packet for the operator. It is a handoff aid, not external verification.
- A **Brazil Compliance Agents** panel turns those rows into AI-prepared, human-closed work queues for entity/CNPJ, tax/NFS-e, payment, support, LGPD/privacy, consumer terms, intake/ledger, and AI handoff review. Each queue copies a packet for the responsible human and names the evidence needed before live mode. See [BRAZIL_COMPLIANCE_AGENTS.md](BRAZIL_COMPLIANCE_AGENTS.md).
- An **Adaptive Operator Protocol** panel turns roadblocks, failed commands, customer objections, missing evidence, and unsafe boundary signals into damage-to-adaptation receipts. Each receipt is included in the local receipt chain, can be copied into a handoff, and can be routed into a no-spend execution packet. See [ADAPTIVE_OPERATOR_PROTOCOL.md](ADAPTIVE_OPERATOR_PROTOCOL.md).
- A **Customer Acquisition** panel surfaces the daily outreach target, a log of operator outreach attempts by source (`referral`, `email`, `form`, `direct`, `partner`), conversion counts for every sales lead stage, and a copyable outreach packet. The lead form on the same view now requires a source category. See [CUSTOMER_ACQUISITION.md](CUSTOMER_ACQUISITION.md).
- A **Growth Management** panel turns acquisition, pipeline, revenue-start, and readiness receipts into one next operator action. It never sends outreach, approves spend, or overrides legal/payment gates. See [GROWTH_MANAGEMENT.md](GROWTH_MANAGEMENT.md).

### Adaptive Operator Protocol

Use the adaptive panel when the current path fails or becomes unsafe. The operator records what happened, what it revealed, the next smallest safe countermeasure, the routing lane, and the next evolution if the countermeasure fails.

Adaptive receipts can create a stronger handoff, a narrower experiment, or a resilience hardening task. They cannot bypass `public-config.js`, professional review, Brazil compliance, LGPD duties, fiscal obligations, support readiness, payment controls, or evidence requirements.

Use `Route` when the receipt has a concrete countermeasure. The route creates a private execution packet, marks the receipt as `routed`, and creates a cooldown lane for weak experiment or customer objection routes.

### Profit Readiness Gate

The Profit Readiness card now requires verified setup evidence before it can leave amber. `externalSetupReady` is the AND of:

- every Setup Evidence row at status `verified`,
- every critical commercial control closed,
- every Operational launch item complete.

If any of those is open, the readiness card stays out of `Sell today` / `Invoice ready` / `Profit proving` and the blockers list names the exact missing rows by label (`unverified evidence: NFS-e or fiscal receipt route`, `unverified evidence: LGPD contact path`, etc.). UI checkboxes alone never declare the company sell-ready.

### Repo Boundary

The repo cannot certify that the second company is legally operational. It tracks readiness and workflow; the operator confirms the outside-the-repo artifacts. If an operator marks a row `verified` without real evidence, the receipt chain records the assertion but the assertion remains operator-asserted, not system-certified.

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
- `Invoice packet` copies manual payment/invoice instructions. The current prototype field still says Stripe URL, but the Brazil gate requires the reviewed payment and fiscal route to reconcile before launch.
- `Copy row` copies a row for the optional Google Sheet `Leads` tab.
- The pipeline header copy icon copies all lead rows as TSV.
- Closed daily runs can copy a closeout summary for the support/accounting record.

The panel reports whether the satellite can sell today from four gates: external setup, public intake config, qualified customer pipeline, and operational order lifecycle. It also reports current external-only profit, collected MRR, and remaining compliance proof sprint customers needed for `R$3K` and `R$5K` monthly net profit. Related-party work never counts as market proof.

## Daily Pilot Run Console

The Operations view has a `Daily pilot run` panel that captures one workday of the manual loop as a single private receipt.

The operator presses `Start run` once per day. While the run is open, the panel surfaces:

- checklist items for reviewing requests, qualifying customers, creating the manual payment request, updating the ledger, tracking payment, delivering, logging incidents, and sealing the chain;
- stop-rule toggles for payment holds, bank restrictions, fiscal-route blocks, regulated/sensitive-data submissions, Sheet outages, support inbox outages, and terms or privacy changes;
- a live list of orders whose `updatedAt` is later than the run's `startedAt`;
- a field for incident ids touched during the run.

Any active stop rule turns Operations to `Paused` and blocks `Draft -> Sent`. It does not approve or reject spending, does not replace the Google Sheet ledger, does not issue NFS-e, and does not automate payment. Existing draft metadata can still be edited, but no new invoice can be marked sent until the stop rule clears.

Pressing `Close run` snapshots the current receipt-chain root, stores the completed checks, active stop rules, touched orders, and linked incidents, then clears the active run. Closed runs are local operator receipts, not accounting records or autonomous authority.

## Order Lifecycle Receipts

Every order state transition is now stamped with a timestamp and gated by evidence:

- `Draft -> Sent` requires a reviewed hosted payment/invoice URL pasted on the order. The current field is named `Stripe Hosted Invoice URL`, but the Brazil gate additionally requires payment/fiscal route evidence before live operation. The transition stamps `invoiceSentAt`.
- `Sent -> Paid` requires every critical commercial control to be closed. The transition stamps `paidAt`.
- `Paid -> Delivered` requires an `https://` delivery artifact URL and an acceptance note on the order. The acceptance note is scanned for PHI, payment card data, secrets, and private key material; rows that flag are blocked. The transition stamps `deliveredAt`.

The order card shows the timeline (`Sent / Paid / Delivered` with dates), the artifact link, the acceptance note, and any linked incidents. The advance button is disabled and the block reason is rendered inline whenever one of these conditions is unmet.

The receipt-chain canonical form now carries `invoiceSentAt`, `paidAt`, `deliveredAt`, `deliveryArtifactUrl`, `acceptanceNote`, and `incidentIds` on every Order receipt. Sealing the chain after a transition preserves the proof that the gate was satisfied.

### Receipt Chain Timeline Panel

Every order card includes a collapsed `Receipt chain timeline` panel under the action buttons. Expanding it reveals every state transition recorded for that order in chronological order. Each event shows:

- the timestamp,
- the actor that produced the transition,
- the state transition itself,
- attached evidence and metadata (invoice number, service, amount, payment URL, delivery due date, delivery artifact link, acceptance note, block reason, incident severity, status, summary, and response).

Linked incidents contribute both their `created` and `updated` transitions so that severity and status changes are visible inside the order's audit trail. The panel reads directly from the same local state that feeds the receipt chain, so the events shown match what a `Seal chain` press would canonicalize.

## Incidents

Every order card has a `Log incident` button. The form captures:

- severity (`info`, `low`, `medium`, `high`),
- status (`open`, `mitigating`, `resolved`, `closed`),
- a summary,
- and the operator response.

Submission is blocked if either text field is empty or if the sensitive-data scan flags PHI, payment card data, secrets, or private key material. Accepted incidents are stored locally, linked back to the order via `incidentIds`, and emit a dedicated `Incident` receipt in the decision and audit chain. `high open` and `high mitigating` incidents render red in the chain to make them obvious in the audit surface.

Refunds, disputes, privacy requests, regulated-data submissions, Sheet outages, fiscal-route failures, and payment holds should all become incidents before they become quiet operator memory.

## Weekly Operating Loop

- Reconcile invoices against the bookkeeping ledger, payment provider, bank deposits, and NFS-e/receipt evidence.
- Review support messages, privacy requests, and incidents.
- Review customer delivery evidence.
- Update the Satellite Company service mix.
- Move recurring work into execution packets or automation only after human review.

## Functional Definition

The satellite is operational when:

- at least one order can move from draft to sent,
- all critical commercial controls are closed,
- a payment can be reconciled,
- a fiscal document/receipt route can be reconciled where required,
- a scoped proof packet can be delivered,
- the receipt chain records the order state.

Strange Company is live only after the Online Gate clears its separate legal, trust, payment, support, and public-risk requirements.

## Operational V1

Operational v1 is the real Brazil manual paid pilot. It moves the loop above onto real external systems:

- Brazilian operator/CNPJ or approved operating structure, accountant-reviewed tax route, NFS-e or reviewed fiscal receipt process, business bank/payment account, and active payment provider route.
- A monitored support inbox.
- LGPD contact path for data-subject and privacy requests.
- A Google Sheet ledger with `Requests`, `Invoices`, `Customers`, `Delivery`, and `Incidents` tabs sharing the columns `created_at`, `source`, `invoice_id`, `customer`, `contact`, `service`, `amount`, `status`, `stripe_invoice_url`, `delivery_due`, `notes`.
- A Google Form intake for the first public route. Apps Script remains an internal/sandbox append template until access and abuse controls are reviewed.
- Manual payment or hosted invoice requests for every payment. The static site never collects card data.
- Human review of AI-generated legal, tax, privacy, refund, cancellation, incident, and customer-rights decisions.

The Operations tab tracks this as the **Operational launch** checklist and the **Integration config** panel. The exact daily loop for v1 is in [RUN_LIVE_PILOT.md](RUN_LIVE_PILOT.md).
