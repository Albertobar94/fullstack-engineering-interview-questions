# Binary search (first & last position) — two boundary searches for a value's range

> **2 of 2 binary-search flavors.** New to binary search? Read [`find-target`](../find-target/)
> first (the full mechanic + bug lines) and the [family overview](../).
> **This flavor:** the value **repeats**, and you want where its run *starts* and *ends*. Don't stop
> at the first match — keep halving toward the edge. Built on a **lower-bound** probe ("first index
> whose value is ≥ x"). Canonical problem: #34 Find First and Last Position of Element in Sorted Array.

## TL;DR

**Is it the first-last (boundary) search? Ask these — all "yes" → yes:**
1. **Is the data sorted and the target possibly *repeated*** (a run of equal values)?
2. **Do I need a *boundary*** — the first index, the last index, a count, or an insertion point — not just *any* match?
3. **On a match, can I keep going toward the edge** instead of returning? If "found it, but maybe an earlier/later one exists too → keep halving that side" → yes. **This one is the decider.**

**Before you code, pin down:** return `[-1, -1]` when absent? are duplicates expected (if not, first == last)? half-open `[lo, hi)` window or inclusive `[left, right]` (pick one — mixing them is the bug)? do you actually want a count (`last − first + 1`) or an insertion point (lower bound alone)?

**The lines where bugs hide** (details in *How it works*):
on a match **don't return — keep searching the chosen side** · **lower bound uses `hi = mid` (not `mid − 1`) over a half-open `[lo, hi)`** and `lo = mid + 1` otherwise · derive `last` as `lowerBound(target + 1) − 1` · **check `nums[first] === target`** before trusting the range (the bound can land on a bigger value or off the end).

---

## What it is
Finding *a* match is easy; finding the **edge** of a run of equal values needs a tweak: when the
probe equals the target, you've found *a* match but maybe not the *first* (or *last*) — so you keep
halving toward that edge instead of stopping.

The clean primitive is **lower bound**: the first index whose value is `≥ x`. With it:
- the **first** occurrence of `target` is `lowerBound(target)` — the first index `≥ target`, which (if it equals `target`) is where the run begins.
- the **last** occurrence is `lowerBound(target + 1) − 1` — one before the first index `> target`.

`nums = [5,7,7,8,8,8,10]`, `target = 8`:
- `lowerBound(8) = 3` (first index with value ≥ 8). `nums[3] === 8` ✓ → first = 3.
- `lowerBound(9) = 6` (first index with value ≥ 9) → last = 6 − 1 = 5.
- range `[3, 5]`.

`target = 6`: `lowerBound(6) = 1`, but `nums[1] = 7 ≠ 6` → not present → `[-1, -1]`.

## What you track
- `lo` / `hi` — a **half-open** window `[lo, hi)`; `hi` starts at `nums.length` (one past the end), `lo` at `0`.
- `mid` — the probe; on `nums[mid] < x` push `lo` up, else pull `hi` down to `mid` (never `mid − 1`).
- the two results — `first = lowerBound(target)`, `last = lowerBound(target + 1) − 1`.

## How it works
Pseudocode (#34 via lower bound). The ⚠️ lines are where every bug hides.

```ts
// lower bound: smallest index i with nums[i] >= x (or nums.length if none).
function lowerBound(nums, x) {
  let lo = 0, hi = nums.length;          // ⚠️ hi = LENGTH (half-open [lo, hi)), not length - 1.
  while (lo < hi) {                      // ⚠️ < , not <= — the window is half-open, empties at lo === hi.
    const mid = lo + Math.floor((hi - lo) / 2);   // round down, written this way so it can't overflow
    if (nums[mid] < x) {
      lo = mid + 1;                      // mid too small → answer is strictly right.
    } else {
      hi = mid;                          // ⚠️ hi = mid , NOT mid - 1 — mid might BE the boundary; keep it in range.
    }
  }
  return lo;                             // first index whose value is >= x.
}

function searchRange(nums, target) {
  const first = lowerBound(nums, target);
  if (first === nums.length || nums[first] !== target) {  // ⚠️ landed off the end or on a bigger value → absent.
    return [-1, -1];
  }
  const last = lowerBound(nums, target + 1) - 1;          // one before the first index > target.
  return [first, last];
}
```

Why two bound searches, not one match-then-expand: scanning outward from a found match to the run's
ends is O(n) in the worst case (think all-equal array). Two `lowerBound` calls stay **O(log n)** no
matter how long the run.

Lock these in: **half-open `[lo, hi)` with `hi = length`**, **`hi = mid` on the else branch**, **`last = lowerBound(target+1) − 1`**, **verify `nums[first] === target`**.

## Picture
```mermaid
flowchart TD
    A["first = lowerBound(target)"] --> B{first off end OR nums[first] != target?}
    B -- yes --> Z["return [-1, -1]"]
    B -- no --> C["last = lowerBound(target + 1) - 1"]
    C --> D["return [first, last]"]
```

## Where you'll meet it (practice + recognition)

**On LeetCode (and similar platforms):**
- **#34 Find First and Last Position** — the canonical; two lower-bound searches. (This note's code.)
- **#35 Search Insert Position** — `lowerBound(target)` *is* the insert index — the primitive alone. (`lowerBound` in [`solution.ts`](./solution.ts).)
- **#704 Binary Search** — just *a* match (no duplicates / no boundary) → the simpler [`find-target`](../find-target/).
- **Count occurrences of a value** — `last − first + 1` once you have the range.

**Real life / other platforms:**
- C++ `std::lower_bound` / `upper_bound`, Python `bisect_left` / `bisect_right` — this exact primitive in every standard library.
- "All log entries between two timestamps" in a sorted log — lower bound for the start, upper bound for the end.

**Looks like it but ISN'T:** finding *any* single match where values are **unique** — no boundary
to chase, so the plain [`find-target`](../find-target/) is enough. The tell: do values **repeat**
and you need an **edge** (→ this), or just one hit (→ find-target)?

---

Solution code (#34 + the reusable `lowerBound` primitive, fully commented): [`solution.ts`](./solution.ts).
