"use client";

import * as React from "react";
import type { BaselineAssessmentRecord } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";
import { encodeRecordingForAnalysis } from "@/lib/audio/encode-recording";

/** Well under the baseline recording's own 15s auto-stop cap, so truncation never actually triggers here. */
const MAX_AUDIO_DURATION_SECONDS = 60;

export type BaselineAssessmentStatus =
  "idle" | "running" | "ready" | "pending-offline";

export interface UseBaselineAssessmentResult {
  status: BaselineAssessmentStatus;
  assessment: BaselineAssessmentRecord | null;
  /**
   * Kicks off the real AI assessment for a just-recorded baseline. Safe to
   * call more than once — a run already in flight is returned instead of
   * starting a second one. On any failure (offline, provider unreachable,
   * server error) this resolves to "pending-offline" rather than throwing —
   * Sprint 9 "Offline Behavior": onboarding must be able to continue with
   * the analysis queued, never blocked or crashed.
   */
  run: (input: { recordingId: string; durationMs: number }) => Promise<void>;
}

export function useBaselineAssessment(): UseBaselineAssessmentResult {
  const storage = useStorage();
  const [status, setStatus] = React.useState<BaselineAssessmentStatus>("idle");
  const [assessment, setAssessment] =
    React.useState<BaselineAssessmentRecord | null>(null);
  const runningRef = React.useRef<Promise<void> | null>(null);

  const run = React.useCallback(
    (input: { recordingId: string; durationMs: number }) => {
      if (runningRef.current) return runningRef.current;

      setStatus("running");
      const promise = (async () => {
        try {
          const context = await assembleAiContext(storage);

          // Genuinely analyze the real recording when possible — a failed
          // encode (unsupported browser API, corrupt blob) just falls back
          // to the existing context-only request rather than blocking
          // onboarding.
          const recording = await storage.recordings.get(input.recordingId);
          const encoded = recording
            ? await encodeRecordingForAnalysis(
                recording.blob,
                MAX_AUDIO_DURATION_SECONDS,
              )
            : null;

          const response = await fetch("/api/ai/assessment", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              context,
              recordingId: input.recordingId,
              recordingDurationMs: input.durationMs,
              audio: encoded ? [encoded] : undefined,
            }),
          });
          if (!response.ok) {
            throw new Error(
              `Assessment request failed with status ${response.status}`,
            );
          }
          const result = (await response.json()) as {
            data: Omit<
              BaselineAssessmentRecord,
              "id" | "recordingId" | "provider" | "createdAt"
            >;
            provider: BaselineAssessmentRecord["provider"];
          };
          const record = await storage.baselineAssessments.create({
            recordingId: input.recordingId,
            ...result.data,
            provider: result.provider,
          });
          setAssessment(record);
          setStatus("ready");
        } catch {
          setStatus("pending-offline");
        }
      })();

      runningRef.current = promise;
      return promise;
    },
    [storage],
  );

  return { status, assessment, run };
}
