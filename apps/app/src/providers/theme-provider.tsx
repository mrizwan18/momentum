"use client";

import * as React from "react";
import { applyTheme } from "@momentum/ui";
import { useThemeStore } from "../stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    applyTheme(theme);

    if (
      theme !== "system" ||
      typeof window === "undefined" ||
      !window.matchMedia
    ) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const listener = () => applyTheme(theme);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  return <>{children}</>;
}
