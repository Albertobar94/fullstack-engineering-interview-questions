/**
 * ============================================================================
 *  THE STRUCTURE: a queue is a LINE — add at the BACK, remove from the FRONT
 * ============================================================================
 *
 *  "Queue" = FIFO (first-in, first-out). The thing that arrived first leaves
 *  first, like a checkout line. Two operations: ENQUEUE (join the back) and
 *  DEQUEUE (leave the front). That ordering is the whole contract.
 *
 *  THE TRAP. JS has NO real queue. The obvious move — a plain array with
 *  `arr.push(x)` to enqueue and `arr.shift()` to dequeue — LOOKS right but
 *  `shift()` is O(n): removing index 0 forces every remaining element to
 *  re-index, sliding one slot left to close the gap (the same packed-block
 *  shift that makes array front-insert slow). N dequeues -> O(n^2). On a hot
 *  path (BFS over a big graph, a task buffer) that is the cliff.
 *
 *  DONE RIGHT = a RING BUFFER (circular array). Keep two indices into a
 *  fixed-capacity block:
 *    - HEAD -> the front (next to dequeue)
 *    - TAIL -> the next free back slot (where the next enqueue lands)
 *  Neither ever moves elements. Each advance WRAPS with `% capacity`, so when
 *  tail runs off the end it reappears at slot 0 and reuses the space the
 *  already-dequeued front left behind. enqueue / dequeue / peek are all O(1) —
 *  no shifting, ever.
 *
 *  WRAP-AROUND, concretely (capacity 4):
 *    enqueue a,b,c  -> [a,b,c,_]  head=0 tail=3 count=3
 *    dequeue x2     -> [_,_,c,_]  head=2 tail=3 count=1   (a,b gone)
 *    enqueue d,e    -> [e,_,c,d]  head=2 tail=1 count=3   <- tail wrapped 4->0->1
 *    dequeue order is still c,d,e — FIFO holds even though storage is scrambled.
 *
 *  GROW step. A ring is fixed-size; when count == capacity it is full. We
 *  allocate a block twice as big and RE-LAY-OUT the items in logical order
 *  starting at slot 0 (walking from head, wrapping) so head resets to 0 and
 *  tail to count. Doubling makes this O(n) copy rare -> enqueue stays
 *  amortized O(1), same averaging argument as a dynamic array.
 *
 *  THE EVENT-LOOP TIE. The browser/Node event loop *is* a queue: callbacks
 *  (timers, I/O completions, messages) join the back of the task queue and the
 *  loop pulls them off the front in arrival order. FIFO is why `setTimeout(fn,0)`
 *  runs after work already queued, not instantly.
 *
 *  A DEQUE (double-ended queue) generalizes this — add/remove at BOTH ends —
 *  and powers sliding-window-maximum's monotonic deque.
 *
 *  Below: Queue<T> over a fixed backing block so the cost story is *executed*,
 *  not asserted — the self-check forces tail to wrap past 0 and proves order
 *  survives.
 */

export class Queue<T> {
  // Fixed-size backing block. Live items occupy `count` slots starting at
  // `head` and wrapping; the rest are free. We never shift elements.
  private buffer: Array<T | undefined>;
  private head: number;
  private tail: number;
  private count: number;

