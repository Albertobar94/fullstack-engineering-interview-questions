/**
 * ============================================================================
 *  THE STRUCTURE: a BINARY SEARCH TREE is nodes joined by POINTERS, ORDERED
 * ============================================================================
 *
 *  "Tree" = a branching chart of NODES. Each node is its own little box in
 *  memory holding a value + two POINTERS: `left` and `right` (either may be
 *  null = no child there). The boxes are SCATTERED across memory and reached
 *  only by following pointers -- the opposite of an array's one contiguous
 *  block. So a tree is CACHE-UNFRIENDLY (each hop is a random memory jump, not
 *  a stride down a packed row) -- the price you pay for cheap insert/remove.
 *
 *  A BINARY SEARCH TREE adds one rule, the INVARIANT, that makes it useful:
 *
 *      everything in the LEFT subtree  <  node.value  <  everything in the RIGHT
 *
 *  applied at EVERY node, all the way down. That ordering is the whole point:
 *
 *    - SEARCH is O(log n) WHEN BALANCED.  At each node, compare; the answer is
 *      smaller -> go left, bigger -> go right. Each step throws away HALF the
 *      remaining tree -- exactly like binary search on a sorted array. After
 *      ~log2(n) hops you're there or you've fallen off the bottom (a null).
 *
 *    - INSERT / DELETE are also O(log n) balanced, and -- unlike a sorted array
 *      -- they DON'T shift anything. Walk to the empty spot, hang a new node.
 *      No copying a block of memory. That's the trade: scattered + pointer-
 *      chasing (slow constant per hop, cache-unfriendly) in exchange for cheap
 *      structural edits.
 *
 *    - IN-ORDER TRAVERSAL (left subtree, then node, then right subtree) visits
 *      values in ASCENDING SORTED order, for free. The invariant guarantees it.
 *
 *  THE CLIFF (why nobody ships a plain BST).  The O(log n) story assumes the
 *  tree stays BALANCED -- short and bushy. Insert ALREADY-SORTED data
 *  (1,2,3,4,5...) and every new value is bigger than the last, so it always
 *  hangs off the right. The tree degenerates into a one-sided chain -- a LINKED
 *  LIST -- of height n. Now every operation is O(n): the ordering bought you
 *  nothing. Real systems fix this with SELF-BALANCING trees (AVL, red-black) or
 *  B-trees (the structure behind database indexes), which rotate/rebalance on
 *  insert to GUARANTEE height ~log n. We build the plain BST here to make the
 *  cliff visible; we do NOT build balancing -- name it and move on.
 *
 *  Below: BST<T> over a comparator `compare(a, b)` (negative = a<b, 0 = equal,
 *  positive = a>b), so it orders any type, not just numbers. Node = {value,
 *  left, right} with `| null` children (repo style: null = explicit absence).
 *  Methods: insert, has, inorder (sorted), min, max, height (exposes skew).
 */

// One scattered box: a value plus pointers to two children (null = none).
type BSTNode<T> = {
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
};

// compare(a, b): <0 if a<b, 0 if equal, >0 if a>b. Same contract as Array.sort.
type Comparator<T> = (a: T, b: T) => number;

export class BST<T> {
  private root: BSTNode<T> | null;
  private readonly compare: Comparator<T>;

  public constructor(compare: Comparator<T>) {
    this.root = null;
    this.compare = compare;
  }

  // O(log n) balanced / O(n) skewed: walk down comparing, hang a new leaf at
  // the first empty slot. Duplicates are ignored (a set, not a multiset).
  public insert(value: T): void {
    if (this.root === null) {
      this.root = { value, left: null, right: null };
      return;
    }
    let node = this.root;
    for (;;) {
      const cmp = this.compare(value, node.value);
      // Already present -> nothing to do; keeps the tree a set of unique keys.
      if (cmp === 0) {
        return;
      }
      // Smaller -> belongs in the LEFT subtree (the invariant).
      if (cmp < 0) {
        if (node.left === null) {
          node.left = { value, left: null, right: null };
          return;
        }
        node = node.left;
        continue;
      }
      // Bigger -> RIGHT subtree.
      if (node.right === null) {
        node.right = { value, left: null, right: null };
        return;
      }
      node = node.right;
    }
  }

