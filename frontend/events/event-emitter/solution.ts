/**
 * ============================================================================
 *  THE TRICK: event emitter — a phone book of callbacks, fired by name
 * ============================================================================
 *
 *  Keep a map of `eventName -> list of listener functions`. `on` adds a listener,
 *  `off` removes one, `emit` calls every listener registered under that name with
 *  the arguments you pass. That's the whole publish/subscribe ("pub-sub") pattern:
 *  the part that fires an event doesn't know or care who's listening.
 *
 *  The 4 things:
 *    1. Store listeners per name in a Map     -> name -> Function[]. Create the
 *       array lazily on first `on`.
 *    2. emit iterates over a COPY (snapshot)  -> a listener that adds/removes
 *       listeners mid-emit must NOT corrupt the loop. Skip the copy and you get
 *       skipped listeners or an infinite loop.
 *    3. off removes ONE instance, not all     -> the same function can be added
 *       twice; off should peel off a single copy (indexOf + splice once).
 *    4. emit returns whether anyone heard it   -> true if >=1 listener fired, else
 *       false (matches Node's EventEmitter).
 *
 *  Two uses that look unrelated but are the SAME emitter:
 *    A) Browser/UI events    — a button bus: on("click", …); emit("click", e)
 *    B) Backend domain bus    — on("order.created", …); emit("order.created", order)
 *
 * ----------------------------------------------------------------------------
 *  A) EVENT EMITTER  (GreatFrontEnd "Event Emitter" — the classic, Node-style)
 * ----------------------------------------------------------------------------
 *  API:
 *    on(name, listener)    -> subscribe; returns `this` so calls can chain.
 *    off(name, listener)   -> remove ONE matching listener; returns `this`.
 *    emit(name, ...args)   -> call every listener for `name`; returns true if any
 *                             fired, false if there were none.
 *    once(name, listener)  -> fire at most once, then auto-remove (common extension).
 *
 *  Example:
 *    const ee = new EventEmitter();
 *    const log = (x: number) => console.log(x);
 *    ee.on("tick", log);
 *    ee.emit("tick", 1);   // logs 1, returns true
 *    ee.off("tick", log);
 *    ee.emit("tick", 2);   // nothing, returns false
 *
 *  Why the snapshot in emit (the subtle bit):
 *    If a listener calls off() (e.g. a `once`) or on() during emit, mutating the
 *    live array mid-loop shifts indices -> you skip the next listener or loop
 *    forever. Iterating a `.slice()` copy makes emit see a stable set.
 *
 *  Complexity:
 *    on  O(1).   off O(k) for k listeners on that name (the indexOf).   emit O(k).
 *    Space O(total listeners).
 */
type Listener = (...args: unknown[]) => void;

export class EventEmitter {
  // name -> its listeners, in subscribe order. Array created lazily on first `on`.
  private readonly events = new Map<string, Listener[]>();

  public on(name: string, listener: Listener): this {
    const list = this.events.get(name);
    if (list === undefined) {
      this.events.set(name, [listener]);
    } else {
      list.push(listener); // duplicates allowed — same fn can register twice
    }
    return this; // enable chaining: ee.on(...).on(...)
  }

  public off(name: string, listener: Listener): this {
    const list = this.events.get(name);
    if (list === undefined) {
      return this; // nothing registered under this name
    }
    const index = list.indexOf(listener);
    if (index !== -1) {
      list.splice(index, 1); // ⚠️ remove ONE instance only, not every copy
    }
    if (list.length === 0) {
      this.events.delete(name); // keep the map tidy
    }
    return this;
  }

  public emit(name: string, ...args: unknown[]): boolean {
    const list = this.events.get(name);
    if (list === undefined || list.length === 0) {
      return false; // no one was listening
    }
    // ⚠️ iterate a SNAPSHOT: a listener may on()/off() during the loop.
    for (const listener of list.slice()) {
      listener.apply(this, args);
    }
    return true;
  }

  public once(name: string, listener: Listener): this {
    // Wrap: remove the wrapper FIRST, then run — so a re-emit from inside the
    // listener doesn't fire it a second time.
    const wrapper: Listener = (...args: unknown[]): void => {
      this.off(name, wrapper); // ⚠️ remove the WRAPPER, not `listener`
      listener.apply(this, args);
    };
    return this.on(name, wrapper);
  }
}

