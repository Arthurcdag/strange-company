# Revenue Setup Outreach Packet

AI-prepared outreach scripts for the first paid pilot under `HUMAN_REVENUE_INSTRUCTIONS.md`. Every message must be sent from the monitored support inbox, after the seven gates in `REVENUE_SETUP_EVIDENCE_PACKET.md` are closed. AI does not send these. A responsible human operator chooses, edits, and sends.

Use this packet with:

- `HUMAN_REVENUE_INSTRUCTIONS.md` (gate runbook and First Paid Pilot Procedure)
- `REVENUE_SETUP_EVIDENCE_PACKET.md` (evidence handoff for the seven gates)
- `REVENUE_SETUP_EVIDENCE_INDEX.template.json` (blank index; completed copy stays local)
- `TERMOS.md` and `AVISO_DE_PRIVACIDADE.md` (customer-facing Portuguese drafts)
- `SUPPORT.md` (support response windows)

## Sender Rules

Every message in this packet must satisfy:

```text
sender = monitored support inbox in public-config.js
operator identity = Strange Works Studio
service and price = match public-config.js and TERMOS.md
hosted link = provider-hosted invoice or payment URL only
no card data on the static site
no secrets, credentials, or sensitive customer data in the message body
terms link + privacy link included on every paid offer
```

Stop sending if any daily stop rule in `HUMAN_REVENUE_INSTRUCTIONS.md` is active.

## Lead Qualification Worksheet

Fill before sending any paid offer. Keep the completed worksheet outside git.

```text
lead_id:
lead_source:                # Google Form, referral, inbound email, other
contact_name:
contact_email:
company_or_role:
external_customer:          # yes/no (must be yes; related-party leads do not count as market proof)
service_selected:           # Compliance proof sprint | Compliance template pack
price:                      # match public-config.js
customer_type:              # consumer | business | both
scope_fits_v0:              # yes/no
no_sensitive_data_requested:# yes/no
support_route_visible:      # yes/no
terms_link_sent:            # yes/no
privacy_link_sent:          # yes/no
qualification_owner:
qualification_at:
```

Reject or pause if the customer needs legal, tax, accounting, medical, financial, regulated, or sensitive-data handling that has not been reviewed.

## Reject Or Pause Reasons

Use the exact text below when declining or pausing. Choose one reason. Do not invent new categories.

```text
related_party:           "This pilot only counts external-customer revenue."
sensitive_data:          "We cannot accept health, credential, key, or regulated data in v0."
out_of_scope:            "The requested work is outside the Compliance proof sprint and Compliance template pack scope."
regulated_advice:        "We cannot provide legal, tax, accounting, medical, or financial advice."
unreviewed_route:        "Our payment, fiscal, or support route is not yet ready for this case."
identity_unclear:        "We could not confirm the operator identity, billing contact, or signer."
duplicate_request:       "We already have an open thread for this request."
no_response_window:      "We cannot meet the response or delivery window you asked for in v0."
```

## Message 1. Acknowledge Google Form Submission

Use after a Google Form lead is received and qualification is pending.

```text
Subject: Recebemos seu pedido - Strange Works Studio

Olá [name],

Recebemos seu pedido via formulário. Vamos confirmar o escopo e responder em até [response window from SUPPORT.md].

Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com

Por favor, não envie senhas, credenciais, dados de saúde, chaves privadas, dados pessoais sensíveis ou documentos regulados. Caso precise compartilhar algum documento, espere nosso retorno.

Termos: [terms link]
Privacidade: [privacy link]

Obrigado.
```

English mirror:

```text
Subject: We received your request - Strange Works Studio

Hi [name],

We received your form submission. We will confirm scope and reply within [response window from SUPPORT.md].

Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com

Please do not send passwords, credentials, health data, private keys, sensitive personal data, or regulated documents. Wait for our reply before sharing any document.

Terms: [terms link]
Privacy: [privacy link]

Thank you.
```

## Message 2. Reject Or Pause

Use after the qualification worksheet selects a reject or pause reason.

```text
Subject: Sobre seu pedido [SWS-____] - Strange Works Studio

Olá [name],

Obrigado pelo interesse. Não conseguimos atender este pedido nesta versão do serviço.

Motivo: [paste exact text from Reject Or Pause Reasons]

Caso o escopo mude no futuro, ficaremos felizes em retomar a conversa.

Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com
Termos: [terms link]
Privacidade: [privacy link]
```

