/**
 * ============================================================================
 *  THE TRICK: multi-source BFS — seed ALL sources, the answer is the layer count
 * ============================================================================
 *
 *  Rot spreads from EVERY rotten orange at once, one ring per minute. So put all
 *  rotten cells in the queue BEFORE looping, then BFS in layers: each round every
 *  rotten cell infects fresh neighbours (the next layer). One layer = one minute.
 *  When the queue drains, leftover fresh were unreachable -> -1. O(R*C).
 *
 *  A) Rotting Oranges  (LeetCode #994)
 *
 *  Note: mutates the grid (marks infected cells rotten). Clone first to preserve.
 */

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * ----------------------------------------------------------------------------
 *  A) ROTTING ORANGES  (LeetCode #994)
 * ----------------------------------------------------------------------------
 *  grid: 0 = empty, 1 = fresh, 2 = rotten. Each minute, a rotten orange rots its
 *  4-adjacent fresh ones. Return minutes until none are fresh, or -1 if some can
 *  never rot.
 *
 *  Examples:
 *    [[2,1,1],[1,1,0],[0,1,1]] -> 4
 *    [[2,1,1],[0,1,1],[1,0,1]] -> -1   (bottom-left fresh is unreachable)
 *    [[0,2]]                   -> 0    (no fresh to begin with)
 *
 *  Complexity: O(R*C) time and space.
 */
export function orangesRotting(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0]?.length ?? 0;

  let queue: Array<[number, number]> = [];
  let fresh = 0;

  // Seed ALL rotten sources; count fresh.
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 2) {
        queue.push([r, c]);
      } else if (grid[r][c] === 1) {
        fresh++;
      }
    }
  }

  let minutes = 0;
  while (queue.length > 0 && fresh > 0) {
    const next: Array<[number, number]> = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) {
          continue; // bounds
        }
        if (grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // infect now → not infected twice
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++; // this layer infected something → a minute passed
  }

  return fresh === 0 ? minutes : -1;
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

  ck("rot example -> 4", orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) === 4);
  ck("rot unreachable -> -1", orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]) === -1);
  ck("rot no fresh -> 0", orangesRotting([[0, 2]]) === 0);
  ck("rot all empty -> 0", orangesRotting([[0, 0], [0, 0]]) === 0);
  ck("rot single fresh no source -> -1", orangesRotting([[1]]) === -1);
  ck("rot already all rotten -> 0", orangesRotting([[2, 2], [2, 2]]) === 0);
  ck("rot line -> 2", orangesRotting([[2, 1, 1]]) === 2);

  console.log(fail === 0 ? "techniques/grid/rotting-oranges: all checks passed" : `${fail} FAILED`);
}
