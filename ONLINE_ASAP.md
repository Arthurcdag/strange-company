# Online ASAP Runbook

This is the shortest safe path for getting both lanes online without merging the sealed Strange Company loop into the revenue-facing satellite.

## Current Split

### Main Track: Strange Company

Status: online as a public static prototype.

- Public URL: `https://arthurcdag.github.io/strange-company/`
- Public surface: `public.html` deployed as `index.html` by GitHub Pages.
- Allowed claim: public documentation and manual request surface are online.
- Not allowed claim: Strange Company is live-autonomous, taking payment, moving treasury, or directly invoicing customers.

Keep this track sealed:

- private command center stays in local `index.html`,
- no customer invoices from Strange Company,
- no public treasury operation,
- no sealed-local planning material copied into the public repo.

### Satellite Track: Strange Works Studio

Status: ready in code, blocked for live intake until outside operating routes are real.

The satellite can go online commercially before Strange Company live operation, but only as a normal for-profit operator with manual invoices, support, bookkeeping, and reviewed public terms.

## ASAP Decision

Use this decision table before changing `public-config.js`.

| Condition | Action |
| --- | --- |
| Public site must be visible now | Push to `main`; Pages deploys `public.html` automatically. |
| Support inbox, Google Form, terms, privacy, Stripe, and bank are not verified | Keep `liveMode: false`. |
| Support inbox and Google Form are verified, but Stripe/bank are not ready | Keep packet-only mode; do not send payment traffic. |
| All external controls are verified | Set the real config values and turn `liveMode: true` last. |
| Any stop rule triggers after launch | Set `liveMode: false`, record an incident, and stop traffic. |

## 15 Minute Repo Pass

Run from the repo root after every pull or before every push:

```bash
node --check public-config.js
node --check public.js
node --check script.js
node --check tools/preflight_public_launch.js
node --check tools/audit_company_functionality.js
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js
```

Expected result before external setup is complete:

- syntax checks pass,
- public launch preflight passes,
- company functionality audit passes,
- audit reports the external live-operation gate as blocked.

## Satellite Live Config

Only edit `public-config.js` after the real outside evidence exists.

Required values:

```js
supportEmail: "real monitored inbox",
googleFormUrl: "https://docs.google.com/forms/...",
supportInboxVerified: true,
googleFormVerified: true,
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
liveMode: true
```

Set `liveMode: true` last.

Then run:

```bash
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
```

Do not publish the live config unless both pass.

## Publish

```bash
git status --short
git add README.md LIVE_HANDOFF_CHECKLIST.md OPERATIONS_START_PACKET.md OPERATOR_FAST_START.md ONLINE_ASAP.md tools/audit_company_functionality.js
git commit -m "Add online ASAP launch instructions"
git push origin main
```

After push:

1. Wait for `Deploy static site to Pages`.
2. Open `https://arthurcdag.github.io/strange-company/`.
3. Confirm the public page loads.
4. If `liveMode` is still false, confirm it remains packet-only.
5. If `liveMode` is true, submit one safe test request and confirm it reaches the Sheet or support inbox.

## Fast Blocker List

The satellite is not live while any of these remain true:

- `public-config.js liveMode` is `false`,
- support inbox is not verified,
- Google Form route is not verified,
- Google Form URL is blank,
- terms review date is blank,
- privacy review date is blank,
- Stripe Hosted Invoice route is not verified,
- business bank route is not verified.

The fastest next non-code work is to produce those eight pieces of evidence, then update `public-config.js` and rerun the live-required audit.

Use [EXTERNAL_LIVE_CONTROLS.md](EXTERNAL_LIVE_CONTROLS.md) for the exact developer/operator instructions to create the support inbox, Google Form, Sheet ledger, terms and privacy review dates, Stripe Hosted Invoice route, and private bank-route evidence.
