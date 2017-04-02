// src/rules/contract.ts
//
// A customer's agreement, as data. Contracts became data in 2017; this is
// why the functions in this directory take a contract and not a clock. If a
// number in here looks odd, the agreement is the authority — Veldhuis holds
// the signed pages, and the signed pages outrank this file.

import type { Minutes } from "./types";

/** How the customer's payroll month closes. A month that closes "hard" is
 *  never reopened: whatever was exported is what was paid. */
export type Closes = "hard" | "open";

/** The customer's opinion on worked minutes vs payable minutes. The four
 *  opinions live in src/rules/rounding.ts; the choice lives here. */
export type Rounds = "exact" | "quarter-hour" | "down-to-five" | "up-to-six";

export interface Contract {
  /** The customer's id in the contract table (src/contracts/table.ts). */
  customer: string;
  /** Pounds per hour, before any premium. */
  baseRate: number;
  /** Pounds per hour of night premium, on top of the base rate. */
  nightRate: number;
  /** Pounds per hour worked on a weekend day, on top of the base rate. */
  weekendRate: number;
  /** Pounds per hour worked on a bank holiday, on top of the base rate. */
  holidayRate: number;
  /** Minutes after midnight at which the night premium starts. */
  nightStartsAt: Minutes;
  /** How the payroll month closes. */
  closes: Closes;
  /** Which rounding opinion the customer signed. */
  rounds: Rounds;
  /** Weekly working-time cap in minutes, where one is legally binding. */
  weeklyCapMinutes: Minutes | null;
}
