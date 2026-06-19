/**
 * ============================================================================
 *  THE TRICK: a hashmap that remembers what you've already seen
 * ============================================================================
 *
 *  Walk the list once. Keep a lookup table of everything seen so far. Before
 *  moving past an item, ask the table for the exact partner you need. The table
 *  answers in O(1), so you never need a second loop.
 *
 *  Two problems that look unrelated but use the SAME trick live here:
 *    A) Two Sum            — find two numbers that add to a target  (LeetCode #1)
 *    B) Webhook replay guard — find the first repeated event id     (made-up twin)
 *
 * ----------------------------------------------------------------------------
 *  A) TWO SUM  (LeetCode #1)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given an array `nums` and an integer `target`, return the indices of the
 *    two numbers that add up to `target`. Exactly one answer exists. You may not
 *    use the same number twice. Answer order does not matter.
 *
 *  Examples:
 *    nums = [2,7,11,15], target = 9  -> [0,1]   (2 + 7)
 *    nums = [3,2,4],     target = 6  -> [1,2]   (2 + 4)
 *    nums = [3,3],       target = 6  -> [0,1]   (3 + 3, two DIFFERENT 3s)
 *
 *  Approach — "have I seen the partner I need?":
 *    For the current number x, the partner that completes the pair is
 *    (target - x). If that partner is already in our table, we're done. If not,
 *    record x (and where it lives) and keep walking.
 *
 *  Why one pass cannot miss a pair (the subtle bit):
 *    We CHECK before we STORE. If a valid pair (a, b) exists with a appearing
 *    first, then when we reach b we ask for (target - b) = a, which is already
 *    stored. So the second member always finds the first. Checking before
 *    storing also means a number can never be paired with itself.
 *
 *  The [3,3] case:
 *    i=0  x=3  need=3  seen={}            -> not found, store 3->0
 *    i=1  x=3  need=3  seen={3:0}         -> found! return [0, 1]
 *    Works precisely because we stored the first 3 before reaching the second.
 *
 *  Complexity:
 *    Time  O(n) — a single pass; each Map get/set is O(1) on average.
 *    Space O(n) — the table can hold up to n entries.
 *
 *  Note on the original submission:
 *    The first version used a plain object `{}` and had no `return` for the
 *    "no answer" path (fine on LeetCode, where an answer is guaranteed, but it
 *    leaves the function returning `undefined`). Below we use a typed `Map` and
 *    throw on the impossible path so the types stay honest.
 */
export function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>(); // value -> index it was found at

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const partnerIndex = seen.get(complement);

    if (partnerIndex !== undefined) {
      return [partnerIndex, i];
    }

    seen.set(nums[i], i);
  }

  // The problem guarantees a solution, so we never get here. Throwing keeps the
  // return type honest (no silent `undefined`).
  throw new Error("No two numbers add up to the target.");
}

/**
 * ----------------------------------------------------------------------------
 *  B) WEBHOOK REPLAY GUARD  (the far-apart twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A webhook receiver processes a stream of events, each carrying a unique
 *    `eventId`. An attacker may replay an old event to trigger a duplicate
 *    side effect (charge a card twice, etc.). Return the FIRST event id that
 *    appears a second time, or `null` if every id is unique.
 *
 *  Examples:
 *    ["a","b","c"]          -> null   (all unique)
 *    ["a","b","a","c"]      -> "a"    (a repeats first)
 *    ["x","y","y","x"]      -> "y"    (y's repeat comes before x's)
 *
 *  Same trick as Two Sum, simpler shape:
 *    The "partner I need" is just THE SAME id again. We don't need to map to a
 *    value, only answer yes/no — so a Set is enough. Check membership before
 *    adding; the first time `has` is true, that id is the first replay.
 *
 *  Complexity:
 *    Time  O(n) — one pass, O(1) Set membership.
 *    Space O(n) — up to n distinct ids remembered.
 */
export function firstReplay(eventIds: readonly string[]): string | null {
  const seen = new Set<string>();

  for (const id of eventIds) {
    if (seen.has(id)) {
      return id;
    }
    seen.add(id);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

  console.assert(eq(twoSum([2, 7, 11, 15], 9), [0, 1]), "twoSum example 1");
  console.assert(eq(twoSum([3, 2, 4], 6), [1, 2]), "twoSum example 2");
  console.assert(eq(twoSum([3, 3], 6), [0, 1]), "twoSum duplicate case");
  console.assert(eq(twoSum([-1, -2, -3, -4, -5], -8), [2, 4]), "twoSum negatives");

  console.assert(firstReplay(["a", "b", "c"]) === null, "replay: all unique");
  console.assert(firstReplay(["a", "b", "a", "c"]) === "a", "replay: a first");
  console.assert(firstReplay(["x", "y", "y", "x"]) === "y", "replay: y first");

  console.log("hashing/two-sum: all checks passed");
}
