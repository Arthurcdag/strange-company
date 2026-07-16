# Run Live Pilot

This is the daily operating loop for the manual paid pilot in Brazil.

It applies to the satellite operator (Strange Works Studio), not to Strange Company itself. Strange Company stays sealed and does not run live autonomously in v0.

## Posture

- Customers are real external buyers with a scoped low-risk request.
- Money flows through the Brazilian operator's reviewed bank/payment route.
- Fiscal handling uses the reviewed NFS-e or receipt path before paid operation.
- Payment requests are created manually. The static site never collects card data.
- The single source of truth for orders is the Google Sheet ledger plus the external payment/fiscal records.
- The public static site is a packet builder, not a payment system or private operator console.
- The private command center remains local/private until the Online Gate clears it.

## One-Time Setup

Complete every line in the **Operational launch** checklist before sending the first invoice:

- [ ] **Main legal procedure reviewed.** Use [LEGAL_PROCEDURE.md](LEGAL_PROCEDURE.md) to assemble the entity, EIN, BOI, tax/bookkeeping/payment, privacy/security/support, and professional-signoff evidence packet. This packet is required before the sealed Strange Company lane can claim live operation.
- [ ] **Draft filing packet prepared, not submitted.** Use [LEGAL_DRAFT_FILINGS.md](LEGAL_DRAFT_FILINGS.md) to fill draft-only worksheets outside the repo. Keep SSN, ITIN, bank credentials, payment credentials, and signatures out of git.
- [ ] **Legal filing dry run measured.** Use [LEGAL_FILING_EXPERIMENT.md](LEGAL_FILING_EXPERIMENT.md) to confirm the draft packet is reviewer-ready without submitting, signing, paying, filing, or entering sensitive identifiers.
- [ ] **Brazilian operator confirmed.** CNPJ or approved operating structure is chosen and recorded.
- [ ] **Responsible party identified.** A real human is responsible for tax, bank/payment, customer communication, support, privacy, and incident decisions.
- [ ] **Tax route reviewed.** Accountant confirms tax regime, CNAE, municipal registration needs, and the NFS-e or reviewed fiscal receipt process.
- [ ] **Business bank/payment account open.** Account is in the operator's name and can receive customer payments.
- [ ] **Payment processor route active.** Manual payment link/hosted invoice path, payout routing, refund path, and reconciliation cadence are understood.
- [x] **Support inbox monitored.** The pilot inbox `tuiidagnese+strangeworks@gmail.com` received a verification message and is checked through Gmail. Use `ops@strangeworks.studio` only after domain/MX/mailbox verification.
- [ ] **LGPD contact path ready.** Privacy/data-subject requests route to a responsible human.
- [ ] **Google Sheet ledger live.** Tabs: `Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents`, `Leads`. Required columns on operational tabs: `created_at`, `source`, `invoice_id`, `customer`, `contact`, `service`, `amount`, `status`, `stripe_invoice_url`, `delivery_due`, `notes`.
- [ ] **Intake route configured.** Use a Google Form bound to the Sheet for the first public route. Use an Apps Script web app only for internal/sandbox append tests until reviewed.
- [ ] **Pre-live public config updated.** `public-config.js` contains the real support inbox, Google Form URL, review dates, verified flags, `jurisdiction: "BR"`, and `liveMode: false`. Keep that snapshot unpublished through validation, receipt issuance, normal preflight, and status review.
- [ ] **Public receipt issued and pre-live checks pass.** Issue `public-live-receipt.js` with the bound five-packet exporter command in [OPERATOR_FAST_START.md](OPERATOR_FAST_START.md), then run `node tools/export_public_live_receipt.js --check-public-js --require-issued` and `node tools/preflight_public_launch.js` while `liveMode` is still `false`.
- [ ] **Separate human live flip and deployment preflight pass.** After the issued receipt and all blockers are reviewed, change only `liveMode` to `true` and run `node tools/preflight_public_launch.js --deployment` before merging or sending traffic.
- [ ] **Brazil functionality audit passes.** Run `node tools/audit_company_functionality.js --require-live` before publishing live intake.
- [ ] **Terms reviewed.** Date stamped in the Operations integration config.
- [ ] **Privacy notice reviewed.** Date stamped in the Operations integration config.
- [ ] **Integration config saved.** Support email, Sheet URL, Form URL or Apps Script URL, payment dashboard URL, prefix all set in the Operations console.
- [ ] **Revenue start packet issued.** Operations `Revenue start` board confirms the Strange Company sealed lane and the second company revenue lane before invoice work starts.
- [ ] **Safe test order completed.** Confirms request, payment/fiscal evidence, delivery, and receipt chain before scaling.

The Operations tab will hold the launch in **Launch incomplete** or **Integration incomplete** until the above is done.

If a gate fails after the human live flip, disable external Form responses
first. Capture and finish this sequence without rerunning status midway: run
`node tools/render_public_live_shutdown_patch.js`, apply only its blank Form
URL, false Form verification, and false live-mode values, revoke the receipt,
run deployment preflight and the public bundle check, publish the closed config
plus placeholder together, verify Pages remains closed, and only then rerun
status from the closed state before repairing or reissuing evidence.

