/**
 * ============================================================================
 *  THE TRICK: pivot / group-by — reshape a flat list of {key, key} records into
 *             a 2D grid (one key → columns, the other → rows), gaps left blank.
 * ============================================================================
 *
 *  You get a FLAT list where each row is tagged with two keys — here a day
 *  (`dow`) and a `time`. Two views fall out of it:
 *
 *    View 1 (group-by)  — one column per day, that day's times listed under it.
 *                         Columns are ragged: different days have different counts.
 *    View 2 (pivot)     — every distinct time becomes a ROW, every day a COLUMN,
 *                         and each cell shows the time IF that day has it, else a
 *                         blank ("----"). The grid stays rectangular.
 *
 *  Worked example — 3 rows: {Mon,14:00}, {Tue,16:00}, {Mon,15:00}
 *    group-by →  Mon: [14:00, 15:00]   Tue: [16:00]            (ragged)
 *    pivot    →  rows = [14:00, 15:00, 16:00]                  (union, sorted)
 *                          Mon     Tue
 *                14:00    14:00    ----
 *                15:00    15:00    ----
 *                16:00    ----     16:00
 *
 *  Approach (and why each piece is there):
 *    1. Display order is FIXED and Monday-first, but the data numbers days
 *       0=Sun..6=Sat. So we iterate a fixed WEEK list [Mon..Sun] → dow [1..6,0],
 *       never the raw 0..6. Skip this and Sunday's column shows Monday's data.
 *    2. Sort times NUMERICALLY (minutes since midnight), never as strings.
 *       Lexical order only happens to work because these are zero-padded "HH:MM";
 *       an unpadded "9:00" would sort AFTER "10:00". `toMinutes` removes the
 *       dependency entirely.
 *    3. For the pivot, build an index Map<dow, Map<time, slot>> ONCE, so each of
 *       the rows×cols cell lookups is O(1). A naive `list.find(...)` per cell is
 *       O(rows · cols · n) — the classic quadratic-pivot trap.
 *    4. Rows = the UNION of distinct times across all days (dedupe via a Set),
 *       sorted. Each row must render a cell for EVERY day — present → the time,
 *       absent → null (the UI prints "----"). That blank is what keeps the grid
 *       rectangular.
 *
 *  Both views are built from ONE shared index (Map<dow, Map<time, slot>>) so they
 *  agree on what a slot is: a duplicate (dow,time) collapses to a single cell —
 *  last write wins — in the column view AND the grid. (If they didn't share it,
 *  the column could list "10:00" twice while the grid showed it once.)
 *
 *  Complexity (n = number of slots, D = 7 days, T = distinct times):
 *    indexByDay  — O(n).
 *    groupByDay  — O(n) to index + O(n log n) to sort the buckets.
 *    toSchedule  — O(n) to index + O(T log T) to sort rows + O(D · T) to fill.
 *    Space O(n) for the index.
 *
 *  Edge cases handled: a day with no slots → empty column / all-blank grid column;
 *  an empty list → no rows, every column blank; duplicate (dow,time) → one cell,
 *  last wins, in both views. Language trap: see point 2 (string vs numeric sort).
 */
import type { TimeSlot } from "./api";

/** Minutes since midnight for a zero-padded (or not) "HH:MM" — the sort key. */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

/**
 * Fixed display order: Monday-first, mapping each label to the `dow` the data
 * uses (0 = Sunday). Iterating THIS — not 0..6 — is the day-remap that keeps each
 * column pointed at the right day.
 */
export const WEEK_DISPLAY_ORDER: ReadonlyArray<{ dow: number; label: string }> = [
  { dow: 1, label: "Monday" },
  { dow: 2, label: "Tuesday" },
  { dow: 3, label: "Wednesday" },
  { dow: 4, label: "Thursday" },
  { dow: 5, label: "Friday" },
  { dow: 6, label: "Saturday" },
  { dow: 0, label: "Sunday" },
];

/**
 * Shared index both views build on: day → (time → slot). Keying on `time` means a
 * duplicate (dow,time) collapses to one entry — last write wins — so the column
 * view and the grid never disagree on whether a slot exists.
 */
function indexByDay(slots: readonly TimeSlot[]): Map<number, Map<string, TimeSlot>> {
  const index = new Map<number, Map<string, TimeSlot>>();
  for (const slot of slots) {
    const dayIndex = index.get(slot.dow) ?? new Map<string, TimeSlot>();
    dayIndex.set(slot.time, slot);
    index.set(slot.dow, dayIndex);
  }
  return index;
}

/** View 1 — one day per column, its slots sorted by time (ragged columns). */
export interface DayColumn {
  dow: number;
  label: string;
  slots: TimeSlot[]; // ascending by time; empty if the day has none
}

/**
 * View 1: group the flat list by day, then emit columns in Monday-first order
 * with each day's slots sorted by time. Days with no slots come back `slots: []`.
 */
export function groupByDay(slots: readonly TimeSlot[]): DayColumn[] {
  const index = indexByDay(slots);
  return WEEK_DISPLAY_ORDER.map(({ dow, label }) => ({
    dow,
    label,
    slots: [...(index.get(dow)?.values() ?? [])].sort(
      (a, b) => toMinutes(a.time) - toMinutes(b.time),
    ),
  }));
}

/** One cell of the pivot grid. `slot` null means "no slot here" → render "----". */
export interface ScheduleCell {
  time: string;
  slot: TimeSlot | null;
}

