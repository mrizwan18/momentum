"use client";

import * as React from "react";
import type { AiSessionInsightRecord } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";

export type SessionInsightStatus =
  "idle" | "running" | "ready" | "pending-offline";

export interface RunSessionInsightInput {
  sessionId: string;
  elapsedSeconds: number;
  exercisesCompleted: number;
  dailyScore: number | null;
}

export interface UseSessionInsightResult {
  status: SessionInsightStatus;
  insight: AiSessionInsightRecord | null;
  run: (input: RunSessionInsightInput) => Promise<void>;
}

/**
 * Sprint 9 "Practice Session AI" — generates the Session Summary's AI
 * insight once per completed session via the Gateway, storing the result
 * in Dexie. Unlike useBaselineAssessment (a one-shot-per-app-lifetime
 * hook), the in-flight guard here clears once settled so a single instance
 * can be reused to process several sessions in sequence (see
 * usePendingSessionInsights' offline catch-up loop).
 */
export function useSessionInsight(): UseSessionInsightResult {
  const storage = useStorage();
  const [status, setStatus] = React.useState<SessionInsightStatus>("idle");
  const [insight, setInsight] = React.useState<AiSessionInsightRecord | null>(
    null,
  );
  const runningRef = React.useRef<Promise<void> | null>(null);

  const run = React.useCallback(
    (input: RunSessionInsightInput) => {
      if (runningRef.current) return runningRef.current;
      setStatus("running");
      const promise = (async () => {
        try {
          const context = await assembleAiContext(storage);
          const response = await fetch("/api/ai/session-summary", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              context,
              session: {
                sessionId: input.sessionId,
                elapsedSeconds: input.elapsedSeconds,
                exercisesCompleted: input.exercisesCompleted,
                dailyScore: input.dailyScore,
              },
            }),
          });
          if (!response.ok) {
            throw new Error(
              `Session summary request failed with status ${response.status}`,
            );
          }
          const result = await response.json();
          const record = await storage.aiSessionInsights.create({
            sessionId: input.sessionId,
            ...result.data,
            provider: result.provider,
          });
          setInsight(record);
          setStatus("ready");
        } catch {
          // Offline/provider failure is a normal, handled state — never throws.
          setStatus("pending-offline");
        } finally {
          runningRef.current = null;
        }
      })();
      runningRef.current = promise;
      return promise;
    },
    [storage],
  );

  return { status, insight, run };
}
