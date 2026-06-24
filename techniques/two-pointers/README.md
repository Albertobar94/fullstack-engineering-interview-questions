# Two pointers — two cursors over a sequence, moved with intent

**Start here.** This family is one idea — keep **two indices** and move them deliberately —
split by **how the pointers move**. Pick a movement below; each leaf has the recognition
test, the bug-prone lines, and runnable code.

## What it is
Instead of one loop inside another (check every pair → `n²` steps), you keep two cursors
and move whichever one makes progress. The structure of the data (sorted order, a window
rule, two already-sorted inputs) guarantees that moving a cursor only ever rules options
*out* — so a single pass, **O(n)**, replaces the nested loop.

## The goal
Turn an `n²` "compare everything to everything" into one `n` sweep by never re-examining a
pair you've already ruled out.

## The movements (this is the fork to recognize)
The recognition trigger is **how the two pointers travel**:

| Movement | How they move | Reach for it when | Canonical problem |
|---|---|---|---|
| **[Opposite ends](./opposite-ends/)** | start at both ends, walk **inward** | **sorted/symmetric** data + a pair, or compare the two ends | #167 Two Sum II, #125 Valid Palindrome |
| **[Sliding window](./sliding-window/)** | both go **forward**, bounding a contiguous run | "best/longest/shortest **run in a row** that …" | #643, #3, #209 (see its 3 flavors) |
| **Fast & slow** _(planned)_ | both forward, **different speeds** | cycle detection, find the middle, dedupe-in-place | #141 Linked List Cycle, #876 Middle |
| **Merge two** _(planned)_ | one cursor **per sequence** | walk two **sorted** inputs together | merge sorted arrays, #349 Intersection |

## Which one? (decision guide)
- Data **sorted** and you compare the two ends → **opposite-ends**.
- You want a **contiguous run** that satisfies a rule → **sliding-window**.
- One **list/linked-list** and you need a cycle / midpoint / in-place compaction → **fast & slow**.
- **Two** sorted inputs to combine → **merge two**.

## What they share
- Two indices that (almost always) move **forward-only** → each element handled O(1) times.
- They exploit **structure** (sortedness, a window invariant) — without it the comparison lies.
- O(1) extra space (no second data structure), unlike the hashmap approach.

## Looks like it but ISN'T
- One moving **probe** over sorted data (not two cursors), throwing away half each step →
  that's [`search/binary-search`](../search/binary-search/find-target/).
- A pair in **unsorted** data with no structure to exploit → the hashmap
  [`hashing/two-sum`](../hashing/two-sum/). Same question, different trick — decided by whether the input is sorted.

---

Pick a movement: [`opposite-ends`](./opposite-ends/) · [`sliding-window`](./sliding-window/) · fast & slow _(planned)_ · merge two _(planned)_.
