import type { PracticeSessionRecord } from "@momentum/types";

export interface CompletionRateSummary {
  completed: number;
  abandoned: number;
  total: number;
  rate: number;
}

/** `sessions` must already be filtered to completed + abandoned (terminal) sessions. */
export function computeCompletionRate(
  sessions: PracticeSessionRecord[],
): CompletionRateSummary {
  const completed = sessions.filter((s) => s.status === "completed").length;
  const abandoned = sessions.filter((s) => s.status === "abandoned").length;
  const total = completed + abandoned;
  return {
    completed,
    abandoned,
    total,
    rate: total > 0 ? completed / total : 0,
  };
}
