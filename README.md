# Fullstack Engineering Interview Questions

Notes for engineers who can **code** (loops, arrays, objects) but never studied algorithms.

Three goals:

1. **Recognize** which trick a problem needs — stop memorizing solutions.
2. **Read** algorithms in the wild — spot them in a code review, any stack (frontend or backend), judge whether they're the right call.
3. **Choose** the right *data structure + algorithm together* — understand the structure underneath (its physical layout vs the abstraction JS hands you), see **why an algorithm depends on it**, and pick both for the problem in front of you. See [`structures/`](./structures/).

Also collects **front-end & full-stack interview builds** — React components, JS/TS utilities, browser primitives — same recognition-first spirit: spot the pattern, know where bugs hide.

And a **domain axis** — [`domains/`](./domains/) — for business-domain knowledge a Staff engineer must build, not spot. First domain: [`fintech/`](./domains/fintech/) — the building blocks of a payments SaaS that scales (money, ledgers, idempotency…).

> **Voice:** all notes are **extremely concise, grammar sacrificed for concision** — fragments, no filler. Technical substance stays exact; plain words, no bare jargon. See [`CLAUDE.md`](./CLAUDE.md) and the reference note [`paradigms/recursion/basics`](./paradigms/recursion/basics/).

It also collects **front-end & full-stack interview builds** — React components, JS/TS utilities, browser primitives — written in the same recognition-first spirit: spot the pattern, know where the bugs hide.

---

## How slow is too slow? (Big-O, no math)

Big-O answers one thing: **list gets bigger → how fast does work pile up?** Comparing the _shape_ of code, not crunching numbers.
Big-O answers one thing: **list gets bigger → how fast does work pile up?** Comparing the _shape_ of code, not crunching numbers.

| Shape of code | Name | Steps for 1,000 items |
|---|---|---|
| Grab one item directly (`arr[0]`, look up a key) | **O(1)** | 1 |
| Cut what's left in half each step (like "higher / lower" guessing) | **O(log n)** | ~10 |
| One loop through the list | **O(n)** | 1,000 |
| Sort it, then one loop | **O(n log n)** | ~10,000 |
| A loop inside a loop (check every pair) | **O(n²)** | 1,000,000 |

Same list — loop-in-a-loop does a **million** steps where a single loop does a **thousand**.
Same list — loop-in-a-loop does a **million** steps where a single loop does a **thousand**.

**Use it:** problem gives the list size. Big list (100,000+)? Loop-in-a-loop is out — reach for a faster shape. Decide this **before** writing code.

---

## The building blocks

The tricks are built from these. Plain words — and each gets a full note under
[`structures/`](./structures/) explaining what it *really* is (physical layout vs the abstraction
JS hands you) and **why** the algorithms depend on it (linked as written; Array done):
The tricks are built from these. Plain words — and each gets a full note under
[`structures/`](./structures/) explaining what it *really* is (physical layout vs the abstraction
JS hands you) and **why** the algorithms depend on it (linked as written; Array done):

| Thing | Plain meaning | In JS/TS you'd use |
|---|---|---|
| **[Array / list](./structures/array/)** | items in a row, reached by position | `[]`, `arr[i]` |
| **[Linked list](./structures/linked-list/)** | items chained by pointers — splice cheap, indexing slow | node objects `{ val, next }` |
| **Hash map** | a labelled drawer — store and find by name, instantly | `Map` or a plain object `{}` |
| **Set** | a bag that ignores duplicates — "have I seen this before?" | `Set` |
| **Stack** | a pile — add and remove from the **top** only (last in, first out) | `arr.push()` / `arr.pop()` |
| **Queue** | a line — add at the back, remove from the **front** (first in, first out) | `arr.push()` / `arr.shift()` |
| **Heap** | a bag that always hands you the smallest (or biggest) item next | a priority-queue library |
| **Tree** | a branching chart — one root, each node points to its children | nodes with a `children` list |
| **Graph** | dots joined by lines; a tree without the "one parent" rule | a map of node → its neighbours |

---

## The tricks (and where they live)

Algorithm axis grouped into three super-categories. Trick nested inside another = **more specific
case** of it — Sliding Window lives in `two-pointers/` because it's just two markers + a rule for
moving them. Each leaf = a folder with its own note.

