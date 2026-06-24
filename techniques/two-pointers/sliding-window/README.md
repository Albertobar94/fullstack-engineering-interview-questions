# Sliding window — slide a contiguous chunk across a list, reusing the last step's work

**Start here.** This folder is one idea — *sliding window* — split into **three flavors**.
If "sliding window" is new, read this whole page first; then pick a flavor. The three
sub-folders ([`fixed-size`](./fixed-size/), [`variable-distinct`](./variable-distinct/),
[`shrink-to-target`](./shrink-to-target/)) each have the recognition test, the bug-prone
lines, and runnable code.

## What a "sliding window" is
A **window** is just a *contiguous* slice of a list — a run of items sitting next to each
other, like `[9, 2, 6]` inside `[1, 9, 2, 6, 5]`. You **slide** it from left to right:
the window moves one step, a new item enters on the right, and (sometimes) an old item
drops off the left. You keep a **running summary** of what's inside (a sum, a count, a
"have I seen this?" map) and **update** it as the window moves — instead of re-reading the
whole slice every time. That reuse is the entire trick.

It lives under `two-pointers/` because a window is bounded by two markers — a **left**
edge and a **right** edge — that only ever move forward.

## The goal (why it exists)
Tons of problems ask for *"the best / longest / shortest **run of items in a row** that
does X."* The obvious way checks every possible run — a loop inside a loop — which for a
list of `n` items is about `n²` steps (1,000 items → a million steps). A sliding window
gets the same answer in **one pass** (`n` steps) by never recomputing a run it has already
mostly seen.

Tiny example — *"largest sum of 3 numbers in a row"* in `[1, 9, 2, 6]`:
- Brute force: add `1+9+2`, then add `9+2+6` — re-adding the `9` and `2`.
- Window: first sum `1+9+2 = 12`. Slide one step → drop the `1`, add the `6` →
  `12 − 1 + 6 = 17`. **One add, one subtract** per step, never a re-scan.

## The three flavors (this is the fork to recognize)
They are the *same* window — they differ only in **how it moves**:

| Flavor | Window width | How it moves | You want | Canonical problem |
|---|---|---|---|---|
| **[Fixed size](./fixed-size/)** | a constant `k`, never changes | slide one step: add the entrant, drop the leaver | best **sum / avg / max** of any `k` in a row | #643 Max Average Subarray I |
| **[Variable, distinct](./variable-distinct/)** | grows and shrinks | grow the right; when a rule **breaks** (e.g. a repeat appears), pull the left in until it's valid again | the **longest** run that obeys the rule | #3 Longest Substring Without Repeating Chars |
| **[Shrink to target](./shrink-to-target/)** | grows and shrinks | grow the right until the window **reaches** a target (sum ≥ X), then pull the left in to the smallest run that still qualifies | the **shortest** run that hits the target | #209 Minimum Size Subarray Sum |

## Which one? (decision guide)
- Width is **given and fixed** (`k`)? → **fixed-size**.
- Width is **data-dependent** and you want the **longest** run obeying a rule? → **variable-distinct**.
- You want the **shortest** run that **reaches a target**, and the numbers are **non-negative**? → **shrink-to-target**.

A way to remember the two variable ones: one **grows until it goes bad, then shrinks**
(longest valid), the other **grows until it goes good, then shrinks** (shortest qualifying).

## What all three share
- Two forward-only markers (**left** edge, **right** edge) over a **contiguous** range.
- Each item enters the window once and leaves once → **O(n)** total (one pass), even with
  the inner shrink, because the markers never back up.
- A **running summary** of the window's contents, updated as it moves — not recomputed.

## Looks like it but ISN'T
- Two markers walking inward from **both ends** of a **sorted** array → that's
  [`opposite-ends`](../opposite-ends/), not a sliding window (the ends move
  *toward each other*, the window doesn't slide).
- "Subarray sum" with **negative** numbers → the shrink guarantee breaks (removing an item
  can *raise* the sum), so reach for [`prefix-sum`](../../prefix-sum/highest-altitude/) instead.

---

Pick a flavor: [`fixed-size`](./fixed-size/) · [`variable-distinct`](./variable-distinct/) · [`shrink-to-target`](./shrink-to-target/).
