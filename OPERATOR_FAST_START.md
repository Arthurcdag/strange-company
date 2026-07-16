# Operator Fast Start

Use this when the external setup is ready and the public Order Desk needs to point at the real operating routes.

For the shortest safe sequence across both lanes, see [ONLINE_ASAP.md](ONLINE_ASAP.md). The main Strange Company track can remain online as the static public prototype. The satellite track becomes live intake only after the external operating routes below are verified.

This fast start is Brazil-first. Do not use it until `BRAZIL_COMPLIANCE.md` and `AI_LEGAL_HANDOFF.md` have been reviewed for the real route.

For exact Google Form questions, Sheet headers, support inbox checks, Stripe evidence, bank evidence, and review-date rules, use [EXTERNAL_LIVE_CONTROLS.md](EXTERNAL_LIVE_CONTROLS.md).

## 30 Minute Config Pass

1. Confirm the monitored support inbox and LGPD contact path exist.
2. Confirm Brazilian entity/CNPJ or approved operating structure, tax regime, NFS-e/receipt route, and payment route are ready.
3. Create the Google Form linked to the ledger Sheet.
4. Edit `public-config.js`:
   - set `supportEmail`,
   - set `googleFormUrl`,
   - confirm `jurisdiction: "BR"`,
   - keep `aiGeneratedLegalDocsRequireHumanReview: true`,
   - set `supportInboxVerified: true` after sending and receiving a test email,
   - set `googleFormVerified: true` after a test response lands in the Sheet,
   - set `termsReviewedAt` and `privacyReviewedAt`,
   - set `brazilComplianceReviewedAt` and `aiHandoffReviewedAt`,
   - keep `liveMode: false` through validation, receipt export, preflight, and status review,
   - adjust service names and prices if the offer changed.
5. Run `node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js` and stop if any reviewed document digest or public review date is stale.
6. Run `node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js`.
7. Run `node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js`.
8. Run `node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready`.
9. Run `node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready`.
10. Run `node tools/export_public_live_receipt.js --live-review-closure LIVE_REVIEW_CLOSURE.local.json --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force`.
11. Run `node tools/export_public_live_receipt.js --check-public-js --require-issued`.
12. Run `node tools/preflight_public_launch.js`.
13. Run `node tools/evolution_goal_status.js --json` and stop if any hard, public-route, or operational blocker remains.
14. After a separate human decision, change only `liveMode` to `true`, then run `node tools/preflight_public_launch.js --deployment` before publication.
15. Open `public.html` locally and confirm the readiness banner says `Live intake configured`.
16. Submit a safe test packet.
17. Confirm the email draft uses the real inbox.
18. Open the Google Form from the public packet output and paste the packet.

## Live Smoke

1. Merge the config change.
2. Wait for GitHub Pages deploy.
3. Open the live public page.
4. Submit one test request with no sensitive data.
5. Confirm the request arrives in the support inbox or Google Form response Sheet.
6. Create one manual payment request or hosted invoice.
7. Confirm the NFS-e/receipt evidence path for the test.
8. Paste the hosted payment/invoice URL into the private Operations console.
9. Advance the private order through `Sent`, `Paid`, and `Delivered`.

## Stop Rule

Do not use the public page for real customers if the support inbox, LGPD contact path, Google Form, ledger Sheet, terms review, privacy review, Brazilian entity/CNPJ route, tax/NFS-e route, payment provider, or business bank/payment account is missing.

For a stop or receipt expiry, disable external Form responses first. Set
`liveMode: false`, clear the Form URL/verified flag, run
`node tools/export_public_live_receipt.js --revoke --public-config
public-config.js --output public-live-receipt.js`, run the deployment preflight,
and publish the closed config plus placeholder together.
