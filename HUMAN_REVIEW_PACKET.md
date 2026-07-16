# Human Review Packet

This packet is the AI-prepared handoff for the remaining live-intake blockers. It does not approve launch. A responsible human operator, accountant, lawyer, bank, payment provider, or account owner must close the evidence rows before `public-config.js` can move to `liveMode: true`.

If conka8 is handling law-sensitive work, use `CONKA8_LAW_INSTRUCTIONS.md` before collecting or patching any legal/compliance evidence.

Use this packet with:

```bash
node tools/generate_external_live_gap_packet.js
node tools/draft_live_review_closure.js --write-local
node tools/draft_external_live_packet.js --write-local
```

Keep `EXTERNAL_LIVE_PACKET.local.json` local and uncommitted.
Keep `LIVE_REVIEW_CLOSURE.local.json` local and uncommitted. Its schema-v2
document digests bind each approval to the exact normalized bytes reviewed;
regenerate and repeat human review whenever a required document changes.
The resulting public receipt uses schema v4 and replaces the former two-file
legal core with an exact `reviewDocuments` map for all nine canonical paths.
Its monotonic public generation advances on issuance and revocation; local
mutations are serialized, and an open browser cannot accept an older generation
or a different receipt identity at the same observed generation.
Each runtime digest uses `STRANGE_COMPANY_PUBLIC_REVIEW_DOCUMENT_V1`, the
canonical path, and BOM-stripped, LF-normalized UTF-8 text. The map contains
only public document digests; it never contains private packet hashes.

## Nine-Document Runtime Ledger

Every file below must be present in the deployed bundle, match the human-review
closure, and match the browser-recomputed schema-v4 receipt digest:

- `TERMOS.md`
- `TERMS.md`
- `AVISO_DE_PRIVACIDADE.md`
- `PRIVACY.md`
- `BRAZIL_COMPLIANCE.md`
- `BRAZIL_COMPLIANCE_AGENTS.md`
- `CONKA8_LAW_INSTRUCTIONS.md`
- `AI_LEGAL_HANDOFF.md`
- `HUMAN_REVIEW_PACKET.md`

## Current Gate Shape

Refresh the current state from the checkout:

```bash
node tools/generate_external_live_gap_packet.js
```

At the time this packet was created, the repo already had:

- support inbox evidence recorded,
- Google Form public URL created,
- Google Form linked to the private Sheet,
- safe Google Form test response recorded,
- Brazil-first public config posture,
- AI-generated legal/compliance material forced through human review,
- live mode still disabled.

The remaining live blockers are outside-repo evidence: human terms review, human privacy review, Brazil compliance review, AI handoff review, Stripe route, bank route, and final attestation.

Local evidence status, evolution goal status, and the next-action packet report
one of four phases: `missing`, `invalid`, `document_ready_unbound`, or
`config_bound_ready`. A packet with valid document digests but dates not yet
copied into the current public config is only `document_ready_unbound`; render
its date-only patch, keep `liveMode: false`, then run the strict config-bound
validator. VAU remains blocked and closure-first until all four dates and that
binding pass together.

## AI Can Prepare

AI may prepare:

- terms/privacy review questions,
- Brazil compliance review checklist,
- Google Form field list and Apps Script instructions,
- Stripe and bank evidence labels,
- `EXTERNAL_LIVE_PACKET.local.json` draft structure,
- public config patch with placeholders,
- validation commands and stop rules.

AI must not:

- invent review dates,
- mark Google Form verification complete,
- claim legal/accounting/tax approval,
- create or approve CNPJ, bank, Stripe, NFS-e, or public authority records,
- set `liveMode: true`.

## Manual Close Sheet

Fill this sheet outside the repo before editing `public-config.js`.

