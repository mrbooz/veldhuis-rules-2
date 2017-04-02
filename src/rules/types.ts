// src/rules/types.ts
//
// The rules engine's own vocabulary. A Day is a calendar day as the engine
// attributes it — the same key attribution hands out. Minutes are minutes
// after midnight when they name a boundary, and minutes of duration when
// they name an amount; nine years in, both readings are load-bearing.

import type { DayKey } from "../types";

/** A calendar day, as attributed. */
export type Day = DayKey;

/** Minutes after midnight for a boundary; minutes of duration for an amount. */
export type Minutes = number;
