import { RecordingSchema, type RecordingRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";
import {
  createRecording,
  type CreateRecordingInput,
} from "../factories/recording-factory";
import {
  toRecordingSummaryDTO,
  type RecordingSummaryDTO,
} from "../mappers/recording-mapper";

export type { CreateRecordingInput };

export interface RecordingsRepository {
  create(input: CreateRecordingInput): Promise<RecordingRecord>;
  list(): Promise<RecordingRecord[]>;
  /** Metadata only, without Blobs — for list views. */
  listSummaries(): Promise<RecordingSummaryDTO[]>;
  /** Recordings made during one PracticeSession, newest first. */
  listBySession(sessionId: string): Promise<RecordingRecord[]>;
  get(id: string): Promise<RecordingRecord | undefined>;
  toggleFavorite(id: string): Promise<RecordingRecord>;
  rename(id: string, title: string | null): Promise<RecordingRecord>;
  remove(id: string): Promise<void>;
}

export function createRecordingsRepository(
  db: MomentumDatabase,
): RecordingsRepository {
  return {
    async create(input) {
      return db.transaction("rw", db.recordings, async () => {
        const record = createRecording(input);
        await db.recordings.add(record);
        return record;
      });
    },

    async list() {
      return db.recordings.orderBy("createdAt").reverse().toArray();
    },

    async listSummaries() {
      const records = await db.recordings
        .orderBy("createdAt")
        .reverse()
        .toArray();
      return records.map(toRecordingSummaryDTO);
    },

    async listBySession(sessionId) {
      const records = await db.recordings
        .where("sessionId")
        .equals(sessionId)
        .toArray();
      return records.sort((a, b) => b.createdAt - a.createdAt);
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
        const updated = parseOrThrow(RecordingSchema, "Recording", {
          ...existing,
          favorite: !existing.favorite,
        });
        await db.recordings.put(updated);
        return updated;
      });
    },

    async rename(id, title) {
      return db.transaction("rw", db.recordings, async () => {
        const existing = await db.recordings.get(id);
        if (!existing) {
          throw new Error(`Recording ${id} was not found`);
        }
        const updated = parseOrThrow(RecordingSchema, "Recording", {
          ...existing,
          title,
        });
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