/**
 * ----------------------------------------------------------------------------
 *  B) TYPED DOMAIN EVENT BUS  (the far-apart twin — backend, type-safe events)
 * ----------------------------------------------------------------------------
 *  Same emitter idea, different domain: a backend service announces facts
 *  ("an order was created") and other parts react (email, inventory) without the
 *  publisher knowing about them. Here we also make it TYPE-SAFE: a map of
 *  event name -> the argument tuple it carries, so emit/on are checked at compile
 *  time (emit the wrong shape and TypeScript complains).
 *
 *  Example:
 *    type Events = {
 *      "order.created": [order: { id: string; total: number }];
 *      "order.paid": [orderId: string];
 *    };
 *    const bus = new TypedEmitter<Events>();
 *    bus.on("order.created", (order) => sendReceipt(order.id)); // order is typed
 *    bus.emit("order.created", { id: "A1", total: 42 });        // checked
 */
type EventMap = Record<string, unknown[]>;

export class TypedEmitter<TEvents extends EventMap> {
  private readonly events = new Map<keyof TEvents, Array<(...args: never[]) => void>>();

  public on<K extends keyof TEvents>(
    name: K,
    listener: (...args: TEvents[K]) => void,
  ): this {
    const list = this.events.get(name);
    // `as` here bridges the per-key arg tuple to the erased internal store; the
    // public on/emit signatures keep callers fully type-checked.
    const stored = listener as (...args: never[]) => void;
    if (list === undefined) {
      this.events.set(name, [stored]);
    } else {
      list.push(stored);
    }
    return this;
  }

  public off<K extends keyof TEvents>(
    name: K,
    listener: (...args: TEvents[K]) => void,
  ): this {
    const list = this.events.get(name);
    if (list === undefined) {
      return this;
    }
    const index = list.indexOf(listener as (...args: never[]) => void);
    if (index !== -1) {
      list.splice(index, 1);
    }
    if (list.length === 0) {
      this.events.delete(name);
    }
    return this;
  }

  public emit<K extends keyof TEvents>(name: K, ...args: TEvents[K]): boolean {
    const list = this.events.get(name);
    if (list === undefined || list.length === 0) {
      return false;
    }
    for (const listener of list.slice()) {
      listener(...(args as never[]));
    }
    return true;
  }
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

  // on + emit: every listener fires, in order, with the args.
  const ee = new EventEmitter();
  const seen: string[] = [];
  ee.on("tick", (n) => seen.push(`a${n as number}`));
  ee.on("tick", (n) => seen.push(`b${n as number}`));
  const fired = ee.emit("tick", 1);
  ck("emit returns true when heard", fired === true);
  ck("both listeners fired in order", seen.join(",") === "a1,b1");

  // emit with no listeners returns false.
  ck("emit returns false when unheard", ee.emit("nope") === false);

  // off removes only ONE of duplicate registrations.
  const dup = (): void => seen.push("dup");
  ee.on("dup", dup).on("dup", dup); // same fn twice
  ee.off("dup", dup); // peel one
  seen.length = 0;
  ee.emit("dup");
  ck("off removes one instance only", seen.join(",") === "dup");

  // once: fires at most once, then auto-removes.
  let onceCount = 0;
  ee.once("boom", () => {
    onceCount++;
  });
  ee.emit("boom");
  ee.emit("boom");
  ck("once fired exactly once", onceCount === 1);

  // Snapshot safety: a listener that off()s itself mid-emit doesn't break the loop.
  const order: number[] = [];
  const self = new EventEmitter();
  const first: Listener = (): void => {
    order.push(1);
    self.off("x", first); // mutate during emit
  };
  const second: Listener = (): void => {
    order.push(2);
  };
  self.on("x", first).on("x", second);
  self.emit("x"); // both must still run this round
  ck("snapshot: both ran despite mid-emit off", order.join(",") === "1,2");
  order.length = 0;
  self.emit("x"); // first removed last round; only second remains
  ck("snapshot: removal took effect next round", order.join(",") === "2");

  // chaining returns this.
  ck("on returns this (chainable)", ee.on("c", () => {}) === ee);

  // Typed domain bus twin.
  type Events = {
    "order.created": [order: { id: string; total: number }];
    "order.paid": [orderId: string];
  };
  const bus = new TypedEmitter<Events>();
  const receipts: string[] = [];
  bus.on("order.created", (order) => receipts.push(order.id));
  const heard = bus.emit("order.created", { id: "A1", total: 42 });
  ck("typed bus delivered", heard === true && receipts.join(",") === "A1");
  ck("typed bus unheard -> false", bus.emit("order.paid", "A1") === false);

  console.log(
    fail === 0 ? "frontend/events/event-emitter: all checks passed" : `${fail} FAILED`,
  );
}
