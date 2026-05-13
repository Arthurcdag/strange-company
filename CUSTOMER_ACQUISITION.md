# Customer Acquisition

The Operations console tracks operator-led customer acquisition work for the satellite company. It is not automated outreach, mailing list software, marketing automation, or autonomous lead generation. The operator does the outreach; this panel keeps the receipts.

## Daily Outreach Target

The operator sets a `dailyOutreachTarget` (default `5`). The panel surfaces today's logged attempts versus the target. A target of `0` disables the gauge.

The target is operator-asserted intent, not a quota; missing the target does not block any other gate.

## Outreach Log

Each log entry stores:

- `id` — internal identifier.
- `at` — ISO timestamp.
- `source` — one of `referral`, `email`, `form`, `direct`, `partner`. Any other value is rejected.
- `attempts` — positive whole number. Capped at 999 per entry.
- `note` — short free-form note. The note is scanned with `findSensitiveData` and rejected on findings.

The log keeps the most recent 90 entries.

## Lead Source Categorization

The Sales Lead form on Operations now includes a `Source category` select with the same five values (`referral`, `email`, `form`, `direct`, `partner`) plus an `unspecified` default. Existing leads that predate this field stay `unspecified` and are surfaced as their own bucket in the panel.

This is in addition to the existing free-form `Source detail` text field, which captures the specific person, list, or campaign.

## Conversion Counts

The panel reports counts for every sales lead stage:

- `prospect`,
- `qualified`,
- `invoice-ready`,
- `invoice-sent`,
- `paid`,
- `delivered`,
- `rejected`.

Counts are derived from `salesLeads` live; they update whenever a lead is created, advanced, rejected, or converted to an Operations order.

## Outreach Packet

The `Copy outreach packet` button copies a plain-text summary suitable for pasting into a daily journal or operator note. The packet contains:

- the daily target and today's logged attempts,
- the 7-day attempt count,
- the conversion counts,
- the per-source lead counts,
- a boundary reminder.

The packet contains no customer-private data because the inputs are aggregate counts and operator-defined targets.

## Boundary

- The Customer Acquisition panel does not send email, queue messages, or contact anyone. It records that the operator did.
- Notes must not contain PHI, payment data, credentials, SSNs, private keys, or API keys. Rejected entries return an inline error.
- Public files (`public.html`, `public.js`, `public-config.js`) never reference outreach state, log entries, the storage key, or the lead source categories beyond what is required by the public order desk surface. The preflight script enforces this.

## Receipt Chain

A single `Acquisition` receipt summarizes the panel state on every chain build, with the daily target, today's attempts, the 7-day attempt total, total leads, conversion counts, and per-source counts. Sealing the chain after a daily log entry preserves the operator's outreach claim alongside the rest of the operating loop.

## Storage

Customer acquisition state lives in `localStorage` under `strange-company-customer-acquisition`. `Reset acquisition log` (Operations view header button) restores the default target and clears the log.
