import { describe, expect, it } from "vitest";
import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
  it("formats seconds under a minute", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(599)).toBe("9:59");
  });

  it("formats hours once elapsed time passes 60 minutes", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("rounds fractional seconds and clamps negatives to zero", () => {
    expect(formatDuration(59.6)).toBe("1:00");
    expect(formatDuration(-5)).toBe("0:00");
  });
});
