# Human Revenue Instructions

Status: human operator runbook. This is not legal, tax, accounting, payment-provider, or LGPD approval. It tells a responsible human what must be done before Strange Works Studio can receive real revenue without breaking the Strange Company guardrails.

Use [REVENUE_SETUP_EVIDENCE_PACKET.md](REVENUE_SETUP_EVIDENCE_PACKET.md), [REVENUE_SETUP_OUTREACH_PACKET.md](REVENUE_SETUP_OUTREACH_PACKET.md), and [REVENUE_SETUP_EVIDENCE_INDEX.template.json](REVENUE_SETUP_EVIDENCE_INDEX.template.json) as the first outside-evidence handoff before asking any customer to pay.

Use `tools/draft_revenue_setup_evidence_index.js` and `tools/validate_revenue_setup_evidence_index.js` for the local evidence index:

```bash
node tools/draft_revenue_setup_evidence_index.js --write-local
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-payment
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-tax
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-support --public-config public-config.js
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-privacy --public-config public-config.js
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-terms --public-config public-config.js
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-ledger --public-config public-config.js
node tools/validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
```

Every `--require-*` command is an actual evidence gate and accepts only
`mode: "local"`; template, simulation, and local-draft packets remain diagnostic
inputs only. Support, privacy, terms, and ledger gates also require the current
`public-config.js` binding shown above so a stale public snapshot cannot pass.

Use [REVIEWER_CANDIDATE_PACKET.md](REVIEWER_CANDIDATE_PACKET.md), [REVIEWER_CANDIDATE_TRACKER.template.json](REVIEWER_CANDIDATE_TRACKER.template.json), [tools/draft_reviewer_candidate_tracker.js](tools/draft_reviewer_candidate_tracker.js), and [tools/validate_reviewer_candidate_tracker.js](tools/validate_reviewer_candidate_tracker.js) when the next blocker is reviewer capacity. The tracker records private outreach evidence; it does not close legal, tax, privacy, payment, or live-mode gates.

Use `REVENUE_SETUP_EVIDENCE_INDEX.local.json` as the local payment/fiscal control file for evidence outside this repo. After completing tax/payment/fiscal fields, run `tools/vau_company_evolution.py --revenue-evidence-index REVENUE_SETUP_EVIDENCE_INDEX.local.json` to reflect that blocker in VAU output.

## Core Rule

Strange Company does not receive customer money in v0.

Revenue goes only through the separate operating lane:

```text
External customer -> Strange Works Studio -> business bank/payment route -> fiscal receipt/NFS-e -> private ledger -> delivery receipt
```

Strange Company remains a sealed prototype and treasury/control system. It must not invoice customers directly, pool customer funds, manage investor money, custody crypto, promise returns, or treat customer payments as treasury capital.

## Current Project Facts

Use these values unless the human operator changes them after review:

| Item | Current value |
| --- | --- |
| Revenue-facing operator | Strange Works Studio |
| Jurisdiction path | Brazil-first |
| Support inbox | `tuiidagnese+strangeworks@gmail.com` |
| Planned branded inbox | `ops@strangeworks.studio` |
| Public intake route | Google Form in `public-config.js` |
| First service | Compliance proof sprint |
| First service price | R$750 |
| Second service | Compliance template pack |
| Second service price | R$79 |
| Public live flag | `public-config.js` -> `liveMode: false` until all gates close |

## Human Owner

Assign one responsible human before any money is requested.

Record outside the repo:

```text
Responsible operator:
Legal/business name:
CNPJ or approved operating route:
Business address for invoices:
Support owner:
Accounting owner:
LGPD/privacy owner:
Payment/reconciliation owner:
Refund owner:
Daily inbox check time:
```

Do not commit CPF, CNPJ certificates, bank data, customer records, tax portal screenshots, provider secrets, contracts, private invoices, or payment dashboard screenshots to this repo.

## Minimum Outside Setup

Complete these gates before asking a customer to pay.

### 1. Entity And Authority

Human action:

