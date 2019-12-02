// src/ingest/shifts.ts
//
// POST /vellum/v1/shifts — the door worked shifts arrive through, one
// request per shift, from whichever capture build a ward is running.
// Capture decides what it sends; this side checks the shape and accepts.

import type { DayKey, Instant, Shift } from "../types";

export interface CapturedShift {
  shiftRef: string;
  ward: string;
  startedAt: Instant;
  endedAt: Instant;
  /** The day capture says the shift belongs to. Capture decides; the
   *  engine reads this field and no other part of the payload. */
  shiftDate: DayKey;
  capturedBy: string;
}

const FIELDS = [
  "shiftRef",
  "ward",
  "startedAt",
  "endedAt",
  "shiftDate",
  "capturedBy",
];

/** Accepts a request body or throws. No coercion: a field that is not a
 *  string is a capture bug, and paying around a capture bug is how the
 *  ledger and the ward stop agreeing. */
export function acceptShift(body: unknown): CapturedShift {
  if (typeof body !== "object" || body === null) {
    throw new Error("shifts: body is not an object");
  }
  const record = body as Record<string, unknown>;
  for (const field of FIELDS) {
    if (typeof record[field] !== "string" || record[field] === "") {
      throw new Error("shifts: missing or non-string field " + field);
    }
  }
  return {
    shiftRef: record.shiftRef as string,
    ward: record.ward as string,
    startedAt: record.startedAt as string,
    endedAt: record.endedAt as string,
    shiftDate: record.shiftDate as string,
    capturedBy: record.capturedBy as string,
  };
}

/** The captured shift, as the rules read it: when it started and when it
 *  ended. The ref and the ward stay on the capture row — everything else
 *  about a shift belongs to the product that captured it. */
export function toShift(captured: CapturedShift): Shift {
  return {
    start: captured.startedAt,
    end: captured.endedAt,
  };
}
