import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  NumberDisplay,
  Text,
} from "@momentum/ui";
import type { WeeklySnapshot } from "../lib/weekly-snapshot";

export interface WeeklySnapshotCardProps {
  weekly: WeeklySnapshot;
}

export function WeeklySnapshotCard({ weekly }: WeeklySnapshotCardProps) {
  const hasActivity =
    weekly.practiceMinutes > 0 || weekly.sessionsCompleted > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Weekly Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <NumberDisplay size="md" data-testid="weekly-minutes">
                {Math.round(weekly.practiceMinutes)}
              </NumberDisplay>
              <Text tone="muted" size="sm">
                Minutes practiced
              </Text>
            </div>
            <div>
              <NumberDisplay size="md" data-testid="weekly-sessions">
                {weekly.sessionsCompleted}
              </NumberDisplay>
              <Text tone="muted" size="sm">
                Sessions completed
              </Text>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No practice yet this week"
            description="Your weekly snapshot will appear once you complete a session."
          />
        )}
      </CardContent>
    </Card>
  );
}
