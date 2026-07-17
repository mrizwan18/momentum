export type PracticeSessionStatus =
  "in_progress" | "paused" | "completed" | "abandoned";

export interface PracticeSessionRecord {
  id: string;
  status: PracticeSessionStatus;
  exerciseIds: string[];
  currentStepIndex: number;
  elapsedSeconds: number;
  startedAt: number;
  updatedAt: number;
  completedAt: number | null;
}
