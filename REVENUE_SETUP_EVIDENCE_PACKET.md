# Revenue Setup Evidence Packet

Status: human/outside evidence packet. This is not legal, tax, accounting, payment-provider, LGPD, or launch approval.

Purpose: turn the "revenue setup" decision into concrete human questions, outside artifacts, stop rules, and public-safe receipts before Strange Works Studio receives customer money.

Current decision:

```text
Proceed with revenue setup as setup and evidence gathering only.
Do not accept live payment yet.
Do not set public-config.js liveMode to true yet.
```

## Source Of This Packet

This packet follows:

- `HUMAN_REVENUE_INSTRUCTIONS.md`,
- `BRAZIL_COMPLIANCE.md`,
- `SATELLITE_COMPANY.md`,
- the private Operations/revenue gates in `index.html`,
- and the current public config, where `liveMode` remains `false`.

The random wall being broken is:

```text
Old belief that revenue setup can wait forever.
```

The human and reality walls that remain hard:

```text
customer consent and privacy
Brazil entity/tax/payment/LGPD route
support/refund/incident ownership
truthful public offer
no AI-only approval
```

## Public-Safe Evidence Rule

Keep private artifacts outside git.

Do not commit:

```text
CPF
CNPJ certificates or private portal screenshots
bank account data
payment dashboard screenshots with account details
customer records
tax filings
contracts with signatures
private invoices
provider secrets or API keys
identity documents
mailbox headers containing private data
```

Only record public-safe references here or in the Operations console:

```text
evidence_id:
artifact_type:
owner:
reviewer_role:
reviewed_at:
status:
blocker_summary:
private_location_hint:
```

Use evidence ids like:

```text
SWS-REVSET-ENTITY-YYYYMMDD-01
SWS-REVSET-TAX-YYYYMMDD-01
SWS-REVSET-PAYMENT-YYYYMMDD-01
SWS-REVSET-PRIVACY-YYYYMMDD-01
SWS-REVSET-SUPPORT-YYYYMMDD-01
```

Use [REVENUE_SETUP_OUTREACH_PACKET.md](REVENUE_SETUP_OUTREACH_PACKET.md) for copy/paste reviewer messages, and [REVENUE_SETUP_EVIDENCE_INDEX.template.json](REVENUE_SETUP_EVIDENCE_INDEX.template.json) for the public-safe receipt index.

## Gate 1: Entity/CNPJ Or Approved Operating Route

Human owner needed:

```text
founder/operator plus accountant or lawyer
```

Question to ask:

```text
Can Strange Works Studio legally sell the current services in Brazil under the selected operating route, and what legal/business identity must appear on invoices, terms, privacy, payment provider, support messages, and fiscal documents?
```

Minimum answers required:

```text
legal/business name:
CNPJ or approved operating route:
signer authority:
business address rule for customer/fiscal documents:
services allowed under this route:
services blocked under this route:
reviewer name/role:
review date:
```

Private artifact:

```text
entity/CNPJ artifact or reviewed operating-structure note
```

Public-safe receipt:

```text
entity_evidence_id:
reviewer_role:
reviewed_at:
allowed_to_invoice_compliance_proof_sprint: yes/no
allowed_to_invoice_template_pack: yes/no
blockers:
```

Stop rule:

```text
Do not request payment if the entity/CNPJ or approved operating route is unresolved.
```

## Gate 2: Tax, CNAE, Municipal Registration, And NFS-e

Human owner needed:

```text
accountant or tax professional
```

Question to ask:

```text
For the current service offers, what tax regime, CNAE, municipal registration, NFS-e route, and monthly bookkeeping process are required before the first customer invoice?
```

Current service offers:

```text
Compliance proof sprint - R$750
Compliance template pack - R$79
```

Minimum answers required:

```text
tax regime:
CNAE:
municipal registration needed: yes/no
NFS-e route:
national emitter or municipal route:
test NFS-e/dry-run needed before first paid invoice: yes/no
who issues the fiscal document:
when fiscal document is issued:
refund/cancelled invoice process:
monthly reconciliation owner:
```

Private artifact:

```text
accountant note plus successful NFS-e or reviewed fiscal receipt dry-run evidence
```

Public-safe receipt:

```text
tax_evidence_id:
accountant_role:
reviewed_at:
nfse_route_status:
test_status:
monthly_reconciliation_owner:
blockers:
```

