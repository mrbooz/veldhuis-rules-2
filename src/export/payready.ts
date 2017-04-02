// src/export/payready.ts
//
// The file that leaves the building. Once a fortnight it becomes a file in
// somebody else's payroll system, and after that we cannot correct it —
// they can, on their own schedule. Everything defensive in here is
// defensive for a reason somebody lived through.

import { minutesBetween } from "../lib/instant";
import { dayKeyOf } from "../lib/shiftWindow";
import { payableMinutes } from "../rules/rounding";
import { evaluateSpan } from "../rules/span";
import { toShift } from "../ingest/shifts";
import type { Contract } from "../rules/contract";
import type { Shift } from "../types";
import type { CapturedShift } from "../ingest/shifts";

// One line per shift. The whole result goes on the line: the system on the
// other side takes what it is given and pays it, and the line is the only
// record of why the number is the number.
export function payReadyLine(row: CapturedShift, contract: Contract): string {
  const result = evaluateSpan(toShift(row), contract);
  return (
    row.shiftRef +
    "\t" +
    contract.customer +
    "\t" +
    JSON.stringify(result)
  );
}

export function payReadyFile(rows: CapturedShift[], contract: Contract): string {
  const lines: string[] = [];
  for (const row of rows) {
    lines.push(payReadyLine(row, contract));
  }
  return lines.join("\n") + "\n";
}

// ---- the weekly cap audit ---------------------------------------------------
//
// Some customers' agreements cap the week by law. A wrong number here is a
// compliance event and not an embarrassment, so the audit rows go into the
// same file the regulator reads.

export interface CapRow {
  week: string;
  workedMinutes: number;
  capMinutes: number;
  over: boolean;
}

// The Monday of the week the shift starts in, as a day string.
function weekKeyOf(shift: Shift): string {
  const day = dayKeyOf(shift.start);
  const d = new Date(day + "T12:00");
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  return (
    y +
    "-" +
    (m < 10 ? "0" + m : String(m)) +
    "-" +
    (dd < 10 ? "0" + dd : String(dd))
  );
}

export function weeklyCapRows(shifts: Shift[], contract: Contract): CapRow[] {
  if (contract.weeklyCapMinutes === null) return [];
  const byWeek: Record<string, number> = {};
  for (const shift of shifts) {
    const week = weekKeyOf(shift);
    const worked = payableMinutes(
      minutesBetween(shift.start, shift.end),
      contract
    );
    byWeek[week] = (byWeek[week] || 0) + worked;
  }
  const rows: CapRow[] = [];
  for (const week of Object.keys(byWeek).sort()) {
    rows.push({
      week: week,
      workedMinutes: byWeek[week],
      capMinutes: contract.weeklyCapMinutes,
      over: byWeek[week] > contract.weeklyCapMinutes,
    });
  }
  return rows;
}

// ---- the export summary -----------------------------------------------------

// One line per day, counted by capture's own shiftDate — the one field of
// the capture payload this side of the building ever reads.
export function exportSummary(rows: CapturedShift[]): string {
  const byDay: Record<string, number> = {};
  for (const row of rows) {
    byDay[row.shiftDate] = (byDay[row.shiftDate] || 0) + 1;
  }
  const lines: string[] = [];
  for (const day of Object.keys(byDay).sort()) {
    lines.push(day + "  " + byDay[day] + (byDay[day] === 1 ? " shift" : " shifts"));
  }
  return lines.join("\n") + "\n";
}