```text
techniques/                # the moves you apply to data
  two-pointers/            # opposite-ends, sliding window, fast/slow, merge two
  linked-list/             # rewire pointers — reverse, m-n reversal, flatten multilevel
  stack/                   # LIFO-driven — min-remove-brackets, queue-from-two-stacks
  trees/                   # binary-tree walks — depth, level-order, side view, validate BST
  grid/                    # BFS/DFS on a 2-D array — islands, rotting-oranges, walls-and-gates
  graphs/                  # bfs-dfs, topological-sort, dijkstra, inform-employees
  search/                  # binary search (find-target, first-last); exponential/galloping (planned)
  hashing/                 # counting, two-sum, grouping
  prefix-sum/              # running totals — highest altitude, peak so far
  bit-manipulation/        # divide by doubling — and the galloping-search twin
structures/                # the data structures themselves — what each costs + why algos need it
  array/                   # contiguous block — O(1) index; foundation of the techniques above
  linked-list/             # nodes chained by pointers — O(1) splice, O(n) index
  hashmap/  set/           # store/find by name; "seen it?"
  stack/  queue/           # LIFO pile; FIFO line
  heap/                    # always hands you the smallest/biggest next
  trees/  graphs/          # branching / linked data
paradigms/                 # whole problem-solving strategies
  recursion/               # solve via a smaller copy of itself — basics + quickselect (#215)
  dynamic-programming/     # recursion + memory — climbing-stairs (1-D); grid/knapsack (planned)
  recursion-backtracking/  # subsets / orderings, puzzles                  (planned)
```

Leaf folders (e.g. `techniques/two-pointers/sliding-window/`) created as you write each note. A
family with >1 child gets an **overview README** at its folder (see `techniques/two-pointers/`,
`techniques/search/`).

`structures/` holds the **pure data structures** (what each is physically + what it costs); the
algorithms that *depend* on them stay in `techniques/`/`paradigms/`, reached via each structure
note's **"what it unlocks"** links — so the structure↔algorithm dependency is one click either way.

Helpers showing up _inside_ many of these: **Intervals** (start/end ranges), **Greedy** (grab the best-looking option now).

---

## Front-end & full-stack interviews (GFE 75 + components)

A **second axis**, kept separate on purpose — it sits at the top level next to
`techniques/` (it is *not* under them). The folders above are algorithm patterns — you
navigate them by *recognising which trick* a problem needs, and nesting means "a more
specific case of the parent." This axis is different: the [GreatFrontEnd 75](https://www.greatfrontend.com/interviews/gfe75)
classics and friends — **JS/TS utility primitives** you implement from scratch (debounce,
throttle), **UI component builds** (a paginated Data Table), and **JS/TS knowledge**
questions. You often already know the name; the skill is building it right and knowing
*when* to reach for it. Here nesting is plain **categorisation**, not "built-on" —
`debounce` isn't built on `throttle`.

Same note shape as algorithm notes (TL;DR recognition test → bug-focused pseudocode → real examples). Under `frontend/`:

```text
frontend/
  rate-limiting/      # debounce, throttle  — tame a flood of calls
  events/             # event emitter  — pub-sub, fire callbacks by name
  pagination/         # data-table  — slice a list into pages (UI component build)
  promises/           # promise.all, promisify, promise.race…   (planned)
  function-utils/     # curry, memoize, bind, once…             (planned)
  data-utils/         # deepClone, deepEqual, flatten, classNames…  (planned)
```

Scope: GFE-style JS/TS primitives, UI component builds, and JS/TS knowledge questions. A
primitive ships a `solution.ts` (+ self-check); a component build ships its component
file(s) and fixtures (e.g. `DataTable.tsx`, `data.ts`) plus a `solution.ts` for any pure,
extractable logic. Same note shape either way.

---

## Notes

Table of contents — and a recognition lookup. Add a row when you write a note.

