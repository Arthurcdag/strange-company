# Research Gate

The Research Gate is a local Strange Company claim filter. It is not a truth oracle and it does not approve live operation.

Its job is narrower:

- catch claims that try to replace human review,
- catch requests to skip Brazil/LGPD/privacy/terms/tax/legal gates,
- catch attempts to turn on live intake without evidence,
- catch simulation-as-proof language,
- catch fake/backdated evidence,
- route vague repo criticism into actionable cleanup work.

## Run

```bash
python tools/strange_research_gate.py \
  --claim "The repo has too many docs" \
  --argument "README.md is noisy, install is unclear, and VAU sounds like a proof engine." \
  --context "external repo review"
```

Expected local guardrail:

```text
repo_signal_to_noise_review
```

Vague criticism is also handled:

```bash
python tools/strange_research_gate.py \
  --claim "Verdict: slop" \
  --argument "The repository is slop." \
  --format json
```

Expected local guardrail:

```text
critique_requires_specifics
```

That means the next action is to ask for exact files, sections, or failing workflows instead of defending the repo abstractly.

## Dependency Policy

The core repo no longer ships the external research submodule. `tools/strange_research_gate.py` runs with a local fallback so reviewers can test the guardrails without cloning a large external workbench.

If the external Effective Boolean Filter is cloned locally at `external/reactive-research-tools`, the adapter can still use it. The Strange Company hard rules remain local either way.
