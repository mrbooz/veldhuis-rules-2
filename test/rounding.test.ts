import { contractFor } from "../src/contracts/table";
import { payableMinutes } from "../src/rules/rounding";

const ON = "2026-03-01";

// The four opinions, read off the table the way the engine reads them.
describe("the signed opinions", () => {
  it.each([
    ["aldervale", "quarter-hour"],
    ["nordkant", "up-to-six"],
    ["brackwater", "down-to-five"],
    ["veenhof", "exact"],
  ])("%s signed %s", (customer, opinion) => {
    expect(contractFor(customer, ON).rounds).toBe(opinion);
  });
});

describe("payableMinutes, quarter-hour (aldervale)", () => {
  it.each([
    [720, 720],
    [7, 0],
    [8, 15],
    [22, 15],
    [23, 30],
    [142, 135],
    [158, 165],
  ])("%d worked minutes pay %d", (worked, expected) => {
    expect(payableMinutes(worked, contractFor("aldervale", ON))).toBe(expected);
  });
});

describe("payableMinutes, up-to-six (nordkant)", () => {
  it.each([
    [0, 0],
    [1, 6],
    [6, 6],
    [482, 486],
    [720, 720],
  ])("%d worked minutes pay %d", (worked, expected) => {
    expect(payableMinutes(worked, contractFor("nordkant", ON))).toBe(expected);
  });
});

describe("payableMinutes, down-to-five (brackwater)", () => {
  it.each([
    [4, 0],
    [5, 5],
    [93, 90],
    [290, 290],
    [512, 510],
  ])("%d worked minutes pay %d", (worked, expected) => {
    expect(payableMinutes(worked, contractFor("brackwater", ON))).toBe(expected);
  });
});

describe("payableMinutes, exact (veenhof)", () => {
  it.each([
    [0, 0],
    [73, 73],
    [481, 481],
    [719, 719],
  ])("%d worked minutes pay %d", (worked, expected) => {
    expect(payableMinutes(worked, contractFor("veenhof", ON))).toBe(expected);
  });
});
