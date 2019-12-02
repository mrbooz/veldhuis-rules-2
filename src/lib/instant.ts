// src/lib/instant.ts
//
// Arithmetic on instants. Instants stay strings end to end (src/types.ts);
// this file parses one where a sum needs it and writes the answer back down
// as a string.

import type { DayKey, Instant } from "../types";

function two(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

/** Midnight at the start of the day after the day `t` falls in. */
export function startOfNextDay(t: Instant): Instant {
  const d = new Date(t.slice(0, 10) + "T00:00");
  d.setDate(d.getDate() + 1);
  return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()) + "T00:00";
}

/** Midnight at the start of the day whose night `t` belongs to: the small
 *  hours, up to 07:00, belong to the night that began the day before. */
export function startOfNightDay(t: Instant): Instant {
  if (minuteOfDay(t) >= 7 * 60) {
    return t.slice(0, 10) + "T00:00";
  }
  const d = new Date(t.slice(0, 10) + "T00:00");
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()) + "T00:00";
}

/** The day after a day. */
export function nextDayKey(day: DayKey): DayKey {
  return startOfNextDay(day + "T00:00").slice(0, 10) as DayKey;
}

/** The instant a given number of minutes past midnight on a day. */
export function instantAt(day: DayKey, minute: number): Instant {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return day + "T" + two(h) + ":" + two(m);
}

// Minutes past midnight, read straight off the string.
function minuteOfDay(t: Instant): number {
  return Number(t.slice(11, 13)) * 60 + Number(t.slice(14, 16));
}

/** Elapsed minutes from one instant to the next. */
export function minutesBetween(from: Instant, to: Instant): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 60000;
}

export function later(a: Instant, b: Instant): Instant {
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

export function earlier(a: Instant, b: Instant): Instant {
  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}
