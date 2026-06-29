/**
 * ============================================================================
 *  THE TRICK: BFS (queue, by hops) and DFS (stack, deep) with a visited guard
 * ============================================================================
 *
 *  Build an adjacency list, then walk it. BFS expands in equal-hop rings (fewest
 *  hops on an unweighted graph); DFS dives deep (reachability, components). Both
 *  mark nodes visited so a cycle can't loop forever. O(V + E).
 *
 *  Two base problems:
 *    A) Find if Path Exists      — BFS reachability        (LeetCode #1971)
 *    B) Connected Components     — DFS over the whole graph (LeetCode #323)
 */

function buildAdj(n: number, edges: number[][], undirected = true): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    if (undirected) {
      adj[v].push(u); // undirected → both directions
    }
  }
  return adj;
}

/**
 * ----------------------------------------------------------------------------
 *  A) FIND IF PATH EXISTS  (LeetCode #1971) — BFS
 * ----------------------------------------------------------------------------
 *  n nodes (0..n-1), undirected edges. Is there a path from source to dest?
 *
 *  Examples:
 *    n=3, [[0,1],[1,2],[2,0]], 0→2 -> true
 *    n=6, [[0,1],[0,2],[3,5],[5,4],[4,3]], 0→5 -> false
 *
 *  Bug-prone: mark visited on ENQUEUE (not dequeue) so a node isn't queued twice.
 *
 *  Complexity: O(V + E).
 */
export function validPath(n: number, edges: number[][], source: number, destination: number): boolean {
  if (source === destination) {
    return true;
  }
  const adj = buildAdj(n, edges);
  const visited = new Array(n).fill(false);
  const queue: number[] = [source];
  visited[source] = true;

  let head = 0; // index pointer instead of O(n) shift()
  while (head < queue.length) {
    const u = queue[head++];
    for (const v of adj[u]) {
      if (v === destination) {
        return true;
      }
      if (!visited[v]) {
        visited[v] = true; // mark on enqueue
        queue.push(v);
      }
    }
  }
  return false;
}

/**
 * ----------------------------------------------------------------------------
 *  B) NUMBER OF CONNECTED COMPONENTS  (LeetCode #323) — DFS
 * ----------------------------------------------------------------------------
 *  n nodes, undirected edges. How many connected components?
 *
 *  Examples:
 *    n=5, [[0,1],[1,2],[3,4]] -> 2
 *    n=5, [[0,1],[1,2],[2,3],[3,4]] -> 1
 *
 *  Start a DFS from every unvisited node; each start is a new component.
 *
 *  Complexity: O(V + E).
 */
export function countComponents(n: number, edges: number[][]): number {
  const adj = buildAdj(n, edges);
  const visited = new Array(n).fill(false);

  const dfs = (u: number): void => {
    visited[u] = true; // mark on entry
    for (const v of adj[u]) {
      if (!visited[v]) {
        dfs(v);
      }
    }
  };

  let comps = 0;
  for (let s = 0; s < n; s++) {
    if (!visited[s]) {
      comps++; // a new component
      dfs(s);
    }
  }
  return comps;
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

  ck("path triangle 0->2 true", validPath(3, [[0, 1], [1, 2], [2, 0]], 0, 2) === true);
  ck("path disconnected 0->5 false", validPath(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5) === false);
  ck("path same node true", validPath(1, [], 0, 0) === true);
  ck("path direct edge", validPath(2, [[0, 1]], 0, 1) === true);

  ck("components two -> 2", countComponents(5, [[0, 1], [1, 2], [3, 4]]) === 2);
  ck("components one chain -> 1", countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]]) === 1);
  ck("components all isolated -> 4", countComponents(4, []) === 4);

  console.log(fail === 0 ? "techniques/graphs/bfs-dfs: all checks passed" : `${fail} FAILED`);
}
