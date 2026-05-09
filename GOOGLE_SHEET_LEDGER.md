# Google Sheet Ledger

Create one Google Sheet for the manual paid pilot. This Sheet is the source of truth for Strange Works Studio operations; the public site is only an intake packet builder.

## Tabs

Create these tabs:

- `Requests`
- `Invoices`
- `Customers`
- `Delivery`
- `Incidents`

## Required Columns

Use this header row on `Requests` and `Invoices`:

```text
created_at,source,invoice_id,customer,contact,service,amount,status,stripe_invoice_url,delivery_due,notes
```

Use the same core columns on `Customers`, `Delivery`, and `Incidents` when possible, then add tab-specific fields such as `incident_id`, `severity`, `paid_at`, `delivered_at`, or `receipt_hash`.

## Public Intake Rule

Use a Google Form linked to this Sheet for the first public intake route. The public site should open the form and provide a copyable request packet; it should not guess Google Forms `entry.*` field IDs or auto-submit customer data.

## Internal Apps Script Option

`tools/google_apps_script_order_intake.gs` is an internal/sandbox template for appending sanitized requests to the `Requests` tab. Deploy it only after deciding who can access the web app and how the operator will monitor abuse or spam.

Official guide: <https://developers.google.com/apps-script/guides/web>.

Recommended deployment posture:

- Execute as the operator account only if the Sheet is owned by that account.
- Choose the narrowest access level that still supports the intended private workflow.
- Keep public intake on Google Forms until a proper backend or proxy exists.

## Stripe Reconciliation

After creating a Stripe Hosted Invoice:

1. Copy the hosted invoice URL.
2. Paste it into the private Operations order.
3. Paste it into the Sheet row.
4. Mark the order `Sent`.
5. After payment settles, mark it `Paid`.
6. After delivery, mark it `Delivered`.
