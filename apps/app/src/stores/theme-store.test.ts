import { afterEach, describe, expect, it } from "vitest";
import { useThemeStore } from "./theme-store";
import { THEME_STORAGE_KEY } from "../lib/theme-storage-key";

describe("theme store", () => {
  afterEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "light" });
  });

  it("defaults to light", () => {
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("updates and persists the theme preference", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");

    const stored = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? "{}");
    expect(stored.state.theme).toBe("dark");
  });
});
