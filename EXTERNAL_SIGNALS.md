# External Signals

External Signals are private, read-only evidence packets for the local command center.

They help the operator notice useful context without letting any external tool approve spend, trade assets, touch customer data, or alter the public Order Desk.

## Packet Fields

Each signal packet records:

- `source`
- `observed_at`
- `subject`
- `summary`
- `evidence_reference`
- `operator_note`
- `status`
- `boundary_confirmed`

Allowed statuses:

- `observed`
- `triaged`
- `routed`
- `rejected`

## Source Playbooks

### Alpaca

Use Alpaca only for read-only market observatory snapshots such as asset reference data, market status, or broad price context.

Do not use Alpaca for automated trading, treasury allocation, custody, order execution, or customer-money decisions.

### Binance

Use Binance only for public market-structure context such as open interest, basis, long/short ratios, or volume snapshots.

Do not use Binance for trading, futures positioning, treasury speculation, or automated reinvestment rules.

### Counterparty Finance Claims

Treat claims about trading profit, managed capital, guaranteed monthly returns, offshore investment companies, crypto leverage, customer balances, screenshots, or private investment methods as unverified external signals.

These claims may help define diligence questions, but they must not become Strange Company evidence unless independently verified by the appropriate professional, legal, accounting, tax, and regulatory review lane.

Do not use counterparty finance claims to:

- approve treasury spend,
- justify taking customer capital,
- promise returns,
- market investment performance,
- route money to a trader,
- or describe Strange Company as an investment manager.

### Zotero

Use Zotero for public citation keys, bibliographic metadata, and evidence-library organization once the local API is enabled.

Do not store customer packets, support messages, PHI, credentials, payment data, or private customer records in Zotero.

### Life Science Research

Use Life Science Research tools for public evidence research, clinic workflow vocabulary, public biomedical references, and product-discovery context.

Never send customer PHI, medical records, regulated source documents, credentials, or non-public customer records into these tools.

### GitHub

Use GitHub signals for PR URLs, deploy status, issue state, validation workflow results, and implementation receipts.

GitHub evidence can prove that code changed or deployed. It does not prove commercial readiness, legal readiness, payment readiness, or treasury approval.

## Research Gate Boundary

Signals may be copied into a Research Gate prompt.

The prompt should ask whether the signal is sufficient to draft a research question or next review step. It must not claim that the signal is sufficient to approve spend.

## Outcome Evidence Bridge

Routed, boundary-confirmed signals may be attached to an outcome evidence form in the private Bounties view.

Only signals with `status = routed` and `boundary_confirmed = true` appear in the selector. The selected signal is scanned again before the outcome receipt is emitted.

The outcome stores only signal metadata:

- `sourceSignalId`
- `sourceSignalSource`
- `sourceSignalSubject`
- `sourceSignalReference`

This signal metadata is supporting context. It does not replace the delivery artifact, before/after measurement, next claim, or Research Gate review.

External Signals can inform:

- research questions,
- scope checks,
- market-risk notes,
- product-discovery notes,
- GitHub delivery receipts.

External Signals cannot:

- approve treasury proposals,
- issue execution packets,
- create invoices,
- trade assets,
- store customer data,
- change the public Order Desk.

