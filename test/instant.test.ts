import {
  earlier,
  instantAt,
  later,
  minutesBetween,
  nextDayKey,
  startOfNextDay,
} from "../src/lib/instant";

describe("startOfNextDay", () => {
  it.each([
    ["2026-03-03T19:00", "2026-03-04T00:00"],
    ["2026-03-03T00:00", "2026-03-04T00:00"],
    ["2026-03-31T22:00", "2026-04-01T00:00"],
    ["2026-04-30T23:59", "2026-05-01T00:00"],
    ["2026-02-28T20:00", "2026-03-01T00:00"],
    ["2024-02-28T20:00", "2024-02-29T00:00"],
    ["2026-12-31T23:00", "2027-01-01T00:00"],
    ["2026-01-31T19:00", "2026-02-01T00:00"],
  ])("%s -> %s", (t, expected) => {
    expect(startOfNextDay(t)).toBe(expected);
  });
});

describe("nextDayKey", () => {
  it.each([
    ["2026-03-03", "2026-03-04"],
    ["2026-03-31", "2026-04-01"],
    ["2026-12-31", "2027-01-01"],
    ["2024-02-28", "2024-02-29"],
    ["2026-02-28", "2026-03-01"],
  ])("%s -> %s", (day, expected) => {
    expect(nextDayKey(day)).toBe(expected);
  });
});

describe("instantAt", () => {
  it.each([
    ["2026-03-03", 0, "2026-03-03T00:00"],
    ["2026-03-03", 21 * 60 + 30, "2026-03-03T21:30"],
    ["2026-03-03", 22 * 60, "2026-03-03T22:00"],
    ["2026-03-03", 7 * 60, "2026-03-03T07:00"],
    ["2026-03-03", 12 * 60, "2026-03-03T12:00"],
    ["2026-03-03", 23 * 60 + 59, "2026-03-03T23:59"],
  ])("%s at minute %d is %s", (day, minute, expected) => {
    expect(instantAt(day, minute)).toBe(expected);
  });
});

describe("minutesBetween", () => {
  it.each([
    ["2026-03-03T07:00", "2026-03-03T19:00", 720],
    ["2026-03-03T19:00", "2026-03-04T07:00", 720],
    ["2026-03-03T21:30", "2026-03-03T22:00", 30],
    ["2026-03-03T22:00", "2026-03-03T22:00", 0],
    ["2026-03-03T23:00", "2026-03-04T00:15", 75],
    ["2026-03-03T19:00", "2026-03-03T07:00", -720],
  ])("%s to %s is %d minutes", (from, to, expected) => {
    expect(minutesBetween(from, to)).toBe(expected);
  });
});

describe("later", () => {
  it("picks the later of two instants", () => {
    expect(later("2026-03-03T19:00", "2026-03-03T21:30")).toBe("2026-03-03T21:30");
  });

  it("picks the later across midnight", () => {
    expect(later("2026-03-04T00:15", "2026-03-03T23:00")).toBe("2026-03-04T00:15");
  });

  it("returns the first of two equal instants", () => {
    expect(later("2026-03-03T19:00", "2026-03-03T19:00")).toBe("2026-03-03T19:00");
  });
});

describe("earlier", () => {
  it("picks the earlier of two instants", () => {
    expect(earlier("2026-03-03T19:00", "2026-03-03T21:30")).toBe("2026-03-03T19:00");
  });

  it("picks the earlier across midnight", () => {
    expect(earlier("2026-03-04T00:15", "2026-03-03T23:00")).toBe("2026-03-03T23:00");
  });
});
