# Revenue Setup Evidence Packet

This packet is the AI-prepared handoff for the seven revenue-setup gates in `HUMAN_REVENUE_INSTRUCTIONS.md`. It does not approve live intake. A responsible human operator, accountant, lawyer, bank, payment provider, or account owner must close the evidence rows before Strange Works Studio can request real customer money.

If conka8 is handling law-sensitive work, use `CONKA8_LAW_INSTRUCTIONS.md` before collecting or patching any legal/compliance evidence.

Use this packet alongside:

- `HUMAN_REVENUE_INSTRUCTIONS.md` (the seven gate runbook)
- `REVENUE_SETUP_OUTREACH_PACKET.md` (lead qualification, invoice request, refund script)
- `REVENUE_SETUP_EVIDENCE_INDEX.template.json` (blank evidence index; completed copy stays local and uncommitted as `REVENUE_SETUP_EVIDENCE_INDEX.local.json`)
- `HUMAN_REVIEW_PACKET.md` and `EXTERNAL_LIVE_PACKET.template.json` (existing pre-launch evidence)

## Scope Boundary

Strange Company does not receive customer money. This packet only covers the Strange Works Studio satellite revenue lane:

```text
External customer -> Strange Works Studio -> business bank/payment route -> fiscal receipt/NFS-e -> private ledger -> delivery receipt
```

## AI Can Prepare

AI may prepare:

- the gate checklist, evidence row labels, and stop rules,
- non-secret reviewer questions for entity, tax, payment, support, privacy, terms, and intake,
- a blank evidence index (`REVENUE_SETUP_EVIDENCE_INDEX.template.json`),
- the outreach scripts in `REVENUE_SETUP_OUTREACH_PACKET.md`,
- validation commands and the daily routine summary.

AI must not:

- invent CNPJ numbers, tax regimes, CNAE codes, bank accounts, payment-provider IDs, or fiscal document IDs,
- claim accountant, lawyer, bank, payment-provider, or LGPD approval,
- mark any gate verified,
- decide refund, cancellation, or consumer-law outcomes,
- set `liveMode: true` or change support/Google Form/review-date fields in `public-config.js`,
- alter the Operations dashboard URL allowlist (`https://invoice.stripe.com/`) without a tested code change.

## Manual Close Sheet

Fill this sheet outside the repo. Keep the completed copy in the operator's private notes and reference its non-secret ID inside `REVENUE_SETUP_EVIDENCE_INDEX.local.json`.

```text
responsible_operator:
legal_business_name:
cnpj_or_route:
business_address_for_invoices:
support_owner:
accounting_owner:
lgpd_privacy_owner:
payment_reconciliation_owner:
refund_owner:
daily_inbox_check_time:

entity_evidence_id:
entity_reviewer_name:
entity_review_date:
allowed_to_invoice_services:
entity_blockers:

tax_evidence_id:
tax_regime:
cnae:
nfse_route:
municipal_registration_needed:
fiscal_document_owner:
test_nfse_or_receipt_status:
accountant_reviewed_at:
monthly_reconciliation_owner:

payment_evidence_id:
provider:
business_account_name:
payout_destination_verified:
test_payment_id:
test_payout_status:
refund_test_or_procedure:
chargeback_or_dispute_procedure:
fees_reviewed:
payment_reconciliation_owner:

support_evidence_id:
support_email:
support_test_sent_at:
support_test_received_at:
support_daily_check_time:
incident_owner:
support_refund_owner:
support_privacy_owner:

privacy_evidence_id:
privacy_reviewed_at:
lgpd_contact:
processor_list_location:
retention_decision:
rights_request_owner:
sensitive_data_boundary_confirmed:

terms_evidence_id:
terms_reviewed_at:
terms_reviewer:
refund_path:
cancellation_path:
customer_type:
offer_scope_confirmed:

ledger_evidence_id:
google_form_url:
google_sheet_url:
test_submission_id:
ledger_tabs_verified:
ledger_owner:
```

## Gate Map

