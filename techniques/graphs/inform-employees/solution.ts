/**
 * ============================================================================
 *  THE TRICK: DFS an org tree for the LONGEST weighted root-to-leaf path
 * ============================================================================
 *
 *  Each employee has one manager → the company is a tree rooted at the head. A
 *  manager informs all direct reports in one informTime window (in parallel), so
 *  the whole company is informed when the SLOWEST chain finishes: the max, over
 *  root-to-leaf paths, of summed inform-times. DFS: a node returns
 *  informTime[node] + max(child results). A leaf returns informTime (0). O(n).
 *
 *  A) Time Needed to Inform All Employees  (LeetCode #1376)
 */

/**
 * ----------------------------------------------------------------------------
 *  A) TIME NEEDED TO INFORM ALL EMPLOYEES  (LeetCode #1376)
 * ----------------------------------------------------------------------------
 *  n employees 0..n-1. manager[i] = i's manager (-1 for the head). informTime[i] =
 *  minutes for i to inform its direct subordinates. Return minutes until all know.
 *
 *  Examples:
 *    n=1, head=0, manager=[-1], informTime=[0] -> 0
 *    n=6, head=2, manager=[2,2,-1,2,2,2], informTime=[0,0,1,0,0,0] -> 1
 *    n=7, head=6, manager=[1,2,3,4,5,6,-1], informTime=[0,6,5,4,3,2,1] -> 21
 *
 *  Complexity: O(n) time and space.
 */
export function numOfMinutes(
  n: number,
  headID: number,
  manager: number[],
  informTime: number[],
): number {
  const children: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    if (manager[i] !== -1) {
      children[manager[i]].push(i); // invert parent array → children
    }
  }

  const dfs = (node: number): number => {
    let worst = 0;
    for (const child of children[node]) {
      worst = Math.max(worst, dfs(child)); // slowest subtree (parallel), not sum
    }
    return informTime[node] + worst;
  };

  return dfs(headID);
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

  ck("inform single -> 0", numOfMinutes(1, 0, [-1], [0]) === 0);
  ck("inform flat head -> 1", numOfMinutes(6, 2, [2, 2, -1, 2, 2, 2], [0, 0, 1, 0, 0, 0]) === 1);
  ck("inform deep chain -> 21", numOfMinutes(7, 6, [1, 2, 3, 4, 5, 6, -1], [0, 6, 5, 4, 3, 2, 1]) === 21);
  // two branches, slower one (1→3 = 5+10) gates over the faster (2 = 5)
  ck(
    "inform max branch -> 15",
    numOfMinutes(4, 0, [-1, 0, 0, 1], [5, 10, 1, 0]) === 15,
  );

  console.log(
    fail === 0 ? "techniques/graphs/inform-employees: all checks passed" : `${fail} FAILED`,
  );
}
