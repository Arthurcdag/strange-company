# Delivery Review Loop

This packet makes the manual delivery loop repeatable without opening live
intake or putting customer evidence in the public repo.

The loop is:

```text
intake packet -> scoped AI draft -> human review -> revision -> delivery artifact -> receipt-chain update
```

The tracked template is [DELIVERY_REVIEW_CHECKLIST.template.json](DELIVERY_REVIEW_CHECKLIST.template.json).
Completed copies stay local as `DELIVERY_REVIEW_CHECKLIST.local.json`.

## Commands

Create a local draft:

```bash
node tools/draft_delivery_review_checklist.js --write-local
```

Validate the blank tracked template:

```bash
node tools/validate_delivery_review_checklist.js --template-ok
```

Validate a completed local checklist:

```bash
node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready
```

Let VAU read the local delivery-loop evidence:

```bash
python tools/vau_company_evolution.py --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json --depth 1
```

## Ready Gate

The delivery loop is ready only when the local checklist has real references for:

- scoped intake and order evidence,
- a draft artifact,
- a human review date and reviewer,
- a final `https://` delivery artifact,
- receipt-chain update evidence,
- incident review completion,
- and an attestation that no private customer data or secrets were placed in the repo.

This checklist does not approve legal, tax, payment, privacy, or launch gates. It
only proves that one delivery can move through a reviewable manual loop.

## Stop Rules

Keep `readyForDelivery: false` if:

- the customer scope is unclear,
- the artifact includes private customer data that should not be public,
- the human review is missing,
- acceptance criteria are not met,
- there is an unresolved incident,
- the receipt chain was not updated,
- or the operator is trying to treat AI output as final delivery approval.
