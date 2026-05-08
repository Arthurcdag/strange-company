# Strange Company Research Gate

Strange Company now uses the cloned `reactive-research-tools` repository as a decision sanity layer.

Source:

```text
external/reactive-research-tools
```

Primary module:

```text
projects/effective_boolean_filter
```

The Effective Boolean Argument Filter is not a truth oracle. It checks whether a claim preserves its yes/no structure across negation, scope, context, definitions, contradictions, and reactive probes.

## Why It Fits Strange Company

Strange Company needs growth, but growth claims are dangerous when they quietly change scope.

Examples the gate should catch:

- "Works in simulation" becoming "works in production."
- "No evidence against this" becoming "this is true."
- "Not legally impossible" becoming "physically or commercially viable."
- "A test did not fail" becoming "scale treasury spend now."

## Local Adapter

Run the default Strange Company sample:

```bash
python tools/strange_research_gate.py
```

Run your own decision:

```bash
python tools/strange_research_gate.py \
  --claim "This bounty should receive scale funding" \
  --argument "The prototype worked in simulation, therefore it will improve production revenue" \
  --context "treasury review" \
  --strictness high
```

The adapter exits with code `0` only for `accept` or `accept_with_caveats`. Other recommendations return `1`, which makes it usable in future automation.

## Live Dashboard

Start the filter dashboard:

```bash
python -m uvicorn effective_boolean_filter.api:app \
  --app-dir external/reactive-research-tools/projects/effective_boolean_filter/src \
  --host 127.0.0.1 \
  --port 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

The Strange Company prototype links to this dashboard from the `Research Gate` tab.

## Prototype Console

The Strange Company prototype can now post directly to the local filter API from:

```text
index.html#research
```

The console:

- evaluates a claim, argument, context, and strictness level,
- renders recommendation, polarity, score, confidence, issues, and probes,
- stores recent gate receipts in browser local storage,
- mirrors recent gate runs into the decision log.

Because the prototype opens from `file://`, the local filter API includes a conservative CORS bridge for `Origin: null` and localhost origins.

## Verification Run

Completed locally:

```text
python -m pytest projects/effective_boolean_filter/tests/test_negation_parity.py projects/effective_boolean_filter/tests/test_scope_shifts.py projects/effective_boolean_filter/tests/test_scoring_and_report.py -q
```

Result:

```text
16 passed
```

Full collection found 290 tests. The narrower run validates the core deterministic behavior we are using for the first Strange Company integration.

Latest evolution checks:

```text
python -m pytest projects/effective_boolean_filter/tests -q
290 passed

POST /evaluate_argument with Origin: null
status=200, Access-Control-Allow-Origin=null
```
