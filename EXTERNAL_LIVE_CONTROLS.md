# External Live Controls

This is the developer/operator handoff for creating the outside routes that must exist before Strange Works Studio can move from packet-only mode to live intake.

The developer can prepare the repo and verify URLs. The operator or account owner must create and approve the support inbox, Google Form, Stripe account, bank route, terms review, and privacy review. Do not store private keys, bank numbers, tax documents, customer secrets, or payment credentials in this repo.

## Output Values

Collect these values before editing `public-config.js`:

| Value | Public config field | Public? | Evidence location |
| --- | --- | --- | --- |
| Monitored support inbox | `supportEmail` | yes | private Operations setup evidence |
| Google Form public URL | `googleFormUrl` | yes | private Operations setup evidence |
| Support inbox test passed | `supportInboxVerified` | yes | private Operations setup evidence |
| Google Form test row reached Sheet | `googleFormVerified` | yes | private Operations setup evidence |
| Terms reviewed date | `termsReviewedAt` | yes | commit plus private review note |
| Privacy reviewed date | `privacyReviewedAt` | yes | commit plus private review note |
| Stripe dashboard URL | none | no | private Operations integration config |
| Stripe test hosted invoice URL | none | no | private Operations setup evidence |
| Business bank verified | none | no | private Operations setup evidence only |

Use ISO dates: `YYYY-MM-DD`. The terms and privacy dates are the actual human review dates, not the commit date unless the review happened that day.

## Readiness Packet

Copy the template and fill it locally after the outside accounts are created:

```bash
copy EXTERNAL_LIVE_PACKET.template.json EXTERNAL_LIVE_PACKET.local.json
```

Or generate a draft from the current public config:

```bash
node tools/draft_external_live_packet.js --write-local
```

Keep `EXTERNAL_LIVE_PACKET.local.json` out of git. It is ignored on purpose because it can identify private operator accounts, dashboards, bank-route metadata, and test invoice evidence.

The draft generator copies only public-safe values from `public-config.js`. It leaves private evidence fields blank and must still fail `--require-live` until the operator fills real support, Google, legal/privacy, Stripe, bank, and attestation evidence.

Validate the blank template:

```bash
node tools/validate_external_live_packet.js --template-ok
```

Validate the completed local packet before changing `public-config.js`:

```bash
node tools/validate_external_live_packet.js EXTERNAL_LIVE_PACKET.local.json --require-live
```

Only use the resulting public values in `public-config.js`; keep Stripe dashboard URLs, Sheet URLs, bank last4, and operator names in the private Operations evidence lane.

## Launch Gate Evidence Panel

The private Launch Gate view reads `public-config.js` and shows an **External live evidence** panel. Use **Copy live evidence packet** to capture the current public config snapshot, the missing evidence rows, and the exact validation commands before editing `public-config.js`.

The panel is a handoff aid only. It does not verify Google, Stripe, bank, support, legal, tax, privacy, fiscal, or AI-review evidence by itself, and it must not be used as approval to set `liveMode: true`.

For a terminal-only handoff, generate the same gap packet from `public-config.js`:

```bash
node tools/generate_external_live_gap_packet.js
node tools/generate_external_live_gap_packet.js --json
```

## 1. Support Inbox

Target address: `ops@strangeworks.studio` or a documented replacement.

Acceptable Google Workspace setups:

- shared mailbox with delegated users,
- Google Group configured as a Collaborative Inbox,
- one monitored user inbox with `ops@...` as an alias for the first pilot only.

Minimum checks:

- [ ] A human owner can sign in or has delegate access.
- [ ] At least two authorized operators know how support is monitored, unless the pilot is intentionally single-operator.
- [ ] A test email from outside the domain arrives.
- [ ] A reply can be sent from the support address.
- [ ] The support address is the same address that will appear in `public-config.js`.
- [ ] No personal-only mailbox is treated as the permanent customer support system.

Evidence to record privately:

```text
support_email:
owner:
monitoring_cadence:
test_received_at:
test_replied_at:
fallback_contact:
```

## 2. Google Sheet Ledger

Create one Google Sheet named:

```text
Strange Works Studio - Live Intake Ledger
```

Create these tabs:

- `Requests`
- `Invoices`
- `Customers`
- `Delivery`
- `Incidents`
- `Leads`

Use this header on `Requests` and `Invoices`:

```text
created_at,source,invoice_id,customer,contact,service,amount,status,stripe_invoice_url,delivery_due,notes
```

Use this header on `Leads`:

```text
created_at,lead_id,customer,contact,service,amount,source,stage,qualification_note,order_id,notes
```

The Sheet URL is private operator evidence. Do not put the Sheet URL in `public-config.js`.

## 3. Google Form Intake

Create one Google Form named:

```text
Strange Works Studio - Invoice Request
```

Form description:

```text
Use this form to request manual review for a Strange Works Studio compliance proof packet. Do not submit protected health information, payment card data, passwords, private keys, credentials, tax IDs, bank data, or regulated source documents. This form does not create an automatic payment or guarantee acceptance.
```

Questions:

| Question | Type | Required | Notes |
| --- | --- | --- | --- |
| Customer or company name | Short answer | yes | no individual patient/client records |
| Contact email | Short answer | yes | enable email validation when available |
| Requested service | Dropdown | yes | `Compliance proof sprint - 750 USD/mo`; `Compliance template pack - 79 USD/mo` |
| Requested monthly amount | Short answer | yes | default public amounts only unless operator approved |
| What do you need? | Paragraph | yes | instruct customer to summarize without sensitive data |
| Safety confirmation | Checkboxes | yes | require every safety checkbox below |
| Manual invoice acknowledgement | Checkbox | yes | customer confirms manual review/invoice-only flow |

