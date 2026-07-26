"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";
import { useSessionInsight } from "./use-session-insight";

/**
 * Sprint 9 "Offline Behavior", extended to Practice Session AI: catches up
 * any completed session that never got an AI insight (offline, provider
 * failure) once the device is back online. A no-op when nothing's pending.
 * Mounted once from DashboardGate, alongside usePendingBaselineAssessment.
 */
export function usePendingSessionInsights(): void {
  const storage = useStorage();
  const { run } = useSessionInsight();
  const attemptedRef = React.useRef(false);

  const attempt = React.useCallback(async () => {
    if (attemptedRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    attemptedRef.current = true;

    const [context, insights] = await Promise.all([
      assembleAiContext(storage),
      storage.aiSessionInsights.list(),
    ]);
    const covered = new Set(insights.map((insight) => insight.sessionId));
    const pending = context.recentSessions.filter(
      (session) => !covered.has(session.sessionId),
    );

    for (const session of pending) {
      await run({
        sessionId: session.sessionId,
        elapsedSeconds: session.elapsedSeconds,
        exercisesCompleted: session.exercisesCompleted,
        dailyScore: session.dailyScore,
      });
    }
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
