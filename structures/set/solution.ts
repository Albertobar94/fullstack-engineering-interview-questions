/**
 * ============================================================================
 *  THE STRUCTURE: a set is a HASH MAP WITH KEYS ONLY (no values)
 * ============================================================================
 *
 *  "Set" = a bag that ignores duplicates. Its one superpower: answer
 *  "have I seen this before?" in O(1) average time. That is the *exact* job a
 *  hash map does for keys -- so physically a set IS a hash map you throw the
 *  values away from. Same machinery underneath:
 *
 *    - HASH the item to a number, mod it down to a bucket index. One jump to
 *      the right bucket -> no scan of the whole collection. THIS is why
 *      add / has / delete are O(1) on average.
 *
 *    - COLLISIONS happen: two different items hash to the same bucket. We chain
 *      them -- each bucket holds a short list, and `has` scans only that one
 *      tiny list, not the whole set. With a good hash the lists stay ~1 long.
 *
 *    - LOAD FACTOR: items / buckets. Let it climb and chains lengthen and O(1)
 *      rots toward O(n). So past 0.75 we REHASH: allocate ~2x buckets and
 *      re-place every item (its bucket index depends on bucket count, so old
 *      slots are meaningless). Rehash is O(n) but rare -> averaged away, like
 *      array doubling.
 *
 *  WORST CASE is O(n): a bad/adversarial hash funnels everything into one
 *  bucket -> one long chain -> `has` walks all n. Average O(1) assumes spread.
 *
 *  SET ALGEBRA. Because a set is just membership, the classic operations fall
 *  out cheaply and we return NEW sets (immutable -- never mutate the inputs):
 *    - union(A, B)        : in A OR B
 *    - intersection(A, B) : in A AND B
 *    - difference(A, B)   : in A but NOT B
 *
 *  THE ABSTRACTION vs THE METAL. JS gives you `Set` -- and it adds two things a
 *  raw hash bag doesn't: it KEEPS INSERTION ORDER (iterating yields items in the
 *  order added), and it compares by VALUE IDENTITY via SameValueZero, so `NaN`
 *  IS findable (unlike `NaN === NaN`) and `+0`/`-0` count as the same key. This
 *  hand-built HashSet shows the bucket machinery underneath; it does not model
 *  JS's insertion-order guarantee.
 *
 *  Language trap: number keys and string keys can collide in one bag here
 *  because we stringify for hashing -- `1` and `"1"` would share a slot. JS's
 *  native `Set` keeps them DISTINCT (1 !== "1"). We key by type-tagged string to
 *  preserve that distinction.
 */

type SetItem = string | number;

export class HashSet {
  // Each bucket is a short list of items (separate chaining for collisions).
  private buckets: Array<SetItem[]>;
  private count: number;
  private rehashCount: number;

  // Past this fullness (items / buckets) chains lengthen -> rehash to keep O(1).
  private static readonly LOAD_FACTOR = 0.75;

  public constructor(initialCapacity: number = 8) {
    const cap = initialCapacity > 0 ? initialCapacity : 1;
    this.buckets = HashSet.makeBuckets(cap);
    this.count = 0;
    this.rehashCount = 0;
  }

  public get size(): number {
    return this.count;
  }

  // Buckets allocated -- proof a rehash grew the table.
  public get capacity(): number {
    return this.buckets.length;
  }

  // Times the table was reallocated -- the rare O(n) step doubling makes rare.
  public get rehashes(): number {
    return this.rehashCount;
  }

  // O(1) avg: hash -> bucket -> scan that one short chain.
  public has(item: SetItem): boolean {
    const bucket = this.buckets[this.bucketIndexOf(item)];
    return bucket.some((existing) => HashSet.sameKey(existing, item));
  }

  // O(1) avg: duplicate add is a no-op (a set ignores repeats). Rehash on overflow.
  public add(item: SetItem): this {
    const bucket = this.buckets[this.bucketIndexOf(item)];
    if (bucket.some((existing) => HashSet.sameKey(existing, item))) {
      return this;
    }
    bucket.push(item);
    this.count += 1;
    // Grow BEFORE the load factor is exceeded, so chains never run long.
    if (this.count / this.buckets.length > HashSet.LOAD_FACTOR) {
      this.rehash();
    }
    return this;
  }

  // O(1) avg: drop from its chain. Returns whether it was present.
  public delete(item: SetItem): boolean {
    const bucket = this.buckets[this.bucketIndexOf(item)];
    const at = bucket.findIndex((existing) => HashSet.sameKey(existing, item));
    if (at === -1) {
      return false;
    }
    // Splice the one element out of its short chain -- O(chain length) ~ O(1).
    bucket.splice(at, 1);
    this.count -= 1;
    return true;
  }

  // All live items (no order guarantee -- a raw hash bag has none).
  public values(): SetItem[] {
    const out: SetItem[] = [];
    for (const bucket of this.buckets) {
      for (const item of bucket) {
        out.push(item);
      }
    }
    return out;
  }

  // in A OR B -> NEW set, inputs untouched.
  public union(other: HashSet): HashSet {
    const result = new HashSet();
    for (const item of this.values()) {
      result.add(item);
    }
    for (const item of other.values()) {
      result.add(item);
    }
    return result;
  }

