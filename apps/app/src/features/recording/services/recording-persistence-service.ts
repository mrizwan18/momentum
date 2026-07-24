import type { MomentumStorage } from "@momentum/storage";
import type { RecordingRecord } from "@momentum/types";

export interface SaveRecordingInput {
  sessionId: string | null;
  blob: Blob;
  mimeType: string;
  durationMs: number;
  title: string | null;
}

/** Thin delegation to the repository — same "service = plain functions over storage" shape as practice-service.ts. */
export async function saveRecording(
  storage: MomentumStorage,
  input: SaveRecordingInput,
): Promise<RecordingRecord> {
  return storage.recordings.create({
    sessionId: input.sessionId,
    durationMs: input.durationMs,
    mimeType: input.mimeType,
    blob: input.blob,
    title: input.title,
  });
}

export async function renameRecording(
  storage: MomentumStorage,
  id: string,
  title: string | null,
): Promise<RecordingRecord> {
  return storage.recordings.rename(id, title);
}

export async function deleteRecording(
  storage: MomentumStorage,
  id: string,
): Promise<void> {
  return storage.recordings.remove(id);
}

export async function listSessionRecordings(
  storage: MomentumStorage,
  sessionId: string,
): Promise<RecordingRecord[]> {
  return storage.recordings.listBySession(sessionId);
}
