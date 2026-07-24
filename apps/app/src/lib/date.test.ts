import { describe, expect, it } from "vitest";
import { toDateOnly } from "./date";

describe("toDateOnly", () => {
  it("formats a date as local YYYY-MM-DD", () => {
    expect(toDateOnly(new Date(2026, 6, 17))).toBe("2026-07-17");
  });

  it("pads single-digit months and days", () => {
    expect(toDateOnly(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
