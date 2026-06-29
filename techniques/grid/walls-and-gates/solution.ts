/**
 * ============================================================================
 *  THE TRICK: multi-source BFS from every gate fills nearest-gate distances
 * ============================================================================
 *
 *  Instead of searching from each room to its nearest gate, BFS outward from ALL
 *  gates at once. BFS expands in equal-distance rings, so the FIRST time the wave
 *  reaches a room is along a shortest path from the closest gate — write the
 *  distance then, once. Filling only still-INF rooms makes "first visit wins" and
 *  stops re-queueing. O(R*C).
 *
 *  A) Walls and Gates  (LeetCode #286)
 *
 *  Note: fills the grid in place (and returns it for convenience).
 */

const INF = 2147483647; // 2^31 - 1, the "empty room" marker in #286

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * ----------------------------------------------------------------------------
 *  A) WALLS AND GATES  (LeetCode #286)
 * ----------------------------------------------------------------------------
 *  grid: -1 = wall, 0 = gate, INF (2^31-1) = empty room. Fill each room with the
 *  distance to its nearest gate; unreachable rooms stay INF.
 *
 *  Example:
 *    in:  [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]
 *    out: [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]
 *
 *  Complexity: O(R*C) time and space.
 */
export function wallsAndGates(grid: number[][]): number[][] {
  const R = grid.length;
  if (R === 0) {
    return grid;
  }
  const C = grid[0].length;

  // Seed every gate.
  let queue: Array<[number, number]> = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0) {
        queue.push([r, c]);
      }
    }
  }

  while (queue.length > 0) {
    const next: Array<[number, number]> = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) {
          continue; // bounds
        }
        if (grid[nr][nc] === INF) {
          // only unfilled rooms — first visit is the shortest
          grid[nr][nc] = grid[r][c] + 1;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
  }

  return grid;
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

  const out = wallsAndGates([
    [INF, -1, 0, INF],
    [INF, INF, INF, -1],
    [INF, -1, INF, -1],
    [0, -1, INF, INF],
  ]);
  ck(
    "walls example filled",
    eq(out, [
      [3, -1, 0, 1],
      [2, 2, 1, -1],
      [1, -1, 2, -1],
      [0, -1, 3, 4],
    ]),
  );

  ck("walls no gate stays INF", eq(wallsAndGates([[INF, INF], [INF, -1]]), [[INF, INF], [INF, -1]]));
  ck("walls single gate", eq(wallsAndGates([[0, INF], [INF, INF]]), [[0, 1], [1, 2]]));
  ck("walls all walls untouched", eq(wallsAndGates([[-1, -1], [-1, -1]]), [[-1, -1], [-1, -1]]));

  console.log(fail === 0 ? "techniques/grid/walls-and-gates: all checks passed" : `${fail} FAILED`);
}
