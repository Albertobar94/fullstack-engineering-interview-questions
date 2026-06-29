/**
 * ============================================================================
 *  THE STRUCTURE: a stack is a PILE you touch only at the TOP (LIFO)
 * ============================================================================
 *
 *  "Stack" = items piled like plates. Three operations, all at the top:
 *    - PUSH  -> drop one on top.
 *    - POP   -> take the top one off (and hand it back).
 *    - PEEK  -> look at the top one, leave it.
 *
 *  The rule LAST IN, FIRST OUT (LIFO) falls straight out of "top only": the
 *  most recently pushed item sits on top, so it's the first one popped. Push
 *  1, 2, 3 then pop -> 3, then 2, then 1: the reverse of how they went in.
 *
 *  WHY EVERY OP IS O(1).  The cheapest backing is an ARRAY used at ONE end:
 *  `arr.push` appends (a free slot, amortized O(1)) and `arr.pop` drops the
 *  last slot -- neither ever shifts the other elements, because a stack never
 *  opens a hole in the middle. (Using `shift`/`unshift` would touch the FRONT
 *  and cost O(n) -- that is NOT a stack.) There is deliberately NO random
 *  access: a stack is a discipline, not an index.
 *
 *  THE CALL STACK is the realest stack there is.  Every function call the
 *  engine makes pushes a FRAME (its locals + where to return to); `return`
 *  pops it. That is literally LIFO -- the function that started most recently
 *  finishes first. So recursion isn't *like* a stack, it RUNS ON one. Recurse
 *  too deep and you overflow that fixed-size stack:
 *      RangeError: Maximum call stack size exceeded
 *  Rewriting deep recursion as a loop over an EXPLICIT stack (heap-backed, no
 *  ceiling) is the standard fix -- iterative DFS is exactly that move.
 *
 *  WHY BRACKETS NEED A STACK.  `([{}])` is valid; `([)]` is not. A closer must
 *  match the MOST RECENTLY opened bracket -- the newest open must close first,
 *  which is LIFO. Push every opener; on a closer, pop and check it matches. A
 *  leftover opener at the end (unclosed) or a mismatch on pop => not balanced.
 *  `isBalanced` below proves the point: the stack is the *right* tool, not just
 *  *a* tool.
 *
 *  DESIGN CHOICE: pop()/peek() on an empty stack THROW (rather than return
 *  null). Reason: popping an empty stack is a programming bug, not an expected
 *  "absence" -- failing loud beats silently propagating an undefined. Callers
 *  guard with isEmpty()/size first.
 */

export class Stack<T> {
  // Backing array. The TOP of the stack is the LAST element -- so push/pop map
  // straight onto array push/pop, both O(1) with no shifting.
  private readonly items: T[];

  public constructor() {
    this.items = [];
  }

  public get size(): number {
    return this.items.length;
  }

  // O(1): is there anything to pop? Guard this before pop()/peek().
  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  // O(1): drop a value on top.
  public push(value: T): void {
    this.items.push(value);
  }

  // O(1): remove and return the top. Empty -> throw (a pop with nothing to pop
  // is a bug, not a missing value).
  public pop(): T {
    if (this.isEmpty()) {
      throw new Error("pop from empty stack");
    }
    // Safe: isEmpty() guarded above, so the array is non-empty and pop() is a T.
    return this.items.pop() as T;
  }

  // O(1): read the top without removing it. Empty -> throw, same reasoning.
  public peek(): T {
    if (this.isEmpty()) {
      throw new Error("peek into empty stack");
    }
    return this.items[this.items.length - 1] as T;
  }
}

/**
 * Canonical USE that proves why a stack is the right tool: a closer must match
 * the MOST RECENTLY opened bracket (LIFO). Scan chars; push openers; on a
 * closer pop the top and check it matches the expected opener. End balanced
 * only if every closer matched AND nothing is left unclosed.
 */
export function isBalanced(input: string): boolean {
  // closer -> the opener it must match. Drives the pop-and-compare step.
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const openers = new Set(["(", "[", "{"]);
  const stack = new Stack<string>();

  for (const ch of input) {
    if (openers.has(ch)) {
      stack.push(ch);
      continue;
    }
    // Not an opener and not a known closer -> ignore (only brackets matter).
    if (!(ch in pairs)) {
      continue;
    }
    // A closer with nothing open, or a top that doesn't match -> not balanced.
    if (stack.isEmpty() || stack.pop() !== pairs[ch]) {
      return false;
    }
  }

  // Leftover openers => something never closed => not balanced.
  return stack.isEmpty();
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/stack/solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // --- LIFO: push then pop returns newest-first --------------------------------
  const s = new Stack<number>();
  ck("starts empty", s.isEmpty() && s.size === 0);
  s.push(1);
  s.push(2);
  s.push(3);
  ck("size tracks pushes", s.size === 3 && !s.isEmpty());
  ck("peek reads top, no remove", s.peek() === 3 && s.size === 3);
  ck("pop returns newest (3)", s.pop() === 3);
  ck("pop returns next newest (2)", s.pop() === 2);
  ck("LIFO order intact, last is oldest (1)", s.pop() === 1 && s.isEmpty());

  // --- pop/peek on empty throw -------------------------------------------------
  let poppedEmpty = false;
  try {
    s.pop();
  } catch {
    poppedEmpty = true;
  }
  ck("pop empty throws", poppedEmpty);
  let peekedEmpty = false;
  try {
    s.peek();
  } catch {
    peekedEmpty = true;
  }
  ck("peek empty throws", peekedEmpty);

  // --- isBalanced: the LIFO use case ------------------------------------------
  ck('isBalanced("()[]{}") true', isBalanced("()[]{}") === true);
  ck('isBalanced("(]") false (mismatch)', isBalanced("(]") === false);
  ck('isBalanced("([)]") false (wrong nesting)', isBalanced("([)]") === false);
  ck('isBalanced("(((") false (unclosed)', isBalanced("(((") === false);
  ck('isBalanced("") true (nothing to close)', isBalanced("") === true);
  ck('isBalanced("([{}])") true (nested)', isBalanced("([{}])") === true);
  ck('isBalanced("a(b)c") true (ignores non-brackets)', isBalanced("a(b)c") === true);
  ck('isBalanced(")(") false (closer first)', isBalanced(")(") === false);

  console.log(fail === 0 ? "structures/stack: all checks passed" : `${fail} FAILED`);
}
