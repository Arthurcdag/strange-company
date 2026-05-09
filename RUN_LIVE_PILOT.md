# Run Live Pilot

This is the daily operating loop for the manual paid pilot.

It applies to the satellite operator (Strange Works Studio), not to Strange Company itself. Strange Company stays sealed and does not run live autonomously in v0.

## Posture

- Customers are real US businesses.
- Money flows through a US LLC bank account.
- Invoices are sent through Stripe Hosted Invoice Page, created manually.
- The single source of truth for orders is the Google Sheet ledger.
- The public static site is a packet builder, not a payment system or private operator console.
- The private command center remains local/private until the Online Gate clears it.

## One-Time Setup

Complete every line in the **Operational launch** checklist before sending the first invoice:

- [ ] **US LLC formed.** Articles of organization filed in the chosen state. See [SBA business registration](https://www.sba.gov/business-guide/launch-your-business/register-your-business).
- [ ] **Responsible party identified.** The IRS requires a human responsible party for EIN control; a nominee or sealed autonomous system is not enough. See [IRS responsible parties](https://www.irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees).
- [ ] **EIN issued.** Apply through the IRS after entity formation: [IRS EIN](https://www.irs.gov/businesses/employer-identification-number).
- [ ] **Business bank account open.** Account is in the LLC name. Stripe payouts route here.
- [ ] **Stripe account active.** Verified for the LLC. Payouts wired. See [Stripe no-code payments](https://docs.stripe.com/payments/no-code) and [Stripe Hosted Invoice Page](https://docs.stripe.com/invoicing/hosted-invoice-page).
- [ ] **Support inbox monitored.** A real monitored inbox (`ops@strangeworks.studio` or replacement) checked daily.
- [ ] **Google Sheet ledger live.** Tabs: `Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents`. Required columns on every tab: `created_at`, `source`, `invoice_id`, `customer`, `contact`, `service`, `amount`, `status`, `stripe_invoice_url`, `delivery_due`, `notes`.
- [ ] **Intake route configured.** Use a Google Form bound to the Sheet for the first public route. Use an [Apps Script web app](https://developers.google.com/apps-script/guides/web) only for internal/sandbox append tests.
- [ ] **Public config updated.** `public-config.js` contains the real support inbox and Google Form URL.
- [ ] **Terms reviewed.** Date stamped in the Operations integration config.
- [ ] **Privacy notice reviewed.** Date stamped in the Operations integration config.
- [ ] **Integration config saved.** Support email, Sheet URL, Form URL or Apps Script URL, Stripe dashboard URL, prefix all set in the Operations console.
- [ ] **First customer invoice sent.** Confirms the loop end-to-end before scaling.

The Operations tab will hold the launch in **Launch incomplete** or **Integration incomplete** until the above is done.

## Daily Operating Loop

Run this once per workday until the pilot is on rails.

### 1. Review new requests
- Open the Sheet `Requests` tab.
- Check the support inbox.
- Check the Operations console for any rows submitted from the Order Desk.
- For each new request, confirm scope, customer, contact, and that no protected health data, credentials, or regulated source documents were sent.

### 2. Qualify the customer
- Confirm the customer is a real US business.
- Confirm the requested service is on the offer list (compliance proof sprint, template pack).
- If the request fails the data boundary, reply with the safe-data instructions and close the row as `Rejected`.

### 3. Create the Stripe invoice
- Log in to the Stripe dashboard.
- Create a Hosted Invoice for the customer with the agreed amount and service.
- Copy the hosted invoice URL.
- Paste the URL into the order row in the Operations console (`Stripe hosted invoice URL` field) and into the `stripe_invoice_url` column of the Sheet `Invoices` tab.
- Set the `Delivery due` date.
- Advance the order from `Draft` to `Sent`.

### 4. Track payment
- Stripe will email status updates.
- When the invoice settles, advance the order to `Paid`.
- Update the Sheet row: `status = Paid`, settlement date in `notes`.

### 5. Deliver
- Build the scoped proof packet.
- Send it through the support inbox (or a sharing route the customer has agreed to).
- Advance the order to `Delivered`.
- Update the Sheet `Delivery` tab with the delivery date.

### 6. Seal the receipt chain
- In the Decisions view, click **Seal chain**.
- This produces a tamper-evident local receipt for the day's state changes.

### 7. Log incidents (if any)
- Anything off-script - failed payment, scope dispute, data boundary breach, missing delivery - gets a row in the Sheet `Incidents` tab with `created_at`, severity, customer, summary, response.

## Weekly Review

- Reconcile the Sheet `Invoices` tab against Stripe.
- Confirm bank deposits match Stripe payouts.
- Re-read terms and privacy. If either changed, bump the `termsReviewedAt` / `privacyReviewedAt` dates in Operations.
- Spot-check that no order row contains payment credentials, card data, or regulated source documents.

## What Stays Manual In V0

- Stripe invoices are not auto-created.
- Sheet rows are written either by the operator or by the Google Form intake. Apps Script remains internal/sandbox until reviewed. The static site never holds payment data.
- Delivery is a human action.
- Refunds, disputes, and incidents are routed through the support inbox.

## What Triggers A Pause

Stop sending invoices and close the desk if any of the following happen:

- The bank account is frozen, restricted, or under review.
- Stripe flags the account or holds payouts.
- A request includes regulated data the operator did not solicit.
- The Sheet ledger is inaccessible or out of sync with Stripe.
- Terms or privacy require an unscheduled change.

Resume only after the offending item is recorded as an incident, fixed, and reviewed.

## References

- [SBA business registration](https://www.sba.gov/business-guide/launch-your-business/register-your-business)
- [IRS responsible parties](https://www.irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees)
- [IRS EIN](https://www.irs.gov/businesses/employer-identification-number)
- [Stripe no-code payments](https://docs.stripe.com/payments/no-code)
- [Stripe Hosted Invoice Page](https://docs.stripe.com/invoicing/hosted-invoice-page)
- [Google Apps Script web apps](https://developers.google.com/apps-script/guides/web)
- [Google Sheets append API](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append)
