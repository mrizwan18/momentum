import { Bell } from "lucide-react";
import { Avatar, Heading, Text, shadowStyle } from "@momentum/ui";
import { getTimeOfDayGreeting } from "../lib/greeting";

export interface DashboardHeaderProps {
  displayName: string | null;
}

/**
 * docs/design/PIXEL_SPEC.md B1: avatar + greeting + bell row. The bell is
 * disabled — Momentum has no notification system yet, so it's an honest
 * placeholder rather than a button that does nothing when tapped.
 */
export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={displayName} />
        <div className="flex flex-col">
          <Text size="sm" className="font-medium">
            {getTimeOfDayGreeting()}
          </Text>
          <Heading as="h1" size="xl">
            {displayName ?? "Welcome"}
          </Heading>
        </div>
      </div>
      <button
        type="button"
        disabled
        aria-label="Notifications (coming soon)"
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground disabled:opacity-60"
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
