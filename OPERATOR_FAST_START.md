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
   - set `liveMode: true` only after the stop rule is clear,
   - adjust service names and prices if the offer changed.
5. Run `node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live`.
6. Run `node tools/preflight_public_launch.js`.
7. Run `node tools/audit_company_functionality.js --require-live`.
8. Open `public.html` locally and confirm the readiness banner says `Live intake configured`.
9. Submit a safe test packet.
10. Confirm the email draft uses the real inbox.
11. Open the Google Form from the public packet output and paste the packet.

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
