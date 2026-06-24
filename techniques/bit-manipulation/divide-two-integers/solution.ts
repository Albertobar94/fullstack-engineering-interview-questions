/**
 * ============================================================================
 *  THE TRICK: build the answer by DOUBLING (binary long division)
 * ============================================================================
 *
 *  You can't loop one step at a time when the answer can be ~2 billion. Instead,
 *  grow your step by doubling (b, 2b, 4b, 8b, ...), grab the biggest chunk that
 *  still fits, subtract it, and credit the matching power of two. The quotient
 *  assembles itself as a sum of powers of two (14 = 8 + 4 + 2).
 *
 *  Two problems that look unrelated but share the SAME "double until it would
 *  overshoot, then commit" mechanic live here:
 *    A) Divide Two Integers     — divide with no * / %       (LeetCode #29)
 *    B) Exponential search      — find a bound in a huge sorted source (twin)
 *
 * ----------------------------------------------------------------------------
 *  A) DIVIDE TWO INTEGERS  (LeetCode #29)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Divide `dividend` by `divisor` without using *, /, or %. Truncate toward
 *    zero. Clamp to the 32-bit signed range [-2^31, 2^31 - 1]: if the quotient
 *    would exceed 2^31 - 1 return 2^31 - 1; if below -2^31 return -2^31.
 *
 *  Examples:
 *    divide(10, 3)  ->  3   (10/3 = 3.33 -> 3)
 *    divide(7, -3)  -> -2   (truncates toward zero)
 *    divide(-2147483648, -1) -> 2147483647  (the one overflow case, clamped)
 *
 *  Approach — subtract the biggest doubled chunk:
 *    while a >= b:
 *      double `temp` (= b, 2b, 4b, ...) while a >= temp+temp
 *      subtract that chunk from a, add its worth (1, 2, 4, ...) to the result
 *
 *  Complexity:
 *    Time  O(log^2 n) — ~log chunks, each found in ~log doublings; for 32-bit
 *          inputs that's ~32*32, effectively constant.
 *    Space O(1).
 *
 *  ⚠️ WHY WE DOUBLE WITH `+`, NOT `<<` (the 32-bit trap):
 *    In JS, `<<` coerces operands to 32-bit SIGNED ints. Once `temp` reaches 2^30,
 *    `temp << 1` leaves the signed range, and two more shifts drive temp to 0
 *    (2^30 -> -2^31 -> 0). From then on `0 << 1` stays 0, so `a >= (temp << 1)` is
 *    true forever and the inner loop never exits. The original submission used
 *    `temp <<= 1` and INFINITE-LOOPS on inputs like divide(2147483646, 2) and
 *    divide(INT_MIN, 1).
 *    Buggy version, for reference (do NOT use):
 *
 *      // while (a >= (temp << 1)) { temp <<= 1; multiple <<= 1; }   // 32-bit overflow!
 *
 *    JS numbers are 64-bit floats (exact up to 2^53), so `temp += temp` is safe
 *    well past 2^31. Same idea, same speed, correct for the full range.
 */
export function divide(dividend: number, divisor: number): number {
  const INT_MAX = 2147483647; // 2^31 - 1
  const INT_MIN = -2147483648; // -2^31

  // The only quotient that doesn't fit the 32-bit range.
  if (dividend === INT_MIN && divisor === -1) {
    return INT_MAX;
  }

  const negative = dividend < 0 !== divisor < 0;
  let a = Math.abs(dividend);
  const b = Math.abs(divisor);
  let result = 0;

  while (a >= b) {
    let temp = b; // current chunk = b * 2^k
    let multiple = 1; // ...worth this many divisors (2^k)

    // Double the chunk while doing so still fits under what's left.
    // `temp + temp` (not `temp << 1`) avoids JS's 32-bit shift overflow.
    while (a >= temp + temp) {
      temp += temp;
      multiple += multiple;
    }

    a -= temp; // take the biggest chunk
    result += multiple; // bank its worth
  }

  return negative ? -result : result;
}

/**
 * ----------------------------------------------------------------------------
 *  B) EXPONENTIAL ("GALLOPING") SEARCH  (the far-apart twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given a sorted source that may be enormous or whose length you don't want to
 *    scan (a paginated API, a huge sorted file), find the index of the FIRST
 *    element that is >= `target`, or -1 if none. Do it without a linear scan.
 *
 *  Examples (sorted = [1,3,5,7,9,11,13,15,17,19]):
 *    target 7  -> 3   (value 7 sits at index 3)
 *    target 8  -> 4   (first value >= 8 is 9, at index 4)
 *    target 20 -> -1  (nothing is >= 20)
 *
 *  Same trick as divide():
 *    Step 1 — DOUBLE the probe index (`bound += bound`, exactly divide()'s move)
 *             until the value there overshoots the target (or you run off the end).
 *    Step 2 — you now have a bracket [bound/2, bound]; binary-search inside it.
 *    This finds the answer in O(log i) probes, where i is the answer's index —
 *    without ever needing the total length.
 *
 *  Complexity:
 *    Time  O(log i) — doubling phase + binary search are each O(log i).
 *    Space O(1).
 */
export function firstIndexAtLeast(sorted: readonly number[], target: number): number {
  const n = sorted.length;
  if (n === 0) {
    return -1;
  }

  // Step 1: gallop — double the bound until we pass the target or the end.
  let bound = 1;
  while (bound < n && sorted[bound] < target) {
    bound += bound; // doubling — the same move as divide()'s inner loop
  }

  // Step 2: binary search the bracket we just pinned down.
  let lo = Math.floor(bound / 2);
  let hi = Math.min(bound, n - 1);
  let answer = -1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (sorted[mid] >= target) {
      answer = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
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

  ck("divide(10,3)=3", divide(10, 3) === 3);
  ck("divide(7,-3)=-2", divide(7, -3) === -2);
  ck("divide(INT_MIN,-1)=INT_MAX", divide(-2147483648, -1) === 2147483647);
  ck("divide(INT_MIN,1)=INT_MIN", divide(-2147483648, 1) === -2147483648);
  ck("divide(INT_MIN,2)", divide(-2147483648, 2) === -1073741824);
  ck("divide(2147483646,2)", divide(2147483646, 2) === 1073741823);
  ck("divide(2147483647,1)", divide(2147483647, 1) === 2147483647);
  ck("divide(0,5)=0", divide(0, 5) === 0);
  ck("divide(-7,3)=-2", divide(-7, 3) === -2);

  const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  ck("exp find 7 -> 3", firstIndexAtLeast(arr, 7) === 3);
  ck("exp find 8 -> 4", firstIndexAtLeast(arr, 8) === 4);
  ck("exp find 1 -> 0", firstIndexAtLeast(arr, 1) === 0);
  ck("exp find 19 -> 9", firstIndexAtLeast(arr, 19) === 9);
  ck("exp find 20 -> -1", firstIndexAtLeast(arr, 20) === -1);
  ck("exp empty -> -1", firstIndexAtLeast([], 5) === -1);

  console.log(fail === 0 ? "techniques/bit-manipulation/divide-two-integers: all checks passed" : `${fail} FAILED`);
}
