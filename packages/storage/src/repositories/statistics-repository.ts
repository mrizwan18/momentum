import type { StatisticsEntryRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface RecordPracticeInput {
  date: string;
  practiceMinutes: number;
  sessionsCompleted: number;
  growthScore?: number | null;
}

export interface StatisticsRepository {
  upsertForDate(input: RecordPracticeInput): Promise<StatisticsEntryRecord>;
  get(date: string): Promise<StatisticsEntryRecord | undefined>;
  list(): Promise<StatisticsEntryRecord[]>;
}

export function createStatisticsRepository(
  db: MomentumDatabase,
): StatisticsRepository {
  return {
    async upsertForDate(input) {
      return db.transaction("rw", db.statistics, async () => {
        const existing = await db.statistics.get(input.date);
        const record: StatisticsEntryRecord = {
          id: input.date,
          date: input.date,
          practiceMinutes:
            (existing?.practiceMinutes ?? 0) + input.practiceMinutes,
          sessionsCompleted:
            (existing?.sessionsCompleted ?? 0) + input.sessionsCompleted,
          growthScore: input.growthScore ?? existing?.growthScore ?? null,
          updatedAt: Date.now(),
        };
        await db.statistics.put(record);
        return record;
      });
    },

    async get(date) {
      return db.statistics.get(date);
    },

    async list() {
      return db.statistics.orderBy("date").toArray();
    },
  };
}
