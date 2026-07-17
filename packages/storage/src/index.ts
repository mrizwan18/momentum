export * from "./db";
export * from "./repositories/settings-repository";
export * from "./repositories/sessions-repository";
export * from "./repositories/recordings-repository";
export * from "./repositories/statistics-repository";
export * from "./repositories/roadmap-repository";

import { createMomentumDatabase, type MomentumDatabase } from "./db";
import {
  createSettingsRepository,
  type SettingsRepository,
} from "./repositories/settings-repository";
import {
  createSessionsRepository,
  type SessionsRepository,
} from "./repositories/sessions-repository";
import {
  createRecordingsRepository,
  type RecordingsRepository,
} from "./repositories/recordings-repository";
import {
  createStatisticsRepository,
  type StatisticsRepository,
} from "./repositories/statistics-repository";
import {
  createRoadmapRepository,
  type RoadmapRepository,
} from "./repositories/roadmap-repository";

export interface MomentumStorage {
  db: MomentumDatabase;
  settings: SettingsRepository;
  sessions: SessionsRepository;
  recordings: RecordingsRepository;
  statistics: StatisticsRepository;
  roadmap: RoadmapRepository;
}

/**
 * Single entry point the app depends on so UI code never touches Dexie
 * directly (see PROJECT_RULES.md #4 Storage).
 */
export function createMomentumStorage(
  db: MomentumDatabase = createMomentumDatabase(),
): MomentumStorage {
  return {
    db,
    settings: createSettingsRepository(db),
    sessions: createSessionsRepository(db),
    recordings: createRecordingsRepository(db),
    statistics: createStatisticsRepository(db),
    roadmap: createRoadmapRepository(db),
  };
}
