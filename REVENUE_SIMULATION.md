# Revenue Simulation

`tools/simulate_revenue_scenarios.js` runs simulated customer scenarios for the Strange Works Studio satellite revenue lane. It exists so the operator can show how the first service (Compliance proof sprint) and the second service (Compliance template pack) would generate value once the real gates close, without changing `public-config.js` or pretending any human-review gate has closed.

This document covers the simulator only. The real revenue runbook is `HUMAN_REVENUE_INSTRUCTIONS.md`. The real evidence handoff is `REVENUE_SETUP_EVIDENCE_PACKET.md`. The real outreach scripts are `REVENUE_SETUP_OUTREACH_PACKET.md`. The real evidence index template is `REVENUE_SETUP_EVIDENCE_INDEX.template.json`.

## What The Simulator Does

For each of two services, the simulator runs four mock customer scenarios:

- `S1A`-`S1D` for the Compliance proof sprint (R$750).
- `S2A`-`S2D` for the Compliance template pack (R$79).

Each scenario walks through the receipt-chain stages used by the Operations dashboard:

```text
Draft -> Sent -> Paid -> Delivered (-> Refund if applicable)
```

For each stage the simulator records the day offset and a non-secret note describing what would have happened. The simulator computes gross, provider fee, and net per scenario, then summarizes per service and across the two services.

Every scenario record is flagged `simulated: true`. Every output is clearly labeled as simulation. No record is treated as real evidence.

## Assumptions

- Provider fee assumption: 4.99% + R$0.39 per transaction. This is a placeholder for Stripe Brazil hosted invoice card fees. The real rate must come from the reviewed payment provider dashboard and the accountant.
- Refund scenarios assume a 50% partial refund under `TERMOS.md`.
- All scenarios assume external customers only. Related-party revenue is not counted.
- Service prices match `public-config.js` at the time of writing (R$750 and R$79). If those prices change, update `SERVICES` in `tools/simulate_revenue_scenarios.js`.

## Usage

Run the simulator with no flags to print the summary to stdout:

```bash
node tools/simulate_revenue_scenarios.js
```

Write a full markdown report to `REVENUE_SIMULATION_REPORT.md`:

```bash
node tools/simulate_revenue_scenarios.js --write-report
```

Write a simulated evidence index to `REVENUE_SETUP_EVIDENCE_INDEX.simulation.json`:

```bash
node tools/simulate_revenue_scenarios.js --write-evidence
```

Both flags can be combined.

## Output Files

Both files are gitignored. They are generated on demand and must not be committed.

- `REVENUE_SIMULATION_REPORT.md` - human-readable per-scenario and per-service summary.
- `REVENUE_SETUP_EVIDENCE_INDEX.simulation.json` - mirrors `REVENUE_SETUP_EVIDENCE_INDEX.template.json` with `mode: "simulation"` and placeholder `sim-*` values for every field. Distinct from `template` and `local` modes by design.

## What The Simulator Does Not Do

The simulator must not be used to close any real gate or to claim revenue was earned. In particular it does not:

- modify `public-config.js`, `liveMode`, support email, Google Form URL, or any review-date field,
- alter the Operations dashboard hosted-invoice URL allowlist (`https://invoice.stripe.com/`),
- generate or modify `REVENUE_SETUP_EVIDENCE_INDEX.local.json` or `EXTERNAL_LIVE_PACKET.local.json`,
- mark any human-review gate verified,
- count simulated revenue as market proof or as evidence of compliance,
- collect, store, or transmit any real customer data, payment data, or credentials,
- approve legal, tax, accounting, privacy, payment, refund, or consumer decisions.

If any of these are needed, follow `HUMAN_REVENUE_INSTRUCTIONS.md` and close the real gates with real human evidence.

## Where Simulation Stops And Real Evidence Begins

Use the simulator to demonstrate the satellite revenue model and to rehearse the receipt-chain flow before the first paid customer. Stop using simulator output the moment a real customer interaction begins. For real customers:

- Fill `REVENUE_SETUP_EVIDENCE_INDEX.local.json` with real evidence references (the `.local.json` file is gitignored).
- Run `node tools/check_external_live_packet_gate.js`, `node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live`, `node tools/preflight_public_launch.js`, `node tools/audit_company_functionality.js --require-live`, and `node tools/survival_check.js`.
- Only then patch `public-config.js` review dates and `liveMode`.

## Tests

`tests/test_revenue_simulation.py` validates the simulator from the existing unittest suite:

- the script is executable with Node and exits cleanly,
- both output flags produce parseable files,
- every scenario record is flagged `simulated: true`,
- the simulated evidence index keeps `mode: "simulation"`, keeps `liveMode: false`, and does not leak into the template,
- per-service and totals math is consistent with the per-scenario math.
