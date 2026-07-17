import { generateId } from "@momentum/utils";
import type {
  PracticeSessionRecord,
  PracticeSessionStatus,
} from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface SessionProgressPatch {
  currentStepIndex?: number;
  elapsedSeconds?: number;
}

export interface SessionsRepository {
  start(exerciseIds: string[]): Promise<PracticeSessionRecord>;
  getActive(): Promise<PracticeSessionRecord | undefined>;
  updateProgress(
    id: string,
    patch: SessionProgressPatch,
  ): Promise<PracticeSessionRecord>;
  pause(id: string): Promise<PracticeSessionRecord>;
  resume(id: string): Promise<PracticeSessionRecord>;
  complete(id: string): Promise<PracticeSessionRecord>;
  abandon(id: string): Promise<PracticeSessionRecord>;
}

export function createSessionsRepository(
  db: MomentumDatabase,
): SessionsRepository {
  async function requireSession(id: string): Promise<PracticeSessionRecord> {
    const existing = await db.sessions.get(id);
    if (!existing) {
      throw new Error(`Practice session ${id} was not found`);
    }
    return existing;
  }

  async function transition(
    id: string,
    status: PracticeSessionStatus,
    extra: Partial<PracticeSessionRecord> = {},
  ): Promise<PracticeSessionRecord> {
    return db.transaction("rw", db.sessions, async () => {
      const existing = await requireSession(id);
      const updated: PracticeSessionRecord = {
        ...existing,
        ...extra,
        status,
        updatedAt: Date.now(),
      };
      await db.sessions.put(updated);
      return updated;
    });
  }

  return {
    async start(exerciseIds) {
      return db.transaction("rw", db.sessions, async () => {
        const now = Date.now();
        const record: PracticeSessionRecord = {
          id: generateId(),
          status: "in_progress",
          exerciseIds,
          currentStepIndex: 0,
          elapsedSeconds: 0,
          startedAt: now,
          updatedAt: now,
          completedAt: null,
        };
        await db.sessions.add(record);
        return record;
      });
    },

    async getActive() {
      return db.sessions
        .where("status")
        .anyOf(["in_progress", "paused"])
        .last();
    },

    async updateProgress(id, patch) {
      const existing = await requireSession(id);
      return transition(id, existing.status, patch);
    },

    async pause(id) {
      return transition(id, "paused");
    },

    async resume(id) {
      return transition(id, "in_progress");
    },

    async complete(id) {
      return transition(id, "completed", { completedAt: Date.now() });
    },

    async abandon(id) {
      return transition(id, "abandoned");
    },
  };
}