```text
operator_name:
responsible_human:
support_email:
support_owner:
support_monitoring_cadence:
support_test_received_at:
support_test_replied_at:

google_form_public_url:
google_sheet_private_url:
google_test_response_timestamp:
requests_header_verified:
invoices_header_verified:
leads_header_verified:
form_linked_to_sheet:

terms_reviewer:
terms_reviewed_at:
privacy_reviewer:
privacy_reviewed_at:
support_reviewed_at:

brazil_compliance_reviewer:
brazil_compliance_reviewed_at:
cnpj_or_entity_route:
tax_regime_or_accountant_note:
nfse_or_receipt_route:
lgpd_contact_path:

ai_handoff_reviewer:
ai_handoff_reviewed_at:
ai_outputs_reviewed:
ai_outputs_rejected_or_changed:
automated_decision_stop_rule_confirmed:

stripe_dashboard_url:
stripe_test_invoice_id:
stripe_test_hosted_invoice_url:
stripe_payout_route_verified_by:
stripe_reconciliation_owner:
stripe_weekly_reconciliation_day:

bank_entity_name:
responsible_party_recorded:
bank_name:
bank_account_last4:
stripe_payout_test_status:
bank_reconciliation_owner:

attesting_operator:
attestation_reviewed_at:
no_secrets_in_repo:
strange_company_remains_sealed:
satellite_is_revenue_operator:
```

## Human Review Tasks

| Gate | Human owner | Evidence to close | Public config field |
| --- | --- | --- | --- |
| Google Form URL | account owner/operator | Closed 2026-05-24: public Form URL starts with `https://docs.google.com/forms/` and is linked to the private Sheet | `googleFormUrl` |
| Google Form test row | operator | Closed 2026-05-24: safe test response reached the private Sheet | `googleFormVerified` |
| Terms review | operator/lawyer | `TERMOS.md`, `TERMS.md`, offer, refund/cancellation, support, and invoice flow reviewed | `termsReviewedAt` |
| Privacy review | operator/lawyer | `AVISO_DE_PRIVACIDADE.md`, `PRIVACY.md`, LGPD contact, retention, processors, and rights path reviewed | `privacyReviewedAt` |
| Brazil compliance review | operator/accountant/lawyer | `BRAZIL_COMPLIANCE.md`, `BRAZIL_COMPLIANCE_AGENTS.md`, `CONKA8_LAW_INSTRUCTIONS.md`, CNPJ/entity route, NFS-e or fiscal receipt route, payment support, tax/accounting note, and LGPD route reviewed | `brazilComplianceReviewedAt` |
| AI handoff review | operator/lawyer | `AI_LEGAL_HANDOFF.md` and `HUMAN_REVIEW_PACKET.md`; AI-prepared legal/compliance text accepted, changed, or rejected by a human | `aiHandoffReviewedAt` |
| Stripe route | operator/accountant | Hosted Invoices enabled, test invoice created, payout route and reconciliation owner confirmed | local packet only |
| Bank route | operator/accountant | Business bank/account route and responsible party recorded | local packet only |
| Final attestation | responsible operator | No secrets in repo, Strange Company remains sealed, satellite is revenue operator | local packet only |

## Repeatable Delivery Checklist

Use this section every time the project advances one review gate:

1. Run `node tools/generate_external_live_gap_packet.js`.
2. Copy the produced field names into the manual close sheet.
3. For the four public review-date fields only, generate or update `LIVE_REVIEW_CLOSURE.local.json`, confirm that each human reviewed the exact files represented by its path-bound digests, and run:
   - `node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready`
   - `node tools/render_live_review_public_config_patch.js LIVE_REVIEW_CLOSURE.local.json`
   - if both pass, copy only `termsReviewedAt`, `privacyReviewedAt`, `brazilComplianceReviewedAt`, and `aiHandoffReviewedAt` into `public-config.js`; keep `liveMode: false`.
   - run `node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js` and stop unless the dates and all nine document digests remain bound.
   - run `node tools/check_live_review_closure_conformance.js` and stop if the status surfaces disagree on phase or VAU disagrees on closure readiness, blocking, or first hard-gate priority.
4. Validate final live readiness only after payment, bank, support, Google, and attestation evidence also exists:
   - `node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js`
   - `node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js`
     (expecting `--require-live` only when all blockers are closed)
   - `node tools/check_external_live_packet_gate.js`
