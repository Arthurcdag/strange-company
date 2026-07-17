# conka8 Law Instructions

These instructions are for conka8 when working on anything that touches law, legal review, compliance, privacy, tax, payments, customer support, public offer copy, or launch readiness for Strange Company / Strange Works Studio.

This file is not legal advice. It is an operating checklist for separating AI-prepared work from human legal/accounting/operator approval.

## First Rule

Do not set `liveMode: true`, `googleFormVerified: true`, `brazilComplianceReviewedAt`, or `aiHandoffReviewedAt` unless the evidence is real, reviewed, and recorded outside the repo.

If evidence is missing, leave live intake blocked and produce a handoff packet instead.

## Read These First

Start with these repo files, in this order:

1. `BRAZIL_COMPLIANCE.md`
2. `HUMAN_REVIEW_PACKET.md`
3. `AI_LEGAL_HANDOFF.md`
4. `EXTERNAL_LIVE_CONTROLS.md`
5. `TERMOS.md`
6. `AVISO_DE_PRIVACIDADE.md`
7. `TERMS.md`
8. `PRIVACY.md`
9. `SUPPORT.md`
10. `RUN_LIVE_PILOT.md`

Then refresh the actual current gate state:

```bash
node tools/generate_external_live_gap_packet.js
node tools/audit_company_functionality.js --require-live
```

`--require-live` is expected to fail until the outside evidence is complete.

## What conka8 Can Do Now

conka8 can safely prepare:

- review questions for a lawyer, accountant, or responsible operator,
- updated draft terms/privacy/support language,
- a Brazil compliance checklist,
- a Google Form and Sheet verification checklist,
- a local-only `EXTERNAL_LIVE_PACKET.local.json` draft,
- a public config patch proposal with placeholders,
- an issue/PR checklist for the remaining human evidence,
- notes comparing repo text against official source links.

conka8 must label all legal, tax, fiscal, privacy, consumer-law, and payment conclusions as "needs human review" unless a responsible reviewer has already supplied real evidence.

## What conka8 Must Not Do

conka8 must not:

- choose the legal entity, CNPJ route, tax regime, CNAE, or NFS-e process,
- claim lawyer, accountant, bank, Stripe, Google, or public-authority approval,
- invent review dates or backdate evidence,
- treat AI-generated terms/privacy/compliance text as final approval,
- process customer secrets, bank data, tax IDs, health data, credentials, private keys, or payment-card data,
- commit `EXTERNAL_LIVE_PACKET.local.json`,
- commit Sheet URLs, Stripe dashboard URLs, bank metadata, tax documents, private reviewer notes, or credentials,
- decide a customer refund, cancellation, complaint, eligibility, privacy request, or incident outcome without a human operator.

## Law-Sensitive Areas

Use this matrix for every law-related task.

| Area | conka8 prepares | Human/outside reviewer closes | Evidence |
| --- | --- | --- | --- |
| Entity/CNPJ | route questions, evidence slots, public copy boundaries | founder/accountant/lawyer confirms operating entity | CNPJ artifact or counsel/accountant note |
| Tax/NFS-e | fiscal checklist, invoice packet fields, ledger fields | accountant confirms tax regime, CNAE, municipal registration, NFS-e or receipt route | accountant note, portal/test receipt evidence |
| Consumer law | offer clarity, refund/cancellation questions, support wording | lawyer/operator reviews actual offer, cancellation, refund, right-of-regret, support process | reviewed `TERMOS.md` / `TERMS.md` date |
| LGPD/privacy | data map, privacy questions, sensitive-data rejection wording | controller/lawyer confirms legal bases, processors, retention, transfer, data-subject rights path | reviewed `AVISO_DE_PRIVACIDADE.md` / `PRIVACY.md` date and LGPD contact |
| Marco Civil | access-log and application-data questions | lawyer/operator decides whether retention duties apply to the real deployment | retention decision note |
| AI use | AI boundary and human-review workflow | operator/lawyer approves AI-prepared legal/compliance text | `aiHandoffReviewedAt` evidence |
| Payments | no-card-data public flow, hosted-invoice checklist | Stripe/bank/operator confirms payout, refunds, reconciliation | dashboard/test invoice/bank evidence in local packet |
| Support/incidents | support script and incident escalation checklist | operator/lawyer confirms response owner, incident notices, customer path | inbox test and escalation owner |

