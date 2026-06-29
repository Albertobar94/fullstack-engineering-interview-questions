# Binary search — halve a sorted range, by what exactly you're hunting

**Start here.** This folder is one idea — **throw away half the range each step** — split by *what
you're looking for*. If binary search is new, read [`find-target`](./find-target/) first (it
carries the full mechanic and the four bug lines), then come back for the boundary variant.

## What it is
When data is **sorted** (or a yes/no test flips exactly once along the range), you never scan every
candidate. Probe the middle, prove the answer lies entirely on one side, drop the other half.
~20 looks settle a million items — **O(log n)**.

## The goal
Turn an `O(n)` scan into `O(log n)`. The whole family shares the same skeleton — `left`/`right`
fence, a midpoint probe, `mid ± 1` when shrinking — and differs only in *what the probe decides*.

## The flavors (this is the fork to recognize)

| Flavor | What you're hunting | The probe asks | Canonical problem |
|---|---|---|---|
| **[Find target](./find-target/)** | one position: an exact value, or the first spot a yes/no flips | "is mid the value / is mid bad?" | #704 Binary Search, #278 First Bad Version |
| **[First & last position](./first-last-position/)** | the **range** of a repeated value — its leftmost and rightmost index | "is mid `< target`?" → run two boundary searches | #34 Find First and Last Position |

## Which one?
- "Find *a* value, or *the* boundary where a test first passes" → **find-target**.
- "The value repeats and I need where it *starts* and *ends*" (or "how many of it", or an insertion
  point) → **first-last-position** (lower/upper bound).

## What they share
- Data **sorted** (or a monotonic yes/no over the answer range) — the move "smaller → go left" is
  only valid if ordered.
- A `left`/`right` fence and a single `mid` probe; shrink with **`mid ± 1`** (find-target) or a
  half-open `[lo, hi)` window (the bound search) — pick one rule and hold it.
- O(log n) time, O(1) space.

## Looks like it but ISN'T
- Two cursors walking inward from **both ends** of a sorted array (a *pair* / palindrome) → that's
  [`two-pointers/opposite-ends`](../../two-pointers/opposite-ends/) — two markers, not one probe.
- **Unsorted** data → no order to exploit; a wrong probe tells you nothing → a plain scan or the
  hashmap [`hashing/two-sum`](../../hashing/two-sum/).

---

Pick a flavor: [`find-target`](./find-target/) · [`first-last-position`](./first-last-position/).
