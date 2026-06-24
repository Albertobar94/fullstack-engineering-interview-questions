/**
 * ============================================================================
 *  THE TRICK: a window of FIXED width k — slide it, don't rebuild it
 * ============================================================================
 *
 *  You want the best (max/min/avg/sum) over every block of exactly k items in a
 *  row. The naive way re-adds all k numbers at each position -> O(n*k). Instead
 *  keep a running `sum` for the current block: to move one step right, ADD the
 *  number entering on the right and SUBTRACT the one leaving on the left. One add,
 *  one subtract per step -> O(n). The window never changes size.
 *
 *  The 4 things:
 *    1. Seed the FIRST window before the loop  -> sum of nums[0..k-1].
 *    2. Slide: sum += nums[i]; sum -= nums[i-k] -> add the entrant, drop the leaver.
 *    3. The window is only "full" once i >= k-1 -> don't read an answer too early.
 *    4. Fixed width = no inner loop                -> that's the whole O(n) win.
 *
 *  Two problems that look unrelated but use the SAME fixed slide live here:
 *    A) Max Average Subarray I  — best average of k in a row   (LeetCode #643)
 *    B) Peak bytes in a window  — busiest run of N log lines   (observability)
 *
 * ----------------------------------------------------------------------------
 *  A) MAX AVERAGE SUBARRAY I  (LeetCode #643)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given an integer array `nums` and an integer `k`, find the contiguous
 *    subarray of length exactly `k` with the largest average, and return that
 *    average. (1 <= k <= nums.length.)
 *
 *  Examples:
 *    nums = [1,12,-5,-6,50,3], k = 4  -> 12.75   (window [12,-5,-6,50] = 51, /4)
 *    nums = [5], k = 1                -> 5
 *
 *  Why slide instead of recompute:
 *    Re-summing k numbers at every start position is O(n*k) — for a long array
 *    with a big k that's the loop-in-a-loop trap. Carrying one running sum and
 *    swapping the entrant for the leaver turns each step into O(1), so the whole
 *    pass is O(n). Track the best SUM and divide once at the end — dividing every
 *    step just adds floating-point noise.
 *
 *  Complexity:
 *    Time  O(n) — one pass, O(1) work per step.
 *    Space O(1).
 */
export function findMaxAverage(nums: number[], k: number): number {
  if (k <= 0 || k > nums.length) {
    throw new Error("k must be between 1 and nums.length.");
  }

  // Seed the first window [0..k-1] with reduce — one clear expression, O(k).
  let windowSum = nums.slice(0, k).reduce((sum, n) => sum + n, 0);

  let bestSum = windowSum;
  for (let i = k; i < nums.length; i++) {
    // The slide stays explicit: add entrant, drop leaver in O(1). Collapsing this into a
    // per-window reduce would make it O(n*k) — the slide IS the trick.
    windowSum += nums[i] - nums[i - k];
    bestSum = Math.max(bestSum, windowSum);
  }

  return bestSum / k; // divide once at the end, not every step
}

/**
 * ----------------------------------------------------------------------------
 *  B) PEAK BYTES IN A WINDOW  (the far-apart twin — observability)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A log stream records the byte size of each line. To size a buffer you want
 *    the heaviest run of `windowSize` consecutive lines — the largest total bytes
 *    over any fixed-length window. Return that peak total (0 if there isn't a full
 *    window's worth of lines).
 *
 *  Examples:
 *    bytes = [10, 200, 5, 5, 300], windowSize = 2  -> 305  (the [5,300] tail)
 *    bytes = [10, 200, 5, 5, 300], windowSize = 5  -> 520  (everything)
 *
 *  Same fixed slide, different question:
 *    Identical skeleton to #643 — seed the first window, then add-entrant /
 *    drop-leaver — but we keep the running TOTAL (no divide) and bail out cleanly
 *    when the stream is shorter than one window.
 *
 *  Complexity:
 *    Time  O(n).   Space O(1).
 */
export function peakBytesInWindow(bytes: number[], windowSize: number): number {
  if (windowSize <= 0 || windowSize > bytes.length) {
    return 0; // not enough lines for a single full window
  }

  let windowSum = bytes.slice(0, windowSize).reduce((sum, n) => sum + n, 0);

  let peak = windowSum;
  for (let i = windowSize; i < bytes.length; i++) {
    windowSum += bytes[i] - bytes[i - windowSize]; // O(1) slide, same as #643
    peak = Math.max(peak, windowSum);
  }

  return peak;
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

  // A) #643 Max Average Subarray I
  ck("avg example -> 12.75", findMaxAverage([1, 12, -5, -6, 50, 3], 4) === 12.75);
  ck("avg single -> 5", findMaxAverage([5], 1) === 5);
  ck("avg k=1 picks max -> 50", findMaxAverage([1, 12, -5, -6, 50, 3], 1) === 50);
  ck("avg k=len -> mean", findMaxAverage([1, 2, 3, 4], 4) === 2.5);
  ck("avg all same -> that value", findMaxAverage([-3, -3, -3], 2) === -3);
  ck("avg all negative -> least negative window", findMaxAverage([-1, -5, -2], 2) === -3);

  // B) peak bytes in a window
  ck("bytes window=2 -> 305", peakBytesInWindow([10, 200, 5, 5, 300], 2) === 305);
  ck("bytes window=5 -> 520", peakBytesInWindow([10, 200, 5, 5, 300], 5) === 520);
  ck("bytes window too big -> 0", peakBytesInWindow([1, 2], 3) === 0);
  ck("bytes empty -> 0", peakBytesInWindow([], 1) === 0);
  ck("bytes window=1 -> max single", peakBytesInWindow([10, 200, 5], 1) === 200);

  console.log(
    fail === 0 ? "two-pointers/sliding-window/fixed-size: all checks passed" : `${fail} FAILED`,
  );
}
