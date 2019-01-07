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

  it("prices the whole aldervale night", () => {
    // evening half: 5h base, 2 whole hours of night past 21:30
    // morning half: 7h base, 7 whole hours of night
    const contract = contractFor("aldervale", ON);
    expect(evaluateSpan(shift("2026-03-03T19:00", "2026-03-04T07:00"), contract).total).toBeCloseTo(
      352.8,
      2
    );
  });

  it("divides at midnight, not at the night boundary", () => {
    // 21:00-00:00 holds 2 whole hours of night; 00:00-01:00 holds one more
    const contract = contractFor("aldervale", ON);
    expect(evaluateSpan(shift("2026-03-03T21:00", "2026-03-04T01:00"), contract).total).toBeCloseTo(
      117.6,
      2
    );
  });

  it("treats a shift ending exactly at midnight as one that crosses it", () => {
    const contract = contractFor("aldervale", ON);
    const divided = evaluateSpan(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract);
    const half = evaluate(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract);
    expect(divided.total).toBeCloseTo(half.total, 6);
  });

  it("prices a nordkant night hour for hour", () => {
    // one hour each side of midnight, both inside the 22:00 night
    const contract = contractFor("nordkant", ON);
    expect(evaluateSpan(shift("2026-03-03T23:00", "2026-03-04T01:00"), contract).total).toBeCloseTo(
      34,
      2
    );
  });

  it("prices a brackwater late shift on both sides of midnight", () => {
    // 22:00-00:00: 2h base and 2 whole hours of night
    // 00:00-00:30: 30 min base, no whole hour of night
    const contract = contractFor("brackwater", ON);
    expect(evaluateSpan(shift("2026-03-03T22:00", "2026-03-04T00:30"), contract).total).toBeCloseTo(
      37.8,
      2
    );
  });

  it("pays the evening half at the evening's terms", () => {
    const contract = contractFor("aldervale", ON);
    expect(evaluate(shift("2026-03-03T19:00", "2026-03-04T00:00"), contract).total).toBeCloseTo(
      114.8,
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