| Trick | Folder | Reach for it when you see… |
|---|---|---|
| Two Sum (hashmap) | [`techniques/hashing/two-sum`](./techniques/hashing/two-sum/) | **unsorted** list + "find a pair summing to X"; "have I seen this?"; dedupe by key; replay / idempotency guard |
| Opposite ends — pair sum | [`techniques/two-pointers/opposite-ends/pair-sum`](./techniques/two-pointers/opposite-ends/pair-sum/) | **sorted** list + "find a pair summing to X"; sum-vs-target picks the end to drop; 3Sum/closest |
| Opposite ends — palindrome | [`techniques/two-pointers/opposite-ends/palindrome`](./techniques/two-pointers/opposite-ends/palindrome/) | "reads the same both ways"; compare the two end chars; *almost* palindrome (one deletion, #680) |
| Opposite ends — max area | [`techniques/two-pointers/opposite-ends/max-area`](./techniques/two-pointers/opposite-ends/max-area/) | bar heights + "most water *between two* walls"; area = width × **shorter** wall; move the shorter (#11) |
| Opposite ends — trapping rain | [`techniques/two-pointers/opposite-ends/trapping-rain`](./techniques/two-pointers/opposite-ends/trapping-rain/) | bar heights + "water *on top of all* bars after rain"; leftMax/rightMax, commit the shorter side (#42) |
| Divide by doubling | [`techniques/bit-manipulation/divide-two-integers`](./techniques/bit-manipulation/divide-two-integers/) | "no `*` `/` `%`"; a count/quotient up to ~2³¹ (too big to loop one-by-one); doubling a step until it overshoots; exponential search |
| Running total, keep the best | [`techniques/prefix-sum/highest-altitude`](./techniques/prefix-sum/highest-altitude/) | step-by-step changes + "highest / lowest / peak so far"; running balance / altitude / concurrency; cumulative tally |
| Binary search — find target | [`techniques/search/binary-search/find-target`](./techniques/search/binary-search/find-target/) | **sorted** data + find a value or a yes/no boundary; huge input needing O(log n); `git bisect` |
| Binary search — first & last position | [`techniques/search/binary-search/first-last-position`](./techniques/search/binary-search/first-last-position/) | **sorted** + a **repeated** value's start/end, a count, or an insertion point (lower/upper bound) (#34/#35) |
| Sliding window (fixed size) | [`techniques/two-pointers/sliding-window/fixed-size`](./techniques/two-pointers/sliding-window/fixed-size/) | a window of **fixed width `k`** + "max/avg/sum of any `k` in a row"; slide don't re-sum; rolling metric / moving average |
| Sliding window (variable, distinct) | [`techniques/two-pointers/sliding-window/variable-distinct`](./techniques/two-pointers/sliding-window/variable-distinct/) | **longest** run obeying a rule ("no repeats", "≤ K distinct"); grow til it breaks, shrink the left to fix |
| Sliding window (shrink to target) | [`techniques/two-pointers/sliding-window/shrink-to-target`](./techniques/two-pointers/sliding-window/shrink-to-target/) | **shortest** run that *reaches* a target (sum ≥ X), **non-negative** numbers; grow til good, shrink to the minimum |
| Fast & slow pointers | [`techniques/two-pointers/fast-slow`](./techniques/two-pointers/fast-slow/) | "does it **loop** / where / what's the **middle** / find the **duplicate**"; one cursor steps 2× the other (#141/#142/#876/#287) |
| Linked list — reverse | [`techniques/linked-list/reverse`](./techniques/linked-list/reverse/) | "reverse the list"; flip every `next` (save it first!); the prev/curr/next dance (#206) |
| Linked list — M-to-N reversal | [`techniques/linked-list/mn-reversal`](./techniques/linked-list/mn-reversal/) | "reverse only positions m..n, in place, one pass"; dummy head + head-insertion splice (#92) |
| Linked list — flatten multilevel DLL | [`techniques/linked-list/merge-multilevel-dll`](./techniques/linked-list/merge-multilevel-dll/) | doubly-linked nodes with a `child` list; splice inline depth-first, fix `prev` too (#430) |
| Stack — min remove brackets | [`techniques/stack/min-remove-brackets`](./techniques/stack/min-remove-brackets/) | "delete the fewest brackets to make it valid"; stack the unmatched **positions** (#1249) |
| Stack — queue from two stacks | [`techniques/stack/queue-from-two-stacks`](./techniques/stack/queue-from-two-stacks/) | "FIFO using only LIFO stacks"; pour `in`→`out`, lazily; amortized O(1) (#232) |
| QuickSelect (kth largest) | [`paradigms/recursion/quickselect`](./paradigms/recursion/quickselect/) | "k-th smallest/largest" without a full sort; partition, recurse **one** side; avg O(n) (#215) |
| Trees — max depth | [`techniques/trees/max-depth`](./techniques/trees/max-depth/) | "how deep / tallest path"; DFS `1 + max(left, right)` (and the #111 min-depth one-child trap) |
| Trees — level order (BFS) | [`techniques/trees/level-order`](./techniques/trees/level-order/) | "each level as a list" / "process level by level"; queue + snapshot the level size (#102) |
| Trees — right side view | [`techniques/trees/right-side-view`](./techniques/trees/right-side-view/) | "what you'd see from the side"; BFS, keep the last node per level (#199) |
| Trees — count complete | [`techniques/trees/count-complete`](./techniques/trees/count-complete/) | count a **complete** tree faster than O(n); perfect-subtree `2^h−1` shortcut → O(log²n) (#222) |
| Trees — validate BST | [`techniques/trees/validate-bst`](./techniques/trees/validate-bst/) | "is it a valid BST"; carry inherited `(low, high)` bounds, not just parent compares (#98) |
| Grid — number of islands | [`techniques/grid/number-of-islands`](./techniques/grid/number-of-islands/) | "how many connected regions" in a 2-D grid; flood-fill each blob, count starts (#200) |
| Grid — rotting oranges | [`techniques/grid/rotting-oranges`](./techniques/grid/rotting-oranges/) | "time to spread from **many** sources"; multi-source BFS, count layers (#994) |
| Grid — walls and gates | [`techniques/grid/walls-and-gates`](./techniques/grid/walls-and-gates/) | "distance from each cell to the **nearest** target"; multi-source BFS, fill on first visit (#286) |
| Graphs — BFS & DFS | [`techniques/graphs/bfs-dfs`](./techniques/graphs/bfs-dfs/) | reachability / fewest hops / components; adjacency list + `visited` (#1971/#323) |
| Graphs — topological sort | [`techniques/graphs/topological-sort`](./techniques/graphs/topological-sort/) | order a DAG by deps / detect a cycle; peel in-degree-0 nodes (Kahn) (#207) |
| Graphs — Dijkstra | [`techniques/graphs/dijkstra`](./techniques/graphs/dijkstra/) | shortest path on a **weighted** graph; min-heap pulls the nearest node (#743) |
| Graphs — inform employees | [`techniques/graphs/inform-employees`](./techniques/graphs/inform-employees/) | longest **weighted** root-to-leaf path on a tree-graph; DFS, max child (#1376) |
| DP — climbing stairs (1-D) | [`paradigms/dynamic-programming/climbing-stairs`](./paradigms/dynamic-programming/climbing-stairs/) | sequence where each step's answer is `f(dp[i−1], dp[i−2])`; min/count, O(1) space (#746/#70) |
| Debounce (fire once after quiet) | [`frontend/rate-limiting/debounce`](./frontend/rate-limiting/debounce/) | bursts of calls + you only want the **final** state; search-as-you-type, autosave, resize-end, file-watch reload |
| Throttle (steady rate during burst) | [`frontend/rate-limiting/throttle`](./frontend/rate-limiting/throttle/) | bursts of calls + react **during** the burst at a fixed cadence; scroll/mousemove/drag handlers, outbound API rate-limit |
| Event emitter (pub-sub by name) | [`frontend/events/event-emitter`](./frontend/events/event-emitter/) | one part announces "X happened", many react + (un)subscribe over time, linked by a **name** not a direct call; DOM events, app/domain event bus, sockets |
| Pagination (slice a list into pages) | [`frontend/pagination/data-table`](./frontend/pagination/data-table/) | fixed page size + Prev/Next + "page X of Y"; "show N per page"; API offset/limit; jump to a specific page (vs infinite scroll) |

> The first two rows are the **same question** (Two Sum) under opposite inputs: **sorted → two pointers** (O(1) space), **unsorted → hashmap** (O(n) space). Recognizing *which* is the whole skill. Likewise the last two (debounce / throttle) are the **same flood** under opposite needs: **want only the end → debounce**, **want steady updates → throttle**.
>
> The three **sliding-window** rows are one trick under three window rules: **fixed** width (slide a `k`-wide block), **grow-til-bad then shrink** (longest distinct run), **grow-til-good then shrink** (shortest run that hits a target). Spotting which rule applies is the recognition skill — the [sliding-window overview](./techniques/two-pointers/sliding-window/) explains the shared idea, the goal, and which flavor to reach for.

---

## Note template

Every `<family>/<trick>/README.md` follows this shape. The order is deliberate:
**questions first** (how to recognize it + what to nail down + where bugs live), the
**bug-focused pseudocode** in the middle, **real example problems last**. Plain words
throughout — ground every term, no bare jargon. [`techniques/search/binary-search/find-target`](./techniques/search/binary-search/find-target/)
is the reference note.

````markdown
# <Trick> — <one-line plain gist>

## TL;DR

**Is it <trick>? Ask these — all "yes" → yes:**
1. <recognition question you run on the problem's words>
2. <next question>
3. <the decider — the question that really settles it> ← this one is the test.

**Before you code, pin down:** <trick-specific clarifying questions> (generic ones live in the README's question table).

**The lines where bugs hide** (details in *How it works*): <the 2–4 bug-critical decisions, one line>.

## What it is
Plain explanation — no jargon, every term grounded — plus a tiny worked example on
real values. (Optional: a short "things to lock in" list.)

## What you track
The variables and what each means, in terms you already know.

## How it works
Pseudocode — code-like but readable. Put a ⚠️ on **every bug-prone line** with the
consequence of getting it wrong (off-by-one, infinite loop, wrong seed, overflow…).
Close with a one-line recap of those bug-critical lines.

```
<pseudocode, with ⚠️ on the lines that cause bugs>
```

## Picture
Mermaid flowchart of the loop / how its state moves.

## Where you'll meet it (practice + recognition)
- **On LeetCode (and similar):** real problem numbers/names + a one-line mapping each.
- **Real life / other platforms:** concrete scenarios in any stack (a `git bisect`, a rate limiter, peak concurrency…).
- **Looks like it but ISN'T:** the nearest sibling trick it gets confused with, and the one question that tells them apart — link the sibling note.

---
Solution code (fully commented): [`solution.ts`](./solution.ts).
````

### Split families (a trick with sibling sub-notes)

Trick fans into variants — e.g. `sliding-window/` → `fixed-size/`, `variable-distinct/`,
`shrink-to-target/` — add two extra pieces so a child note reads on its own:

- an **overview README** at the parent folder: the shared idea, the goal, the flavors in a
  table + a "which one?" guide, and a link to each child — see
  [`techniques/two-pointers/sliding-window`](./techniques/two-pointers/sliding-window/);
- a **context banner** at the very top of each child — a blockquote *between the title and
  the TL;DR*: "N of M flavors — read the overview first", a one-line "this flavor: …", and
  the canonical problem — see [`techniques/two-pointers/sliding-window/fixed-size`](./techniques/two-pointers/sliding-window/fixed-size/).

---

## Universal traps (check these every time)

Before calling any solution done, run the list that bites everyone:

- **Empty input** — zero items. Does the loop still return something sane?
- **One item** — many two-pointer / window bugs only show up here.
- **All duplicates / all the same value** — breaks "find the unique one" assumptions.
- **Already sorted, or reverse-sorted** — often best and worst case at once.
- **Off-by-one** — is the end index included or not? Pick one rule, hold it everywhere.
- **Negatives / zero** — running totals and "grow the window" logic often assume positives.
- **Huge input** — does the O(n²) version blow the time limit? (see [Big-O](#how-slow-is-too-slow-big-o-no-math))

---

## Questions that work on almost anything

Unsure what to ask? These scope fast and signal experience:

| Ask early | Why it helps |
|---|---|
| "How big can the input get?" | Says whether the slow obvious way is good enough. |
| "Can it be empty, or one item?" | Where bugs hide. |
| "Sorted? Duplicates? Negatives?" | Each answer points at a different trick. |
| "Mutate in place, or return new?" | Decides your memory budget. |
| "One answer, or all of them?" | One → often greedy. All → usually try-everything. |
| "Data all up front, or streaming in?" | Streaming needs different tools. |

**Don't** re-ask what the prompt says, or ask "what approach should I use?" Restate the problem in your own words first — catches half the misunderstandings.

---

## How to practice

Notes only build recognition if you **quiz yourself** — not re-read:

1. Pick a problem. Before solving, run a note's **TL;DR questions** against it, guess the trick.
2. Cover the pseudocode, rebuild from memory; peek only when stuck. Watch the ⚠️ bug lines.
3. Found the trick in real code (a PR, a library)? Add it under that note's **"Where you'll meet it."**
4. Got one wrong? That note's **TL;DR test** is missing a question — add the one that would've tipped you off.
