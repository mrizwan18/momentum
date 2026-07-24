import { Text } from "@momentum/ui";
import { getSubtitle } from "../lib/greeting";
import type { PracticeStatus } from "../lib/streak";

export interface GreetingProps {
  status: PracticeStatus;
}

/**
 * Just the status-appropriate subtitle ("Let's keep your streak alive.",
 * etc). The time-of-day greeting + name lives in DashboardHeader now, as
 * the page's one h1 — this stays a plain text line underneath it.
 */
export function Greeting({ status }: GreetingProps) {
  return (
    <Text tone="muted" size="lg">
      {getSubtitle(status)}
    </Text>
  );
}
