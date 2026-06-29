/**
 * ============================================================================
 *  THE BUILDING BLOCK: idempotency keys — exactly-once under retries
 * ============================================================================
 *
 *  Networks lose responses, not just requests. A client charges a card, the
 *  charge succeeds, the 200 never arrives, the client retries — and now you've
 *  billed twice. You cannot stop the retry (it's correct behaviour), so you make
 *  the SECOND attempt a no-op that returns the FIRST result.
 *
 *  How: the client sends a unique IDEMPOTENCY KEY with the request (a UUID it
 *  picks per logical operation, reused across retries of that same operation).
 *  The server, keyed by it:
 *    - first time it sees the key → run the operation ONCE, store the result.
 *    - any later time → skip the operation, return the stored result.
 *  Net effect: the side effect (the charge) happens exactly once; the client can
 *  retry safely forever.
 *
 *  This is the same "have I seen this key?" core as a hashmap/Set seen-guard
 *  (see techniques/hashing/two-sum — the webhook replay guard). The twist here:
 *  we don't just detect the dupe, we REPLAY the original outcome so the retry
 *  still gets its answer.
 *
 *  Two faces of the same idea:
 *    A) idempotent(store, key, op) — wrap any effectful op so retries are safe
 *    B) firstReplay(ids)           — the pure "have I seen this id?" detector
 *
 * ----------------------------------------------------------------------------
 *  Complexity: O(1) per call (one map get + maybe one op run + one set).
 *  Edge cases: same key twice (op runs once), different keys (independent),
 *    op throws (we must NOT cache failure, or a transient error becomes
 *    permanent for that key).
 *  Concurrency trap (the one this in-memory version does NOT solve): two retries
 *    arriving at the same instant can both miss the store and both run the op.
 *    Real fix = a DB UNIQUE constraint on the key + row lock, so the second
 *    INSERT loses and waits for the first. See the ponytail note.
 */

export interface IdempotencyStore<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

/** Trivial in-memory store. Real one = a DB table keyed by the idempotency key. */
export class MemoryStore<T> implements IdempotencyStore<T> {
  private readonly map = new Map<string, T>();
  get(key: string): T | undefined {
    return this.map.get(key);
  }
  set(key: string, value: T): void {
    this.map.set(key, value);
  }
}

/**
 * Run `op` at most once per `key`. First call runs it and caches the result;
 * later calls with the same key return the cached result WITHOUT re-running.
 *
 * ⚠️ We check the store BEFORE running, and only cache AFTER success — caching a
 * thrown error would make a transient failure permanent for that key.
 */
export function idempotent<T>(store: IdempotencyStore<T>, key: string, op: () => T): T {
  const existing = store.get(key);
  if (existing !== undefined) {
    return existing; // retry → replay the first outcome, op never runs again.
  }
  const result = op(); // first time only. If this throws, nothing is cached.
  store.set(key, result);
  return result;
}

/**
 * ----------------------------------------------------------------------------
 *  B) THE PURE DETECTOR  (the shared core, no replay)
 * ----------------------------------------------------------------------------
 *  Same "seen this before?" Set guard as the webhook replay guard in
 *  techniques/hashing/two-sum. Returns the first id that appears twice, or null.
 */
export function firstReplay(ids: readonly string[]): string | null {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      return id;
    }
    seen.add(id);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  node solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  // The whole point: the side effect fires exactly once across retries.
  const store = new MemoryStore<{ chargeId: string }>();
  let charges = 0; // counts real side effects
  const chargeOnce = (): { chargeId: string } => {
    charges++;
    return { chargeId: `ch_${charges}` };
  };

  const first = idempotent(store, "key-A", chargeOnce);
  const retry = idempotent(store, "key-A", chargeOnce); // same key → no new charge
  ck("op ran exactly once for a repeated key", charges === 1);
  ck("retry returns the original result", retry.chargeId === first.chargeId);
  ck("first result is ch_1", first.chargeId === "ch_1");

  // Different key → independent operation, runs again.
  const other = idempotent(store, "key-B", chargeOnce);
  ck("different key runs the op again", charges === 2);
  ck("key-B got its own result", other.chargeId === "ch_2");

  // A throwing op must NOT be cached — the next retry should get another shot.
  const flaky = new MemoryStore<string>();
  let attempts = 0;
  const sometimesFails = (): string => {
    attempts++;
    if (attempts === 1) {
      throw new Error("transient");
    }
    return "ok";
  };
  let threw = false;
  try {
    idempotent(flaky, "key-C", sometimesFails);
  } catch {
    threw = true;
  }
  ck("first attempt threw", threw);
  ck("failure was not cached → retry succeeds", idempotent(flaky, "key-C", sometimesFails) === "ok");
  ck("op was retried after the failure", attempts === 2);

  // The pure detector
  ck("replay: all unique -> null", firstReplay(["a", "b", "c"]) === null);
  ck("replay: first repeat -> a", firstReplay(["a", "b", "a"]) === "a");

  console.log(fail === 0 ? "domains/fintech/idempotency-keys: all checks passed" : `${fail} FAILED`);
}
