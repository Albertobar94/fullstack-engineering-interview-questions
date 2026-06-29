/**
 * ============================================================================
 *  "Popular Timeslots" — render a flat list of {dow, time} as two grids
 * ============================================================================
 *
 *  A thin shell over the pivot primitive in `solution.ts`. Everything that can go
 *  wrong — the Sunday-vs-Monday day remap, sorting times by minutes (not as
 *  strings), the O(1) cell lookup, the union of distinct times, and the blank
 *  "----" gaps — lives there and is unit-checked. This file only fetches and maps:
 *
 *    - View 1 (group-by): `groupByDay(slots)` → one column per day, times listed.
 *    - View 2 (pivot):    `toSchedule(slots)` → a day × time grid; empty cells "----".
 *
 *  Fetch correctness: the `ignore` flag drops a late `fetchTimeSlots` resolve if the
 *  component unmounted (or the effect re-ran) first — the standard React data-fetch
 *  guard against "setState on an unmounted component" / out-of-order responses.
 *
 *  Note: this is the real component for study; it needs a React + JSX toolchain to
 *  run. The reshaping math it relies on is verified by `solution.ts`'s self-check.
 */
import "./styles.css";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import { fetchTimeSlots } from "./api";
import type { TimeSlot } from "./api";
import { groupByDay, toSchedule } from "./solution";
import type { ScheduleCell } from "./solution";

// What an empty grid cell shows when a day has no slot at that time.
const EMPTY_SLOT = "----";

/** Cell styling: blank cells are muted, the single top slot is highlighted. */
function cellClassName(cell: ScheduleCell): string | undefined {
  if (cell.slot === null) {
    return "cell--empty";
  }
  return cell.slot.isTopTime ? "cell--top" : undefined;
}

export const PopularTimeSlots = (): JSX.Element => {
  // null = still loading (distinct from [] = loaded-but-empty).
  const [slots, setSlots] = useState<TimeSlot[] | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchTimeSlots().then((data) => {
      if (!ignore) {
        setSlots(data);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  if (slots === null) {
    return <div className="timeslots timeslots--loading">Loading…</div>;
  }

  const columns = groupByDay(slots);
  const schedule = toSchedule(slots);

  return (
    <div className="timeslots">
      {/* View 1 — popular timeslots: one column per day, times listed under it. */}
      <section aria-label="Popular timeslots by day">
        <h2>Popular timeslots</h2>
        <div className="columns">
          {columns.map((column) => (
            <div key={column.dow} className="day">
              <h3 className="day__name">{column.label}</h3>
              <ul className="day__times">
                {column.slots.map((slot) => (
                  <li key={slot.time} className={slot.isTopTime ? "cell--top" : undefined}>
                    {slot.time}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* View 2 — schedule grid: every distinct time a row, gaps shown as "----". */}
      <section aria-label="Schedule with empty slots">
        <h2>Schedule</h2>
        <table className="schedule">
          <thead>
            <tr>
              {schedule.days.map((day) => (
                <th key={day.dow} scope="col">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.rows.map((row, rowIndex) => (
              <tr key={schedule.times[rowIndex]}>
                {row.map((cell, colIndex) => (
                  <td key={schedule.days[colIndex].dow} className={cellClassName(cell)}>
                    {cell.slot ? cell.slot.time : EMPTY_SLOT}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
