# Main Legal Procedure

This is the operator procedure for moving the sealed Strange Company lane toward lawful live operation.

It is not legal advice, does not form an entity, does not apply for an EIN, does not file BOI, and does not certify tax, privacy, payment, or licensing compliance. It turns the legal demands into an evidence packet that an accountable human operator, counsel, and accounting reviewer can verify outside the repo.

Core rule:

```text
Do not claim live operation, accept a first paid Strange Company invoice, or present the sealed company as legally operational until the outside evidence below exists and has been reviewed.
```

## Mode Distinctions

The legal lane has four separate states:

- **Demand** means an outside legal, tax, payment, privacy, or reviewer requirement is open. It blocks live operation.
- **Draft** means a non-sensitive worksheet is prepared. It closes nothing by itself.
- **Experiment** means a dry run is measuring whether the draft packet is reviewer-ready. It can produce questions or blockers, but it cannot authorize filings.
- **Evidence** means a filed, issued, reviewed, or signed artifact exists outside the repo. Evidence can close a demand only after responsible human review.

Never promote `Draft` or `Experiment` into `Evidence`. Never treat `prepared`, `measured`, or `review-ready` as `submitted`, `filed`, `issued`, `signed`, or `approved`.

## Required Evidence Packet

### 1. State legal existence

Owner: accountable human guardian.

Timeline: before live operation or first Strange Company invoice.

Evidence required:

- formation filing or certificate,
- registered agent,
- governance document,
- state/local license review,
- foreign qualification review if activity crosses state lines.

Official source: [SBA business registration](https://www.sba.gov/business-guide/launch-your-business/register-your-business).

### 2. EIN and responsible party

Owner: human responsible party.

Timeline: after entity formation and before bank or payment setup.

Evidence required:

- qualified responsible party,
- EIN confirmation or IRS 147C proof,
- responsible-party change-control route.

The IRS says an EIN applicant must name a responsible party, and that responsible party must generally be a person rather than an entity. The sealed company cannot be its own IRS responsible party.

Official sources: [IRS EIN](https://www.irs.gov/businesses/employer-identification-number) and [IRS responsible parties and nominees](https://www.irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees).

### 3. BOI determination

Owner: legal/accounting reviewer.

Timeline: before live operation and whenever formation status changes.

Evidence required:

- current BOI determination memo or filing receipt,
- exemption basis if no filing is required,
- fresh source check before launch.

As reviewed on 2026-05-17, FinCEN's current BOI page says U.S.-created entities and their beneficial owners are exempt from the federal BOI reporting requirement under the interim final rule, while qualifying foreign entities still have reporting duties. This must be re-checked before relying on it.

Official source: [FinCEN BOI](https://www.fincen.gov/boi).

### 4. Tax, bookkeeping, and payment lane

Owner: accounting owner.

Timeline: before accepting or spending live money.

Evidence required:

- tax classification,
- sales-tax and licensing review,
- invoice numbering,
- business bank and payment processor verification,
- ledger owner,
- monthly reconciliation calendar.

Official sources: [IRS EIN](https://www.irs.gov/businesses/employer-identification-number) and [SBA launch your business](https://www.sba.gov/business-guide/launch-your-business).

### 5. Privacy, security, support, and incident route

Owner: operator plus security reviewer.

Timeline: before collecting customer data.

Evidence required:

- personal-data inventory,
- minimization rule,
- TLS/access-control review,
- retention and disposal path,
- privacy notice,
- support inbox,
- incident communication plan.

The FTC guidance frames a sound data-security plan around taking stock, scaling down, locking data, disposing of what is no longer needed, and planning for incidents.

Official source: [FTC Protecting Personal Information](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business).

### 6. External professional signoff

Owner: outside counsel and accounting reviewer.

Timeline: before live-operation claim.

Evidence required:

- dated counsel review memo or checklist,
- dated accounting/tax review memo or checklist,
- contract/payment/privacy/support review,
- jurisdiction and offer-specific exceptions.

## Repo Behavior

The Launch Gate renders these demands as open blockers and can copy a legal procedure packet for review. The packet is a receipt checklist, not proof of compliance.

The gate remains blocked until the operator attaches real outside artifacts and a qualified reviewer confirms that the chosen entity, jurisdiction, offer, payment path, and data flow are acceptable.

## Draft Filing Mode

Use [LEGAL_DRAFT_FILINGS.md](LEGAL_DRAFT_FILINGS.md) to prepare the filing packet before submission.

Draft filing mode means:

- state formation, EIN, BOI, tax/bookkeeping/payment, privacy/security/support, and professional-signoff worksheets are prepared,
- no filing has been submitted,
- no EIN has been issued,
- no BOI conclusion is final until FinCEN and reviewer guidance are re-checked,
- no sensitive identifiers are stored in the repo,
- live operation remains blocked.

The Launch Gate can copy a `DRAFT ONLY` filing packet. That packet is preparation for review, not evidence that any legal demand has been satisfied.

The next step is the [Legal Filing Experiment](LEGAL_FILING_EXPERIMENT.md), which measures whether the draft packet is reviewer-ready while preserving the no-submit boundary.
