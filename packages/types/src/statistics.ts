/**
 * One row per calendar day, keyed by ISO date ("YYYY-MM-DD") so writes for
 * the same day are idempotent upserts rather than duplicate inserts.
 */
export interface StatisticsEntryRecord {
  id: string;
  date: string;
  practiceMinutes: number;
  sessionsCompleted: number;
  growthScore: number | null;
  updatedAt: number;
}
