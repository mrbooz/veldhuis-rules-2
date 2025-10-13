import { contractFor } from "../src/contracts/table";
import { evaluate } from "../src/rules/engine";
import { evaluateSpan } from "../src/rules/span";
import type { Shift } from "../src/types";

const ON = "2026-03-01";

function shift(start: string, end: string): Shift {
  return { start: start, end: end };
}

describe("evaluateSpan", () => {
  it("hands a same-day shift straight to the engine", () => {
    const s = shift("2026-03-03T07:00", "2026-03-03T19:00");
    const contract = contractFor("aldervale", ON);
    expect(evaluateSpan(s, contract).total).toBe(evaluate(s, contract).total);
  });

  it("divides a night shift at midnight and sums the halves", () => {
    const contract = contractFor("aldervale", ON);
    const whole = evaluateSpan(shift("2026-03-03T19:00", "2026-03-04T07:00"), contract);
    const before = evaluate(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract);
    const after = evaluate(shift("2026-03-04T00:00", "2026-03-04T07:00"), contract);
    expect(whole.total).toBeCloseTo(before.total + after.total, 6);
  });

  it("prices a nordkant night as its two days", () => {
    // The whole is the sum of its halves, each priced as a shift of its own.
    // Which day carries which premium belongs to attribution, which has its
    // own tests — this one pins only the division.
    const contract = contractFor("nordkant", ON);
    const whole = evaluateSpan(shift("2026-03-03T20:00", "2026-03-04T06:00"), contract);
    const evening = evaluate(shift("2026-03-03T20:00", "2026-03-04T00:00"), contract);
    const morning = evaluate(shift("2026-03-04T00:00", "2026-03-04T06:00"), contract);
    expect(whole.total).toBeCloseTo(evening.total + morning.total, 6);
  });

  it("divides at midnight, not at the night boundary", () => {
    // The halves that reproduce the whole are the midnight halves — a split
    // at 21:30 would leave a remainder the sum could not explain.
    const contract = contractFor("aldervale", ON);
    const whole = evaluateSpan(shift("2026-03-03T21:00", "2026-03-04T01:00"), contract);
    const toMidnight = evaluate(shift("2026-03-03T21:00", "2026-03-04T00:00"), contract);
    const fromMidnight = evaluate(shift("2026-03-04T00:00", "2026-03-04T01:00"), contract);
    expect(whole.total).toBeCloseTo(toMidnight.total + fromMidnight.total, 6);
  });

  it("treats a shift ending exactly at midnight as one that crosses it", () => {
    const contract = contractFor("aldervale", ON);
    const divided = evaluateSpan(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract);
    const half = evaluate(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract);
    expect(divided.total).toBeCloseTo(half.total, 6);
  });

  it("prices a nordkant small hour, base and night together", () => {
    // one hour after midnight, inside its own day's small hours
    const contract = contractFor("nordkant", ON);
    expect(evaluateSpan(shift("2026-03-04T00:00", "2026-03-04T01:00"), contract).total).toBeCloseTo(
      17,
      2
    );
  });

  it("prices the brackwater half hour after midnight at base", () => {
    // 30 min base, no whole hour of night — the fragment a late shift leaves
    const contract = contractFor("brackwater", ON);
    expect(evaluateSpan(shift("2026-03-04T00:00", "2026-03-04T00:30"), contract).total).toBeCloseTo(
      6.4,
      2
    );
  });

  it("pays an evening inside its own day at the evening's terms", () => {
    // 4h base, one whole hour past the 21:30 boundary
    const contract = contractFor("aldervale", ON);
    expect(evaluate(shift("2026-03-03T19:00", "2026-03-03T23:00"), contract).total).toBeCloseTo(
      80.8,
      2
    );
  });

  it("pays the morning half at the morning's terms", () => {
    const contract = contractFor("aldervale", ON);
    expect(evaluate(shift("2026-03-04T00:00", "2026-03-04T07:00"), contract).total).toBeCloseTo(
      238,
      2
    );
  });

  it("gives the same answer twice for the same night", () => {
    const contract = contractFor("aldervale", ON);
    const s = shift("2026-03-03T19:00", "2026-03-04T07:00");
    expect(evaluateSpan(s, contract).total).toBe(evaluateSpan(s, contract).total);
  });

  it("does not change the shift it divides", () => {
    const s = shift("2026-03-03T19:00", "2026-03-04T07:00");
    evaluateSpan(s, contractFor("aldervale", ON));
    expect(s.start).toBe("2026-03-03T19:00");
    expect(s.end).toBe("2026-03-04T07:00");
  });

  it("pays a divided weekday night more than its own first half", () => {
    const contract = contractFor("aldervale", ON);
    const whole = evaluateSpan(shift("2026-03-03T19:00", "2026-03-04T07:00"), contract);
    const first = evaluate(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract);
    expect(whole.total).toBeGreaterThan(first.total);
  });
});