Stop rule:

```text
Do not mark an invoice sent or paid if the fiscal route is blocked, unreviewed, or unreconciled.
```

## Gate 3: Payment Provider, Payout, Refund, And Reconciliation

Human owner needed:

```text
operator plus payment/reconciliation owner
```

Question to ask:

```text
Which payment route can Strange Works Studio use for hosted invoices or manual payment requests, and how will payout, refund, dispute, fee, and ledger reconciliation work?
```

Minimum answers required:

```text
provider:
business account name:
payout destination verified: yes/no
hosted invoice/payment URL pattern:
provider fees:
payout timing:
refund procedure:
chargeback/dispute procedure:
failed payment procedure:
test payment allowed before launch: yes/no
test payment fiscal handling:
reconciliation owner:
```

Current dashboard constraint:

```text
The private Operations dashboard currently validates hosted invoice URLs that start with https://invoice.stripe.com/.
```

If a non-Stripe route is selected:

```text
Do not paste non-Stripe payment URLs into the current Operations dashboard until the allowlist and tests are updated.
```

Private artifact:

```text
payment account proof, payout verification note, refund procedure, fee/reconciliation note
```

Public-safe receipt:

```text
payment_evidence_id:
provider:
reviewed_at:
payout_verified: yes/no
refund_route_ready: yes/no
reconciliation_owner:
blockers:
```

Stop rule:

```text
Do not collect money through a personal, unverified, held, restricted, or unreconciled account.
```

## Gate 4: LGPD, Privacy Contact, Retention, And Data Boundary

Human owner needed:

```text
privacy owner or lawyer/operator responsible for LGPD requests
```

Question to ask:

```text
Can the current intake, delivery, support, ledger, and retention flow collect only the minimum customer data needed, reject sensitive/regulated data, and answer LGPD rights requests through a named human owner?
```

Minimum answers required:

```text
controller/operator:
LGPD contact:
legal bases to review:
processor list location:
storage locations:
retention period:
deletion/correction path:
rights request owner:
incident owner:
international transfer status:
sensitive-data rejection wording approved: yes/no
```

Data that v0 must reject:

```text
protected health information
payment credentials
passwords
private keys
sensitive personal data
regulated source documents
unnecessary CPF/CNPJ or bank data
```

Private artifact:

```text
reviewed privacy notice, data map, processor list, retention decision, rights-request route
```

Public-safe receipt:

```text
privacy_evidence_id:
reviewed_at:
lgpd_contact_ready: yes/no
rights_request_owner:
processor_list_ready: yes/no
retention_decision_ready: yes/no
sensitive_data_boundary_confirmed: yes/no
blockers:
```

Stop rule:

```text
Pause intake if the rights path is not ready, if sensitive data arrives, or if privacy review is AI-only.
```

## Gate 5: Support, Refund, Complaint, And Incident Ownership

Human owner needed:

```text
support/refund/incident owner
```

Question to ask:

```text
Who monitors the support inbox every business day, handles refund/payment/privacy complaints, and records incidents before more invoices are sent?
```

Current support route:

```text
tuiidagnese+strangeworks@gmail.com
```

Planned branded route:

```text
ops@strangeworks.studio
```

Minimum answers required:

```text
support email:
inbox test sent at:
inbox test received at:
daily check time:
refund owner:
payment issue owner:
privacy request owner:
incident owner:
escalation route:
response targets accepted: yes/no
```

Private artifact:

```text
inbox test evidence, support monitoring note, incident/refund/privacy escalation owner note
```

Public-safe receipt:

```text
support_evidence_id:
support_email:
reviewed_at:
daily_monitoring_ready: yes/no
refund_owner:
privacy_owner:
incident_owner:
blockers:
```

Stop rule:

```text
Do not open intake if support, refund, privacy, payment, or complaint messages cannot be answered by a human within the targets in SUPPORT.md.
```

## Gate 6: Offer, Terms, Refund, And Scope Review

Human owner needed:

```text
operator plus lawyer or responsible reviewer
```

Question to ask:

```text
Does the customer-facing offer clearly state the seller, service, price, exclusions, delivery timing, support route, cancellation/refund process, privacy route, and no-advice boundary?
```

Minimum answers required:

