# Operations Start Packet

Date: 2026-05-17

Purpose: start Strange Works Studio operations without pretending Strange Company itself is live-autonomous.

Current state:

- The public static Order Desk is deployed at `https://arthurcdag.github.io/strange-company/`.
- The public desk is still in packet-only mode.
- The private Operations console exists in `index.html` and remains local/private.
- `node tools/preflight_public_launch.js` passes.
- `node tools/audit_company_functionality.js --require-live` fails by design until external controls are verified.

ASAP interpretation:

- Strange Company main is already online only as a static public prototype.
- Strange Works Studio is the satellite lane that can become commercially live first.
- The satellite stays packet-only until real support, intake, ledger, payment, terms, privacy, and bank evidence exists.
- Use [ONLINE_ASAP.md](ONLINE_ASAP.md) before editing `public-config.js`.

Live-operation blockers:

- `public-config.js liveMode` is `false`.
- Support inbox is not verified.
- Google Form route is not verified.
- Google Form URL is blank.
- Terms review date is blank.
- Privacy review date is blank.

Do not flip `liveMode` until every blocker below has evidence.

## Start Sequence

### 1. Form The Operating Boundary

- [ ] Confirm the operating entity for Strange Works Studio.
- [ ] Confirm the responsible human party for tax, bank, Stripe, support, and customer communications.
- [ ] Keep Strange Company sealed: no direct customer invoices, no public treasury action, no autonomous public operation.

Output evidence:

- [ ] Entity name.
- [ ] Responsible party name in the private operator record.
- [ ] Decision receipt saying Strange Company remains sealed and Strange Works Studio is the revenue-facing operator.

### 2. Create The External Operating Routes

- [ ] Create or verify `ops@strangeworks.studio` or replacement monitored support inbox.
- [ ] Send and receive one test email.
- [ ] Create the Google Sheet ledger with these tabs: `Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents`, `Leads`.
- [ ] Add the `Requests` and `Invoices` header:

```text
created_at,source,invoice_id,customer,contact,service,amount,status,stripe_invoice_url,delivery_due,notes
```

- [ ] Add the optional `Leads` header:

```text
created_at,lead_id,customer,contact,service,amount,source,stage,qualification_note,order_id,notes
```

- [ ] Create a Google Form linked to the Sheet.
- [ ] Submit one safe test form response.
- [ ] Confirm the response lands in the Sheet.

Output evidence:

- [ ] Support inbox verified.
- [ ] Sheet URL.
- [ ] Google Form URL.
- [ ] Test response row timestamp.

### 3. Create Payment And Bookkeeping Routes

- [ ] Verify the business bank account.
- [ ] Verify Stripe for the operating entity.
- [ ] Confirm Stripe Hosted Invoices are enabled.
- [ ] Create a manual test invoice.
- [ ] Confirm the hosted invoice URL starts with `https://invoice.stripe.com/`.
- [ ] Define the bookkeeping owner and weekly reconciliation cadence.

Output evidence:

- [ ] Stripe dashboard URL.
- [ ] Test hosted invoice URL.
- [ ] Bookkeeping owner.
- [ ] Reconciliation day.

### 4. Review Customer Documents

- [ ] Review `TERMS.md` for the real offer.
- [ ] Review `PRIVACY.md` for the real intake route.
- [ ] Review `SUPPORT.md` for the real inbox and incident path.
- [ ] Replace draft language if counsel, accounting, or operator review changes it.

Output evidence:

- [ ] Terms reviewed date in `YYYY-MM-DD`.
- [ ] Privacy reviewed date in `YYYY-MM-DD`.
- [ ] Support route owner.

### 5. Configure The Private Operations Console

- [ ] Open local `index.html`.
- [ ] In Operations, save the support email, Sheet URL, Google Form URL, Stripe dashboard URL, terms review date, and privacy review date.
- [ ] Clear launch checklist items only when matching outside evidence exists.
- [ ] Close critical Operations controls only after legal, payment, accounting, support, terms, and privacy routes are real.
- [ ] Close Satellite transaction controls only after written scope, invoicing/bookkeeping, conflict review, and replaceable-vendor rules are real.
- [ ] Issue or refresh the Revenue Start packet.
- [ ] Seal the receipt chain after the setup changes.

Output evidence:

- [ ] Revenue Start packet copied to the operator record.
- [ ] Receipt chain sealed after setup.

### 6. Configure Public Intake

Edit `public-config.js` only after sections 1-5 are done.

- [ ] Set `supportEmail`.
- [ ] Set `googleFormUrl`.
- [ ] Set `supportInboxVerified: true`.
- [ ] Set `googleFormVerified: true`.
- [ ] Set `termsReviewedAt`.
- [ ] Set `privacyReviewedAt`.
- [ ] Confirm service titles, descriptions, and prices.
- [ ] Set `liveMode: true` last.

Required checks:

```bash
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
```

Both must pass before publishing.

### 7. Publish And Smoke Test

- [ ] Commit the config and reviewed-document changes.
- [ ] Push to `main`.
- [ ] Wait for the GitHub Pages deploy to pass.
- [ ] Open `https://arthurcdag.github.io/strange-company/`.
- [ ] Confirm the readiness banner says `Live intake configured`.
- [ ] Submit one safe test request with no PHI, card data, credentials, secrets, private keys, or regulated source documents.
- [ ] Confirm the request reaches the Sheet or support inbox.
- [ ] Create the manual Stripe invoice.
- [ ] Paste the hosted invoice URL into the private Operations order.
- [ ] Advance `Draft -> Sent`.
- [ ] After test payment settlement, advance `Sent -> Paid`.
- [ ] Add an `https://` delivery artifact and acceptance note.
- [ ] Advance `Paid -> Delivered`.
- [ ] Expand `Receipt chain timeline` and confirm all events appear chronologically.
- [ ] Seal the receipt chain.

## Stop Rules

Pause intake and set `liveMode: false` if any of these happen:

- Support inbox outage.
- Google Form or Sheet outage.
- Stripe or bank restriction.
- Terms or privacy change needed.
- Customer submits regulated data or secrets.
- Stripe, Sheet, and Operations disagree on order state.
- Delivery artifact or acceptance receipt is missing.

Record the event as an incident before resuming.

## Next Action

The next operator action is not a code change. It is to create or verify:

1. monitored support inbox,
2. Google Sheet ledger,
3. Google Form intake,
4. Stripe Hosted Invoice route,
5. terms and privacy review dates.

Use [EXTERNAL_LIVE_CONTROLS.md](EXTERNAL_LIVE_CONTROLS.md) for exact field names, Google Form questions, support inbox checks, Stripe evidence, bank evidence boundaries, and the final `public-config.js` patch.

After those are available, update `public-config.js`, run the two required checks, and publish.
