import { afterEach, describe, expect, it } from "vitest";
import { useThemeStore } from "./theme-store";
import { THEME_STORAGE_KEY } from "../lib/theme-storage-key";

describe("theme store", () => {
  afterEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "dark" });
  });

  it("defaults to dark", () => {
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("updates and persists the theme preference", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");

    const stored = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? "{}");
    expect(stored.state.theme).toBe("light");
  });
});
