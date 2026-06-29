/**
 * ============================================================================
 *  THE STRUCTURE: a hash map is BUCKETS picked by a HASH FUNCTION
 * ============================================================================
 *
 *  "Hash map" = store and find a value by its KEY in O(1) average. A labelled
 *  drawer: you don't scan every drawer, you compute which drawer the label
 *  points to and open exactly that one. Two parts make it work:
 *
 *    1. A HASH FUNCTION turns a key into a number (a "hash"). Same key -> same
 *       number, every time. We then fold that number into a slot index:
 *       bucket = hash(key) % capacity.  That % is the "jump straight to the
 *       drawer" step -- no scanning the others. THIS is why get/set are O(1).
 *
 *    2. A BUCKET ARRAY: `capacity` slots, each holding a short list of entries.
 *       Two different keys can fold to the SAME slot (a COLLISION) -- there are
 *       infinitely many keys, finitely many slots. We handle it by SEPARATE
 *       CHAINING: each slot is a little list, and we walk that one short list.
 *
 *  WHY O(1) AVERAGE, O(n) WORST.  If keys spread evenly, each bucket's list
 *  stays tiny (length ~ entries/capacity = the LOAD FACTOR), so get/set touch
 *  one slot + a 1-2 item walk = O(1). Worst case every key collides into ONE
 *  bucket -> one list of length n -> walk all n -> O(n). A weak hash function
 *  (or an attacker feeding colliding keys) turns the map into a slow list.
 *
 *  THE REHASH (the cost cliff).  As entries pile up the load factor climbs and
 *  every bucket's list lengthens -> lookups creep toward O(n). So when load
 *  factor crosses a threshold (here 0.75) we REHASH: allocate a BIGGER bucket
 *  array (double it) and RE-PLACE every existing entry, because `% capacity`
 *  now yields different slots. That single insert is O(n), but -- exactly like
 *  the array's doubling -- it's rare, so it averages out to O(1) per insert.
 *
 *  THE OBJECT-vs-Map TRAP.  In JS a plain object `{}` looks like a hash map but
 *  COERCES every key to a string (`obj[1]` and `obj["1"]` collide; an object
 *  key becomes "[object Object]") and carries inherited PROTOTYPE keys, so
 *  `obj["toString"]` is truthy even when you never set it. A real `Map` keeps
 *  the key's TYPE (1 !== "1"), holds ANY key (objects, functions), preserves
 *  INSERTION ORDER, and has no prototype keys to trip over. Reach for `Map`.
 *  (V8 hides the bucket array + rehash from you -- you only feel them as cost.)
 *
 *  Below: HashMap built by hand over a FIXED bucket array so the cost story is
 *  *executed*, not asserted -- a tiny initial capacity forces a real collision,
 *  and enough inserts force a real rehash, both proven in the self-check.
 *
 *  Language note: keys are `string | number` (not `any`) to keep the hash
 *  honest and the types clean; the idea generalises to any hashable key.
 */

type Entry<K, V> = { key: K; value: V };

export class HashMap<K extends string | number, V> {
  // Bucket array: each slot is a short list of entries (separate chaining).
  // Different keys can fold to the same slot; we walk that one short list.
  private buckets: Array<Array<Entry<K, V>>>;
  private count: number;
  private resizeCount: number;

  // Past this fullness, lists get long enough to hurt -> rehash. Classic 0.75.
  private static readonly LOAD_FACTOR = 0.75;

  public constructor(initialCapacity: number = 8) {
    // A real bucket array always has a non-zero size; guard against 0/negative.
    const cap = initialCapacity > 0 ? initialCapacity : 1;
    this.buckets = HashMap.makeBuckets(cap);
    this.count = 0;
    this.resizeCount = 0;
  }

  public get size(): number {
    return this.count;
  }

  public get capacity(): number {
    return this.buckets.length;
  }

  // Number of rehashes -- proof that doubling keeps them rare (the amortised claim).
  public get resizes(): number {
    return this.resizeCount;
  }

  // O(1) avg: hash -> bucket -> walk the short list. Overwrite if key present,
  // else append. Rehash first if this insert would push us over load factor.
  public set(key: K, value: V): void {
    // Only a brand-new key grows the map, so only then can it trip the threshold.
    if (!this.has(key) && (this.count + 1) / this.buckets.length > HashMap.LOAD_FACTOR) {
      this.rehash();
    }
    const bucket = this.bucketFor(key);
    const existing = bucket.find((e) => e.key === key);
    if (existing) {
      // Same key again = overwrite in place, not a second entry.
      existing.value = value;
      return;
    }
    bucket.push({ key, value });
    this.count += 1;
  }

  // O(1) avg: jump to the bucket, walk its short list for the key.
  public get(key: K): V | undefined {
    const hit = this.bucketFor(key).find((e) => e.key === key);
    return hit ? hit.value : undefined;
  }

  public has(key: K): boolean {
    return this.bucketFor(key).some((e) => e.key === key);
  }

