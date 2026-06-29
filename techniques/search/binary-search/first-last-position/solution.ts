/**
 * ============================================================================
 *  THE TRICK: two boundary binary searches for a repeated value's range
 * ============================================================================
 *
 *  Finding A match is easy; finding the EDGE of a run of equal values needs the
 *  boundary tweak: on a match, keep halving toward the edge instead of stopping.
 *  The clean primitive is LOWER BOUND — the first index whose value is >= x —
 *  over a half-open window [lo, hi). With it:
 *    first occurrence = lowerBound(target)
 *    last  occurrence = lowerBound(target + 1) - 1
 *  Two O(log n) bound searches stay O(log n) even when the run is the whole array
 *  (scanning outward from a match would be O(n)).
 *
 *  Two problems on the SAME primitive:
 *    A) Find First and Last Position — the value's range   (LeetCode #34)
 *    B) Search Insert Position       — lowerBound alone     (LeetCode #35)
 *
 * ----------------------------------------------------------------------------
 *  THE PRIMITIVE: lowerBound  (a.k.a. C++ lower_bound / Python bisect_left)
 * ----------------------------------------------------------------------------
 *  Smallest index i with nums[i] >= x, or nums.length if every value is < x.
 *
 *  The bug-prone bits (half-open [lo, hi)):
 *    - hi starts at LENGTH (one past the end), not length - 1;
 *    - loop while lo < hi (NOT <=) — the window empties at lo === hi;
 *    - on the else branch hi = mid (NOT mid - 1) — mid might BE the boundary.
 *
 *  Complexity: O(log n) time, O(1) space.
 */
export function lowerBound(nums: number[], x: number): number {
  let lo = 0;
  let hi = nums.length; // half-open: [lo, hi)

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // round down, overflow-safe
    if (nums[mid] < x) {
      lo = mid + 1; // mid too small → answer strictly right
    } else {
      hi = mid; // mid might be the boundary → keep it in range
    }
  }

  return lo; // first index whose value is >= x
}

/**
 * ----------------------------------------------------------------------------
 *  A) FIND FIRST AND LAST POSITION  (LeetCode #34)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Sorted array, possibly with duplicates. Return [first, last] index of
 *    `target`, or [-1, -1] if absent. Must be O(log n).
 *
 *  Examples:
 *    [5,7,7,8,8,10], target 8  -> [3,4]
 *    [5,7,7,8,8,10], target 6  -> [-1,-1]
 *    [],             target 0  -> [-1,-1]
 *
 *  Why check nums[first] === target: lowerBound(target) returns where target
 *  WOULD start; it can land on a bigger value or off the end if target is absent.
 *
 *  Complexity: O(log n) time, O(1) space.
 */
export function searchRange(nums: number[], target: number): [number, number] {
  const first = lowerBound(nums, target);
  if (first === nums.length || nums[first] !== target) {
    return [-1, -1]; // landed off the end or on a bigger value → absent
  }
  const last = lowerBound(nums, target + 1) - 1; // one before the first index > target
  return [first, last];
}

/**
 * ----------------------------------------------------------------------------
 *  B) SEARCH INSERT POSITION  (LeetCode #35 — the primitive, used raw)
 * ----------------------------------------------------------------------------
 *  Where `target` would be inserted to keep the array sorted = lowerBound(target).
 *
 *  Examples:
 *    [1,3,5,6], 5 -> 2     [1,3,5,6], 2 -> 1     [1,3,5,6], 7 -> 4
 */
export function searchInsert(nums: number[], target: number): number {
  return lowerBound(nums, target);
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
  const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

  ck("range 8 -> [3,4]", eq(searchRange([5, 7, 7, 8, 8, 10], 8), [3, 4]));
  ck("range 7 -> [1,2]", eq(searchRange([5, 7, 7, 8, 8, 10], 7), [1, 2]));
  ck("range 6 -> [-1,-1]", eq(searchRange([5, 7, 7, 8, 8, 10], 6), [-1, -1]));
  ck("range empty -> [-1,-1]", eq(searchRange([], 0), [-1, -1]));
  ck("range single hit -> [0,0]", eq(searchRange([8], 8), [0, 0]));
  ck("range all same -> [0,4]", eq(searchRange([8, 8, 8, 8, 8], 8), [0, 4]));
  ck("range first elem -> [0,1]", eq(searchRange([2, 2, 3], 2), [0, 1]));
  ck("range last elem -> [2,2]", eq(searchRange([1, 2, 3], 3), [2, 2]));

  ck("insert 5 -> 2", searchInsert([1, 3, 5, 6], 5) === 2);
  ck("insert 2 -> 1", searchInsert([1, 3, 5, 6], 2) === 1);
  ck("insert 7 -> 4", searchInsert([1, 3, 5, 6], 7) === 4);
  ck("insert 0 -> 0", searchInsert([1, 3, 5, 6], 0) === 0);

  console.log(
    fail === 0 ? "techniques/search/binary-search/first-last-position: all checks passed" : `${fail} FAILED`,
  );
}
