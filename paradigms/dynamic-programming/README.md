# Dynamic programming — recursion that remembers, so it stops recomputing

**Start here.** DP is **recursion plus memory**: when the same smaller subproblem comes up again and
again, you compute it **once** and reuse the answer — turning an exponential blow-up into a linear or
polynomial sweep. If recursion is new, read [`paradigms/recursion`](../recursion/) first; DP is that,
with a cache. Pick a flavor below — each leaf has the recognition test, the bug-prone lines, and code.

## What it is
Two ingredients make a problem "DP":
1. **Overlapping subproblems** — naive recursion solves the *same* smaller case many times (naive
   Fibonacci recomputes `fib(3)` all over the tree). Caching kills the repeats.
2. **Optimal substructure** — the best answer is built from the best answers to subproblems
   (`best(i) = f(best(i−1), best(i−2), …)`).

Two ways to fill the cache: **top-down** (recurse + a memo map) or **bottom-up** (a `dp[]` table
filled from the base cases up). Same recurrence, same answer.

## The goal
Cut a "try every combination" exponential (O(2ⁿ)) down to **O(n)** or **O(n·m)** by never solving the
same subproblem twice — and often shrink memory to **O(1)** by keeping only the last few results.

## The flavors (this is the fork to recognize)

| Flavor | Subproblem shape | Reach for it when | Canonical |
|---|---|---|---|
| **[1-D (climbing stairs)](./climbing-stairs/)** | `dp[i]` from `dp[i−1]`, `dp[i−2]`… | "min/max/ways along a line", choices step-by-step | #746 Min Cost Climbing Stairs, #70 Climbing Stairs |
| **Grid / 2-D** _(planned)_ | `dp[r][c]` from neighbours | paths/edits over a 2-D table | #62 Unique Paths, #1143 LCS |
| **Knapsack / subset** _(planned)_ | `dp[i][capacity]` | pick items under a budget | #416 Partition Equal Subset, 0/1 knapsack |
| **Intervals** _(planned)_ | `dp[i][j]` over a range | merge/split a range optimally | #1547 Min Cost to Cut a Stick |

## Which one?
- Choices stack up **along a line / sequence**, answer from the last one or two → **1-D** (start here).
- A **2-D table** (paths, two strings, a matrix) → grid DP.
- **Pick-or-skip under a capacity** → knapsack.
- Best way to **bracket / split a range** → interval DP.

## What they share
- A **state** (`dp[i]`, `dp[r][c]`, …) with a clear meaning, a **recurrence** from smaller states, and **base cases**.
- **Overlapping subproblems** (so caching pays off) + **optimal substructure** (so the recurrence is valid).
- Often an **O(1)-space** rewrite once you notice only the last few states matter.

## Looks like it but ISN'T
- **Plain recursion** where each subproblem is hit **once** (a tree walk) → no overlap, so a memo buys nothing → [`recursion`](../recursion/).
- **Greedy** — a locally-best choice that provably gives the global best, *without* exploring subproblems (e.g. interval scheduling). DP explores; greedy commits. Tell: does a greedy choice ever need revisiting? (yes → DP).
- **Divide & conquer** (merge sort) — splits into **non-overlapping** halves; no shared subproblems to cache.

---

Pick a flavor: [`climbing-stairs`](./climbing-stairs/) · grid _(planned)_ · knapsack _(planned)_ · intervals _(planned)_.