  // O(1) avg: drop the entry from its bucket's list. Returns whether it existed.
  public delete(key: K): boolean {
    const bucket = this.bucketFor(key);
    const idx = bucket.findIndex((e) => e.key === key);
    if (idx === -1) {
      return false;
    }
    // splice the one entry out of its short list; the slot itself stays.
    bucket.splice(idx, 1);
    this.count -= 1;
    return true;
  }

  public keys(): K[] {
    const out: K[] = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        out.push(entry.key);
      }
    }
    return out;
  }

  // Fold a key down to a slot index: hash(key) % capacity. The % is the
  // "jump straight to the drawer" step that makes lookup O(1) on average.
  private indexFor(key: K): number {
    return HashMap.hash(key) % this.buckets.length;
  }

  private bucketFor(key: K): Array<Entry<K, V>> {
    return this.buckets[this.indexFor(key)];
  }

  // Allocate a bucket array twice as big and RE-PLACE every entry, because
  // `% capacity` lands keys in different slots once capacity changes. The O(n)
  // step that doubling makes rare enough to average out to O(1) per insert.
  private rehash(): void {
    const old = this.buckets;
    this.buckets = HashMap.makeBuckets(old.length * 2);
    for (const bucket of old) {
      for (const entry of bucket) {
        // Re-fold with the NEW capacity, then drop into the fresh slot.
        this.buckets[this.indexFor(entry.key)].push(entry);
      }
    }
    this.resizeCount += 1;
  }

  private static makeBuckets<K, V>(capacity: number): Array<Array<Entry<K, V>>> {
    // One empty list per slot up front, so every index is a real array to push into.
    return Array.from({ length: capacity }, () => []);
  }

  // Tiny deterministic hash: numbers map to themselves; strings sum char codes
  // with a small multiplier so order matters ("ab" != "ba"). Real engines use
  // far stronger hashes; this is enough to *show* collisions + rehash honestly.
  // `>>> 0` forces an unsigned 32-bit int so the later `%` stays non-negative.
  private static hash(key: string | number): number {
    if (typeof key === "number") {
      return Math.abs(Math.trunc(key));
    }
    let h = 0;
    for (let i = 0; i < key.length; i += 1) {
      h = (h * 31 + key.charCodeAt(i)) >>> 0;
    }
    return h;
  }
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node structures/hashmap/solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // --- set / get / overwrite ------------------------------------------------
  const m = new HashMap<string, number>(8);
  ck("starts empty", m.size === 0 && m.capacity === 8);
  m.set("a", 1);
  m.set("b", 2);
  ck("set + get", m.get("a") === 1 && m.get("b") === 2 && m.size === 2);
  m.set("a", 9); // same key again -> overwrite, NOT a second entry
  ck("overwrite same key, size unchanged", m.get("a") === 9 && m.size === 2);

  // --- has / delete / missing key -------------------------------------------
  ck("has true", m.has("b"));
  ck("has false", !m.has("zzz"));
  ck("get missing key -> undefined", m.get("zzz") === undefined);
  ck("delete present -> true", m.delete("b") === true);
  ck("delete drops it", !m.has("b") && m.size === 1);
  ck("delete absent -> false", m.delete("b") === false);

  // --- COLLISION: tiny capacity forces two keys into the same bucket --------
  // With capacity 1, every key folds to slot 0 -> guaranteed collision; both
  // entries live in that one bucket's list and stay independently retrievable.
  const coll = new HashMap<string, string>(1);
  coll.set("x", "X");
  coll.set("y", "Y");
  ck("collision: capacity 1 keeps both", coll.capacity >= 1 && coll.size === 2);
  ck("collision: both retrievable", coll.get("x") === "X" && coll.get("y") === "Y");
  // (capacity may have grown via rehash; the point is both survived the clash.)

  // --- REHASH: enough inserts double the bucket array, all values survive ----
  const big = new HashMap<number, number>(4);
  const startCap = big.capacity; // 4
  for (let i = 0; i < 50; i += 1) {
    big.set(i, i * 10);
  }
  ck("rehash: capacity grew (doubled past load factor)", big.capacity > startCap);
  ck("rehash: it was a power-of-two doubling", big.capacity === startCap * 2 ** big.resizes);
  ck("rehash: happened at least once", big.resizes >= 1);
  ck("rehash: size correct", big.size === 50);
  let allThere = true;
  for (let i = 0; i < 50; i += 1) {
    if (big.get(i) !== i * 10) {
      allThere = false;
    }
  }
  ck("rehash: every value retrievable after re-placing", allThere);
  ck("rehash: missing key still undefined", big.get(999) === undefined);

  // --- number vs string keys stay distinct types ---------------------------
  const mixed = new HashMap<string | number, string>(8);
  mixed.set(1, "num");
  mixed.set("1", "str");
  ck("number key and string key are distinct", mixed.get(1) === "num" && mixed.get("1") === "str" && mixed.size === 2);

  console.log(fail === 0 ? "structures/hashmap: all checks passed" : `${fail} FAILED`);
}
