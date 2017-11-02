import { nightBoundaryFor } from "../src/rules/nightBoundary";

describe("nightBoundaryFor", () => {
  it.each([
    ["aldervale", "2026-03-03", 21 * 60 + 30],
    ["aldervale", "1998-04-06", 21 * 60 + 30],
    ["nordkant", "2026-03-03", 22 * 60],
    ["brackwater", "2026-03-03", 22 * 60],
    ["brackwater", "2015-01-01", 22 * 60],
    ["veenhof", "2026-03-03", 22 * 60],
  ])("%s on %s starts the night at minute %d", (customer, on, expected) => {
    expect(nightBoundaryFor(customer, on)).toBe(expected);
  });

  it("will not guess a boundary for a customer without an agreement", () => {
    expect(() => nightBoundaryFor("elmsgate", "2026-03-03")).toThrow();
  });
});
