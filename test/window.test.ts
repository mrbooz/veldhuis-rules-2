import { dayKeyOf, shiftWindow } from "../src/lib/shiftWindow";
import type { Shift } from "../src/types";

function shift(start: string, end: string): Shift {
  return { start: start, end: end };
}

describe("dayKeyOf", () => {
  it.each([
    ["2026-03-03T07:00", "2026-03-03"],
    ["2026-03-03T00:00", "2026-03-03"],
    ["2026-03-03T23:59", "2026-03-03"],
    ["2026-03-31T22:00", "2026-03-31"],
    ["2026-12-31T23:00", "2026-12-31"],
    ["2026-01-01T00:00", "2026-01-01"],
    ["2026-03-28T19:00:00+00:00", "2026-03-28"],
    ["2026-03-29T07:00:00+01:00", "2026-03-29"],
  ])("reads the day off %s", (t, expected) => {
    expect(dayKeyOf(t)).toBe(expected);
  });
});

describe("shiftWindow", () => {
  it("returns one window, not one per day", () => {
    const w = shiftWindow(shift("2026-03-03T19:00", "2026-03-04T07:00"));
    expect(Array.isArray(w)).toBe(false);
  });

  it("keeps the shift's own from", () => {
    const w = shiftWindow(shift("2026-03-03T07:00", "2026-03-03T19:00"));
    expect(w.from).toBe("2026-03-03T07:00");
  });

  it("keeps the shift's own to", () => {
    const w = shiftWindow(shift("2026-03-03T07:00", "2026-03-03T19:00"));
    expect(w.to).toBe("2026-03-03T19:00");
  });

  it("does not report midnight for a day shift", () => {
    const w = shiftWindow(shift("2026-03-03T07:00", "2026-03-03T19:00"));
    expect(w.spansMidnight).toBe(false);
  });

  it("reports midnight for a night shift", () => {
    const w = shiftWindow(shift("2026-03-03T19:00", "2026-03-04T07:00"));
    expect(w.spansMidnight).toBe(true);
  });

  it("reports midnight for a shift ending exactly at midnight", () => {
    const w = shiftWindow(shift("2026-03-03T19:00", "2026-03-04T00:00"));
    expect(w.spansMidnight).toBe(true);
  });

  it("does not divide a night shift", () => {
    const w = shiftWindow(shift("2026-03-03T19:00", "2026-03-04T07:00"));
    expect(w.from).toBe("2026-03-03T19:00");
  });

  it("hands the caller the whole night", () => {
    const w = shiftWindow(shift("2026-03-03T19:00", "2026-03-04T07:00"));
    expect(w.to).toBe("2026-03-04T07:00");
  });
});
