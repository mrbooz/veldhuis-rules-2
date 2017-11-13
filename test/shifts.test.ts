import { acceptShift, toShift } from "../src/ingest/shifts";
import { dayKeyOf } from "../src/lib/shiftWindow";

// The capture payload, the way foolscap-capture sends it. The offsets
// differ because the clocks went forward that night.
const BODY = {
  shiftRef: "S-2291",
  ward: "Beeches",
  startedAt: "2026-03-28T19:00:00+00:00",
  endedAt: "2026-03-29T07:00:00+01:00",
  shiftDate: "2026-03-29",
  capturedBy: "osei",
};

describe("acceptShift", () => {
  it("accepts a capture payload", () => {
    expect(acceptShift(BODY).shiftRef).toBe("S-2291");
  });

  it("keeps shiftDate exactly as capture sent it", () => {
    expect(acceptShift(BODY).shiftDate).toBe("2026-03-29");
  });

  it("agrees with the engine about the day the night ended", () => {
    const captured = acceptShift(BODY);
    expect(dayKeyOf(captured.endedAt)).toBe(captured.shiftDate);
  });

  it.each(["shiftRef", "ward", "startedAt", "endedAt", "shiftDate", "capturedBy"])(
    "rejects a payload missing %s",
    (field) => {
      const body: Record<string, unknown> = { ...BODY };
      delete body[field];
      expect(() => acceptShift(body)).toThrow();
    }
  );

  it("rejects a body that is not an object", () => {
    expect(() => acceptShift("S-2291")).toThrow();
    expect(() => acceptShift(null)).toThrow();
  });

  it("rejects a field capture spelled as a number", () => {
    expect(() => acceptShift({ ...BODY, shiftRef: 2291 })).toThrow();
  });

  it("rejects an empty string, because paying around a capture bug is worse", () => {
    expect(() => acceptShift({ ...BODY, ward: "" })).toThrow();
  });
});

describe("toShift", () => {
  it("reads start from startedAt", () => {
    expect(toShift(acceptShift(BODY)).start).toBe("2026-03-28T19:00:00+00:00");
  });

  it("reads end from endedAt", () => {
    expect(toShift(acceptShift(BODY)).end).toBe("2026-03-29T07:00:00+01:00");
  });

  it("hands the rules only the times", () => {
    expect(Object.keys(toShift(acceptShift(BODY))).sort()).toEqual(["end", "start"]);
  });
});
