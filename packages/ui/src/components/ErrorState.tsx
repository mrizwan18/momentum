import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { StatusState, type StatusStateProps } from "./status-state";

export type ErrorStateProps = StatusStateProps;

/**
 * "We couldn't save that recording. Nothing has been lost. Try again." —
 * calm, helpful, actionable tone per docs/design/design-language.md.
 */
export function ErrorState({
  icon = <AlertTriangle className="h-8 w-8" />,
  actionLabel = "Try again",
  ...props
}: ErrorStateProps) {
  return <StatusState icon={icon} actionLabel={actionLabel} {...props} />;
}
