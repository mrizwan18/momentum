"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { VisuallyHidden } from "./VisuallyHidden";

/**
 * Variants follow docs/design/component-system.md: Primary (filled),
 * Secondary (outlined), Ghost (text only), Danger (red, destructive only).
 */
const buttonVariants = cva(
  cn(
    "inline-flex min-h-touch items-center justify-center gap-2",
    "rounded-lg text-sm font-medium",
    "transition-colors duration-standard ease-momentum",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-surface-raised",
        ghost: "bg-transparent text-foreground hover:bg-surface-raised",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90",
      },
      size: {
        default: "min-w-touch px-4",
        icon: "min-w-touch px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading || undefined}
        disabled={asChild ? undefined : disabled || loading}
        {...props}
      >
        {!asChild && loading ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
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
