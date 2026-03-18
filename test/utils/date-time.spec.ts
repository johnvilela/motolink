import { describe, expect, it } from "vitest";
import { dbTimeToTimeString, timeStringToDbTime } from "../../src/utils/date-time";

describe("date-time helpers", () => {
  it("should render UTC-backed database time values in Sao Paulo local time", () => {
    expect(dbTimeToTimeString("1970-01-01T23:00:00.000Z")).toBe("20:00");
    expect(dbTimeToTimeString("1970-01-01T03:00:00.000Z")).toBe("00:00");
    expect(dbTimeToTimeString("1970-01-01T11:00:00.000Z")).toBe("08:00");
  });

  it("should store Sao Paulo wall-clock input as UTC-backed time values", () => {
    expect(timeStringToDbTime("20:00").toISOString()).toBe("1970-01-01T23:00:00.000Z");
    expect(timeStringToDbTime("00:00").toISOString()).toBe("1970-01-01T03:00:00.000Z");
    expect(timeStringToDbTime("08:00").toISOString()).toBe("1970-01-01T11:00:00.000Z");
  });
});
