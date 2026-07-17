import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createRecordingsRepository } from "./recordings-repository";

function fakeAudioBlob() {
  return new Blob(["fake-audio"], { type: "audio/webm" });
}

describe("recordings repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-recordings-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("creates a recording that is not a favorite by default", async () => {
    const repo = createRecordingsRepository(db);
    const recording = await repo.create({
      sessionId: "session-1",
      durationMs: 5000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });

    expect(recording.favorite).toBe(false);
    expect(recording.notes).toBeNull();
  });

  it("lists recordings newest first", async () => {
    const repo = createRecordingsRepository(db);
    const first = await repo.create({
      sessionId: null,
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });
    const second = await repo.create({
      sessionId: null,
      durationMs: 2000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });

    const list = await repo.list();
    expect(list.map((r) => r.id)).toEqual([second.id, first.id]);
  });

  it("toggles favorite state", async () => {
    const repo = createRecordingsRepository(db);
    const recording = await repo.create({
      sessionId: null,
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });

    const favorited = await repo.toggleFavorite(recording.id);
    expect(favorited.favorite).toBe(true);

    const unfavorited = await repo.toggleFavorite(recording.id);
    expect(unfavorited.favorite).toBe(false);
  });

  it("removes a recording", async () => {
    const repo = createRecordingsRepository(db);
    const recording = await repo.create({
      sessionId: null,
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });

    await repo.remove(recording.id);
    await expect(repo.get(recording.id)).resolves.toBeUndefined();
  });
});
