# Grid techniques — BFS/DFS on a 2-D array, treated as an implicit graph

**Start here.** A grid (2-D array, matrix) is just a graph in disguise: each cell is a node, and its
**up/down/left/right neighbours** are the edges — no adjacency list needed, you compute neighbours
from `(row, col)`. Almost every grid problem is **BFS or DFS** over those cells with a `visited`
guard. If grids are new, read this whole page; then pick a problem. Each leaf has the recognition
test, the bug-prone lines, and runnable code.

## The 2-D basics (traversal foundation)
A grid is `grid[row][col]` — `R` rows, `C` columns, stored row-major (each row is an array). You
**can't** jump to a neighbour by a single index; you compute it from the current cell:

```ts
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // up, down, left, right (4-directional)
for (const [dr, dc] of DIRS) {
  const nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;   // ⚠️ bounds check FIRST — out-of-grid
  // ... visit grid[nr][nc]
}
```

That 4-direction sweep + a **bounds check** + a **visited marker** is the entire backbone. (Some
problems use 8 directions — add the diagonals.)

## The goal
Answer "how many regions / shortest spread time / nearest source" in **one pass over the cells**,
O(R·C) — each cell entered once because `visited` (or in-place marking) stops re-entry.

## The problems (this is the fork to recognize)

| Problem | Walk | The twist | Canonical |
|---|---|---|---|
| **[Number of islands](./number-of-islands/)** | DFS or BFS flood-fill | count **connected components**; sink each as you find it | #200 Number of Islands |
| **[Rotting oranges](./rotting-oranges/)** | **multi-source** BFS | start *all* sources at once; answer = number of BFS **layers** | #994 Rotting Oranges |
| **[Walls and gates](./walls-and-gates/)** | **multi-source** BFS | BFS out from *every* gate together; first visit = shortest distance | #286 Walls and Gates |

## Which one?
- "How many separate blobs / regions" → **number-of-islands** (flood-fill, count starts).
- "How long until everything is reached, spreading 1 step/round from *many* starts" → **rotting-oranges** (multi-source BFS, count rounds).
- "Distance from *each* cell to the nearest of *many* targets" → **walls-and-gates** (multi-source BFS from all targets).

A theme: **multi-source BFS** (seed the queue with *all* starts before looping) solves "nearest of
many" and "spread from many" in one O(R·C) pass — far simpler than a BFS per source.

## What they share
- Neighbours via the **`DIRS` deltas** + a **bounds check** before touching `grid[nr][nc]`.
- A **`visited` mark** (a separate matrix, or mutate the grid in place) so each cell is processed once → O(R·C).
- **BFS** when you need *shortest / layered* spread (it expands by distance); **DFS** when you only need *reachability / counting*.

## Looks like it but ISN'T
- An **explicit graph** (nodes + an adjacency list, arbitrary edges, weights) → [`techniques/graphs`](../graphs/);
  a grid is the special case where edges are implied by adjacency. Same BFS/DFS engine.
- **Weighted** shortest path on a grid (costs differ per cell) → that's Dijkstra, not plain BFS → [`graphs/dijkstra`](../graphs/dijkstra/).
- A pure **2-D scan / prefix-sum** (no connectivity, just totals over rectangles) → an array problem, not a traversal.

---

Pick a problem: [`number-of-islands`](./number-of-islands/) · [`rotting-oranges`](./rotting-oranges/) · [`walls-and-gates`](./walls-and-gates/).
