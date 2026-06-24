/**
 * ============================================================================
 *  THE TRICK: two markers starting at both ends, walking toward the middle
 * ============================================================================
 *
 *  Put one pointer at the start and one at the end. Compare. Move the side that
 *  brings you closer to the goal. Works because the data is sorted or symmetric,
 *  so the comparison reliably tells you which way to go. One pass, no extra memory.
 *
 *  Two problems that look unrelated but share the SAME mechanic live here:
 *    A) Two Sum II (sorted) — pair that sums to a target   (LeetCode #167)
 *    B) Valid Palindrome    — reads the same both ways      (LeetCode #125)
 *
 * ----------------------------------------------------------------------------
 *  A) TWO SUM II — INPUT ARRAY IS SORTED  (LeetCode #167)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    `numbers` is sorted in NON-DECREASING order. Return the 1-BASED indices of
 *    the two numbers that add up to `target`. Exactly one solution exists, and
 *    you may not use the same element twice.
 *
 *  Examples:
 *    numbers = [2,7,11,15], target = 9   -> [1,2]   (2 + 7)
 *    numbers = [2,3,4],     target = 6   -> [1,3]   (2 + 4)
 *    numbers = [-1,0],      target = -1  -> [1,2]   (-1 + 0)
 *
 *  Approach — converge from both ends:
 *    sum = numbers[left] + numbers[right]
 *      sum === target -> found
 *      sum  <  target -> need a bigger total -> left++  (next larger number)
 *      sum  >  target -> need a smaller total -> right-- (next smaller number)
 *
 *  Why it cannot miss a pair (the subtle bit):
 *    Sorted order means moving `left` right only RAISES the sum, moving `right`
 *    left only LOWERS it. If the sum is too big, then numbers[right] paired with
 *    anything still to its left is also too big — so discarding `right` throws
 *    away only impossible candidates. Each step eliminates a whole batch, so one
 *    sweep is exhaustive.
 *
 *  Why this beats the hashmap here:
 *    The array is already sorted, so we get O(1) extra space instead of O(n).
 *    (On an UNSORTED array you'd reach for the hashmap "Two Sum" instead — same
 *    question, different trick, because the input changed. That contrast is the
 *    whole point.)
 *
 *  Complexity:
 *    Time  O(n) — left and right together move at most n steps.
 *    Space O(1) — just two indices.
 */
export function twoSumSorted(numbers: number[], target: number): [number, number] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      // +1 because the problem wants 1-based indices.
      return [left + 1, right + 1];
    }

    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  // Guaranteed to exist by the problem; throw keeps the return type honest.
  throw new Error("No two numbers add up to the target.");
}

/**
 * ----------------------------------------------------------------------------
 *  B) VALID PALINDROME  (LeetCode #125 — the far-apart twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given a string, consider only alphanumeric characters and ignore case.
 *    Return true if it reads the same forwards and backwards.
 *
 *  Examples:
 *    "A man, a plan, a canal: Panama"  -> true   ("amanaplanacanalpanama")
 *    "race a car"                      -> false
 *    " "                               -> true   (no alphanumerics -> empty -> palindrome)
 *
 *  Same both-ends skeleton, different decision:
 *    Two Sum II moves ONE pointer based on magnitude. Here we compare the two end
 *    characters for EQUALITY: equal -> step BOTH inward; different -> not a
 *    palindrome. We also skip characters that don't count (punctuation, spaces).
 *
 *  Complexity:
 *    Time  O(n) — each character is visited at most once.
 *    Space O(1) — two indices; no cleaned-up copy of the string is built.
 */
export function isPalindrome(s: string): boolean {
  const isAlphanumeric = (c: string): boolean => /[a-z0-9]/i.test(c);

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) {
      left++;
    }
    while (left < right && !isAlphanumeric(s[right])) {
      right--;
    }

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
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
  const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

  ck("twoSumSorted example 1 -> [1,2]", eq(twoSumSorted([2, 7, 11, 15], 9), [1, 2]));
  ck("twoSumSorted example 2 -> [1,3]", eq(twoSumSorted([2, 3, 4], 6), [1, 3]));
  ck("twoSumSorted negatives -> [1,2]", eq(twoSumSorted([-1, 0], -1), [1, 2]));

  ck("palindrome: panama -> true", isPalindrome("A man, a plan, a canal: Panama") === true);
  ck("palindrome: race a car -> false", isPalindrome("race a car") === false);
  ck("palindrome: spaces only -> true", isPalindrome(" ") === true);
  ck("palindrome: 0P -> false (case/alnum edge)", isPalindrome("0P") === false);

  console.log(
    fail === 0 ? "techniques/two-pointers/opposite-ends: all checks passed" : `${fail} FAILED`,
  );
}
