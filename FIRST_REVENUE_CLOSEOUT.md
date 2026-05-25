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
2. Record real `YYYY-MM-DD` review dates for terms, privacy, Brazil compliance, and AI handoff.
3. Create or verify the Stripe Hosted Invoice route and business bank/payout route outside the repo.
4. Fill the Stripe and bank evidence in the ignored local packet without committing private account data.
5. Run:

```bash
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
```

6. Only after those pass, copy the remaining public-safe dates into `public-config.js`.
7. Set `liveMode: true` last.
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
