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
| All external controls are verified | Complete the bound validators, issue/check the public receipt, run preflight/status with `liveMode: false`, then require a separate human flip. |
| Any stop rule triggers after launch | Disable external Form responses, close and revoke the public bundle, record an incident, and stop traffic. |

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
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: false
```

Keep this ready config local and unpublished at `liveMode: false` while its fields
are bound to both private evidence packets and the public-only receipt is issued.
The external-live packet alone uses local `publicConfig.liveMode: true` as the
intended post-decision target; every other bound field must match, including
`google.acceptingResponses: false` while the receipt is issued.

Then run:

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

Do not open paid intake unless every command passes and the status has no hard,
public-route, or operational blockers. After that review, a human may make the
separate `liveMode: true` change, run `node tools/preflight_public_launch.js
--deployment`, and publish the issued receipt and live config together. Enable
external Form responses only after the live Pages deployment is verified.

Set `liveMode: true` last means exactly that isolated human step, never part of
private validation or receipt export. Do not push or deploy the pre-flip config
containing the responder URL. The deployment preflight runs only after the flip
and validates the issued public receipt.

## Fail-Closed Rollback

The static receipt cannot turn off a Google Form reached directly. On expiry or
any stop rule, first disable external Form responses. Then render and apply the
exact fail-closed public patch before revocation:

```bash
node tools/render_public_live_shutdown_patch.js
node tools/export_public_live_receipt.js --revoke --public-config public-config.js --output public-live-receipt.js
node tools/preflight_public_launch.js --deployment
```

Publish the closed config and fail-closed placeholder together. Revocation
advances the public receipt generation, does not need the five private packets,
and still works after the Form URL is cleared.

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
