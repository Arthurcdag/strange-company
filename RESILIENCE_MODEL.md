# Strange Company Resilience Model

## Philosophy

Strange Company survives by reducing dependency, increasing reversibility, and making capture expensive.

It should assume that every privileged person, vendor, platform, model, bank, and code path may eventually fail.

The company is not designed to be untouchable. It is designed to keep functioning when parts are touched, damaged, frozen, compromised, sued, or abandoned.

## Threat Model

### 1. Governance Capture

Risk:

A person or coalition gains practical control over the company.

Controls:

- no unilateral admin powers,
- multi-signature treasury control,
- guardian conflict disclosures,
- rotating credentials,
- public charter,
- action logs,
- spending limits,
- constitutional review for structural changes.

### 2. Key Person Failure

Risk:

A founder, developer, operator, lawyer, accountant, or vendor disappears.

Controls:

- documented processes,
- escrowed credentials,
- reproducible infrastructure,
- no undocumented manual operations,
- at least two vendors for critical functions,
- emergency replacement playbooks.

### 3. Treasury Attack

Risk:

Funds are stolen, frozen, misallocated, or trapped.

Controls:

- account diversification,
- spending caps,
- multi-party approvals,
- delayed high-value transfers,
- fraud monitoring,
- accounting reconciliation,
- reserves held across institutions,
- insurance where practical.

### 4. Cyber Compromise

Risk:

Systems, customer data, source code, or credentials are compromised.

Controls:

- least-privilege access,
- hardware-backed admin keys,
- secrets management,
- mandatory MFA,
- continuous backups,
- vulnerability scanning,
- dependency updates,
- external penetration testing,
- bug bounty program,
- incident response drills.

### 5. Platform Dependency

Risk:

Cloud provider, payment processor, app store, social platform, search engine, AI provider, or marketplace blocks the company.

Controls:

- portability requirements,
- exportable data,
- provider abstraction for critical APIs,
- backup payment processor,
- multiple acquisition channels,
- direct customer list,
- independent domain and email infrastructure.

### 6. Legal and Regulatory Shock

Risk:

The company violates law, misunderstands obligations, or gets hit by a rule change.

Controls:

- counsel review for regulated products,
- compliance register,
- audit-ready records,
- jurisdiction map,
- privacy and data retention policy,
- tax compliance,
- conservative product selection for v0.

### 7. Reputation Attack

Risk:

The brand is framed as malicious, scammy, unsafe, or unaccountable.

Controls:

- public charter,
- plain-language ethics policy,
- clear customer support path,
- transparent incident reports,
- avoid hostile public naming,
- publish security and compliance posture,
- never use growth tactics that look like abuse.

### 8. Market Death

Risk:

A product niche stops working.

Controls:

- portfolio of small products,
- fast kill criteria,
- reusable infrastructure,
- customer discovery pipeline,
- acquisition of small revenue assets,
- monthly capital allocation review.

## Resilience Scorecard

Each product or internal system receives a score from 0 to 5.

| Dimension | Question |
| --- | --- |
| Legal | Can we defend this under audit? |
| Financial | Does this improve or protect compounding? |
| Operational | Can it run without one specific person? |
| Technical | Can it recover from failure or compromise? |
| Vendor | Can we move if a provider fails? |
| Data | Is sensitive data minimized and protected? |
| Reputation | Would this look legitimate to a skeptical outsider? |

Anything below 3 in any dimension needs a mitigation plan before scaling.

## Emergency Modes

### Yellow Mode

Elevated risk.

Actions:

- pause nonessential spend,
- increase logging,
- review credentials,
- notify guardians,
- prepare rollback.

### Red Mode

Active serious incident.

Actions:

- freeze high-risk automation,
- rotate credentials,
- preserve evidence,
- move to backup providers if needed,
- contact counsel or incident response vendor,
- communicate with affected users when required.

### Black Mode

Existential threat.

Actions:

- suspend autonomous spending,
- lock treasury movement except approved recovery actions,
- invoke guardian emergency process,
- isolate systems,
- preserve legal entity,
- protect customer data,
- rebuild from clean backups.

## Anti-Fragility Rule

Every incident must produce at least one permanent improvement:

- new control,
- better documentation,
- additional vendor path,
- reduced privilege,
- stronger monitoring,
- improved contract language,
- simpler architecture,
- or clearer public trust signal.

## Drill Rule

Resilience is not a static score. The company must run attack drills and record the result.

A passing drill strengthens the scorecard.

A weak drill creates an incident receipt and should issue a hardening packet through the Execution Market.

This keeps the company from merely describing resilience while leaving the weak point unfixed.
