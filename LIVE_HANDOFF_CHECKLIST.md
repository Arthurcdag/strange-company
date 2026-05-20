# Live Handoff Checklist

Use this checklist for the developer/operator taking the public Order Desk from static prototype to live intake.

Current state:

- [x] GitHub Pages static public prototype is deployed at `https://arthurcdag.github.io/strange-company/`.
- [x] Issue #14 is closed: every Operations order card has an expandable receipt-chain timeline.
- [x] Public launch preflight and company functionality audit pass locally.
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

- [ ] US LLC or approved operating entity is formed.
- [ ] Responsible human party is identified for tax and banking control.
- [ ] EIN or required tax identity is issued.
- [ ] Business bank account is open in the operating entity name.
- [ ] Stripe account is active, verified, and wired to the business bank account.
- [ ] Real support inbox exists and is monitored daily.
- [ ] Test email has been sent to and received from the support inbox.
- [ ] Google Sheet ledger exists with tabs: `Requests`, `Invoices`, `Customers`, `Delivery`, `Incidents`, `Leads`.
- [ ] Ledger tabs use the documented columns in `GOOGLE_SHEET_LEDGER.md`.
- [ ] Google Form intake is linked to the ledger Sheet.
- [ ] Test Google Form submission lands in the Sheet without sensitive data.
- [ ] Terms have been reviewed for the live offer.
- [ ] Privacy notice has been reviewed for the live offer.
- [ ] Incident response route is documented and owned.
- [ ] Payment/data recovery rehearsal has been run.

## 3. Private Console Controls

- [ ] Open local/private `index.html`, not the public Pages site.
- [ ] In Operations, clear each critical launch checklist item only after matching outside evidence exists.
- [ ] In Operations, close critical commercial controls only after legal, payment, accounting, support, terms, and privacy are real.
- [ ] In Satellite, close transaction controls only after written scopes, invoices/bookkeeping, conflict review, and vendor-exit rules are real.
- [ ] Add or import at least one safe test order.
- [ ] Confirm `Draft -> Sent` requires a Stripe Hosted Invoice URL.
- [ ] Confirm `Sent -> Paid` is blocked while critical Operations controls are open.
- [ ] Confirm `Paid -> Delivered` requires an `https://` delivery artifact and acceptance note.
- [ ] Expand `Receipt chain timeline` on the order and verify created, sent, paid, delivered, blocked, and incident events appear chronologically when present.
- [ ] Seal the receipt chain after material state changes.

## 4. Public Config Change

Edit `public-config.js` only after sections 2 and 3 are complete.

- [ ] Set `supportEmail` to the monitored inbox.
- [ ] Set `googleFormUrl` to the verified Google Form URL.
- [ ] Set `supportInboxVerified: true`.
- [ ] Set `googleFormVerified: true`.
- [ ] Set `termsReviewedAt` to `YYYY-MM-DD`.
- [ ] Set `privacyReviewedAt` to `YYYY-MM-DD`.
- [ ] Confirm service names, descriptions, and prices are the approved public offer.
- [ ] Set `liveMode: true` last.

Then run:

```bash
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
```

Both commands must pass before publishing the config change.

## 5. Publish

- [ ] Commit only the intended config and documentation changes.
- [ ] Push to `main` or open a PR and merge it after checks pass.
- [ ] Wait for the `Deploy static site to Pages` workflow to complete successfully.
- [ ] Open `https://arthurcdag.github.io/strange-company/`.
- [ ] Confirm the public readiness banner shows live intake configured.
- [ ] Submit one safe test request with no PHI, credentials, card data, secrets, or regulated source documents.
- [ ] Confirm the request reaches the support inbox or Google Form response Sheet.
- [ ] Create one Stripe test invoice manually.
- [ ] Paste the hosted invoice URL into the private Operations console.
- [ ] Move the test order through `Sent`, `Paid`, and `Delivered`.
- [ ] Confirm the order timeline and receipt chain show the full path.

## 6. Stop Rule

Immediately revert `liveMode` to `false` or stop sending traffic if any of these fail:

- [ ] Support inbox is unavailable.
- [ ] Google Form or Sheet ledger is unavailable.
- [ ] Stripe or business bank account is restricted.
- [ ] Terms or privacy need unscheduled changes.
- [ ] A request includes regulated data or secrets.
- [ ] Ledger, Stripe, and Operations console disagree on paid/delivered state.

Record the failure as an incident before resuming.
