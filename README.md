# Strange Company

Strange Company is a guarded static prototype for a company system that reinvests its own surplus into useful products, evidence, tooling, and resilience.

Current status: prototype only. `public-config.js` must keep `liveMode: false` until the Brazil, payment, privacy, support, tax, and human-review gates are closed with real outside evidence.

## Core Thesis

The company should be hard to corrupt, simple to audit, and useful before it is ambitious.

- No CEO override as the main control path.
- No customer or investor money for trading.
- No guaranteed, minimum, daily, monthly, or fixed returns.
- No AI-only legal, tax, privacy, payment, refund, investment, or launch approval.
- No live intake until the evidence gate passes.
- Own retained surplus only; real products and services only.

## Core Files

- [CHARTER.md](CHARTER.md): constitutional purpose and non-negotiable tests.
- [OPERATING_SYSTEM.md](OPERATING_SYSTEM.md): how the prototype turns orders, receipts, gates, and experiments into operating decisions.
- [SC_GAME_THEORY_RATIONALE.md](SC_GAME_THEORY_RATIONALE.md): plain-language rationale plus investment/trading/customer-money firewall.
- [SC_HUMAN_REVIEW_REQUEST.md](SC_HUMAN_REVIEW_REQUEST.md): Portuguese brief for a paid reviewer/tester.
- [SATELLITE_COMPANY.md](SATELLITE_COMPANY.md): normal service-company lane for external revenue.
- [HUMAN_REVENUE_INSTRUCTIONS.md](HUMAN_REVENUE_INSTRUCTIONS.md): human operator runbook for receiving revenue through the satellite lane.
- [REVENUE_SETUP_EVIDENCE_PACKET.md](REVENUE_SETUP_EVIDENCE_PACKET.md): first outside-evidence packet for revenue setup gates.
- [REVENUE_SETUP_OUTREACH_PACKET.md](REVENUE_SETUP_OUTREACH_PACKET.md): copy/paste outreach messages for accountant, privacy/terms, payment, and support review.
- [REVENUE_SETUP_EVIDENCE_INDEX.template.json](REVENUE_SETUP_EVIDENCE_INDEX.template.json): public-safe evidence index template for revenue setup receipts.
- [TREASURY_OS.md](TREASURY_OS.md): own-surplus treasury guardrails.
- [BRAZIL_COMPLIANCE.md](BRAZIL_COMPLIANCE.md): Brazil-first launch gate and AI/manual split.
- [TERMOS.md](TERMOS.md): Portuguese customer-facing terms draft.
- [AVISO_DE_PRIVACIDADE.md](AVISO_DE_PRIVACIDADE.md): Portuguese LGPD privacy draft.
- [SUPPORT.md](SUPPORT.md): manual support and incident route.
- [RESEARCH_GATE.md](RESEARCH_GATE.md): local claim/review guardrail.
- [VAU_SIM_TO_REAL_RATIONALE.md](VAU_SIM_TO_REAL_RATIONALE.md): VAU as decision support, not proof.
- [INSTALL_AND_TEST.md](INSTALL_AND_TEST.md): install, run, and validation checklist.

## Runtime Surface

- [public.html](public.html): public order-desk surface.
- [public-config.js](public-config.js): public launch flags, support email, form URL, service names, and prices.
- [public.js](public.js): payment-safe public request packet builder.
- [index.html](index.html): private/local command center.
- [script.js](script.js): local dashboard behavior, gates, logs, packets, receipts, and simulations.
- [styles.css](styles.css): interface styling.
- [tools](tools): validation, gate, VAU, and setup helpers.
- [tests](tests): Python regression tests.
- [addons/vautool](addons/vautool): Godot VAU tool prototype.

## Validate

No `npm install` or submodule is required for the core path.

```bash
node --check public-config.js
node --check public.js
node --check script.js
node tools/preflight_public_launch.js
node tools/validate_revenue_setup_evidence.js
node tools/audit_company_functionality.js
node tools/survival_check.js
python -B -m unittest discover -s tests
```

Expected current result: core checks pass, while `node tools/audit_company_functionality.js --require-live` fails because live operation is still blocked.

## Cleanup Rule

Older repeated runbooks, launch packets, evidence notes, and expanded operator docs were removed from the main repo surface. If an old packet is needed for history, recover it from Git history instead of rebuilding the public repo around it.