```text
seller identity:
service included:
service excluded:
price/currency:
delivery timing:
cancellation route:
refund route:
customer type: consumer/business/both
regulated-data exclusion:
no legal/tax/accounting/medical/financial advice wording:
reviewer name/role:
reviewed_at:
```

Private artifact:

```text
reviewed terms copy or reviewer note
```

Public-safe receipt:

```text
terms_evidence_id:
reviewed_at:
refund_route_ready: yes/no
cancellation_route_ready: yes/no
offer_scope_ready: yes/no
blockers:
```

Stop rule:

```text
Do not send a paid offer with AI-only terms, unclear refund language, or unclear service limits.
```

## Public Config Gate

Only after all required gates above have real outside evidence may the operator consider changing `public-config.js`.

Required fields:

```js
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
brazilComplianceReviewedAt: "YYYY-MM-DD",
aiHandoffReviewedAt: "YYYY-MM-DD",
liveMode: true
```

Current safe state:

```text
liveMode: false
review dates blank
```

This is correct until outside evidence exists.

Required checks before live mode:

```powershell
node tools\preflight_public_launch.js
node tools\audit_company_functionality.js
node tools\audit_company_functionality.js --require-live
node tools\survival_check.js
python -B -m unittest discover -s tests
git diff --check
```

## First Human Message: Accountant / Tax

```text
Oi, estou preparando a Strange Works Studio para um piloto pago pequeno no Brasil, mas ainda nao vou receber pagamento ate fechar a rota fiscal.

Preciso confirmar, para os servicos "Compliance proof sprint" e "Compliance template pack":

1. qual estrutura/CNPJ ou rota operacional e adequada;
2. qual regime tributario e CNAE fazem sentido;
3. se precisa inscricao municipal;
4. se a emissao deve ser por NFS-e nacional, portal municipal, ou outro caminho;
5. quando emitir a nota/recibo;
6. como tratar pagamento de teste, reembolso, cancelamento e conciliacao mensal.

Nao preciso de aprovacao generica. Preciso de uma resposta escrita com bloqueios, passos obrigatorios e evidencias que devo guardar fora do repositorio.
```

## First Human Message: Privacy / Terms Reviewer

```text
Oi, estou preparando um piloto pago pequeno para Strange Works Studio, mas ainda nao vou coletar dados reais nem pagamento ate revisar privacidade, termos e suporte.

Preciso que voce revise:

- TERMOS.md
- AVISO_DE_PRIVACIDADE.md
- SUPPORT.md
- HUMAN_REVENUE_INSTRUCTIONS.md
- este REVENUE_SETUP_EVIDENCE_PACKET.md

O objetivo e confirmar se o primeiro fluxo deixa claro:

1. quem vende;
2. o que e vendido;
3. o que esta excluido;
4. quais dados podem ou nao ser enviados;
5. rota LGPD de correcao/exclusao/solicitacao;
6. cancelamento/reembolso;
7. suporte/incidente;
8. que IA nao aprova decisao legal, fiscal, privacidade, pagamento ou reembolso.

Pode responder com bloqueios. A revisao negativa e util.
```

## Current Status

```text
entity/CNPJ evidence: missing
tax/CNAE/NFS-e evidence: missing
payment/payout/refund evidence: missing
LGPD/privacy evidence: missing
support/refund/incident evidence: partial support inbox only
terms/offer review evidence: missing
liveMode: false
```

Verdict:

```text
Revenue setup may proceed as evidence gathering.
Live payment intake remains blocked.
```

## Official References Checked

Checked on 2026-05-31. Recheck before live operation because fiscal, payment, and privacy rules can change.

- Receita Federal CNPJ services: https://www.gov.br/receitafederal/pt-br/servicos/cadastro/cnpj
- Receita Federal CNPJ guidance: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cnpj/cadastro-nacional-de-pessoas-juridicas-cnpj
- Portal NFS-e: https://www.gov.br/nfse/pt-br/pagina-inicial
- NFS-e / Simples Nacional note: https://www.gov.br/nfse/pt-br/noticias/nfs-e-e-simples-nacional-obrigatoriedade-de-emissao-atraves-do-emissor-nacional
- LGPD official text: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- ANPD privacy notice structure: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade/aviso-de-privacidade
- Banco Central Pix Cobrança: https://www.bcb.gov.br/estabilidadefinanceira/pix-cobranca
