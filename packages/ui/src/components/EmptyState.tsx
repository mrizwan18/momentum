import * as React from "react";
import { Sparkles } from "lucide-react";
import { StatusState, type StatusStateProps } from "./status-state";

export type EmptyStateProps = StatusStateProps;

/**
 * "No recordings yet. Your first recording becomes the beginning of your
 * Voice Timeline." — explanation + encouragement + a single CTA.
 */
export function EmptyState({
  icon = <Sparkles className="h-8 w-8" />,
  ...props
}: EmptyStateProps) {
  return <StatusState icon={icon} {...props} />;
}