1. Choose the operating structure with an accountant or lawyer.
2. Confirm whether Strange Works Studio can legally invoice the first service.
3. Confirm the legal name, CNPJ or approved operating route, address, signer, and contract authority.
4. Save private evidence outside this repo.
5. Record only a non-secret evidence reference in the private Operations console or local notes.

Evidence to keep outside git:

```text
entity_evidence_id:
legal_name:
cnpj_or_route:
reviewer_name:
review_date:
allowed_to_invoice_services: yes/no
blockers:
```

Stop rule: do not request payment while the entity/CNPJ or operating route is uncertain.

### 2. Tax, CNAE, And NFS-e Route

Human action:

1. Ask the accountant which tax regime, CNAE, municipal registration, and NFS-e route apply to the service.
2. Confirm whether the service requires NFS-e through the national portal, a municipal portal, or another reviewed fiscal receipt path.
3. Run a non-customer test or accountant-reviewed dry run before the first paid invoice.
4. Define who issues the fiscal document and when.
5. Define how taxes, fees, refunds, and cancelled invoices are reconciled monthly.

Evidence to keep outside git:

```text
tax_evidence_id:
tax_regime:
cnae:
nfse_route:
municipal_registration_needed: yes/no
fiscal_document_owner:
test_nfse_or_receipt_status:
accountant_reviewed_at:
monthly_reconciliation_owner:
```

Stop rule: do not mark an invoice as sent or paid if the fiscal route is blocked or unreconciled.

### 3. Business Bank And Payment Route

Human action:

1. Open or confirm a business bank/payment account in the operator's name.
2. Choose the first payment route.
3. Verify payout timing, fees, refund process, disputes, chargebacks, account reserve/hold risk, and customer receipt behavior.
4. Run a small test payment only after the accountant confirms how to treat the test.
5. Confirm the payout lands in the correct business account.
6. Document the reconciliation procedure.

Preferred v0 route:

```text
Hosted invoice/payment link created by the payment provider.
The static site never collects card data or payment credentials.
```

Current dashboard constraint:

The Operations dashboard currently accepts hosted invoice URLs that start with:

```text
https://invoice.stripe.com/
```

If the human chooses Stripe, use hosted invoices or payment links that keep card handling on Stripe. If the human chooses Pix, bank transfer, Mercado Pago, Pagar.me, PayPal, or another provider, do not paste non-Stripe provider URLs into the current Operations dashboard until the URL allowlist and validation logic are updated and tested.

Evidence to keep outside git:

```text
payment_evidence_id:
provider:
business_account_name:
payout_destination_verified: yes/no
test_payment_id:
test_payout_status:
refund_test_or_procedure:
chargeback_or_dispute_procedure:
fees_reviewed:
reconciliation_owner:
```

Stop rule: do not collect money through a personal account, unverified account, secret link, or route without refund and reconciliation ownership.

### 4. Support And Incident Route

Human action:

1. Confirm the support inbox is reachable.
2. Send and receive a test email.
3. Set a daily inbox review time.
4. Create labels for `orders`, `payments`, `refunds`, `privacy`, `incidents`, and `delivery`.
5. Confirm the escalation owner for payment, privacy, legal, accounting, and delivery issues.

Evidence to keep outside git:

```text
support_evidence_id:
support_email:
test_sent_at:
test_received_at:
daily_check_time:
incident_owner:
refund_owner:
privacy_owner:
```

Stop rule: do not open intake if nobody can answer support, refund, privacy, or complaint messages within the target windows in `SUPPORT.md`.

### 5. LGPD And Customer Data Boundary

Human action:

1. Review `AVISO_DE_PRIVACIDADE.md` with the responsible privacy owner or counsel.
2. Confirm legal bases, retention, processors, international transfers, deletion/correction path, and data-subject request owner.
3. Confirm that the first service does not collect protected health information, payment credentials, passwords, private keys, sensitive personal data, or regulated source documents.
4. Make the customer-facing scope reject sensitive data before the customer submits anything.

Evidence to keep outside git:

```text
privacy_evidence_id:
privacy_reviewed_at:
lgpd_contact:
processor_list_location:
retention_decision:
rights_request_owner:
sensitive_data_boundary_confirmed: yes/no
```

