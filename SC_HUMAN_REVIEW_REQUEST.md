# Brief Para Revisor / Testador Da Strange Company

Status: handoff pago para revisao/teste humano. Isto e um pedido de critica e teste, nao de aprovacao.

Pagamento sugerido: R$200 BRL por feedback util. O pagamento e pelo trabalho de testar, ler, apontar riscos e entregar problemas claros. Nao e bonus por aprovacao, retorno de investimento, parecer juridico, parecer tributario, parecer contabil, aprovacao de lancamento, nem pagamento para dizer "sim".

Dados de Pix, recibos, documentos pessoais, invoice e identidade do revisor ficam fora deste repositorio.

## Objetivo

Revisar se a Strange Company esta compreensivel, testavel e segura para revisao interna antes de qualquer operacao publica real.

O revisor deve procurar:

- arquivo repetido ou inutil,
- frase confusa,
- fluxo quebrado,
- evidencia faltando,
- risco juridico/compliance,
- promessa de investimento, trade, retorno garantido ou dinheiro de cliente,
- uso de IA parecendo aprovacao legal, fiscal, contabil, LGPD, pagamento ou investimento.

O resultado esperado e uma lista escrita de problemas. Nao aprove operacao ao vivo. `public-config.js` deve continuar com `liveMode: false` ate a checklist externa de evidencias estar completa.

## Materiais Core

Leia primeiro:

- [README.md](README.md)
- [SC_GAME_THEORY_RATIONALE.md](SC_GAME_THEORY_RATIONALE.md)
- [CHARTER.md](CHARTER.md)
- [OPERATING_SYSTEM.md](OPERATING_SYSTEM.md)
- [TREASURY_OS.md](TREASURY_OS.md)
- [SATELLITE_COMPANY.md](SATELLITE_COMPANY.md)
- [BRAZIL_COMPLIANCE.md](BRAZIL_COMPLIANCE.md)
- [TERMOS.md](TERMOS.md)
- [AVISO_DE_PRIVACIDADE.md](AVISO_DE_PRIVACIDADE.md)
- [SUPPORT.md](SUPPORT.md)
- [RESEARCH_GATE.md](RESEARCH_GATE.md)
- [VAU_SIM_TO_REAL_RATIONALE.md](VAU_SIM_TO_REAL_RATIONALE.md)
- [INSTALL_AND_TEST.md](INSTALL_AND_TEST.md)

Teste:

- site publico: `https://arthurcdag.github.io/strange-company/`
- pagina local: `public.html`
- dashboard local: `index.html`
- validacoes em [INSTALL_AND_TEST.md](INSTALL_AND_TEST.md)

## Pergunta Principal

> Esse modelo faz sentido como uma empresa licita que reinveste o proprio excedente retido, ou alguma parte sem querer parece produto de investimento, mesa de trade, gestora de dinheiro de cliente, promessa de token, promessa de retorno garantido ou atalho de compliance aprovado por IA?

## Trabalho Obrigatorio

1. Ler os materiais core.
2. Instalar/testar pelo [INSTALL_AND_TEST.md](INSTALL_AND_TEST.md).
3. Abrir `public.html` e confirmar que o pedido publico continua bloqueado enquanto `liveMode` esta `false`.
4. Abrir `index.html` e verificar se o dashboard nao fica em branco.
5. Rodar os comandos de validacao possiveis na maquina.
6. Listar problemas com arquivo, gravidade, risco e sugestao.
7. Indicar quais arquivos ainda parecem repetidos ou dispensaveis.
8. Apontar qualquer frase que pareca investimento, trade, retorno garantido, gestao de dinheiro de terceiros, custodia cripto ou aprovacao legal por IA.

## Regras De Parada

Bloqueie a acao revisada se ela:

- usa dinheiro de cliente ou investidor,
- promete rendimento ou retorno,
- depende de performance de trade,
- faz custodia, intermediacao ou troca de criptoativos para terceiros,
- pede que IA aprove decisoes juridicas, fiscais, de privacidade, pagamento, investimento, direito do consumidor ou LGPD,
- exige pagamento real, dado real de cliente, credencial privada, CPF/CNPJ, banco, senha ou documento sensivel,
- permite uma pessoa normal entender o projeto como produto financeiro.

## Entrega Esperada

```text
Nome do revisor/testador:
Data:
Tempo gasto:
Fluxo publico testado:
Dashboard local testado:
Comandos rodados:

Resultado geral:
- Seguro para revisao interna: sim/nao/incerto
- Seguro para operacao publica ao vivo: nao
- Principal bloqueio:

Problemas:
1. Gravidade:
   Arquivo/secao:
   Problema:
   Risco:
   Sugestao:

Arquivos repetidos ou dispensaveis:

Frases inseguras para remover ou reescrever:

Evidencias faltantes:

Revisao profissional necessaria:

Nota final:
Entendo que esta revisao nao aprova operacao ao vivo, nao aprova compliance juridico/fiscal/contabil/privacidade/pagamento e nao autoriza mudar liveMode para true.
```

## Mensagem Curta Para Enviar

```text
Oi, queria te pagar R$200 para fazer uma revisao/teste independente da Strange Company.

Nao quero aprovacao. Quero que voce encontre problema: arquivo repetido, coisa inutil, frase confusa, fluxo quebrado, risco juridico/compliance, evidencia faltando ou qualquer parte que pareca investimento, trade, retorno garantido, dinheiro de cliente ou decisao legal feita por IA.

Comece por:
- README.md
- SC_HUMAN_REVIEW_REQUEST.md
- SC_GAME_THEORY_RATIONALE.md
- public.html
- index.html
- INSTALL_AND_TEST.md

Regras:
- nao use dados reais de cliente;
- nao envie CPF/CNPJ, banco, documento, senha ou pagamento real;
- se testar formulario, use "REVIEW TEST - no customer";
- sua revisao nao aprova operacao ao vivo;
- liveMode fica false.

Pode ser revisao negativa. O pagamento e pelo feedback claro.
```
