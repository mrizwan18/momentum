"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { VisuallyHidden } from "./VisuallyHidden";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, loading = false, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
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
            loading && "pr-9",
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
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
