"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import { useBaselineAssessment } from "./use-baseline-assessment";

/**
 * Sprint 9 "Offline Behavior": if the baseline assessment couldn't be
 * generated during onboarding (offline, provider unreachable), the
 * recording itself was still saved locally — this hook automatically
 * finishes the analysis once the device is back online. A no-op whenever
 * there's nothing pending. Mounted once from DashboardGate, so every
 * post-onboarding app load gets a chance to catch up.
 */
export function usePendingBaselineAssessment(): void {
  const storage = useStorage();
  const { run } = useBaselineAssessment();
  const attemptedRef = React.useRef(false);

  const attempt = React.useCallback(async () => {
    if (attemptedRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const existing = await storage.baselineAssessments.get();
    if (existing) return;

    const recordings = await storage.recordings.listSummaries();
    const baselineRecording = recordings.find(
      (recording) => recording.title === "Baseline Recording",
    );
    if (!baselineRecording) return;

    attemptedRef.current = true;
    await run({
      recordingId: baselineRecording.id,
      durationMs: baselineRecording.durationMs,
    });
  }, [storage, run]);

  React.useEffect(() => {
    void attempt();

    function handleOnline() {
      attemptedRef.current = false;
      void attempt();
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [attempt]);
}
