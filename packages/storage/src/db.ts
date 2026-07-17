import Dexie, { type EntityTable } from "dexie";
import type {
  PracticeSessionRecord,
  RecordingRecord,
  RoadmapChapterRecord,
  SettingsRecord,
  StatisticsEntryRecord,
} from "@momentum/types";

export class MomentumDatabase extends Dexie {
  settings!: EntityTable<SettingsRecord, "id">;
  sessions!: EntityTable<PracticeSessionRecord, "id">;
  recordings!: EntityTable<RecordingRecord, "id">;
  statistics!: EntityTable<StatisticsEntryRecord, "id">;
  roadmap!: EntityTable<RoadmapChapterRecord, "id">;

  constructor(name = "momentum") {
    super(name);

    this.version(1).stores({
      settings: "id",
      sessions: "id, status, startedAt",
      recordings: "id, sessionId, createdAt",
      statistics: "id, date",
      roadmap: "id, order, status",
    });
  }
}

export function createMomentumDatabase(name?: string): MomentumDatabase {
  return new MomentumDatabase(name);
}
