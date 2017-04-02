// src/types.ts
//
// The shapes every part of the engine shares.
//
// An Instant is a string on purpose. Shifts arrive as strings, they are
// written into files as strings, and nine years of fixtures have them
// spelled that way. Parse one at the point of arithmetic; never store
// the Date.

/** A moment, written down: "2026-03-03T19:00". Offset optional. */
export type Instant = string;

/** A calendar day: "2026-03-03". The first ten characters of an Instant. */
export type DayKey = string;

/** A worked shift, as captured: when it started and when it ended. */
export interface Shift {
  start: Instant;
  end: Instant;
}
