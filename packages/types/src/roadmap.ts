import { z } from "zod";

export const ROADMAP_CHAPTER_STATUSES = [
  "locked",
  "unlocked",
  "in_progress",
  "assessment",
  "completed",
] as const;
export type RoadmapChapterStatus = (typeof ROADMAP_CHAPTER_STATUSES)[number];

export const RoadmapChapterSchema = z.object({
  id: z.string(),
  order: z.number().int().min(0),
  title: z.string().min(1),
  status: z.enum(ROADMAP_CHAPTER_STATUSES),
  updatedAt: z.number(),
});

export type RoadmapChapterRecord = z.infer<typeof RoadmapChapterSchema>;
