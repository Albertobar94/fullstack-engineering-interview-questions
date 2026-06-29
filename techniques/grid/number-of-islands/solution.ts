/**
 * ============================================================================
 *  THE TRICK: flood-fill each connected blob; count how many fills you start
 * ============================================================================
 *
 *  Scan every cell. On unvisited land, count +1 and flood-fill the WHOLE connected
 *  region away (DFS or BFS), marking each cell visited so it's never recounted.
 *  Because a fill erases an entire region, the next land found is a different
 *  island — so the number of fill-starts is the island count. O(R*C).
 *
 *  Two problems on the SAME flood-fill:
 *    A) Number of Islands — COUNT the regions       (LeetCode #200)
 *    B) Max Area of Island — SIZE of the biggest one (LeetCode #695)
 *
 *  Note: both mutate the grid (sink land to mark visited). Clone first if the
 *  caller needs the grid preserved.
 */

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * ----------------------------------------------------------------------------
 *  A) NUMBER OF ISLANDS  (LeetCode #200)
 * ----------------------------------------------------------------------------
 *  grid of '1' (land) / '0' (water). Count connected (4-directional) land regions.
 *
 *  Examples:
 *    [["1","1","0"],["1","0","0"],["0","0","1"]] -> 2
 *    all water -> 0 ; all land -> 1
 *
 *  Bug-prone: mark visited (sink to '0') the instant you enter a cell, or the
 *  recursion re-enters and loops; bounds-check before reading a neighbour.
 *
 *  Complexity: O(R*C) time, O(R*C) worst-case stack (one big blob).
 */
export function numIslands(grid: string[][]): number {
  const R = grid.length;
  if (R === 0) {
    return 0;
  }
  const C = grid[0].length;

  const sink = (r: number, c: number): void => {
    if (r < 0 || r >= R || c < 0 || c >= C) {
      return; // bounds first
    }
    if (grid[r][c] !== "1") {
      return; // water or already sunk
    }
    grid[r][c] = "0"; // mark visited immediately
    for (const [dr, dc] of DIRS) {
      sink(r + dr, c + dc);
    }
  };

  let count = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === "1") {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}

/**
 * ----------------------------------------------------------------------------
 *  B) MAX AREA OF ISLAND  (LeetCode #695 — the twin)
 * ----------------------------------------------------------------------------
 *  grid of 1/0 (numbers). Return the size of the largest connected land region.
 *
 *  Examples:
 *    [[0,1],[1,1]] -> 3 ; [[0,0],[0,0]] -> 0
 *
 *  Same fill, but it returns the cells it sank so we can track a running max.
 *
 *  Complexity: O(R*C).
 */
export function maxAreaOfIsland(grid: number[][]): number {
  const R = grid.length;
  if (R === 0) {
    return 0;
  }
  const C = grid[0].length;

  const fill = (r: number, c: number): number => {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) {
      return 0;
    }
    grid[r][c] = 0; // mark visited
    let area = 1;
    for (const [dr, dc] of DIRS) {
      area += fill(r + dr, c + dc);
    }
    return area;
  };

  let best = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) {
        best = Math.max(best, fill(r, c));
      }
    }
  }
  return best;
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
  const grid = (rows: string[]): string[][] => rows.map((row) => row.split(""));

  ck("islands example -> 2", numIslands(grid(["110", "100", "001"])) === 2);
  ck("islands one big -> 1", numIslands(grid(["111", "111"])) === 1);
  ck("islands all water -> 0", numIslands(grid(["000", "000"])) === 0);
  ck("islands checkerboard (diagonals don't connect) -> 8", numIslands(grid(["1010", "0101", "1010", "0101"])) === 8);
  ck("islands single land -> 1", numIslands(grid(["1"])) === 1);

  ck("maxArea L-shape -> 3", maxAreaOfIsland([[0, 1], [1, 1]]) === 3);
  ck("maxArea none -> 0", maxAreaOfIsland([[0, 0], [0, 0]]) === 0);
  ck(
    "maxArea two blobs -> 4",
    maxAreaOfIsland([
      [1, 1, 0, 1],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
    ]) === 4,
  );

  console.log(
    fail === 0 ? "techniques/grid/number-of-islands: all checks passed" : `${fail} FAILED`,
  );
}
