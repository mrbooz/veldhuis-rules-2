import { contractFor } from "../src/contracts/table";
import { evaluate } from "../src/rules/engine";
import type { Shift } from "../src/types";

const ON = "2026-03-01";

function shift(start: string, end: string): Shift {
  return { start: start, end: end };
}

function totalFor(customer: string, start: string, end: string): number {
  return evaluate(shift(start, end), contractFor(customer, ON)).total;
}

// Same-day shifts throughout, so the totals stand whatever attribution
// does with a shift that crosses midnight.
describe("evaluate", () => {
  it("pays the base hours on a plain weekday shift", () => {
    // 720 worked, quarter-hour leaves 720: 12 hours at 15.60
    expect(totalFor("aldervale", "2026-03-03T07:00", "2026-03-03T19:00")).toBeCloseTo(187.2, 2);
  });

  it("rounds the base hours up to the six-minute mark for nordkant", () => {
    // 482 worked becomes 486 payable: 8.1 hours at 13.90
    expect(totalFor("nordkant", "2026-03-04T08:00", "2026-03-04T16:02")).toBeCloseTo(112.59, 2);
  });

  it("pays veenhof exactly what the clock says", () => {
    expect(totalFor("veenhof", "2026-03-04T09:00", "2026-03-04T17:00")).toBeCloseTo(96.8, 2);
  });

  it("drops brackwater to the five-minute mark", () => {
    // 484 worked becomes 480 payable: 8 hours at 12.80
    expect(totalFor("brackwater", "2026-03-05T08:00", "2026-03-05T16:04")).toBeCloseTo(102.4, 2);
  });

  it("adds the night premium to the base on an evening shift", () => {
    // base 4h at 15.60 plus one whole hour of night at 18.40
    expect(totalFor("aldervale", "2026-03-03T19:00", "2026-03-03T23:00")).toBeCloseTo(80.8, 2);
  });

  it("adds the weekend premium on a Saturday day shift", () => {
    expect(totalFor("aldervale", "2026-03-07T07:00", "2026-03-07T19:00")).toBeCloseTo(234, 2);
  });

  it("adds the bank holiday premium on Good Friday", () => {
    expect(totalFor("veenhof", "2026-04-03T08:00", "2026-04-03T16:00")).toBeCloseTo(128.8, 2);
  });

  it("adds the holiday premium on New Year's Day", () => {
    expect(totalFor("nordkant", "2026-01-01T08:00", "2026-01-01T14:00")).toBeCloseTo(114.6, 2);
  });

  it("stacks night and weekend on a Saturday evening", () => {
    // base 5h at 15.60, night 1h at 18.40, weekend 5h at 3.90
    expect(totalFor("aldervale", "2026-03-07T18:00", "2026-03-07T23:00")).toBeCloseTo(115.9, 2);
  });

  it("reads the 22:00 boundary for a customer without the 1998 letter", () => {
    // base 2h at 13.90, night 1h at 3.10
    expect(totalFor("nordkant", "2026-03-03T21:00", "2026-03-03T23:00")).toBeCloseTo(30.9, 2);
  });

  it("reads the 21:30 boundary for aldervale", () => {
    // base 2h at 15.60, and 21:00-23:00 holds one whole hour past 21:30
    expect(totalFor("aldervale", "2026-03-03T21:00", "2026-03-03T23:00")).toBeCloseTo(49.6, 2);
  });

  it("pays the small hours as night", () => {
    // base 7h at 15.60 plus 7 whole hours of night at 18.40
    expect(totalFor("aldervale", "2026-03-04T00:00", "2026-03-04T07:00")).toBeCloseTo(238, 2);
  });

  it("pays nothing for a zero-length shift", () => {
    expect(totalFor("nordkant", "2026-03-03T08:00", "2026-03-03T08:00")).toBe(0);
  });

  it("pays brackwater's night at brackwater's rate", () => {
    // base 1h at 12.80 plus one whole hour of night at 2.90
    expect(totalFor("brackwater", "2026-03-03T22:00", "2026-03-03T23:00")).toBeCloseTo(15.7, 2);
  });

  it("returns a number", () => {
    const result = evaluate(
      shift("2026-03-03T19:00", "2026-03-03T23:00"),
      contractFor("aldervale", ON)
    );
    expect(typeof result.total).toBe("number");
  });

  it("gives the same total for the same shift", () => {
    const s = shift("2026-03-07T18:00", "2026-03-07T23:00");
    const contract = contractFor("aldervale", ON);
    expect(evaluate(s, contract).total).toBe(evaluate(s, contract).total);
  });

  it("prices the same hours differently under different agreements", () => {
    const s = shift("2026-03-04T09:00", "2026-03-04T17:00");
    const aldervale = evaluate(s, contractFor("aldervale", ON)).total;
    const veenhof = evaluate(s, contractFor("veenhof", ON)).total;
    expect(aldervale).not.toBe(veenhof);
  });
});
