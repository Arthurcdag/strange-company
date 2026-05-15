# Revenue Start

This file defines the day-one revenue posture for the two-company operating model.

The private Operations console now has a **Revenue start** board. It does not create a legal entity, move money, automate Stripe, or certify outside-the-repo facts. It creates an operator receipt that separates the sealed Strange Company lane from the revenue-facing second company lane.

Issued start packets snapshot the lane checklist, blockers, readiness state, and next action at the moment of issue. Later checklist edits create new state, but they do not rewrite the packet an operator already copied into the operating record.

## Strange Company Lane

Strange Company stays sealed during the first paid pilot.

Required posture:

- no direct customer invoices from Strange Company;
- no customer-private data, payment data, credentials, or sealed governance material in the public repo;
- Online Gate reviewed before any public or commercial claim;
- treasury movement stays behind the Research Gate and receipt chain;
- material state changes are sealed after the operator issues the start packet.

This lane can operate the command system, reviews, gates, receipts, and treasury simulation. It does not take the first customer payment.

## Second Company Lane

The second company is the revenue-facing operator, named `Strange Works Studio` in the prototype.

Required posture:

- operator-verified setup evidence for entity, EIN, bank, Stripe, support, Sheet/Form route, terms, and privacy;
- at least one qualified external lead with a scoped request;
- manual Stripe Hosted Invoice route ready;
- Google Sheet ledger ready as the order source of truth;
- Daily pilot run started before invoice work;
- delivery artifact, acceptance note, incident route, and receipt-chain seal included in closeout.

Related-party work is not counted as market proof. External customer revenue must come first.

## Day-One Sequence

1. Open Operations and review Profit readiness.
2. Complete the Strange Company lane tasks on the Revenue start board.
3. Complete the second company lane tasks only after checking outside evidence.
4. Issue the start packet.
5. Add or qualify the first external lead in the Paid pilot pipeline.
6. Convert the qualified lead into an order.
7. Create the Stripe Hosted Invoice manually and paste the hosted invoice URL into the order and Sheet ledger.
8. Move `Draft -> Sent` only after the invoice is actually sent.
9. Move `Sent -> Paid` only after settlement and open controls are closed.
10. Deliver the scoped proof packet, attach an `https://` artifact URL, record acceptance, close the daily run, and seal the receipt chain.

## Official Reference Anchors

These are starting points for the operator and counsel/accounting review, not a substitute for that review:

- SBA business registration: https://www.sba.gov/business-guide/launch-your-business/register-your-business
- IRS EIN: https://www.irs.gov/businesses/employer-identification-number
- IRS responsible parties and nominees: https://www.irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees
- Stripe Hosted Invoice Page: https://docs.stripe.com/invoicing/hosted-invoice-page
