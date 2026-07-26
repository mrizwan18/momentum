"use client";

import * as React from "react";
import type { AiSessionInsightRecord } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";
import { encodeRecordingForAnalysis } from "@/lib/audio/encode-recording";
import { CATEGORY_LABELS } from "@/lib/exercise-category-labels";

export type SessionAudioAnalysisStatus =
  | "loading"
  | "no-recordings"
  | "idle"
  | "encoding"
  | "analyzing"
  | "ready"
  | "error";

export interface SessionAudioAnalysisSessionInput {
  elapsedSeconds: number;
  exercisesCompleted: number;
  dailyScore: number | null;
}

export interface UseSessionAudioAnalysisResult {
  status: SessionAudioAnalysisStatus;
  insight: AiSessionInsightRecord | null;
  errorMessage: string | null;
  /** User-initiated only — never called automatically. */
  analyze: () => Promise<void>;
}

/** Combined budget kept small enough to stay reliably under typical request-body limits, however many takes a session has. */
const MAX_TOTAL_DURATION_SECONDS = 60;
const MIN_PER_RECORDING_SECONDS = 20;

/**
 * Sprint 9 "Practice Session AI", made opt-in per the user's explicit ask:
 * analysis only ever runs when `analyze()` is called from a button tap,
 * never automatically on session completion. Every recording saved during
 * the session is encoded and sent (see src/lib/audio/encode-recording.ts),
 * each labeled with the exercise it was made for, so the model can give
 * exercise-specific feedback while still returning one session-level
 * summary. If the session already has a stored insight, it's shown
 * directly and no upload/button is needed.
 */
export function useSessionAudioAnalysis(
  sessionId: string,
  session: SessionAudioAnalysisSessionInput,
): UseSessionAudioAnalysisResult {
  const storage = useStorage();
  const [status, setStatus] =
    React.useState<SessionAudioAnalysisStatus>("loading");
  const [insight, setInsight] = React.useState<AiSessionInsightRecord | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const existing = await storage.aiSessionInsights.getBySession(sessionId);
      if (cancelled) return;
      if (existing) {
        setInsight(existing);
        setStatus("ready");
        return;
      }

      const recordings = await storage.recordings.listBySession(sessionId);
      if (cancelled) return;
      setStatus(recordings.length > 0 ? "idle" : "no-recordings");
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storage, sessionId]);

  const analyze = React.useCallback(async () => {
    setStatus("encoding");
    setErrorMessage(null);

    try {
      const recordings = await storage.recordings.listBySession(sessionId);
      if (recordings.length === 0) {
        setStatus("no-recordings");
        return;
      }

      const exercises = await storage.exercises.listAll();
      const exerciseById = new Map(
        exercises.map((exercise) => [exercise.id, exercise]),
      );
      const perRecordingCapSeconds = Math.max(
        MIN_PER_RECORDING_SECONDS,
        Math.floor(MAX_TOTAL_DURATION_SECONDS / recordings.length),
      );

      // Oldest first, so the narrative reads in the order the exercises
      // were actually practiced.
      const chronological = [...recordings].sort(
        (a, b) => a.createdAt - b.createdAt,
      );

      const audioParts = [];
      for (const recording of chronological) {
        const encoded = await encodeRecordingForAnalysis(
          recording.blob,
          perRecordingCapSeconds,
        );
        if (!encoded) continue;
        const exercise = recording.exerciseId
          ? exerciseById.get(recording.exerciseId)
          : undefined;
        audioParts.push({
          ...encoded,
          exerciseLabel: exercise
            ? `${exercise.title} (${CATEGORY_LABELS[exercise.category]})`
            : null,
        });
      }

      if (audioParts.length === 0) {
        setStatus("error");
        setErrorMessage(
          "Couldn't prepare your recordings for analysis. Please try again.",
        );
        return;
      }

      setStatus("analyzing");
      const context = await assembleAiContext(storage);
      const response = await fetch("/api/ai/session-summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          context,
          session: {
            sessionId,
            elapsedSeconds: session.elapsedSeconds,
            exercisesCompleted: session.exercisesCompleted,
            dailyScore: session.dailyScore,
          },
          audio: audioParts,
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Session summary request failed with status ${response.status}`,
        );
      }
      const result = await response.json();
      const record = await storage.aiSessionInsights.create({
        sessionId,
        ...result.data,
        provider: result.provider,
      });
      setInsight(record);
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Couldn't reach the AI service. Check your connection and try again.",
      );
    }
  }, [
    storage,
    sessionId,
    session.elapsedSeconds,
    session.exercisesCompleted,
    session.dailyScore,
  ]);

  return { status, insight, errorMessage, analyze };
}
