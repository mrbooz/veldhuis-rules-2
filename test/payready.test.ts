import { contractFor } from "../src/contracts/table";
import { exportSummary, payReadyFile, payReadyLine, weeklyCapRows } from "../src/export/payready";
import { evaluateSpan } from "../src/rules/span";
import { toShift } from "../src/ingest/shifts";
import type { CapturedShift } from "../src/ingest/shifts";
import type { Shift } from "../src/types";

const ON = "2026-03-01";

function captured(ref: string, start: string, end: string, shiftDate: string): CapturedShift {
  return {
    shiftRef: ref,
    ward: "Beeches",
    startedAt: start,
    endedAt: end,
    shiftDate: shiftDate,
    capturedBy: "osei",
  };
}

function shift(start: string, end: string): Shift {
  return { start: start, end: end };
}

describe("payReadyLine", () => {
  const contract = contractFor("aldervale", ON);
  const night = captured("S-1041", "2026-03-03T19:00", "2026-03-04T07:00", "2026-03-03");

  it("starts with the capture ref", () => {
    expect(payReadyLine(night, contract).split("\t")[0]).toBe("S-1041");
  });

  it("names the customer in the second field", () => {
    expect(payReadyLine(night, contract).split("\t")[1]).toBe("aldervale");
  });

  it("carries the whole result on the line", () => {
    const parsed = JSON.parse(payReadyLine(night, contract).split("\t")[2]);
    expect(typeof parsed.total).toBe("number");
  });

  it("puts the engine's own number on the line", () => {
    const parsed = JSON.parse(payReadyLine(night, contract).split("\t")[2]);
    expect(parsed.total).toBe(evaluateSpan(toShift(night), contract).total);
  });

  it("prices the divided night onto one line", () => {
    const parsed = JSON.parse(payReadyLine(night, contract).split("\t")[2]);
    expect(parsed.total).toBeCloseTo(352.8, 2);
  });
});

describe("payReadyFile", () => {
  const contract = contractFor("aldervale", ON);
  const rows = [
    captured("S-1041", "2026-03-03T07:00", "2026-03-03T19:00", "2026-03-03"),
    captured("S-1042", "2026-03-04T07:00", "2026-03-04T19:00", "2026-03-04"),
  ];

  it("writes one line per shift", () => {
    expect(payReadyFile(rows, contract).trimEnd().split("\n").length).toBe(2);
  });

  it("ends with a newline, because the other side's loader needs one", () => {
    expect(payReadyFile(rows, contract).endsWith("\n")).toBe(true);
  });

  it("keeps the capture order", () => {
    const lines = payReadyFile(rows, contract).trimEnd().split("\n");
    expect(lines[0].split("\t")[0]).toBe("S-1041");
    expect(lines[1].split("\t")[0]).toBe("S-1042");
  });
});

describe("weeklyCapRows", () => {
  const nordkant = contractFor("nordkant", ON);

  it("is empty for a contract without a cap", () => {
    const rows = weeklyCapRows(
      [shift("2026-03-02T07:00", "2026-03-02T19:00")],
      contractFor("aldervale", ON)
    );
    expect(rows).toEqual([]);
  });

  it("sums the week's payable minutes", () => {
    const rows = weeklyCapRows(
      [shift("2026-03-02T08:00", "2026-03-02T18:00"), shift("2026-03-04T08:00", "2026-03-04T18:00")],
      nordkant
    );
    expect(rows[0].workedMinutes).toBe(1200);
  });

  it("flags a week over the 48-hour cap", () => {
    const rows = weeklyCapRows(
      [
        shift("2026-03-02T07:00", "2026-03-02T19:00"),
        shift("2026-03-03T07:00", "2026-03-03T19:00"),
        shift("2026-03-04T07:00", "2026-03-04T19:00"),
        shift("2026-03-05T07:00", "2026-03-05T19:00"),
        shift("2026-03-06T07:00", "2026-03-06T19:00"),
      ],
      nordkant
    );
    expect(rows[0].over).toBe(true);
  });

  it("does not flag a week at exactly 48 hours", () => {
    const rows = weeklyCapRows(
      [
        shift("2026-03-02T07:00", "2026-03-02T19:00"),
        shift("2026-03-03T07:00", "2026-03-03T19:00"),
        shift("2026-03-04T07:00", "2026-03-04T19:00"),
        shift("2026-03-05T07:00", "2026-03-05T19:00"),
      ],
      nordkant
    );
    expect(rows[0].over).toBe(false);
  });

  it("keys the week by its Monday", () => {
    const rows = weeklyCapRows([shift("2026-03-04T08:00", "2026-03-04T18:00")], nordkant);
    expect(rows[0].week).toBe("2026-03-02");
  });

  it("puts Sunday in the week before Monday", () => {
    const rows = weeklyCapRows(
      [shift("2026-03-08T08:00", "2026-03-08T16:00"), shift("2026-03-09T08:00", "2026-03-09T16:00")],
      nordkant
    );
    expect(rows.map((r) => r.week)).toEqual(["2026-03-02", "2026-03-09"]);
  });
});

describe("exportSummary", () => {
  it("counts one line per day", () => {
    const text = exportSummary([
      captured("S-1", "2026-03-03T07:00", "2026-03-03T19:00", "2026-03-03"),
      captured("S-2", "2026-03-04T07:00", "2026-03-04T19:00", "2026-03-04"),
    ]);
    expect(text.trimEnd().split("\n").length).toBe(2);
  });

  it("counts by capture's shiftDate and not by the times", () => {
    // The clocks went forward this night; capture said the 29th, so the
    // summary says the 29th.
    const text = exportSummary([
      captured("S-3", "2026-03-28T19:00:00+00:00", "2026-03-29T07:00:00+01:00", "2026-03-29"),
    ]);
    expect(text).toBe("2026-03-29  1 shift\n");
  });

  it("counts two shifts on one day as two shifts", () => {
    const text = exportSummary([
      captured("S-4", "2026-03-03T07:00", "2026-03-03T19:00", "2026-03-03"),
      captured("S-5", "2026-03-03T19:00", "2026-03-04T07:00", "2026-03-03"),
    ]);
    expect(text).toBe("2026-03-03  2 shifts\n");
  });
});
