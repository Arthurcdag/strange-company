# Evolution Log

This log records public-safe repo evolution passes. It is not customer evidence,
legal approval, payment proof, tax proof, privacy approval, or launch approval.
Private/local evidence remains in ignored `*.local.json` files.

## 2026-06-12 - Continuous VAU Goal

Objective: make the standing goal explicit in the repo so future runs keep
evolving through verified improvements instead of ad hoc changes.

Changed:

- `tools/vau_company_evolution.py` now emits `continuous_evolution_goal` with objective, cadence, mode, next loop, and guardrails.
- `VAU_COMPANY_EVOLUTION.md` documents the standing goal and mode changes.
- `README.md` links the company-evolution doc.
- `tests/test_vau_company_evolution.py` guards the goal contract.

Verified with:

- `python -m unittest discover -s tests`
- `python -m py_compile tools\vau_company_evolution.py`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: VAU keeps `liveMode` closed while hard blockers remain and recommends
the next verified action.

## 2026-06-12 - Delivery Review Loop

Objective: convert VAU's repeatable delivery-review blocker into a concrete
local-evidence lane without exposing customer evidence.

Changed:

- Added `DELIVERY_REVIEW_LOOP.md`.
- Added `DELIVERY_REVIEW_CHECKLIST.template.json`.
- Added `tools/draft_delivery_review_checklist.js`.
- Added `tools/validate_delivery_review_checklist.js`.
- Added unit tests for the template, draft tool, ready gate, public bundle, and VAU delivery-loop inference.
- Updated `.gitignore`, README, runbook, VAU docs, workflows, public bundle builder, preflight, and survival checks.

Verified with:

