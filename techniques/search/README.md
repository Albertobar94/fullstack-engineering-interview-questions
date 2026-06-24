# Search — zero in on a target by ruling out big chunks

**Start here.** This family groups the techniques that **find a position or value in an
ordered space** by discarding where the answer *can't* be, instead of scanning everything.
Pick a technique below.

## What it is
When the space is **ordered** — a sorted array, or a yes/no test that flips once as you
slide along the answer range — you don't have to look at every candidate. Test one point,
prove the answer is entirely on one side, throw the other side away. Repeat.

## The goal
Turn an `O(n)` scan into `O(log n)` by halving (or doubling toward) the search space each step.

## The techniques (pick by what you know about the space)

| Technique | Use it when | Canonical problem |
|---|---|---|
| **[Binary search](./binary-search/find-target/)** | bounds **known**, data **sorted** (or a monotonic yes/no over the answer) | #704 Binary Search, #278 First Bad Version |
| **Binary search on the answer** _(planned)_ | the *answer* range is monotonic — "smallest X that passes a test" | #875 Koko, #1011 Capacity to Ship |
| **Exponential / galloping** _(planned)_ | bounds **unknown / huge / unbounded** — gallop to a bracket, then binary-search it | first index ≥ key in an unbounded sorted source |
| **Ternary** _(planned)_ | a **unimodal** function (one peak/valley) rather than sorted values | max of a unimodal array |

> **Exponential search** currently lives as a twin (`firstIndexAtLeast`) inside
> [`bit-manipulation/divide-two-integers`](../bit-manipulation/divide-two-integers/) — paired
> there because both *double until they overshoot*. It will graduate to
> `techniques/search/exponential-search/` (it's the doubling loop **plus** a binary search of
> the bracket it pins down).

## Which one? (decision guide)
- Sorted array, length known → **binary search**.
- "Find the smallest/largest value that *works*" → **binary search on the answer**.
- Source is unbounded or you don't want to measure its length → **exponential / galloping**.
- Optimizing a single-peak function, not searching sorted values → **ternary**.

## Looks like it but ISN'T
- Searching a **graph or grid** (follow neighbors) → that's BFS/DFS under `graphs/` _(planned)_;
  the trigger there is "nodes + edges", not "ordered space".
- Scanning **unsorted** data for a value → no order to exploit, so it's just a loop, or the
  hashmap [`hashing/two-sum`](../hashing/two-sum/) if you're matching pairs.

---

Pick a technique: [`binary-search`](./binary-search/find-target/) · on-the-answer _(planned)_ · exponential _(planned)_ · ternary _(planned)_.