English mirror:

```text
Subject: About your request [SWS-____] - Strange Works Studio

Hi [name],

Thank you for the interest. We cannot accept this request in the current service version.

Reason: [paste exact text from Reject Or Pause Reasons]

If the scope changes later, we would be glad to revisit.

Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com
Terms: [terms link]
Privacy: [privacy link]
```

## Message 3. Hosted Invoice Request

Use only after qualification passes and a hosted invoice/payment link has been created in the reviewed provider dashboard under the legal operator identity. The hosted URL must match the Operations dashboard allowlist (currently `https://invoice.stripe.com/`).

```text
Subject: Invoice request SWS-____ / Strange Works Studio

Hi [name],

Here is the hosted invoice for [service]: [hosted invoice link]

Operator: Strange Works Studio
Amount: R$____
Scope: [one sentence, non-sensitive]
Support: tuiidagnese+strangeworks@gmail.com

Please do not send payment credentials, passwords, health data, private keys, sensitive personal data, or regulated source documents. Payment is made only through the hosted invoice/payment route.

Terms: [terms link]
Privacy: [privacy link]
```

After sending:

1. Record the row in the private Sheet ledger using the `created_at, source, invoice_id, customer, contact, service, amount, status, stripe_invoice_url, delivery_due, notes` columns.
2. Mark the Operations dashboard order as `Sent`.
3. Keep `invoice_provider_id`, `hosted_invoice_url`, `fiscal_document_status`, `payment_status`, and `ledger_row_id` outside git.

## Message 4. Payment Confirmation

Send only after the provider or bank confirms settlement in the business account. Do not send when the customer says they paid.

```text
Subject: Pagamento confirmado SWS-____ - Strange Works Studio

Olá [name],

Confirmamos o pagamento da fatura SWS-____.

Valor bruto: R$____
Recebido em: [provider or bank confirmation timestamp, YYYY-MM-DD]
Documento fiscal: [NFS-e or reviewed fiscal receipt id, when issued]

Próximo passo: entregaremos [delivery artifact list from HUMAN_REVENUE_INSTRUCTIONS.md Step 7] até [delivery due date].

Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com
Termos: [terms link]
Privacidade: [privacy link]
```

English mirror:

```text
Subject: Payment confirmed SWS-____ - Strange Works Studio

Hi [name],

We confirm payment for invoice SWS-____.

Gross amount: R$____
Received at: [provider or bank confirmation timestamp, YYYY-MM-DD]
Fiscal document: [NFS-e or reviewed fiscal receipt id, when issued]

Next step: we will deliver [delivery artifact list from HUMAN_REVENUE_INSTRUCTIONS.md Step 7] by [delivery due date].

Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com
Terms: [terms link]
Privacy: [privacy link]
```

## Message 5. Delivery And Acceptance Request

Send when the scoped artifact is ready and stored in customer-safe storage.

```text
Subject: Entrega SWS-____ - Strange Works Studio

Olá [name],

Segue a entrega de [service].

Artefato: [access-controlled URL, no sensitive data in body]
Escopo entregue: [one sentence]
Próximos passos: por favor, confirme aceitação ou registre dúvidas em [response window from SUPPORT.md].

Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com
Termos: [terms link]
Privacidade: [privacy link]
```

English mirror:

```text
Subject: Delivery SWS-____ - Strange Works Studio

Hi [name],

Here is the delivery for [service].

Artifact: [access-controlled URL, no sensitive data in body]
Scope delivered: [one sentence]
Next steps: please confirm acceptance or log questions within [response window from SUPPORT.md].

Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com
Terms: [terms link]
Privacy: [privacy link]
```

After acceptance, move the order to `Delivered`, seal the receipt-chain state, and record the closeout fields from `HUMAN_REVENUE_INSTRUCTIONS.md` Step 8 outside git.

## Refund Or Cancellation Script

AI does not decide the outcome. Only the human refund owner does, after reading `TERMOS.md`, the invoice terms, delivery state, consumer-law review, and payment provider rules.

