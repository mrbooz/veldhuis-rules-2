import { contractFor } from "../src/contracts/table";
import {
  buildRota,
  compareRows,
  isClosedRow,
  isLongRow,
  isNightRow,
  isWeekendRow,
  pageTitle,
  rowFor,
  spansMidnightRow,
  wardKeyOf,
} from "../src/export/rota";
import type { RotaRow } from "../src/export/rota";
import type { Shift } from "../src/types";

const ON = "2026-03-01";

function shift(start: string, end: string): Shift {
  return { start: start, end: end };
}

function row(start: string, end: string, ward?: string, day?: string): RotaRow {
  return {
    ward: ward || "Beeches",
    day: day || start.slice(0, 10),
    startsAt: new Date(start),
    endsAt: new Date(end),
  };
}

describe("isNightRow", () => {
  it.each([
    ["2026-03-03T07:00", "2026-03-03T19:00", false],
    ["2026-03-03T18:59", "2026-03-03T23:00", false],
    ["2026-03-03T19:00", "2026-03-04T07:00", true],
    ["2026-03-03T21:30", "2026-03-04T07:00", true],
    ["2026-03-03T23:00", "2026-03-04T07:00", true],
  ])("a row starting %s -> %s", (start, end, expected) => {
    expect(isNightRow(row(start, end))).toBe(expected);
  });
});

describe("isWeekendRow", () => {
  it.each([
    ["2026-03-07T09:00", "2026-03-07T17:00", true],
    ["2026-03-08T09:00", "2026-03-08T17:00", true],
    ["2026-03-02T09:00", "2026-03-02T17:00", false],
    ["2026-03-06T09:00", "2026-03-06T17:00", false],
  ])("a row starting %s -> %s", (start, end, expected) => {
    expect(isWeekendRow(row(start, end))).toBe(expected);
  });
});

describe("spansMidnightRow", () => {
  it("is true for a night row", () => {
    expect(spansMidnightRow(row("2026-03-03T19:00", "2026-03-04T07:00"))).toBe(true);
  });

  it("is false for a day row", () => {
    expect(spansMidnightRow(row("2026-03-03T07:00", "2026-03-03T19:00"))).toBe(false);
  });

  it("is true for a row ending exactly at midnight", () => {
    expect(spansMidnightRow(row("2026-03-03T19:00", "2026-03-04T00:00"))).toBe(true);
  });
});

describe("isLongRow", () => {
  it("is false at exactly twelve hours", () => {
    expect(isLongRow(row("2026-03-03T07:00", "2026-03-03T19:00"))).toBe(false);
  });

  it("is true past twelve hours", () => {
    expect(isLongRow(row("2026-03-03T07:00", "2026-03-03T19:30"))).toBe(true);
  });

  it("is false for an eight-hour row", () => {
    expect(isLongRow(row("2026-03-03T09:00", "2026-03-03T17:00"))).toBe(false);
  });
});

describe("compareRows", () => {
  it("puts the earlier start first", () => {
    const a = row("2026-03-03T07:00", "2026-03-03T19:00");
    const b = row("2026-03-03T09:00", "2026-03-03T17:00");
    expect(compareRows(a, b)).toBeLessThan(0);
  });

  it("breaks a tie on the ward name", () => {
    const a = row("2026-03-03T07:00", "2026-03-03T19:00", "Beeches");
    const b = row("2026-03-03T07:00", "2026-03-03T19:00", "Cedars");
    expect(compareRows(a, b)).toBeLessThan(0);
  });

  it("calls two identical rows equal", () => {
    const a = row("2026-03-03T07:00", "2026-03-03T19:00");
    const b = row("2026-03-03T07:00", "2026-03-03T19:00");
    expect(compareRows(a, b)).toBe(0);
  });
});

describe("isClosedRow", () => {
  it("closes nothing when no month is closed", () => {
    expect(isClosedRow(row("2026-02-10T07:00", "2026-02-10T19:00"), null)).toBe(false);
  });

  it("closes a row inside the closed month", () => {
    expect(isClosedRow(row("2026-02-27T07:00", "2026-02-27T19:00"), "2026-02")).toBe(true);
  });

  it("keeps a row in the month after", () => {
    expect(isClosedRow(row("2026-03-02T07:00", "2026-03-02T19:00"), "2026-02")).toBe(false);
  });
});

