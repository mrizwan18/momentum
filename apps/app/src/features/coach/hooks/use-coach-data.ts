"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import {
  computeConsistencyScore,
  type ConsistencyScore,
} from "../lib/consistency-score";

export interface FocusAreaEntry {
  label: string;
  value: number;
}

export interface CoachData {
  displayName: string | null;
  streakCurrent: number;
  consistencyScore: ConsistencyScore;
  /** Null until there's at least a baseline assessment to draw metrics from. */
  focusAreas: FocusAreaEntry[] | null;
}

export type CoachDataState =
  { status: "loading" } | { status: "ready"; data: CoachData };

/**
 * The five Focus Areas rows/radar-chart labels map onto 5 of the 12 real
 * VocalMetrics fields — same "match the reference's fixed row count without
 * fabricating a label" precedent as InitialAssessmentScreen's breakdown.
 * "Voice Control" -> breathControl (the closest literal match) and
 * "Stamina" -> energy (the closest conceptual match); the other 7 metrics
 * aren't discarded, they simply don't have a row in this specific card.
 */
function buildFocusAreas(metrics: {
  pitchAccuracy: number;
  breathControl: number;
  rhythm: number;
  consistency: number;
  energy: number;
}): FocusAreaEntry[] {
  return [
    { label: "Pitch Accuracy", value: metrics.pitchAccuracy },
    { label: "Voice Control", value: metrics.breathControl },
    { label: "Rhythm", value: metrics.rhythm },
    { label: "Consistency", value: metrics.consistency },
    { label: "Stamina", value: metrics.energy },
  ];
}

/** Loads the AI Coach screen's non-conversational read model — consistency, streak, and the latest real vocal metrics available. */
export function useCoachData(): CoachDataState {
  const storage = useStorage();
  const [state, setState] = React.useState<CoachDataState>({
    status: "loading",
  });

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const [user, streak, statistics, sessionInsights, baseline] =
        await Promise.all([
          storage.users.get(),
          storage.streaks.get(null),
          storage.statistics.list(),
          storage.aiSessionInsights.list(),
          storage.baselineAssessments.get(),
        ]);
      if (cancelled) return;

      const latestInsight = sessionInsights[sessionInsights.length - 1];
      const metricsSource =
        latestInsight?.metricsSnapshot ?? baseline?.metrics ?? null;

      setState({
        status: "ready",
        data: {
          displayName: user?.displayName ?? null,
          streakCurrent: streak?.current ?? 0,
          consistencyScore: computeConsistencyScore(statistics),
          focusAreas: metricsSource ? buildFocusAreas(metricsSource) : null,
        },
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  return state;
}