  // in A AND B -> NEW set. Iterate the smaller side, probe the larger (cheaper).
  public intersection(other: HashSet): HashSet {
    const result = new HashSet();
    const [small, large] = this.count <= other.count ? [this, other] : [other, this];
    for (const item of small.values()) {
      if (large.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  // in A but NOT B -> NEW set.
  public difference(other: HashSet): HashSet {
    const result = new HashSet();
    for (const item of this.values()) {
      if (!other.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  // Allocate ~2x buckets and re-place every item: an item's bucket index depends
  // on bucket count, so old positions are meaningless after the table grows.
  private rehash(): void {
    const old = this.buckets;
    this.buckets = HashSet.makeBuckets(old.length * 2);
    this.rehashCount += 1;
    for (const bucket of old) {
      for (const item of bucket) {
        this.buckets[this.bucketIndexOf(item)].push(item);
      }
    }
  }

  private bucketIndexOf(item: SetItem): number {
    return HashSet.hash(item) % this.buckets.length;
  }

  // Type-tagged so `1` and `"1"` never collide -- mirrors JS Set keeping them distinct.
  private static keyOf(item: SetItem): string {
    return `${typeof item}:${String(item)}`;
  }

  private static sameKey(a: SetItem, b: SetItem): boolean {
    return HashSet.keyOf(a) === HashSet.keyOf(b);
  }

  // Tiny deterministic string hash (djb2-style). Non-negative int.
  private static hash(item: SetItem): number {
    const key = HashSet.keyOf(item);
    let h = 5381;
    for (let i = 0; i < key.length; i += 1) {
      // h * 33 + charCode, kept in 32-bit range via the >>> 0 below.
      h = (h * 33 + key.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  private static makeBuckets(size: number): Array<SetItem[]> {
    const buckets: Array<SetItem[]> = new Array<SetItem[]>(size);
    for (let i = 0; i < size; i += 1) {
      buckets[i] = [];
    }
    return buckets;
  }
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/set/solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // --- add / has ------------------------------------------------------------
  const s = new HashSet();
  s.add("apple");
  s.add("banana");
  ck("has added item", s.has("apple") && s.has("banana"));
  ck("missing item -> false", !s.has("cherry"));
  ck("size counts adds", s.size === 2);

  // --- duplicate add is a no-op --------------------------------------------
  s.add("apple");
  ck("duplicate add does not grow size", s.size === 2);

  // --- delete ---------------------------------------------------------------
  ck("delete present -> true", s.delete("apple"));
  ck("deleted item gone", !s.has("apple"));
  ck("delete drops size", s.size === 1);
  ck("delete absent -> false", !s.delete("apple"));

  // --- number vs string key stay distinct (JS Set semantics) ---------------
  const mixed = new HashSet();
  mixed.add(1);
  mixed.add("1");
  ck("1 and \"1\" are distinct keys", mixed.size === 2 && mixed.has(1) && mixed.has("1"));

  // --- rehash: start tiny, add many, all still found ------------------------
  const grow = new HashSet(2);
  const members = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  for (const m of members) {
    grow.add(m);
  }
  ck("rehash happened (table grew)", grow.rehashes >= 1 && grow.capacity > 2);
  ck("all members survive rehash", members.every((m) => grow.has(m)));
  ck("size correct after rehash", grow.size === members.length);
  ck("values() count matches size", grow.values().length === grow.size);

  // --- explicit collision in one bucket (no rehash) -------------------------
  // Build a 4-bucket table and find two distinct strings sharing a bucket,
  // then assert both are retrievable from that shared chain.
  const buckets = 4;
  const hashMod = (str: string): number => {
    let h = 5381;
    const key = `string:${str}`;
    for (let i = 0; i < key.length; i += 1) {
      h = (h * 33 + key.charCodeAt(i)) >>> 0;
    }
    return h % buckets;
  };
  let x = "";
  let y = "";
  outer: for (const c1 of "abcdefghij") {
    for (const c2 of "abcdefghij") {
      if (c1 !== c2 && hashMod(c1) === hashMod(c2)) {
        x = c1;
        y = c2;
        break outer;
      }
    }
  }
  ck("found two colliding keys", x !== "" && y !== "");
  const coll = new HashSet(buckets);
  coll.add(x);
  coll.add(y);
  ck("both colliding keys retrievable", coll.has(x) && coll.has(y) && coll.size === 2);
  ck("no rehash at 2/4 load", coll.rehashes === 0);

  // --- set algebra: union / intersection / difference -----------------------
  const A = new HashSet();
  [1, 2, 3].forEach((n) => A.add(n));
  const B = new HashSet();
  [2, 3, 4].forEach((n) => B.add(n));

  const u = A.union(B);
  ck("union has all of both", [1, 2, 3, 4].every((n) => u.has(n)) && u.size === 4);

  const i = A.intersection(B);
  ck("intersection has only shared", i.has(2) && i.has(3) && !i.has(1) && !i.has(4) && i.size === 2);

  const d = A.difference(B);
  ck("difference has only A-not-B", d.has(1) && !d.has(2) && !d.has(3) && d.size === 1);

  // inputs untouched (immutability)
  ck("union left A intact", A.size === 3 && A.has(1));
  ck("union left B intact", B.size === 3 && B.has(4));

  console.log(fail === 0 ? "structures/set: all checks passed" : `${fail} FAILED`);
}
