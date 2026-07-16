# Review Ready Packet

Generated: 2026-05-24

This packet is AI-prepared. It does not approve legal, tax, privacy, support, payment, or Brazil compliance decisions. A responsible human must review and accept, change, or reject the drafts before dates can be written into `public-config.js`.

## Closed Evidence

- Public site is reachable at `https://arthurcdag.github.io/strange-company/`.
- Pilot support inbox is `tuiidagnese+strangeworks@gmail.com`.
- A Google Form responder route was verified; its URL is intentionally kept out
  of this tracked public packet and belongs in ignored local evidence.
- Google Form test response landed in the linked Sheet on `2026-05-24T20:36:52-03:00`.
- `public-config.js` keeps `liveMode: false`.
- Closed releases keep the public Form URL blank and external response
  collection disabled; prior test evidence does not mean the route is live.

## Human Review Decisions

### 1. Terms

Review:

- `TERMOS.md`
- `TERMS.md`
- current offer stack in `public-config.js`
- cancellation, refund, right-of-regret, support, and manual invoice flow

Decision to record only after review:

```text
termsReviewedAt: "YYYY-MM-DD"
```

### 2. Privacy

Review:

- `AVISO_DE_PRIVACIDADE.md`
- `PRIVACY.md`
- Google Form fields
- support inbox route
- Google Sheet ledger
- Stripe Hosted Invoice path
- retention, processors, international transfer, and LGPD rights path

Decision to record only after review:

```text
privacyReviewedAt: "YYYY-MM-DD"
```

### 3. Brazil Compliance

Review:

- `BRAZIL_COMPLIANCE.md`
- `BRAZIL_COMPLIANCE_AGENTS.md`
- CNPJ/entity route
- tax regime, CNAE, NFS-e or fiscal receipt route
- payment, bank, accounting, support, and LGPD contact responsibilities

Decision to record only after review:

```text
brazilComplianceReviewedAt: "YYYY-MM-DD"
```

### 4. AI Legal Handoff

Review:

- `AI_LEGAL_HANDOFF.md`
- `HUMAN_REVIEW_PACKET.md`
- `CONKA8_LAW_INSTRUCTIONS.md`
- which AI-prepared legal/compliance text is accepted, changed, or rejected
- confirmation that AI output remains draft-only until human acceptance

Decision to record only after review:

```text
aiHandoffReviewedAt: "YYYY-MM-DD"
```

## After Review

Update only public-safe fields:

```js
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: false
```

Keep `liveMode` false until Stripe Hosted Invoice and bank/payout evidence are complete in `EXTERNAL_LIVE_PACKET.local.json` and:

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

all pass while `liveMode` remains false, the ready config remains unpublished,
and external Form responses are disabled. After reviewing the receipt and
confirming no hard, public-route, or operational blockers, a human may make the
separate `liveMode: true` change; run `node tools/preflight_public_launch.js
--deployment`, publish the issued receipt and live config together, verify
Pages, and only then enable responses.

## Stop Rules

- Do not enter dates if the review did not happen.
- Do not enter private reviewer notes, tax IDs, bank data, Stripe dashboard URLs, customer data, or Sheet-private URLs in git.
- Do not count related-party work as external market proof.
- Do not invoice through Strange Company.
