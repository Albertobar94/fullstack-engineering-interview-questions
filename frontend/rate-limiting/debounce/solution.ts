/**
 * ============================================================================
 *  THE TRICK: debounce — wait until the calls STOP, then fire ONCE
 * ============================================================================
 *
 *  Wrap a function so that rapid-fire calls collapse into a single call that
 *  runs only after things go quiet for `wait` ms. Every new call cancels the
 *  pending one and restarts the timer. A burst of 50 calls in 200ms → 1 call.
 *
 *  The 4 things:
 *    1. ONE timer handle, kept in the closure  -> shared across calls so the
 *       next call can cancel the previous one. Declared INSIDE the returned fn
 *       it would reset every call and never debounce.
 *    2. clearTimeout(timer) FIRST, every call   -> this is the whole trick. Skip
 *       it and the function fires on every call (no debounce at all).
 *    3. Capture `this` and `args`               -> call fn.apply(savedThis, args)
 *       so it works as a method and fires with the LATEST arguments.
 *    4. Trailing edge by default                -> fires at the END of the burst.
 *       (Leading edge = fire on the first call instead; shown below.)
 *
 *  Two uses that look unrelated but are the SAME debounce:
 *    A) Search-as-you-type  — wait until the user stops typing (frontend)
 *    B) File-watch reload    — one "save" fires many fs events; reload once (backend)
 *
 * ----------------------------------------------------------------------------
 *  A) DEBOUNCE  (GreatFrontEnd "Debounce" — the classic)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Return a debounced copy of `fn` that postpones running until `wait` ms have
 *    passed since the LAST time it was invoked.
 *
 *  Example (wait = 100ms):
 *    call at 0ms, 40ms, 90ms  -> fn runs once, at 190ms, with the 90ms args.
 *
 *  Why the closure timer + clearTimeout (the subtle bits):
 *    `timer` lives in the closure so each call can cancel the one before it. Clear
 *    it first, then set a fresh timer. Drop the clear and you've debounced nothing.
 *
 *  Complexity:
 *    Time  O(1) per call.   Space O(1) — a single timer handle.
 */
// `never[]` for args makes the generic accept any function while staying strict.
type AnyFn = (...args: never[]) => unknown;

export function debounce<T extends AnyFn>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null; // shared across calls

  return function debounced(this: unknown, ...args: Parameters<T>): void {
    if (timer !== null) {
      clearTimeout(timer); // cancel the pending run — THE trick
    }
    // Capture `this` so it still works when used as an object method.
    const savedThis = this;
    timer = setTimeout(() => {
      timer = null;
      fn.apply(savedThis, args); // fire with the LATEST args
    }, wait);
  };
}

/**
 * ----------------------------------------------------------------------------
 *  A') LEADING-EDGE DEBOUNCE (fire on the FIRST call, ignore the rest of the burst)
 * ----------------------------------------------------------------------------
 *  Same machinery; the difference is WHEN it fires. Useful for "submit on first
 *  click, ignore the double-click that follows".
 */
export function debounceLeading<T extends AnyFn>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function debounced(this: unknown, ...args: Parameters<T>): void {
    const isIdle = timer === null; // no burst in progress?
    if (timer !== null) {
      clearTimeout(timer);
    }
    if (isIdle) {
      fn.apply(this, args); // fire immediately on the leading edge
    }
    // The timer just marks "burst still going"; clearing it each call extends it.
    timer = setTimeout(() => {
      timer = null;
    }, wait);
  };
}

/**
 * ----------------------------------------------------------------------------
 *  B) FILE-WATCH RELOAD  (the far-apart twin — backend, not a UI at all)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A file watcher fires several "changed" events for a single editor save. You
 *    want to reload config ONCE, after the writes settle — same shape as the
 *    search-as-you-type debounce, just a different domain.
 *
 *  This is literally `debounce(reloadConfig, 200)` wired to the watcher. We expose
 *  it as its own function only to show the trick is domain-agnostic.
 */
export function makeCoalescer<T extends AnyFn>(
  onSettled: T,
  quietMs: number,
): (...args: Parameters<T>) => void {
  return debounce(onSettled, quietMs);
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts
// (Uses real timers + small waits; resolves when the async checks finish.)
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function run(): Promise<void> {
    let fail = 0;
    const ck = (name: string, cond: boolean): void => {
      if (!cond) {
        fail++;
        console.log("FAIL:", name);
      }
    };

    // Trailing: a burst collapses to ONE call, with the last args.
    const calls: number[] = [];
    const d = debounce((n: number) => calls.push(n), 50);
    d(1);
    d(2);
    d(3);
    ck("trailing: nothing fired yet", calls.length === 0);
    await sleep(80);
    ck("trailing: fired once", calls.length === 1);
    ck("trailing: fired with last args", calls[0] === 3);

    // A second, separated burst fires again.
    d(9);
    await sleep(80);
    ck("trailing: second burst fired", calls.length === 2 && calls[1] === 9);

    // `this` binding survives.
    const obj = {
      total: 0,
      add: debounce(function (this: { total: number }, n: number) {
        this.total += n;
      }, 50),
    };
    obj.add(5);
    await sleep(80);
    ck("this binding works", obj.total === 5);

    // Leading: fires on the FIRST call, swallows the rest of the burst.
    const led: number[] = [];
    const dl = debounceLeading((n: number) => led.push(n), 50);
    dl(1);
    dl(2);
    dl(3);
    ck("leading: fired immediately once", led.length === 1 && led[0] === 1);
    await sleep(80);
    ck("leading: burst swallowed", led.length === 1);

    console.log(
      fail === 0 ? "frontend/rate-limiting/debounce: all checks passed" : `${fail} FAILED`,
    );
  }

  void run();
}