## Daily Operating Loop

Run this once per workday until the pilot is on rails.

### 1. Review new requests

- Open the Sheet `Requests` tab.
- Check the support inbox.
- Check the Operations console for any rows submitted from the Order Desk.
- For each new request, confirm scope, customer, contact, and that no protected health data, credentials, secrets, sensitive personal data, or regulated source documents were sent.

### 2. Qualify the customer

- Confirm the customer is a real external buyer.
- Confirm the requested service is on the offer list (compliance proof sprint, template pack).
- Confirm whether the relationship is B2B or consumer-facing and whether consumer-law handling is needed.
- If the request fails the data boundary, reply with the safe-data instructions and close the row as `Rejected`.

### 3. Create the manual payment and fiscal packet

- Log in to the reviewed payment route.
- Create the manual payment request or hosted invoice for the customer with the agreed amount and service.
- Confirm whether NFS-e or another reviewed fiscal receipt must be issued now or after settlement.
- Copy the hosted payment/invoice URL.
- Paste the URL into the order row in the Operations console (`Stripe hosted invoice URL` field while the prototype still uses that column) and into the `stripe_invoice_url` column of the Sheet `Invoices` tab.
- Set the `Delivery due` date.
- Advance the order from `Draft` to `Sent`.

### 4. Track payment and fiscal evidence

- Monitor the payment provider.
- When the payment settles, advance the order to `Paid`.
- Update the Sheet row: `status = Paid`, settlement date and fiscal document status in `notes`.
- Reconcile payment provider, Sheet, Operations, and NFS-e/receipt evidence.

### 5. Deliver

- Build the scoped proof packet.
- Send it through the support inbox or a sharing route the customer has agreed to.
- Advance the order to `Delivered`.
- Update the Sheet `Delivery` tab with the delivery date.

### 6. Seal the receipt chain

- In the Decisions view, click **Seal chain**.
- This produces a local tamper-evident receipt for the day's state changes.

### 7. Log incidents

Anything off-script - failed payment, fiscal-document problem, refund/cancellation issue, privacy request, scope dispute, data boundary breach, missing delivery - gets a row in the Sheet `Incidents` tab with `created_at`, severity, customer, summary, response.

### 8. Run the daily pilot console

- Open Operations and press `Start run` at the beginning of the workday.
- Tick each checklist item as it completes: review requests, qualify customer, create manual payment request, update ledger, track payment, deliver, log incidents, seal chain.
- Flip any stop rule that applies during the day: payment hold, bank restricted, regulated-data submission, Sheet ledger outage, support inbox outage, terms or privacy change. While any stop rule is active the Operations console reads `Paused` and `Draft -> Sent` is blocked across all orders. Clear the rule when the underlying issue is fixed.
- Paste the ids of any incidents logged in step 7 into the `Incident ids` field on the run panel.
- At end of day press `Close run`. The console snapshots the current receipt-chain root, captures which orders moved during the run, and stores the result locally. The active run becomes a closed entry in the run history.

### 9. Issue or refresh the revenue start packet

- Use the Operations `Revenue start` board when day-one posture changes.
- Keep the Strange Company lane sealed and no-direct-invoice.
- Keep the second company lane tied to external setup evidence, manual payment requests, Sheet ledger, NFS-e/receipt evidence, support, delivery closeout, and incident handling.
- Copy the start packet into the operator record when it changes.

## Weekly Review

- Reconcile the Sheet `Invoices` tab against the payment provider and NFS-e/receipt records.
- Confirm bank deposits match payment-provider payouts.
- Re-read terms and privacy. If either changed, bump the `termsReviewedAt` / `privacyReviewedAt` dates in Operations.
- Spot-check that no order row contains payment credentials, card data, secrets, sensitive personal data, or regulated source documents.
- Review LGPD requests and incidents.

## What Stays Manual In V0

- Payment requests are not auto-created.
- NFS-e or fiscal receipts are not auto-issued.
- Sheet rows are written either by the operator or by the Google Form intake. Apps Script remains internal/sandbox until reviewed. The static site never holds payment data.
- Delivery is a human action.
- Refunds, cancellations, data-subject requests, disputes, and incidents are routed through the support inbox.

## What Triggers A Pause

Stop sending invoices and close the desk if any of the following happen:

- The entity/CNPJ route is uncertain.
- The NFS-e or fiscal receipt path is not ready.
- The bank/payment account is frozen, restricted, or under review.
- A request includes regulated data or sensitive personal data the operator did not solicit.
- The Sheet ledger is inaccessible or out of sync with payment/fiscal evidence.
- A privacy request cannot be answered.
- Terms or privacy require an unscheduled change.
- AI output is being used as final legal, tax, accounting, or compliance judgment.

Resume only after the offending item is recorded as an incident, fixed, and reviewed.

## References

- LGPD: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- ANPD privacy notice structure: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade
- Marco Civil da Internet: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- Brazilian Consumer Code: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- E-commerce decree: https://www.planalto.gov.br/ccivil_03/_Ato2011-2014/2013/Decreto/D7962.htm
- Google Apps Script web apps: https://developers.google.com/apps-script/guides/web
- Google Sheets append API: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
