# Structures — the tools you hold data in, and why the algorithm depends on them

A **data structure** = a way to arrange data in memory. Pick the arrangement and you've decided
what's cheap and what's slow — *before* you write a line of algorithm. This super-category is the
**third lens** of the repo: not "which trick?" but **"which tool fits, what does it really cost,
and which algorithms does it unlock?"**

> **The abstraction↔metal idea.** A "file" isn't a block of text with a pointer to a DB — it's bytes
> physically sitting on an SSD/HDD, laid out differently by each OS, and JS/Node only ever hands you
> the **abstraction** (`fs.readFile`). Every structure is like this. A JS `Array` isn't a contiguous
> C array; a `Map` isn't a plain object. The **physical layout** under the abstraction is *why* each
> operation costs what it costs — and that cost is *why* an algorithm leans on one structure and
> breaks on another. Each note here closes that gap: plain meaning → the metal → what JS hands you →
> where it leaks.

## Why the algorithm depends on the structure

An algorithm is a sequence of operations. It's only as fast as those operations are *on the
structure you chose*. Binary search halves a range by **jumping to the middle index** — free on an
array (address math), O(n) on a linked list (walk the chain), so the whole O(log n) win is gone.
Swap the structure and the *same code* changes complexity class. So the real skill is picking
**structure + algorithm together**.

| This structure… | makes these cheap… | …which unlocks |
|---|---|---|
| **[Array](./array/)** | O(1) index, append | [binary search](../techniques/search/binary-search/find-target/), [two-pointers](../techniques/two-pointers/opposite-ends/), [sliding window](../techniques/two-pointers/sliding-window/), [prefix-sum](../techniques/prefix-sum/highest-altitude/) |
| **[Hash map](./hashmap/)** | O(1) lookup/insert by key | [two-sum](../techniques/hashing/two-sum/), [group-by](../techniques/hashing/grouping/), counting, dedupe, memoization |
| **[Set](./set/)** | O(1) membership | dedupe, `visited` guard ([recursion](../paradigms/recursion/), graph traversal), [distinct window](../techniques/two-pointers/sliding-window/variable-distinct/) |
| **[Stack](./stack/)** | O(1) push/pop one end | DFS, bracket matching, monotonic-stack, undo |
| **[Queue / deque](./queue/)** | O(1) add-back / remove-front | BFS, sliding-window max, scheduling |
| **[Heap](./heap/)** | O(1) peek min/max, O(log n) push/pop | top-k, merge-k, running median, Dijkstra |
| **[Tree / BST](./trees/)** | O(log n) ordered search/insert | range queries, autocomplete, ordered maps |
| **[Graph](./graphs/)** | store node→neighbours | BFS/DFS, topological sort, shortest path, union-find |

(Structure-bound *algorithms* — monotonic stack, BFS/DFS, topological sort, union-find — live under
[`techniques/`](../techniques/); the structure note links to them, doesn't house them.)

## The structures (what lives here)

| Structure | Plain gist | Headline cost | Status |
|---|---|---|---|
| **[Array](./array/)** | items packed in a row, reached by position | O(1) index, **O(n) middle insert** | ✅ done |
| **[Hash map](./hashmap/)** | a labelled drawer — store/find by name | O(1) avg, **O(n) on a bad day** (collisions/rehash) | ✅ done |
| **[Set](./set/)** | a bag that ignores duplicates | O(1) "seen it?" | ✅ done |
| **[Stack](./stack/)** | a pile — push/pop the **top** (LIFO) | O(1) both | ✅ done |
| **[Queue / deque](./queue/)** | a line — add back, remove **front** (FIFO) | O(1) both *if* done right | ✅ done |
| **[Heap](./heap/)** | always hands you the smallest/biggest next | O(log n) push/pop, **O(1) peek** | ✅ done |
| **[Tree / BST](./trees/)** | branching chart; ordered → searchable | O(log n) *if balanced*, **O(n) if skewed** | ✅ done |
| **[Graph](./graphs/)** | dots joined by lines, no "one parent" rule | depends on representation | ✅ done |

## The cost cliff hiding in each

Every structure has one operation that quietly costs O(n) — the thing that bites when the input
grows. Know it before you pick:

- **Array** — insert/remove in the **middle/front** (shifts everything after).
- **Hash map** — **rehash** when it grows past its load factor (and worst-case lookup on heavy
  collisions); also: **no order**.
- **Linked list** — **indexing** the `i`-th node (no address math, walk the chain).
- **Heap** — **searching** for an arbitrary value (only the min/max is cheap).
- **BST** — degrades to a **linked list (O(n))** when inserted in sorted order without balancing.

## The note shape (how structure notes differ)

Trick notes ask *"is this problem X?"*. Structure notes ask *"should I reach for tool X, what does
it cost, and why?"* — same skeleton, swapped middle:
**TL;DR** (reach-for-it test · pin-down questions · where-it-bites) → **What it really is
(abstraction vs the metal)** → **What it costs (and why)** → **What it unlocks** (links to the
algorithm notes that need it) → **Picture** → **Where you'll meet it** (JS built-in · real life ·
looks-like-but-isn't sibling structure).

Reference note: **[`array/`](./array/)** — the contiguous-block story end to end, with a hand-built
`DynamicArray` whose self-check *executes* the cost story.