  public constructor(initialCapacity: number = 4) {
    // A ring must have a real, non-zero size to hold anything.
    const cap = initialCapacity > 0 ? initialCapacity : 1;
    this.buffer = new Array<T | undefined>(cap);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  public get size(): number {
    return this.count;
  }

  public get capacity(): number {
    return this.buffer.length;
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  // Amortized O(1): land the value at tail, then advance tail with wrap.
  public enqueue(value: T): void {
    if (this.count === this.buffer.length) {
      this.grow();
    }
    this.buffer[this.tail] = value;
    // Wrap: when tail hits capacity it reappears at 0 and reuses freed slots.
    this.tail = (this.tail + 1) % this.buffer.length;
    this.count += 1;
  }

  // O(1): read the front, advance head with wrap. No element ever moves.
  public dequeue(): T {
    if (this.count === 0) {
      throw new Error("dequeue from empty queue");
    }
    const value = this.buffer[this.head] as T;
    // Drop the stale reference so the freed slot doesn't leak the object.
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.buffer.length;
    this.count -= 1;
    return value;
  }

  // O(1): look at the front without removing it.
  public peek(): T {
    if (this.count === 0) {
      throw new Error("peek into empty queue");
    }
    return this.buffer[this.head] as T;
  }

  // Items in FIFO order — walk from head, wrapping, for `count` steps.
  public toArray(): T[] {
    const out: T[] = [];
    for (let i = 0; i < this.count; i += 1) {
      const index = (this.head + i) % this.buffer.length;
      out.push(this.buffer[index] as T);
    }
    return out;
  }

  // Double the block and re-lay-out items in logical order from slot 0, so the
  // ring "un-wraps": head -> 0, tail -> count. The O(n) step doubling makes rare.
  private grow(): void {
    const newBuffer = new Array<T | undefined>(this.buffer.length * 2);
    for (let i = 0; i < this.count; i += 1) {
      newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length];
    }
    this.buffer = newBuffer;
    this.head = 0;
    this.tail = this.count;
  }
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/queue/solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // --- FIFO order: first in, first out --------------------------------------
  const q = new Queue<number>(4);
  ck("starts empty", q.isEmpty() && q.size === 0);
  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);
  ck("size tracks enqueues", q.size === 3 && !q.isEmpty());
  ck("dequeue returns front (1)", q.dequeue() === 1);
  ck("dequeue returns next (2)", q.dequeue() === 2);
  ck("FIFO order preserved so far", q.toArray().join(",") === "3");

  // --- WRAP-AROUND: tail must run off the end and reappear at 0 --------------
  // Fill, dequeue some, enqueue more so tail wraps past 0 — order still right.
  const r = new Queue<string>(4);
  r.enqueue("a");
  r.enqueue("b");
  r.enqueue("c"); // [a,b,c,_] head=0 tail=3
  ck("dequeue a", r.dequeue() === "a");
  ck("dequeue b", r.dequeue() === "b"); // [_,_,c,_] head=2 tail=3 count=1
  r.enqueue("d"); // tail 3 -> lands d at 3 -> tail wraps to 0
  r.enqueue("e"); // tail 0 -> lands e at 0 -> tail 1   storage [e,_,c,d]
  ck("no grow yet — wrap reused freed slots", r.capacity === 4);
  ck("FIFO survives wrap-around", r.toArray().join("") === "cde");
  ck("dequeue after wrap (c)", r.dequeue() === "c");
  ck("dequeue after wrap (d)", r.dequeue() === "d");
  ck("dequeue after wrap (e)", r.dequeue() === "e");
  ck("empty after draining wrapped queue", r.isEmpty());

  // --- grow-on-full preserves order, even when full state is wrapped --------
  const g = new Queue<number>(2);
  g.enqueue(10);
  g.enqueue(20); // full [10,20] head=0 tail=0 count=2
  ck("dequeue 10", g.dequeue() === 10); // [_,20] head=1 tail=0 count=1
  g.enqueue(30); // lands at 0 -> [30,20] head=1 tail=1 count=2, full + wrapped
  g.enqueue(40); // full -> grow, must un-wrap to 20,30,40 in order
  ck("grew on full", g.capacity === 4);
  ck("grow preserves FIFO across a wrapped layout", g.toArray().join(",") === "20,30,40");
  ck("dequeue order after grow (20)", g.dequeue() === 20);
  ck("dequeue order after grow (30)", g.dequeue() === 30);
  ck("dequeue order after grow (40)", g.dequeue() === 40);

  // --- peek doesn't remove --------------------------------------------------
  const p = new Queue<string>();
  p.enqueue("x");
  p.enqueue("y");
  ck("peek returns front", p.peek() === "x");
  ck("peek again — still there", p.peek() === "x" && p.size === 2);

  // --- empty errors ---------------------------------------------------------
  const e = new Queue<number>();
  let threwDequeue = false;
  try {
    e.dequeue();
  } catch {
    threwDequeue = true;
  }
  ck("dequeue empty throws", threwDequeue);
  let threwPeek = false;
  try {
    e.peek();
  } catch {
    threwPeek = true;
  }
  ck("peek empty throws", threwPeek);

  console.log(fail === 0 ? "structures/queue: all checks passed" : `${fail} FAILED`);
}
