import type { MomentumStorage } from "@momentum/storage";

export interface SaveBaselineInput {
  blob: Blob;
  durationMs: number;
}

/**
 * Saves the onboarding voice-intro take as the user's baseline recording —
 * via the existing `recordings` repository (no schema/repository changes),
 * with no PracticeSession to attach to yet. `title` is how Progress/Timeline
 * screens can later recognize it as the baseline rather than a regular take.
 */
export async function saveBaselineRecording(
  storage: MomentumStorage,
  input: SaveBaselineInput,
) {
  return storage.recordings.create({
    sessionId: null,
    durationMs: input.durationMs,
    mimeType: input.blob.type,
    blob: input.blob,
    title: "Baseline Recording",
  });
}
