import { describe, expect, it } from "vitest";
import type { RecordingRecord } from "@momentum/types";
import { toRecordingSummaryDTO } from "./recording-mapper";

function recording(): RecordingRecord {
  return {
    id: "rec-1",
    sessionId: "session-1",
    exerciseAttemptId: "attempt-1",
    exerciseId: "exercise-1",
    createdAt: 0,
    durationMs: 5000,
    mimeType: "audio/webm",
    blob: new Blob(["audio"], { type: "audio/webm" }),
    favorite: true,
    title: "Take 2",
    notes: "great take",
  };
}

describe("toRecordingSummaryDTO", () => {
  it("carries over every field except the blob", () => {
    const dto = toRecordingSummaryDTO(recording());
    expect(dto).toEqual({
      id: "rec-1",
      sessionId: "session-1",
      exerciseAttemptId: "attempt-1",
      exerciseId: "exercise-1",
      createdAt: 0,
      durationMs: 5000,
      mimeType: "audio/webm",
      favorite: true,
      title: "Take 2",
      notes: "great take",
    });
  });

  it("never includes a blob key", () => {
    const dto = toRecordingSummaryDTO(recording());
    expect("blob" in dto).toBe(false);
  });

  it("is JSON-serializable (no Blob to choke on)", () => {
    const dto = toRecordingSummaryDTO(recording());
    expect(() => JSON.stringify(dto)).not.toThrow();
    expect(JSON.parse(JSON.stringify(dto))).toEqual(dto);
  });
});
