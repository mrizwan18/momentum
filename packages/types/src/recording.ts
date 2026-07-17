export interface RecordingRecord {
  id: string;
  sessionId: string | null;
  createdAt: number;
  durationMs: number;
  mimeType: string;
  blob: Blob;
  favorite: boolean;
  notes: string | null;
}
