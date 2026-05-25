# Setup Evidence

The Operations console tracks operator-verified proof of external setup for the satellite company (Strange Works Studio). The repo cannot certify that a Brazilian entity exists, that a CNPJ is valid, that a tax regime is correct, that NFS-e is enabled, that a bank/payment route is active, or that LGPD review is complete. Only the responsible operator can confirm those things from real artifacts outside this prototype.

The Setup Evidence panel is the place where the operator records that confirmation.

## Slots

The panel exposes Brazil-first slots. Each maps to one external prerequisite for taking real customer money:

- `entity` - Brazilian operating entity or approved operating structure.
- `tax-regime` - accountant-reviewed tax regime, CNAE, and municipal setup path.
- `nfse` - NFS-e or legally reviewed fiscal receipt route.
- `bank` - business bank or payment account in the operator's name.
- `payment` - payment processor/manual invoice route with payouts and refunds understood.
- `support-inbox` - real monitored support inbox.
- `lgpd-contact` - LGPD contact, privacy request contact, or encarregado path.
- `google-sheet` - Google Sheet ledger with the required tabs.
- `google-form` - public Google Form intake.
- `terms-review` - customer-facing terms reviewed before the first invoice.
- `privacy-review` - privacy notice reviewed before any customer data is collected.

## Fields

Each evidence row stores:

- `id` - slot identifier.
- `label` - human-readable name.
- `status` - one of `missing`, `pending`, `verified`, `blocked`.
- `evidenceUrl` - required `https://` URL pointing at the artifact (redacted CNPJ/entity evidence, accountant note, NFS-e portal evidence, payment dashboard, inbox test, reviewed document, etc.). Non-`https://` URLs are rejected by `safeHttpsUrl`.
- `verifiedAt` - timestamp stamped automatically when status transitions to `verified`. Cleared on any other status.
- `operatorNote` - free-form operator description. The note is scanned with `findSensitiveData` and rejected if it contains PHI, payment card data, credentials, private key material, SSNs, or API keys.
- `updatedAt` - last touched.

## Boundary

- Evidence URLs must use `https://`. The handler refuses non-https values.
- The Google Sheet URL and Google Form edit URL belong in the private Setup Evidence/operator record, not in public repo docs. Public config receives only the public Form responder URL after test verification.
- Operator notes must not contain sensitive data. The handler rejects with a per-row error if `findSensitiveData` returns findings.
- The Setup Evidence panel never claims that the entity, tax regime, NFS-e, bank, payment, support, or privacy routes are active by itself. It surfaces the operator's own assertion. If the assertion is wrong, the assertion is wrong; this prototype cannot detect that.
- Public files (`public.html`, `public.js`, `public-config.js`) never reference the Setup Evidence panel, its storage key, or its slot internals. The preflight script enforces this.

## Profit Readiness Gate

`buildProfitReadiness` reads Setup Evidence in addition to the launch checklist and integration controls:

- `externalSetupVerified` is true only when every Setup Evidence row has status `verified`.
- `externalSetupReady` requires both `externalSetupVerified` AND the existing launch and critical-control checklist to be clear.
- The blocker list names each unverified slot by label (`unverified evidence: NFS-e or fiscal receipt route`, etc.) so the operator sees exactly which artifact is missing.

`Sell today`, `Invoice ready`, and `Profit proving` states cannot fire until every critical evidence row is verified, every critical control is closed, and the launch checklist is clear. UI checkboxes alone never declare the company sell-ready.

## Receipt Chain

Each evidence row contributes a `Setup Evidence` receipt with the slot id, label, current status, `evidenceUrl`, `verifiedAt`, and a `hasNote` boolean. Sealing the chain after a verification preserves the proof that the gate was satisfied.

Receipts cannot replace real outside-the-repo evidence. The receipt chain is local tamper-evidence on what the operator entered; it is not CNPJ formation, tax registration, NFS-e issuance, bank ledgers, payment-provider history, LGPD review, or legal/accounting advice.

## Storage

Setup evidence lives in `localStorage` under `strange-company-setup-evidence`. `Reset setup evidence` (Operations view header button) restores every slot to `missing` and clears URLs, notes, and timestamps.
