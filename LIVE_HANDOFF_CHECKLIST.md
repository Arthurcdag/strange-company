# Live Handoff Checklist

Use this checklist for the developer/operator taking the public Order Desk from static prototype to live intake.

Current state:

- [x] GitHub Pages static public prototype is deployed at `https://arthurcdag.github.io/strange-company/`.
- [x] Issue #14 is closed: every Operations order card has an expandable receipt-chain timeline.
- [x] Public launch preflight and company functionality audit pass locally.
- [x] Pilot support/privacy inbox exists: `tuiidagnese+strangeworks@gmail.com`.
- [x] Support inbox receiving test passed; see `SUPPORT_INBOX_EVIDENCE.md`.
- [x] Google Sheet ledger/control workbook exists in Drive; keep its URL in private Setup Evidence/operator records.
- [ ] Real live intake is not enabled. `public-config.js` still has `liveMode: false`.

Do not set `liveMode: true` until every external control below is real and tested.

## ASAP Track Split

Use [ONLINE_ASAP.md](ONLINE_ASAP.md) for the fastest safe launch sequence.

- **Main track**: keep Strange Company online only as the GitHub Pages static prototype and documentation surface.
- **Satellite track**: turn Strange Works Studio into live intake only after the support inbox, Google Form, terms, privacy, Stripe, bank, and ledger evidence are real.
- **Boundary**: the private `index.html` command center remains local/private; GitHub Pages must not become the sealed command center.
- **Last flag**: `public-config.js liveMode` is the final switch, never the first setup step.

## 1. Repo Sync

- [ ] Clone or pull the latest `main` from `https://github.com/Arthurcdag/strange-company`.
- [ ] Confirm `main` includes commit `f3f4da5` or newer.
- [ ] Run JavaScript syntax checks:

```bash
node --check public-config.js
node --check public.js
node --check script.js
node --check tools/preflight_public_launch.js
node --check tools/audit_company_functionality.js
```

- [ ] Run launch checks:

```bash
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js
```

## 2. External Controls

Use [EXTERNAL_LIVE_CONTROLS.md](EXTERNAL_LIVE_CONTROLS.md) for the detailed setup instructions and evidence fields.

- [ ] Brazilian entity/CNPJ or approved operating structure is confirmed.
- [ ] Responsible human party is identified for tax, banking/payment, support, privacy, and customer control.
- [ ] Tax regime, CNAE, municipal registration needs, and NFS-e/receipt route are reviewed with an accountant.
- [ ] Business bank/payment account is open in the operating entity name.
- [ ] Payment provider/manual invoice route is active, verified, and wired to the business bank/payment account.
- [x] Real support inbox exists and is monitored daily.
- [x] Test email has been sent to and received from the support inbox.
- [x] LGPD contact or encarregado path exists and is monitored.
- [x] Google Sheet ledger exists with tabs: `Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents`, `Leads`.
- [x] Ledger tabs use the documented columns in `GOOGLE_SHEET_LEDGER.md`.
- [ ] Google Form intake is linked to the ledger Sheet.
- [ ] Test Google Form submission lands in the Sheet without sensitive data.
- [ ] Terms have been reviewed for the live offer.
- [ ] Privacy notice has been reviewed for the live offer.
- [ ] `BRAZIL_COMPLIANCE.md` and `AI_LEGAL_HANDOFF.md` have been reviewed for the actual launch route.
- [ ] Incident response route is documented and owned.
- [ ] Payment/data recovery rehearsal has been run.

## 3. Private Console Controls

- [ ] Open local/private `index.html`, not the public Pages site.
- [ ] In Operations, clear each critical launch checklist item only after matching outside evidence exists.
- [ ] In Setup Evidence, verify entity/CNPJ, tax regime, NFS-e, bank/payment, support, LGPD contact, Sheet/Form, terms, and privacy only after matching outside evidence exists.
- [ ] In Operations, close critical commercial controls only after legal, payment, accounting, support, terms, privacy, and AI-human review boundaries are real.
- [ ] In Satellite, close transaction controls only after written scopes, invoices/bookkeeping, conflict review, and vendor-exit rules are real.
- [ ] Add or import at least one safe test order.
- [ ] Confirm `Draft -> Sent` requires a reviewed hosted payment/invoice URL.
- [ ] Confirm `Sent -> Paid` is blocked while critical Operations controls are open.
- [ ] Confirm `Paid -> Delivered` requires an `https://` delivery artifact and acceptance note.
- [ ] Expand `Receipt chain timeline` on the order and verify created, sent, paid, delivered, blocked, and incident events appear chronologically when present.
- [ ] Seal the receipt chain after material state changes.

