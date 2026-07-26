import type { RecordingRecord } from "@momentum/types";

/**
 * A Recording without its Blob — for list views that only need metadata
 * and shouldn't hold every recording's audio bytes in memory at once.
 */
export interface RecordingSummaryDTO {
  id: string;
  sessionId: string | null;
  exerciseAttemptId: string | null;
  exerciseId: string | null;
  createdAt: number;
  durationMs: number;
  mimeType: string;
  favorite: boolean;
  title: string | null;
  notes: string | null;
}

export function toRecordingSummaryDTO(
  record: RecordingRecord,
): RecordingSummaryDTO {
  const { blob: _blob, ...summary } = record;
  return summary;
}
