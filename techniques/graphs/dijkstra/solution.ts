/**
 * ============================================================================
 *  THE TRICK: Dijkstra — BFS with a min-heap for weighted shortest paths
 * ============================================================================
 *
 *  With weights, "fewest hops" != "shortest distance", so a FIFO queue is wrong.
 *  Always expand the NEAREST unsettled node — a min-heap keyed on best-known
 *  distance hands it over. The first (smallest) pop of a node is its FINAL
 *  distance (true for non-negative weights). Relax its edges, push improved
 *  neighbours. A "skip stale pop" check replaces a visited set. O(E log V).
 *
 *  A) Network Delay Time  (LeetCode #743)
 */

/**
 * A compact binary MIN-heap of [distance, node] pairs, ordered by distance.
 * (Self-contained — notes don't cross-import; the structures/heap note builds the
 * general version.)
 */
class MinHeap {
  private readonly data: Array<[number, number]> = [];

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  push(item: [number, number]): void {
    const d = this.data;
    d.push(item);
    let i = d.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (d[parent][0] <= d[i][0]) {
        break; // heap order restored
      }
      [d[parent], d[i]] = [d[i], d[parent]];
      i = parent;
    }
  }

  pop(): [number, number] {
    const d = this.data;
    const top = d[0];
    const last = d.pop() as [number, number];
    if (d.length > 0) {
      d[0] = last;
      // sift down
      let i = 0;
      const n = d.length;
      for (;;) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < n && d[left][0] < d[smallest][0]) {
          smallest = left;
        }
        if (right < n && d[right][0] < d[smallest][0]) {
          smallest = right;
        }
        if (smallest === i) {
          break;
        }
        [d[smallest], d[i]] = [d[i], d[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}

/**
 * ----------------------------------------------------------------------------
 *  A) NETWORK DELAY TIME  (LeetCode #743)
 * ----------------------------------------------------------------------------
 *  n nodes (1..n). times[i] = [u, v, w]: directed edge u→v taking w time. A signal
 *  starts at node k. Return the time for ALL nodes to receive it (= the farthest
 *  shortest-distance), or -1 if some node is unreachable.
 *
 *  Examples:
 *    n=4, times=[[2,1,1],[2,3,1],[3,4,1]], k=2 -> 2
 *    n=2, times=[[1,2,1]], k=1 -> 1
 *    n=2, times=[[1,2,1]], k=2 -> -1   (node 1 never hears)
 *
 *  Complexity: O(E log V) time, O(V + E) space.
 */
export function networkDelayTime(times: number[][], n: number, k: number): number {
  const adj: Array<Array<[number, number]>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) {
    adj[u].push([v, w]);
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;

  const heap = new MinHeap();
  heap.push([0, k]); // [distance, node]

  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) {
      continue; // stale entry — already settled u cheaper
    }
    for (const [v, w] of adj[u]) {
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        dist[v] = nd; // relax
        heap.push([nd, v]);
      }
    }
  }

  let ans = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) {
      return -1; // someone never receives the signal
    }
    ans = Math.max(ans, dist[i]);
  }
  return ans;
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

  ck("delay example -> 2", networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2) === 2);
  ck("delay direct -> 1", networkDelayTime([[1, 2, 1]], 2, 1) === 1);
  ck("delay unreachable -> -1", networkDelayTime([[1, 2, 1]], 2, 2) === -1);
  ck("delay single node -> 0", networkDelayTime([], 1, 1) === 0);
  // node 2 reached via 1→3→2 (cost 2) not the direct 1→2 (cost 10); node 4 then at 4 = the max
  ck("delay relax cheaper path -> 4", networkDelayTime([[1, 2, 10], [1, 3, 1], [3, 2, 1], [2, 4, 2]], 4, 1) === 4);

  // heap sanity: pop in ascending order
  const h = new MinHeap();
  for (const x of [5, 1, 4, 2, 3]) {
    h.push([x, x]);
  }
  const popped: number[] = [];
  while (!h.isEmpty()) {
    popped.push(h.pop()[0]);
  }
  ck("minheap pops ascending", JSON.stringify(popped) === JSON.stringify([1, 2, 3, 4, 5]));

  console.log(fail === 0 ? "techniques/graphs/dijkstra: all checks passed" : `${fail} FAILED`);
}
