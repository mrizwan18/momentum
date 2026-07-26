import { generateId } from "@momentum/utils";
import { RecordingSchema, type RecordingRecord } from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateRecordingInput {
  sessionId?: string | null;
  exerciseAttemptId?: string | null;
  exerciseId?: string | null;
  durationMs: number;
  mimeType: string;
  blob: Blob;
  title?: string | null;
  notes?: string | null;
}

export function createRecording(input: CreateRecordingInput): RecordingRecord {
  return parseOrThrow(RecordingSchema, "Recording", {
    id: generateId(),
    sessionId: input.sessionId ?? null,
    exerciseAttemptId: input.exerciseAttemptId ?? null,
    exerciseId: input.exerciseId ?? null,
    createdAt: Date.now(),
    durationMs: input.durationMs,
    mimeType: input.mimeType,
    blob: input.blob,
    favorite: false,
    title: input.title ?? null,
    notes: input.notes ?? null,
  });
}
