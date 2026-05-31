# Brazil Compliance Gate

This gate turns Strange Works Studio toward a Brazil-first launch path. It does not certify compliance. It separates what the repo and AI can prepare from what a responsible human, accountant, lawyer, bank, payment provider, or public authority must confirm.

## Launch Rule

Keep `public-config.js` at `liveMode: false` until every Brazil gate below has outside evidence and the required checks pass.

Use [REVENUE_SETUP_EVIDENCE_PACKET.md](REVENUE_SETUP_EVIDENCE_PACKET.md), [REVENUE_SETUP_OUTREACH_PACKET.md](REVENUE_SETUP_OUTREACH_PACKET.md), and [REVENUE_SETUP_EVIDENCE_INDEX.template.json](REVENUE_SETUP_EVIDENCE_INDEX.template.json) to collect the first public-safe evidence references for entity/CNPJ, tax/NFS-e, payment, LGPD, support, and terms review. Private artifacts must stay outside the public repo.

Required checks:

```bash
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
```

## Gate Matrix

| Area | Repo/AI can prepare | Human/outside action required | Evidence to record |
|---|---|---|---|
| Operating entity | checklist, evidence slot, public copy boundary | choose structure, open/confirm CNPJ or approved operating route | entity/CNPJ artifact or counsel/accountant note |
| Tax route | NFS-e checklist, invoice packet fields, ledger format | accountant confirms tax regime, CNAE, municipal registration, NFS-e process | accountant note, portal URL, test NFS-e evidence |
| Consumer law | Portuguese terms draft, offer clarity checklist, support stop rules | counsel/operator reviews offer, cancellation, refund, SAC/support process | reviewed `TERMOS.md`, support route owner |
| LGPD | Portuguese privacy notice draft, data minimization guards, sensitive-data rejection | controller confirms legal bases, processor list, retention, international transfers, data-subject request process | reviewed `AVISO_DE_PRIVACIDADE.md`, LGPD contact path |
| Marco Civil | log/retention note, application-data boundary | counsel/operator confirms whether access-log retention duties apply to the real deployment | retention decision note |
| AI use | AI boundary, human-review workflow, automated-decision stop rule | operator reviews AI outputs and blocks any solely automated rights-impacting decision | AI review record and owner |
| Payments | manual payment instructions, no-card-data public site | bank/payment provider setup and payout verification | payment dashboard URL, test invoice/receipt |
| Support/incidents | incident form, support doc, stop rules | monitored inbox, response ownership, incident-notice legal review | inbox test, incident escalation owner |

## Public Offer Requirements

Before live intake, the public offer must state:

- who the operator is,
- what service is being sold,
- what is excluded,
- price/currency and payment path,
- support route,
- cancellation/refund route if applicable,
- data boundary and privacy notice,
- no legal/tax/accounting advice unless a separate reviewed agreement exists.

## LGPD Minimum Data Map

The operator must complete this before collecting real customer data:

| Data | Purpose | Legal basis | Storage | Retention | Deletion path |
|---|---|---|---|---|---|
| Customer name/company | qualify and deliver request | to review | Sheet/local ops | to review | support request |
| Contact email | support and delivery | to review | Sheet/email/local ops | to review | support request |
| Service scope | qualify and deliver request | to review | Sheet/local ops | to review | support request |
| Invoice/payment status | bookkeeping | legal obligation/contract to review | payment provider/Sheet | to review | legal retention applies |
| Incident notes | safety and support | legal basis to review | Sheet/local ops | to review | reviewed deletion path |

## AI Work Boundary

AI may:

- draft terms, privacy, support, and checklist language,
- inspect repo files for mismatches,
- generate evidence packets and handoff checklists,
- summarize non-sensitive operational status,
- flag missing gates.

AI may not:

- choose the legal entity or tax regime,
- create CNPJ, municipal registration, bank, payment, or NFS-e accounts,
- sign contracts,
- issue legal, tax, accounting, or regulatory advice,
- decide a customer's refund, cancellation, eligibility, privacy request, or complaint without human review,
- process sensitive data in this prototype.

## Stop Rules

Pause intake and keep or return `liveMode` to `false` if:

- the CNPJ/entity route is uncertain,
- NFS-e or tax treatment is not ready,
- support inbox is not monitored,
- a privacy request cannot be answered,
- a customer submits sensitive data or regulated documents,
- payment and fiscal records do not reconcile,
- terms/privacy need unscheduled changes,
- AI output is being used as final legal/tax/compliance judgment.

## Reference Sources

- LGPD: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- ANPD privacy notice structure: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade
- ANPD cookies guidance: https://www.gov.br/anpd/pt-br/assuntos/noticias-periodo-eleitoral/anpd-lanca-guia-orientativo-201ccookies-e-protecao-de-dados-pessoais201d
- Marco Civil da Internet: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- Brazilian Consumer Code: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- E-commerce decree: https://www.planalto.gov.br/ccivil_03/_Ato2011-2014/2013/Decreto/D7962.htm
