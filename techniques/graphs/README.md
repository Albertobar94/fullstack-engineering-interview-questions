# Graph techniques — explore nodes and edges, with a `visited` guard

**Start here.** A [graph](../../structures/graphs/) is nodes joined by edges (a tree without the
"one parent" rule, a grid without the "only neighbours" rule). Almost every graph problem is **BFS
or DFS over neighbours, with a `visited` set** to stop cycles — plus a twist depending on whether
edges are **directed**, **weighted**, or form a **DAG**. If graphs are new, read this page, then
[`bfs-dfs`](./bfs-dfs/), then pick a problem. Each leaf has the recognition test, the bug lines, and code.

## Representing a graph
The usual form is an **adjacency list** — for each node, the list of nodes it points to:

```ts
// edges [[from, to], ...] → adjacency list
const adj = new Map();                 // node → neighbours
for (const [u, v] of edges) {
  if (!adj.has(u)) adj.set(u, []);
  adj.get(u).push(v);
  // undirected? also push u onto v's list.
}
```

Then you **walk** it. The one rule that makes graph traversal safe: a **`visited` set** — without
it, any cycle loops forever. (A tree can't cycle, so tree walks skip it; a graph can, so you can't.)

## The goal
Answer reachability / fewest-hops / ordering / shortest-weighted-distance in **O(V + E)** (or
`O(E log V)` for Dijkstra) — visiting each node and edge a bounded number of times.

## The problems (this is the fork to recognize)

| Problem | Walk | The twist | Canonical |
|---|---|---|---|
| **[BFS & DFS](./bfs-dfs/)** | the two base walks | reachability / fewest-hops / components | #1971 Path Exists, #133 Clone Graph |
| **[Topological sort](./topological-sort/)** | BFS on in-degrees (Kahn) | order a **DAG** by dependencies; detect a cycle | #207 Course Schedule |
| **[Dijkstra](./dijkstra/)** | BFS with a **min-heap** | shortest path on a **weighted** graph | #743 Network Delay Time |
| **[Inform employees](./inform-employees/)** | DFS on a tree-shaped graph | longest **weighted** root-to-leaf path | #1376 Time to Inform All Employees |

## Which one?
- "Can I get from A to B / how many components / fewest hops (unweighted)" → **bfs-dfs** (BFS for hops, DFS for reachability).
- "Order tasks by prerequisites" / "is there a dependency cycle" → **topological-sort** (DAG only).
- "Shortest distance when edges have **weights**" → **dijkstra** (non-negative weights).
- "Longest time/cost down a hierarchy" → **inform-employees** (DFS accumulating along the path).

## What they share
- An **adjacency list** (or implicit neighbours, as in a [grid](../grid/)).
- A **`visited` set / in-degree count / dist array** to avoid re-processing and infinite loops.
- **BFS uses a queue** (fewest hops, equal-cost steps); **DFS uses recursion / a stack** (reachability, ordering); **Dijkstra uses a min-heap** (weighted).

## Looks like it but ISN'T
- A **grid** (implicit 4-/8-neighbour edges) → same BFS/DFS, no adjacency list to build → [`techniques/grid`](../grid/).
- A **tree** (connected, acyclic, one parent) → no `visited` needed; the dedicated walks live in [`techniques/trees`](../trees/).
- **Unweighted** shortest path → plain BFS, *not* Dijkstra (the heap is wasted when every edge costs 1).

---

Pick a problem: [`bfs-dfs`](./bfs-dfs/) · [`topological-sort`](./topological-sort/) · [`dijkstra`](./dijkstra/) · [`inform-employees`](./inform-employees/).
