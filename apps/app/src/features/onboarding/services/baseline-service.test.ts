import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { saveBaselineRecording } from "./baseline-service";

describe("saveBaselineRecording", () => {
  let storage: MomentumStorage;

  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-baseline-service-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("persists the take with no session and a recognizable title", async () => {
    const blob = new Blob(["fake-audio"], { type: "audio/webm" });
    const saved = await saveBaselineRecording(storage, {
      blob,
      durationMs: 12000,
    });

    expect(saved.sessionId).toBeNull();
    expect(saved.durationMs).toBe(12000);
    expect(saved.mimeType).toBe("audio/webm");
    expect(saved.title).toBe("Baseline Recording");

    const fromRepo = await storage.recordings.get(saved.id);
    expect(fromRepo?.title).toBe("Baseline Recording");
  });
});