Stop rule: pause intake if a customer sends sensitive data or if a privacy request cannot be answered by a human.

### 6. Terms, Refunds, And Public Offer

Human action:

1. Review `TERMOS.md` for the actual service being sold.
2. Confirm who the seller is, what is included, what is excluded, the price, delivery timing, cancellation/refund path, support route, and data limits.
3. Confirm whether customers are consumers, businesses, or both.
4. Confirm what happens if the customer buys the wrong service or sends unusable data.
5. Save a reviewed copy and review date outside git.

Evidence to keep outside git:

```text
terms_evidence_id:
terms_reviewed_at:
reviewer:
refund_path:
cancellation_path:
customer_type:
offer_scope_confirmed: yes/no
```

Stop rule: do not send a paid offer with AI-only terms or unclear cancellation/refund language.

### 7. Intake Form And Sheet Ledger

Human action:

1. Verify the Google Form in `public-config.js` writes to the intended Sheet.
2. Keep the form minimal: name/company, email, service, short scope, and consent checkboxes.
3. Add warnings not to submit sensitive data, payment credentials, CPF/CNPJ unless the reviewed fiscal process needs it, health data, passwords, private keys, or regulated source documents.
4. Create or verify Sheet tabs:

```text
Requests
Invoices
Customers
Delivery
Incidents
Leads
```

5. For the Operations dashboard ledger import, use these columns exactly when exporting or pasting TSV rows:

```text
created_at
source
invoice_id
customer
contact
service
amount
status
stripe_invoice_url
delivery_due
notes
```

Allowed `status` values must match the dashboard options:

```text
Draft
Sent
Paid
Delivered
```

Evidence to keep outside git:

```text
ledger_evidence_id:
google_form_url:
google_sheet_url:
test_submission_id:
tabs_verified:
owner:
```

Stop rule: do not rely on intake if the form writes to the wrong Sheet or if the Sheet contains sensitive data that v0 is not allowed to process.

## Repo Configuration Before Live Intake

Only update non-review public fields in `public-config.js` after the human gates
above have real evidence. The closure binder exclusively owns the four
reviewed-at fields.

Update these fields:

```js
supportEmail: "reviewed support email",
googleFormUrl: "reviewed Google Form URL",
supportInboxVerified: true,
googleFormVerified: true,
// The closure binder writes the four reviewed-at fields transactionally.
liveMode: false
```

Keep `liveMode: false` if any review date is blank, any outside evidence is missing, or any stop rule is active.

Keep Google Form response collection disabled during this pre-live validation
and record `google.acceptingResponses: false` in the ignored external-live
packet. Do not push the responder URL in a pre-flip closed config.

Run:

Keep the binder plan and PLAN_ID local because they commit to private closure
evidence. Execute only the exact `applyArguments` reported by the unchanged
plan.

```powershell
node --check public-config.js
node --check public.js
node --check script.js
node tools\validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready
node tools\bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json
node tools\bind_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --apply --expect-plan-id <PLAN_ID>
node tools\validate_live_review_closure.js LIVE_REVIEW_CLOSURE.local.json --require-ready --public-config public-config.js
node tools\export_public_live_receipt.js --check-public-js
node tools\validate_revenue_setup_evidence_index.js REVENUE_SETUP_EVIDENCE_INDEX.local.json --require-all --public-config public-config.js
node tools\validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live --public-config public-config.js
node tools\validate_reviewer_candidate_tracker.js REVIEWER_CANDIDATE_TRACKER.local.json --require-ready
node tools\validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
node tools\export_public_live_receipt.js --live-review-closure LIVE_REVIEW_CLOSURE.local.json --external-live-packet EXTERNAL_LIVE_PACKET.local.json --revenue-index REVENUE_SETUP_EVIDENCE_INDEX.local.json --reviewer-tracker REVIEWER_CANDIDATE_TRACKER.local.json --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --public-config public-config.js --output public-live-receipt.js --force
node tools\export_public_live_receipt.js --check-public-js --require-issued
node tools\preflight_public_launch.js
node tools\evolution_goal_status.js --json
node tools\survival_check.js
python -B -m unittest discover -s tests
git diff --check
```

