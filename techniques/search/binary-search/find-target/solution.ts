/**
 * ============================================================================
 *  THE TRICK: halve a SORTED range until you land on the answer
 * ============================================================================
 *
 *  Keep a window [left, right] around the part still worth searching. Each step,
 *  look at the middle. Drop the half that can't contain the answer. The window
 *  halves every loop, so a million items take ~20 looks (O(log n)).
 *
 *  The 5 things:
 *    1. Halve every step          -> O(log n).
 *    2. left + right fence, mid probes -> three numbers, one job.
 *    3. mid = left + floor((right-left)/2) -> safe, always inside the window.
 *    4. Step PAST mid (mid +/- 1) -> already checked it; this prevents infinite loops.
 *    5. Data must be SORTED       -> "smaller -> left half" is only true if ordered.
 *
 *  Two problems that look unrelated but use the SAME halving live here:
 *    A) Binary Search       — find a value's index   (LeetCode #704)
 *    B) First Bad Version   — find a yes/no boundary  (LeetCode #278 / git bisect)
 *
 * ----------------------------------------------------------------------------
 *  A) BINARY SEARCH  (LeetCode #704)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given a sorted (ascending) array `nums` and a `target`, return its index, or
 *    -1 if it's not present.
 *
 *  Examples:
 *    nums = [-1,0,3,5,9,12], target = 9  -> 4
 *    nums = [-1,0,3,5,9,12], target = 2  -> -1
 *
 *  Why `<=` and `mid +/- 1` (the subtle bits):
 *    `right` is an INCLUSIVE index, so when left === right there is still one item
 *    to check -> the loop must use `<=`. And because we just checked `mid`, we move
 *    to `mid + 1` / `mid - 1`; setting `left = mid` would let the window stop
 *    shrinking and loop forever once it's down to one element.
 *
 *  Complexity:
 *    Time  O(log n) — the window halves each step.
 *    Space O(1).
 */
export function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1; // inclusive edge

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) {
      return mid;
    }
    if (nums[mid] < target) {
      left = mid + 1; // target is in the right half; skip mid
    } else {
      right = mid - 1; // target is in the left half; skip mid
    }
  }

  return -1;
}

/**
 * ----------------------------------------------------------------------------
 *  B) FIRST BAD VERSION  (LeetCode #278 — the far-apart twin, a.k.a. git bisect)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Versions 1..n go good, good, ..., bad, bad (once it breaks it stays broken).
 *    Find the FIRST bad version, calling `isBad(version)` as few times as possible.
 *    Returns -1 if none are bad.
 *
 *  Examples (isBad = v >= firstBad):
 *    n = 5, firstBad = 4  -> 4
 *    n = 5, firstBad = 1  -> 1
 *    n = 5, all good      -> -1
 *
 *  Same halving, different question:
 *    Instead of "is mid the target?", the probe asks "is mid bad?".
 *      bad  -> the first bad is here or earlier -> remember mid, search left.
 *      good -> the first bad must be later      -> search right.
 *    This is binary search on a yes/no BOUNDARY rather than an exact value — exactly
 *    what `git bisect` does over your commit history.
 *
 *  Complexity:
 *    Time  O(log n) — same halving; ~log n calls to isBad.
 *    Space O(1).
 */
export function firstBadVersion(n: number, isBad: (version: number) => boolean): number {
  let left = 1;
  let right = n;
  let answer = -1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (isBad(mid)) {
      answer = mid; // candidate — but maybe an earlier one is also bad
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return answer;
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  const a = [-1, 0, 3, 5, 9, 12];
  ck("search 9 -> 4", search(a, 9) === 4);
  ck("search 2 -> -1", search(a, 2) === -1);
  ck("search -1 -> 0", search(a, -1) === 0);
  ck("search 12 -> 5", search(a, 12) === 5);
  ck("search empty -> -1", search([], 1) === -1);
  ck("search single hit -> 0", search([7], 7) === 0);
  ck("search single miss -> -1", search([7], 8) === -1);

  const isBadFrom = (firstBad: number) => (v: number): boolean => v >= firstBad;
  ck("firstBad 4/5 -> 4", firstBadVersion(5, isBadFrom(4)) === 4);
  ck("firstBad 1/5 -> 1", firstBadVersion(5, isBadFrom(1)) === 1);
  ck("firstBad 5/5 -> 5", firstBadVersion(5, isBadFrom(5)) === 5);
  ck("firstBad none -> -1", firstBadVersion(5, () => false) === -1);

  console.log(fail === 0 ? "techniques/search/binary-search/find-target: all checks passed" : `${fail} FAILED`);
}
