# Operator Fast Start

Use this when the external setup is ready and the public Order Desk needs to point at the real operating routes.

For the shortest safe sequence across both lanes, see [ONLINE_ASAP.md](ONLINE_ASAP.md). The main Strange Company track can remain online as the static public prototype. The satellite track becomes live intake only after the external operating routes below are verified.

For exact Google Form questions, Sheet headers, support inbox checks, Stripe evidence, bank evidence, and review-date rules, use [EXTERNAL_LIVE_CONTROLS.md](EXTERNAL_LIVE_CONTROLS.md).

## 30 Minute Config Pass

1. Confirm the monitored support inbox exists.
2. Create the Google Form linked to the ledger Sheet.
3. Edit `public-config.js`:
   - set `supportEmail`,
   - set `googleFormUrl`,
   - set `supportInboxVerified: true` after sending and receiving a test email,
   - set `googleFormVerified: true` after a test response lands in the Sheet,
   - set `termsReviewedAt` and `privacyReviewedAt`,
   - set `liveMode: true` only after the stop rule is clear,
   - adjust service names and prices if the offer changed.
4. Run `node tools/preflight_public_launch.js`.
5. Open `public.html` locally and confirm the readiness banner says `Live intake configured`.
6. Submit a safe test packet.
7. Confirm the email draft uses the real inbox.
8. Open the Google Form from the public packet output and paste the packet.

## Live Smoke

1. Merge the config change.
2. Wait for GitHub Pages deploy.
3. Open the live public page.
4. Submit one test request with no sensitive data.
5. Confirm the request arrives in the support inbox or Google Form response Sheet.
6. Create one Stripe test invoice manually.
7. Paste the hosted invoice URL into the private Operations console.
8. Advance the private order through `Sent`, `Paid`, and `Delivered`.

## Stop Rule

Do not use the public page for real customers if the support inbox, Google Form, ledger Sheet, terms review, privacy review, Stripe account, or business bank account is missing.
