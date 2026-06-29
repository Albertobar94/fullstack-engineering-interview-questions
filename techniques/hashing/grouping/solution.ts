/**
 * ============================================================================
 *  THE TRICK: group-by — bucket a flat list by a key into Map<key, items[]>.
 * ============================================================================
 *
 *  Walk the list once. For each item, compute a KEY (a field, or something
 *  derived from the item) and append the item to that key's bucket. You end up
 *  with a Map from key → the list of items that share it.
 *
 *  Worked example — numbers by parity:
 *    groupBy([1,2,3,4], n => n % 2 === 0 ? "even" : "odd")
 *      => Map { "odd" => [1,3], "even" => [2,4] }
 *
 *  The 3 things to lock in:
 *    1. Use a `Map`, NOT a plain object `{}`. A plain object (a) coerces every
 *       key to a string, (b) carries inherited keys (`__proto__`, `constructor`)
 *       that collide with real data, and (c) REORDERS integer-like keys to
 *       ascending numeric order — so `{2:…, 1:…}` iterates as 1,2. A Map takes
 *       keys of any type, has no prototype, and preserves FIRST-SEEN order.
 *    2. `get(key) ?? []` before you push. The first item of every new group has
 *       no bucket yet; without the `?? []` you push onto `undefined` and throw
 *       (or, worse, silently drop it if you guard wrong).
 *    3. `keyOf` must be TOTAL and deterministic — it returns a key of one stable
 *       type for EVERY item. A keyer that returns `undefined` for some items
 *       lumps them all under the `undefined` bucket by accident.
 *
 *  Group-by vs its two look-alikes (the recognition line):
 *    - COUNTING / frequency collapses each bucket to a NUMBER (Map<key, number>).
 *      Group-by KEEPS the items.
 *    - PIVOT reshapes into a rectangular grid with blanks for missing cells. It
 *      is BUILT ON group-by (bucket first, then place into a grid) — see
 *      frontend/tables/popular-timeslots.
 *
 *  Complexity (n items): O(n) appends × the cost of `keyOf`. For Group Anagrams
 *  the key is the sorted letters, so O(n · L log L) for words of length L.
 *  Space O(n) — every item lands in exactly one bucket.
 *
 *  Edge cases: empty list → empty Map; a key literally named "__proto__" or
 *  "constructor" (a Map handles it, a plain object does not); numeric keys whose
 *  first-seen order must survive (a Map keeps it, an object reorders them).
 */

/** Bucket a flat list by a derived key. Map<key, items[]>, first-seen order. */
export function groupBy<T, K>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item); // ⚠️ total + deterministic, one stable key type
    const bucket = groups.get(key) ?? []; // ⚠️ default [] for a first-seen key
    bucket.push(item);
    groups.set(key, bucket);
  }
  return groups;
}

/**
 * ----------------------------------------------------------------------------
 *  A) GROUP ANAGRAMS  (LeetCode #49 — the canonical group-by)
 * ----------------------------------------------------------------------------
 *  Words are anagrams iff their letters sorted are identical: "eat","tea","ate"
 *  all sort to "aet". So the group KEY is the sorted-letter signature, and the
 *  whole problem is one `groupBy` then take the buckets.
 */
export function groupAnagrams(words: readonly string[]): string[][] {
  const groups = groupBy(words, (word) => [...word].sort().join(""));
  return [...groups.values()];
}

/**
 * ----------------------------------------------------------------------------
 *  B) GROUP LOG LINES BY LEVEL  (the far-apart twin — observability, no algorithm
 *     contest in sight)
 * ----------------------------------------------------------------------------
 *  Same primitive, different domain: a flat stream of log lines bucketed by
 *  severity so you can show "12 errors, 4 warnings". The key is just a field.
 */
export interface LogLine {
  level: "info" | "warn" | "error";
  message: string;
}

export function groupByLevel(lines: readonly LogLine[]): Map<string, LogLine[]> {
  return groupBy(lines, (line) => line.level);
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

  // Basic: parity buckets, both items kept (the "first item dropped" trap).
  const parity = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd"));
  ck("two buckets", parity.size === 2);
  ck("odd bucket = [1,3,5]", parity.get("odd")?.join() === "1,3,5");
  ck("even bucket = [2,4]", parity.get("even")?.join() === "2,4");

  // Empty input → empty Map, no crash.
  ck("empty -> empty Map", groupBy([] as number[], (n) => n).size === 0);

  // Map preserves FIRST-SEEN key order — even for numeric keys, where a plain
  // object would reorder to ascending. First seen here is 3, then 1, then 2.
  const byNum = groupBy([3, 1, 3, 2, 1], (n) => n);
  ck("numeric keys keep first-seen order", [...byNum.keys()].join() === "3,1,2");
  ck("numeric bucket 3 = [3,3]", byNum.get(3)?.join() === "3,3");

  // The prototype-key trap: a key literally named "__proto__" is real data in a
  // Map (a plain object would mishandle the assignment).
  const proto = groupBy(["a", "__proto__", "__proto__"], (w) => w);
  ck("__proto__ is a real key", proto.get("__proto__")?.length === 2);
  ck("two distinct keys", proto.size === 2);

  // LeetCode #49: anagrams share a sorted-letter signature.
  const anagrams = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  ck("3 anagram groups", anagrams.length === 3);
  ck(
    "group sizes 3,2,1",
    anagrams
      .map((g) => g.length)
      .sort((a, b) => b - a)
      .join() === "3,2,1",
  );

  // Twin: log lines bucketed by severity.
  const logs = groupByLevel([
    { level: "info", message: "boot" },
    { level: "error", message: "db down" },
    { level: "info", message: "ready" },
    { level: "error", message: "retry failed" },
  ]);
  ck("info x2", logs.get("info")?.length === 2);
  ck("error x2", logs.get("error")?.length === 2);
  ck("no warn bucket", logs.get("warn") === undefined);

  console.log(
    fail === 0
      ? "techniques/hashing/grouping: all checks passed"
      : `${fail} FAILED`,
  );
}
