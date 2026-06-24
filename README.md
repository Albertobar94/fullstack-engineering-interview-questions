# ts-algorithms

Notes for engineers who can **code** (loops, arrays, objects) but never studied algorithms.

Two goals:

1. **Recognize** which trick a problem needs — so you stop memorizing solutions.
2. **Read** algorithms in the wild — spot them in a code review, in any stack (frontend or backend), and judge whether they're the right call.

---

## How slow is too slow? (Big-O, no math)

Big-O answers one question: **when the list gets bigger, how fast does the work pile up?** You're comparing the _shape_ of the code, not crunching numbers.

| Shape of code | Name | Steps for 1,000 items |
|---|---|---|
| Grab one item directly (`arr[0]`, look up a key) | **O(1)** | 1 |
| Cut what's left in half each step (like "higher / lower" guessing) | **O(log n)** | ~10 |
| One loop through the list | **O(n)** | 1,000 |
| Sort it, then one loop | **O(n log n)** | ~10,000 |
| A loop inside a loop (check every pair) | **O(n²)** | 1,000,000 |

Same list — the loop-in-a-loop does a **million** steps where a single loop does a **thousand**.

**Use it like this:** the problem tells you the list size. Big list (100,000+)? The loop-in-a-loop is out — reach for a faster shape. Decide this **before** you write code.

---

## The building blocks

The tricks are built out of these. Plain words:

| Thing | Plain meaning | In JS/TS you'd use |
|---|---|---|
| **Array / list** | items in a row, reached by position | `[]`, `arr[i]` |
| **Hash map** | a labelled drawer — store and find by name, instantly | `Map` or a plain object `{}` |
| **Set** | a bag that ignores duplicates — "have I seen this before?" | `Set` |
| **Stack** | a pile — add and remove from the **top** only (last in, first out) | `arr.push()` / `arr.pop()` |
| **Queue** | a line — add at the back, remove from the **front** (first in, first out) | `arr.push()` / `arr.shift()` |
| **Heap** | a bag that always hands you the smallest (or biggest) item next | a priority-queue library |
| **Tree** | a branching chart — one root, each node points to its children | nodes with a `children` list |
| **Graph** | dots joined by lines; a tree without the "one parent" rule | a map of node → its neighbours |

---

## The tricks (and where they live)

Folders mirror the hierarchy: a trick nested inside another is **built on it** — Sliding Window lives inside `two-pointers/` because it's just two markers plus a rule for moving them. Each leaf is a folder with its own note.

```text
two-pointers/            # sliding window, fast/slow, both-ends, merge two sorted
binary-search/           # on a sorted list, or on the answer itself
hashing/                 # counting, two-sum, grouping
stack/                   # monotonic stack, bracket matching
heap/                    # top-k, merge-k, running median
recursion-backtracking/  # subsets / orderings, puzzles
dynamic-programming/     # remember past answers — 1-D, grid, knapsack, ranges
graphs/                  # BFS, DFS, topological sort, union-find, shortest path
trees/                   # depth-first, level-order, BST
bit-manipulation/        # divide by doubling, exponential search
prefix-sum/              # running totals — highest altitude, peak so far
```

Leaf folders (e.g. `two-pointers/sliding-window/`) get created as you write each note.

Helpers that show up _inside_ many of these: **Intervals** (start/end ranges), **Greedy** (grab the best-looking option right now).

---

## Front-end primitives (GFE 75)

