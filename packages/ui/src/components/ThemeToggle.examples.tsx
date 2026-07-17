"use client";

import * as React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { applyTheme } from "../theme/apply-theme";
import { Cluster } from "./Stack";
import { Text } from "./Typography";
import type { ResolvedTheme } from "@momentum/types";

export default function ThemeToggleExamples() {
  const [theme, setTheme] = React.useState<ResolvedTheme>("dark");

  React.useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setTheme(current);
    }
  }, []);

  function handleToggle() {
    setTheme((previous) => {
      const next = previous === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }

  return (
    <Cluster gap="md">
      <ThemeToggle theme={theme} onToggle={handleToggle} />
      <Text tone="muted">Currently: {theme}</Text>
    </Cluster>
  );
}
