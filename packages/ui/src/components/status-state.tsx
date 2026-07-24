"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { Button, type ButtonProps } from "./Button";
import { Heading, Text } from "./Typography";
import { Reveal } from "./Reveal";
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
        "flex flex-col items-center gap-4 rounded-hero bg-surface-raised px-8 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <Reveal
          variant="scale"
          className="rounded-full bg-surface p-5 text-foreground-muted"
        >
          {icon}
        </Reveal>
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
