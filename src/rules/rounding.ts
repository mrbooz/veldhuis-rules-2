// src/rules/rounding.ts
//
// Worked minutes to payable minutes. Four customers, four opinions, one
// file: the opinion is in the contract, and this file only obeys it.

import type { Contract } from "./contract";
import type { Minutes } from "./types";

export function payableMinutes(worked: Minutes, contract: Contract): Minutes {
  switch (contract.rounds) {
    case "quarter-hour":
      // To the nearest quarter of an hour, halves up. 1998 wording.
      return Math.round(worked / 15) * 15;
    case "down-to-five":
      // Down to the five-minute mark. Payroll asked; nobody objected.
      return Math.floor(worked / 5) * 5;
    case "up-to-six":
      // Up to the six-minute mark — a tachograph opinion, not ours.
      return Math.ceil(worked / 6) * 6;
    case "exact":
      return worked;
  }
}
