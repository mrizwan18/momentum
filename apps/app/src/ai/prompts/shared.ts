import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";

/** Common framing every prompt template opens with — tone rules pulled directly from docs/features/coach.md. */
export const TONE_GUIDANCE =
  "Tone: friendly, supportive, professional, calm, short sentences. Never use sarcasm or shame. Celebrate effort before results. Give exactly one actionable suggestion at a time.";

export const JSON_ONLY_INSTRUCTION =
  "Respond with ONLY valid JSON matching the exact shape below — no markdown fences, no commentary, no extra keys.";

/** Renders the parts of AiUserContext that are actually present — never invents a value for a field that's null/empty. */
export function describeContext(context: AiUserContext): string {
  const lines: string[] = [];

  lines.push(
    `User: ${context.profile.displayName ?? "Unknown"}${context.profile.age ? `, age ${context.profile.age}` : ""}.`,
  );

  lines.push(
    context.streak.current > 0
      ? `Current streak: ${context.streak.current} day(s), longest ${context.streak.longest}.`
      : "No active streak right now.",
  );

  if (context.statistics.last30Days.length > 0) {
    const totalMinutes = context.statistics.last30Days.reduce(
      (sum, day) => sum + day.practiceMinutes,
      0,
    );
    lines.push(
      `Practiced ${context.statistics.last30Days.length} day(s) in the last 30, totaling ${totalMinutes} minutes.`,
    );
  } else {
    lines.push("No practice history in the last 30 days.");
  }

  if (context.recentSessions.length > 0) {
    lines.push(
      `${context.recentSessions.length} recent completed session(s) on record.`,
    );
  }

  if (context.exerciseDistribution.length > 0) {
    const top = [...context.exerciseDistribution].sort(
      (a, b) => b.count - a.count,
    )[0];
    lines.push(
      `Most-practiced category: ${top.category} (${top.count} attempts).`,
    );
  }

  if (context.achievements.length > 0) {
    lines.push(`${context.achievements.length} achievement(s) unlocked.`);
  }

  if (context.baseline) {
    lines.push(
      `Baseline assessment on file: overall score ${context.baseline.overallScore}/100.`,
    );
  } else {
    lines.push("No baseline assessment yet.");
  }

  if (context.coachHistory.length > 0) {
    lines.push(
      `Recent coach conversation:\n${context.coachHistory
        .slice(-5)
        .map((entry) => `  ${entry.role}: ${entry.message}`)
        .join("\n")}`,
    );
  }

  return lines.join("\n");
}
