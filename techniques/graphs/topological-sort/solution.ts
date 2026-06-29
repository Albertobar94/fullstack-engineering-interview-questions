/**
 * ============================================================================
 *  THE TRICK: topological sort via Kahn's algorithm (peel in-degree-0 nodes)
 * ============================================================================
 *
 *  Compute each node's in-degree (how many prerequisites point at it). Take any
 *  node with in-degree 0 (nothing blocks it); removing it decrements its
 *  dependents' in-degrees; enqueue any that hit 0. If you take all n nodes you
 *  have a valid order; if you stall with nodes remaining, they form a CYCLE.
 *  O(V + E).
 *
 *  Two problems on the SAME peel:
 *    A) Course Schedule    — can you finish all? (cycle?)   (LeetCode #207)
 *    B) Course Schedule II — return an actual order, or []  (LeetCode #210)
 *
 *  Edge convention (#207/#210): prerequisites[i] = [course, prereq] means you
 *  must take `prereq` BEFORE `course` → edge prereq → course, indeg[course]++.
 */

function kahnOrder(numCourses: number, prerequisites: number[][]): number[] {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course); // prereq → dependent
    indeg[course]++; // the dependent gains a prerequisite
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (indeg[i] === 0) {
      queue.push(i); // seed all unblocked nodes
    }
  }

  const order: number[] = [];
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    order.push(u);
    for (const v of adj[u]) {
      indeg[v]--; // u satisfied one of v's prerequisites
      if (indeg[v] === 0) {
        queue.push(v);
      }
    }
  }

  return order; // length < numCourses ⇒ a cycle blocked the rest
}

/**
 *  A) COURSE SCHEDULE (#207) — feasible iff we managed to order every course.
 */
export function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  return kahnOrder(numCourses, prerequisites).length === numCourses;
}

/**
 *  B) COURSE SCHEDULE II (#210) — the order itself, or [] if a cycle makes it impossible.
 */
export function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const order = kahnOrder(numCourses, prerequisites);
  return order.length === numCourses ? order : [];
}

// --- helper: verify an order actually respects every prerequisite ---
function isValidOrder(order: number[], n: number, prerequisites: number[][]): boolean {
  if (order.length !== n) {
    return false;
  }
  const pos = new Array(n).fill(-1);
  order.forEach((node, i) => {
    pos[node] = i;
  });
  // every [course, prereq] must have prereq positioned before course
  return prerequisites.every(([course, prereq]) => pos[prereq] < pos[course]);
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

  ck("canFinish simple chain", canFinish(2, [[1, 0]]) === true);
  ck("canFinish cycle -> false", canFinish(2, [[1, 0], [0, 1]]) === false);
  ck("canFinish no prereqs", canFinish(3, []) === true);
  ck("canFinish 3-cycle -> false", canFinish(3, [[0, 1], [1, 2], [2, 0]]) === false);

  ck("findOrder cycle -> []", findOrder(2, [[1, 0], [0, 1]]).length === 0);
  ck("findOrder chain valid", isValidOrder(findOrder(4, [[1, 0], [2, 1], [3, 2]]), 4, [[1, 0], [2, 1], [3, 2]]));
  ck(
    "findOrder diamond valid",
    isValidOrder(findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), 4, [[1, 0], [2, 0], [3, 1], [3, 2]]),
  );
  ck("findOrder no prereqs length n", findOrder(3, []).length === 3);

  console.log(
    fail === 0 ? "techniques/graphs/topological-sort: all checks passed" : `${fail} FAILED`,
  );
}
