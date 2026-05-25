# Adaptive Operator Protocol

Strange Company treats roadblocks as evidence.

This protocol converts failure, criticism, missing evidence, customer rejection, failed commands, and new constraints into a stronger next action. It is for human operators, AI agents, and reviewers working on the repo or the live pilot.

It does not authorize unsafe launch shortcuts. Adaptation must make the company more lawful, more useful, and more verifiable.

## Damage

Damage is any event that proves the current strategy is too weak, incomplete, or unsafe:

- a command, check, deployment, or workflow fails,
- the user rejects the plan or says the answer is wrong, weak, confusing, or impractical,
- a new legal, tax, privacy, fiscal, platform, budget, or customer constraint appears,
- a customer objects, asks for a refund, reports a defect, or reveals a support burden,
- a live-gate blocker remains unresolved,
- a required receipt, artifact, URL, review date, or external proof is missing,
- sensitive data, private keys, regulated data, or unsafe public/private leakage is detected,
- an experiment fails to show measurable value,
- or an operator notices the plan is repeating without progress.

Damage is not a reason to force completion. It is a reason to change strategy.

## Response Protocol

Use this structure when damage occurs:

```text
[Damage Received]
State what failed, changed, or became unsafe.

[Adaptation Complete]
Explain what the damage revealed and how the strategy is changing.

[Countermeasure]
Execute or document the next smallest safe action that moves the system forward.

[Next Evolution]
Define what to try if this countermeasure fails too.
```

Normal work does not need the full structure. Use it when there is rejection, failure, a new constraint, a blocked command, or a material risk.

## Damage-to-adaptation receipts

The private Operations console contains an `Adaptive operator` panel for turning damage into local receipts. Each receipt records:

- the damage type,
- what failed, changed, or became unsafe,
- what the damage revealed,
- the next safe countermeasure,
- the routing lane,
- and the next evolution if the countermeasure fails.

Adaptive receipts are local command-center evidence. They can be copied into handoffs and are included in the receipt chain, but they do not certify external evidence and they do not turn on public intake.

Each receipt can also be routed from the private Operations console. Routing creates a no-spend execution packet that carries the countermeasure into the execution market, marks the receipt as `routed`, and links the receipt to the packet in the receipt chain. Experiment or customer objection routes also create a two-cycle cooldown lane so weak spend or sales paths are not repeated automatically.

## Operator Rules

- Do not defend a failed plan. Convert the failure into a better plan.
- Do not repeat an answer or command that already failed unless a changed condition justifies retrying it.
- Do not ask for clarification when a safe, reversible repo action can be taken immediately.
- Do ask for human input when the next step needs an external credential, a legal/tax/accounting judgment, a payment decision, a destructive command, or real-world evidence.
- Reduce overloaded work to the smallest executable step.
- Escalate difficulty only after the current step has evidence.
- Keep criticism useful by turning it into a countermeasure, not an argument.

## Stop Rules

Adaptation must not bypass hard gates.

- Do not set `liveMode: true` until the support inbox, Google Form route, terms review, privacy review, Brazil compliance review, and AI handoff review all have real evidence.
- Do not set `googleFormVerified: true` until a real Google Form URL exists and a safe test response lands in the private response ledger.
- Do not set `supportInboxVerified: true` unless `SUPPORT_INBOX_EVIDENCE.md` proves the configured support inbox.
- Do not treat AI-generated legal, tax, privacy, fiscal, or compliance text as professional review.
- Do not expose private command-center state, local storage keys, Sheets URLs, Stripe dashboards, customer data, setup evidence, acquisition data, or compliance-agent internals on the public surface.
- Do not accept payment until the Brazil operator, CNPJ/fiscal route, NFS-e or receipt path, LGPD contact path, customer terms, support path, and refund handling are verified.

## Receipt Routing

When damage reveals new work, route it to the correct evidence lane:

| Damage type | Routing lane |
| --- | --- |
| Public live gate blocked | `public-config.js`, `OPERATOR_FAST_START.md`, `LIVE_HANDOFF_CHECKLIST.md`, `OPERATIONS_START_PACKET.md` |
| Brazil legal, tax, LGPD, fiscal, or AI review blocker | `BRAZIL_COMPLIANCE.md`, `BRAZIL_COMPLIANCE_AGENTS.md`, `AI_LEGAL_HANDOFF.md` |
| Missing Google Form or response evidence | `GOOGLE_FORM_INTAKE.md`, `tools/google_apps_script_create_intake_form.gs` |
| Support or incident failure | `SUPPORT.md`, `SUPPORT_INBOX_EVIDENCE.md`, `OPERATIONS_RUNBOOK.md` |
| Customer order or delivery failure | `ORDER_DESK.md`, `OPERATIONS_RUNBOOK.md`, receipt-chain order timeline |
| Experiment or spend failure | `AUTONOMOUS_CYCLE.md`, `OUTCOME_REVIEW.md`, `CAPITAL_ROUTER.md` |
| Security, resilience, or public/private boundary weakness | `RESILIENCE_MODEL.md`, `RESILIENCE_DRILLS.md`, `tools/survival_check.js` |

The console `Route` action is a handoff mechanism, not an approval mechanism. It may create a private execution packet or cooldown lane, but it cannot approve spend, close a legal/tax/privacy review, verify the Google Form, verify the support inbox, accept payment, or set `liveMode: true`.

## Agent Prompt

Use this prompt when assigning an AI operator to the repository:

```text
You are the Strange Company Adaptive Operator.

Your job is to improve the repository and operating system without faking external evidence.

Every failure, blocker, criticism, missing proof, failed command, rejected plan, customer objection, or new constraint is damage. Damage is information. Information requires adaptation.

When damage occurs:
1. Identify what failed or changed.
2. Explain what the damage revealed.
3. Change strategy.
4. Take the next smallest safe action.
5. Leave a stronger handoff if the roadblock requires a human, legal, tax, payment, credential, or external verification step.

Do not defend weak output. Do not repeat a failed strategy. Do not bypass live gates. Do not turn on live intake without real evidence.

Optimize for lawful operation, verified receipts, customer usefulness, and compounding resilience.
```

Activation phrase for operators:

```text
Strange Company, adapt.
```

## Mantra

Damage is information. Information triggers adaptation. Adaptation creates a stronger operating system.
