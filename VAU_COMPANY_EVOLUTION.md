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

## Run

Use the local Python available on this machine:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' tools\vau_company_evolution.py --depth 3 --max-branches-to-keep 8
```

JSON output:

```powershell
& 'C:\Program Files\LibreOffice\program\python.exe' tools\vau_company_evolution.py --format json
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
- repeatable delivery review loop

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