| Gate | Human owner | Evidence to close | Stop rule |
| --- | --- | --- | --- |
| 1. Entity and authority | operator/lawyer/accountant | CNPJ or approved operating route, signer, address, service-invoicing authority | Entity or CNPJ uncertain |
| 2. Tax, CNAE, NFS-e | accountant | Tax regime, CNAE, municipal registration, NFS-e or fiscal route, test receipt, reconciliation owner | Fiscal route blocked or unreconciled |
| 3. Business bank and payment route | operator/accountant/provider | Business account, provider choice, payout/fees/refund/dispute review, test payment, reconciliation owner | Personal/unverified account, or no refund/reconciliation owner |
| 4. Support and incident route | operator/support owner | Reachable inbox, test email, daily review time, labels, escalation owner | No human able to answer support, refund, privacy, or complaint messages |
| 5. LGPD and customer data boundary | operator/privacy owner/counsel | LGPD bases, retention, processors, transfers, rights path, sensitive-data rejection at intake | Customer sent sensitive data or privacy request cannot be answered by a human |
| 6. Terms, refunds, public offer | operator/lawyer | Reviewed `TERMOS.md`, scope/exclusions, refund/cancellation language, customer type | AI-only terms or unclear refund/cancellation language |
| 7. Intake form and Sheet ledger | operator/ledger owner | Form writes to intended Sheet, minimal fields, sensitive-data warnings, six tabs present, exact column names, allowed status values | Form writes to wrong Sheet or Sheet holds sensitive data |

Use ISO dates: `YYYY-MM-DD`. Review dates must be the real human review dates.

## Public Config Patch Values

Only after every gate above closes, patch the public-safe fields. These must match both local packets, except for the intentional phase field: `public-config.js`, the revenue packet, and the receipt stay at `liveMode: false`, while the external-live packet uses local `publicConfig.liveMode: true` as the post-decision target required by `--require-live`. The binding ignores only that one field:

```js
supportEmail: "reviewed support email",
googleFormUrl: "reviewed Google Form URL",
supportInboxVerified: true,
googleFormVerified: true,
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: false
```

Do not put Sheet URLs, Stripe dashboard URLs, bank metadata, tax IDs, CPF, CNPJ artifacts, private reviewer notes, or credentials in `public-config.js`. Keep `liveMode` false until the bound validators, receipt export/check, preflight, and status review all pass; the human flip is a separate decision.

## Evidence Index Map

Each section of `REVENUE_SETUP_EVIDENCE_INDEX.local.json` records only non-secret evidence references. The actual evidence (PDFs, screenshots, dashboard exports, signed contracts) stays in the operator's private storage.

| Index section | What goes in | What does not go in |
| --- | --- | --- |
| `operator` | Names, owners, daily inbox check time | CPF, RG, home addresses, signed contracts |
| `entity` | Non-secret CNPJ-route ID, reviewer name, review date, authority confirmation | CNPJ PDF, contrato social, articles of association |
| `tax` | Tax regime label, CNAE code, NFS-e route name, accountant review date | Municipal portal screenshots, tax-portal exports |
| `payment` | Provider name, evidence ID, test payment ID, payout status text | Card data, full account numbers, provider API keys |
| `support` | Support email, test timestamps, owner name, daily cadence | Inbox archives, personal email threads |
| `privacy` | LGPD contact name, review date, processor list location, retention decision | Customer data, DPIA contents, internal counsel memos |
| `terms` | Review date, reviewer, refund and cancellation path summary | Customer contracts, fee schedules |
| `ledger` | Google Form public URL, private Sheet URL, test submission ID, tabs verified flag | Ledger row contents, customer rows |
| `publicConfig` | Only the public-safe values matching the intended `public-config.js` patch | Anything not allowed in `public-config.js` |
| `attestation` | Operator name, attestation date, sealed-prototype/satellite-revenue confirmations | Signatures, personal IDs |

## Final Validation

Run before requesting any customer payment:

```bash
node --check public-config.js
node --check public.js
node --check script.js
node tools/check_external_live_packet_gate.js
node tools/draft_revenue_setup_evidence_index.js --write-local
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-payment
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-tax
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js
node tools/validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
node tools/export_public_live_receipt.js --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force
node tools/export_public_live_receipt.js --check-public-js --require-issued
node tools/preflight_public_launch.js
node tools/evolution_goal_status.js --json
node tools/survival_check.js
python -B -m unittest discover -s tests
```

Run the bound validators and receipt export only after the reviewed public dates are in `public-config.js` with `liveMode: false`. If any command fails, keep `liveMode: false`, record the blocker in the manual close sheet, and fix the outside evidence before retrying. If all pass, the human `liveMode` flip remains a separate decision followed by `node tools/preflight_public_launch.js --deployment` before publication.

## Stop Rules

Stop and keep live intake closed if:

- the entity or CNPJ route is uncertain,
- the NFS-e or fiscal receipt route is blocked or unreconciled,
- the payment route lacks refund or reconciliation ownership,
- the support inbox is unmonitored or the daily routine has lapsed,
- a privacy request is open or sensitive data has been received,
- terms or privacy text changed after review and were not re-reviewed,
- AI-generated legal, tax, accounting, privacy, payment, refund, or consumer text is being treated as final human approval,
- the local evidence index contains secrets that would be unsafe to commit.
