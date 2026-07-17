# Brazil Compliance Agents

These agents are private operator queues for the Brazil-first launch. They do not automate law, tax, accounting, privacy, banking, payment-provider approval, or public-authority filings. They prepare checklists and handoff packets so a human can close the missing evidence faster.

The private Operations console renders the agents from Setup Evidence. Each agent has three lanes:

- **AI prepares**: draft checklist, review prompt, test script, or handoff packet.
- **Human closes**: founder, operator, lawyer, accountant, bank, payment provider, or public authority performs the real-world action.
- **Evidence required**: external proof is recorded in Setup Evidence with an HTTPS reference, operator note, and status.

## Agent Roster

| Agent | Linked evidence | AI can prepare | Human must close |
| --- | --- | --- | --- |
| Entity/CNPJ agent | `entity` | Entity route comparison and evidence packet template | CNPJ or approved operating structure |
| Tax/NFS-e agent | `tax-regime`, `nfse` | CNAE questions, NFS-e test script, bookkeeping handoff | Tax regime, CNAE, municipal needs, fiscal issuance route |
| Payment/reconciliation agent | `bank`, `payment` | Payout, refund, chargeback, and ledger procedures | Bank/payment route, payout, refund ownership |
| Support/incident agent | `support-inbox` | Response macros and incident triage checklist | Monitored inbox and escalation owner |
| LGPD/privacy agent | `lgpd-contact`, `privacy-review` | Data inventory, processor list, rights-request packet | LGPD contact path and privacy notice review |
| Consumer/terms agent | `terms-review` | Terms redline for scope, refund, cancellation, and support | Customer-facing legal terms review |
| Intake/ledger agent | `google-sheet`, `google-form` | Form boundaries, Sheet tab checks, TSV import tests | Live Form, live Sheet, no-sensitive-data test submission |
| AI human-review agent | `terms-review`, `privacy-review`, `lgpd-contact` | No-submit handoff for AI-drafted legal/tax/privacy/compliance material | Human sign-off dates in the local closure packet, exact reviewed docs, and binder validation |

## Operating Loop

1. Open the private Operations console.
2. Fill Setup Evidence rows with an HTTPS evidence link, a short operator note, and the current status.
3. Use each compliance agent's **Copy packet** action to create the exact handoff for the human closer.
4. Send the packet to the responsible human or complete the manual task yourself when qualified.
5. Record the result back in Setup Evidence.
6. Only after external review is complete, record the four real dates in `LIVE_REVIEW_CLOSURE.local.json`, validate the exact reviewed-document digests, inspect `bind_live_review_closure.js` in plan mode, and apply only that unchanged plan. Never set `termsReviewedAt`, `privacyReviewedAt`, `brazilComplianceReviewedAt`, or `aiHandoffReviewedAt` manually.

## Stop Rules

- Do not ask for payment until the entity/CNPJ route, tax regime, fiscal receipt/NFS-e route, payment route, support inbox, terms, privacy, and LGPD contact path are reviewed.
- Do not collect regulated, sensitive, health, financial, child, credential, or secret data through the public form.
- Do not treat AI-generated terms, privacy, tax, accounting, or compliance copy as approved.
- Do not enable `liveMode` while `node tools/audit_company_functionality.js --require-live` still reports external live blockers.

## Source Anchors

Use official sources during human review:

- Receita Federal / gov.br CNPJ opening and CNPJ services.
- gov.br NFS-e service page and NFS-e portal.
- ANPD privacy notice and LGPD guidance materials.
- Planalto law texts already referenced in `BRAZIL_COMPLIANCE.md` for LGPD, Marco Civil, consumer law, and e-commerce disclosure obligations.
