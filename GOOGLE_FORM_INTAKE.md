# Google Form Intake

Status date: 2026-05-21

The Google Sheet control workbook and operational ledger have been created in Drive. The live Google Form is still pending because the available Google connector can create and edit Docs, Sheets, and Slides, but it cannot create or configure Google Forms.

The repo includes `tools/google_apps_script_create_intake_form.gs`, an Apps Script builder that creates the Form, links it to the existing Sheet, and writes the published/edit URLs back into the Sheet for private evidence.

Do not commit the private Sheet URL or Form edit URL to the public repo. Store those URLs in the private operator record and in the local Setup Evidence panel.

## Created Sheet Tabs

The Drive workbook contains:

- `Form Spec`
- `Responses`
- `Ops Review`
- `Verification`
- `Repo Config`
- `Requests`
- `Invoices`
- `Customers`
- `Delivery`
- `Incidents`
- `Leads`

The operational ledger tabs use the documented headers from `GOOGLE_SHEET_LEDGER.md`. The `Form Spec` tab contains the public intake questions, field types, required flags, options, and handling notes.

## Apps Script Build

Use this path before building the form manually:

1. Open `https://script.google.com`.
2. Create a new Apps Script project in the same Google account that owns the Sheet.
3. Paste `tools/google_apps_script_create_intake_form.gs`.
4. Set `CONFIG.spreadsheetId` to the private Sheet ID.
5. Run `createStrangeWorksIntakeForm`.
6. Approve the Google permissions for Forms and Sheets.
7. Copy the published responder URL from the script logs or `Repo Config` tab.
8. Submit one safe public test response and confirm it lands in the response Sheet.

If Apps Script is blocked by account policy or permissions, fall back to the manual build below.

## Manual Form Build

Create a blank Google Form with:

- Title: `Strange Works Studio Intake`
- Description: ask for an operational evaluation, warn users not to send passwords, tokens, CPF, card data, financial secrets, health data, or confidential files, and say that submissions are used for contact, triage, and proposal preparation.
- Confirmation message: `Recebemos seu pedido. Vamos revisar e responder pelo email informado. Nao envie senhas, tokens, CPF, cartao ou dados confidenciais por email sem combinarmos uma rota segura.`

Use the `Form Spec` tab as the source of truth for questions. At minimum, the form must collect:

- LGPD consent checkbox.
- Contact name.
- Work email with email validation.
- Company, studio, or project.
- Country/state/city hint, optional.
- Requested service.
- Likely package.
- Urgency.
- Budget range, optional.
- Public site/app/repository links, optional.
- Current tools, optional.
- First problem to solve.
- Measurable desired outcome.
- Sensitive-data flag.
- NDA/DPA or contract need, optional.
- Billing type, optional, without collecting CPF/CNPJ in the public form.
- Preferred reply channel.
- Availability, optional.
- Terms/privacy acknowledgement.
- Human/test submission confirmation.
- Final notes, optional, with a no-secrets reminder.

## Required Settings

- Link form responses to the existing Drive workbook.
- Keep response collection private to the operator account.
- Do not require Google sign-in unless the operator deliberately chooses that friction.
- Do not expose the response Sheet publicly.
- Do not collect file uploads in the public intake form.
- Do not collect payment details, passwords, tokens, private keys, CPF, or card data.

## Verification Gate

Before changing `public-config.js`:

1. Submit one safe test response through the public responder URL.
2. Confirm the response lands in the `Responses` tab.
3. Confirm the submission contains no sensitive data.
4. Copy the public responder URL, not the edit URL.
5. Record the Sheet/Form evidence in private Setup Evidence.

Only after those steps:

```js
googleFormUrl: "https://docs.google.com/forms/..."
googleFormVerified: true
```

Keep `liveMode: false` until support, Form, legal review, Brazil compliance review, AI handoff review, payment, fiscal/NFS-e, and entity/bank routes are all real.

## AI Boundary

AI can prepare the Sheet, field list, copy, checklist, and repo gates. AI must not mark the Google Form verified until a real Form exists and a test response lands in the linked Sheet. Do not set googleFormVerified true until that evidence exists.
