"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";
import { buildDeterministicCoachReply } from "../lib/deterministic-coach-reply";

export type CoachInsightStatus = "loading" | "ready" | "fallback";

export interface CoachInsightResult {
  status: CoachInsightStatus;
  message: string | null;
  suggestedExercises: string[] | null;
}

const BOOTSTRAP_MESSAGE =
  "Give me a quick check-in: a personalized insight on my recent practice and up to two recommended exercises.";

/**
 * Sprint 9 "AI Coach Screen" — the Personalized Insight + Recommendations
 * cards. This is the Hybrid architecture's online path: a real Gateway
 * call (which itself already falls back to the Mock provider on failure).
 * If the request can't be made at all (offline, route unreachable), this
 * falls back further to docs/features/coach.md's deterministic heuristic
 * coach — never leaving the user with nothing.
 */
export function useCoachInsight(): CoachInsightResult {
  const storage = useStorage();
  const [status, setStatus] = React.useState<CoachInsightStatus>("loading");
  const [message, setMessage] = React.useState<string | null>(null);
  const [suggestedExercises, setSuggestedExercises] = React.useState<
    string[] | null
  >(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const context = await assembleAiContext(storage);
      try {
        const response = await fetch("/api/ai/coach-reply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ context, message: BOOTSTRAP_MESSAGE }),
        });
        if (!response.ok) {
          throw new Error(
            `Coach reply request failed with status ${response.status}`,
          );
        }
        const result = await response.json();
        if (cancelled) return;
        setMessage(result.data.message);
        setSuggestedExercises(result.data.suggestedExercises);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        const fallback = buildDeterministicCoachReply(
          context,
          BOOTSTRAP_MESSAGE,
        );
        setMessage(fallback.message);
        setSuggestedExercises(fallback.suggestedExercises);
        setStatus("fallback");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  return { status, message, suggestedExercises };
}
