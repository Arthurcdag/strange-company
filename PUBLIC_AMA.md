# Public AMA

Status: public-safe question intake. This is not a paid order desk, legal advice desk, tax/accounting advice desk, customer support queue, refund route, payment route, or launch approval path.

The public AMA can be opened online while `public-config.js` keeps `liveMode: false` because it does not collect payment, create orders, or accept private evidence.

## Allowed Questions

Use the AMA for:

- questions about what Strange Works Studio is building,
- questions about why Strange Company remains sealed,
- public questions about the launch gates,
- public questions about the Brazil-first operating boundary,
- non-sensitive questions about the compliance proof sprint concept.

## Stop Rules

Reject or redact the question if it contains:

- payment card data,
- credentials, API keys, tokens, private keys, passwords, or passcodes,
- CPF, CNPJ documents, tax portal screenshots, bank data, provider dashboard data, or private invoices,
- customer records, health data, regulated source documents, legal evidence, or private business documents,
- refund, cancellation, legal, tax, accounting, payment, privacy, or launch-approval requests.

## Public Page Behavior

The public page creates an AMA packet and can open an email draft to the verified support inbox when the support route is verified.

The AMA path must not:

- call `fetch`,
- write to local storage,
- submit to Apps Script,
- flip `liveMode`,
- reveal private Operations, Treasury, Decisions, revenue-start, or setup-evidence panels,
- create an invoice request unless the separate paid order gate is live-ready.

## Operator Handling

For each safe question:

1. Review the packet subject and body before sending or publishing.
2. Copy only a redacted, non-secret record into `PUBLIC_AMA_QUEUE.local.json`.
3. Answer only the public-safe part.
4. Keep operational evidence, customer data, private reviewer notes, and sealed-company details out of the public answer.
5. Route legal, tax, accounting, privacy, payment, refund, or launch approval questions to the human review workflow instead of answering them as AMA.

## Local Queue Validation

Use `PUBLIC_AMA_QUEUE.template.json`, `tools/draft_public_ama_queue.js`, and `tools/validate_public_ama_queue.js` to keep the AMA queue operational without committing private evidence.

Create the local queue:

```bash
node tools/draft_public_ama_queue.js --write-local
```

After the first screened public-safe question:

```bash
node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-one
```

Before publishing any answer:

```bash
node tools/validate_public_ama_queue.js PUBLIC_AMA_QUEUE.local.json --require-answer-ready
```

To include the AMA queue in the VAU company-evolution model:

```bash
python tools/vau_company_evolution.py --public-ama-queue PUBLIC_AMA_QUEUE.local.json --depth 1
```

The local queue should use aliases, question summaries, public-safe question text, support-thread references, and non-secret evidence IDs. It must not include direct email addresses, CPF, CNPJ documents, credentials, payment data, private evidence, or customer records.

The paid order desk remains governed by `HUMAN_REVIEW_PACKET.md`, `HUMAN_REVENUE_INSTRUCTIONS.md`, `REVENUE_SETUP_EVIDENCE_PACKET.md`, and `EXTERNAL_LIVE_PACKET.template.json`.
