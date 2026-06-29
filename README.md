# Fullstack Engineering Interview Questions

Notes for engineers who can **code** (loops, arrays, objects) but never studied algorithms.

Three goals:

1. **Recognize** which trick a problem needs — stop memorizing solutions.
2. **Read** algorithms in the wild — spot them in a code review, any stack (frontend or backend), judge whether they're the right call.
3. **Choose** the right *data structure + algorithm together* — understand the structure underneath (its physical layout vs the abstraction JS hands you), see **why an algorithm depends on it**, and pick both for the problem in front of you. See [`structures/`](./structures/).

Also collects **front-end & full-stack interview builds** — React components, JS/TS utilities, browser primitives — same recognition-first spirit: spot the pattern, know where bugs hide.

> **Voice:** all notes are **extremely concise, grammar sacrificed for concision** — fragments, no filler. Technical substance stays exact; plain words, no bare jargon. See [`CLAUDE.md`](./CLAUDE.md) and the reference note [`paradigms/recursion`](./paradigms/recursion/).

---

## How slow is too slow? (Big-O, no math)

Big-O answers one thing: **list gets bigger → how fast does work pile up?** Comparing the _shape_ of code, not crunching numbers.

| Shape of code | Name | Steps for 1,000 items |
|---|---|---|
| Grab one item directly (`arr[0]`, look up a key) | **O(1)** | 1 |
| Cut what's left in half each step (like "higher / lower" guessing) | **O(log n)** | ~10 |
| One loop through the list | **O(n)** | 1,000 |
| Sort it, then one loop | **O(n log n)** | ~10,000 |
| A loop inside a loop (check every pair) | **O(n²)** | 1,000,000 |

Same list — loop-in-a-loop does a **million** steps where a single loop does a **thousand**.

**Use it:** problem gives the list size. Big list (100,000+)? Loop-in-a-loop is out — reach for a faster shape. Decide this **before** writing code.

---

## The building blocks

The tricks are built from these. Plain words — and each gets a full note under
[`structures/`](./structures/) explaining what it *really* is (physical layout vs the abstraction
JS hands you) and **why** the algorithms depend on it (linked as written; Array done):

| Thing | Plain meaning | In JS/TS you'd use |
|---|---|---|
| **[Array / list](./structures/array/)** | items in a row, reached by position | `[]`, `arr[i]` |
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
  search/                  # binary search; exponential/galloping, on-the-answer (planned)
  hashing/                 # counting, two-sum, grouping
  prefix-sum/              # running totals — highest altitude, peak so far
  bit-manipulation/        # divide by doubling — and the galloping-search twin
structures/                # the data structures themselves — what each costs + why algos need it
  array/                   # contiguous block — O(1) index; foundation of the techniques above
  hashmap/  set/           # store/find by name; "seen it?"
  stack/  queue/           # LIFO pile; FIFO line
  heap/                    # always hands you the smallest/biggest next
  trees/  graphs/          # branching / linked data
paradigms/                 # whole problem-solving strategies
  recursion/               # solve via a smaller copy of itself — base case + call stack
  recursion-backtracking/  # subsets / orderings, puzzles                  (planned)
  dynamic-programming/     # remember past answers — 1-D, grid, knapsack    (planned)
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

A **second axis**, kept separate on purpose — top level, next to `techniques/` (*not* under them).
Folders above are algorithm patterns — navigate by *recognising which trick*, nesting = "more
specific case." This axis differs: the [GreatFrontEnd 75](https://www.greatfrontend.com/interviews/gfe75)
classics + friends — **JS/TS utility primitives** built from scratch (debounce, throttle), **UI
component builds** (paginated Data Table), **JS/TS knowledge** questions. You often already know
the name; the skill is building it right + knowing *when* to reach for it. Here nesting = plain
**categorisation**, not "built-on" — `debounce` isn't built on `throttle`.

Same note shape as algorithm notes (TL;DR recognition test → bug-focused pseudocode → real examples). Under `frontend/`:

```text
frontend/
  rate-limiting/      # debounce, throttle  — tame a flood of calls
  events/             # event emitter  — pub-sub, fire callbacks by name
  pagination/         # data-table  — slice a list into pages (UI component build)
  tables/             # HTML-<table> rendering (overview: how/gotchas/alternatives) + popular-timeslots (pivot, UI build)
  promises/           # promise.all, promisify, promise.race…   (planned)
  function-utils/     # curry, memoize, bind, once…             (planned)
  data-utils/         # deepClone, deepEqual, flatten, classNames…  (planned)
```

