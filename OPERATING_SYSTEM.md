# Strange Company Operating System

## System Overview

Strange Company operates as five connected layers:

1. **Legal wrapper**: the entity that can sign contracts, own assets, pay taxes, and be sued.
2. **Charter**: the constitutional rules that constrain all action.
3. **Treasury engine**: the allocation system for revenue, reserves, and reinvestment.
4. **Execution market**: contractors, vendors, software agents, and bounties that do work.
5. **Audit and defense layer**: logs, controls, security, compliance, and guardian review.

The audit and defense layer includes a receipt chain: material launch, gate, treasury, packet, outcome, cooldown, and drill events are linked into a local root hash. A seal records the current root so later state changes show up as a changed proof surface.

## Legal Wrapper

Practical candidates:

- purpose trust owning an LLC,
- foundation-owned company,
- public benefit corporation with locked reinvestment policy,
- nonprofit foundation plus taxable subsidiary,
- cooperative-like stewardship structure,
- or a hybrid designed by counsel.

The first version should not pretend law can be automated away. It should use a conventional legal entity with unusual internal rules.

Recommended v0:

**A manager-managed LLC governed by a purpose charter, with a small guardian board and strict treasury policy.**

This is not the final form, but it is simple enough to test.

## Satellite Company

Strange Company should not become the personal profit vehicle. A separate satellite company can be created as a normal for-profit vendor.

The satellite may profit from external customers and may later sell services to Strange Company only when:

- external customer revenue exists first,
- pricing is market-based,
- work is covered by written scope and invoices,
- conflicts are disclosed,
- Strange Company can choose another vendor,
- related-party revenue is never counted as proof of product-market fit.

This keeps the sealed company focused on compounding while allowing a second company to earn legitimate operating profit.

The satellite runs through a manual v0 operations loop:

1. record customer order intent,
2. generate a manual invoice packet,
3. confirm payment only after settlement,
4. deliver the scoped proof packet,
5. record the order state in the receipt chain.

## Treasury Allocation

All revenue enters the treasury.

Funds are allocated monthly by rule:

| Bucket | Target | Purpose |
| --- | ---: | --- |
| Growth experiments | 35% | Ads, launches, partnerships, sales tests |
| Product and automation | 25% | SaaS features, agents, integrations, internal tooling |
| Resilience reserve | 15% | Cash buffer, legal reserve, vendor migration reserve |
| Security and compliance | 10% | Audits, monitoring, bug bounties, accounting, legal |
| Acquisitions | 10% | Small tools, domains, data sets, newsletters, APIs |
| Wild research | 5% | Strange bets with capped downside |

Rules:

- No bucket can spend more than its monthly budget without review.
- Resilience reserve must reach at least 12 months of core operating costs.
- Any spend above a defined threshold requires multi-party approval.
- All spending must map to a mission category.
- Failed experiments are allowed if they are logged and capped.

## Decision Classes

### Class A: Automated

Low-risk, reversible actions.

Examples:

- deploy small ad tests,
- buy approved SaaS tools,
- rotate routine content,
- assign bounties below threshold,
- run pricing tests within safe bounds.

Requirements:

- budget cap,
- audit log,
- rollback path,
- no legal commitments beyond approved templates.

### Class B: Reviewed

Medium-risk actions requiring human review or guardian approval.

Examples:

- new vendor contract,
- material price change,
- acquisition under cap,
- product launch that touches regulated data,
- hiring a professional firm,
- open-source license change.

Requirements:

- written rationale,
- risk checklist,
- conflict check,
- second approval.

### Class C: Constitutional

High-risk actions that could alter the nature of the company.

Examples:

- changing the charter,
- issuing equity or tokens,
- taking outside capital,
- distributing surplus,
- changing entity structure,
- selling core assets,
- shutting down a product line that funds the treasury.

Requirements:

- guardian supermajority,
- outside legal review,
- public or internal notice period,
- full audit trail,
- explicit constitutional test.

## Execution Market

The company converts goals into scoped work packets.

Each packet should include:

- desired outcome,
- acceptance tests,
- budget,
- deadline,
- ownership of resulting IP,
- security requirements,
- data access limits,
- payment conditions,
- review process.

Contributor types:

- contractors,
- agencies,
- professional firms,
- open bounty participants,
- automated agents,
- API services,
- infrastructure vendors.

The company should prefer small, testable work packets over broad roles.

## Product Strategy

Strange Company v0 should launch many small tools, not one grand platform.

The first functional step is a controlled revenue pilot: a narrow productized service that can be sold, delivered manually, measured, and then converted into reusable packets or software. It should not accept payment until the legal, payment, accounting, and customer terms gates are clear.

Selection criteria:

- painful recurring workflow,
- buyer already spends money,
- can be built in under 30 days,
- narrow enough to automate support,
- low regulatory burden,
- low platform dependency,
- obvious distribution channel,
- subscription or usage revenue.

Initial product categories:

- compliance checklist tools for small businesses,
- automated document formatting,
- invoice and payment utilities,
- niche CRM add-ons,
- data cleanup tools,
- Shopify or marketplace utilities,
- local service business automations,
- AI-assisted reporting tools.

## Feedback Loop

Every product runs through the same loop:

1. Discover pain.
2. Launch tiny tool.
3. Charge money immediately.
4. Measure activation, retention, support load, and payback period.
5. Kill, improve, or scale.
6. Reinvest learnings and revenue.

Kill criteria matter. Strange Company should not emotionally attach to products.

## Metrics

Primary:

- monthly recurring revenue,
- gross margin,
- net revenue retention,
- payback period,
- cash runway,
- product uptime,
- security incidents,
- legal/compliance incidents.

Secondary:

- number of experiments launched,
- percent of operations automated,
- vendor concentration,
- platform concentration,
- support tickets per customer,
- time to recover from incident.

Forbidden vanity metrics:

- total signups without revenue,
- social attention without conversion,
- gross revenue without margin,
- growth that depends on policy violations,
- hype that increases attack surface.
