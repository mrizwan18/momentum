import * as React from "react";
import { cn } from "../lib/cn";

export type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Keeps content in the accessibility tree (for screen readers) while
 * removing it from the visual layout. Prefer this over `hidden`/`display:
 * none`, which would remove it from both.
 */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap",
        "[clip-path:inset(50%)]",
        className,
      )}
      {...props}
    />
  );
}
