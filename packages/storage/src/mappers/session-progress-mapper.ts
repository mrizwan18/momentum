import type {
  PracticeSessionRecord,
  PracticeSessionStatus,
} from "@momentum/types";

export interface SessionWithProgressDTO {
  id: string;
  status: PracticeSessionStatus;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  isComplete: boolean;
}

export function toSessionWithProgressDTO(
  record: PracticeSessionRecord,
): SessionWithProgressDTO {
  const totalSteps = record.exerciseIds.length;
  const completedSteps = Math.min(record.currentStepIndex, totalSteps);
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  return {
    id: record.id,
    status: record.status,
    totalSteps,
    completedSteps,
    progressPercent,
    isComplete: record.status === "completed",
  };
}
