# Growth Management

The private Operations console now includes an `Operator growth review` panel.

It does not automate outreach, spend money, send messages, or decide that the company is ready for live operation. It turns the existing operator receipts into a management view:

- daily outreach target and attempts,
- 7-day outreach attempts,
- qualified, invoice-ready, and paid pipeline counts,
- best current source by lead count,
- revenue-start and profit-readiness blockers,
- one copyable growth review packet.

## Management Rule

Growth can increase only after the boring controls stay intact:

1. Strange Company stays sealed and does not invoice customers directly.
2. The satellite operator keeps external setup, Stripe, Sheet, support, terms, and privacy gates real.
3. Outreach is logged by the operator; the app never sends or queues outreach.
4. A qualified external buyer comes before broader spend.
5. One manual payment and delivery closeout comes before scaling a channel.
6. Every material state change can be sealed into the receipt chain.

## Growth States

- `Growth blocked`: revenue-start or commercial readiness blockers are open.
- `Growth paused`: the daily pilot run has an active stop rule.
- `Outreach open`: the daily outreach target has not been met.
- `Need prospects`: outreach may be logged, but no lead exists yet.
- `Qualify pipeline`: leads exist, but none are qualified.
- `Prepare invoice`: a qualified lead exists, but none is invoice-ready.
- `Close first payment`: an invoice-ready lead exists, but no payment is settled.
- `Scale measured source`: at least one paid order exists and blockers are clear.

## Review Packet

The `Copy growth review` button creates a plain-text operator packet with:

- current growth state,
- next action,
- daily and 7-day outreach counts,
- lead and payment counts,
- best current source,
- open blockers,
- a boundary reminder.

The packet contains aggregate operating data only. Do not paste customer-private details, credentials, regulated data, payment card data, or sealed governance material into the review.

## Receipt Chain

The receipt chain now emits a `Growth Review` event with the growth state, next action, source summary, outreach counts, and pipeline counts. Sealing the chain preserves the management posture without treating it as approval to spend or launch.
