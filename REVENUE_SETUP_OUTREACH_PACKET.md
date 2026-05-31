# Revenue Setup Outreach Packet

Status: human/outside outreach packet. This is not legal, tax, accounting, payment-provider, LGPD, consumer-law, or launch approval.

Purpose: give the operator copy/paste messages and response rules for the next revenue-setup step, without asking customers for money and without putting private artifacts in git.

Current decision:

```text
Proceed with outreach and evidence gathering only.
Do not accept live payment yet.
Do not set public-config.js liveMode to true yet.
```

## Use This With

- [REVENUE_SETUP_EVIDENCE_PACKET.md](REVENUE_SETUP_EVIDENCE_PACKET.md)
- [REVENUE_SETUP_EVIDENCE_INDEX.template.json](REVENUE_SETUP_EVIDENCE_INDEX.template.json)
- [HUMAN_REVENUE_INSTRUCTIONS.md](HUMAN_REVENUE_INSTRUCTIONS.md)
- [BRAZIL_COMPLIANCE.md](BRAZIL_COMPLIANCE.md)
- [TERMOS.md](TERMOS.md)
- [AVISO_DE_PRIVACIDADE.md](AVISO_DE_PRIVACIDADE.md)
- [SUPPORT.md](SUPPORT.md)

## Public-Safe Rule

Do not send or commit private data in this packet.

Never put these in git:

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

Use public-safe evidence ids only:

```text
SWS-REVSET-ENTITY-YYYYMMDD-01
SWS-REVSET-TAX-YYYYMMDD-01
SWS-REVSET-PAYMENT-YYYYMMDD-01
SWS-REVSET-PRIVACY-YYYYMMDD-01
SWS-REVSET-SUPPORT-YYYYMMDD-01
SWS-REVSET-TERMS-YYYYMMDD-01
```

## Outreach Order

Use this order unless a human reviewer gives a better reason:

1. Accountant/tax reviewer.
2. Privacy/terms reviewer.
3. Payment provider or bank route reviewer.
4. Support/refund/incident owner.
5. Internal operator review of all evidence ids.

Stop after any blocker that makes the next step meaningless. Example: if the accountant blocks the operating route, do not spend time configuring payment intake.

## Message: Accountant / Tax

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

Documentos para contexto:

- HUMAN_REVENUE_INSTRUCTIONS.md
- REVENUE_SETUP_EVIDENCE_PACKET.md
- REVENUE_SETUP_EVIDENCE_INDEX.template.json
- BRAZIL_COMPLIANCE.md
- TERMOS.md
- SUPPORT.md

Pode responder em formato simples:

aprovado_para_piloto_pago: sim/nao/parcial
rota_operacional:
regime/CNAE:
NFS-e:
inscricao_municipal:
pagamento_teste:
reembolso/cancelamento:
conciliacao_mensal:
bloqueios:
proximos_passos:
```

## Message: Privacy / Terms Reviewer

```text
Oi, estou preparando um piloto pago pequeno para Strange Works Studio, mas ainda nao vou coletar dados reais nem pagamento ate revisar privacidade, termos e suporte.

Preciso que voce revise:

- TERMOS.md
- AVISO_DE_PRIVACIDADE.md
- SUPPORT.md
- HUMAN_REVENUE_INSTRUCTIONS.md
- REVENUE_SETUP_EVIDENCE_PACKET.md
- REVENUE_SETUP_EVIDENCE_INDEX.template.json

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

Formato sugerido:

aprovado_para_piloto_pago: sim/nao/parcial
identidade_do_vendedor:
escopo_da_oferta:
dados_permitidos:
dados_bloqueados:
rota_LGPD:
retencao:
processadores:
reembolso/cancelamento:
suporte/incidente:
bloqueios:
proximos_passos:
```

## Message: Payment Provider / Bank Route

```text
Oi, estou preparando a Strange Works Studio para um piloto pago pequeno, mas ainda nao vou receber pagamento ate confirmar a rota de pagamento, saque, reembolso e conciliacao.

Preciso confirmar:

1. se a conta deve estar em nome de pessoa juridica ou se existe rota operacional aprovada;
2. se o provedor permite o tipo de servico planejado;
3. como gerar link de pagamento ou invoice hospedada sem coletar dados de cartao no site;
4. prazo de saque e taxas;
5. como tratar reembolso, disputa, falha de pagamento, reserva e bloqueio de conta;
6. como exportar recibos/transacoes para conciliacao mensal;
7. se pagamento de teste e permitido e como registrar esse teste.

O site atual nao deve coletar dados de cartao e o dashboard interno hoje so aceita URL hospedada com prefixo https://invoice.stripe.com/.

Preciso de resposta escrita com bloqueios, nao de uma aprovacao generica.

Formato sugerido:

provedor:
nome_da_conta:
tipo_de_conta_exigido:
servico_permitido: sim/nao/parcial
link_hospedado:
taxas:
prazo_saque:
reembolso:
disputa/chargeback:
falha_pagamento:
exportacao_conciliacao:
pagamento_teste:
bloqueios:
proximos_passos:
```

## Message: Support / Refund / Incident Owner

```text
Oi, antes de abrir qualquer piloto pago da Strange Works Studio, preciso fechar quem monitora suporte, reembolso, pagamento, privacidade e incidente.

Rotas atuais:

- suporte atual: tuiidagnese+strangeworks@gmail.com
- rota planejada: ops@strangeworks.studio

Preciso confirmar:

1. qual email sera usado no piloto;
2. se um teste de recebimento foi enviado e recebido;
3. horario de checagem diaria;
4. dono de reembolso;
5. dono de problema de pagamento;
6. dono de pedido LGPD;
7. dono de incidente;
8. como escalar se a pessoa responsavel nao responder.

Formato sugerido:

email_suporte:
teste_enviado_em:
teste_recebido_em:
checagem_diaria:
dono_reembolso:
dono_pagamento:
dono_privacidade:
dono_incidente:
rota_escalacao:
bloqueios:
proximos_passos:
```

## Response Triage

Record each response outside git first. Then copy only public-safe fields into the evidence index.

| Response type | Meaning | Action |
| --- | --- | --- |
| approved | Reviewer gave a clear written yes for the narrow pilot scope | Record evidence id and exact reviewed date |
| partial | Reviewer approved only after conditions | Record blockers and keep live mode false until conditions close |
| blocked | Reviewer says the route is not ready | Stop the dependent setup step |
| unclear | Reviewer gave vague, verbal, or incomplete guidance | Ask follow-up questions; do not treat as evidence |

## Public-Safe Evidence Extract

Use this shape in the JSON index or local notes:

```text
evidence_id:
gate:
artifact_type:
reviewer_role:
reviewed_at:
status:
allowed_scope:
blocker_summary:
private_location_hint:
next_step:
```

`private_location_hint` must be a non-secret hint such as:

```text
operator private drive / revenue setup / tax / 2026-05-31
```

Do not include the actual private URL if the URL exposes account, mailbox, portal, customer, bank, or tax data.

## Done Criteria For This Outreach Step

This outreach step is done when:

```text
accountant/tax message sent
privacy/terms message sent
payment route message sent only after tax/entity route is coherent
support owner message sent
all replies saved outside git
public-safe evidence index updated locally
any blocker copied into Operations notes
liveMode still false unless every required gate is closed
```

Verdict:

```text
Outreach may proceed.
Live payment intake remains blocked.
```
