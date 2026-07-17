"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  label?: string;
}

export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ label = "Primary", className, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label={label}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around",
        "border-t border-border bg-surface",
        "pb-[env(safe-area-inset-bottom)]",
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
        className={cn(
          "flex min-h-touch min-w-touch flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium",
          "transition-colors duration-fast ease-momentum",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
          "disabled:pointer-events-none disabled:opacity-50",
          active
            ? "text-primary"
            : "text-foreground-muted hover:text-foreground",
          className,
        )}
        {...props}
      >
        <span aria-hidden="true" className="h-5 w-5">
          {icon}
        </span>
        <span>{label}</span>
      </Comp>
    );
  },
);
BottomNavItem.displayName = "BottomNavItem";
