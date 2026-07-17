import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const gap = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

const stackVariants = cva("flex flex-col", {
  variants: { gap },
  defaultVariants: { gap: "md" },
});

export interface StackProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

/** Vertical spacing primitive — prefer this over ad-hoc margin utilities. */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ gap: gapSize, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ gap: gapSize }), className)}
      {...props}
    />
  ),
);
Stack.displayName = "Stack";

const clusterVariants = cva("flex flex-wrap items-center", {
  variants: { gap },
  defaultVariants: { gap: "md" },
});

export interface ClusterProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof clusterVariants> {}

/** Horizontal, wrapping spacing primitive for rows of controls/tags. */
export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(
  ({ gap: gapSize, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(clusterVariants({ gap: gapSize }), className)}
      {...props}
    />
  ),
);
Cluster.displayName = "Cluster";