- `node tools\validate_delivery_review_checklist.js --template-ok`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`
- template checks for external live packet, public AMA, reviewer tracker, revenue setup, and delivery checklist

Result: VAU can now count `deliveryReviewLoopReady` only when a completed local
`DELIVERY_REVIEW_CHECKLIST.local.json` passes `--require-ready`; otherwise the
delivery loop remains an operational blocker.

## 2026-06-12 - Evolution Pass Audit

Objective: make the continuous-evolution log executable so future repo passes
cannot quietly skip public-safe evidence.

Changed:

- Added `tools/audit_evolution_log.js`.
- Added `tests/test_evolution_log_audit.py`.
- Updated workflow, preflight, survival, README, and public bundle contracts to run or reference the audit.
- Added this log entry as the audit's own durable evidence.

Verified with:

- `node tools\audit_evolution_log.js`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: every dated public evolution pass must include objective, changed
artifacts, verification commands, and a concrete result, while avoiding private
evidence or launch-approval claims.

## 2026-06-12 - Evolution Status Report

Objective: add one command that reports the active continuous-evolution goal,
current mode, live/revenue blockers, latest logged pass, and next actions.

Changed:

- Added `tools/evolution_goal_status.js`.
- Added `tests/test_evolution_goal_status.py`.
- Updated README, workflows, preflight, survival, and public bundle contracts to reference or run the status command.
- Added this log entry so the status command has durable evidence for its own pass.

Verified with:

- `node tools\evolution_goal_status.js --json`
- `node tools\audit_evolution_log.js`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: future operators can run one public-safe status command to see the
current evolution mode, remaining hard blockers, revenue evidence blocker, and
latest verified evolution pass.

## 2026-06-12 - Evolution Next Action Packet

Objective: convert the active status report into a repeatable local operator
packet for the next hard-blocker burn-down action.

Changed:

- Added `tools/generate_evolution_next_packet.js`.
- Added `tests/test_evolution_next_packet.py`.
- Updated `.gitignore`, README, workflows, preflight, survival, and public bundle contracts to reference or run the packet generator.
- Added this log entry so the packet generator has durable evidence for its own pass.

Verified with:

- `node tools\generate_evolution_next_packet.js`
- `node tools\evolution_goal_status.js --json`
- `node tools\audit_evolution_log.js`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: future operators can generate `EVOLUTION_NEXT_ACTION.local.md` as a
private working packet while the tracked repo keeps only public-safe instructions
and validation contracts.

## 2026-06-12 - Live Review Closure Packet

Objective: give operators a narrow, machine-checkable way to close the four
public review-date blockers without claiming payment, fiscal, banking, or full
live-readiness evidence.

Changed:

- Added `LIVE_REVIEW_CLOSURE.template.json`.
- Added `tools/draft_live_review_closure.js`.
- Added `tools/validate_live_review_closure.js`.
- Added tests for the draft and ready-gate validator.
- Updated `.gitignore`, README, human review packet docs, workflows, preflight, survival, and public bundle contracts to reference or run the review-date closure lane.

Verified with:

- `node tools\validate_live_review_closure.js --template-ok`
- `node tools\draft_live_review_closure.js`
- `python -m unittest tests.test_live_review_closure tests.test_draft_live_review_closure`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: the hard-blocker burn-down can now produce `LIVE_REVIEW_CLOSURE.local.json`
as private review-date evidence while the tracked public config still keeps
`liveMode` false until external live and revenue evidence gates pass.

## 2026-06-12 - Live Review Public Config Patch Renderer

Objective: let an operator turn a ready private live-review closure packet into
a public-safe date patch without mutating `public-config.js` or opening live
intake.

Changed:

- Added `tools/render_live_review_public_config_patch.js`.
- Added `tests/test_render_live_review_public_config_patch.py`.
- Updated README, human review packet docs, workflow syntax checks, preflight, survival, and public bundle contracts to reference the renderer.
- Added this log entry so the patch-rendering step is part of the public-safe evolution evidence.

Verified with:

- `node --check tools\render_live_review_public_config_patch.js`
- `python -m unittest tests.test_render_live_review_public_config_patch`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: a ready `LIVE_REVIEW_CLOSURE.local.json` can now render a date-only
`public-config.js` patch, while the renderer refuses template packets, any
attempt to enable live mode, and any claim that the review-date patch is full
live or payment/fiscal readiness.

## 2026-06-12 - Review Closure Status Guidance

Objective: make the standing status and next-action outputs point directly to
the local review-closure workflow instead of leaving operators with generic
review-date instructions.

Changed:

- Updated `tools/evolution_goal_status.js` to emit `reviewClosureActions`.
- Updated `tools/generate_evolution_next_packet.js` to render a Review Closure Workflow section.
- Added tests for status JSON/text output and the generated next-action packet.
- Updated README, preflight, survival, and this log so the guidance remains part of the audited evolution surface.

Verified with:

- `node --check tools\evolution_goal_status.js`
- `node --check tools\generate_evolution_next_packet.js`
- `python -m unittest tests.test_evolution_goal_status tests.test_evolution_next_packet`
- `node tools\evolution_goal_status.js --json`
- `node tools\generate_evolution_next_packet.js`
- `node tools\audit_evolution_log.js`
- `node tools\preflight_public_launch.js`
- `node tools\survival_check.js`

Result: when review-date blockers remain open, the status and next-action packet
now name `LIVE_REVIEW_CLOSURE.local.json`, the ready-gate validator, and the
public config patch renderer while still keeping live mode closed.

## 2026-07-01 - Local Evidence Status Matrix

Objective: add one public-safe command that shows which ignored local evidence
lanes are missing, partial, ready, or invalid without printing private packet
contents.

Changed:

- Added `tools/local_evidence_status.js`.
- Added `tests/test_local_evidence_status.py`.
- Updated README, workflows, public bundle, preflight, survival checks, and bundle tests to reference the status command.
- Added this log entry so the local-evidence status surface remains part of the audited evolution record.

Verified with:

- `node tools\local_evidence_status.js --json`
- `node --check tools\local_evidence_status.js`
- `python -m unittest tests.test_local_evidence_status`
- `node tools\audit_evolution_log.js`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: operators can inspect local evidence lane readiness without exposing
ignored packet contents, while missing or incomplete local evidence still leaves
`liveMode` closed and real approval/payment/fiscal blockers open.

## 2026-07-01 - Evidence Matrix Status Integration

Objective: make the main evolution status and next-action packet surface the
public-safe local evidence matrix so operators can see repo blockers and ignored
evidence-lane readiness together.

Changed:

- Updated `tools/evolution_goal_status.js` to embed the public-safe summary from `tools/local_evidence_status.js`.
- Updated `tools/generate_evolution_next_packet.js` to render a Local Evidence Matrix section and include the local-evidence status validation command.
- Updated tests, README, preflight, and survival checks to cover the integrated status surface.
- Added this log entry so the integrated status matrix remains part of the audited evolution record.

Verified with:

- `node --check tools\evolution_goal_status.js`
- `node --check tools\generate_evolution_next_packet.js`
- `python -m unittest tests.test_evolution_goal_status tests.test_evolution_next_packet`
- `node tools\evolution_goal_status.js --json`
- `node tools\generate_evolution_next_packet.js`
- `node tools\audit_evolution_log.js`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: the primary evolution status now shows local evidence lane counts and
sanitized lane statuses, and the generated next-action packet includes the same
matrix without exposing private `*.local.json` contents or changing `liveMode`.

## 2026-07-13 - Evidence Blocker Reconciliation

Objective: make the evolution status and next-action packet clear blockers only
from validated local evidence and report the same four operating modes as VAU.

Changed:

- Updated `tools/evolution_goal_status.js` to derive revenue and operational blockers from validated local evidence lanes.
- Aligned VAU reviewer readiness with the paid-test-ready role gate and kept missing public routes in operations-hardening mode.
- Kept `publicLiveReady` independent from the current `liveMode` value and added `companyOperationalReady`, `nextLoop`, public-route blockers, and all four evolution modes.
- Updated `tools/generate_evolution_next_packet.js` to render operational blockers and accept a sanitized local-evidence directory for deterministic checks.
- Added regression tests for missing and ready revenue evidence, operational readiness, human live-decision readiness, live operation, and missing public routes.

Verified with:

- `node --check tools\evolution_goal_status.js`
- `node --check tools\generate_evolution_next_packet.js`
- `python -m unittest tests.test_evolution_goal_status tests.test_evolution_next_packet`
- `python -m unittest tests.test_vau_company_evolution`
- `node tools\audit_evolution_log.js`
- `python -m unittest discover -s tests`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: validated payment/fiscal evidence now clears its hard blocker, missing
public or operational evidence cannot produce a false live-decision state, and
live mode no longer makes an otherwise ready system report itself as unready.
