# Review Ready Packet

Generated: 2026-05-24

This packet is AI-prepared. It does not approve legal, tax, privacy, support, payment, or Brazil compliance decisions. A responsible human must review and accept, change, or reject the drafts before dates can be written into `public-config.js`.

## Closed Evidence

- Public site is reachable at `https://arthurcdag.github.io/strange-company/`.
- Pilot support inbox is `tuiidagnese+strangeworks@gmail.com`.
- Google Form public URL is configured:
  `https://docs.google.com/forms/d/e/1FAIpQLSdziVPmI5O76mU4SMWhnML80jN_VsfXxSKtFe3hF1RWkF7mfQ/viewform`
- Google Form test response landed in the linked Sheet on `2026-05-24T20:36:52-03:00`.
- `public-config.js` keeps `liveMode: false`.

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
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live
node tools/audit_company_functionality.js --require-live
```

both pass.

## Stop Rules

- Do not enter dates if the review did not happen.
- Do not enter private reviewer notes, tax IDs, bank data, Stripe dashboard URLs, customer data, or Sheet-private URLs in git.
- Do not count related-party work as external market proof.
- Do not invoice through Strange Company.
