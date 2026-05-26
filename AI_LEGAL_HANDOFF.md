# AI Legal Handoff

This file is the handoff between AI-prepared work and the human/legal/accounting work that cannot be delegated to AI.

Use `HUMAN_REVIEW_PACKET.md` as the live-intake close sheet for collecting the actual human review dates, Brazil compliance review, AI handoff review, Google Form evidence, Stripe route, bank route, and final attestation.

Use `CONKA8_LAW_INSTRUCTIONS.md` when conka8 is working on law-sensitive repo changes, review packets, or live-intake evidence.

## What AI Prepared

- Brazil-first customer-facing Portuguese `TERMOS.md` draft.
- Brazil-first customer-facing Portuguese `AVISO_DE_PRIVACIDADE.md` draft.
- English operator-reference `TERMS.md` draft.
- English operator-reference `PRIVACY.md` draft.
- Brazil compliance gate in `BRAZIL_COMPLIANCE.md`.
- Setup Evidence slots for CNPJ/entity, tax regime, NFS-e, LGPD contact, support, ledger, intake, payment, terms, and privacy.
- Preflight checks that reject live readiness when the Brazil compliance docs drift or disappear.

## Human Review Queue

| Priority | Task | Owner | Evidence |
|---|---|---|---|
| P0 | Confirm operating entity and CNPJ route | founder/accountant/lawyer | CNPJ or reviewed entity note |
| P0 | Confirm tax regime, CNAE, municipal registration, and NFS-e flow | accountant | accountant note and test NFS-e |
| P0 | Review `TERMOS.md` for the real offer, refund/cancellation process, right-of-regret exposure, fiscal route, and consumer-law exposure | lawyer/operator | reviewed date in Operations |
| P0 | Review `AVISO_DE_PRIVACIDADE.md`, LGPD legal bases, retention, processor list, international transfers, cookie/log posture, and rights request process | lawyer/operator | reviewed date and LGPD contact path |
| P0 | Verify support inbox and incident escalation owner | operator | inbox test and owner note |
| P1 | Confirm payment provider, payout account, refund path, and reconciliation cadence | operator/accountant | payment dashboard and test invoice |
| P1 | Confirm whether Marco Civil access-log retention duties apply to the real deployment | lawyer/operator | retention decision note |
| P1 | Review AI-use boundary and prohibit solely automated rights-impacting decisions | operator/lawyer | AI review note |

## Manual Evidence Checklist

Record each item in the private Setup Evidence panel. Use redacted `https://` evidence where possible.

- CNPJ/entity artifact or counsel/accountant approval.
- Tax regime/CNAE/accounting note.
- NFS-e portal or tested receipt route.
- Business bank or payment account verification.
- Payment processor dashboard or test hosted invoice.
- Monitored support inbox test.
- Google Sheet ledger URL.
- Google Form intake URL and safe test response.
- Portuguese terms review date.
- Portuguese privacy notice review date.
- LGPD contact or encarregado route.

## AI Output Rules

AI output can speed drafting, but every customer-facing or legally relevant result must be reviewed by a responsible human before use.

AI output must be treated as draft when it concerns:

- legal structure,
- tax regime,
- NFS-e/receipt handling,
- consumer cancellation/refund rules,
- privacy legal bases,
- incident notification,
- contractual exclusions,
- automated decisions under LGPD.

## Final Launch Question

Before setting `liveMode: true`, answer yes to all:

- Is the Brazilian operator real and identified?
- Can the operator issue the required fiscal document or receipt?
- Can the operator answer LGPD rights requests?
- Can the operator support refunds/cancellations/incidents?
- Are terms and privacy reviewed for the actual offer?
- Can payment, Sheet, NFS-e/receipt, and Operations records reconcile?
- Did a human approve all AI-generated legal/compliance copy?
