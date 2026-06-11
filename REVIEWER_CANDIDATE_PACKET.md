# Reviewer Candidate Packet

Status: AI-prepared operator packet. This does not approve a lawyer, accountant, privacy reviewer, payment reviewer, or delivery reviewer. It gives the human operator a private tracker for the next hard blocker reported by `tools/vau_company_evolution.py`: contact one reviewer candidate and record scope, rate, availability, and a paid test task.

Use this packet with [REVIEWER_CANDIDATE_TRACKER.template.json](REVIEWER_CANDIDATE_TRACKER.template.json), [tools/draft_reviewer_candidate_tracker.js](tools/draft_reviewer_candidate_tracker.js), and [tools/validate_reviewer_candidate_tracker.js](tools/validate_reviewer_candidate_tracker.js). Completed copies stay local as `REVIEWER_CANDIDATE_TRACKER.local.json`.

## Stop Rules

- Do not mark `humanReviewersReady` or flip `liveMode` because a candidate was listed.
- Do not let AI approve a reviewer, legal conclusion, tax route, payment route, privacy posture, or customer-facing compliance copy.
- Do not commit reviewer personal documents, CPF, CNPJ, bank data, contracts, tax portal screenshots, credentials, private invoices, private Sheet URLs, or private reviewer notes.
- Do not ask a candidate to review real customer records until the privacy boundary and engagement terms are approved by a human.
- Use the satellite operator lane for reviewer contracting. Strange Company remains sealed.

## First Candidate Workflow

1. Copy `REVIEWER_CANDIDATE_TRACKER.template.json` to `REVIEWER_CANDIDATE_TRACKER.local.json`.
2. Pick one role from the required pool: `terms_consumer_law`, `privacy_lgpd`, `tax_nfse_accounting`, or `payment_reconciliation`.
3. Contact one candidate with a narrow paid-test ask.
4. Record only a non-secret evidence reference in the local tracker.
5. Run:

```bash
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-one
```

Passing `--require-one` means one candidate was recorded well enough to continue outreach. It does not mean the reviewer pool is ready.

## Ready Pool Workflow

The ready pool gate is stronger than the first-candidate gate. It requires at least four records, one covering each required role, with `contactStatus: "paid_test_ready"` and `readyForPaidTest: true`.

Run:

```bash
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
```

Passing `--require-ready` means the private tracker has enough structure for a human to consider reviewer capacity. It still does not approve launch, payment collection, legal use, or customer delivery.

## Candidate Record

Each local candidate record should use this shape:

```json
{
  "candidateId": "reviewer-001",
  "candidateLabel": "Private reviewer alias",
  "reviewRole": "terms_consumer_law",
  "contactStatus": "contacted",
  "contactedAt": "2026-06-11",
  "scope": "Review TERMOS.md for first Brazil paid pilot offer, refund path, fiscal route, and exclusions.",
  "rateBand": "BRL 150-300 paid test",
  "availability": "Can answer within 2 business days",
  "paidTestTask": "30-minute redline or blocker memo on one customer-facing section.",
  "conflictCheck": "No known conflict recorded by operator",
  "readyForPaidTest": false,
  "humanRecorded": true,
  "evidenceRef": "private-note-2026-06-11-reviewer-001",
  "operatorNotes": ""
}
```

Use aliases if the completed file might be shared with another tool. Keep direct contact details in private notes outside git unless the candidate has approved that storage path.

## Outreach Ask

Use a narrow message:

```text
I am preparing a small Brazil-first paid pilot for Strange Works Studio. I need a short paid review before any live intake. Scope: [role-specific document or route]. Output: a 30-minute blocker memo or redline, not launch approval. Please confirm your rate, availability, conflict concerns, and whether you can do a paid test.
```

Role-specific examples:

| Role | Paid test scope |
| --- | --- |
| `terms_consumer_law` | `TERMOS.md`, refund/cancellation route, fiscal wording, offer exclusions |
| `privacy_lgpd` | `AVISO_DE_PRIVACIDADE.md`, LGPD rights route, retention, processor boundary |
| `tax_nfse_accounting` | entity/CNPJ route, tax regime, CNAE, NFS-e or fiscal receipt path |
| `payment_reconciliation` | hosted invoice route, payout ownership, refund/dispute process, reconciliation cadence |
| `delivery_quality` | delivery acceptance checklist, incident escalation, customer evidence limits |

## Validation Commands

```bash
node tools/validate_reviewer_candidate_tracker.js --template-ok
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-one
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
```

The template command is safe for CI. The local commands should run only against private evidence files that are not committed.
