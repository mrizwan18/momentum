import {
  PracticeSessionSchema,
  type PracticeSessionRecord,
  type PracticeSessionStatus,
  type VoiceCondition,
} from "@momentum/types";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";
import {
  createPracticeSession,
  type CreatePracticeSessionInput,
} from "../factories/session-factory";

export interface SessionProgressPatch {
  currentStepIndex?: number;
  elapsedSeconds?: number;
  draftNotes?: string | null;
}

export type StartSessionOptions = Omit<
  CreatePracticeSessionInput,
  "exerciseIds"
>;

export interface SessionsRepository {
  start(
    exerciseIds: string[],
    options?: StartSessionOptions,
  ): Promise<PracticeSessionRecord>;
  getActive(): Promise<PracticeSessionRecord | undefined>;
  /** Every completed session, oldest first — used to compare a just-finished session against personal bests. */
  listCompleted(): Promise<PracticeSessionRecord[]>;
  updateProgress(
    id: string,
    patch: SessionProgressPatch,
  ): Promise<PracticeSessionRecord>;
  setVoiceCondition(
    id: string,
    voiceCondition: VoiceCondition,
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
      const updated = parseOrThrow(PracticeSessionSchema, "PracticeSession", {
        ...existing,
        ...extra,
        status,
        updatedAt: Date.now(),
      });
      await db.sessions.put(updated);
      return updated;
    });
  }

  return {
    async start(exerciseIds, options = {}) {
      return db.transaction("rw", db.sessions, async () => {
        const record = createPracticeSession({ exerciseIds, ...options });
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

    async listCompleted() {
      const records = await db.sessions
        .where("status")
        .equals("completed")
        .toArray();
      return records.sort(
        (a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0),
      );
    },

    async updateProgress(id, patch) {
      const existing = await requireSession(id);
      return transition(id, existing.status, patch);
    },

    async setVoiceCondition(id, voiceCondition) {
      const existing = await requireSession(id);
      return transition(id, existing.status, { voiceCondition });
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
