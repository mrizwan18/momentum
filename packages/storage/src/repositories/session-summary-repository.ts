import type { SessionSummaryRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createSessionSummary,
  type CreateSessionSummaryInput,
} from "../factories/session-summary-factory";

export type { CreateSessionSummaryInput };

export interface SessionSummaryRepository {
  create(input: CreateSessionSummaryInput): Promise<SessionSummaryRecord>;
  getBySession(sessionId: string): Promise<SessionSummaryRecord | undefined>;
  /** Every summary ever created, oldest first — used to compare a just-finished session against personal bests. */
  list(): Promise<SessionSummaryRecord[]>;
}

export function createSessionSummaryRepository(
  db: MomentumDatabase,
): SessionSummaryRepository {
  return {
    async create(input) {
      return db.transaction("rw", db.sessionSummaries, async () => {
        const record = createSessionSummary(input);
        // One summary per session: put() overwrites if a session is
        // (re-)summarized rather than accumulating duplicates.
        await db.sessionSummaries.put(record);
        return record;
      });
    },

    async getBySession(sessionId) {
      return db.sessionSummaries.get(sessionId);
    },

    async list() {
      const records = await db.sessionSummaries.toArray();
      return records.sort((a, b) => a.createdAt - b.createdAt);
    },
  };
}
