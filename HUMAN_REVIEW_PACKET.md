# Human Review Packet

This packet is the AI-prepared handoff for the remaining live-intake blockers. It does not approve launch. A responsible human operator, accountant, lawyer, bank, payment provider, or account owner must close the evidence rows before `public-config.js` can move to `liveMode: true`.

Use this packet with:

```bash
node tools/generate_external_live_gap_packet.js
node tools/draft_external_live_packet.js --write-local
```

Keep `EXTERNAL_LIVE_PACKET.local.json` local and uncommitted.

## Current Gate Shape

Refresh the current state from the checkout:

```bash
node tools/generate_external_live_gap_packet.js
```

At the time this packet was created, the repo already had:

- support inbox evidence recorded,
- Brazil-first public config posture,
- AI-generated legal/compliance material forced through human review,
- live mode still disabled.

The remaining live blockers are outside-repo evidence: Google Form creation and test response, human terms review, human privacy review, Brazil compliance review, AI handoff review, Stripe route, bank route, and final attestation.

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
| Google Form URL | account owner/operator | Public Form URL starts with `https://docs.google.com/forms/` and is linked to the private Sheet | `googleFormUrl` |
| Google Form test row | operator | Safe test response reaches the private Sheet | `googleFormVerified` |
| Terms review | operator/lawyer | `TERMOS.md`, `TERMS.md`, offer, refund/cancellation, support, and invoice flow reviewed | `termsReviewedAt` |
| Privacy review | operator/lawyer | `AVISO_DE_PRIVACIDADE.md`, `PRIVACY.md`, LGPD contact, retention, processors, and rights path reviewed | `privacyReviewedAt` |
| Brazil compliance review | operator/accountant/lawyer | CNPJ/entity route, NFS-e or fiscal receipt route, payment support, tax/accounting note, LGPD route | `brazilComplianceReviewedAt` |
| AI handoff review | operator/lawyer | AI-prepared legal/compliance text accepted, changed, or rejected by a human | `aiHandoffReviewedAt` |
| Stripe route | operator/accountant | Hosted Invoices enabled, test invoice created, payout route and reconciliation owner confirmed | local packet only |
| Bank route | operator/accountant | Business bank/account route and responsible party recorded | local packet only |
| Final attestation | responsible operator | No secrets in repo, Strange Company remains sealed, satellite is revenue operator | local packet only |

Use ISO dates: `YYYY-MM-DD`. Review dates must be the real human review dates.

## Public Config Patch Values

Only after the manual close sheet is complete, patch public-safe values:

```js
googleFormUrl: "https://docs.google.com/forms/...",
googleFormVerified: true,
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: true,
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
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
node tools/survival_check.js
```

If any command fails, keep `liveMode: false`.

## Stop Rules

Stop and keep live intake closed if:

- Google Form is not created or not linked to the Sheet,
- no safe test response landed in the Sheet,
- terms or privacy changed after review and were not re-reviewed,
- CNPJ/entity, NFS-e, fiscal receipt, payment, or LGPD route is uncertain,
- Stripe or bank evidence is missing,
- AI-generated legal/compliance text is being treated as final human approval,
- local packet evidence contains secrets that would be unsafe to commit.
