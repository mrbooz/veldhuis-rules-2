// src/lib/shiftWindow.ts

import type { DayKey, Instant, Shift } from "../types";
import { startOfNextDay } from "./instant";

export interface Window {
  from: Instant;
  to: Instant;
  spansMidnight: boolean;
}

/**
 * The window a shift occupies.
 *
 * Until the Hours capture rework this returned one window per calendar day.
 * It now returns a SINGLE window and reports whether it crosses midnight;
 * callers that need per-day figures divide it themselves.
 */
export function shiftWindow(shift: Shift): Window {
  return {
    from: shift.start,
    to: shift.end,
    spansMidnight: dayKeyOf(shift.start) !== dayKeyOf(shift.end),
  };
}

/**
 * @deprecated Superseded by shiftWindow() in 2021. Kept for Pay-Ready 3.x,
 * which is out of support in June. Nothing else calls this.
 */
export function shiftWindows(shift: Shift): Window[] {
  const w = shiftWindow(shift);
  if (!w.spansMidnight) return [w];
  const midnight = startOfNextDay(shift.start);
  return [
    { from: shift.start, to: midnight, spansMidnight: false },
    { from: midnight, to: shift.end, spansMidnight: false },
  ];
}

export function dayKeyOf(t: Instant): DayKey {
  return t.slice(0, 10) as DayKey;
}