# Legal Draft Filings

These are draft-only worksheets for the main Strange Company legal procedure.

They are not submitted, not filed, not approved, and not legal advice. They are preparation artifacts for the accountable human operator, counsel, and accounting reviewer.

Sensitive-data rule:

```text
Do not store SSN, ITIN, bank credentials, payment credentials, private keys, or signatures in this repo.
```

## Draft Status

Prepared on: 2026-05-17.

Submission status: not submitted.

Live-operation status: still blocked.

Purpose: prepare the legal filing packet so it can be reviewed, corrected, and eventually submitted outside the repo.

Mode distinction: this document is `Draft`. It is not a `Demand` closure, not an `Experiment` result, and not `Evidence`. A completed worksheet can become reviewer input, but it cannot become proof that a filing happened.

## 1. State Formation Worksheet

Artifact: draft articles / formation memo.

Official source: [SBA business registration](https://www.sba.gov/business-guide/launch-your-business/register-your-business).

Draft fields:

- proposed legal name,
- fallback names,
- entity type,
- formation state,
- principal office,
- mailing address,
- registered agent name and in-state address,
- management structure,
- accountable human guardian,
- business purpose,
- state/local license review,
- initial report, tax board, and foreign qualification follow-ups.

Hold before submission:

- confirm name availability,
- confirm registered agent consent,
- confirm state fee and filing method,
- confirm whether the company will conduct business in other states,
- get counsel/accounting review.

## 2. IRS EIN / SS-4 Worksheet

Artifact: draft SS-4 data packet.

Official sources: [IRS Form SS-4 instructions](https://www.irs.gov/instructions/iss4) and [IRS EIN online application](https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number).

Draft fields:

- legal name exactly as formed,
- trade name if any,
- mailing address,
- physical address,
- county and state of principal business,
- responsible party name,
- entity type,
- reason for applying,
- business activity,
- business start date,
- employee expectation,
- accounting year closing month.

Hold before submission:

- form the state entity first,
- keep responsible party SSN/ITIN outside the repo,
- do not start the IRS online EIN session until the operator can finish it in one sitting,
- print or save the EIN confirmation outside the repo if approved.

## 3. BOI Determination Memo

Artifact: draft FinCEN determination.

Official source: [FinCEN BOI interim final rule Q&A](https://www.fincen.gov/boi/ifr-qa).

Draft fields:

- domestic or foreign formation,
- formation jurisdiction,
- U.S. registration status,
- domestic-entity exemption check dated 2026-05-17,
- foreign reporting-company check if applicable,
- beneficial owner data storage rule,
- reviewer conclusion,
- re-check date.

Current draft posture:

- If the main entity is created in the United States, the draft conclusion is that it is not expected to file an initial federal BOI report under the current FinCEN interim final rule.
- If the entity is foreign-formed and registered to do business in a U.S. state or Tribal jurisdiction, the draft must be replaced with a reporting-company analysis.

Hold before submission:

- re-check FinCEN before relying on this,
- keep beneficial owner personal data outside the repo,
- get legal/accounting review.

## 4. Tax, Bookkeeping, And Payment Worksheet

Artifact: draft finance operations packet.

Official sources: [IRS EIN](https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number) and [SBA launch guidance](https://www.sba.gov/business-guide/launch-your-business).

Draft fields:

- federal tax classification,
- state tax registration questions,
- sales-tax and nexus review,
- local license review,
- business bank requirements,
- payment processor verification fields,
- invoice numbering,
- refund path,
- ledger owner,
- monthly reconciliation calendar.

Hold before submission:

- do not accept or spend live money until bank, payment, tax, invoice, and ledger controls are externally reviewed.

## 5. Privacy And Data-Security Worksheet

Artifact: draft FTC-aligned data plan.

Official source: [FTC Protecting Personal Information](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business).

Draft fields:

- personal-data inventory,
- data minimization rule,
- access-control review,
- TLS and device-control review,
- vendor-control review,
- retention path,
- disposal path,
- privacy notice update,
- support inbox,
- incident communication owner.

Hold before submission:

- do not collect customer data until the data inventory, notice, support route, and incident plan are reviewed.

## 6. Counsel And Accounting Review Request

Artifact: draft signoff checklist.

Draft fields:

- questions for counsel,
- questions for accounting/tax reviewer,
- jurisdiction and offer scope,
- contract exceptions,
- payment exceptions,
- privacy exceptions,
- support exceptions,
- open blockers,
- reviewer decisions,
- no-submit confirmation.

Hold before submission:

- do not mark live operation ready until dated legal and accounting signoff exists, or until the reviewers return a written blocker list that has been closed.

## Next Evolution

Run the [Legal Filing Experiment](LEGAL_FILING_EXPERIMENT.md): use the try matrix to compare candidate formation state, entity type, responsible-party path, BOI branch, data-minimization pass, and reviewer-question triage. After that, fill the state formation worksheet outside the repo, then use the SS-4 worksheet to prepare the IRS EIN session. Do not submit from this repo.
