# Google Sheet Ledger

Create one Google Sheet for the manual paid pilot. This Sheet is the source of truth for Strange Works Studio operations; the public site is only an intake packet builder.

## Current External Artifact

As of 2026-05-21, the Drive workbook has been created for the operator account. It includes both the Google Form control tabs and the operational ledger tabs. Keep the raw Sheet URL in the private operator record and Setup Evidence; do not commit private ledger URLs to this public repo.

Control tabs:

- `Form Spec`
- `Responses`
- `Ops Review`
- `Verification`
- `Repo Config`

`tools/google_apps_script_create_intake_form.gs` can create the Google Form from code and link it to this workbook. Use it before doing the slower manual Google Forms build.

## Tabs

Create these tabs:

- `Requests`
- `Invoices`
- `Customers`
- `Delivery`
- `Incidents`
- `Leads` (optional private paid-pilot pipeline)

## Required Columns

Use this header row on `Requests` and `Invoices`:

```text
created_at,source,invoice_id,customer,contact,service,amount,status,stripe_invoice_url,delivery_due,notes
```

Use the same core columns on `Customers`, `Delivery`, and `Incidents` when possible, then add tab-specific fields such as `incident_id`, `severity`, `paid_at`, `delivered_at`, or `receipt_hash`.

Use this header row on the optional `Leads` tab:

```text
created_at,lead_id,customer,contact,service,amount,source,stage,qualification_note,order_id,notes
```

`Leads` mirrors the private sales pipeline only. It is not public intake, not a payment record, and not proof of market demand until an external customer pays through the reviewed payment route and the fiscal/NFS-e path can be reconciled.

## Public Intake Rule

Use a Google Form linked to this Sheet for the first public intake route. The public site should open the form and provide a copyable request packet; it should not guess Google Forms `entry.*` field IDs or auto-submit customer data.

## Internal Apps Script Option

`tools/google_apps_script_order_intake.gs` is an internal/sandbox template for appending sanitized requests to the `Requests` tab. Deploy it only after deciding who can access the web app and how the operator will monitor abuse or spam.

Official guide: <https://developers.google.com/apps-script/guides/web>.

Recommended deployment posture:

- Execute as the operator account only if the Sheet is owned by that account.
- Choose the narrowest access level that still supports the intended private workflow.
- Keep public intake on Google Forms until a proper backend or proxy exists.

## Payment And Fiscal Reconciliation

After creating a manual payment request or hosted invoice:

1. Copy the hosted payment/invoice URL.
2. Paste it into the private Operations order.
3. Paste it into the Sheet row.
4. Confirm the NFS-e or reviewed fiscal receipt step required for the transaction.
5. Mark the order `Sent`.
6. After payment settles and fiscal evidence is reconciled, mark it `Paid`.
7. After delivery, mark it `Delivered`.

## Private Ledger Bridge

The private Operations console now has a Sheet ledger bridge so the operator does not have to retype rows in two places.

### Inputs

The bridge accepts tab-separated rows copied from the Sheet `Requests` or `Invoices` tab. The header line is optional; if it is included it must match the column order in this doc exactly. Each data row must contain all eleven columns, in this order:

```text
created_at	source	invoice_id	customer	contact	service	amount	status	stripe_invoice_url	delivery_due	notes
```

### Validation Rules

A row is rejected, and the rest of the paste is still processed, if any of the following is true:

- `invoice_id` is blank (the bridge needs a key).
- `customer` is blank.
- `amount` is blank, non-numeric, zero, or negative.
- `status` is anything other than `Draft`, `Sent`, `Paid`, or `Delivered`.
- `contact` is set but is not a plausible email address.
- `stripe_invoice_url` is set but does not start with `https://invoice.stripe.com/`. This column name remains for prototype compatibility; the Brazil launch gate still requires the reviewed payment/fiscal route outside the Sheet.
- `delivery_due` is set but is not `YYYY-MM-DD`.
- `created_at` is set but is not parseable as a date.
- The sensitive-data scan flags PHI, payment card data, secrets, or private keys anywhere in the row.
- The pasted line has extra columns beyond the required eleven-column ledger shape.

Duplicate `invoice_id` values inside one paste are rejected so the operator resolves the conflict in the Sheet before retrying.

### Upsert Rule

Rows are upserted using `invoice_id` against the private order's `invoiceNumber`. For existing orders, an incoming blank value never overwrites a non-empty local value. This lets the operator paste partial rows from the Sheet (for example just a payment URL on a row keyed by invoice id) without erasing the rest.

### Preview Then Apply

The bridge has two buttons:

- `Preview import` parses and validates the paste, shows how many rows will be created, updated, or rejected, and lists the rejected lines with reasons.
- `Apply import` runs the upsert. It is only enabled after a preview shows at least one valid row.

After import, the paste box is cleared so a stale TSV is not applied twice.

### Per-Order And Bulk Export

Each row in the Operations order list now has a `Copy row` button that copies a single TSV row for the operator to paste back into the Sheet's next empty row.

The Operations `Orders` section header has a copy icon that copies the full header plus every order row as TSV, ready to paste into a fresh Sheet tab.

The Operations `Paid pilot pipeline` section has its own copy icon for the optional `Leads` tab. Individual lead cards can also copy a single lead row, a lead qualification packet, or a manual payment/fiscal packet. These are operator handoff tools; they do not submit to Google Sheets or the payment provider.

### Boundaries

- The public Order Desk does not call the bridge; only the private Operations console does.
- The bridge writes only to `localStorage`. It does not call the Sheet API, the Google Form, the Apps Script web app, payment provider, or NFS-e system.
- The bridge never touches `public.html`, `public.js`, or `public-config.js`. The preflight enforces this.
