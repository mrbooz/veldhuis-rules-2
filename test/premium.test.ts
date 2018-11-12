import { contractFor } from "../src/contracts/table";
import {
  holidayPremium,
  nightHours,
  nightPremium,
  weekendPremium,
} from "../src/rules/premium";
import type { Shift } from "../src/types";

const ON = "2026-03-01";

function shift(start: string, end: string): Shift {
  return { start: start, end: end };
}

// Every shift below sits inside one calendar day, so the attributed day is
// the day on the clock face and the assertions hold whatever attribution
// does with a night that crosses midnight.
describe("nightHours", () => {
  it.each([
    // aldervale: the night starts at 21:30 (1998) and runs to 07:00
    ["aldervale", "2026-03-03T19:00", "2026-03-03T21:30", 0],
    ["aldervale", "2026-03-03T21:30", "2026-03-03T22:30", 1],
    ["aldervale", "2026-03-03T19:00", "2026-03-03T23:00", 1],
    ["aldervale", "2026-03-03T21:30", "2026-03-03T23:59", 2],
    ["aldervale", "2026-03-04T00:00", "2026-03-04T07:00", 7],
    ["aldervale", "2026-03-04T03:30", "2026-03-04T07:00", 3],
    ["aldervale", "2026-03-04T06:00", "2026-03-04T08:00", 1],
    // everyone else: 22:00
    ["nordkant", "2026-03-03T21:30", "2026-03-03T22:30", 0],
    ["nordkant", "2026-03-03T22:00", "2026-03-03T23:59", 1],
    ["veenhof", "2026-03-03T20:00", "2026-03-03T23:00", 1],
  ])("%s: %s to %s is %d whole hours of night", (customer, start, end, expected) => {
    expect(nightHours(shift(start, end), contractFor(customer, ON))).toBe(expected);
  });
});

describe("nightPremium", () => {
  it.each([
    // whole hours only: the part-hour at the boundary is not paid (2017)
    ["aldervale", "2026-03-03T21:30", "2026-03-03T22:30", 18.4],
    ["aldervale", "2026-03-04T00:00", "2026-03-04T07:00", 128.8],
    ["aldervale", "2026-03-03T19:00", "2026-03-03T21:30", 0],
    ["nordkant", "2026-03-03T22:00", "2026-03-03T23:59", 3.1],
    ["brackwater", "2026-03-03T22:00", "2026-03-03T23:00", 2.9],
    ["veenhof", "2026-03-03T22:00", "2026-03-03T23:00", 2.2],
  ])("%s: %s to %s pays %d", (customer, start, end, expected) => {
    expect(nightPremium(shift(start, end), contractFor(customer, ON))).toBeCloseTo(
      expected,
      2
    );
  });
});

describe("weekendPremium", () => {
  it.each([
    ["aldervale", "2026-03-07T07:00", "2026-03-07T19:00", 46.8],
    ["aldervale", "2026-03-07T07:00", "2026-03-07T19:30", 46.8],
    ["nordkant", "2026-03-08T08:00", "2026-03-08T16:00", 20.8],
    ["brackwater", "2026-03-07T09:00", "2026-03-07T17:00", 17.6],
    ["veenhof", "2026-06-21T10:00", "2026-06-21T14:00", 8],
    ["aldervale", "2026-03-03T07:00", "2026-03-03T19:00", 0],
  ])("%s: %s to %s pays %d", (customer, start, end, expected) => {
    expect(weekendPremium(shift(start, end), contractFor(customer, ON))).toBeCloseTo(
      expected,
      2
    );
  });
});

describe("holidayPremium", () => {
  it.each([
    ["aldervale", "2026-04-03T08:00", "2026-04-03T16:00", 62.4],
    ["aldervale", "2025-12-25T08:00", "2025-12-25T14:00", 46.8],
    ["nordkant", "2026-01-01T08:00", "2026-01-01T14:00", 31.2],
    ["brackwater", "2026-05-04T09:00", "2026-05-04T15:00", 26.4],
    ["veenhof", "2026-04-06T08:00", "2026-04-06T12:00", 16],
    ["aldervale", "2026-03-03T08:00", "2026-03-03T16:00", 0],
  ])("%s: %s to %s pays %d", (customer, start, end, expected) => {
    expect(holidayPremium(shift(start, end), contractFor(customer, ON))).toBeCloseTo(
      expected,
      2
    );
  });
});
