/**
 * ============================================================================
 *  THE TRICK: throttle — fire at most ONCE per window, at a STEADY rate
 * ============================================================================
 *
 *  Wrap a function so that during a burst it runs at most once every `wait` ms.
 *  Unlike debounce (which waits for quiet, then fires once), throttle keeps
 *  firing at a fixed cadence WHILE the burst is happening. 50 calls in 200ms
 *  with wait=50 → ~4 calls, evenly spaced.
 *
 *  The 4 things:
 *    1. Track whether you're in cooldown          -> a `timer` handle (set =
 *       cooling down). While set, ignore the leading fire.
 *    2. Leading edge fires immediately            -> the FIRST call runs now,
 *       then the gate closes for `wait` ms.
 *    3. Remember the LAST call made during cooldown -> save its args; fire them
 *       when the window ends. Skip this and you DROP the final call (classic bug).
 *    4. Capture `this` and `args`                 -> fn.apply(savedThis, args),
 *       same as debounce, so methods and latest args work.
 *
 *  Two uses that look unrelated but are the SAME throttle:
 *    A) Scroll / mousemove handler — run at a steady rate, not every pixel (frontend)
 *    B) Outbound API rate-limit     — at most N calls per window to a flaky API (backend)
 *
 * ----------------------------------------------------------------------------
 *  A) THROTTLE  (GreatFrontEnd "Throttle" — the classic, leading + trailing)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Return a throttled copy of `fn` that runs at most once per `wait` ms. The
 *    first call fires immediately; calls during the window are coalesced into one
 *    trailing call at the window's end (with the latest args).
 *
 *  Example (wait = 100ms):
 *    calls at 0, 30, 60, 200ms -> fires at 0 (args@0), at 100 (args@60), at 200.
 *
 *  Why save the trailing args (the subtle bit):
 *    The naive throttle only does the leading fire and drops everything during the
 *    window — so the LAST position of a scroll/drag never lands. Saving the last
 *    args and flushing them when the window closes fixes that.
 *
 *  Complexity:
 *    Time  O(1) per call.   Space O(1) — a timer handle + the saved last args.
 */
type AnyFn = (...args: never[]) => unknown;

export function throttle<T extends AnyFn>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null; // set = in cooldown
  let lastArgs: Parameters<T> | null = null; // a call arrived during cooldown
  let lastThis: unknown = null;

  // Opens the gate; if a call was queued during the window, fire it now and
  // start a fresh window (so a continuous burst keeps a steady cadence).
  function openGate(): void {
    if (lastArgs !== null) {
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
      timer = setTimeout(openGate, wait); // ⚠️ re-arm: the trailing fire opens its own window
    } else {
      timer = null; // truly idle — next call fires immediately
    }
  }

  return function throttled(this: unknown, ...args: Parameters<T>): void {
    if (timer !== null) {
      // In cooldown: remember only the LATEST call, to flush at window's end.
      lastArgs = args;
      lastThis = this;
      return;
    }
    fn.apply(this, args); // leading edge — fire now
    timer = setTimeout(openGate, wait); // close the gate for `wait` ms
  };
}

/**
 * ----------------------------------------------------------------------------
 *  B) OUTBOUND API RATE-LIMIT  (the far-apart twin — backend, not a UI)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    A flaky third-party API allows ~1 request per `windowMs`. You fire many, but
 *    only one per window should hit the wire — the latest intent wins. Same shape
 *    as the scroll handler, different domain.
 *
 *  It's `throttle(sendRequest, windowMs)`. Named separately only to show the trick
 *  is domain-agnostic: "steady cadence under a flood" whether it's pixels or HTTP.
 */
export function makeRateLimiter<T extends AnyFn>(
  send: T,
  windowMs: number,
): (...args: Parameters<T>) => void {
  return throttle(send, windowMs);
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

    // Leading edge: the first call fires immediately.
    const calls: number[] = [];
    const t = throttle((n: number) => calls.push(n), 50);
    t(1);
    ck("leading fired immediately", calls.length === 1 && calls[0] === 1);

    // Calls during the window are swallowed except the LAST, flushed at window end.
    t(2);
    t(3);
    ck("during window: still just the leading call", calls.length === 1);
    await sleep(80);
    ck("trailing flushed with last args", calls.length === 2 && calls[1] === 3);

    // After it settles, the next call fires immediately again.
    await sleep(80);
    t(7);
    ck("post-idle call fires immediately", calls.length === 3 && calls[2] === 7);

    // `this` binding survives on both leading and trailing fires.
    const obj = {
      hits: [] as number[],
      tick: throttle(function (this: { hits: number[] }, n: number) {
        this.hits.push(n);
      }, 50),
    };
    obj.tick(1); // leading
    obj.tick(2); // trailing
    await sleep(80);
    ck("this binding works on both edges", obj.hits.length === 2 && obj.hits[1] === 2);

    console.log(
      fail === 0 ? "frontend/rate-limiting/throttle: all checks passed" : `${fail} FAILED`,
    );
  }

  void run();
}
