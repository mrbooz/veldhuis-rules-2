// src/contracts/aldervale.ts
//
// Aldervale Trust — the 1998 agreement, in code. Signed in April 1998 and
// never reopened: the premium boundary is 21:30, not 22:00, and the payroll
// month closes hard — what was exported is what was paid. Nobody now at
// Veldhuis was in the room. The terms are the terms.

import type { Contract } from "../rules/contract";

export const ALDERVALE: Contract = {
  customer: "aldervale",
  baseRate: 15.6,
  nightRate: 18.4, // one hour of Aldervale night premium: £18.40
  weekendRate: 3.9,
  holidayRate: 7.8,
  nightStartsAt: 21 * 60 + 30, // 1998: the night starts at 21:30
  closes: "hard",
  rounds: "quarter-hour",
  weeklyCapMinutes: null,
};