Scope: GFE-style JS/TS primitives, UI component builds, JS/TS knowledge questions. Primitive ships
a `solution.ts` (+ self-check); component build ships its component file(s) + fixtures (e.g.
`DataTable.tsx`, `data.ts`) plus a `solution.ts` for pure extractable logic. Same shape either way.

---

## Notes

Table of contents — and a recognition lookup. Add a row when you write a note.

| Trick | Folder | Reach for it when you see… |
|---|---|---|
| Two Sum (hashmap) | [`techniques/hashing/two-sum`](./techniques/hashing/two-sum/) | **unsorted** list + "find a pair summing to X"; "have I seen this?"; dedupe by key; replay / idempotency guard |
| Opposite ends (two pointers) | [`techniques/two-pointers/opposite-ends`](./techniques/two-pointers/opposite-ends/) | **sorted** list + "find a pair"; palindrome / reverse-in-place; max area between two walls |
| Divide by doubling | [`techniques/bit-manipulation/divide-two-integers`](./techniques/bit-manipulation/divide-two-integers/) | "no `*` `/` `%`"; a count/quotient up to ~2³¹ (too big to loop one-by-one); doubling a step until it overshoots; exponential search |
| Running total, keep the best | [`techniques/prefix-sum/highest-altitude`](./techniques/prefix-sum/highest-altitude/) | step-by-step changes + "highest / lowest / peak so far"; running balance / altitude / concurrency; cumulative tally |
| Binary search (halve a sorted range) | [`techniques/search/binary-search/find-target`](./techniques/search/binary-search/find-target/) | **sorted** data + find a value or a boundary; "first/last position where…"; huge input needing O(log n); `git bisect` |
| Sliding window (fixed size) | [`techniques/two-pointers/sliding-window/fixed-size`](./techniques/two-pointers/sliding-window/fixed-size/) | a window of **fixed width `k`** + "max/avg/sum of any `k` in a row"; slide don't re-sum; rolling metric / moving average |
| Sliding window (variable, distinct) | [`techniques/two-pointers/sliding-window/variable-distinct`](./techniques/two-pointers/sliding-window/variable-distinct/) | **longest** run obeying a rule ("no repeats", "≤ K distinct"); grow til it breaks, shrink the left to fix |
| Sliding window (shrink to target) | [`techniques/two-pointers/sliding-window/shrink-to-target`](./techniques/two-pointers/sliding-window/shrink-to-target/) | **shortest** run that *reaches* a target (sum ≥ X), **non-negative** numbers; grow til good, shrink to the minimum |
| Debounce (fire once after quiet) | [`frontend/rate-limiting/debounce`](./frontend/rate-limiting/debounce/) | bursts of calls + you only want the **final** state; search-as-you-type, autosave, resize-end, file-watch reload |
| Throttle (steady rate during burst) | [`frontend/rate-limiting/throttle`](./frontend/rate-limiting/throttle/) | bursts of calls + react **during** the burst at a fixed cadence; scroll/mousemove/drag handlers, outbound API rate-limit |
| Event emitter (pub-sub by name) | [`frontend/events/event-emitter`](./frontend/events/event-emitter/) | one part announces "X happened", many react + (un)subscribe over time, linked by a **name** not a direct call; DOM events, app/domain event bus, sockets |
| Pagination (slice a list into pages) | [`frontend/pagination/data-table`](./frontend/pagination/data-table/) | fixed page size + Prev/Next + "page X of Y"; "show N per page"; API offset/limit; jump to a specific page (vs infinite scroll) |
| Group-by (flat list → Map of buckets) | [`techniques/hashing/grouping`](./techniques/hashing/grouping/) | split a flat list into groups by a derived key, **keep the items** per bucket; Group Anagrams (#49); `Object.groupBy` / lodash `_.groupBy`; SQL `GROUP BY … array_agg`; (vs counting = a tally; vs pivot = a rectangular grid) |
| Pivot / group-by (flat rows → grid) | [`frontend/tables/popular-timeslots`](./frontend/tables/popular-timeslots/) | flat `{row-key, col-key}` records reshaped into a 2D table; one axis → columns, other → rows; **rectangular with blanks** for missing cells (vs ragged group-by); calendar/heatmap, SQL `PIVOT`, pandas `pivot_table` |
| Recursion (a smaller copy of itself) | [`paradigms/recursion`](./paradigms/recursion/) | **nested / branching** data (tree, nested JSON, file system); base case + shrink toward it + combine; tree depth (#104), merge sort, deep-clone/flatten; (vs a plain loop for flat data; vs **DP** when subproblems overlap) |
| **Array** (the contiguous block — a *structure*) | [`structures/array`](./structures/array/) | picking the *data structure*: need **O(1) index** (binary search, two-pointers, sliding-window, prefix-sum all require it) + end-append; rarely insert/remove in the middle; (vs **linked list** = O(1) mid-insert but O(n) index) |
| **Hash map** (by-key drawer — a *structure*) | [`structures/hashmap`](./structures/hashmap/) | find by **name/key** in O(1); counting, dedupe, memoization, two-sum complement; key→value, **no order** (vs array by position; vs set = key-only) |
| **Set** (dedupe bag — a *structure*) | [`structures/set`](./structures/set/) | "have I **seen** this?" O(1) membership; `visited` guard, distinct-window, dedupe (vs array `includes` O(n); vs hash map = key→value) |
| **Stack** (LIFO pile — a *structure*) | [`structures/stack`](./structures/stack/) | **most-recent first**; brackets, undo, iterative DFS, expression eval; the call stack itself (vs queue = FIFO) |
| **Queue** (FIFO line — a *structure*) | [`structures/queue`](./structures/queue/) | **first-come first-served**; BFS / level-order, scheduling, event loop; use a **ring buffer**, not `arr.shift()` O(n) (vs stack = LIFO) |
| **Heap** (min/max-first — a *structure*) | [`structures/heap`](./structures/heap/) | "give me the **smallest/biggest next**"; top-k, merge-k, running median, Dijkstra; a tree packed in a flat array (vs sorted array; vs BST) |
| **Tree / BST** (ordered branching — a *structure*) | [`structures/trees`](./structures/trees/) | **ordered** search + range + sorted scan, O(log n) *if balanced*; in-order = sorted (vs heap = min/max only; vs hash map = unordered) |
| **Graph** (dots + lines — a *structure*) | [`structures/graphs`](./structures/graphs/) | things **connected** to things, cycles allowed; BFS/DFS, topological sort, shortest path, union-find; needs a `visited` set (vs tree = no cycles) |

> First two rows = **same question** (Two Sum), opposite inputs: **sorted → two pointers** (O(1) space), **unsorted → hashmap** (O(n) space). Recognizing *which* is the whole skill. Likewise last two (debounce / throttle) = **same flood**, opposite needs: **want only the end → debounce**, **want steady updates → throttle**.
>
> Three **sliding-window** rows = one trick, three window rules: **fixed** width (slide a `k`-wide block), **grow-til-bad then shrink** (longest distinct run), **grow-til-good then shrink** (shortest run hitting a target). Spotting which rule applies is the recognition skill — the [sliding-window overview](./techniques/two-pointers/sliding-window/) explains the shared idea, the goal, which flavor to reach for.

---

## Note template

Every `<family>/<trick>/README.md` follows this shape. Order is deliberate: **questions first**
(recognize it + what to nail down + where bugs live), **bug-focused pseudocode** middle, **real
example problems last**. **Extremely concise — grammar sacrificed for concision, plain words, no
bare jargon, every term grounded.** [`techniques/search/binary-search/find-target`](./techniques/search/binary-search/find-target/)
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

- an **overview README** at the parent folder: shared idea, the goal, the flavors in a table +
  "which one?" guide, link to each child — see
  [`techniques/two-pointers/sliding-window`](./techniques/two-pointers/sliding-window/);
- a **context banner** atop each child — a blockquote *between title and TL;DR*: "N of M flavors —
  read the overview first", a one-line "this flavor: …", the canonical problem — see
  [`techniques/two-pointers/sliding-window/fixed-size`](./techniques/two-pointers/sliding-window/fixed-size/).

### Structure notes (`structures/`)

Data structures get a **sibling shape** — you *pick* a tool, you don't *spot* a trick. Same
skeleton, swapped middle: reach-for-it test → **what it really is (abstraction vs the metal)** →
**what it costs (and why)** → **what it unlocks** (links to the algorithm notes that need it) →
picture → where you'll meet it. See the [`structures/` overview](./structures/) and the exemplar
[`structures/array`](./structures/array/).

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
