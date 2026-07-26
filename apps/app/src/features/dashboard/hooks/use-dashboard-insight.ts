"use client";

import * as React from "react";
import type { DashboardInsightRecord } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";
import { toDateOnly } from "@/lib/date";

export type DashboardInsightStatus = "loading" | "ready" | "unavailable";

export interface UseDashboardInsightResult {
  status: DashboardInsightStatus;
  insight: DashboardInsightRecord | null;
}

/**
 * Sprint 9 "Dashboard AI" — refreshes at most once per calendar day: if
 * today's insight is already stored, it's reused with no network call; a
 * fresh one is only generated the first time the Dashboard loads on a new
 * day (the Gateway/route also cache by date server-side, but the client
 * needs its own check to avoid firing a request at all on every load).
 */
export function useDashboardInsight(): UseDashboardInsightResult {
  const storage = useStorage();
  const [status, setStatus] = React.useState<DashboardInsightStatus>("loading");
  const [insight, setInsight] = React.useState<DashboardInsightRecord | null>(
    null,
  );

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const today = toDateOnly(new Date());
      const existing = await storage.aiDashboardInsights.getForDate(today);
      if (cancelled) return;
      if (existing) {
        setInsight(existing);
        setStatus("ready");
        return;
      }

      try {
        const context = await assembleAiContext(storage);
        const response = await fetch("/api/ai/dashboard-insight", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ context, date: today }),
        });
        if (!response.ok) {
          throw new Error(
            `Dashboard insight request failed with status ${response.status}`,
          );
        }
        const result = await response.json();
        if (cancelled) return;
        const record = await storage.aiDashboardInsights.setForDate({
          date: today,
          ...result.data,
          provider: result.provider,
        });
        if (cancelled) return;
        setInsight(record);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  return { status, insight };
}
