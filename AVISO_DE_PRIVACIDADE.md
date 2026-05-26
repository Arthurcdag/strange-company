# Aviso de Privacidade

Status: rascunho v0 preparado para revisao LGPD. Este aviso nao e parecer juridico. Antes de aceitar dados reais de clientes ou pagamento, o controlador deve revisar este documento com o responsavel humano e, quando necessario, advogado/encarregado.

## 1. Controlador

O controlador da operacao live deve ser o operador brasileiro registrado na evidencia de setup.

Antes de ativar `liveMode`, preencher e revisar:

- Controlador/nome empresarial: **[preencher]**
- CNPJ ou estrutura aprovada: **[preencher]**
- E-mail de suporte e privacidade: **tuiidagnese+strangeworks@gmail.com**
- Encarregado ou canal LGPD: **tuiidagnese+strangeworks@gmail.com**
- Responsavel por incidentes: **operador humano autenticado no Gmail**
- Data da revisao de privacidade: **[preencher]**

Enquanto esses campos nao forem preenchidos e revisados, a pagina publica deve permanecer como prototipo.

## 2. Escopo do Site Publico

A pagina publica do Order Desk e estatica. Ela cria um pacote de pedido no navegador e pode encaminhar o operador para um Google Form configurado. Ela nao deve coletar cartao, credenciais, chaves privadas, dados de saude, dados pessoais sensiveis, dados de criancas/adolescentes ou documentos regulados.

O site usa arquivos estaticos hospedados no GitHub Pages e carrega icones por CDN. Antes de live, o operador deve decidir se vai manter a CDN, auto-hospedar os assets ou documentar o provedor como parte da revisao de privacidade.

## 3. Dados Que Podem Ser Tratados

Na rota v0, o operador pode tratar apenas o minimo necessario para qualificar e executar o pedido:

- nome da organizacao ou cliente,
- e-mail de contato,
- servico solicitado,
- valor proposto,
- descricao de necessidade sem dados proibidos,
- status do pedido,
- numero de fatura, comprovante, NFS-e ou recibo quando aplicavel,
- notas de suporte, entrega, disputa ou incidente,
- metadados tecnicos inevitaveis de hospedagem, e-mail, formulario ou provedor.

Qualquer dado sensivel, regulado ou excessivo deve ser removido, rejeitado ou tratado por rota separada revisada.

## 4. Finalidades

Os dados podem ser usados para:

- responder a pedidos de contato,
- verificar se o servico pode ser prestado com seguranca,
- preparar proposta, fatura manual, NFS-e ou recibo quando aplicavel,
- entregar o pacote contratado,
- manter historico operacional e fiscal,
- atender suporte, cancelamento, reembolso, disputa, privacidade e incidente,
- cumprir obrigacoes legais, fiscais, contabeis e reguladoras do operador.

## 5. Bases Legais

Antes de live, o operador deve mapear cada finalidade a uma hipotese legal da LGPD.

Possiveis bases a revisar:

- execucao de contrato ou procedimentos preliminares,
- cumprimento de obrigacao legal ou regulatoria,
- exercicio regular de direitos,
- legitimo interesse com avaliacao documentada,
- consentimento quando for realmente necessario e adequado.

Se consentimento for usado, ele deve ser informado, destacado, registravel e revogavel.

## 6. Compartilhamento e Operadores

A rota v0 pode envolver:

- GitHub Pages,
- CDN de assets,
- Google Forms/Sheets,
- provedor de e-mail,
- banco ou provedor de pagamento,
- ferramenta de contabilidade ou NFS-e,
- contador, advogado, operador humano ou prestador aprovado.

Antes de live, o controlador deve listar fornecedores reais, papel de cada um, finalidade, pais de tratamento quando aplicavel, contrato ou salvaguarda, e responsavel por acesso.

## 7. Transferencias Internacionais

GitHub, Google, CDN, e-mail, pagamento ou ferramentas de IA podem tratar dados fora do Brasil. Antes de live, o operador deve revisar se ha transferencia internacional, qual base/salvaguarda sera usada e se dados pessoais podem ser minimizados ou excluidos desses fluxos.

## 8. Retencao

O prototipo privado usa `localStorage` no dispositivo do operador. Esses dados ficam ate o navegador apagar ou o operador resetar o console.

Para operacao real, definir antes de live:

- prazo de retencao de pedidos recusados,
- prazo de retencao de pedidos pagos,
- prazo fiscal/contabil para notas, recibos e pagamentos,
- prazo de suporte e incidentes,
- processo de exclusao, bloqueio ou anonimizacao quando aplicavel.

Dados desnecessarios, excessivos ou enviados por erro devem ser removidos ou isolados conforme o processo revisado.

## 9. Direitos dos Titulares

O canal LGPD deve permitir que a pessoa solicite, quando aplicavel:

- confirmacao de tratamento,
- acesso aos dados,
- correcao de dados incompletos, inexatos ou desatualizados,
- anonimizacao, bloqueio ou eliminacao,
- portabilidade quando regulamentada e aplicavel,
- informacoes sobre compartilhamento,
- informacoes sobre consequencias de negar consentimento,
- revogacao de consentimento,
- revisao de decisao tomada unicamente por tratamento automatizado, quando existir.

Pedidos devem ser recebidos e respondidos por humano pelo canal monitorado.

## 10. IA

A IA pode ajudar a organizar informacoes, resumir textos nao sensiveis, preparar checklists e apontar lacunas.

A IA nao deve:

- receber dados proibidos ou documentos regulados na rota v0,
- decidir sozinha sobre direitos do titular,
- responder pedido LGPD sem revisao humana,
- aprovar reembolso, cancelamento, elegibilidade, credito, contrato, imposto ou incidente,
- certificar conformidade com LGPD.

Se houver decisao automatizada que afete interesses do titular, a rota precisa de explicacao clara e revisao humana antes de live.

## 11. Seguranca e Incidentes

O operador deve aplicar minimo necessario, controle de acesso, MFA quando disponivel, separacao de dados, registros de incidente e remocao de dados proibidos.

Incidentes de seguranca ou privacidade devem ser registrados, avaliados por humano e revisados quanto a comunicacao ao titular, ANPD ou outras autoridades quando exigido.

## 12. Criancas, Dados Sensíveis e Dados Regulados

A rota v0 nao e destinada a criancas/adolescentes nem a tratamento de dados sensiveis. Se o cliente precisar enviar esse tipo de dado, o operador deve recusar a rota v0 ou preparar acordo, seguranca, base legal e fluxo separados antes de receber o material.

## 13. Cookies e Logs

O site publico nao deve usar cookies opcionais de marketing na rota v0. Provedores de hospedagem, CDN, formulario, e-mail ou pagamento podem gerar logs tecnicos. Antes de live, o operador deve confirmar quais logs existem, por quanto tempo ficam retidos e como sao protegidos.

## 14. Contato

Canal de suporte/privacidade: **tuiidagnese+strangeworks@gmail.com**

Nao ativar intake publico enquanto este canal nao estiver monitorado e registrado em Setup Evidence.

## 15. Alteracoes

Mudancas de finalidade, fornecedores, dados coletados, IA, retencao, transferencia internacional ou direitos do titular precisam de revisao humana antes de publicacao live.

## 16. Fontes de Revisao

Use estas fontes oficiais durante a revisao humana:

- LGPD: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- ANPD - Aviso de Privacidade: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade
- Marco Civil da Internet: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- Guia ANPD sobre cookies e protecao de dados: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf
