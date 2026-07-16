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

## 2026-07-14 - Fail-Closed Live Readiness and Operator Handoff

Objective: eliminate pre-live false positives, give the operator one
dependency-aware next handoff, and stop the public paid desk from inviting
customer data before strict live readiness.

Changed:

- Added `privateExternalLiveEvidence` to the evolution status hard blockers and made `selectedHandoff` choose one non-executing evidence lane before the backlog.
- Updated the next-action packet to put the selected handoff first and expose the external live blocker separately.
- Updated VAU to validate revenue and external-live packets through the authoritative Node validators and fail closed when either packet, Node, or validation is unavailable.
- Made strict revenue/external validation require the current `public-config.js`, cross-checked the revenue packet's internal support, form, terms, and privacy evidence against its public snapshot, and rejected stale evidence even when only the snapshot was updated.
- Rejected future public review dates, required real ordered UTC timestamps for support and Form connectivity tests, and capped those external test receipts at 30 days so a new public lease cannot be issued from impossible or stale timing evidence.
- Added a public-only seven-day receipt with separate SHA-256 core and envelope integrity checks, no private packet data or hashes, and attestations for revenue, external-live, reviewer-capacity, and delivery-review validators.
- Bound the receipt to normalized public `TERMOS.md` and `AVISO_DE_PRIVACIDADE.md` hashes so post-review legal-copy drift invalidates readiness across Windows and Linux.
- Made the browser recompute both receipt digests and refetch the current receipt plus legal documents before submit, on visibility, and every minute, so expiry, legal drift, and server-side revocation close already-open tabs.
- Added a safe `--revoke` path that writes a current-core fail-closed placeholder with no private packets, including after the Form URL is removed.
- Required strict reviewer/delivery evidence and VAU capacity inputs to use `mode: local`, and required the pre-live external packet to attest `google.acceptingResponses: false`.
- Required every individual revenue evidence gate to use `mode: local`; support, privacy, terms, and ledger gates also bind to the current public config instead of accepting diagnostic packets as proof.
- Removed the responder URL from the tracked closed config and public documentation, and documented that the static lease cannot close a directly opened external Form; response collection remains a human-owned external toggle.
- Removed mutable third-party runtime JavaScript from the public page and added a same-origin Content Security Policy, leaving only the allowlisted receipt/legal-document GETs.
- Made the Pages deployment run the full Python test suite before build, upload, or deploy, so a direct `main` push cannot bypass behavioral regressions.
- Aligned status and VAU so operating capacity is complete before receipt issuance or a human live decision.
- Fixed individual revenue evidence gates so mandatory no-secrets and human-approval attestations apply outside `--require-all` too.
- Made the public order form hidden and disabled by default, with a closed-intake notice that hands visitors to the public-safe AMA until strict readiness passes.
- Reordered every live handoff runbook to keep `liveMode` false through review-date publication, bound private validation, reviewer/delivery validation, receipt issuance, preflight, and status; the human flip is a separate last decision.
- Added regression tests plus preflight, functionality-audit, survival, README, and VAU documentation contracts for the new boundaries.

Verified with:

