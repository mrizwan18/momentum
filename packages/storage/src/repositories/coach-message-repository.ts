import type { CoachMessageRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createCoachMessage,
  type CreateCoachMessageInput,
} from "../factories/coach-message-factory";

export type { CreateCoachMessageInput };

export interface CoachMessageRepository {
  append(input: CreateCoachMessageInput): Promise<CoachMessageRecord>;
  /** Chronological (oldest first). Pass `limit` to cap how much history is sent as AI context. */
  list(limit?: number): Promise<CoachMessageRecord[]>;
}

export function createCoachMessageRepository(
  db: MomentumDatabase,
): CoachMessageRepository {
  return {
    async append(input) {
      return db.transaction("rw", db.coachMessages, async () => {
        const record = createCoachMessage(input);
        await db.coachMessages.add(record);
        return record;
      });
    },

    async list(limit) {
      const records = await db.coachMessages.orderBy("createdAt").toArray();
      return limit ? records.slice(-limit) : records;
    },
  };
}
