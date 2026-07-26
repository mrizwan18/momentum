import type { DashboardInsightRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createDashboardInsight,
  type CreateDashboardInsightInput,
} from "../factories/ai-dashboard-insight-factory";

export type { CreateDashboardInsightInput };

export interface AiDashboardInsightRepository {
  getForDate(date: string): Promise<DashboardInsightRecord | undefined>;
  /** Replaces any existing insight for that date — the caller (src/ai/services) decides whether a refresh is actually warranted. */
  setForDate(
    input: CreateDashboardInsightInput,
  ): Promise<DashboardInsightRecord>;
}

export function createAiDashboardInsightRepository(
  db: MomentumDatabase,
): AiDashboardInsightRepository {
  return {
    async getForDate(date) {
      return db.aiDashboardInsights.get(date);
    },

    async setForDate(input) {
      return db.transaction("rw", db.aiDashboardInsights, async () => {
        const record = createDashboardInsight(input);
        await db.aiDashboardInsights.put(record);
        return record;
      });
    },
  };
}
