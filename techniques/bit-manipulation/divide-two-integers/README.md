# Divide by doubling

## TL;DR

**Is it the divide-by-doubling trick? Ask these — all yes → yes:**
1. **Forbidden from using `*` `/` `%`?** You must build the result from `+` and `-` only.
2. **Could the count/quotient be huge (up to ~2³¹)?** So looping one-at-a-time would be billions of steps — too slow.
3. **Can I double a chunk/step and subtract the biggest that fits, instead of stepping by one?** If the step can grow `×2` each round and you commit the biggest that still fits → yes. **This one is the decider.**

**Before you code, pin down:** what's the clamp range / which exact value overflows (`INT_MIN / -1`)? truncate toward zero or floor? can the divisor be `0`? is this language's `<<` fixed-width (JS = 32-bit)?

**The lines where bugs hide** (details in *How it works*):
double with `+`, **not** `<<` (32-bit overflow → infinite loop) · the `INT_MIN / -1` clamp · the sign when exactly one input is negative.

---

## What it is
Dividing `dividend ÷ divisor` is really one question: **how many times does the
divisor fit inside the dividend?** Here you must answer it using only `+`, `−`, and
comparisons — no `*`, `/`, or `%`.

The slow way: subtract the divisor over and over and count. For `43 ÷ 3` that's
3, 6, 9, … one step at a time — up to billions of steps for big numbers.

The trick: count in **doubling jumps** instead of one at a time. Start with one
divisor, then keep doubling it — 1 divisor, then 2, then 4, then 8, … (each jump is
just the previous one added to itself). Every round, take the **biggest jump that
still fits** in what's left, subtract it, write down how many divisors that jump was
worth, then repeat on the leftover.

`43 ÷ 3`, round by round:
- `24` (that's 8 threes) fits in 43 → leftover `19`
- `12` (4 threes) fits in 19 → leftover `7`
- `6` (2 threes) fits in 7 → leftover `1`
- `1` is smaller than 3 → stop. Answer = `8 + 4 + 2 = 14`.

> Built on: **Bit Manipulation** (doubling a number = `×2`). The one idea: don't
> subtract the divisor one at a time — subtract it in big doubling jumps (1×, 2×, 4×,
> 8× the divisor, always the biggest that fits) and add up how many divisors each jump
> was worth. Those counts add up to the answer.

## What you track
- `a` — what's left to divide (works on the absolute value).
- `b` — the divisor (absolute value).
- `temp` — the current chunk (`b` doubled some number of times).
- `multiple` — what that chunk is worth (`2^k`).
- `result` — the quotient being summed up.
- `sign` — computed once from the two inputs.

## How it works
Pseudocode. The three ⚠️ lines are where every bug hides — read those slowly; the
rest is filler.

```ts
if (dividend === INT_MIN && divisor === -1) {
  return INT_MAX;         // ⚠️ THE clamp. This is the one quotient that
                          //    overflows 32-bit (2^31 doesn't fit). Without
                          //    this guard it wraps to a wrong negative.
}

const isNegative = (dividend < 0) !== (divisor < 0);   // ⚠️ true only when EXACTLY one
                                                       //    input is negative; two negatives
                                                       //    cancel. Get this wrong → wrong sign.
let remaining = Math.abs(dividend);   // what's still left to divide
const absDivisor = Math.abs(divisor); // the divisor's size
let quotient = 0;                     // the answer, summed up

while (remaining >= absDivisor) {
  let chunk = absDivisor;     // a doubled copy of the divisor (absDivisor × 2^k)
  let chunkWorth = 1;         // how many divisors that chunk equals (2^k)

  while (remaining >= chunk + chunk) {  // ⚠️ double with chunk + chunk, NEVER chunk << 1.
    chunk += chunk;                     //    In JS `<<` is 32-bit SIGNED. Once chunk hits
    chunkWorth += chunkWorth;           //    2^30, chunk<<1 leaves the signed range and two
                                        //    more shifts COLLAPSE chunk to 0 (2^30 → -2^31
                                        //    → 0). Then 0<<1 stays 0, so `remaining >= chunk<<1`
                                        //    is true forever → INFINITE LOOP. `+` is safe:
                                        //    JS numbers are 64-bit floats, exact past 2^31.
  }

  remaining -= chunk;         // take the biggest chunk that fit
  quotient += chunkWorth;     // bank its worth
}

return isNegative ? -quotient : quotient;
```

**Why doubling makes it fast (the part to slow down for):** after the inner loop,
`chunk` is the largest `absDivisor × 2^k` that's `≤ remaining`. Each chunk is found in ~log steps, and
there are ~log chunks → about `O(log² n)` (roughly "number of doublings, squared").
That's **not** near-O(1): it only stays small because the **input is capped at 32
bits**, so the number of doublings is ≤ ~32 and the whole thing is ≤ ~32×32 ≈ 1024
steps. Compare ~2 billion for one-at-a-time subtraction.

Lock these three in and it can't loop forever, overflow, or flip sign:
**double with `+` not `<<`**, **the `INT_MIN / -1` clamp**, **the sign when exactly one input is negative.**

## Picture
```mermaid
flowchart TD
    A[clamp INT_MIN/-1, find isNegative, remaining=|dividend|, absDivisor=|divisor|] --> B{remaining >= absDivisor?}
    B -- no --> Z[return isNegative ? -quotient : quotient]
    B -- yes --> C[chunk = absDivisor, chunkWorth = 1]
    C --> D{remaining >= chunk + chunk?}
    D -- yes --> E[chunk += chunk; chunkWorth += chunkWorth]
    E --> D
    D -- no --> F[remaining -= chunk; quotient += chunkWorth]
    F --> B
```

## Where you'll meet it (practice + recognition)

**On LeetCode (and similar platforms):**
- **#29 Divide Two Integers** — divide without `*`, `/`, `%`, truncate toward zero, clamp to 32-bit. The inner loop doubles `b` to find the biggest `b × 2^k ≤ a`, subtracts it, and adds `2^k` to the quotient (this note's code).
- **#50 Pow(x, n)** — fast power by repeated doubling/squaring: instead of multiplying `x` by itself `n` times, square the base and halve the exponent. Same "grow the step `×2` each round" idea, applied to exponents instead of a quotient.

**Real life / other platforms:**
- **Exponential ("galloping") search** — double a probe index until the value there overshoots the target, then binary-search the bracket you just pinned down. Finds a bound in a huge, unbounded, or paginated sorted source without scanning linearly.
- **Fixed-point math on hardware with no integer divide** — build division out of shifts/adds because the chip has no divide instruction.

**Looks like it but ISN'T:** a plain `x << 1` used as a fast `×2` is **not** this trick — that's just a single bit op, no doubling loop, no "biggest chunk that fits". And note **exponential search = this note's doubling + binary search composed**: the doubling loop pins the bracket, then binary search finishes inside it (the sibling trick — see [`../../search/binary-search/find-target/README.md`](../../search/binary-search/find-target/README.md)).

---

Solution code (both disguises, fully commented, plus the buggy `<<` version): [`solution.ts`](./solution.ts).
