/**
 * ============================================================================
 *  THE STRUCTURE: a graph is VERTICES (dots) joined by EDGES (lines)
 * ============================================================================
 *
 *  "Graph" = a set of VERTICES (nodes/dots) and a set of EDGES (the lines that
 *  join pairs of them). It's a tree WITHOUT the one-parent rule: a vertex can
 *  connect to many others, and the connections can loop back on themselves
 *  (a CYCLE: A->B->C->A). That single freedom — cycles — drives the whole cost
 *  and bug story below.
 *
 *  TWO WAYS TO STORE THE EDGES (this is the cost story):
 *
 *    - ADJACENCY LIST — a Map of  vertex -> array of its neighbours.  You only
 *      store edges that actually exist, so space is O(V + E) and it's the right
 *      pick for SPARSE graphs (few edges per node). "Is there an edge A->B?"
 *      costs O(degree of A) — you scan A's neighbour list. This file builds it.
 *
 *    - ADJACENCY MATRIX — a V x V grid of 0/1, cell [a][b] = 1 meaning "edge".
 *      "Is there an edge?" is O(1) (one cell), but space is O(V^2) NO MATTER how
 *      few edges exist — wasteful on a sparse graph (mostly zeros), worth it on
 *      a DENSE one (near every-pair connected) or when you query edges constantly.
 *
 *  WHY CYCLES FORCE A `visited` SET.  A graph can loop. A traversal that just
 *  "follows neighbours" will walk A->B->C->A->B->C->... FOREVER. The fix is a
 *  VISITED set: before processing a vertex, check "seen it?" — if yes, skip.
 *  A tree never loops (no cycles), so tree traversal needs no `visited`; a
 *  general graph does. The self-check below builds a graph WITH a cycle and
 *  proves both traversals TERMINATE, visiting each vertex exactly once.
 *
 *  THE TWO TRAVERSALS:
 *
 *    - BFS (breadth-first) — uses a QUEUE (first-in-first-out line). Expand the
 *      graph LEVEL BY LEVEL: all 1 hop away, then all 2 hops, ... That FIFO order
 *      is what makes BFS find the FEWEST-HOPS path on an unweighted graph.
 *
 *    - DFS (depth-first) — uses a STACK / RECURSION. Plunge as deep as possible
 *      down one neighbour chain, then back up and try the next. The call stack
 *      (or an explicit stack) is the descent; `visited` is the base case that
 *      stops it on a cycle.
 *
 *  Edge cases: UNDIRECTED edge = TWO directed entries (A->B and B->A) — forget
 *  one and half your edges vanish. addEdge here auto-creates missing endpoints
 *  so you can't dangle an edge to a vertex that doesn't exist.
 *
 *  Language note: a plain JS object as the map would coerce keys to strings;
 *  a real `Map<T, T[]>` keeps the vertex's true type/identity, so this works for
 *  numbers, strings, or object vertices alike.
 */

export class Graph<T> {
  // The adjacency list: every vertex maps to the array of vertices it links to.
  // For an undirected graph each edge appears in BOTH endpoints' arrays.
  private readonly adjacency: Map<T, T[]>;
  private readonly directed: boolean;

  public constructor(directed: boolean = false) {
    this.adjacency = new Map<T, T[]>();
    this.directed = directed;
  }

  // O(1): a new vertex is just a key with an empty neighbour list. Idempotent —
  // re-adding an existing vertex must NOT wipe its edges.
  public addVertex(vertex: T): void {
    if (this.adjacency.has(vertex)) {
      return;
    }
    this.adjacency.set(vertex, []);
  }

  // O(1) per direction: push onto the neighbour list. Undirected => add BOTH
  // directions (skip this and half your edges silently disappear).
  public addEdge(a: T, b: T): void {
    // Auto-create endpoints so an edge can never dangle to a missing vertex.
    this.addVertex(a);
    this.addVertex(b);
    // Safe: addVertex guaranteed both keys exist.
    const aNeighbours = this.adjacency.get(a) as T[];
    if (!aNeighbours.includes(b)) {
      aNeighbours.push(b);
    }
    if (this.directed) {
      return;
    }
    const bNeighbours = this.adjacency.get(b) as T[];
    if (!bNeighbours.includes(a)) {
      bNeighbours.push(a);
    }
  }

  public hasVertex(vertex: T): boolean {
    return this.adjacency.has(vertex);
  }

  // O(degree): hand back a COPY of the neighbour list so callers can't mutate
  // the graph's internals by accident.
  public neighbours(vertex: T): T[] {
    const list = this.adjacency.get(vertex);
    if (list === undefined) {
      return [];
    }
    return [...list];
  }

  // BFS — O(V + E). A FIFO QUEUE (here a plain array used as a queue) expands the
  // graph level by level. `visited` is what stops a cycle from looping forever.
  public bfs(start: T): T[] {
    if (!this.adjacency.has(start)) {
      return [];
    }
    const order: T[] = [];
    const visited = new Set<T>();
    const queue: T[] = [start];
    // Mark ON ENQUEUE, not on dequeue: otherwise a vertex reachable by two
    // edges gets queued twice and BFS visits it twice.
    visited.add(start);
    while (queue.length > 0) {
      // shift() = remove FRONT = FIFO. (Pushing both ends would make it a stack.)
      const current = queue.shift() as T;
      order.push(current);
      const list = this.adjacency.get(current) as T[];
      for (const next of list) {
        if (visited.has(next)) {
          // Already seen — the cycle guard. Skip, or we'd loop forever.
          continue;
        }
        visited.add(next);
        queue.push(next);
      }
    }
    return order;
  }

