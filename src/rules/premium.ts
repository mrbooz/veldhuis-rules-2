// src/rules/premium.ts
//
// Night, weekend, bank holiday. Every rate in here was argued about by
// somebody in a room, and what came out of the room went into the contract
// (src/rules/contract.ts) — so the functions read the contract and never
// the calendar on the wall.

import { attributionDay } from "./attribution";
import { nightBoundaryFor } from "./nightBoundary";
import { earlier, instantAt, later, minutesBetween, nextDayKey } from "../lib/instant";
import type { Contract } from "./contract";
import type { Minutes } from "./types";
import type { DayKey, Instant, Shift } from "../types";

// The night ends at 07:00. Nobody has ever asked for the end to move; the
// start moves per contract, and src/rules/nightBoundary.ts is where it is
// asked for.
const NIGHT_ENDS_AT: Minutes = 7 * 60;

// England and Wales. Kept by hand; replaced every December when the coming
// year's list is announced. Do not thin it out: a payslip from an old year
// is reissued against the list that was true at the time.
const BANK_HOLIDAYS: DayKey[] = [
  "2025-01-01",
  "2025-04-18",
  "2025-04-21",
  "2025-05-05",
  "2025-05-26",
  "2025-08-25",
  "2025-12-25",
  "2025-12-26",
  "2026-01-01",
  "2026-04-03",
  "2026-04-06",
  "2026-05-04",
  "2026-05-25",
  "2026-08-31",
  "2026-12-25",
  "2026-12-28",
];

// Premiums are counted in whole hours and the part-hour at the boundary is
// dropped, not carried (WD, 2017): a premium is a unit price for a unit of
// night, and there are no part-units of night.
function wholeHours(worked: Minutes): number {
  if (worked <= 0) return 0;
  return Math.floor(worked / 60);
}

// The minutes of a shift that fall inside a window.
function inside(shift: Shift, from: Instant, to: Instant): Minutes {
  const a = later(shift.start, from);
  const b = earlier(shift.end, to);
  const m = minutesBetween(a, b);
  return m > 0 ? m : 0;
}

/**
 * Whole hours of night premium in a shift, judged against the day the
 * shift is attributed to: the night runs from that day's boundary to 07:00
 * the next morning, and a shift already in the small hours is inside its
 * own day's small hours.
 */
export function nightHours(shift: Shift, contract: Contract): number {
  const day = attributionDay(shift, contract);
  const startsAt = nightBoundaryFor(contract.customer, day);
  const evening = inside(shift, instantAt(day, startsAt), instantAt(nextDayKey(day), NIGHT_ENDS_AT));
  const smallHours = inside(shift, instantAt(day, 0), instantAt(day, NIGHT_ENDS_AT));
  return wholeHours(evening + smallHours);
}

export function nightPremium(shift: Shift, contract: Contract): number {
  return nightHours(shift, contract) * contract.nightRate;
}

/** Weekend premium. A shift is a weekend shift or it is not, by the day it
 *  is attributed to. */
export function weekendPremium(shift: Shift, contract: Contract): number {
  const day = attributionDay(shift, contract);
  if (!isWeekend(day)) return 0;
  return wholeHours(minutesBetween(shift.start, shift.end)) * contract.weekendRate;
}

/** Bank holiday premium. The same shape as the weekend, different list. */
export function holidayPremium(shift: Shift, contract: Contract): number {
  const day = attributionDay(shift, contract);
  if (BANK_HOLIDAYS.indexOf(day) === -1) return 0;
  return wholeHours(minutesBetween(shift.start, shift.end)) * contract.holidayRate;
}

function isWeekend(day: DayKey): boolean {
  const dow = new Date(day + "T00:00").getDay();
  return dow === 0 || dow === 6;
}
