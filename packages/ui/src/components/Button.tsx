"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { radiusStyle, shadowStyle, touchTargetStyle } from "../lib/shape";
import { VisuallyHidden } from "./VisuallyHidden";

/**
 * Variants follow docs/design/component-system.md: Primary (filled),
 * Secondary (outlined), Ghost (text only), Danger (red, destructive only).
 *
 * Colors, radius, sizing, and disabled/opacity styling are applied via
 * inline style rather than Tailwind utility classes. Direct inspection of
 * this project's compiled production stylesheet shows that only a small,
 * long-established set of utilities (from early sprints) survive —
 * `bg-danger`, `text-primary-foreground`, `inline-flex`, `opacity-50`,
 * `pointer-events-none`, hover-variant classes, and more all silently
 * fail to compile, alongside every custom token added since. This is a
 * pre-existing build-tooling defect (documented in the final summary),
 * not something fixable from component code.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "default" | "icon";

const variantStyle: Record<
  ButtonVariant,
  { backgroundColor: string; color: string; border?: string }
> = {
  primary: {
    backgroundColor: "hsl(var(--palette-primary))",
    color: "hsl(var(--palette-primary-foreground))",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "hsl(var(--palette-text))",
    border: "1px solid hsl(var(--palette-border))",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "hsl(var(--palette-text))",
  },
  danger: {
    backgroundColor: "hsl(var(--palette-danger))",
    color: "hsl(var(--palette-danger-foreground))",
  },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      style,
      variant = "primary",
      size = "default",
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = asChild ? false : disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn("gap-2 text-sm font-medium", className)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: size === "icon" ? 0 : "1rem",
          paddingRight: size === "icon" ? 0 : "1rem",
          transitionProperty:
            "color, background-color, border-color, transform",
          transitionDuration: "150ms",
          pointerEvents: isDisabled ? "none" : undefined,
          opacity: isDisabled ? 0.5 : undefined,
          ...touchTargetStyle,
          ...radiusStyle.pill,
          ...variantStyle[variant],
          ...(variant === "primary" ? shadowStyle.buttonPrimary : null),
          ...style,
        }}
        aria-busy={loading || undefined}
        disabled={asChild ? undefined : disabled || loading}
        {...props}
      >
        {!asChild && loading ? (
          <>
            <motion.span
              style={{ display: "inline-flex", height: "1rem", width: "1rem" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 aria-hidden="true" className="h-4 w-4" />
            </motion.span>
            <VisuallyHidden>Loading</VisuallyHidden>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
