/**
 * ============================================================================
 *  THE TRICK: grow until the window is GOOD ENOUGH, then shrink to the minimum
 * ============================================================================
 *
 *  Mirror image of the distinct-window trick. There the window grew until it went
 *  bad and you shrank to fix it; here the window grows until it MEETS a target
 *  (sum >= target), and then you shrink as far as you can while it still meets
 *  the target — chasing the SMALLEST window that qualifies. Each item enters once
 *  and leaves once -> O(n).
 *
 *  The 4 things:
 *    1. right grows the window, adding to a running `sum`.
 *    2. shrink with a WHILE, not an if   -> keep dropping from the left while sum >= target.
 *    3. record the min length INSIDE the shrink loop -> the tightest qualifying window.
 *    4. return 0 (not Infinity) if nothing ever qualified -> the "no answer" contract.
 *
 *  ASSUMES non-negative numbers. With negatives, adding an item can LOWER the sum,
 *  so "once we pass target, shrinking only lowers it" stops holding and the trick
 *  breaks — that's a prefix-sum + deque problem instead.
 *
 *  Two problems that look unrelated but use the SAME grow-then-minimize live here:
 *    A) Minimum Size Subarray Sum   — shortest run summing >= target  (LeetCode #209)
 *    B) Fewest transactions to clear — payments threshold             (fintech)
 *
 * ----------------------------------------------------------------------------
 *  A) MINIMUM SIZE SUBARRAY SUM  (LeetCode #209)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given an array of POSITIVE integers `nums` and a positive `target`, return
 *    the minimal length of a contiguous subarray whose sum is >= target. If none
 *    exists, return 0.
 *
 *  Examples:
 *    nums = [2,3,1,2,4,3], target = 7  -> 2   ([4,3])
 *    nums = [1,4,4],       target = 4  -> 1   ([4])
 *    nums = [1,1,1,1,1],   target = 11 -> 0   (whole array sums to 5 < 11)
 *
 *  Why shrink with a while (the subtle bit):
 *    After the window first reaches the target, a single `if` would peel off only
 *    one element and miss tighter windows. The `while` keeps removing from the left
 *    as long as the window STILL clears the target, so you record the genuinely
 *    smallest one. Capture the length inside that loop, just before each removal.
 *
 *  Complexity:
 *    Time  O(n) — right and left each sweep the array once.
 *    Space O(1).
 */
export function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let best = Infinity; // sentinel: "no qualifying window yet"

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]; // grow on the right
    while (sum >= target) {
      // while, not if: keep shrinking while it still clears target.
      // Record the tightest qualifying window before dropping the left item.
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }

  return best === Infinity ? 0 : best; // turn the sentinel into the "none" contract
}

/**
 * ----------------------------------------------------------------------------
 *  B) FEWEST TRANSACTIONS TO CLEAR A THRESHOLD  (the far-apart twin — fintech)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A ledger lists transaction amounts in time order. To refund at least
 *    `threshold` in money, what is the FEWEST number of consecutive transactions
 *    you can reverse to cover it? Return 0 if even reversing everything falls short.
 *
 *  Examples:
 *    amounts = [2,3,1,2,4,3], threshold = 7  -> 2   ([4,3])
 *    amounts = [5],           threshold = 5  -> 1
 *    amounts = [1,2],         threshold = 9  -> 0
 *
 *  Same grow-then-minimize, different domain:
 *    Identical skeleton to #209 — amounts are non-negative, so the monotonic-shrink
 *    guarantee holds and the same while-loop finds the shortest qualifying span.
 *
 *  Complexity:
 *    Time  O(n).   Space O(1).
 */
export function fewestTxToClear(amounts: number[], threshold: number): number {
  let left = 0;
  let sum = 0;
  let best = Infinity;

  for (let right = 0; right < amounts.length; right++) {
    sum += amounts[right];
    while (sum >= threshold) {
      best = Math.min(best, right - left + 1);
      sum -= amounts[left];
      left++;
    }
  }

  return best === Infinity ? 0 : best;
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

  // A) #209 Minimum Size Subarray Sum
  ck("min example -> 2", minSubArrayLen(7, [2, 3, 1, 2, 4, 3]) === 2);
  ck("min single hit -> 1", minSubArrayLen(4, [1, 4, 4]) === 1);
  ck("min unreachable -> 0", minSubArrayLen(11, [1, 1, 1, 1, 1]) === 0);
  ck("min whole array exact -> len", minSubArrayLen(15, [1, 2, 3, 4, 5]) === 5);
  ck("min empty -> 0", minSubArrayLen(5, []) === 0);
  ck("min single element clears -> 1", minSubArrayLen(3, [10]) === 1);
  ck("min target met exactly -> 2", minSubArrayLen(6, [3, 3, 3]) === 2);

  // B) fewest transactions to clear
  ck("tx example -> 2", fewestTxToClear([2, 3, 1, 2, 4, 3], 7) === 2);
  ck("tx single -> 1", fewestTxToClear([5], 5) === 1);
  ck("tx unreachable -> 0", fewestTxToClear([1, 2], 9) === 0);
  ck("tx empty -> 0", fewestTxToClear([], 1) === 0);

  console.log(
    fail === 0
      ? "techniques/two-pointers/sliding-window/shrink-to-target: all checks passed"
      : `${fail} FAILED`,
  );
}
