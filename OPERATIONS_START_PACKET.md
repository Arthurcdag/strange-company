# Operations Start Packet

Date: 2026-05-17

Purpose: start Strange Works Studio operations in Brazil without pretending Strange Company itself is live-autonomous or that AI can certify legal compliance.

Current state:

- The public static Order Desk is deployed at `https://arthurcdag.github.io/strange-company/`.
- The public desk is still closed to public intake; test packets belong in the private command center until live gates pass.
- Pilot support/privacy inbox is verified at `tuiidagnese+strangeworks@gmail.com`; see `SUPPORT_INBOX_EVIDENCE.md`.
- Google Sheet ledger/control workbook exists in Drive with the documented ledger tabs; keep its URL in private Setup Evidence/operator records.
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
- Support inbox is verified for the pilot Gmail alias.
- Google Form route is not verified.
- Google Form URL is blank.
- Terms review date is blank.
- Privacy review date is blank.
- Brazilian entity/CNPJ, tax regime, NFS-e, LGPD contact, and payment route are not verified.

Do not flip `liveMode` until every blocker below has evidence.

## Start Sequence

### 1. Form The Brazilian Operating Boundary

- [ ] Confirm the Brazilian operating entity, CNPJ, or approved operating structure for Strange Works Studio.
- [ ] Confirm the responsible human party for tax, bank/payment, fiscal documents, support, LGPD, and customer communications.
- [ ] Confirm accountant/lawyer review owner for tax, consumer-law, privacy, and terms questions.
- [ ] Keep Strange Company sealed: no direct customer invoices, no public treasury action, no autonomous public operation.

Output evidence:

- [ ] Entity/CNPJ or reviewed operating-structure note.
- [ ] Responsible party name in the private operator record.
- [ ] Accountant/lawyer review owner.
- [ ] Decision receipt saying Strange Company remains sealed and Strange Works Studio is the revenue-facing operator.

### 2. Create The External Operating Routes

- [x] Create or verify replacement monitored support inbox: `tuiidagnese+strangeworks@gmail.com`.
- [x] Send and receive one test email.
- [x] Create or verify the LGPD request/contact path through the same monitored alias.
- [x] Create the Google Sheet ledger with these tabs: `Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents`, `Leads`.
- [x] Add the `Requests` and `Invoices` header:

```text
created_at,source,invoice_id,customer,contact,service,amount,status,stripe_invoice_url,delivery_due,notes
```

- [x] Add the optional `Leads` header:

```text
created_at,lead_id,customer,contact,service,amount,source,stage,qualification_note,order_id,notes
```

- [ ] Create a Google Form linked to the Sheet.
- [ ] Submit one safe test form response.
- [ ] Confirm the response lands in the Sheet.

Output evidence:

- [x] Support inbox verified.
- [x] LGPD contact path verified.
- [x] Sheet URL stored outside the public repo in the operator handoff/Setup Evidence lane.
- [ ] Google Form URL.
- [ ] Test response row timestamp.

### 3. Create Payment, Fiscal, And Bookkeeping Routes

- [ ] Verify the business bank or payment account in the operator's name.
- [ ] Confirm tax regime, CNAE, municipal registration needs, and NFS-e or reviewed fiscal receipt path with an accountant.
- [ ] Verify the payment provider/manual invoice route for the operating entity.
- [ ] Create a manual test payment request or invoice.
- [ ] Confirm the payment URL and fiscal-document flow are compatible with the reviewed route.
- [ ] Define the bookkeeping owner and weekly reconciliation cadence.

Output evidence:

- [ ] Accountant/tax route note.
- [ ] NFS-e or receipt route evidence.
- [ ] Payment dashboard URL.
- [ ] Test payment/invoice URL.
- [ ] Bookkeeping owner.
- [ ] Reconciliation day.

### 4. Review Customer Documents And AI Boundary

- [ ] Review `TERMS.md` for the real offer.
- [ ] Review `PRIVACY.md` for the real intake route.
- [ ] Review `SUPPORT.md` for the real inbox and incident path.
- [ ] Review `BRAZIL_COMPLIANCE.md` and `AI_LEGAL_HANDOFF.md`.
- [ ] Confirm that AI output is draft-only for legal, tax, privacy, refund, cancellation, and rights-impacting decisions.
- [ ] Replace draft language if counsel, accounting, or operator review changes it.

