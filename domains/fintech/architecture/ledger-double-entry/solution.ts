/**
 * ============================================================================
 *  THE BUILDING BLOCK: a double-entry ledger that cannot drift
 * ============================================================================
 *
 *  How do you store "who has how much money" so it can never quietly go wrong?
 *  NOT a `balances` table you UPDATE in place — one missed update, one race, one
 *  half-applied transfer and the number is wrong with no trail of why.
 *
 *  Double-entry, the 700-year-old accounting answer: money is never created or
 *  destroyed, only MOVED. Every event is a set of postings whose amounts sum to
 *  ZERO — what leaves one account lands in another. A transfer of $50 is:
 *      alice -5000   (debit)
 *      bob   +5000   (credit)
 *  Sum = 0. The ledger ENFORCES that invariant on every write, so the books are
 *  balanced by construction. (Sign convention here: a balance is just the sum of
 *  an account's postings — negative = owes / paid out, positive = holds.)
 *
 *  Two more rules that make it auditable:
 *    - APPEND-ONLY. You never edit or delete a posting. A mistake is fixed with a
 *      new, reversing entry. The journal is the source of truth.
 *    - BALANCE IS DERIVED, not stored. balance(account) = sum of its postings.
 *      (Real systems cache it for speed; the journal still wins any dispute.)
 *
 *  This in-memory `Ledger` makes those rules executable: post() rejects anything
 *  unbalanced, the journal is frozen, and the sum of ALL balances is always 0n.
 *
 *  Twin (further down): a single-entry "spreadsheet" that does NOT enforce the
 *  invariant — shown drifting, to make the contrast concrete.
 *
 * ----------------------------------------------------------------------------
 *  Complexity: post() O(k) in postings; balance() O(n) over the journal here
 *    (real ledgers index by account or cache running balances).
 *  Edge cases: empty/unbalanced postings rejected; immutability of returned data.
 *  Money trap: amounts are bigint minor units (see money-representation) — never
 *    floats; the zero-sum check would be unreliable on floats.
 */

export interface Posting {
  readonly account: string;
  readonly amount: bigint; // minor units; signed. Must net to 0 across an entry.
}

export class Ledger {
  // Append-only. Held private; readers get frozen copies so state can't be mutated.
  private readonly journal: Posting[] = [];

  /**
   * Record one balanced entry (a list of postings). Rejected unless the amounts
   * sum to exactly zero — that's the invariant the whole pattern rests on.
   */
  post(entry: readonly Posting[]): void {
    if (entry.length === 0) {
      throw new Error("an entry needs at least one posting");
    }
    const net = entry.reduce((sum, p) => sum + p.amount, 0n);
    // The one line that makes the ledger trustworthy. Drop it and money leaks.
    if (net !== 0n) {
      throw new Error(`unbalanced entry: postings net to ${net}, must be 0`);
    }
    for (const p of entry) {
      this.journal.push({ account: p.account, amount: p.amount });
    }
  }

  /** Derived balance: sum of every posting touching this account. */
  balance(account: string): bigint {
    return this.journal
      .filter((p) => p.account === account)
      .reduce((sum, p) => sum + p.amount, 0n);
  }

  /** Frozen snapshot of the journal — auditors read it, nobody edits it. */
  entries(): readonly Readonly<Posting>[] {
    return this.journal.map((p) => Object.freeze({ ...p }));
  }

  /**
   * The global invariant: across a closed double-entry system every cent that
   * left some account arrived in another, so the sum of ALL balances is 0.
   * If this is ever non-zero, the ledger is corrupt — alert, don't paper over.
   */
  totalBalance(): bigint {
    return this.journal.reduce((sum, p) => sum + p.amount, 0n);
  }
}

/** Convenience: a plain A→B transfer expressed as a balanced entry. */
export function transfer(from: string, to: string, amount: bigint): Posting[] {
  return [
    { account: from, amount: -amount },
    { account: to, amount: amount },
  ];
}

/**
 * ----------------------------------------------------------------------------
 *  THE TWIN: single-entry "spreadsheet" — what double-entry protects you from
 * ----------------------------------------------------------------------------
 *  Just a map of account -> balance you mutate directly. Nothing enforces that a
 *  debit has a matching credit, so a buggy/partial transfer silently drifts.
 */
export class SingleEntrySheet {
  private readonly balances = new Map<string, bigint>();

  set(account: string, amount: bigint): void {
    this.balances.set(account, amount);
  }

  // A "transfer" that forgot to credit the other side — looks fine, books lie.
  buggyTransfer(from: string, amount: bigint): void {
    this.balances.set(from, (this.balances.get(from) ?? 0n) - amount);
    // ...and the credit to `to` never happens. No invariant to catch it.
  }

  total(): bigint {
    let sum = 0n;
    for (const v of this.balances.values()) {
      sum += v;
    }
    return sum;
  }
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

  const ledger = new Ledger();
  ledger.post(transfer("alice", "bob", 5000n)); // alice -5000, bob +5000
  ledger.post(transfer("bob", "carol", 1500n)); // bob -1500, carol +1500

  ck("alice balance -5000", ledger.balance("alice") === -5000n);
  ck("bob balance 3500", ledger.balance("bob") === 3500n);
  ck("carol balance 1500", ledger.balance("carol") === 1500n);
  ck("unknown account 0", ledger.balance("nobody") === 0n);

  // The invariant: the whole system always nets to zero.
  ck("total balance is always 0", ledger.totalBalance() === 0n);

  // Unbalanced entries are rejected.
  let threw = false;
  try {
    ledger.post([{ account: "alice", amount: -100n }]); // no matching credit
  } catch {
    threw = true;
  }
  ck("unbalanced post rejected", threw);
  ck("rejected post left journal unchanged", ledger.totalBalance() === 0n);

  let threwEmpty = false;
  try {
    ledger.post([]);
  } catch {
    threwEmpty = true;
  }
  ck("empty entry rejected", threwEmpty);

  // Append-only / immutability: mutating the snapshot must not corrupt state.
  const snapshot = ledger.entries();
  let frozen = false;
  try {
    // @ts-expect-error — proving the returned postings are frozen at runtime.
    snapshot[0].amount = 999999n;
  } catch {
    frozen = true; // strict mode throws on writing a frozen property.
  }
  ck("returned postings are frozen", frozen && ledger.balance("alice") === -5000n);

  // The twin drifts — exactly the failure double-entry prevents. A real transfer
  // PRESERVES total money; the buggy single-entry one debits without crediting,
  // so $50 simply vanishes and nothing complains.
  const sheet = new SingleEntrySheet();
  sheet.set("alice", 5000n);
  sheet.set("bob", 0n);
  const before = sheet.total(); // 5000
  sheet.buggyTransfer("alice", 5000n); // debit only, no credit → money destroyed
  ck("single-entry sheet silently drifts (money vanished)", sheet.total() !== before);

  console.log(fail === 0 ? "domains/fintech/ledger-double-entry: all checks passed" : `${fail} FAILED`);
}