- `node --check public.js`
- `node --check tools\evolution_goal_status.js`
- `node --check tools\generate_evolution_next_packet.js`
- `node --check tools\validate_revenue_setup_evidence_index.js`
- `node --check tools\export_public_live_receipt.js`
- `python -m unittest tests.test_revenue_setup_evidence_index tests.test_evolution_goal_status tests.test_evolution_next_packet tests.test_vau_company_evolution tests.test_public_ama`
- `python -m unittest tests.test_public_live_receipt tests.test_external_live_packet_binding`
- `python -m unittest discover -s tests`
- `node tools\audit_evolution_log.js`
- `node tools\preflight_public_launch.js`
- `node tools\preflight_public_launch.js --deployment`
- `node tools\audit_company_functionality.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: missing, internally stale, future-dated, malformed, or config-mismatched private evidence and a
missing, edited, expired, revoked, or stale public receipt can no longer produce a
live-decision state; `liveMode` or a format-valid fake digest alone cannot open
the paid desk, public legal-document drift closes the receipt, operating-capacity
gates are aligned across the browser, status, and VAU, and the public AMA remains
available. The bundle is explicit that direct Google Form response collection is
an external human-controlled route, not something a static receipt can revoke.

## 2026-07-16 - Document-Bound Human Review Closure

Objective: close the review-to-receipt drift gap by binding every human review
approval to the exact normalized document bytes that were reviewed.

Changed:

- Bumped `LIVE_REVIEW_CLOSURE.template.json` to schema v2 and added canonical,
  path-bound SHA-256 digests for every terms, privacy, Brazil compliance, and AI
  handoff document.
- Updated the closure drafter and validator so drafts snapshot current files and
  `--require-ready` recomputes trusted canonical files, rejecting missing,
  malformed, substituted, extra, or stale document digests.
- Required the authoritative closure validator in receipt issuance, evolution
  status, the next-action packet, and VAU while keeping check-only and revocation
  flows independent from private local packets.
- Added only a public-safe boolean closure-validator attestation to the public
  receipt; private packet contents and hashes remain excluded.
- Updated operator runbooks, preflight/survival contracts, and regression tests
  for missing closure evidence, document drift, line-ending normalization, and
  fail-closed status/receipt behavior.

Verified with:

- `node --check tools\validate_live_review_closure.js`
- `node --check tools\export_public_live_receipt.js`
- `node --check tools\evolution_goal_status.js`
- `python -m unittest tests.test_live_review_closure tests.test_draft_live_review_closure tests.test_render_live_review_public_config_patch tests.test_local_evidence_status`
- `python -m unittest tests.test_public_live_receipt tests.test_evolution_goal_status tests.test_evolution_next_packet tests.test_vau_company_evolution tests.test_public_ama`
- `python -m unittest discover -s tests`
- `node tools\audit_evolution_log.js`
- `node tools\preflight_public_launch.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: a missing or stale human-review closure now keeps `liveMode` closed and
blocks receipt issuance even when public review dates are populated; edits to any
required reviewed document require a new digest snapshot and renewed human review
before readiness can advance.

## 2026-07-16 - Nine-Document Runtime Review Binding

Objective: extend document-bound review integrity through the deployed runtime
so every reviewed terms, privacy, Brazil compliance, and AI handoff file is
revalidated by the public receipt and browser, not only during private closure.

Changed:

- Replaced the legacy two-document public receipt core with schema v3's exact
  `reviewDocuments` map for all nine canonical reviewed paths.
- Added shared path-bound digest, core, and envelope domains so the exporter and
  browser recompute the same normalized document and receipt bytes.
- Froze the config, closure packet, and all nine documents into one private
  issuance snapshot so a concurrent file swap cannot make validation and the
  emitted receipt describe different bytes.
- Kept browser polling lightweight with one-minute receipt checks and a
  15-minute document-verification cache, while forcing all nine documents to be
  rechecked on security transitions and immediately before paid submission.
- Enforced the same one-million-code-unit public asset limit in the exporter and
  browser so issuance cannot produce a receipt the deployed runtime cannot read.
- Required every reviewed document in the public bundle and added preflight,
  functionality-audit, and survival contracts for schema, domains, paths, and
  removal of the legacy `legalDocuments` shape.
- Made the post-build check compare source and bundled size plus exact bytes for
  all nine documents, then validate the bundled receipt against the bundled
  config and document root with the trusted root exporter.
- Updated human, external-live, README, and VAU guidance to distinguish the
  private schema-v2 closure from the public schema-v3 runtime receipt.

Verified with:

- `node --check tools\build_public_site.js`
- `node --check tools\preflight_public_launch.js`
- `node --check tools\audit_company_functionality.js`
- `node --check tools\survival_check.js`
- `python -m unittest tests.test_public_live_receipt tests.test_public_ama tests.test_public_site_bundle`
- `python -m unittest tests.test_public_site_bundle tests.test_evolution_goal_status`
- `python -m unittest discover -s tests`
- Full discovery result: 236 tests passed; 1 skipped.
- `node tools\audit_evolution_log.js`
- `node tools\preflight_public_launch.js`
- `node tools\audit_company_functionality.js`
- `node tools\build_public_site.js --check --output .public-site-build.local --force`
- `node tools\survival_check.js`

Result: all nine public reviewed files now form one exact runtime digest set;
any missing path, substituted key, content drift, receipt edit, or stale lease
keeps paid intake fail-closed. This is process-integrity evidence only, and
`liveMode` remains false until the separate human decision and external gates.
