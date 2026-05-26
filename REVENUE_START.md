# Revenue Start

This file defines the day-one revenue posture for the two-company operating model in Brazil.

The private Operations console now has a **Revenue start** board. It does not create a legal entity, move money, issue NFS-e, automate payment, or certify outside-the-repo facts. It creates an operator receipt that separates the sealed Strange Company lane from the revenue-facing second company lane.

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

- operator-verified setup evidence for Brazilian entity/CNPJ or approved operating route, tax regime/CNAE, NFS-e or fiscal receipt route, bank/payment, support, LGPD contact, Sheet/Form route, terms, and privacy;
- at least one qualified external lead with a scoped request;
- manual payment or hosted invoice route ready;
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
7. Create the manual payment request or hosted invoice and confirm the NFS-e/receipt step.
8. Paste the hosted payment/invoice URL into the order and Sheet ledger.
9. Move `Draft -> Sent` only after the payment request is actually sent.
10. Move `Sent -> Paid` only after settlement, fiscal evidence, and open controls are reconciled.
11. Deliver the scoped proof packet, attach an `https://` artifact URL, record acceptance, close the daily run, and seal the receipt chain.

## Official Reference Anchors

These are starting points for the operator and counsel/accounting review, not a substitute for that review:

- Brazil compliance gate: [BRAZIL_COMPLIANCE.md](BRAZIL_COMPLIANCE.md)
- AI legal handoff: [AI_LEGAL_HANDOFF.md](AI_LEGAL_HANDOFF.md)
- LGPD: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- Brazilian Consumer Code: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- E-commerce decree: https://www.planalto.gov.br/ccivil_03/_Ato2011-2014/2013/Decreto/D7962.htm
