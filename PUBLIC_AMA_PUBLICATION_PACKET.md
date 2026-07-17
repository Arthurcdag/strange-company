# Public AMA Publication Packet

Use this packet when one screened AMA question is ready to become a public answer.

This packet does not approve legal, tax, accounting, payment, refund, privacy, customer-support, launch, or live-operation decisions. It only records that a specific public-safe question and answer can be exported to the static public AMA archive.

## Required Inputs

- `PUBLIC_AMA_QUEUE.local.json` exists outside git.
- The selected `questionRecords[]` entry has `status: "published"`.
- The selected entry has `boundaryDecision: "public_safe"`.
- `humanScreened` is `true`.
- `humanApprovedForPublication` is `true`.
- `publicSafeQuestion`, `publicAnswer`, `answerReviewedAt`, and `publishedAt` are complete.
- No direct email, CPF, CNPJ document, payment data, credential, private key, customer record, support-thread body, private evidence ID, or regulated source document appears in the public question or answer.

## Manual Close Sheet

Before export, a human operator records:

| Field | Value |
| --- | --- |
| Question ID | |
| Topic | |
| Human reviewer | |
| Reviewed at | |
| Published at | |
| Local evidence ref | |
| Public-safe answer approved | yes/no |
| No private data in public fields | yes/no |
| Legal/tax/payment/privacy answer avoided | yes/no |

If any answer is `no`, stop. Route the item to `HUMAN_REVIEW_PACKET.md`, `AI_LEGAL_HANDOFF.md`, `CONKA8_LAW_INSTRUCTIONS.md`, or the relevant support/private workflow instead of publishing.

## Export Sequence

```bash
node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-answer-ready
node tools/export_public_ama_answers.js --input PUBLIC_AMA_QUEUE.local.json --output public-ama-answers.js --require-published --force
node tools/export_public_ama_answers.js --check-public-js
node tools/build_public_site.js --check --output .public-site-build.local --force
node tools/preflight_public_launch.js
```

Only commit `public-ama-answers.js` after the archive check passes. Do not commit `PUBLIC_AMA_QUEUE.local.json`, reviewer notes, support-thread text, private evidence, payment records, or customer records.

## Rollback

If a published answer is later found unsafe:

1. Remove that answer from `PUBLIC_AMA_QUEUE.local.json` or change its status away from `published`.
2. Re-run the export sequence.
3. Commit the updated `public-ama-answers.js`.
4. Record the reason in the private evidence log, not in the public archive.
