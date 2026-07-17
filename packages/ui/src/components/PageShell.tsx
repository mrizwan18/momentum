"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import { Heading, Text } from "./Typography";
import { Skeleton } from "./Skeleton";
import { Stack } from "./Stack";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Reserves space at the bottom for a fixed <BottomNav>. */
  withBottomNav?: boolean;
}

/** Mobile-first page container: single column, max content width, generous whitespace on larger screens. */
export const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ withBottomNav = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 sm:px-6",
        withBottomNav ? "pb-24" : "pb-6",
        className,
      )}
      {...props}
    />
  ),
);
PageShell.displayName = "PageShell";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function PageHeader({
  title,
  description,
  onBack,
  actions,
  loading = false,
  disabled = false,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      aria-busy={loading || undefined}
      className={cn(
        "flex items-start justify-between gap-4",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            disabled={disabled}
            aria-label="Go back"
            className="-ml-2"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Button>
        ) : null}

        {loading ? (
          <Stack gap="xs" className="pt-1">
            <Skeleton className="h-6 w-40" />
            {description ? <Skeleton className="h-4 w-56" /> : null}
          </Stack>
        ) : (
          <div className="flex flex-col gap-1 pt-1">
            <Heading as="h1" size="lg">
              {title}
            </Heading>
            {description ? <Text tone="muted">{description}</Text> : null}
          </div>
        )}
      </div>

      {actions ? (
        <div className="flex items-center gap-2 pt-1">{actions}</div>
      ) : null}
    </header>
  );
}
