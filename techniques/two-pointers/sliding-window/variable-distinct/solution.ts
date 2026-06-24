/**
 * ============================================================================
 *  THE TRICK: grow a window until it goes BAD, then shrink from the left
 * ============================================================================
 *
 *  The window has no fixed size. You push the right edge out one item at a time
 *  (greedily growing). The moment the window breaks a rule — here, "all items
 *  distinct" — you pull the left edge in until the rule holds again. Every item
 *  enters once and leaves once, so even with the inner shrink it's O(n), not
 *  O(n^2). Record the best window size as you go.
 *
 *  The 4 things:
 *    1. right marches forward every step           -> the window only ever grows on the right.
 *    2. on a clash, jump left PAST the old copy    -> left = max(left, lastSeen + 1).
 *    3. NEVER let left move backward (the "abba" trap) -> that's why it's max(), not just lastSeen+1.
 *    4. score AFTER fixing the window              -> best = max(best, right - left + 1).
 *
 *  Two problems that look unrelated but use the SAME grow-then-shrink live here:
 *    A) Longest Substring w/o Repeats — longest distinct run   (LeetCode #3)
 *    B) Longest unique event run      — analytics stream        (product analytics)
 *
 * ----------------------------------------------------------------------------
 *  A) LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS  (LeetCode #3)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given a string `s`, return the length of the longest substring with no
 *    repeated character.
 *
 *  Examples:
 *    "abcabcbb" -> 3   ("abc")
 *    "bbbbb"    -> 1   ("b")
 *    "pwwkew"   -> 3   ("wke")
 *    "abba"     -> 2   (the trap: when the 2nd 'a' clashes, left must NOT snap
 *                       back to the old 'a'; it stays where it already advanced to)
 *
 *  Why max() on the left jump (the subtle bit):
 *    `lastSeen` remembers where each character was last seen. When the entering
 *    char is already inside the window, the window is no longer distinct, so left
 *    must move to lastSeen + 1. But a stale `lastSeen` can point to BEFORE the
 *    current left — taking it blindly would drag left backwards, re-admitting
 *    characters and over-counting. `left = max(left, lastSeen + 1)` pins left so
 *    it only ever moves right.
 *
 *  Complexity:
 *    Time  O(n) — right visits each index once; left only moves forward.
 *    Space O(min(n, alphabet)) — the lastSeen map.
 */
export function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>(); // char -> last index it appeared at
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    const prev = lastSeen.get(char);
    if (prev !== undefined && prev >= left) {
      left = prev + 1; // jump past the old copy; prev >= left guarantees we go forward
    }
    lastSeen.set(char, right);
    // measure only after the window is valid again; +1 because both ends are inclusive
    best = Math.max(best, right - left + 1);
  }

  return best;
}

/**
 * ----------------------------------------------------------------------------
 *  B) LONGEST UNIQUE EVENT RUN  (the far-apart twin — product analytics)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A session is a list of event names ("view", "click", "view", ...). Find the
 *    longest stretch of consecutive events with no repeated event type — e.g. the
 *    deepest "exploration streak" before the user circled back to something.
 *
 *  Examples:
 *    ["view","click","scroll","view"]          -> 3  (view,click,scroll)
 *    ["view","view","view"]                     -> 1
 *    ["a","b","c","a","b","c","b","b"]          -> 3
 *
 *  Same grow-then-shrink, different tokens:
 *    Identical skeleton to #3 — only the window items are whole event strings
 *    instead of single characters, and the same max() guard keeps left honest.
 *
 *  Complexity:
 *    Time  O(n).   Space O(distinct event types).
 */
export function longestUniqueEventRun(events: string[]): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;

  for (let right = 0; right < events.length; right++) {
    const event = events[right];
    const prev = lastSeen.get(event);
    if (prev !== undefined && prev >= left) {
      left = prev + 1;
    }
    lastSeen.set(event, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
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

  // A) #3 Longest Substring Without Repeating Characters
  ck("abcabcbb -> 3", lengthOfLongestSubstring("abcabcbb") === 3);
  ck("bbbbb -> 1", lengthOfLongestSubstring("bbbbb") === 1);
  ck("pwwkew -> 3", lengthOfLongestSubstring("pwwkew") === 3);
  ck("abba -> 2 (no-backtrack trap)", lengthOfLongestSubstring("abba") === 2);
  ck("dvdf -> 3", lengthOfLongestSubstring("dvdf") === 3);
  ck("empty -> 0", lengthOfLongestSubstring("") === 0);
  ck("single -> 1", lengthOfLongestSubstring("a") === 1);
  ck("space matters: ' ' -> 1", lengthOfLongestSubstring(" ") === 1);

  // B) longest unique event run
  ck("event distinct run -> 3", longestUniqueEventRun(["view", "click", "scroll", "view"]) === 3);
  ck("event all same -> 1", longestUniqueEventRun(["view", "view", "view"]) === 1);
  ck("event mixed -> 3", longestUniqueEventRun(["a", "b", "c", "a", "b", "c", "b", "b"]) === 3);
  ck("event empty -> 0", longestUniqueEventRun([]) === 0);

  console.log(
    fail === 0
      ? "techniques/two-pointers/sliding-window/variable-distinct: all checks passed"
      : `${fail} FAILED`,
  );
}
