# Recursion — solve a problem by solving a smaller copy of itself

**Start here.** This folder is one paradigm — a function that **calls itself on a smaller piece**
until the piece is small enough to answer outright — split by *how you use it*. If recursion is new,
read [`basics`](./basics/) first (the call stack, the base case, the three parts to lock in), then
come back for the divide-and-conquer application.

## What it is
When data is **shaped like itself** — a tree of subtrees, an array of arrays, folders in folders —
you solve the whole by solving each smaller part the same way, and the **call stack** stitches the
answers back together. A **base case** (the smallest input you answer without recursing) stops it;
every call must take a **strictly smaller** step toward that base, or it never ends.

## The goal
Express "do this to every nested piece" without hand-managing a stack — and, in divide-and-conquer,
turn an `O(n²)` brute force into `O(n log n)` (sort) or average `O(n)` (select) by **splitting the
work in half** each call.

## The flavors (this is the fork to recognize)

| Flavor | The recursion does | Reach for it when | Canonical problem |
|---|---|---|---|
| **[Basics](./basics/)** | walk nested/branching data, combine sub-answers | tree / nested JSON / file tree; "answer = node + each child" | #104 Max Depth, nested-array sum, merge sort |
| **[QuickSelect](./quickselect/)** | **partition** around a pivot, recurse into **one** side only | "the k-th smallest/largest" without fully sorting | #215 Kth Largest Element |

## Which one?
- "Process every nested/branching piece and fold the results" → **basics** (and most tree problems live in [`techniques/trees`](../../techniques/trees/)).
- "Find the k-th order statistic fast, no full sort needed" → **quickselect** (partition, then recurse into the half that holds `k`).

## What they share
- A **base case** that returns without recursing — reachable, or the stack overflows
  (`RangeError: Maximum call stack size exceeded`).
- Every call takes a **strictly smaller** step toward the base.
- The **call stack** holds the paused callers — deep/skewed input can exhaust it (JS dies ~10k frames).

## Looks like it but ISN'T
- A **flat list** walked end-to-end → a plain loop; recursion just adds stack cost and overflow risk.
- **[Dynamic programming](../dynamic-programming/)** — recursion where the *same* subproblem repeats (overlapping); the fix is to *remember* answers (memoize). Tell: subproblems **overlap** (→ DP) or each piece visited **once** (→ plain recursion)?
- **Backtracking** — recursion that tries a choice, recurses, then **undoes** it (subsets, permutations). Recursion + try/undo. (Planned.)

---

Pick a flavor: [`basics`](./basics/) · [`quickselect`](./quickselect/).
