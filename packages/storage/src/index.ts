export * from "./db";
export * from "./validation";
export * from "./factories";
export * from "./mappers";

export * from "./repositories/settings-repository";
export * from "./repositories/sessions-repository";
export * from "./repositories/recordings-repository";
export * from "./repositories/statistics-repository";
export * from "./repositories/roadmap-repository";
export * from "./repositories/user-repository";
export * from "./repositories/skill-repository";
export * from "./repositories/exercise-repository";
export * from "./repositories/practice-plan-repository";
export * from "./repositories/exercise-attempt-repository";
export * from "./repositories/session-summary-repository";
export * from "./repositories/streak-repository";
export * from "./repositories/achievement-repository";
export * from "./repositories/milestone-repository";
export * from "./repositories/daily-goal-repository";
export * from "./repositories/recommendation-repository";

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
import {
  createUserRepository,
  type UserRepository,
} from "./repositories/user-repository";
import {
  createSkillRepository,
  type SkillRepository,
} from "./repositories/skill-repository";
import {
  createExerciseRepository,
  type ExerciseRepository,
} from "./repositories/exercise-repository";
import {
  createPracticePlanRepository,
  type PracticePlanRepository,
} from "./repositories/practice-plan-repository";
import {
  createExerciseAttemptRepository,
  type ExerciseAttemptRepository,
} from "./repositories/exercise-attempt-repository";
import {
  createSessionSummaryRepository,
  type SessionSummaryRepository,
} from "./repositories/session-summary-repository";
import {
  createStreakRepository,
  type StreakRepository,
} from "./repositories/streak-repository";
import {
  createAchievementRepository,
  type AchievementRepository,
} from "./repositories/achievement-repository";
import {
  createMilestoneRepository,
  type MilestoneRepository,
} from "./repositories/milestone-repository";
import {
  createDailyGoalRepository,
  type DailyGoalRepository,
} from "./repositories/daily-goal-repository";
import {
  createRecommendationRepository,
  type RecommendationRepository,
} from "./repositories/recommendation-repository";

export interface MomentumStorage {
  db: MomentumDatabase;
  settings: SettingsRepository;
  sessions: SessionsRepository;
  recordings: RecordingsRepository;
  statistics: StatisticsRepository;
  roadmap: RoadmapRepository;
  users: UserRepository;
  skills: SkillRepository;
  exercises: ExerciseRepository;
  practicePlans: PracticePlanRepository;
  exerciseAttempts: ExerciseAttemptRepository;
  sessionSummaries: SessionSummaryRepository;
  streaks: StreakRepository;
  achievements: AchievementRepository;
  milestones: MilestoneRepository;
  dailyGoals: DailyGoalRepository;
  recommendations: RecommendationRepository;
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
    users: createUserRepository(db),
    skills: createSkillRepository(db),
    exercises: createExerciseRepository(db),
    practicePlans: createPracticePlanRepository(db),
    exerciseAttempts: createExerciseAttemptRepository(db),
    sessionSummaries: createSessionSummaryRepository(db),
    streaks: createStreakRepository(db),
    achievements: createAchievementRepository(db),
    milestones: createMilestoneRepository(db),
    dailyGoals: createDailyGoalRepository(db),
    recommendations: createRecommendationRepository(db),
  };
}
