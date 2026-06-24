/**
 * ============================================================================
 *  THE TRICK: keep a running total, remember the best you've seen
 * ============================================================================
 *
 *  Walk the list once. Hold two numbers: where you are now (a running total) and
 *  the best total seen so far. Add each step to the running total; if it beats the
 *  best, update the best. No need to store every intermediate value.
 *
 *  Two problems that look unrelated but use the SAME trick live here:
 *    A) Find the Highest Altitude — peak of a running sum     (LeetCode #1732)
 *    B) Peak concurrent connections — busiest moment           (made-up twin)
 *
 * ----------------------------------------------------------------------------
 *  A) FIND THE HIGHEST ALTITUDE  (LeetCode #1732)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A biker starts at point 0 with altitude 0. `gain[i]` is the altitude change
 *    between point i and point i+1. Return the highest altitude of any point.
 *
 *  Examples:
 *    gain = [-5,1,5,0,-7]        -> 1   (altitudes: 0,-5,-4,1,1,-6)
 *    gain = [-4,-3,-2,-1,4,3,2]  -> 0   (altitudes peak at the start, 0)
 *
 *  Approach — running total + best-so-far:
 *    altitude starts at 0. Add each gain to it. Track the max altitude seen.
 *
 *  Why `maxAltitude` starts at 0 (the subtle bit):
 *    Point 0 is a real point at altitude 0. If every gain is negative, the highest
 *    altitude is the START itself (0), so seeding the max at 0 handles that for free
 *    (see example 2).
 *
 *  Complexity:
 *    Time  O(n) — one pass.
 *    Space O(1) — two numbers, no array of prefix sums.
 */
export function largestAltitude(gain: number[]): number {
  let altitude = 0; // where we are now (running total)
  let maxAltitude = 0; // best (highest) altitude seen — seeded at the start point, 0

  for (const g of gain) {
    altitude += g;
    maxAltitude = Math.max(maxAltitude, altitude);
  }

  return maxAltitude;
}

/**
 * ----------------------------------------------------------------------------
 *  B) PEAK CONCURRENT CONNECTIONS  (the far-apart twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A server processes connection events in order: +1 when a client connects,
 *    -1 when one disconnects. Return the most clients connected at the same time.
 *
 *  Examples:
 *    [1,1,-1,-1]      -> 2   (two connect, then both leave)
 *    [1,1,1,-1,-1,1]  -> 3   (peaks at 3 before anyone leaves)
 *    [-1,-1]          -> 0   (never above zero)
 *
 *  Same trick as the altitude problem:
 *    `current` is the running total (clients connected right now); `peak` is the
 *    best (highest) value seen. Add each delta, update the peak. Seed peak at 0
 *    because "nobody connected" is a valid floor.
 *
 *  Complexity:
 *    Time  O(n) — one pass.
 *    Space O(1).
 */
export function peakConcurrency(events: readonly number[]): number {
  let current = 0; // clients connected right now (running total)
  let peak = 0; // busiest it has ever been (best so far)

  for (const delta of events) {
    current += delta;
    peak = Math.max(peak, current);
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

  ck("altitude ex1 -> 1", largestAltitude([-5, 1, 5, 0, -7]) === 1);
  ck("altitude ex2 -> 0", largestAltitude([-4, -3, -2, -1, 4, 3, 2]) === 0);
  ck("altitude all down -> 0", largestAltitude([-1, -2, -3]) === 0);
  ck("altitude all up -> 6", largestAltitude([1, 2, 3]) === 6);
  ck("altitude peak mid -> 10", largestAltitude([10, -5, -100]) === 10);

  ck("concurrency -> 2", peakConcurrency([1, 1, -1, -1]) === 2);
  ck("concurrency -> 3", peakConcurrency([1, 1, 1, -1, -1, 1]) === 3);
  ck("concurrency never positive -> 0", peakConcurrency([-1, -1]) === 0);
  ck("concurrency empty -> 0", peakConcurrency([]) === 0);

  console.log(fail === 0 ? "techniques/prefix-sum/highest-altitude: all checks passed" : `${fail} FAILED`);
}
