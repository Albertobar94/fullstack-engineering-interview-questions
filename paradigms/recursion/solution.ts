/**
 * ============================================================================
 *  THE TRICK: recursion — solve a problem by solving a SMALLER copy of itself,
 *             until the copy is small enough to answer outright.
 * ============================================================================
 *
 *  Three parts, always:
 *    1. BASE CASE  — the smallest input you answer WITHOUT recursing (empty list
 *                    → 0, a leaf → its value, null → identity). Must exist and be
 *                    reachable, or the calls never stop.
 *    2. PROGRESS   — each call hands a STRICTLY SMALLER input to the next (a child
 *                    node, a shorter slice, a smaller number). No shrink → the base
 *                    is never reached → infinite recursion even WITH a base case.
 *    3. COMBINE    — fold this level's contribution into the sub-answer(s) (add the
 *                    current node, concat, take the max, merge two halves). Return
 *                    the sub-answer raw and you drop this level — the off-by-one of
 *                    recursion.
 *
 *  The call stack is the hidden state: each recursive call PAUSES the caller and
 *  pushes a frame; hitting the base case returns, the frame pops, the paused caller
 *  resumes with that answer. Too many pending frames (deep/large input) overflows —
 *  JS throws "RangeError: Maximum call stack size exceeded" around ~10k frames.
 *
 *  Worked example — sum a nested array [1,[2,[3,4]],5]:
 *    base:      a number          → return it
 *    recursive: an array          → sum of recurse(each element)
 *    => 1 + (2 + (3 + 4)) + 5 = 15
 *
 *  This file shows three faces of the same idea:
 *    A) sumNested  — traverse NESTED data (the worked example)
 *    B) maxDepth   — traverse a BRANCHING tree (LeetCode #104, the canonical one)
 *    C) mergeSort  — DIVIDE AND CONQUER (split in half, sort each, merge) — the
 *                    far-apart twin, where the "combine" step is the whole point
 *
 *  Complexity: sumNested / maxDepth are O(n) over n nodes. mergeSort is O(n log n)
 *  time, O(n) extra space. Watch RECURSION DEPTH: maxDepth recurses as deep as the
 *  tree is tall (a skewed tree ≈ n frames → overflow risk); mergeSort recurses only
 *  O(log n) deep.
 *
 *  Looks-like-but-isn't: if subproblems OVERLAP (naive Fibonacci recomputes fib(3)
 *  endlessly), plain recursion is exponential — remember past answers (memoize) and
 *  it becomes dynamic programming. If the data is a FLAT list walked end-to-end, a
 *  loop is simpler and can't overflow.
 */

/** A) Nested traversal. Base = a number; recursive = an array of nested numbers. */
export type NestedNumber = number | NestedNumber[];

export function sumNested(value: NestedNumber): number {
  if (typeof value === "number") {
    return value; // base case: the smallest piece, answered without recursing
  }
  let total = 0;
  for (const child of value) {
    total += sumNested(child); // recurse on each (strictly smaller) element, fold in
  }
  return total;
}

/**
 * B) Branching traversal — LeetCode #104, Maximum Depth of a Binary Tree.
 * base: an empty subtree (null) has depth 0.
 * combine: 1 (this node) + the deeper of its two subtrees.
 */
export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function maxDepth(root: TreeNode | null): number {
  if (root === null) {
    return 0; // base case — without it, recursing past a leaf never stops
  }
  // include THIS node (+1), then the deeper child — dropping the +1 is the off-by-one.
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

/**
 * C) Divide and conquer — merge sort. Split the list in half, sort each half by
 * recursion, then merge the two sorted halves. The merge IS the combine step.
 */
export function mergeSort(items: readonly number[]): number[] {
  if (items.length <= 1) {
    // base case MUST be <= 1, not === 0: a 1-element slice (mid = 0) would split
    // into [] and the same 1 element and recurse forever. The <= 1 is the progress
    // guarantee — every recursive call gets a strictly shorter list.
    return [...items];
  }
  const mid = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, mid)); // each half is strictly smaller
  const right = mergeSort(items.slice(mid));
  return merge(left, right); // combine: weave two sorted runs into one
}

/** Two-pointer merge of two already-sorted runs. */
function merge(a: readonly number[], b: readonly number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      out.push(a[i]);
      i += 1;
    } else {
      out.push(b[j]);
      j += 1;
    }
  }
  // one run is now exhausted; the other's tail is already sorted — append it.
  return [...out, ...a.slice(i), ...b.slice(j)];
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts   (or: node solution.ts)
// (Fail-counting ck(): prints only failures, then a one-line summary.)
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // A) nested sum: base case (plain number), deep nesting, empty array.
  ck("sumNested deep -> 15", sumNested([1, [2, [3, 4]], 5]) === 15);
  ck("sumNested base (a number)", sumNested(7) === 7);
  ck("sumNested empty -> 0", sumNested([]) === 0);
  ck("sumNested all-empty nesting -> 0", sumNested([[], [[]], []]) === 0);

  // B) maxDepth (#104). Tree:   3
  //                            / \
  //                           9  20
  //                              / \
  //                             15  7      depth = 3
  const tree: TreeNode = {
    value: 3,
    left: { value: 9, left: null, right: null },
    right: {
      value: 20,
      left: { value: 15, left: null, right: null },
      right: { value: 7, left: null, right: null },
    },
  };
  ck("maxDepth balanced-ish -> 3", maxDepth(tree) === 3);
  ck("maxDepth null -> 0", maxDepth(null) === 0);
  ck("maxDepth single node -> 1", maxDepth({ value: 1, left: null, right: null }) === 1);

  // C) mergeSort: base cases, a shuffle, duplicates, already-sorted.
  ck("mergeSort empty -> []", mergeSort([]).join() === "");
  ck("mergeSort single -> same", mergeSort([1]).join() === "1");
  ck("mergeSort shuffle", mergeSort([5, 3, 8, 1, 2]).join() === "1,2,3,5,8");
  ck("mergeSort duplicates", mergeSort([3, 1, 3, 2]).join() === "1,2,3,3");
  ck("mergeSort already sorted", mergeSort([1, 2, 3, 4]).join() === "1,2,3,4");
  ck("mergeSort reversed", mergeSort([4, 3, 2, 1]).join() === "1,2,3,4");

  console.log(
    fail === 0
      ? "paradigms/recursion: all checks passed"
      : `${fail} FAILED`,
  );
}
