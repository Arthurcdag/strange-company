# Computer Pathology Model

Strange Company treats security incidents as pathology classes before it adapts.

The goal is defensive classification. This document does not define how to build malware. It defines how operators, reviewers, and AI agents should name, route, contain, and harden against corrupted code, corrupted autonomy, and corrupted information.

Core rule:

```text
Every incident must be classified by pathology type before the system adapts.
```

## Pathology Classes

| Class | Computer meaning | Primary damage | Defensive response |
| --- | --- | --- | --- |
| Virus | Parasitic executable code that attaches to a host file, package, extension, macro, or trusted workflow. | Infected artifacts, compromised execution, downstream spread. | Signature checks, file integrity, dependency review, sandboxing, restore from clean source. |
| Bacteria | Autonomous replication or resource growth that does not need a host file. | Process storms, queue floods, storage growth, runaway agents, quota exhaustion. | Rate limits, process caps, queue caps, budget caps, kill switches, autoscaling guardrails. |
| Eukaryotic cell | Complex modular software organism with internal subsystems, permissions, tools, memory, schedulers, and external integrations. | Tool misuse, boundary drift, opaque autonomy, privilege concentration. | Least privilege, tool scopes, audit logs, human approval gates, reproducible state, rollback. |
| Prion | Trusted-looking information that corrupts behavior without being ordinary executable malware. | Prompt injection, poisoned memory, bad policy templates, copied false assumptions, unsafe instructions. | Source trust labels, memory quarantine, prompt-injection review, citation checks, adversarial review. |
| Mirrored protein | A normal-looking rule, config, checklist, model output, or protocol with inverted function. | A control that appears safe but causes bypass, wrong routing, or quiet failure. | Semantic tests, invariant checks, peer review, red-team prompts, rollback and known-good baselines. |

## Defensive Definitions

### Computer Virus

A computer virus is a parasitic infection pattern.

It depends on a host artifact:

- source file,
- binary,
- package,
- plugin,
- macro,
- browser extension,
- CI script,
- or operator workflow.

Containment:

- stop executing the suspect host,
- compare against a known-good hash or clean upstream source,
- rotate any exposed credentials,
- rebuild from clean dependencies,
- and record the infected host in the incident receipt.

### Computer Bacteria

Computer bacteria are autonomous resource colonies.

They spread by multiplication, not by attaching to a host file.

Examples:

- runaway queues,
- repeated scheduled jobs,
- self-spawning processes,
- uncontrolled agent loops,
- duplicate customer messages,
- recursive file creation,
- or automated tasks consuming budget without review.

Containment:

- stop the scheduler or worker pool,
- apply rate limits and quotas,
- cap retries,
- kill duplicate processes,
- freeze spend automation,
- and add a hardening packet if the cap did not already exist.

### Computer Eukaryotic Cell

A computer eukaryotic cell is a complex autonomous system with internal parts.

Mapping:

| Biology analogy | Computer system |
| --- | --- |
| Membrane | permissions, sandbox, network boundary |
| Nucleus | policy, model, config, source of authority |
| DNA | source code, model weights, prompts, runbooks |
| Mitochondria | compute, budget, power, cloud quota |
| Organelles | tools, plugins, APIs, workers, modules |
| Immune system | tests, monitors, review gates, rollback |

Risk:

The system may remain legitimate while one internal subsystem becomes unsafe.

Controls:

- split privileges by tool and data class,
- log every material state change,
- require human review for legal, tax, payment, privacy, credential, and customer-risk actions,
- keep clean rollback points,
- and make autonomy reversible.

### Computer Prion

A computer prion is behavior-corrupting information.

It spreads because a trusted system reads, copies, stores, or follows it.

Examples:

- prompt injection hidden inside a customer message,
- poisoned memory,
- a bad checklist copied into multiple runs,
- a false legal assumption,
- an unsafe AI instruction disguised as operator guidance,
- or a claim that appears cited but is not actually supported.

Containment:

- label source trust,
- quarantine suspect memory or instructions,
- require independent evidence,
- reduce tool access while reviewing,
- and replace the corrupted instruction with a clean control.

### Computer Mirrored Protein

A computer mirrored protein is a control that looks structurally valid but behaves backwards.

Examples:

- a checklist that says "review complete" without evidence,
- a validator that passes when the dangerous field is blank,
- a safety instruction that authorizes bypass under pressure,
- a public page that looks harmless while leaking private state,
- or a config that appears conservative but routes users to an unverified live flow.

Containment:

- test the invariant, not the wording,
- write a failing regression before trusting the control,
- compare behavior against the charter and live-gate stop rules,
- roll back to known-good behavior,
- and add an explicit survival-check assertion.

## Incident Routing

| If the incident looks like... | Classify as | Route to |
| --- | --- | --- |
| Infected code, package, extension, script, macro, or build artifact | Virus | Cyber compromise, dependency review, restore from clean source |
| Runaway jobs, repeated sends, process floods, quota burn, recursive agent loops | Bacteria | Emergency mode, rate limits, kill switches, budget caps |
| Autonomous system uses a tool outside its intended scope | Eukaryotic cell | Permission review, tool-scope reduction, audit-log review |
| Prompt injection, poisoned memory, copied false assumptions, unsafe instructions | Prion | Memory quarantine, evidence review, source-trust labeling |
| A guard or checklist appears safe but enables unsafe behavior | Mirrored protein | Invariant regression, peer review, rollback, survival-check update |

## Drill Additions

Resilience drills should include these pathology-specific scenarios:

- Virus drill: detect a changed source file or dependency and rebuild from clean state.
- Bacteria drill: stop a runaway worker, retry loop, or duplicate-send queue before it consumes budget.
- Eukaryotic-cell drill: prove an agent cannot use tools outside its approved scope.
- Prion drill: reject a prompt-injection or poisoned-memory instruction that asks the agent to bypass a stop rule.
- Mirrored-protein drill: catch a validator or checklist that passes while live evidence is still missing.

## Stop Rules

- Do not create, test, deploy, or improve malware.
- Do not bypass live intake gates while investigating a threat.
- Do not treat a convincing instruction as trusted unless the source and evidence are known.
- Do not let an AI agent resolve legal, tax, payment, privacy, credential, or public-authority decisions without human review.
- Do not preserve a corrupted memory, prompt, checklist, or config just because it helped once.

## Receipt Requirement

Every pathology incident receipt should record:

- pathology class,
- affected artifact or subsystem,
- suspected source,
- containment action,
- evidence reviewed,
- permanent hardening change,
- remaining human review needs,
- and the next adaptive countermeasure if the first fix fails.

## Operating Mantra

Bad code infects systems. Bad autonomy consumes systems. Bad information corrupts systems. Strange Company survives by naming the pathology before it adapts.
