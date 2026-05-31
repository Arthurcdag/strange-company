# Instalar E Testar O Core

Este guia e para um dev, revisor ou testador validar o core da Strange Company sem liberar operacao ao vivo.

## Mensagem Curta

```text
Repo:
https://github.com/Arthurcdag/strange-company

Instalacao:
1. git clone https://github.com/Arthurcdag/strange-company.git
2. cd strange-company

Abrir:
- public.html para a pagina publica.
- index.html para o dashboard privado/local.
- opcional: python -m http.server 8080

Testar:
node --check public-config.js
node --check public.js
node --check script.js
node --check tools/revenue_setup_schema.js
node tools/preflight_public_launch.js
node tools/validate_revenue_setup_evidence.js
node tools/report_revenue_setup_gaps.js
node tools/check_revenue_setup_schema_sync.js
node tools/check_revenue_setup_schema_sync_gate.js
node tools/check_revenue_setup_evidence_gate.js
node tools/audit_company_functionality.js
node tools/survival_check.js
python -B -m unittest discover -s tests

Resultado esperado:
- Os checks de core passam.
- O live gate continua bloqueado.
- Nao mude liveMode para true.
```

## Requisitos

- Git.
- Node.js 20+.
- Python 3.11+.
- Navegador moderno.

Fallback validado nesta maquina se `node` nao estiver no PATH:

```powershell
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' --version
```

Fallback validado nesta maquina se `python` nao estiver no PATH:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' -B -m unittest discover -s tests
```

## Abrir Localmente

Opcao direta:

```powershell
Start-Process .\public.html
Start-Process .\index.html
```

Opcao com servidor local:

```powershell
python -m http.server 8080
```

Depois abra:

- `http://127.0.0.1:8080/public.html`
- `http://127.0.0.1:8080/index.html`

## Teste Manual

Pagina publica:

1. A pagina deve carregar sem console error.
2. Links de `Termos`, `Privacidade`, `Support` e `Core` devem abrir.
3. O formulario nao deve pedir cartao, senha, documento, chave privada, dado medico, dado bancario ou pagamento real.
4. Enquanto `liveMode` estiver `false`, envio real deve continuar bloqueado.

Dashboard local:

1. A navegacao lateral deve trocar as telas sem ficar branco.
2. `Operations` deve mostrar que o live gate esta bloqueado.
3. `Research Gate` deve mostrar guardrails locais.
4. Botoes de copiar packet/receipt devem gerar texto sem pedir segredo ou dado real.

Use apenas dados falsos de teste, como `REVIEW TEST - no customer`.

## Validacao Rapida

```powershell
node --check public-config.js
node --check public.js
node --check script.js
node --check tools\revenue_setup_schema.js
node --check tools\preflight_public_launch.js
node --check tools\validate_revenue_setup_evidence.js
node --check tools\report_revenue_setup_gaps.js
node --check tools\check_revenue_setup_schema_sync.js
node --check tools\check_revenue_setup_schema_sync_gate.js
node --check tools\check_revenue_setup_evidence_gate.js
node --check tools\audit_company_functionality.js
node --check tools\survival_check.js
node tools\preflight_public_launch.js
node tools\validate_revenue_setup_evidence.js
node tools\report_revenue_setup_gaps.js
node tools\check_revenue_setup_schema_sync.js
node tools\check_revenue_setup_schema_sync_gate.js
node tools\check_revenue_setup_evidence_gate.js
node tools\audit_company_functionality.js
node tools\survival_check.js
python -B -m unittest discover -s tests
git diff --check
```

Com Node local:

```powershell
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\preflight_public_launch.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\validate_revenue_setup_evidence.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\report_revenue_setup_gaps.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\check_revenue_setup_schema_sync.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\check_revenue_setup_schema_sync_gate.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\check_revenue_setup_evidence_gate.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\audit_company_functionality.js
& 'C:\Users\Usuario\AppData\Local\OpenAI\Codex\bin\node.exe' tools\survival_check.js
```

Com Python do LibreOffice:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' -B -m unittest discover -s tests
```

## Research Gate

O Research Gate roda sem submodulo externo:

```powershell
python tools\strange_research_gate.py --claim "The repo has too many docs" --argument "README.md install is unclear and VAU overclaims." --format json
```

Se um workbench externo for clonado localmente em `external/reactive-research-tools`, o adaptador pode usar essa camada tambem. Ela e opcional; as regras duras da Strange Company continuam no proprio repo.

## Live Gate

Este comando deve falhar no estado atual:

```powershell
node tools\audit_company_functionality.js --require-live
node tools\validate_revenue_setup_evidence.js --require-ready
```

Isso e correto enquanto faltarem evidencias externas reais. Nao force `liveMode: true` nem marque evidencias como aprovadas para fazer teste passar.
