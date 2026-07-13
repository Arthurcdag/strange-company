# VAU Company Evolution

VAU is now used as a whole-company evolution loop, not only as a narrow future
simulator.

The company-level loop models:

- public live gate state from `public-config.js`
- human review capacity
- Brazil/legal/privacy/AI handoff review status
- private payment and fiscal evidence readiness
- delivery review loop readiness
- revenue pilot flow
- support, tooling, and risk pressure

## Standing Goal

VAU has one persistent company-evolution objective:

```text
Continuously evolve Strange Company through the next smallest verified improvement while preserving launch gates, public/private separation, and the sealed-company boundary.
```

Each run prints the current evolution mode, the next loop, and the guardrails.
The current mode changes with evidence:

- `burn_down_hard_blockers`: real legal, tax, payment, privacy, Brazil, or AI handoff evidence is still missing.
- `harden_operations`: hard blockers are closed, but reviewer capacity, delivery review, or support receipts still need hardening.
- `ready_for_human_live_decision`: the system looks ready, but a human still has to decide before `liveMode` changes.
- `operate_measure_adapt`: live operation is already on, so every outcome must become a reviewed receipt before scaling.

Constant evolution does not mean constant launch. If evidence is missing, the
correct evolution is to preserve `liveMode: false`, make one verified
improvement, and rerun the loop.

## Run

Use the local Python available on this machine:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' tools\vau_company_evolution.py --depth 3 --max-branches-to-keep 8
```

JSON output:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' tools\vau_company_evolution.py --format json
```

When a reviewed delivery loop exists locally, pass it explicitly:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' tools\vau_company_evolution.py `
  --delivery-review-checklist DELIVERY_REVIEW_CHECKLIST.local.json `
  --depth 1
```

## Rules

VAU may recommend a future, but it cannot create real-world evidence.

Hard blockers remain hard:

- `termsReviewedAt`
- `privacyReviewedAt`
- `brazilComplianceReviewedAt`
- `aiHandoffReviewedAt`
- private payment/fiscal evidence

Operational blockers also matter before scaling:

- 4 human reviewers
- repeatable delivery review loop, validated with `node tools/validate_delivery_review_checklist.js DELIVERY_REVIEW_CHECKLIST.local.json --require-ready`

If these are not complete, the correct VAU evolution is to keep `liveMode`
closed and burn down blockers.

## Reality Correction

When a real event happens, pass it back into the loop:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' tools\vau_company_evolution.py `
  --real-event-json '{\"name\":\"reviewer_candidate_added\",\"domain\":\"human_review\",\"probability_hint\":0.5,\"strategic_value\":1.4,\"tags\":[\"manual\",\"reviewers\",\"capacity\"],\"state_delta\":{\"metrics.human_reviewers_found\":{\"op\":\"increment\",\"value\":1}},\"requires_real_evidence\":true}'
```

VAU keeps futures that match reality, weakens partial matches, and discards the
wrong branches.

## Current Interpretation

The current public config has support and Google Form verification complete, but
review dates are blank and `liveMode` is false. That means the useful evolution
path is:

1. complete human/legal/privacy/Brazil/AI handoff review dates,
2. prepare private payment/fiscal evidence,
3. finish the 4-reviewer bench,
4. make the delivery review loop repeatable,
5. qualify one controlled pilot,
6. only then consider a human live-mode decision.
