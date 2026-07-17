"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import type { ResolvedTheme } from "@momentum/types";
import { Button, type ButtonProps } from "./Button";
import { VisuallyHidden } from "./VisuallyHidden";

export interface ThemeToggleProps extends Omit<
  ButtonProps,
  "onClick" | "children" | "size"
> {
  theme: ResolvedTheme;
  onToggle: () => void;
}

/**
 * Presentational only — receives the resolved theme and a toggle callback
 * rather than reading a store, so packages/ui stays framework-state-free.
 */
export const ThemeToggle = React.forwardRef<
  HTMLButtonElement,
  ThemeToggleProps
>(({ theme, onToggle, variant = "ghost", ...props }, ref) => {
  const isDark = theme === "dark";

  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      onClick={onToggle}
      aria-pressed={isDark}
      {...props}
    >
      {isDark ? (
        <Moon aria-hidden="true" className="h-5 w-5" />
      ) : (
        <Sun aria-hidden="true" className="h-5 w-5" />
      )}
      <VisuallyHidden>
        {isDark ? "Switch to light theme" : "Switch to dark theme"}
      </VisuallyHidden>
    </Button>
  );
});
ThemeToggle.displayName = "ThemeToggle";