  // O(log n) balanced / O(n) skewed: the binary-search probe -- compare, then
  // commit to ONE side, discarding the other half each hop. Fall off (null) = miss.
  public has(value: T): boolean {
    let node = this.root;
    while (node !== null) {
      const cmp = this.compare(value, node.value);
      if (cmp === 0) {
        return true;
      }
      // Go where the value MUST be if present -- never look at the other side.
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
  }

  // O(n): in-order walk (left, self, right). The invariant makes this emit
  // values in ASCENDING SORTED order -- the BST's free sort.
  public inorder(): T[] {
    const out: T[] = [];
    const visit = (node: BSTNode<T> | null): void => {
      if (node === null) {
        return;
      }
      visit(node.left); // everything smaller, first
      out.push(node.value); // then self
      visit(node.right); // then everything bigger
    };
    visit(this.root);
    return out;
  }

  // O(log n) balanced / O(n) skewed: smallest = walk LEFT until you can't.
  public min(): T | null {
    if (this.root === null) {
      return null;
    }
    let node = this.root;
    while (node.left !== null) {
      node = node.left;
    }
    return node.value;
  }

  // O(log n) balanced / O(n) skewed: largest = walk RIGHT until you can't.
  public max(): T | null {
    if (this.root === null) {
      return null;
    }
    let node = this.root;
    while (node.right !== null) {
      node = node.right;
    }
    return node.value;
  }

  // O(n): longest root-to-leaf hop count. Empty = 0, single node = 1. This is
  // the number that decides whether ops are O(log n) (bushy) or O(n) (a chain).
  public height(): number {
    const measure = (node: BSTNode<T> | null): number => {
      if (node === null) {
        return 0;
      }
      return 1 + Math.max(measure(node.left), measure(node.right));
    };
    return measure(this.root);
  }
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/trees/solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  const numeric: Comparator<number> = (a, b) => a - b;

  // --- insert a scrambled set, in-order comes out sorted --------------------
  const t = new BST<number>(numeric);
  for (const v of [50, 30, 70, 20, 40, 60, 80, 65]) {
    t.insert(v);
  }
  ck("inorder() yields ascending sorted", t.inorder().join(",") === "20,30,40,50,60,65,70,80");
  ck("duplicate insert is ignored", (() => {
    t.insert(50);
    return t.inorder().join(",") === "20,30,40,50,60,65,70,80";
  })());

  // --- search: hit and miss --------------------------------------------------
  ck("has() hit", t.has(65) === true);
  ck("has() miss", t.has(66) === false);
  ck("has() miss below min", t.has(1) === false);

  // --- min / max -------------------------------------------------------------
  ck("min() walks left", t.min() === 20);
  ck("max() walks right", t.max() === 80);

  // --- empty-tree edges ------------------------------------------------------
  const empty = new BST<number>(numeric);
  ck("empty min() is null", empty.min() === null);
  ck("empty max() is null", empty.max() === null);
  ck("empty has() is false", empty.has(0) === false);
  ck("empty inorder() is []", empty.inorder().length === 0);
  ck("empty height() is 0", empty.height() === 0);

  // --- THE SKEW CLIFF: sorted inserts degenerate into a linked list ---------
  const N = 8;
  const skewed = new BST<number>(numeric);
  for (let i = 1; i <= N; i++) {
    skewed.insert(i); // ascending -> every value hangs off the right -> a chain
  }
  ck("skewed: still sorted on in-order", skewed.inorder().join(",") === "1,2,3,4,5,6,7,8");
  ck("skewed height === n (a degenerate linked list)", skewed.height() === N);

  // ...same 8 values, BALANCED insert order -> short bushy tree, height << n.
  const balanced = new BST<number>(numeric);
  for (const v of [4, 2, 6, 1, 3, 5, 7, 8]) {
    balanced.insert(v);
  }
  ck("balanced: same sorted contents", balanced.inorder().join(",") === "1,2,3,4,5,6,7,8");
  ck("balanced height much smaller than n", balanced.height() === 4 && balanced.height() < skewed.height());

  // --- works on any type via the comparator (strings) -----------------------
  const words = new BST<string>((a, b) => a.localeCompare(b));
  for (const w of ["pear", "apple", "mango", "fig"]) {
    words.insert(w);
  }
  ck("string BST sorts lexicographically", words.inorder().join(",") === "apple,fig,mango,pear");

  console.log(fail === 0 ? "structures/trees: all checks passed" : `${fail} FAILED`);
}
