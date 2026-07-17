export type RoadmapChapterStatus =
  "locked" | "unlocked" | "in_progress" | "assessment" | "completed";

export interface RoadmapChapterRecord {
  id: string;
  order: number;
  title: string;
  status: RoadmapChapterStatus;
  updatedAt: number;
}