  // DFS — O(V + E). Recursion over neighbours: visit me, then recurse into each
  // UNVISITED neighbour. `visited` is the base case that halts on a cycle.
  public dfs(start: T): T[] {
    if (!this.adjacency.has(start)) {
      return [];
    }
    const order: T[] = [];
    const visited = new Set<T>();
    this.dfsVisit(start, visited, order);
    return order;
  }

  private dfsVisit(vertex: T, visited: Set<T>, order: T[]): void {
    // Base case: already explored this vertex — stop, or a cycle recurses forever.
    if (visited.has(vertex)) {
      return;
    }
    visited.add(vertex);
    order.push(vertex);
    const list = this.adjacency.get(vertex) as T[];
    for (const next of list) {
      this.dfsVisit(next, visited, order);
    }
  }
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/graphs/solution.ts  (or tsx)
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // Build an UNDIRECTED graph WITH A CYCLE: A-B, B-C, C-A (the loop), plus a
  // branch C-D. Insertion order of neighbours is deterministic below.
  //   A: [B, C]      (B from A-B, C from C-A)
  //   B: [A, C]      (A from A-B, C from B-C)
  //   C: [B, A, D]   (B from B-C, A from C-A, D from C-D)
  //   D: [C]
  const g = new Graph<string>();
  g.addEdge("A", "B");
  g.addEdge("B", "C");
  g.addEdge("C", "A"); // closes the cycle A-B-C-A
  g.addEdge("C", "D"); // branch off the cycle

  // --- neighbours(): undirected edge stored in both endpoints -----------------
  ck("neighbours(A) = B,C", g.neighbours("A").join(",") === "B,C");
  ck("neighbours(B) = A,C", g.neighbours("B").join(",") === "A,C");
  ck("neighbours(C) = B,A,D", g.neighbours("C").join(",") === "B,A,D");
  ck("neighbours(D) = C", g.neighbours("D").join(",") === "C");
  ck("neighbours of unknown vertex is empty", g.neighbours("Z").length === 0);
  ck("addEdge auto-created vertices", g.hasVertex("A") && g.hasVertex("D"));

  // --- BFS: TERMINATES despite the cycle, each vertex exactly once ------------
  const bfsOrder = g.bfs("A");
  ck("bfs terminates (does NOT loop on the cycle)", bfsOrder.length === 4);
  ck("bfs visits every reachable vertex exactly once", new Set(bfsOrder).size === 4);
  // Breadth order from A: A (level 0), then A's neighbours B,C (level 1),
  // then D (level 2, via C). FIFO queue guarantees this.
  ck("bfs is breadth-order A,B,C,D", bfsOrder.join(",") === "A,B,C,D");
  ck("bfs first vertex is the start", bfsOrder[0] === "A");

  // --- DFS: TERMINATES despite the cycle, each vertex exactly once ------------
  const dfsOrder = g.dfs("A");
  ck("dfs terminates (does NOT loop on the cycle)", dfsOrder.length === 4);
  ck("dfs visits every reachable vertex exactly once", new Set(dfsOrder).size === 4);
  // Depth order from A: A -> first neighbour B -> B's first unvisited (A seen) C
  // -> C's first unvisited (B,A seen) D. So A,B,C,D here.
  ck("dfs is depth-order A,B,C,D", dfsOrder.join(",") === "A,B,C,D");
  ck("dfs first vertex is the start", dfsOrder[0] === "A");

  // --- the cycle payoff, stated plainly: both walks halt on a 3-cycle ---------
  const tri = new Graph<number>();
  tri.addEdge(1, 2);
  tri.addEdge(2, 3);
  tri.addEdge(3, 1); // pure triangle cycle, no exit
  ck("bfs on a pure cycle halts, 3 vertices once", tri.bfs(1).length === 3);
  ck("dfs on a pure cycle halts, 3 vertices once", tri.dfs(1).length === 3);

  // --- directed graph: edge is one-way only -----------------------------------
  const d = new Graph<string>(true);
  d.addEdge("X", "Y");
  ck("directed: X->Y exists", d.neighbours("X").join(",") === "Y");
  ck("directed: Y->X does NOT exist", d.neighbours("Y").length === 0);

  // --- edges --------------------------------------------------------------------
  const solo = new Graph<string>();
  solo.addVertex("only");
  ck("isolated vertex: bfs returns just itself", solo.bfs("only").join(",") === "only");
  ck("isolated vertex: dfs returns just itself", solo.dfs("only").join(",") === "only");
  ck("bfs from unknown start is empty", solo.bfs("ghost").length === 0);
  ck("re-addVertex does not wipe edges", (() => {
    g.addVertex("A");
    return g.neighbours("A").join(",") === "B,C";
  })());
  ck("addEdge is idempotent (no duplicate neighbour)", (() => {
    const e = new Graph<string>();
    e.addEdge("P", "Q");
    e.addEdge("P", "Q");
    return e.neighbours("P").join(",") === "Q";
  })());

  console.log(fail === 0 ? "structures/graphs: all checks passed" : `${fail} FAILED`);
}
