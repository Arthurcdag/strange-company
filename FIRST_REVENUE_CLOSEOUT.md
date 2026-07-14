# First Revenue Closeout

Generated: 2026-05-24

This is the shortest current path from public prototype to first safe paid intake for `Strange Works Studio` while `Strange Company` stays sealed.

## Current State

- Public page is reachable at `https://arthurcdag.github.io/strange-company/`.
- The public surface is an order desk, not an automatic payment processor.
- `public-config.js` keeps `liveMode: false`.
- Support inbox is configured in public config as `tuiidagnese+strangeworks@gmail.com`.
- Google Form URL is configured in `public-config.js`.
- Google Form verification is true after a safe test response landed in the linked Sheet.
- Terms, privacy, Brazil compliance, and AI handoff review dates are still blank.
- `tools/audit_company_functionality.js --require-live` must fail until those external facts are real.

## What Codex Can Safely Complete

- Keep the public static desk deployable.
- Keep the request flow blocked until live evidence exists.
- Generate an ignored local live-readiness packet:

```bash
node tools/draft_external_live_packet.js --write-local --force
```

- Generate the current missing-evidence packet:

```bash
node tools/generate_external_live_gap_packet.js
```

- Validate the gate behavior:

```bash
node tools/check_external_live_packet_gate.js
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js
node tools/audit_company_functionality.js --require-live
```

The first three commands should pass. The final command should fail until the external live gate is closed.

## Manual Closeout Order

1. Review `TERMOS.md`, `AVISO_DE_PRIVACIDADE.md`, `SUPPORT.md`, `BRAZIL_COMPLIANCE.md`, `AI_LEGAL_HANDOFF.md`, `HUMAN_REVIEW_PACKET.md`, and `REVIEW_READY_PACKET.md` with a responsible human reviewer.
2. Record real `YYYY-MM-DD` review dates for terms, privacy, Brazil compliance, and AI handoff, then copy only those public-safe dates into `public-config.js` while keeping `liveMode: false`.
3. Create or verify the Stripe Hosted Invoice route and business bank/payout route outside the repo.
4. Fill `EXTERNAL_LIVE_PACKET.local.json`, `REVENUE_SETUP_EVIDENCE_INDEX.local.json`, `REVIEWER_CANDIDATE_TRACKER.local.json`, and `DELIVERY_REVIEW_CHECKLIST.local.json` without committing private account, tax, reviewer, or customer data.
5. Run:

```bash
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
node tools/export_public_live_receipt.js --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force
node tools/export_public_live_receipt.js --check-public-js --require-issued
node tools/preflight_public_launch.js
node tools/evolution_goal_status.js --json
```

6. Confirm the status reports no hard, public-route, or operational blockers and review the issued public-only receipt.
7. Only after a separate human decision, change only `liveMode` to `true`, then run `node tools/preflight_public_launch.js --deployment` to validate the live config against the issued receipt.
8. Push to `main` and smoke-test the public order desk.

## First Money Rule

Do not invoice from Strange Company. First revenue must go through the satellite operator, with:

- qualified external lead,
- written scope,
- manual invoice or hosted invoice,
- fiscal/NFS-e or reviewed receipt route,
- support route,
- Sheet ledger row,
- delivery artifact,
- acceptance note,
- incident route,
- receipt-chain closeout.

Related-party work does not count as market proof.

## Stop Rules

- Do not set review dates without real human review.
- Do not store Stripe, bank, tax, customer, credential, or Sheet-private evidence in git.
- Do not set `liveMode: true` until `--require-live` passes.
