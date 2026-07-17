import { generateId } from "@momentum/utils";
import type { RecordingRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface CreateRecordingInput {
  sessionId: string | null;
  durationMs: number;
  mimeType: string;
  blob: Blob;
  notes?: string | null;
}

export interface RecordingsRepository {
  create(input: CreateRecordingInput): Promise<RecordingRecord>;
  list(): Promise<RecordingRecord[]>;
  get(id: string): Promise<RecordingRecord | undefined>;
  toggleFavorite(id: string): Promise<RecordingRecord>;
  remove(id: string): Promise<void>;
}

export function createRecordingsRepository(
  db: MomentumDatabase,
): RecordingsRepository {
  return {
    async create(input) {
      return db.transaction("rw", db.recordings, async () => {
        const record: RecordingRecord = {
          id: generateId(),
          sessionId: input.sessionId,
          createdAt: Date.now(),
          durationMs: input.durationMs,
          mimeType: input.mimeType,
          blob: input.blob,
          favorite: false,
          notes: input.notes ?? null,
        };
        await db.recordings.add(record);
        return record;
      });
    },

    async list() {
      return db.recordings.orderBy("createdAt").reverse().toArray();
    },

    async get(id) {
      return db.recordings.get(id);
    },

    async toggleFavorite(id) {
      return db.transaction("rw", db.recordings, async () => {
        const existing = await db.recordings.get(id);
        if (!existing) {
          throw new Error(`Recording ${id} was not found`);
        }
        const updated: RecordingRecord = {
          ...existing,
          favorite: !existing.favorite,
        };
        await db.recordings.put(updated);
        return updated;
      });
    },

    async remove(id) {
      // Recordings are never silently discarded by the product rules; this
      // method exists only for an explicit, user-initiated delete action.
      await db.recordings.delete(id);
    },
  };
}
