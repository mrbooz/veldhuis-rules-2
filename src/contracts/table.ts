// src/contracts/table.ts
//
// Every agreement the engine can be asked about, as rows: a customer, a
// date it took effect, the terms. contractFor() answers for a customer ON
// A DAY, because agreements get re-signed and a shift is priced under the
// agreement that held on the day the shift is attributed to.

import { ALDERVALE } from "./aldervale";
import type { Contract } from "../rules/contract";
import type { Day } from "../rules/types";

const NORDKANT: Contract = {
  customer: "nordkant",
  baseRate: 13.9,
  nightRate: 3.1,
  weekendRate: 2.6,
  holidayRate: 5.2,
  nightStartsAt: 22 * 60,
  closes: "open",
  rounds: "up-to-six",
  // Drivers' hours. The cap is law, not preference: 48 hours a week.
  weeklyCapMinutes: 48 * 60,
};

const BRACKWATER_2012: Contract = {
  customer: "brackwater",
  baseRate: 11.2,
  nightRate: 2.4,
  weekendRate: 1.8,
  holidayRate: 3.6,
  nightStartsAt: 22 * 60,
  closes: "open",
  rounds: "down-to-five",
  weeklyCapMinutes: null,
};

// Re-signed in 2021. The rates moved; the boundary and the rounding did not.
const BRACKWATER_2021: Contract = {
  customer: "brackwater",
  baseRate: 12.8,
  nightRate: 2.9,
  weekendRate: 2.2,
  holidayRate: 4.4,
  nightStartsAt: 22 * 60,
  closes: "open",
  rounds: "down-to-five",
  weeklyCapMinutes: null,
};

const VEENHOF: Contract = {
  customer: "veenhof",
  baseRate: 12.1,
  nightRate: 2.2,
  weekendRate: 2.0,
  holidayRate: 4.0,
  nightStartsAt: 22 * 60,
  closes: "hard",
  rounds: "exact",
  weeklyCapMinutes: null,
};

interface Row {
  customer: string;
  /** Effective from, inclusive. Rows for a customer sit oldest first. */
  from: Day;
  contract: Contract;
}

const TABLE: Row[] = [
  { customer: "aldervale", from: "1998-04-06", contract: ALDERVALE },
  { customer: "nordkant", from: "2011-02-14", contract: NORDKANT },
  { customer: "brackwater", from: "2012-09-01", contract: BRACKWATER_2012 },
  { customer: "brackwater", from: "2021-04-01", contract: BRACKWATER_2021 },
  { customer: "veenhof", from: "2016-01-01", contract: VEENHOF },
];

export function contractFor(customerId: string, on: Day): Contract {
  let found: Contract | null = null;
  for (const row of TABLE) {
    if (row.customer !== customerId) continue;
    if (row.from > on) continue;
    found = row.contract;
  }
  if (found === null) {
    throw new Error("no contract for " + customerId + " on " + on);
  }
  return found;
}
