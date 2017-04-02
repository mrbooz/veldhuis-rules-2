// src/export/rota.ts — what the ward managers actually look at.
//
// One row per shift, one page per ward, and one column — "day" — that
// says which day a night belongs to. The grid is drawn from Dates while
// the engine keeps its instants as strings: the seam is deliberate, and
// getHours() below reads the wall clock of the machine drawing the grid.

import { attributionDay } from "../rules/attribution";
import type { Contract } from "../rules/contract";
import type { DayKey, Shift } from "../types";

export interface RotaRow {
  ward: string;
  day: DayKey;
  startsAt: Date;
  endsAt: Date;
}

// One shift, one row. The grid is drawn in Dates; the day column is
// decided in strings, by the same arithmetic the payslip uses, so the
// grid and a payslip cannot disagree about what a day is called.
export function rowFor(shift: Shift, contract: Contract, ward: string): RotaRow {
  const startsAt = new Date(shift.start);
  const endsAt = new Date(shift.end);
  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    throw new Error("rota: unreadable shift times on the " + ward + " page");
  }

  const day = attributionDay(shift, contract);
  return { ward: ward, day: day, startsAt: startsAt, endsAt: endsAt };
}

export function buildRota(shifts: Shift[], contract: Contract, ward: string): RotaRow[] {
  const rows: RotaRow[] = [];
  for (const shift of shifts) {
    rows.push(rowFor(shift, contract, ward));
  }
  rows.sort(compareRows);
  return rows;
}

// Pages sort by start, then by ward name, and the export writes rows in
// exactly the order the pages show them. Two sorted things that agree are
// one fewer phone call.
export function compareRows(a: RotaRow, b: RotaRow): number {
  if (a.startsAt.getTime() !== b.startsAt.getTime()) {
    return a.startsAt.getTime() - b.startsAt.getTime();
  }
  if (a.ward < b.ward) return -1;
  if (a.ward > b.ward) return 1;
  return 0;
}

// Ward pages are keyed by the ward name exactly as capture spells it,
// hospital prefix included; the grid never re-spells a ward.
export function wardKeyOf(row: RotaRow): string {
  return row.ward;
}

export function pageTitle(ward: string, monthKey: string): string {
  return ward + " — " + monthKey;
}

export function isNightRow(row: RotaRow): boolean {
  return row.startsAt.getHours() >= 19;
}

// Weekend staffing is counted from these rows, Saturday and Sunday by the
// wall clock of the machine that draws the grid.
export function isWeekendRow(row: RotaRow): boolean {
  const dow = row.startsAt.getDay();
  return dow === 0 || dow === 6;
}

// A row whose shift runs past midnight. The grid shades these across two
// columns; the day column still names a single owner.
export function spansMidnightRow(row: RotaRow): boolean {
  return row.startsAt.getDate() !== row.endsAt.getDate();
}

// Long rows are flagged to the ward manager, not to payroll: a shift over
// twelve hours is a rostering question before it is a money question.
export function isLongRow(row: RotaRow): boolean {
  return row.endsAt.getTime() - row.startsAt.getTime() > 12 * 60 * 60 * 1000;
}