describe("wardKeyOf", () => {
  it("keys the page by the ward exactly as capture spells it", () => {
    expect(wardKeyOf(row("2026-03-03T07:00", "2026-03-03T19:00", "St. Olav 3-West"))).toBe(
      "St. Olav 3-West"
    );
  });
});

describe("pageTitle", () => {
  it("names the page after the ward and the month", () => {
    expect(pageTitle("Beeches", "2026-03")).toBe("Beeches — 2026-03");
  });
});

describe("rowFor", () => {
  it("draws the grid from the wall clock", () => {
    const r = rowFor(shift("2026-03-03T19:00", "2026-03-04T07:00"), contractFor("aldervale", ON), "Beeches");
    expect(r.startsAt.getHours()).toBe(19);
  });

  it("gives a same-day shift its own day", () => {
    const r = rowFor(shift("2026-03-03T07:00", "2026-03-03T19:00"), contractFor("aldervale", ON), "Beeches");
    expect(r.day).toBe("2026-03-03");
  });

  it("keeps the ward it was given", () => {
    const r = rowFor(shift("2026-03-03T07:00", "2026-03-03T19:00"), contractFor("aldervale", ON), "Cedars");
    expect(r.ward).toBe("Cedars");
  });

  it("throws on unreadable shift times", () => {
    expect(() =>
      rowFor(shift("not-a-time", "2026-03-03T19:00"), contractFor("aldervale", ON), "Beeches")
    ).toThrow();
  });

  it("holds a month-end night on the start date when the month closes hard", () => {
    // 2019: a hospital was paying the same night twice across a month end.
    const r = rowFor(shift("2026-03-31T19:00", "2026-04-01T07:00"), contractFor("aldervale", ON), "Beeches");
    expect(r.day).toBe("2026-03-31");
  });

  it("stands the guard down inside the month", () => {
    const r = rowFor(shift("2026-03-03T19:00", "2026-03-03T23:00"), contractFor("aldervale", ON), "Beeches");
    expect(r.day).toBe("2026-03-03");
  });

  it("stands the guard down for a day shift at the month end", () => {
    const r = rowFor(shift("2026-03-31T07:00", "2026-03-31T19:00"), contractFor("aldervale", ON), "Beeches");
    expect(r.day).toBe("2026-03-31");
  });
});

describe("buildRota", () => {
  const contract = contractFor("aldervale", ON);

  it("writes one row per shift", () => {
    const rows = buildRota(
      [shift("2026-03-02T07:00", "2026-03-02T19:00"), shift("2026-03-03T07:00", "2026-03-03T19:00")],
      contract,
      "Beeches",
      null
    );
    expect(rows.length).toBe(2);
  });

  it("does not export rows for a closed month", () => {
    // 2023-01-31: whatever was exported for a closed month is what was paid.
    const rows = buildRota(
      [shift("2026-02-10T07:00", "2026-02-10T19:00"), shift("2026-03-02T07:00", "2026-03-02T19:00")],
      contract,
      "Beeches",
      "2026-02"
    );
    expect(rows.length).toBe(1);
  });

  it("keeps the rows for the open month", () => {
    const rows = buildRota(
      [shift("2026-02-10T07:00", "2026-02-10T19:00"), shift("2026-03-02T07:00", "2026-03-02T19:00")],
      contract,
      "Beeches",
      "2026-02"
    );
    expect(rows[0].day).toBe("2026-03-02");
  });

  it("writes rows in the order the pages show them", () => {
    const rows = buildRota(
      [shift("2026-03-03T09:00", "2026-03-03T17:00"), shift("2026-03-03T07:00", "2026-03-03T19:00")],
      contract,
      "Beeches",
      null
    );
    expect(rows[0].startsAt.getHours()).toBe(7);
  });

  it("exports nothing when every month is closed", () => {
    const rows = buildRota(
      [shift("2026-02-10T07:00", "2026-02-10T19:00")],
      contract,
      "Beeches",
      "2026-03"
    );
    expect(rows.length).toBe(0);
  });
});