Expected result before real launch:

```text
All pre-live checks pass only after `public-config.js` has real reviewed dates and `liveMode: false`, the revenue packet matches that snapshot, and the external-live packet matches every field except its local target `publicConfig.liveMode: true`. The receipt is issued from the still-false tracked config; only the final human decision flips it.
```

If any command fails, do not force the config. Record the blocker and fix the
outside evidence first. If all pass and status has no hard, public-route, or
operational blockers, a human may make the separate `liveMode: true` change and
must run `node tools/preflight_public_launch.js --deployment` before publication.
Publish the issued receipt and live config together; enable external Form
responses only after the live Pages deployment is verified.

If a stop rule or receipt expiry occurs, disable Form responses first. Capture
the full recovery sequence below and finish it without rerunning status midway:

```powershell
node tools\render_public_live_shutdown_patch.js
# Apply only googleFormUrl: "", googleFormVerified: false, and liveMode: false.
node tools\export_public_live_receipt.js --revoke --public-config public-config.js --output public-live-receipt.js
node tools\preflight_public_launch.js --deployment
node tools\build_public_site.js --check --output .public-site-build.local --force
```

Publish that closed config and placeholder together, verify Pages remains
closed, and only then rerun status from the closed state before repair or
reissuance. The revoke path does not require the private packets; a receipt in
an already open tab is rechecked from the server and fails closed.

## First Paid Pilot Procedure

Use this sequence for the first real customer.

### Step 1. Qualify The Lead

Confirm:

```text
external customer: yes/no
service selected:
price:
customer type:
scope fits v0: yes/no
no sensitive data requested: yes/no
support route visible: yes/no
terms/privacy sent: yes/no
```

Reject or pause if the customer needs legal, tax, accounting, medical, financial, regulated, or sensitive-data handling that has not been reviewed.

### Step 2. Create The Order In The Private Dashboard

Open `index.html`, go to Operations, and create or update an order.

Use:

```text
invoice prefix: SWS
service: Compliance proof sprint or Compliance template pack
amount: reviewed price
status: Draft
notes: short non-sensitive scope only
```

Do not enter secrets, payment credentials, customer documents, CPF, full CNPJ artifacts, bank data, or private medical/legal details.

### Step 3. Create The Hosted Invoice Or Payment Link

In the provider dashboard:

1. Create an invoice/payment link for the reviewed service and price.
2. Use the legal operator identity.
3. Include the service name, billing period if recurring, and cancellation/refund wording that matches `TERMOS.md`.
4. Keep payment-card handling inside the provider.
5. Copy only the hosted customer invoice/payment URL.

If using the current Operations dashboard, the URL must start with:

```text
https://invoice.stripe.com/
```

### Step 4. Send The Invoice Request

Send from the monitored support inbox.

Short message:

```text
Subject: Invoice request SWS-____ / Strange Works Studio

Hi [name],

Here is the hosted invoice for [service]: [hosted invoice link]

Operator: Strange Works Studio
Amount: R$____
Scope: [one sentence]
Support: tuiidagnese+strangeworks@gmail.com

Please do not send payment credentials, passwords, health data, private keys, sensitive personal data, or regulated source documents. Payment is made only through the hosted invoice/payment route.

Terms: [link]
Privacy: [link]
```

### Step 5. Record The Ledger

Record in the private Sheet and Operations dashboard:

```text
created_at:
source:
invoice_id:
customer:
contact:
service:
amount:
status: Sent
stripe_invoice_url:
delivery_due:
notes:
```

Keep private evidence outside git:

```text
invoice_provider_id:
hosted_invoice_url:
fiscal_document_status:
payment_status:
ledger_row_id:
```

### Step 6. Confirm Payment Settlement

Do not mark `Paid` when the customer says they paid.

Mark `Paid` only after the provider or bank confirms settlement in the business account or provider dashboard according to the reviewed process.

Then:

1. Record paid timestamp.
2. Reconcile provider fee and net amount.
3. Issue NFS-e or reviewed fiscal receipt according to the accountant route.
4. Save the fiscal evidence outside git.
5. Send payment confirmation to the customer.

