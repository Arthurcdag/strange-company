# Setup Evidence

The Operations console tracks operator-verified proof of external setup for the satellite company (Strange Works Studio). The repo cannot certify that an LLC was formed, an EIN was issued, a bank account was opened, or a Stripe account is active. Only the operator can confirm those things from real artifacts outside this prototype.

The Setup Evidence panel is the place where the operator records that confirmation.

## Slots

The panel exposes nine slots. Each maps to one external prerequisite for taking real customer money:

- `llc` — US LLC formation.
- `ein` — Federal EIN issued to the LLC.
- `bank` — Business bank account in the LLC name.
- `stripe` — Stripe account verified for the LLC with payouts and invoicing enabled.
- `support-inbox` — Real monitored support inbox.
- `google-sheet` — Google Sheet ledger with the required tabs.
- `google-form` — Public Google Form intake.
- `terms-review` — Customer-facing terms reviewed before the first invoice.
- `privacy-review` — Privacy notice reviewed before any customer data is collected.

## Fields

Each evidence row stores:

- `id` — slot identifier.
- `label` — human-readable name.
- `status` — one of `missing`, `pending`, `verified`, `blocked`.
- `evidenceUrl` — required `https://` URL pointing at the artifact (formation certificate scan, EIN letter URL, redacted Stripe dashboard screenshot, etc.). Non-`https://` URLs are rejected by `safeHttpsUrl`.
- `verifiedAt` — timestamp stamped automatically when status transitions to `verified`. Cleared on any other status.
- `operatorNote` — free-form operator description. The note is scanned with `findSensitiveData` and rejected if it contains PHI, payment card data, credentials, private key material, SSNs, or API keys.
- `updatedAt` — last touched.

## Boundary

- Evidence URLs must use `https://`. The handler refuses non-https values.
- Operator notes must not contain sensitive data. The handler rejects with a per-row error if `findSensitiveData` returns findings.
- The Setup Evidence panel never claims that the LLC, EIN, bank, or Stripe are "active" by itself. It surfaces the operator's own assertion. If the assertion is wrong, the assertion is wrong; this prototype cannot detect that.
- Public files (`public.html`, `public.js`, `public-config.js`) never reference the Setup Evidence panel, its storage key, or its slot internals. The preflight script enforces this.

## Profit Readiness Gate

`buildProfitReadiness` now reads Setup Evidence in addition to the launch checklist and integration controls:

- `externalSetupVerified` is true only when every Setup Evidence row has status `verified`.
- `externalSetupReady` requires both `externalSetupVerified` AND the existing launch and critical-control checklist to be clear.
- The blocker list names each unverified slot by label (`unverified evidence: Stripe account active`, etc.) so the operator sees exactly which artifact is missing.

`Sell today`, `Invoice ready`, and `Profit proving` states cannot fire until every critical evidence row is verified, every critical control is closed, and the launch checklist is clear. UI checkboxes alone never declare the company sell-ready.

## Receipt Chain

Each evidence row contributes a `Setup Evidence` receipt with the slot id, label, current status, `evidenceUrl`, `verifiedAt`, and a `hasNote` boolean. Sealing the chain after a verification preserves the proof that the gate was satisfied.

Receipts cannot replace real outside-the-repo evidence. The receipt chain is local tamper-evidence on what the operator entered; it is not LLC formation, IRS filings, bank ledgers, or Stripe transaction history.

## Storage

Setup evidence lives in `localStorage` under `strange-company-setup-evidence`. `Reset setup evidence` (Operations view header button) restores every slot to `missing` and clears URLs, notes, and timestamps.
