import { describe, expect, it } from "vitest";
import { daysBetween, toDateOnly } from "./date";

describe("toDateOnly", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toDateOnly(new Date(2026, 6, 5))).toBe("2026-07-05");
  });
});

describe("daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetween("2026-07-17", "2026-07-17")).toBe(0);
  });

  it("returns a positive number when a is after b", () => {
    expect(daysBetween("2026-07-17", "2026-07-16")).toBe(1);
  });

  it("returns a negative number when a is before b", () => {
    expect(daysBetween("2026-07-16", "2026-07-17")).toBe(-1);
  });

  it("handles month boundaries", () => {
    expect(daysBetween("2026-08-01", "2026-07-31")).toBe(1);
  });
});
