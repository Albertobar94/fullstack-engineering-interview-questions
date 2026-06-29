# Set — a bag that ignores duplicates, answers "have I seen this?" in O(1)

> **A `structures/` note (sibling shape to the trick notes).** New here? Read the
> [structures overview](../) first — it explains the abstraction↔metal idea and why algorithms
> depend on the structure underneath. **This structure:** drop items in, repeats are silently
> ignored, and "is `x` already in here?" is free (O(1)) instead of scanning the whole pile (O(n)).

## TL;DR

**Reach for a set when — any yes → candidate; the decider settles it:**
1. You only care **whether** something is present — never a value attached to it (just "in or out")?
2. Duplicates should **collapse** — adding the same thing twice means the same as adding it once?
3. **Do you ask "have I seen this?" over and over, on a collection big enough that O(n) `includes`
   would hurt?** That repeated membership check is the whole reason a set beats an array. **The
   decider.** (Need a *value* per key → hash map. Need *order/position* → array.)

**Before you use it, pin down:** what counts as "the same" item — value equality (set's
SameValueZero) or object identity (two equal-looking objects are *different* keys)? do you need
**insertion order** when iterating (JS `Set` gives it; a raw hash bag doesn't)? are items
**primitives** (clean keys) or **objects** (keyed by reference, easy to leak)? will you do **set
algebra** (union/intersect/difference) or just membership?

**Where it bites** (details in *What it costs*): membership is **value-based** — `NaN` *is* found,
`+0`/`-0` are the **same** key (SameValueZero), but two distinct objects that look equal are **two**
keys · **no index** — there's no "the 3rd item", and `has` is the only fast lookup · iteration order
is **insertion order in JS** but **don't rely on order at all** if you might port the idea · a heavy
**rehash** (grow past load factor) is a hidden **O(n)** spike.

## What it really is (abstraction vs the metal)

A set is a **[hash map](../hashmap/) with the values thrown away** — keys only. Same machinery:
**hash** the item to a number, **mod** it down to a bucket index, jump straight to that one bucket.
No scan of the whole collection → that's why `add`/`has`/`delete` are O(1) on average. Two items
that hash to the same bucket **collide**; you keep a short list per bucket (separate chaining) and
`has` walks only that tiny list. Membership is therefore O(1) — versus an **array**'s O(n)
`includes`, which checks every slot.

Tiny worked example — `seen = new Set()`, walking `[3, 1, 3]`:
- `seen.has(3)` → false → `seen.add(3)` → `{3}`
- `seen.has(1)` → false → `seen.add(1)` → `{3, 1}`
- `seen.has(3)` → **true** → it's a repeat, in O(1). (The array way would re-scan `[3,1]` each step.)

**The abstraction vs the metal.** A raw hash bag has **no order**. JS's `Set` adds two things on
top: it **keeps insertion order** (iterating yields items in the order you added them), and it
compares by **value identity** via **SameValueZero** — so `NaN` is findable (even though
`NaN === NaN` is false), and `+0` and `-0` count as one key. But objects are still keyed by
**reference**: `{a:1}` and a *different* `{a:1}` are two distinct members. Same lesson as a "file":
the language hands you a clean abstraction (`new Set()`), and the physical reality (buckets,
hashing, value-vs-reference equality) **leaks through** as both cost and surprising equality rules.

## What you track

- **buckets** — the array of short chains; an item lives in `hash(item) % buckets.length`.
- **count** — how many items are live (the `size`).
- **load factor** — `count / buckets.length`. Past ~0.75 the chains lengthen, so the table
  **rehashes**: allocate ~2× buckets, re-place every item. (See `HashSet` in
  [`solution.ts`](./solution.ts).)

## What it costs (and why)

| Operation | Cost | Why — rooted in the bucket machinery |
|---|---|---|
| `add` | **O(1) avg** | hash → bucket → push (skip if already present); duplicate is a no-op |
| `has` | **O(1) avg** | hash → bucket → scan that *one short chain*, not the whole set |
| `delete` | **O(1) avg** | hash → bucket → splice out of its short chain |
| any of the above | **O(n) worst** | a bad/adversarial hash funnels all items into one bucket → one long chain to walk; also the **rehash** spike when growing |
| `rehash` (grow) | **O(n)**, rare | re-place every item into a bigger table; doubling makes it rare → averaged into the O(1) above |
| space | **O(n)** | one slot per item, plus spare buckets to keep the load factor low |
| iterate | **O(n)** | visit every item; **insertion order in JS**, no order in a raw bag |

"O(1) average" assumes the hash **spreads** items so chains stay ~1 long. Funnel everything into one
bucket and `has` degrades to O(n) — the same cliff a [hash map](../hashmap/) has. The rehash is the
set's hidden O(n): like array doubling, a single `add` can trigger it, but across `n` adds it's rare
enough to average out.

## What it unlocks (algorithms that depend on it)

A set is the canonical **"seen it?" tracker** — these lean on its O(1) membership:

- **[Sliding window — variable distinct](../../techniques/two-pointers/sliding-window/variable-distinct/)**
  — a `seen` set holds the window's items; when an entrant is **already in** the set, you've hit a
  repeat and shrink from the left. O(1) `has` is what keeps the whole window O(n).
- **[Two-sum (hashset complement variant)](../../techniques/hashing/two-sum/)** — walk the array,
  ask "is `target − x` in my set?" in O(1); the set version answers *whether a pair exists* (the
  hash-*map* version also recovers the indices).
- **[Recursion](../../paradigms/recursion/) / graphs (planned)** — a `visited` set stops cycles and
  re-walking the same node: before you recurse into / enqueue a node, check `visited.has(node)`.
  Without it, a graph with a cycle loops forever.
- **Dedupe** (name only) — `[...new Set(arr)]` drops duplicates in one pass, O(n).
- **Set algebra** (name only) — union / intersection / difference fall straight out of membership;
  built by hand in [`solution.ts`](./solution.ts).

## Picture

```mermaid
flowchart TB
    Q["add(\"banana\")"] -->|"hash → 5381… mod 8 = 3"| B3
    subgraph buckets["buckets — table of short chains (size 8)"]
        direction TB
        B0["[0] (empty)"]
        B1["[1] → apple"]
        B3["[3] → banana → grape"]
        B6["[6] → kiwi"]
    end
    B3 -.->|"already in chain?<br/>scan just this list"| Dup{"present?"}
    Dup -->|"yes"| NoOp["no-op (dups ignored)"]
    Dup -->|"no"| Push["push to chain, count++"]
```

## Where you'll meet it (practice + recognition)

**In JS/TS:**
- `new Set()` + `.add` / `.has` / `.delete` / `.size`, `for...of` (insertion order). `[...new Set(arr)]`
  to dedupe in a line. `WeakSet` for object membership that doesn't pin objects in memory.
- No built-in union/intersect/difference until recently — `new Set(a).intersection(b)` etc. landed in
  modern engines; older code rolls them with `filter` + `has`.

**Real life / any stack:**
- "Have we processed this message ID already?" (idempotency / dedupe on a queue consumer).
- Feature flags a user is in, tags on a post, unique visitor IDs, allow-list / block-list membership.
- A crawler's set of **visited URLs**; a job runner's set of **in-flight IDs**.

**Looks like it but ISN'T:**
- **[Hash map](../hashmap/)** — same buckets, but stores a **value per key** (`name → phone`), not
  bare membership. Tell: do you need *what's attached* to the key (→ map) or only *whether the key
  exists* (→ set)?
- **[Array](../array/)** — keeps **order and duplicates**, addressed by **position**; membership is
  O(n) `includes`. Tell: do you ask "is `x` in here?" a lot (→ set) or need the `i`-th item / repeats
  / order (→ array)?
- **Bloom filter** (name only) — a *probabilistic* set: tiny memory, O(1) membership, but can answer
  "maybe present" with **false positives** (never false negatives). Tell: can you tolerate an
  occasional wrong "yes" to save huge memory (→ Bloom) or need an exact answer (→ set)?

---
Solution code — `HashSet` (buckets + hashing + chaining + rehash, plus immutable union/intersection/
difference), runnable self-check: [`solution.ts`](./solution.ts).
