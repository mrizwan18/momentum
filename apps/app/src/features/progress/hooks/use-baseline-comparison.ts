"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext, computeBaselineComparison } from "@/ai/services";
import type { BaselineComparisonNumbers } from "@/ai/types";

export type BaselineComparisonAiStatus =
  "idle" | "loading" | "ready" | "unavailable";

export interface UseBaselineComparisonResult {
  /** Null until a baseline exists AND at least one session insight has been generated. */
  comparison: BaselineComparisonNumbers | null;
  /** A short AI-narrated summary of `comparison` — the numbers themselves are always deterministic and never depend on this. */
  aiSummary: string | null;
  aiStatus: BaselineComparisonAiStatus;
}

/**
 * Sprint 9 "Baseline Comparison": compares Original Baseline against Latest
 * Session, Best Session, and the Rolling 30-day Average. The numbers are
 * pure client-side compute (no AI call, always available offline); only the
 * one-line narration is fetched from the Gateway on top of them.
 */
export function useBaselineComparison(): UseBaselineComparisonResult {
  const storage = useStorage();
  const [comparison, setComparison] =
    React.useState<BaselineComparisonNumbers | null>(null);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [aiStatus, setAiStatus] =
    React.useState<BaselineComparisonAiStatus>("idle");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const [baseline, sessionInsights] = await Promise.all([
        storage.baselineAssessments.get(),
        storage.aiSessionInsights.list(),
      ]);
      if (cancelled || !baseline) return;

      const computed = computeBaselineComparison(baseline, sessionInsights);
      if (cancelled || !computed) return;
      setComparison(computed);
      setAiStatus("loading");

      try {
        const context = await assembleAiContext(storage);
        const response = await fetch("/api/ai/progress-insights", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ context, comparison: computed }),
        });
        if (!response.ok) {
          throw new Error(
            `Progress insights request failed with status ${response.status}`,
          );
        }
        const result = await response.json();
        if (cancelled) return;
        setAiSummary(result.data.summary);
        setAiStatus("ready");
      } catch {
        if (!cancelled) setAiStatus("unavailable");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  return { comparison, aiSummary, aiStatus };
}
