"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";
import { radiusStyle, shadowStyle, touchTargetStyle } from "../lib/shape";
import { VisuallyHidden } from "./VisuallyHidden";

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  label?: string;
}

/**
 * docs/design/PIXEL_SPEC.md B1/B3-B5: a floating pill bar inset from the
 * screen edges, not an edge-to-edge bordered bar. Radius/shadow are inline
 * styles — `rounded-pill`/`shadow-nav` don't reliably compile in this
 * project's production build (see lib/shape.ts).
 */
export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ label = "Primary", className, style, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label={label}
      style={{
        position: "fixed",
        insetInline: "1rem",
        bottom: "1rem",
        zIndex: 40,
        ...radiusStyle.pill,
        ...shadowStyle.nav,
        ...style,
      }}
      className={cn(
        "flex items-center justify-between gap-1",
        "bg-surface p-2",
        "mb-[env(safe-area-inset-bottom)]",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  ),
);
BottomNav.displayName = "BottomNav";

export interface BottomNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  asChild?: boolean;
}

/**
 * Active tab renders as a filled pill with a visible icon + label; every
 * other tab is an icon-only circle with the label kept for assistive tech
 * via VisuallyHidden, matching PIXEL_SPEC's nav exactly.
 */
export const BottomNavItem = React.forwardRef<
  HTMLButtonElement,
  BottomNavItemProps
>(
  (
    {
      icon,
      label,
      active = false,
      disabled = false,
      asChild = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        aria-current={active ? "page" : undefined}
        disabled={asChild ? undefined : disabled}
        style={{
          ...touchTargetStyle,
          ...radiusStyle.pill,
          ...(active ? shadowStyle.buttonPrimary : null),
          ...style,
        }}
        className={cn(
          "flex items-center justify-center gap-2",
          "transition-[color,background-color,transform] duration-fast ease-momentum",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.96]",
          active
            ? "bg-primary px-4 text-primary-foreground"
            : "px-0 text-foreground-muted hover:text-foreground",
          className,
        )}
        {...props}
      >
        <span aria-hidden="true" className="h-5 w-5 shrink-0">
          {icon}
        </span>
        {active ? (
          <span className="text-sm font-semibold">{label}</span>
        ) : (
          <VisuallyHidden>{label}</VisuallyHidden>
        )}
      </Comp>
    );
  },
);
BottomNavItem.displayName = "BottomNavItem";
