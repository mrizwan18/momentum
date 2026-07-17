import type {
  RoadmapChapterRecord,
  RoadmapChapterStatus,
} from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface RoadmapRepository {
  seed(chapters: RoadmapChapterRecord[]): Promise<void>;
  list(): Promise<RoadmapChapterRecord[]>;
  setStatus(
    id: string,
    status: RoadmapChapterStatus,
  ): Promise<RoadmapChapterRecord>;
}

export function createRoadmapRepository(
  db: MomentumDatabase,
): RoadmapRepository {
  return {
    async seed(chapters) {
      await db.transaction("rw", db.roadmap, async () => {
        const count = await db.roadmap.count();
        if (count === 0) {
          await db.roadmap.bulkAdd(chapters);
        }
      });
    },

    async list() {
      return db.roadmap.orderBy("order").toArray();
    },

    async setStatus(id, status) {
      return db.transaction("rw", db.roadmap, async () => {
        const existing = await db.roadmap.get(id);
        if (!existing) {
          throw new Error(`Roadmap chapter ${id} was not found`);
        }

        // state-machines.md: "Never regress completed chapters."
        if (existing.status === "completed" && status !== "completed") {
          return existing;
        }

        const updated: RoadmapChapterRecord = {
          ...existing,
          status,
          updatedAt: Date.now(),
        };
        await db.roadmap.put(updated);
        return updated;
      });
    },
  };
}
