"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Cluster,
  EmptyState,
  Stack,
  Text,
} from "@momentum/ui";
import { formatDuration } from "@/lib/format-duration";
import type { HistoryEntry } from "../lib/history";

export interface HistoryListProps {
  history: HistoryEntry[];
}

export function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <Card elevation="raised">
        <CardHeader>
          <CardTitle as="h2">History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No sessions yet"
            description="Finish a practice session and it'll show up here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">History</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="sm">
          {history.map((entry) => (
            <Cluster
              key={entry.sessionId}
              gap="sm"
              className="items-center justify-between rounded-lg bg-surface-raised px-4 py-3"
            >
              <Stack gap="none">
                <Text size="sm" className="font-medium">
                  {entry.date}
                </Text>
                <Text tone="muted" size="sm">
                  {entry.status === "completed"
                    ? `${formatDuration(entry.durationSeconds)} · ${entry.exercisesCompleted} exercises`
                    : "Abandoned"}
                </Text>
              </Stack>
              {entry.status === "completed" && entry.dailyScore !== null ? (
                <Stack gap="none" className="items-end">
                  <Text size="sm" className="font-semibold">
                    {entry.dailyScore}
                  </Text>
                  <Text tone="muted" size="sm">
                    score
                  </Text>
                </Stack>
              ) : null}
            </Cluster>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
