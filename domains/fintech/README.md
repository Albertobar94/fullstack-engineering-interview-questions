# Fintech — what a Staff engineer must build for a SaaS that scales

> A `domains/` super-category: business-domain knowledge, not a single algorithm. The other axes ask
> *which trick?* ([`techniques/`](../../techniques/)) or *which tool + what cost?*
> ([`structures/`](../../structures/)). This axis asks: **building a fintech product, what are the
> pieces you must get right, and how does each fail?** Money bugs are unforgiving — a penny of drift
> per transaction is a failed audit, not a rounding nit.

Goal, same as the rest of the repo: **recognition over memorization.** Not "memorize a ledger
schema" — recognize *when* a problem needs double-entry, idempotency, reconciliation; know what each
costs and the specific way each one bites in production.

## Two tracks

A fintech SaaS is mostly **architecture/domain** decisions with a thin shell of **fintech-flavored
algorithms** underneath. So two tracks:

- **`architecture/`** — the backbone. System & domain building blocks: how to represent money, prove
  balances, survive retries, reconcile against the outside world, stay compliant, and scale the
  whole thing. These use the **building-block note shape** (see [root README](../../README.md)):
  *reach for it → what it really is → what it costs & risks → how to build it → where it bites.*
- **`algorithms/`** — fintech-flavored DSA. The classic data-structure/algorithm notes from
  [`techniques/`](../../techniques/) and [`structures/`](../../structures/), seen through a money
  lens (an order book is a heap; a running balance is a prefix-sum). These link back to the trick
  notes rather than re-teaching them.

## Track A — architecture (the backbone)

Build order roughly top-to-bottom: money type first (everything sits on it), then the ledger, then
the safety/scale layers.

| Building block | Folder | Reach for it when… | Status |
|---|---|---|---|
| Money representation | [`architecture/money-representation`](./architecture/money-representation/) | any currency value stored, summed, or split; reconciled against a bank/processor | ✅ |
| Double-entry ledger | [`architecture/ledger-double-entry`](./architecture/ledger-double-entry/) | balances that change + "why is this balance this?" must be answerable; real/regulated money | ✅ |
| Idempotency keys | [`architecture/idempotency-keys`](./architecture/idempotency-keys/) | an effect that costs money + a caller that can retry; running twice is wrong | ✅ |
| Transactions & consistency | `architecture/transactions-consistency` | multi-step money moves must be all-or-nothing; ACID, isolation levels, optimistic locking; across services → saga / outbox | planned |
| Reconciliation | `architecture/reconciliation` | your ledger vs the bank/processor's truth; detect & explain drift ("breaks") | planned |
| Payment lifecycle | `architecture/payment-lifecycle` | a charge moves through states (auth → capture → settle → refund → dispute); processor webhooks; a state machine | planned |
| Audit & event log | `architecture/audit-event-log` | immutable history, replay, regulatory "show me everything that happened to this account" | planned |
| Multi-currency & FX | `architecture/multi-currency-fx` | amounts cross currencies; rate tables, conversion, exposure; never silent addition | planned |
| Compliance & security | `architecture/compliance-security` | cards, PII, identity; PCI-DSS scope minimization, KYC/AML, encryption, data residency | planned |
| Scaling the ledger | `architecture/scaling-the-ledger` | one Postgres table won't hold it; partitioning, CQRS read models, hot-account row contention, archival | planned |
| Observability for money | `architecture/observability-for-money` | you need to *know* when money is wrong: balance-drift alerts, financial close, SLOs | planned |

## Track B — fintech-flavored algorithms

These are existing tricks wearing a money hat. Each will be a thin note linking to its home trick.

| Algorithm | Home trick | The fintech instance | Status |
|---|---|---|---|
| Order-book matching engine | [`structures/heap`](../../structures/heap/) | match buy/sell orders by price-time priority; best price = top of a heap | planned |
| Running balance | [`techniques/prefix-sum`](../../techniques/prefix-sum/highest-altitude/) | account balance over time = cumulative sum of postings; "balance as of date X" | planned |
| Billing-cycle intervals | intervals helper | proration, overlapping subscription periods, merge/clip date ranges | planned |
| Velocity / fraud windows | [`techniques/two-pointers/sliding-window`](../../techniques/two-pointers/sliding-window/) | "> N charges in 10 min?" — a sliding window over a transaction stream | planned |
| Idempotent dedup | [`techniques/hashing/two-sum`](../../techniques/hashing/two-sum/) | "have I seen this event/key?" — the Set/Map seen-guard behind idempotency | planned |
| Decimal money math | [`architecture/money-representation`](./architecture/money-representation/) | integer minor units, largest-remainder split, banker's rounding | ✅ (lives in Track A) |

## Folder tree

```text
domains/
  fintech/
    README.md                      # this map
    architecture/                  # Track A — system & domain building blocks
      money-representation/        # integers not floats; penny-perfect split        ✅
      ledger-double-entry/         # money moves, never appears/vanishes             ✅
      idempotency-keys/            # exactly-once under retries                      ✅
      transactions-consistency/    # ACID, isolation, optimistic lock, saga/outbox   (planned)
      reconciliation/              # internal ledger vs external truth; drift        (planned)
      payment-lifecycle/           # auth→capture→settle→refund→dispute + webhooks   (planned)
      audit-event-log/             # immutable history, event sourcing, replay       (planned)
      multi-currency-fx/           # rate tables, conversion, exposure               (planned)
      compliance-security/         # PCI scope, KYC/AML, PII, residency              (planned)
      scaling-the-ledger/          # partitioning, CQRS read models, hot accounts    (planned)
      observability-for-money/     # balance-drift alerts, financial close, SLOs     (planned)
    algorithms/                    # Track B — fintech-flavored DSA (links to techniques/) (planned)
```

> Leaf folders are created as each note is written (same convention as the rest of the repo). The
> three ✅ seeds prove the building-block shape; the rest are stubbed here as the roadmap.
