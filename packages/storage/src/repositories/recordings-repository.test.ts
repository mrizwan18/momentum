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

  it("lists summaries without a blob field, newest first", async () => {
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

    const summaries = await repo.listSummaries();
    expect(summaries.map((s) => s.id)).toEqual([second.id, first.id]);
    expect(summaries.every((s) => !("blob" in s))).toBe(true);
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

  it("has no title by default, and can be renamed", async () => {
    const repo = createRecordingsRepository(db);
    const recording = await repo.create({
      sessionId: null,
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });
    expect(recording.title).toBeNull();

    const renamed = await repo.rename(recording.id, "Take 2");
    expect(renamed.title).toBe("Take 2");
  });

  it("lists only recordings belonging to the given session, newest first", async () => {
    const repo = createRecordingsRepository(db);
    const sessionA1 = await repo.create({
      sessionId: "session-a",
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });
    // Distinct createdAt timestamps so "newest first" is unambiguous.
    await new Promise((resolve) => setTimeout(resolve, 2));
    const sessionA2 = await repo.create({
      sessionId: "session-a",
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });
    await repo.create({
      sessionId: "session-b",
      durationMs: 1000,
      mimeType: "audio/webm",
      blob: fakeAudioBlob(),
    });

    const results = await repo.listBySession("session-a");
    expect(results.map((r) => r.id)).toEqual([sessionA2.id, sessionA1.id]);
  });
});