Output evidence:

- [ ] Terms reviewed date in `YYYY-MM-DD`.
- [ ] Privacy reviewed date in `YYYY-MM-DD`.
- [ ] Brazil compliance reviewed date in `YYYY-MM-DD`.
- [ ] AI legal handoff reviewed date in `YYYY-MM-DD`.
- [ ] Support route owner.
- [ ] AI/human review owner.

### 5. Configure The Private Operations Console

- [ ] Open local `index.html`.
- [ ] In Operations, save the support email, Sheet URL, Google Form URL, payment/Stripe dashboard URL, terms review date, and privacy review date.
- [ ] In Setup Evidence, verify entity/CNPJ, tax regime, NFS-e, bank/payment, support, LGPD contact, Sheet/Form, terms, and privacy only when matching outside evidence exists.
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

- [x] Set `supportEmail`.
- [ ] Set `googleFormUrl`.
- [x] Set `supportInboxVerified: true`.
- [ ] Set `googleFormVerified: true`.
- [ ] Set `termsReviewedAt`.
- [ ] Set `privacyReviewedAt`.
- [ ] Set `brazilComplianceReviewedAt`.
- [ ] Set `aiHandoffReviewedAt`.
- [ ] Confirm service titles, descriptions, and prices.
- [ ] Confirm `jurisdiction: "BR"` remains set.
- [ ] Keep `liveMode: false` through evidence validation, receipt export, preflight, and status review.

Required checks:

```bash
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
node tools/export_public_live_receipt.js --live-review-closure LIVE_REVIEW_CLOSURE.local.json --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force
node tools/export_public_live_receipt.js --check-public-js --require-issued
node tools/preflight_public_launch.js
node tools/evolution_goal_status.js --json
```

Every command must pass with external Form responses disabled, and status must
show no hard, public-route, or operational blockers. A human may then make the
separate `liveMode: true` change and rerun `node tools/preflight_public_launch.js
--deployment`. Publish the issued receipt and live config together, verify
Pages, and only then enable Form responses.

### 7. Publish And Smoke Test

- [ ] Commit the config and reviewed-document changes.
- [ ] Push to `main`.
- [ ] Wait for the GitHub Pages deploy to pass.
- [ ] Open `https://arthurcdag.github.io/strange-company/`.
- [ ] Confirm the readiness banner says `Live intake configured`.
- [ ] Submit one safe test request with no PHI, card data, credentials, secrets, private keys, or regulated source documents.
- [ ] Confirm the request reaches the Sheet or support inbox.
- [ ] Create the manual payment request and required NFS-e/receipt evidence.
- [ ] Paste the hosted payment/invoice URL into the private Operations order.
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
- Payment provider or bank restriction.
- NFS-e, tax, or receipt route failure.
- LGPD request cannot be answered.
- Terms or privacy change needed.
- Customer submits regulated data or secrets.
- Payment provider, fiscal evidence, Sheet, and Operations disagree on order state.
- Delivery artifact or acceptance receipt is missing.

Record the event as an incident before resuming.

Disable Google Form response collection before the rollback. Clear
`googleFormUrl`, set `googleFormVerified: false`, and set `liveMode: false` by
running `node tools/render_public_live_shutdown_patch.js` and applying only its
three output values. Then run
`node tools/export_public_live_receipt.js --revoke --public-config
public-config.js --output public-live-receipt.js`, run
`node tools/preflight_public_launch.js --deployment`, build the public bundle,
and publish the closed config plus placeholder together. Verify Pages is closed
and only then rerun status from the closed state. Finish this captured sequence
without pausing after the config patch; the static receipt cannot close a direct
external Form link by itself.

## Next Action

The next operator action is not a code change. It is to create or verify:

1. Google Form intake,
2. Brazilian entity/CNPJ route,
3. tax regime and NFS-e/receipt route,
4. payment route,
5. terms and privacy review dates,
6. AI/human review owner.

Use [EXTERNAL_LIVE_CONTROLS.md](EXTERNAL_LIVE_CONTROLS.md) for exact field names, Google Form questions, support inbox checks, Stripe evidence, bank evidence boundaries, and the final `public-config.js` patch.

After those are available, update `public-config.js`, run the two required checks, and publish.