### Step 7. Deliver The Service

Deliver only the scoped artifact.

For the Compliance proof sprint, the expected first delivery is:

```text
evidence map
checklist cleanup
monthly proof packet
exception notes
exportable receipt
```

Use customer-safe storage. Do not ask for regulated source documents unless a reviewed storage and contract route exists.

### Step 8. Close The Receipt

After delivery:

1. Add delivery artifact URL to the private dashboard only if it is safe and access-controlled.
2. Record acceptance note with no sensitive data.
3. Move the order to `Delivered`.
4. Log any incident, refund issue, support issue, or privacy request.
5. Seal or export the receipt-chain state from the local dashboard.
6. Reconcile the Sheet, payment provider, bank, fiscal document, and support thread.

Closeout record outside git:

```text
closeout_id:
invoice_id:
payment_confirmed_at:
nfse_or_receipt_id:
delivery_artifact_id:
accepted_at:
gross_amount:
provider_fee:
net_amount:
incident_count:
refund_status:
receipt_chain_root:
```

## Daily Revenue Routine

Run once per business day while live intake is enabled.

```text
1. Check support inbox.
2. Check Google Form submissions.
3. Reject unsafe or out-of-scope requests.
4. Update Sheet ledger.
5. Check provider dashboard for invoice status, failed payments, disputes, refunds, and payout holds.
6. Check bank payout status.
7. Issue or reconcile fiscal documents.
8. Deliver due work.
9. Log incidents.
10. Seal the receipt chain after material changes.
```

Pause new invoices if any daily stop rule is active:

```text
payment route restricted
business bank restricted
fiscal route blocked
support inbox unmonitored
privacy request unresolved
terms/privacy change required
ledger out of sync
customer submitted sensitive data
provider payout not reconciled
```

When pausing public intake, also follow the fail-closed rollback above; the
static receipt cannot disable a Google Form reached from an old direct link.

## Refund Or Cancellation Procedure

Human action:

1. Read the customer request.
2. Check `TERMOS.md`, the invoice terms, delivery state, consumer-law review, and payment provider rules.
3. Do not let AI decide the outcome.
4. If refund is approved, issue it through the payment provider or bank route.
5. Record refund ID, amount, date, reason, fiscal treatment, and support thread.
6. Update the ledger and order status.
7. Ask the accountant whether the NFS-e or fiscal document needs correction or cancellation.

Evidence to keep outside git:

```text
refund_id:
invoice_id:
customer_request_at:
decision_owner:
decision_at:
amount:
provider_refund_id:
fiscal_adjustment:
support_thread_id:
```

## What Not To Do

Do not:

- set `liveMode: true` just to make the page look launched,
- accept payment before the entity, tax, NFS-e, payment, privacy, terms, support, and ledger gates are closed,
- put customer data, private evidence, screenshots, bank info, credentials, or tax documents in git,
- collect card data on the static site,
- use a personal bank account without accountant/legal review,
- mark an order paid before settlement,
- sell investment, yield, trade, token, custody, or managed-money products,
- count related-party revenue as market proof,
- promise guaranteed, fixed, daily, monthly, or minimum returns,
- let AI approve legal, tax, accounting, privacy, payment, refund, or consumer decisions.

## External References For The Human

Checked on 2026-05-31. Recheck these before launch because payment, tax, and fiscal rules can change.

- Receita Federal CNPJ information: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cnpj
- NFS-e Padrao Nacional service page: https://www.gov.br/pt-br/servicos/emitir-nota-fiscal-de-servico-eletronica
- Banco Central Pix FAQ: https://www.bcb.gov.br/meubc/faqs/s/pix
- Banco Central Pix business page: https://www.bcb.gov.br/estabilidadefinanceira/pix-cobranca
- Stripe Payment Links: https://stripe.com/payments/payment-links
- Stripe Boleto Brazil: https://stripe.com/payment-method/boleto
- Project Brazil compliance gate: `BRAZIL_COMPLIANCE.md`
- Project terms draft: `TERMOS.md`
- Project privacy draft: `AVISO_DE_PRIVACIDADE.md`
- Project support route: `SUPPORT.md`