```text
Subject: Sobre seu pedido de [reembolso|cancelamento] SWS-____ - Strange Works Studio

Olá [name],

Recebemos seu pedido de [refund|cancellation] da fatura SWS-____.

Decisão: [approved | partial | declined], conforme [TERMOS.md section, invoice term, or consumer-law note].
Justificativa: [one sentence]
Próximos passos: [provider refund route or bank route, expected timing]
Documento fiscal: [accountant note on NFS-e correction or cancellation, when applicable]

Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com
Termos: [terms link]
Privacidade: [privacy link]
```

English mirror:

```text
Subject: About your [refund|cancellation] request SWS-____ - Strange Works Studio

Hi [name],

We received your [refund|cancellation] request for invoice SWS-____.

Decision: [approved | partial | declined], per [TERMOS.md section, invoice term, or consumer-law note].
Reason: [one sentence]
Next steps: [provider refund route or bank route, expected timing]
Fiscal document: [accountant note on NFS-e correction or cancellation, when applicable]

Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com
Terms: [terms link]
Privacy: [privacy link]
```

Record refund evidence outside git using the fields in the Refund Or Cancellation Procedure section of `HUMAN_REVENUE_INSTRUCTIONS.md`.

## Privacy Request Acknowledgement

Send within the response window in `SUPPORT.md`. Route the request to the LGPD/privacy owner.

```text
Subject: Solicitação LGPD SWS-____ - Strange Works Studio

Olá [name],

Recebemos sua solicitação relacionada a dados pessoais (LGPD). Vamos analisar e responder em até [response window].

Encarregado/contato LGPD: [LGPD contact name from evidence index]
Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com
Aviso de privacidade: [privacy link]
```

English mirror:

```text
Subject: Privacy request SWS-____ - Strange Works Studio

Hi [name],

We received your data-subject request. Our privacy owner will review and respond within [response window].

LGPD contact: [LGPD contact name from evidence index]
Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com
Privacy notice: [privacy link]
```

## Incident Acknowledgement

Use when the customer reports a payment, delivery, or data incident.

```text
Subject: Incidente SWS-____ - Strange Works Studio

Olá [name],

Confirmamos o recebimento do relato. Estamos investigando e responderemos em até [response window].

Tipo do incidente: [payment | delivery | privacy | other]
Operador: Strange Works Studio
Suporte: tuiidagnese+strangeworks@gmail.com
Termos: [terms link]
Privacidade: [privacy link]
```

English mirror:

```text
Subject: Incident SWS-____ - Strange Works Studio

Hi [name],

We confirm receipt of your report. We are investigating and will respond within [response window].

Incident type: [payment | delivery | privacy | other]
Operator: Strange Works Studio
Support: tuiidagnese+strangeworks@gmail.com
Terms: [terms link]
Privacy: [privacy link]
```

Log every incident in the Sheet ledger `Incidents` tab and seal the receipt-chain state after material changes.

## Outreach Daily Routine

Run with the Daily Revenue Routine in `HUMAN_REVENUE_INSTRUCTIONS.md`.

```text
1. Read support inbox.
2. Read Google Form submissions.
3. Run the qualification worksheet for each new lead.
4. Send Message 1 (acknowledge) or Message 2 (reject/pause) within the response window.
5. For qualified leads, send Message 3 (invoice) only after the hosted invoice exists in the reviewed provider dashboard.
6. After provider/bank settlement confirmation, send Message 4 (payment confirmation).
7. After delivery, send Message 5 (acceptance request).
8. Handle refund, privacy, and incident threads through the dedicated scripts above.
9. Update the Sheet ledger and Operations dashboard after every message.
10. Seal the receipt chain after material changes.
```

## What Not To Do

Do not:

- send any of these messages from an unmonitored inbox,
- send Message 3 with a non-hosted, personal, or unreviewed payment link,
- send Message 3 with a non-Stripe URL while the Operations dashboard allowlist is still Stripe-only,
- send Message 4 before provider or bank settlement confirmation,
- decide refund, cancellation, privacy, or incident outcomes from an AI draft,
- include CPF, CNPJ artifacts, bank data, payment credentials, or customer documents in any outbound message,
- promise turnaround windows shorter than `SUPPORT.md`,
- attach internal evidence files (`REVENUE_SETUP_EVIDENCE_INDEX.local.json`, `EXTERNAL_LIVE_PACKET.local.json`, screenshots) to customer email.
