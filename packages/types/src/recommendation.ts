import { z } from "zod";

/** docs/engineering/recommendation-engine.md Priority Order. */
export const RECOMMENDATION_CATEGORIES = [
  "recovery",
  "roadmap_mission",
  "skipped_exercise",
  "weakest_habit",
  "weekly_assessment",
  "recording_reminder",
  "side_quest",
] as const;
export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];

/**
 * "Today's One Thing" — the recommendation engine's single output object.
 * This models the shape only; selecting *which* recommendation to generate
 * is the Recommendation Engine's job and is out of scope here.
 */
export const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  reason: z.string(),
  category: z.enum(RECOMMENDATION_CATEGORIES),
  priority: z.number().int().min(1),
  expectedDurationSeconds: z.number().int().min(0),
  xpReward: z.number().int().min(0),
  completionCriteria: z.string(),
  createdAt: z.number(),
});

export type RecommendationRecord = z.infer<typeof RecommendationSchema>;
