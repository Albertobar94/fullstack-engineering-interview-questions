/**
 * ============================================================================
 *  THE STRUCTURE: a binary heap is a COMPLETE TREE PACKED INTO A FLAT ARRAY
 * ============================================================================
 *
 *  "Heap" = a tree that always hands you the smallest (min-heap) or biggest
 *  (max-heap) item next, stored with NO node pointers -- just a flat array.
 *
 *  COMPLETE TREE.  Every level is full, top to bottom, left to right, with the
 *  last level filled from the left. That "no gaps" shape is the trick: it lets
 *  the tree live in an array by position alone, no left/right pointers needed.
 *
 *    index:   0       1       2       3       4
 *    value:  [1] --> [3] --> [2] --> [7] --> [4]
 *
 *            tree view of the SAME array:
 *                     1            <- index 0 (root = the min)
 *                   /   \
 *                  3     2         <- index 1, 2
 *                 / \
 *                7   4             <- index 3, 4
 *
 *  INDEX MATH (this is the whole structure -- no pointers, just arithmetic):
 *    - parent of i  =  (i - 1) >> 1   (>> 1 is integer divide-by-2)
 *    - left  of i   =  2*i + 1
 *    - right of i   =  2*i + 2
 *  So from any node you JUMP to its parent/children with one multiply or shift.
 *
 *  PARTIAL ORDER only.  The single rule: parent <= both children (min-heap).
 *  That guarantees the smallest is at the root (arr[0]) -- but SIBLINGS are
 *  unordered, and a left subtree can be all bigger than a right subtree. So a
 *  heap is NOT a sorted array: reading it left-to-right is NOT ascending. You
 *  only ever get a cheap answer to ONE question: "what's the min?".
 *
 *  WHY push / pop are O(log n) -- each fixes ONE root-to-leaf path:
 *    - push: append at the end (keeps it complete), then SIFT UP -- swap with
 *      parent while smaller. At most tree-height swaps. Height of a complete
 *      tree of n nodes is log2(n) -> O(log n).
 *    - pop:  the min is arr[0]. Move the LAST item to the root (keeps it
 *      complete), drop the old root, then SIFT DOWN -- swap with the smaller
 *      child while bigger. Again at most log n swaps -> O(log n).
 *
 *  WHY only the min is cheap (THE CLIFF).  peek = arr[0] = O(1). But searching
 *  for an arbitrary value, or the 2nd-smallest's exact spot, has no shortcut --
 *  partial order tells you nothing about where a non-min lives -> O(n) scan.
 *  (A heap optimizes for "smallest next", nothing else.)
 *
 *  THE ABSTRACTION vs THE METAL.  JS has NO built-in heap -- you roll one (like
 *  this) or pull a library. A "priority queue" is normally a heap underneath.
 *  Because it's a flat array, it's cache-friendly (contiguous, like an array) --
 *  the tree is a mental model; the metal is just arr + index math.
 *
 *  Below: MinHeap<T> driven by a comparator. compare(a,b) < 0 means "a before
 *  b" (a is smaller / higher priority). Pass (a,b)=>a-b for a number min-heap,
 *  (a,b)=>b-a to FLIP it into a max-heap -- same code, comparator decides.
 */

export class MinHeap<T> {
  // The complete tree, packed by position. heap[0] is the root = the min.
  private heap: T[];
  // compare(a, b) < 0  ->  a has higher priority (sits closer to the root).
  private readonly compare: (a: T, b: T) => number;

  public constructor(compare: (a: T, b: T) => number) {
    this.heap = [];
    this.compare = compare;
  }

  public get size(): number {
    return this.heap.length;
  }

  // O(1): the root is the min. No scan -- it's just slot 0.
  public peek(): T {
    if (this.heap.length === 0) {
      throw new RangeError("peek on empty heap");
    }
    return this.heap[0];
  }

  // O(log n): append (stays complete), then bubble up one root-to-leaf path.
  public push(value: T): void {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  // O(log n): root is the min; move the last item up to the root to keep the
  // tree complete, then sink it down one path until the parent<=children rule
  // holds again. Returns the min; throws on empty.
  public pop(): T {
    if (this.heap.length === 0) {
      throw new RangeError("pop on empty heap");
    }
    const min = this.heap[0];
    const last = this.heap.pop() as T;
    // If items remain, the popped `last` becomes the new (likely wrong) root.
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  // Swap a too-small node toward the root until its parent is <= it.
  private siftUp(start: number): void {
    let i = start;
    while (i > 0) {
      // parent of i = (i - 1) >> 1  -- integer divide-by-2.
      const parent = (i - 1) >> 1;
      // Parent already <= child -> heap rule holds, stop.
      if (this.compare(this.heap[i], this.heap[parent]) >= 0) {
        break;
      }
      this.swap(i, parent);
      i = parent;
    }
  }

  // Swap a too-big node toward the leaves, always trading with the SMALLER
  // child (else you'd violate the rule against the other child).
  private siftDown(start: number): void {
    let i = start;
    const n = this.heap.length;
    while (true) {
      // children of i = 2i+1 (left) and 2i+2 (right).
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      // No child smaller than us -> rule holds, stop.
      if (smallest === i) {
        break;
      }
      this.swap(i, smallest);
      i = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.heap[a];
    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;
  }
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/heap/solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // --- min-heap: peek is O(1) min; popping yields ASCENDING order -----------
  const h = new MinHeap<number>((a, b) => a - b);
  ck("starts empty", h.size === 0);

  // Push out of order on purpose -- the heap rule must sort itself out.
  for (const v of [5, 3, 8, 1, 9, 2, 7]) {
    h.push(v);
  }
  ck("size after 7 pushes", h.size === 7);
  ck("peek is the min, not the last pushed", h.peek() === 1);

  // Pop everything: a correct heap drains in ascending order.
  const drained: number[] = [];
  while (h.size > 0) {
    drained.push(h.pop());
  }
  ck("pop drains ascending (heap property held)", drained.join(",") === "1,2,3,5,7,8,9");
  ck("empty after draining", h.size === 0);

  // --- pop on empty throws --------------------------------------------------
  let threw = false;
  try {
    h.pop();
  } catch {
    threw = true;
  }
  ck("pop on empty throws", threw);

  // --- duplicates survive ---------------------------------------------------
  const dups = new MinHeap<number>((a, b) => a - b);
  for (const v of [4, 4, 1, 4, 1]) {
    dups.push(v);
  }
  const dd: number[] = [];
  while (dups.size > 0) {
    dd.push(dups.pop());
  }
  ck("duplicates drain ascending", dd.join(",") === "1,1,4,4,4");

  // --- comparator flips it into a MAX-heap (same code) ----------------------
  const max = new MinHeap<number>((a, b) => b - a);
  for (const v of [5, 3, 8, 1, 9]) {
    max.push(v);
  }
  ck("max-heap peek is the biggest", max.peek() === 9);
  const desc: number[] = [];
  while (max.size > 0) {
    desc.push(max.pop());
  }
  ck("max-heap drains descending", desc.join(",") === "9,8,5,3,1");

  console.log(fail === 0 ? "structures/heap: all checks passed" : `${fail} FAILED`);
}
