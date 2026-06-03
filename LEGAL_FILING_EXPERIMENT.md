# Legal Filing Experiment

This is the experiment protocol for evolving the main Strange Company legal draft filings without submitting anything.

Status: `Measure`.

Boundary:

```text
Experiment only. Do not submit state filings, IRS EIN applications, BOI reports, bank forms, payment processor forms, or signed legal documents from this repo.
```

Mode distinction: this document is `Experiment`. It tests the draft packet and produces questions, blockers, or reviewer-ready status. It is not `Draft` itself, not external `Evidence`, and not a `Demand` closure.

## Hypothesis

If the operator fills draft-only filing worksheets with non-sensitive placeholders first, counsel and accounting can identify blockers before any legal submission is attempted.

## Scope

In scope:

- state formation worksheet,
- IRS EIN / SS-4 worksheet,
- BOI determination memo,
- tax, bookkeeping, and payment worksheet,
- privacy and data-security worksheet,
- counsel and accounting review request.

Out of scope:

- submitting formation documents,
- applying for an EIN,
- filing or updating BOI,
- opening bank or payment accounts,
- signing legal documents,
- entering SSN, ITIN, bank credentials, payment credentials, private keys, or signatures into the repo.

## Experiment Arms

### A. State Formation Dry Run

Question: Can the operator choose a candidate entity type, formation state, registered agent route, and follow-up filing list without needing sensitive data?

Success:

- proposed legal name and fallback names are drafted,
- formation state is selected as a candidate, not final legal advice,
- registered agent consent route is identified,
- state/local license and foreign qualification questions are listed.

Kill:

- registered agent consent is unclear,
- formation state is chosen only for avoidance reasons,
- state/local license questions are unknown.

### B. EIN / SS-4 Dry Run

Question: Can the operator complete a non-sensitive SS-4 worksheet after state formation assumptions are chosen?

Success:

- legal name, entity type, addresses, business activity, reason for applying, and accounting year are drafted,
- responsible party name is known,
- SSN/ITIN is explicitly kept outside the repo.

Kill:

- responsible party cannot be identified as a natural person,
- SSN/ITIN would need to enter the repo,
- state formation is not complete enough to support the EIN session.

### C. BOI Determination Dry Run

Question: Can the operator document whether a filing is expected under current FinCEN guidance?

Success:

- domestic or foreign formation status is recorded,
- current FinCEN interim final rule Q&A is cited,
- reviewer re-check date is included.

Kill:

- formation status is ambiguous,
- foreign registration facts are incomplete,
- reviewer cannot confirm the conclusion.

### D. Data And Payment Readiness Dry Run

Question: Can the operator map money and customer-data controls before the first live invoice?

Success:

- bank, processor, invoice, refund, ledger, and reconciliation fields are listed,
- data inventory, minimization, retention, disposal, support, and incident routes are listed,
- FTC data-security principles are reflected.

Kill:

- customer data must be collected before privacy and support routes are reviewed,
- payment setup requires credentials or signatures in the repo,
- tax or sales-tax treatment is unresolved.

### E. Reviewer Request Dry Run

Question: Can the operator produce a review request that counsel and accounting can answer without cleaning up the packet first?

Success:

- open questions are specific,
- blocker list is clear,
- no-submit confirmation is visible,
- reviewer answers can be copied back as evidence references.

Kill:

- reviewers cannot tell what is being formed or sold,
- the packet implies legal approval before review,
- live operation is presented as available.

## Measurement

Track:

- worksheet coverage,
- number of open reviewer questions,
- number of kill criteria triggered,
- whether any sensitive-data boundary was approached,
- whether the Launch Gate still shows legal demands as open.

Pass condition:

```text
All six draft worksheets are non-sensitive, reviewer-ready, and still marked not submitted.
```

The pass condition does not clear live operation. It only means the draft packet is ready for counsel/accounting review.

## Try Matrix

Use these branches to try more without filing anything.

| Branch | Question | Try | Success signal | Stop rule |
| --- | --- | --- | --- | --- |
| Formation state candidate | Which candidate state is operationally plausible before counsel review? | Compare home-state formation, Delaware-style investor default, and pause/no-entity options as placeholders only. | One candidate state is marked reviewer-ready with open questions and no claim that it is legally chosen. | Stop if the choice depends on tax avoidance, unverified state fees, or legal advice not yet received. |
| Entity type candidate | Which entity type should the reviewer evaluate first? | Compare LLC, corporation, nonprofit-adjacent wrapper, and no-entity-yet as review hypotheses. | One primary hypothesis and one fallback are ready for counsel/accounting review. | Stop if the draft implies the entity type is selected or tax-approved. |
| Responsible-party path | Can the accountable human role be identified without storing sensitive identifiers? | Draft the role, authority, replacement route, and Form 8822-B change-control path. | SS-4 worksheet can be reviewed while SSN/ITIN stays completely outside git. | Stop if any SSN, ITIN, private address, signature, or credential would enter the repo. |
| BOI branch test | Is this a domestic-entity exemption memo or a foreign reporting-company analysis? | Run domestic-created and foreign-registered branches against current FinCEN guidance as alternatives. | The BOI memo names the branch, source check date, open assumptions, and reviewer question. | Stop if branch facts are ambiguous or if beneficial-owner personal data would be copied into the repo. |
| Data-minimization pass | Can the first public workflow avoid regulated or unnecessary personal data? | Map intake fields to FTC take-stock, scale-down, lock-it, pitch-it, and plan-ahead checks. | The draft can remove or defer every unnecessary sensitive field before launch. | Stop if the workflow requires protected health, payment card, credential, SSN, or other regulated data. |
| Reviewer question triage | Can counsel and accounting answer the packet without first decoding the project? | Group questions by formation, tax/EIN, BOI, payments, privacy, contracts, and launch gate. | Reviewer can return approve, revise, or block decisions for each demand. | Stop if the questions ask reviewers to infer missing facts or bless a live launch. |

## Next Step

Choose a candidate formation state and entity type, then fill the state formation worksheet outside the repo with non-sensitive placeholders.
