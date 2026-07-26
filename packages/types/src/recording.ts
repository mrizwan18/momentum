import { z } from "zod";

/**
 * `blob` is a runtime-only Blob (Dexie stores it natively), so it's
 * declared via z.custom rather than a Zod primitive. Structural (duck-type)
 * checking rather than `instanceof Blob` — fake-indexeddb (used in tests)
 * reconstructs Blobs via structured clone, which can produce an object
 * that fails `instanceof` against this realm's Blob constructor despite
 * being a perfectly valid Blob.
 */
function isBlobLike(value: unknown): value is Blob {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Blob).size === "number" &&
    typeof (value as Blob).type === "string" &&
    typeof (value as Blob).slice === "function"
  );
}

export const RecordingSchema = z.object({
  id: z.string(),
  sessionId: z.string().nullable(),
  /** Links this recording back to the specific exercise attempt that produced it. */
  exerciseAttemptId: z.string().nullable(),
  /**
   * Which exercise this take was recorded for — set at record time (unlike
   * exerciseAttemptId, which can't be, since the attempt record isn't
   * created until the exercise is later completed). Used to give the AI
   * audio-analysis prompt real per-exercise context.
   */
  exerciseId: z.string().nullable(),
  createdAt: z.number(),
  durationMs: z.number().min(0),
  mimeType: z.string().min(1),
  blob: z.custom<Blob>(isBlobLike, { message: "Expected a Blob" }),
  favorite: z.boolean(),
  /** User-editable label (e.g. "Take 2") — distinct from `notes`. */
  title: z.string().nullable(),
  notes: z.string().nullable(),
});

export type RecordingRecord = z.infer<typeof RecordingSchema>;
