/**
 * ============================================================================
 *  THE TRICK: 1-D DP — each position's answer from the last one or two
 * ============================================================================
 *
 *  dp[i] depends on a fixed few earlier states, so fill a table (or two rolling
 *  variables) once, bottom-up, instead of recomputing overlapping subproblems
 *  exponentially. O(n) time, O(1) space.
 *
 *  Two problems on the SAME 1-D shape:
 *    A) Min Cost Climbing Stairs — min cost  : dp[i] = cost[i] + min(dp[i-1], dp[i-2])  (#746)
 *    B) Climbing Stairs          — count ways : dp[i] = dp[i-1] + dp[i-2]  (Fibonacci)   (#70)
 *
 * ----------------------------------------------------------------------------
 *  A) MIN COST CLIMBING STAIRS  (LeetCode #746)
 * ----------------------------------------------------------------------------
 *  cost[i] = cost of stepping on stair i. Start at stair 0 or 1; each move climbs
 *  1 or 2 stairs. The "top" is just past the last stair. Return the min cost.
 *
 *  Examples:
 *    [10,15,20]                  -> 15
 *    [1,100,1,1,1,100,1,1,100,1] -> 6
 *    [0,0]                       -> 0
 *
 *  dp[i] = cost to REACH stair i = cost[i] + min(dp[i-1], dp[i-2]); base dp[0],dp[1].
 *  Top is index n → answer = min(dp[n-1], dp[n-2]).
 *
 *  Complexity: O(n) time, O(1) space.
 */
export function minCostClimbingStairs(cost: number[]): number {
  const n = cost.length;
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 0; // already past the (single) stair with no forced step
  }

  let a = cost[0]; // dp[i-2]
  let b = cost[1]; // dp[i-1]
  for (let i = 2; i < n; i++) {
    const cur = cost[i] + Math.min(a, b);
    a = b; // shift forward in order
    b = cur;
  }

  return Math.min(a, b); // top reachable from either of the last two stairs
}

/**
 * ----------------------------------------------------------------------------
 *  B) CLIMBING STAIRS  (LeetCode #70 — the count-ways twin)
 * ----------------------------------------------------------------------------
 *  Climb 1 or 2 steps at a time; how many distinct ways to reach step n?
 *
 *  Examples:  n=2 -> 2 ; n=3 -> 3 ; n=5 -> 8   (Fibonacci)
 *
 *  ways[i] = ways[i-1] + ways[i-2]; ways[0]=ways[1]=1. Same 1-D recurrence, sum
 *  instead of min — no costs, just counting.
 *
 *  Complexity: O(n) time, O(1) space.
 */
export function climbStairs(n: number): number {
  let a = 1; // ways to reach step 0 (and the base for step 1)
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const cur = a + b;
    a = b;
    b = cur;
  }
  return b;
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

  ck("minCost [10,15,20] -> 15", minCostClimbingStairs([10, 15, 20]) === 15);
  ck("minCost long example -> 6", minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]) === 6);
  ck("minCost [0,0] -> 0", minCostClimbingStairs([0, 0]) === 0);
  ck("minCost two -> min", minCostClimbingStairs([5, 3]) === 3);

  ck("climbStairs 2 -> 2", climbStairs(2) === 2);
  ck("climbStairs 3 -> 3", climbStairs(3) === 3);
  ck("climbStairs 5 -> 8", climbStairs(5) === 8);
  ck("climbStairs 1 -> 1", climbStairs(1) === 1);

  console.log(
    fail === 0 ? "paradigms/dynamic-programming/climbing-stairs: all checks passed" : `${fail} FAILED`,
  );
}
