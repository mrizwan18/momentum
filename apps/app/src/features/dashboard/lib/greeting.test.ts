import { describe, expect, it } from "vitest";
import { getSubtitle, getTimeOfDayGreeting } from "./greeting";

describe("getTimeOfDayGreeting", () => {
  it.each([
    [3, "Good Night"],
    [8, "Good Morning"],
    [14, "Good Afternoon"],
    [19, "Good Evening"],
    [23, "Good Night"],
  ])("returns %s at hour %i", (hour, expected) => {
    const date = new Date(2026, 6, 17, hour);
    expect(getTimeOfDayGreeting(date)).toBe(expected);
  });
});

describe("getSubtitle", () => {
  it("matches docs/features/dashboard.md subtitle examples per status", () => {
    expect(getSubtitle("new")).toMatch(/first practice/i);
    expect(getSubtitle("streak-active")).toMatch(/keep your streak alive/i);
    expect(getSubtitle("recovery")).toMatch(/recovery sessions count too/i);
    expect(getSubtitle("practiced-today")).toMatch(/shown up today/i);
  });
});
