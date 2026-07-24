"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { VisuallyHidden } from "./VisuallyHidden";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean;
  /** Decorative icon rendered inside the field's leading edge (e.g. a person glyph for a name field). */
  leadingIcon?: React.ReactNode;
  /** Static text rendered inside the field's trailing edge (e.g. a unit like "Years"). */
  trailingText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      loading = false,
      disabled,
      leadingIcon,
      trailingText,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative w-full">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-foreground-muted"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          aria-busy={loading || undefined}
          disabled={disabled || loading}
          className={cn(
            "flex min-h-touch w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
            "placeholder:text-foreground-muted",
            "transition-colors duration-fast ease-momentum",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-[invalid=true]:border-danger",
            leadingIcon && "pl-9",
            (loading || trailingText) && "pr-9",
            className,
          )}
          {...props}
        />
        {loading ? (
          <>
            <Loader2
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-foreground-muted"
            />
            <VisuallyHidden>Loading</VisuallyHidden>
          </>
        ) : trailingText ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-foreground-muted"
          >
            {trailingText}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
