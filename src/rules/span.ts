// src/rules/span.ts
//
// Shifts that cross midnight. The two halves of a night can fall under two
// different days — a weekday and a weekend, a plain night and a bank
// holiday — so a shift that spans midnight is priced as two shifts and the
// halves are summed.

import { evaluate } from "./engine";
import type { Result } from "./engine";
import { shiftWindow } from "../lib/shiftWindow";
import { startOfNextDay } from "../lib/instant";
import type { Contract } from "./contract";
import type { Shift } from "../types";

export function evaluateSpan(shift: Shift, contract: Contract): Result {
  const window = shiftWindow(shift);
  if (!window.spansMidnight) {
    return evaluate(shift, contract);
  }

  const midnight = startOfNextDay(shift.start);
  const result = evaluate({ start: shift.start, end: midnight }, contract);
  const second = evaluate({ start: midnight, end: shift.end }, contract);
  result.total += second.total;
  return result;
}
