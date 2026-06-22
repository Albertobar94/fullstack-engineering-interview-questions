# Binary search — halve a sorted range

## 1. What it is
Find something in a **sorted** list by repeatedly **throwing away half** of what's
left. Keep a window (a `left` and a `right` edge) around the part still worth
searching. Each step, look at the middle item: if it's the target you're done; if the
target must be smaller, drop the right half; if larger, drop the left half. The window
halves every step, so even a million items finish in ~20 looks.

`nums = [-1, 0, 3, 5, 9, 12]`, looking for `9`:
- window `[-1..12]`, middle is `3` → `9 > 3`, drop the left half → window `[5..12]`
- window `[5..12]`, middle is `9` → found it.

### The 5 things to lock in
1. **Halve every step** — toss half the window each loop. That's the whole reason it's fast (`O(log n)`).
2. **Two pointers fence, one probe looks** — `left` and `right` bound the slice still in play; `mid` is the single spot you actually check. Three numbers, one job.
3. **Compute `mid` safely** — `mid = left + ⌊(right − left) / 2⌋`. Written this way (not `(left + right) / 2`) it can't overflow and always lands inside the window.
4. **Step *past* `mid` when you shrink** — you already checked `mid`, so move to `mid + 1` or `mid − 1`, never back to `mid`. That single `±1` is what stops the loop from spinning forever.
5. **Only works on sorted data** — the move "target is smaller → it's in the left half" is only true if the list is ordered.

> Built on: nothing — this is a base technique. Note `two-pointers/two-markers-both-ends`
> also walks two pointers inward, but there a *comparison of the two ends* drives it;
> here a *middle probe* drives it, and the data must be sorted.

## 2. Spot it
LeetCode phrases these stiffly. In plain words, **does the task sound like one of these?**
- "I've got a phone book sorted A–Z — find 'Nguyen' (or say it's not there)." → find a value.
- "Pick a number 1–1000; I'll only tell you *higher* or *lower*." → the pure form of the trick.
- "Prices rose every day this month — what's the **first day** it went over $100?" → first position where a yes/no flips.
- "Updates ran fine for years, then one broke login. **Which update** broke it first?" → first "bad" in a good→bad list (this is `git bisect`).
- "Servers come in sizes; **what's the smallest size** that still handles the traffic?" → smallest value that passes a test (binary search on the *answer*, not on a list).
- "New score goes into an already-ranked leaderboard — **where does it slot in**?" → insert position.

The shared shape: the data (or the answers) is **ordered**, and "wrong here → the answer is entirely to one side." That's the green light.

**In a problem (the formal tells):**
- input is **sorted** (or you can sort it) and you're hunting a value or a boundary.
- "find the **first / last** position where …", "the **smallest / largest** value such that …".
- huge input where a plain scan (`O(n)`) is too slow but `O(log n)` is fine.

**In real code** (reviewing a PR — any stack):
- Frontend: looking up a value in a pre-sorted array; finding the insert position to keep a list sorted; picking the right breakpoint from sorted thresholds.
- Backend: **`git bisect`** (halving commits to find the one that broke the build); searching a sorted index / sorted log by timestamp; the second half of exponential search (see `../../bit-manipulation/divide-two-integers`).
- Smell test: a linear scan over a **sorted** array looking for a value or a boundary → replace with binary search, `O(n)` → `O(log n)`.

## 3. What you track
- `left`, `right` — the edges of the window still worth searching (the fence).
- `mid` — the one spot you probe each step.
- (for boundary searches) `answer` — the best position found so far.

## 4. How it works
Recipe (find a target, return its index or `-1`):
> 1. `left = 0`, `right = lastIndex`.
> 2. While `left <= right`:
>    a. `mid = left + ⌊(right − left) / 2⌋`.
>    b. `nums[mid] === target` → return `mid`.
>    c. `nums[mid] < target` → target is to the right → `left = mid + 1`.
>    d. else → target is to the left → `right = mid - 1`.
> 3. Loop ended → not found, return `-1`.

**Why `mid + 1` / `mid - 1`, and why `<=` (the part to slow down for):** `mid` was just
checked, so re-including it does nothing but risk an **infinite loop** — when the window
shrinks to one item, `mid` lands on it, and if you set `left = mid` (not `mid + 1`) the
window never changes and you loop forever. Stepping past `mid` guarantees the window
gets strictly smaller every time. The `<=` (not `<`) matters because `right` is an
**inclusive** edge: when `left === right` there's still one item left to check.

## 5. Picture
```mermaid
flowchart TD
    A[left = 0, right = lastIndex] --> B{left <= right?}
    B -- no --> Z[return -1: not found]
    B -- yes --> C[mid = left + floor of right - left over 2]
    C --> D{compare nums of mid to target}
    D -- equal --> E[return mid]
    D -- target bigger --> F[left = mid + 1]
    D -- target smaller --> G[right = mid - 1]
    F --> B
    G --> B
```

## 6. Two disguises
Same halving, two different jobs.

- **A — LeetCode #704 Binary Search** (find a value): a sorted array and a target;
  return its index or `-1`. Mapping: the classic recipe above — probe the middle, drop
  the wrong half.
- **B — First Bad Version / `git bisect`** (debugging): versions `1..n` are *good, good,
  …, bad, bad* (once it breaks it stays broken). Find the **first bad** one, asking an
  `isBad(version)` check as few times as possible. Mapping: same halving, but instead of
  "equal?" the probe asks "is this one bad?" — bad → the answer is here or earlier
  (`right = mid - 1`, remember it); good → the answer is later (`left = mid + 1`). This
  is binary search on a **yes/no boundary** instead of an exact value — and it's exactly
  what `git bisect` does to your commit history.

## 7. Questions to ask
Only the trick-specific ones (generic scoping lives in the repo README):
- "Is the data **sorted**? By what key?" (no order → no binary search.)
- "Are there **duplicates**, and do you want the **first**, the **last**, or any match?"
- "If the target's missing, return `-1`, or the **insert position**?"
- "Is `right` an inclusive index or a length?" (decides `<=` vs `<` and `mid - 1` vs `mid`.)

## 8. Go faster
- Skeleton you keep ready:
  ```ts
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
  ```
- Invariant: the target, if present, is always inside `[left, right]`.
- Trick-specific bugs: setting `left = mid` instead of `mid + 1` (**infinite loop**);
  using `<` when `right` is inclusive (misses the last item); forgetting the data must be sorted.
- Say the cost out loud first: **"O(log n) time, O(1) space."**

---

Solution code (both disguises, fully commented): [`solution.ts`](./solution.ts).