## 4. Public Config Change

Edit `public-config.js` only after sections 2 and 3 are complete.

- [x] Set `supportEmail` to the monitored inbox.
- [ ] Set `googleFormUrl` to the verified Google Form URL.
- [x] Set `supportInboxVerified: true`.
- [ ] Set `googleFormVerified: true`.
- [ ] Confirm `jurisdiction: "BR"`.
- [ ] Keep `aiGeneratedLegalDocsRequireHumanReview: true`.
- [ ] Set `termsReviewedAt` to `YYYY-MM-DD`.
- [ ] Set `privacyReviewedAt` to `YYYY-MM-DD`.
- [ ] Set `brazilComplianceReviewedAt` to `YYYY-MM-DD`.
- [ ] Set `aiHandoffReviewedAt` to `YYYY-MM-DD`.
- [ ] Confirm service names, descriptions, and prices are the approved public offer.
- [ ] Keep `liveMode: false` through evidence validation, receipt export, preflight, and status review.
- [ ] Keep external Google Form response collection disabled and record
  `google.acceptingResponses: false` in the local external-live packet.
- [ ] Keep the pre-flip config and responder URL local; do not publish it before
  the issued receipt and final live flag are in the same release.

Then run:

```bash
node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
node tools/export_public_live_receipt.js --live-review-closure LIVE_REVIEW_CLOSURE.local.json --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force
node tools/export_public_live_receipt.js --check-public-js --require-issued
node tools/preflight_public_launch.js
node tools/evolution_goal_status.js --json
```

Every command must pass and status must show no hard, public-route, or operational
blockers. A human may then make the separate `liveMode: true` change and rerun
`node tools/preflight_public_launch.js --deployment`. Publish the issued receipt
and live config together, verify Pages, and only then enable external Form responses.

## 5. Publish

- [ ] Commit only the intended config and documentation changes.
- [ ] Push to `main` or open a PR and merge it after checks pass.
- [ ] Wait for the `Deploy static site to Pages` workflow to complete successfully.
- [ ] Open `https://arthurcdag.github.io/strange-company/`.
- [ ] Confirm the public readiness banner shows live intake configured.
- [ ] Submit one safe test request with no PHI, credentials, card data, secrets, or regulated source documents.
- [ ] Confirm the request reaches the support inbox or Google Form response Sheet.
- [ ] Create one manual payment request or hosted invoice.
- [ ] Confirm the NFS-e/receipt evidence route for the test.
- [ ] Paste the hosted payment/invoice URL into the private Operations console.
- [ ] Move the test order through `Sent`, `Paid`, and `Delivered`.
- [ ] Confirm the order timeline and receipt chain show the full path.

## 6. Stop Rule

Immediately disable external Form responses and stop sending traffic if any of
these fail. Then set `liveMode: false`, clear `googleFormUrl`, set
`googleFormVerified: false`, and revoke the static lease:

```bash
node tools/export_public_live_receipt.js --revoke --public-config public-config.js --output public-live-receipt.js
node tools/preflight_public_launch.js --deployment
```

Publish the closed config and placeholder in the same rollback. This path does
not require revalidating private packets.

- [ ] Support inbox is unavailable.
- [ ] Google Form or Sheet ledger is unavailable.
- [ ] Payment provider, business bank account, or NFS-e/fiscal route is restricted.
- [ ] LGPD request cannot be answered.
- [ ] Terms or privacy need unscheduled changes.
- [ ] A request includes regulated data or secrets.
- [ ] Ledger, payment provider, fiscal evidence, and Operations console disagree on paid/delivered state.

Record the failure as an incident before resuming.
