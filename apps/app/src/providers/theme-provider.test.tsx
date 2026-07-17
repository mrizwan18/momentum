import { afterEach, describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";
import { useThemeStore } from "../stores/theme-store";

describe("ThemeProvider", () => {
  afterEach(() => {
    act(() => {
      useThemeStore.setState({ theme: "dark" });
    });
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  it("stamps the resolved theme onto <html>", () => {
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("re-applies when the store theme changes", () => {
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    act(() => {
      useThemeStore.getState().setTheme("light");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
