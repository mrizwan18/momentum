import type { AiSessionInsightRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createAiSessionInsight,
  type CreateAiSessionInsightInput,
} from "../factories/ai-session-insight-factory";

export type { CreateAiSessionInsightInput };

export interface AiSessionInsightRepository {
  create(input: CreateAiSessionInsightInput): Promise<AiSessionInsightRecord>;
  getBySession(sessionId: string): Promise<AiSessionInsightRecord | undefined>;
  /** Every insight ever generated, oldest first — used for Baseline Comparison's rolling average/best-session lookups. */
  list(): Promise<AiSessionInsightRecord[]>;
}

export function createAiSessionInsightRepository(
  db: MomentumDatabase,
): AiSessionInsightRepository {
  return {
    async create(input) {
      return db.transaction("rw", db.aiSessionInsights, async () => {
        const record = createAiSessionInsight(input);
        // One insight per session: put() overwrites if a session is
        // (re-)summarized rather than accumulating duplicates.
        await db.aiSessionInsights.put(record);
        return record;
      });
    },

    async getBySession(sessionId) {
      return db.aiSessionInsights.get(sessionId);
    },

    async list() {
      const records = await db.aiSessionInsights.toArray();
      return records.sort((a, b) => a.createdAt - b.createdAt);
    },
  };
}
