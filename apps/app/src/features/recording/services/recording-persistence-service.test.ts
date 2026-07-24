import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import {
  deleteRecording,
  listSessionRecordings,
  renameRecording,
  saveRecording,
} from "./recording-persistence-service";

function fakeAudioBlob() {
  return new Blob(["fake-audio"], { type: "audio/webm" });
}

describe("recording-persistence-service", () => {
  let storage: MomentumStorage;

  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-recording-persistence-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("saves a recording through the repository pattern", async () => {
    const recording = await saveRecording(storage, {
      sessionId: "session-1",
      blob: fakeAudioBlob(),
      mimeType: "audio/webm",
      durationMs: 4200,
      title: "Take 1",
    });

    expect(recording.sessionId).toBe("session-1");
    expect(recording.durationMs).toBe(4200);
    expect(recording.title).toBe("Take 1");
    await expect(storage.recordings.get(recording.id)).resolves.toEqual(
      recording,
    );
  });

  it("renames a saved recording", async () => {
    const recording = await saveRecording(storage, {
      sessionId: null,
      blob: fakeAudioBlob(),
      mimeType: "audio/webm",
      durationMs: 1000,
      title: "Take 1",
    });

    const renamed = await renameRecording(
      storage,
      recording.id,
      "My best take",
    );
    expect(renamed.title).toBe("My best take");
  });

  it("deletes a recording", async () => {
    const recording = await saveRecording(storage, {
      sessionId: null,
      blob: fakeAudioBlob(),
      mimeType: "audio/webm",
      durationMs: 1000,
      title: null,
    });

    await deleteRecording(storage, recording.id);
    await expect(storage.recordings.get(recording.id)).resolves.toBeUndefined();
  });

  it("lists only recordings for the given session", async () => {
    const inSession = await saveRecording(storage, {
      sessionId: "session-a",
      blob: fakeAudioBlob(),
      mimeType: "audio/webm",
      durationMs: 1000,
      title: null,
    });
    await saveRecording(storage, {
      sessionId: "session-b",
      blob: fakeAudioBlob(),
      mimeType: "audio/webm",
      durationMs: 1000,
      title: null,
    });

    const results = await listSessionRecordings(storage, "session-a");
    expect(results.map((r) => r.id)).toEqual([inSession.id]);
  });
});