## Required Review Questions

Before any public config change, answer these in writing:

- Who is the real operator that customers contract with?
- Is there a CNPJ/entity route or written professional note approving the temporary route?
- Can the operator issue the required fiscal document or receipt?
- What tax/accounting owner reconciles invoice, payment, Sheet, and fiscal records?
- Does the offer copy match the actual service and price?
- Does the refund/cancellation/right-of-regret language match the real sales path?
- Is the support inbox monitored by a responsible human?
- What customer data is collected, why, where is it stored, and how can it be deleted or answered under LGPD?
- Are sensitive documents, tax IDs, bank data, health data, payment-card data, credentials, and regulated source documents blocked?
- Are AI-prepared legal/compliance drafts accepted, changed, or rejected by a responsible human?
- Does the local live packet pass without secrets in the repo?

## Evidence Fields conka8 Must Collect

Use `HUMAN_REVIEW_PACKET.md` as the close sheet. At minimum, collect:

```text
terms_reviewer:
terms_reviewed_at:
privacy_reviewer:
privacy_reviewed_at:
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
```

Use ISO dates: `YYYY-MM-DD`. The date is the actual human review date, not the commit date unless the review happened that day.

## Public Config Rule

Only public-safe fields may go into `public-config.js`. The four review dates
below are binder-owned: record real dates in `LIVE_REVIEW_CLOSURE.local.json`,
validate its exact reviewed-document digests, inspect the local-only binder
plan, and apply only that unchanged plan. Never copy these dates manually.

```js
googleFormUrl: "https://docs.google.com/forms/...",
googleFormVerified: true,
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: false,
```

Never put private Sheet URLs, Stripe dashboard URLs, bank details, CNPJ documents, tax IDs, reviewer notes, or credentials in `public-config.js`. Keep `liveMode` false through the canonical pre-live validation sequence; a human flip is separate.

## Final Commands Before Any Legal Launch Change

Run all commands from the repo root:

```bash
node tools/check_external_live_packet_gate.js
node tools/validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready
node tools/bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json
node tools/bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --apply --expect-plan-id <PLAN_ID>
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

Run this sequence only with an unpublished local `public-config.js`,
`liveMode: false`, and external Form responses disabled. The binder plan and
PLAN_ID remain local because they commit to private closure evidence. If any
command fails, conka8 must keep `liveMode: false` and report
the blockers. If all pass, a human may make the separate live-flag change, then
must run `node tools/preflight_public_launch.js --deployment`, publish the
issued receipt and live config together, and enable Form responses only after
the Pages deployment is verified.

## PR / Commit Rules

For law-related commits:

- include the exact docs changed,
- say whether the change is AI-prepared draft or human-reviewed,
- name the evidence source without exposing private data,
- keep public/private data boundaries intact,
- do not squash away evidence-gate changes unless the reviewer requests it,
- do not merge live config changes until `--require-live` passes.

## Stop Rules

Stop and ask for human review if:

- a reviewer asks for a legal conclusion,
- a customer dispute, refund, complaint, privacy request, or incident appears,
- the operator route, tax route, NFS-e route, LGPD route, payment route, or support route is uncertain,
- a file asks AI to make final legal, tax, accounting, fiscal, privacy, consumer-law, or payment-risk decisions,
- sensitive data appears in a public file or proposed commit.

## Official Reference Links

Use official sources when updating review questions:

- LGPD: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- ANPD privacy notice structure: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade
- Marco Civil da Internet: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- Brazilian Consumer Code: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- E-commerce decree: https://www.planalto.gov.br/ccivil_03/_Ato2011-2014/2013/Decreto/D7962.htm
