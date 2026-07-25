"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  NumberDisplay,
  Text,
} from "@momentum/ui";
import { formatDuration } from "@/lib/format-duration";
import type { PersonalRecords } from "../lib/personal-records";

export interface PersonalRecordsCardProps {
  records: PersonalRecords;
}

interface RecordTileProps {
  label: string;
  value: string;
}

function RecordTile({ label, value }: RecordTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-raised p-4">
      <Text tone="muted" size="sm">
        {label}
      </Text>
      <NumberDisplay size="lg">{value}</NumberDisplay>
    </div>
  );
}

export function PersonalRecordsCard({ records }: PersonalRecordsCardProps) {
  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">Personal Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <RecordTile
            label="Longest streak"
            value={`${records.longestStreak} ${records.longestStreak === 1 ? "day" : "days"}`}
          />
          <RecordTile
            label="Longest session"
            value={formatDuration(records.longestSessionSeconds)}
          />
          <RecordTile
            label="Best daily score"
            value={
              records.bestDailyScore !== null
                ? String(records.bestDailyScore)
                : "—"
            }
          />
          <RecordTile
            label="Most exercises"
            value={String(records.mostExercisesInSession)}
          />
          <RecordTile
            label="Best practice day"
            value={`${records.bestPracticeDayMinutes} min`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
