"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { Button, type ButtonProps } from "./Button";
import { Heading, Text } from "./Typography";
import { Stack } from "./Stack";

/**
 * Shared shape behind EmptyState and ErrorState — both are "explanation +
 * encouragement + one action" per docs/design/design-language.md.
 */
export interface StatusStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  actionProps?: Omit<ButtonProps, "onClick" | "children" | "loading">;
}

export function StatusState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionLoading = false,
  actionProps,
  className,
  ...props
}: StatusStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div aria-hidden="true" className="text-foreground-muted">
          {icon}
        </div>
      ) : null}
      <Stack gap="xs">
        <Heading as="h2" size="md">
          {title}
        </Heading>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>
      {actionLabel && onAction ? (
        <Button onClick={onAction} loading={actionLoading} {...actionProps}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