A **second axis**, kept separate on purpose. The folders above are algorithm
patterns — you navigate them by *recognising which trick* a problem needs, and nesting
means "built on the parent." This axis is different: the [GreatFrontEnd 75](https://www.greatfrontend.com/interviews/gfe75)
classics — JS/browser primitives you **implement from scratch** (you already know the
name; the skill is building it right and knowing *when* to reach for it). Here nesting
is plain **categorisation**, not "built-on" — `debounce` isn't built on `throttle`.

Same note shape as the algorithm notes (TL;DR recognition test → bug-focused pseudocode
→ real examples). They live under `frontend/`:

```text
frontend/
  rate-limiting/      # debounce, throttle  — tame a flood of calls
  events/             # event emitter  — pub-sub, fire callbacks by name
  promises/           # promise.all, promisify, promise.race…   (planned)
  function-utils/     # curry, memoize, bind, once…             (planned)
  data-utils/         # deepClone, deepEqual, flatten, classNames…  (planned)
```

Scope: implement-from-scratch JS primitives only (the ones that fit a `solution.ts`).
UI-build questions ("build a tabs component") are out — different format.

---

## Notes

The table of contents — and a recognition lookup. Add a row when you write a note.

| Trick | Folder | Reach for it when you see… |
|---|---|---|
| Two Sum (hashmap) | [`hashing/two-sum`](./hashing/two-sum/) | **unsorted** list + "find a pair summing to X"; "have I seen this?"; dedupe by key; replay / idempotency guard |
| Two markers, both ends | [`two-pointers/two-markers-both-ends`](./two-pointers/two-markers-both-ends/) | **sorted** list + "find a pair"; palindrome / reverse-in-place; max area between two walls |
| Divide by doubling | [`bit-manipulation/divide-two-integers`](./bit-manipulation/divide-two-integers/) | "no `*` `/` `%`"; a count/quotient up to ~2³¹ (too big to loop one-by-one); doubling a step until it overshoots; exponential search |
| Running total, keep the best | [`prefix-sum/highest-altitude`](./prefix-sum/highest-altitude/) | step-by-step changes + "highest / lowest / peak so far"; running balance / altitude / concurrency; cumulative tally |
| Binary search (halve a sorted range) | [`binary-search/find-target`](./binary-search/find-target/) | **sorted** data + find a value or a boundary; "first/last position where…"; huge input needing O(log n); `git bisect` |
| Sliding window (fixed size) | [`two-pointers/sliding-window/fixed-size`](./two-pointers/sliding-window/fixed-size/) | a window of **fixed width `k`** + "max/avg/sum of any `k` in a row"; slide don't re-sum; rolling metric / moving average |
| Sliding window (variable, distinct) | [`two-pointers/sliding-window/variable-distinct`](./two-pointers/sliding-window/variable-distinct/) | **longest** run obeying a rule ("no repeats", "≤ K distinct"); grow til it breaks, shrink the left to fix |
| Sliding window (shrink to target) | [`two-pointers/sliding-window/shrink-to-target`](./two-pointers/sliding-window/shrink-to-target/) | **shortest** run that *reaches* a target (sum ≥ X), **non-negative** numbers; grow til good, shrink to the minimum |
| Debounce (fire once after quiet) | [`frontend/rate-limiting/debounce`](./frontend/rate-limiting/debounce/) | bursts of calls + you only want the **final** state; search-as-you-type, autosave, resize-end, file-watch reload |
| Throttle (steady rate during burst) | [`frontend/rate-limiting/throttle`](./frontend/rate-limiting/throttle/) | bursts of calls + react **during** the burst at a fixed cadence; scroll/mousemove/drag handlers, outbound API rate-limit |
| Event emitter (pub-sub by name) | [`frontend/events/event-emitter`](./frontend/events/event-emitter/) | one part announces "X happened", many react + (un)subscribe over time, linked by a **name** not a direct call; DOM events, app/domain event bus, sockets |

> The first two rows are the **same question** (Two Sum) under opposite inputs: **sorted → two pointers** (O(1) space), **unsorted → hashmap** (O(n) space). Recognizing *which* is the whole skill. Likewise the last two (debounce / throttle) are the **same flood** under opposite needs: **want only the end → debounce**, **want steady updates → throttle**.
>
> The three **sliding-window** rows are one trick under three window rules: **fixed** width (slide a `k`-wide block), **grow-til-bad then shrink** (longest distinct run), **grow-til-good then shrink** (shortest run that hits a target). Spotting which rule applies is the recognition skill — the [sliding-window overview](./two-pointers/sliding-window/) explains the shared idea, the goal, and which flavor to reach for.

---

## Note template

Every `<family>/<trick>/README.md` follows this shape. The order is deliberate:
**questions first** (how to recognize it + what to nail down + where bugs live), the
**bug-focused pseudocode** in the middle, **real example problems last**. Plain words
throughout — ground every term, no bare jargon. [`binary-search/find-target`](./binary-search/find-target/)
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

When one trick fans out into variants — e.g. `sliding-window/` → `fixed-size/`,
`variable-distinct/`, `shrink-to-target/` — add two extra pieces so a child note reads on
its own:

- an **overview README** at the parent folder: the shared idea, the goal, the flavors in a
  table + a "which one?" guide, and a link to each child — see
  [`two-pointers/sliding-window`](./two-pointers/sliding-window/);
- a **context banner** at the very top of each child — a blockquote *between the title and
  the TL;DR*: "N of M flavors — read the overview first", a one-line "this flavor: …", and
  the canonical problem — see [`two-pointers/sliding-window/fixed-size`](./two-pointers/sliding-window/fixed-size/).

---

## Universal traps (check these every time)

Before you call any solution done, run the list that bites everyone:

- **Empty input** — zero items. Does the loop still return something sane?
- **One item** — many two-pointer / window bugs only show up here.
- **All duplicates / all the same value** — breaks "find the unique one" assumptions.
- **Already sorted, or reverse-sorted** — often the best and worst case at once.
- **Off-by-one** — is the end index included or not? Pick one rule and hold it everywhere.
- **Negatives / zero** — running totals and "grow the window" logic often assume positives.
- **Huge input** — does the O(n²) version blow the time limit? (see [Big-O](#how-slow-is-too-slow-big-o-no-math))

---

## Questions that work on almost anything

When unsure what to ask, these scope fast and signal experience:

| Ask early | Why it helps |
|---|---|
| "How big can the input get?" | Says whether the slow obvious way is good enough. |
| "Can it be empty, or one item?" | Where bugs hide. |
| "Sorted? Duplicates? Negatives?" | Each answer points at a different trick. |
| "Mutate in place, or return new?" | Decides your memory budget. |
| "One answer, or all of them?" | One → often greedy. All → usually try-everything. |
| "Data all up front, or streaming in?" | Streaming needs different tools. |

**Don't** re-ask what the prompt says, or ask "what approach should I use?" Restate the problem in your own words first — that alone catches half the misunderstandings.

---

## How to practice

The notes only build recognition if you **quiz yourself** — not re-read:

1. Pick a problem. Before solving, run a note's **TL;DR questions** against it and guess the trick.
2. Cover the pseudocode and rebuild it from memory; peek only when stuck. Pay attention to the ⚠️ bug lines.
3. Found the trick in real code (a PR, a library)? Add it under that note's **"Where you'll meet it."**
4. Got one wrong? That note's **TL;DR test** is missing a question — add the one that would've tipped you off.
