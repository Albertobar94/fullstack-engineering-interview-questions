/**
 * ============================================================================
 *  THE BUILDING BLOCK: money is integers, never floats
 * ============================================================================
 *
 *  Rule one of fintech: a price is NOT a `number`. Floats (IEEE-754 doubles)
 *  cannot represent most decimal fractions exactly — `0.1 + 0.2 === 0.30000000000000004`.
 *  Run that across a million transactions and the books no longer balance.
 *
 *  Fix: store money as an INTEGER count of the smallest unit the currency has —
 *  "minor units" (cents for USD, pence for GBP, yen has none → 0 decimals).
 *  $19.99 is not 19.99, it's `1999n` cents. Integers add/subtract exactly.
 *  We use `bigint` so a balance can't silently overflow at ~9 quadrillion cents
 *  (Number.MAX_SAFE_INTEGER ≈ 9.007e15, i.e. ~$90 trillion — closer than you'd like).
 *
 *  The genuinely hard part is SPLITTING. Divide $10.00 three ways: 333.33… each.
 *  You cannot pay a third of a cent. Naive rounding loses (or invents) a penny —
 *  the split must sum back to EXACTLY the original. That's `allocate` below,
 *  the "largest-remainder" apportionment (Fowler, *P of EAA*): floor everyone,
 *  then hand the leftover pennies out one at a time.
 *
 *  Two uses of the SAME split, far apart:
 *    A) allocate — split a charge by ratio, penny-perfect   (the core)
 *    B) splitDividend — pay a cash dividend across shareholders by share count
 *
 * ----------------------------------------------------------------------------
 *  Complexity: add/subtract/compare O(1); allocate O(n) over the buckets.
 *  Edge cases: remainder distribution, zero amount, single bucket, currency
 *    mismatch (must throw — adding USD to EUR is a bug, not a conversion).
 *  Money trap: JS `/` on bigint truncates toward zero; we only divide
 *    non-negative amounts here so floor === trunc. Negative splits need care
 *    (see the ponytail note).
 */

export interface Money {
  readonly amount: bigint; // minor units (e.g. cents). 1999n = $19.99
  readonly currency: string; // ISO 4217 code, e.g. "USD"
}

export function money(amount: bigint, currency: string): Money {
  return { amount, currency };
}

function sameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    // Adding USD to EUR is never what you meant — convert first, explicitly.
    throw new Error(`currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  sameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  sameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  sameCurrency(a, b);
  if (a.amount < b.amount) {
    return -1;
  }
  if (a.amount > b.amount) {
    return 1;
  }
  return 0;
}

/**
 * Split `total` into len(ratios) parts proportional to `ratios`, such that the
 * parts sum back to EXACTLY `total` — no penny created or destroyed.
 *
 * Largest-remainder method:
 *   1. Give each bucket floor(total * ratio / sumRatios).
 *   2. The floors under-shoot by `remainder` minor units (0 ≤ remainder < n).
 *   3. Hand those leftover units, one each, to the first `remainder` buckets.
 *
 * Example: total = 1000 (i.e. $10.00), ratios [1,1,1]
 *   floors  = [333, 333, 333]  (sum 999)
 *   remainder = 1 → first bucket gets +1 → [334, 333, 333]  (sum 1000 ✓)
 */
export function allocate(total: bigint, ratios: readonly number[]): bigint[] {
  if (ratios.length === 0) {
    throw new Error("allocate needs at least one ratio");
  }
  if (total < 0n) {
    // ponytail: positive-amount path only. Negative totals (refund splits) flip
    // the rounding direction; add a sign-aware branch when you actually need it.
    throw new Error("allocate expects a non-negative total");
  }

  const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
  if (totalRatio <= 0) {
    throw new Error("ratios must sum to a positive number");
  }

  const shares: bigint[] = [];
  let distributed = 0n;
  for (const r of ratios) {
    // bigint floor division (trunc toward zero === floor for non-negatives).
    const share = (total * BigInt(r)) / BigInt(totalRatio);
    shares.push(share);
    distributed += share;
  }

  // The pennies the floors left on the table — strictly < number of buckets.
  let remainder = total - distributed;
  for (let i = 0; remainder > 0n; i = (i + 1) % shares.length) {
    shares[i] += 1n;
    remainder -= 1n;
  }

  return shares;
}

export function format(m: Money, minorUnitDigits = 2): string {
  const sign = m.amount < 0n ? "-" : "";
  const abs = m.amount < 0n ? -m.amount : m.amount;
  const divisor = 10n ** BigInt(minorUnitDigits);
  const major = abs / divisor;
  const minor = (abs % divisor).toString().padStart(minorUnitDigits, "0");
  return `${sign}${major}.${minor} ${m.currency}`;
}

/**
 * ----------------------------------------------------------------------------
 *  B) SPLIT A DIVIDEND  (the far-apart twin)
 * ----------------------------------------------------------------------------
 *  A company pays a total cash dividend across shareholders in proportion to
 *  how many shares each holds. Same penny-perfect split — the leftover cents
 *  must land somewhere, total paid must equal total declared.
 */
export function splitDividend(totalPayout: Money, shareCounts: readonly number[]): Money[] {
  return allocate(totalPayout.amount, shareCounts).map((amount) => money(amount, totalPayout.currency));
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
  const sum = (xs: readonly bigint[]): bigint => xs.reduce((s, x) => s + x, 0n);
  const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a, bigintReplacer) === JSON.stringify(b, bigintReplacer);
  function bigintReplacer(_key: string, value: unknown): unknown {
    return typeof value === "bigint" ? value.toString() : value;
  }

  // The reason this whole note exists:
  ck("float money is broken: 0.1 + 0.2 !== 0.3", 0.1 + 0.2 !== 0.3);
  ck("integer cents are exact: 10n + 20n === 30n", 10n + 20n === 30n);

  // allocate — penny-perfect split
  ck("allocate $10/3 -> [334,333,333]", eq(allocate(1000n, [1, 1, 1]), [334n, 333n, 333n]));
  ck("allocate $10/3 sums back to 1000", sum(allocate(1000n, [1, 1, 1])) === 1000n);
  ck("allocate $5.00 evenly /5 -> 100 each", eq(allocate(500n, [1, 1, 1, 1, 1]), [100n, 100n, 100n, 100n, 100n]));
  ck("allocate by weights [70,20,10] of 1003", eq(allocate(1003n, [70, 20, 10]), [703n, 200n, 100n]));
  ck("allocate weighted sums back", sum(allocate(1003n, [70, 20, 10])) === 1003n);
  ck("allocate single bucket gets all", eq(allocate(777n, [1]), [777n]));
  ck("allocate zero amount -> all zero", eq(allocate(0n, [1, 1, 1]), [0n, 0n, 0n]));

  // add / subtract / compare / currency guard
  ck("add same currency", add(money(1999n, "USD"), money(1n, "USD")).amount === 2000n);
  ck("subtract", subtract(money(500n, "USD"), money(199n, "USD")).amount === 301n);
  ck("compare less", compare(money(1n, "USD"), money(2n, "USD")) === -1);
  ck("compare equal", compare(money(2n, "USD"), money(2n, "USD")) === 0);
  let threw = false;
  try {
    add(money(1n, "USD"), money(1n, "EUR"));
  } catch {
    threw = true;
  }
  ck("add across currencies throws", threw);

  // format
  ck("format 1999 USD", format(money(1999n, "USD")) === "19.99 USD");
  ck("format negative", format(money(-5n, "USD")) === "-0.05 USD");

  // twin
  ck("dividend split sums to payout", sum(splitDividend(money(10000n, "USD"), [3, 1, 1]).map((m) => m.amount)) === 10000n);

  console.log(fail === 0 ? "domains/fintech/money-representation: all checks passed" : `${fail} FAILED`);
}