/** View 2 — a rectangular day × time grid plus the axes it was built from. */
export interface Schedule {
  days: ReadonlyArray<{ dow: number; label: string }>;
  times: string[]; // distinct, ascending — the rows
  rows: ScheduleCell[][]; // rows[r][c] = times[r] for days[c]
}

/**
 * View 2: pivot the flat list into a day × time grid.
 *   - index Map<dow, Map<time, slot>> → O(1) "does this day have this time?"
 *   - rows = union of distinct times, sorted numerically
 *   - every cell filled: present → the slot, absent → null
 */
export function toSchedule(slots: readonly TimeSlot[]): Schedule {
  const index = indexByDay(slots);
  const distinctTimes = new Set(slots.map((slot) => slot.time));

  const times = [...distinctTimes].sort((a, b) => toMinutes(a) - toMinutes(b));
  const rows = times.map((time) =>
    WEEK_DISPLAY_ORDER.map(({ dow }) => ({
      time,
      slot: index.get(dow)?.get(time) ?? null,
    })),
  );

  return { days: WEEK_DISPLAY_ORDER, times, rows };
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts
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

  // Adversarial fixture: unsorted input, a day with one slot, a day with NONE
  // (Thursday/dow 4 is absent), an "08:00" to prove numeric (not lexical) sort,
  // a duplicate (dow,time), and an isTopTime flag.
  const fixture: TimeSlot[] = [
    { dow: 1, time: "15:00" },
    { dow: 1, time: "08:00" }, // earlier than 15:00 AND lexically tricky vs "10:00"
    { dow: 1, time: "10:00", isTopTime: true },
    { dow: 2, time: "16:00" },
    { dow: 0, time: "08:00" }, // Sunday — must land in the LAST column
    { dow: 1, time: "10:00" }, // duplicate (1,"10:00") — last wins, drops isTopTime
  ];

  // toMinutes parses HH:MM to a sortable number.
  ck("toMinutes 08:00 -> 480", toMinutes("08:00") === 480);
  ck("toMinutes 10:00 -> 600", toMinutes("10:00") === 600);
  ck("toMinutes 23:30 -> 1410", toMinutes("23:30") === 1410);

  const cols = groupByDay(fixture);

  // Seven columns, Monday-first, Sunday last — the day remap.
  ck("7 columns", cols.length === 7);
  ck("col 0 is Monday", cols[0].label === "Monday" && cols[0].dow === 1);
  ck("col 6 is Sunday (dow 0)", cols[6].label === "Sunday" && cols[6].dow === 0);

  // Monday sorted NUMERICALLY and DEDUPED: the duplicate 10:00 collapses to one,
  // giving 08:00 < 10:00 < 15:00 (3 slots, not 4).
  ck("Monday deduped to 3 slots", cols[0].slots.length === 3);
  ck(
    "Monday sorted by minutes",
    cols[0].slots.map((s) => s.time).join() === "08:00,10:00,15:00",
  );
  // Dup last-wins is consistent with the grid: the surviving Monday 10:00 has no flag.
  ck(
    "Monday 10:00 dup last-wins (no isTopTime)",
    cols[0].slots.find((s) => s.time === "10:00")?.isTopTime === undefined,
  );

  // A day with no slots (Thursday/dow 4) → empty column, no crash.
  const thursday = cols.find((c) => c.dow === 4);
  ck("Thursday exists as a column", thursday !== undefined);
  ck("Thursday has no slots", thursday!.slots.length === 0);

  // Sunday's single 08:00 sits in the LAST column, not the first.
  ck("Sunday column has 08:00", cols[6].slots.map((s) => s.time).join() === "08:00");

  const schedule = toSchedule(fixture);

  // Rows = distinct times, sorted: 08:00, 10:00, 15:00, 16:00.
  ck("rows = distinct times sorted", schedule.times.join() === "08:00,10:00,15:00,16:00");
  ck("grid is rectangular: rows x 7", schedule.rows.every((r) => r.length === 7));

  // Cell present/absent. Monday (col 0) at 10:00 (row 1) is present; Tuesday
  // (col 1) at 10:00 is absent → null → "----".
  ck("Mon@10:00 present", schedule.rows[1][0].slot?.time === "10:00");
  ck("Tue@10:00 absent (gap)", schedule.rows[1][1].slot === null);

  // Sunday (col 6) at 08:00 (row 0) present; Sunday at 16:00 (row 3) absent.
  ck("Sun@08:00 present", schedule.rows[0][6].slot?.time === "08:00");
  ck("Sun@16:00 absent (gap)", schedule.rows[3][6].slot === null);

  // Duplicate (1,"10:00") — last write wins, so the isTopTime flag is dropped.
  ck("duplicate cell: last wins (no isTopTime)", schedule.rows[1][0].slot?.isTopTime === undefined);

  // Empty input → no rows, every WEEK column still present and blank.
  const empty = toSchedule([]);
  ck("empty: no times", empty.times.length === 0);
  ck("empty: no rows", empty.rows.length === 0);
  ck("empty: still 7 day columns", empty.days.length === 7);
  ck("empty groupByDay: 7 empty columns", groupByDay([]).every((c) => c.slots.length === 0));

  console.log(
    fail === 0
      ? "frontend/tables/popular-timeslots: all checks passed"
      : `${fail} FAILED`,
  );
}