Safety confirmation checkbox text:

```text
I did not include protected health information.
I did not include payment card data.
I did not include passwords, API keys, private keys, or credentials.
I did not include bank account data, tax IDs, or regulated source documents.
I understand the operator may reject unsafe submissions.
```

Manual invoice acknowledgement text:

```text
I understand this creates a manual invoice request only. Payment happens only after Strange Works Studio qualifies the request and sends a Stripe Hosted Invoice.
```

Response setup:

- [ ] Open the Form `Responses` tab.
- [ ] Link responses to the live intake ledger Sheet.
- [ ] Submit one safe test response.
- [ ] Confirm the response lands in the Sheet.
- [ ] Copy the public Form URL that starts with `https://docs.google.com/forms/`.
- [ ] Paste only that Form URL into `public-config.js`.

Do not depend on Google Forms `entry.*` IDs in the public site. The public page should open the form and provide a copyable packet; it should not auto-submit customer data.

## 4. Terms And Privacy Review Dates

Review these files against the real offer and intake path:

- `TERMS.md`
- `PRIVACY.md`
- `SUPPORT.md`
- `RUN_LIVE_PILOT.md`

Minimum review questions:

- [ ] Does the offer match the services in `public-config.js`?
- [ ] Does the support route match the actual support inbox?
- [ ] Does the privacy notice match Google Form, Google Sheet, support inbox, and Stripe invoice handling?
- [ ] Does the terms copy explain manual review and invoice-only payment?
- [ ] Are restricted data categories rejected clearly?
- [ ] Is the incident/support route clear?

If the documents change, commit those edits before setting review dates. Set:

```js
termsReviewedAt: "YYYY-MM-DD",
privacyReviewedAt: "YYYY-MM-DD",
```

Only use the real review date.

## 5. Stripe Route

Use Stripe Hosted Invoices only. The public static site must not hold Stripe API keys and must not collect card data.

Minimum checks:

- [ ] Stripe account is active for the operating entity.
- [ ] Business profile and public support email are set.
- [ ] Payout route points to the business bank account.
- [ ] Hosted Invoice Page is enabled for invoices.
- [ ] A manual test invoice can be created from the Stripe Dashboard.
- [ ] The hosted invoice URL starts with `https://invoice.stripe.com/`.
- [ ] The invoice URL is pasted into the private Operations order and the Sheet ledger, not into public config.
- [ ] The operator can reconcile Stripe invoice status back to the Sheet.

Evidence to record privately:

```text
stripe_dashboard_url:
test_invoice_id:
test_hosted_invoice_url:
payout_route_verified_by:
reconciliation_owner:
weekly_reconciliation_day:
```

## 6. Bank Route

Use a business bank account in the operating entity name. Do not use a personal bank account as the live operating route.

Minimum checks:

- [ ] Operating entity is formed or approved.
- [ ] Responsible human party is identified for tax, bank, Stripe, support, and customer communications.
- [ ] EIN or required tax identity exists if needed for the account.
- [ ] Bank account is open in the operating entity name.
- [ ] Stripe payouts can route to that account.
- [ ] Weekly reconciliation owner is assigned.
- [ ] No account numbers, routing numbers, statements, or bank credentials are committed to the repo.

Evidence to record privately:

```text
entity_name:
responsible_party:
bank_name:
bank_account_last4:
stripe_payout_test_status:
reconciliation_owner:
```

## 7. Public Config Patch

Only after all checks above are real:

```js
window.PUBLIC_ORDER_CONFIG = {
  operatorName: "Strange Works Studio",
  supportEmail: "ops@strangeworks.studio",
  googleFormUrl: "https://docs.google.com/forms/...",
  supportInboxVerified: true,
  googleFormVerified: true,
  termsReviewedAt: "YYYY-MM-DD",
  privacyReviewedAt: "YYYY-MM-DD",
  liveMode: true,
  services: [
    {
      id: "proof-sprint",
      title: "Compliance proof sprint",
      detail: "Evidence map, checklist cleanup, monthly proof packet, exception notes, and exportable receipt.",
      price: 750
    },
    {
      id: "template-pack",
      title: "Compliance template pack",
      detail: "Checklist templates and renewal worksheets for teams not ready for a managed sprint.",
      price: 79
    }
  ]
};
```

Run:

```bash
node tools/preflight_public_launch.js
node tools/audit_company_functionality.js --require-live
```

Both must pass before publishing the live config.

## 8. Live Smoke Test

After the Pages deploy:

- [ ] Open `https://arthurcdag.github.io/strange-company/`.
- [ ] Confirm the readiness banner says `Live intake configured`.
- [ ] Submit one safe test request through the public flow.
- [ ] Confirm the request reaches the support inbox or Google Form response Sheet.
- [ ] Create one manual Stripe Hosted Invoice.
- [ ] Paste the invoice URL into private Operations and the Sheet.
- [ ] Move the private order through `Draft`, `Sent`, `Paid`, and `Delivered`.
- [ ] Seal the receipt chain.

## Official References

- Google Forms response destination: <https://support.google.com/docs/answer/2917686>
- Google Forms editing fields: <https://support.google.com/docs/answer/2839737>
- Google Workspace shared inbox: <https://support.google.com/a/answer/16343077>
- Google Groups Collaborative Inbox: <https://support.google.com/a/users/answer/167430>
- Stripe Hosted Invoice Page: <https://docs.stripe.com/billing/invoices/hosted>
- Stripe Dashboard invoices: <https://docs.stripe.com/invoicing/dashboard>
- SBA business bank account guide: <https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account>
