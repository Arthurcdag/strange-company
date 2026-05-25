# Support Inbox Evidence

Status: pilot support inbox verified for the Brazil-first prototype.

## Current Route

- Support/privacy inbox: `tuiidagnese+strangeworks@gmail.com`
- Gmail label: `Strange Works Studio/Support`
- Purpose: receive support, privacy, cancellation/refund, delivery, and incident messages while the dedicated domain inbox is not available.
- Monitoring owner: authenticated Gmail operator.

## Verification

On 2026-05-21, a test email was sent from the authenticated Gmail account to `tuiidagnese+strangeworks@gmail.com`.

Evidence:

- Gmail message id: `19e4c73fcdbf42a2`
- Subject: `Strange Works Studio support inbox verification - 2026-05-21`
- Labels observed: `INBOX`, `SENT`, `UNREAD`, `Strange Works Studio/Support`
- Display URL: `https://mail.google.com/mail/#all/19e4c73fcdbf42a2`

The message contained no customer data, payment data, credentials, sensitive personal data, or regulated source documents.

## Gmail Label

The Gmail label `Strange Works Studio/Support` exists and was applied to the verification email.

The available Gmail connector did not expose filter creation. For automatic future labeling, create this Gmail filter by hand:

```text
To: tuiidagnese+strangeworks@gmail.com
Apply label: Strange Works Studio/Support
Never send it to Spam
```

This manual filter is useful but not required for receiving mail: messages to the alias already land in the authenticated Gmail inbox.

## Domain Note

The planned address `ops@strangeworks.studio` is not currently usable because `strangeworks.studio` did not resolve in DNS during setup. Do not switch back to that address until the domain, MX records, mailbox, SPF/DKIM/DMARC posture, and receiving test are verified.

## Stop Rules

- Keep `liveMode: false` while Google Form, terms review, privacy review, Brazil compliance review, AI handoff review, entity/CNPJ, tax/NFS-e, payment, and ledger gates remain open.
- If the Gmail alias stops receiving messages or is no longer monitored daily, set `supportInboxVerified: false` immediately.
- Do not process regulated, health, payment-card, credential, private-key, child, or sensitive personal data through this pilot inbox without a reviewed route.