5. Close the private operational-readiness lanes:
   - update `REVIEWER_CANDIDATE_TRACKER.local.json` for new contacts,
   - run `node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-one` after first contact,
   - run `node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready` once roles are filled,
   - complete `DELIVERY_REVIEW_CHECKLIST.local.json` and run `node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready`.
6. Export the public-only receipt while `liveMode` remains `false`, then run the pre-live checks:
   - `node tools/export_public_live_receipt.js --live-review-closure LIVE_REVIEW_CLOSURE.local.json --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force`
   - `node tools/export_public_live_receipt.js --check-public-js --require-issued`
   - `node tools/preflight_public_launch.js`
   - `node tools/evolution_goal_status.js --json`
   - `node tools/check_live_review_closure_conformance.js`
7. Only when all checked items are complete, external Form responses remain
   disabled, status has no hard, public-route, or operational blockers, and a
   human approves the decision, make the separate `liveMode: true` change; run
   `node tools/preflight_public_launch.js --deployment`, publish the issued
   receipt and live config together, verify Pages, and only then enable responses.

If any item fails, keep `liveMode: false`, record the failure, and repeat the same checklist.

If a gate fails after `liveMode` is already true, disable external Form
responses first. Run `node tools/render_public_live_shutdown_patch.js`, apply
only its blank `googleFormUrl`, false `googleFormVerified`, and false `liveMode`
values, revoke the receipt, run the deployment preflight, and publish the closed
config plus placeholder together before repairing or reissuing evidence.

Use ISO dates: `YYYY-MM-DD`. Review dates must be the real human review dates and
cannot be in the future. Support received/replied and Google Form test times must
be ISO-8601 UTC timestamps ending in `Z`, correctly ordered, and no older than 30
days when strict live validation runs.

## Public Config Patch Values

Only after the manual close sheet is complete, patch public-safe values:

```js
googleFormUrl: "https://docs.google.com/forms/...",
googleFormVerified: true,
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: false,
```

Do not put Sheet URLs, Stripe dashboard URLs, bank metadata, tax IDs, private reviewer notes, or credentials in `public-config.js`.

## Local Packet Evidence Map

Complete `EXTERNAL_LIVE_PACKET.local.json` from real evidence:

| Packet section | Required evidence |
| --- | --- |
| `support` | support email, owner, monitoring cadence, received/replied test timestamps, verified flag |
| `google` | private Sheet URL, public Form URL, test response timestamp, tab/header checks, verified flag |
| `legalReview` | terms, privacy, support, Brazil compliance, AI handoff dates, reviewer |
| `stripe` | dashboard URL, test invoice id, hosted invoice URL, payout verifier, reconciliation owner |
| `bank` | entity name, responsible party, bank name, last4, payout test status, reconciliation owner |
| `publicConfig` | only public-safe values matching the intended `public-config.js` patch |
| `attestation` | operator, reviewed date, no-secrets, sealed-company, satellite-operator confirmations |

## Final Validation

Run this sequence before publishing:

```bash
node tools/check_external_live_packet_gate.js
node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
node tools/export_public_live_receipt.js --live-review-closure LIVE_REVIEW_CLOSURE.local.json --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force
node tools/export_public_live_receipt.js --check-public-js --require-issued
node tools/preflight_public_launch.js
node tools/evolution_goal_status.js --json
node tools/survival_check.js
```

If any command fails, keep `liveMode: false`. If all pass and status has no hard, public-route, or operational blockers, review the receipt before the separate human `liveMode` decision.

## Stop Rules

Stop and keep live intake closed if:

- any of the nine required review documents changed after review and the schema-v2 closure digest plus schema-v4 public receipt were not regenerated and re-reviewed,
- CNPJ/entity, NFS-e, fiscal receipt, payment, or LGPD route is uncertain,
- Stripe or bank evidence is missing,
- AI-generated legal/compliance text is being treated as final human approval,
- local packet evidence contains secrets that would be unsafe to commit.
