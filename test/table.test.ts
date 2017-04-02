import { contractFor } from "../src/contracts/table";

describe("contractFor", () => {
  it("reads the 1998 boundary off the aldervale row", () => {
    expect(contractFor("aldervale", "2026-03-01").nightStartsAt).toBe(21 * 60 + 30);
  });

  it("closes aldervale's month hard", () => {
    expect(contractFor("aldervale", "2026-03-01").closes).toBe("hard");
  });

  it("answers for the day it is asked about, not for today", () => {
    expect(contractFor("brackwater", "2015-06-01").baseRate).toBe(11.2);
  });

  it("returns the 2012 brackwater rates before the re-signing", () => {
    expect(contractFor("brackwater", "2021-03-31").baseRate).toBe(11.2);
  });

  it("returns the 2021 brackwater rates after it", () => {
    expect(contractFor("brackwater", "2026-03-01").baseRate).toBe(12.8);
  });

  it("switches rows on the day the new agreement takes effect", () => {
    expect(contractFor("brackwater", "2021-04-01").baseRate).toBe(12.8);
  });

  it("keeps brackwater's boundary and rounding across the re-signing", () => {
    const before = contractFor("brackwater", "2021-03-31");
    const after = contractFor("brackwater", "2021-04-01");
    expect(after.nightStartsAt).toBe(before.nightStartsAt);
    expect(after.rounds).toBe(before.rounds);
  });

  it("holds nordkant's 48-hour cap", () => {
    expect(contractFor("nordkant", "2026-03-01").weeklyCapMinutes).toBe(48 * 60);
  });

  it("holds no cap for the hospitals", () => {
    expect(contractFor("aldervale", "2026-03-01").weeklyCapMinutes).toBeNull();
  });

  it("throws for a customer we hold no agreement for", () => {
    expect(() => contractFor("elmsgate", "2026-03-01")).toThrow();
  });

  it("throws for a day before the first agreement was signed", () => {
    expect(() => contractFor("aldervale", "1998-04-05")).toThrow();
  });
});
