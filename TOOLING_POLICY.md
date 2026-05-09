# Tooling Policy

This repository can use external research and market-data tools, but Operational V1.1 keeps them out of the live-money path.

## Market Data

Alpaca and Binance are read-only observability tools.

Allowed:

- inspect market snapshots,
- compare treasury-risk assumptions,
- document market context for later review.

Not allowed in V1:

- automated trading,
- treasury allocation from market signals,
- custody of customer funds,
- speculative reinvestment rules.

Any future treasury investment feature needs legal, accounting, tax, security, and operator review before implementation.

## Zotero

Zotero is for citation management and evidence libraries once the local Zotero API is enabled.

It is not a customer-data store and must not receive customer order packets, support messages, PHI, credentials, or payment data.

## Life Science Research

Life Science Research tools may support public evidence research for clinic workflows, compliance vocabulary, and product discovery.

They must not process customer PHI, regulated source documents, private credentials, or non-public customer records.

## GitHub

GitHub is the code and deployment workflow. Public GitHub Pages must serve the public Order Desk and docs only; the private command center is for local/private operation.
