/**
 * The interview's "backend" — a fake endpoint that resolves a flat list of
 * timeslots after a short delay. In the original scaffold this lived at
 * `./helpers/api`; here it sits beside the component so the note is self-contained.
 *
 * The data structure is deliberately flat: each row carries its own day-of-week
 * (`dow`) and `time`. Turning this flat list into the two grid views is the whole
 * exercise — see `solution.ts`.
 *
 * Gotcha baked into `dow`: 0 = Sunday … 6 = Saturday. The UI shows Monday first,
 * so the display order is NOT 0..6 — it is [1,2,3,4,5,6,0]. That remap is the
 * first place a "Sunday column shows Monday's times" bug hides.
 */
export interface TimeSlot {
  dow: number; // 0 - Sunday, 1 - Monday, 2 - Tuesday, … 6 - Saturday
  time: string; // zero-padded "HH:MM"
  isTopTime?: boolean; // the single most popular slot — highlight it
}

const timeSlots: TimeSlot[] = [
  { dow: 0, time: "10:00" },
  { dow: 0, time: "11:00" },
  { dow: 0, time: "12:00" },
  { dow: 0, time: "13:00" },
  { dow: 1, time: "14:00" },
  { dow: 1, time: "15:00" },
  { dow: 2, time: "16:00" },
  { dow: 2, time: "17:00" },
  { dow: 2, time: "18:00", isTopTime: true },
  { dow: 3, time: "19:00" },
  { dow: 3, time: "20:00" },
  { dow: 3, time: "21:00" },
  { dow: 4, time: "22:00" },
  { dow: 4, time: "23:00" },
  { dow: 5, time: "11:00" },
  { dow: 5, time: "12:00" },
  { dow: 5, time: "13:00" },
  { dow: 5, time: "14:00" },
  { dow: 6, time: "21:00", isTopTime: true },
  { dow: 6, time: "22:00" },
];

/** Fake promise — simulates fetching timeslots from the server (~1s). */
export async function fetchTimeSlots(): Promise<TimeSlot[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return timeSlots;
}
