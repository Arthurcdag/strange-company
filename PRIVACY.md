# Privacy Notice

This is a Brazil-first draft privacy notice for the static prototype and the Strange Works Studio operating loop. It is prepared for LGPD review, but it is not a legal opinion and must be reviewed by the responsible operator and counsel before accepting real payment or customer data.

The customer-facing Portuguese draft is [AVISO_DE_PRIVACIDADE.md](AVISO_DE_PRIVACIDADE.md). If the Brazil-first public desk is used with Brazilian customers, the Portuguese version is the version to review and publish.

## Controller

The live controller must be the Brazilian operating entity named in the reviewed setup evidence.

Do not publish `liveMode: true` until the operator has recorded:

- CNPJ or approved Brazilian operating structure,
- responsible human operator,
- monitored support/privacy inbox,
- LGPD contact or encarregado path,
- reviewed terms and privacy dates.

## Public Static Site

The GitHub Pages public Order Desk is a static site. It builds a request packet in the browser and does not store customer requests in `localStorage`.

The static site does not include a server database and must not collect payment card data, credentials, private keys, protected health information, source documents that require regulated handling, or sensitive personal data.

## Private Command Center

The private/local command center stores local operator state in `localStorage` on the operator's device.

The private Operations tab can store draft customer names, contact emails, service scope, invoice numbers, delivery notes, incident notes, and order status. These records are operational records only; the legal source of truth for taxes, NFS-e, payments, and accounting remains outside this prototype.

## Purposes And Legal Bases

The intended processing purposes are:

- respond to customer requests,
- qualify whether the v0 service can be provided safely,
- prepare manual invoices and delivery packets,
- maintain operational receipts,
- handle support, privacy, refund, dispute, and incident requests,
- keep bookkeeping and tax evidence required by the Brazilian operating route.

Before live use, the operator must map each purpose to an LGPD legal basis and confirm whether consent, contract performance, legal obligation, legitimate interest, or another basis is appropriate for the real offer.

## AI Use

AI may help draft checklists, summarize non-sensitive records, prepare operator packets, and identify missing evidence.

AI must not:

- make the final legal, tax, credit, employment, compliance, refund, cancellation, or eligibility decision by itself,
- process customer secrets or regulated source documents in this prototype,
- replace the controller's duty to respond to data-subject requests,
- certify LGPD compliance.

If a future workflow uses an automated decision that affects a person's interests, the operator must add a human review path and clear explanation process before launch.

## Sharing And Processors

The v0 route may involve GitHub Pages, Google Forms/Sheets, email providers, payment processors, accounting tools, and human reviewers. Before live use, the operator must confirm which vendors are processors or independent controllers, which countries may receive data, and which contracts or transfer safeguards apply.

## Retention

Local browser data remains until the browser clears it or the operator resets the relevant console state.

Real customer records should be retained only under the reviewed bookkeeping, tax, support, incident, and deletion process. Records that are no longer needed should be deleted or anonymized unless Brazilian law requires retention.

## Data-Subject Rights

The reviewed privacy route must support LGPD rights requests, including confirmation of processing, access, correction, anonymization/blocking/deletion where applicable, portability where applicable, information about sharing, information about consent consequences, and revocation of consent where consent is used.

Requests must be handled by a human operator through the monitored support/privacy route.

## Security And Incidents

Security and privacy incidents must be recorded in the Operations incident path, escalated to the responsible human operator, and reviewed against LGPD and ANPD notification requirements before external notice decisions are made.

## Contact

Use the support route published in `SUPPORT.md` once it has been created and verified. Until the inbox and LGPD contact path are verified, live intake must remain disabled.

## Reference Sources

- LGPD: https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2018/Lei/L13709compilado.htm
- ANPD privacy notice structure: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade
- Marco Civil da Internet: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
