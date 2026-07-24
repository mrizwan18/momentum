import Dexie, { type EntityTable } from "dexie";
import type {
  AchievementRecord,
  DailyGoalRecord,
  ExerciseAttemptRecord,
  ExerciseRecord,
  MilestoneRecord,
  PracticePlanRecord,
  PracticeSessionRecord,
  RecommendationRecord,
  RecordingRecord,
  RoadmapChapterRecord,
  SessionSummaryRecord,
  SettingsRecord,
  SkillRecord,
  StatisticsEntryRecord,
  StreakRecord,
  UserRecord,
} from "@momentum/types";

export class MomentumDatabase extends Dexie {
  // v1
  settings!: EntityTable<SettingsRecord, "id">;
  sessions!: EntityTable<PracticeSessionRecord, "id">;
  recordings!: EntityTable<RecordingRecord, "id">;
  statistics!: EntityTable<StatisticsEntryRecord, "id">;
  roadmap!: EntityTable<RoadmapChapterRecord, "id">;

  // v2
  users!: EntityTable<UserRecord, "id">;
  skills!: EntityTable<SkillRecord, "id">;
  exercises!: EntityTable<ExerciseRecord, "id">;
  practicePlans!: EntityTable<PracticePlanRecord, "id">;
  exerciseAttempts!: EntityTable<ExerciseAttemptRecord, "id">;
  sessionSummaries!: EntityTable<SessionSummaryRecord, "id">;
  streaks!: EntityTable<StreakRecord, "id">;
  achievements!: EntityTable<AchievementRecord, "id">;
  milestones!: EntityTable<MilestoneRecord, "id">;
  dailyGoals!: EntityTable<DailyGoalRecord, "id">;
  recommendations!: EntityTable<RecommendationRecord, "id">;

  constructor(name = "momentum") {
    super(name);

    // Phase 1 foundation schema. Left exactly as originally shipped —
    // Dexie replays every version in order for a fresh or upgrading
    // database, so this must stay a faithful historical record.
    this.version(1).stores({
      settings: "id",
      sessions: "id, status, startedAt",
      recordings: "id, sessionId, createdAt",
      statistics: "id, date",
      roadmap: "id, order, status",
    });

    // Sprint 4: the full domain layer (User, Skill, PracticePlan, Exercise,
    // ExerciseAttempt, SessionSummary, Streak, Achievement, Milestone,
    // DailyGoal, Recommendation) plus new indexed fields on the two v1
    // tables that needed them.
    this.version(2)
      .stores({
        settings: "id",
        sessions: "id, status, startedAt, skillId, planId",
        recordings: "id, sessionId, createdAt, exerciseAttemptId",
        statistics: "id, date",
        roadmap: "id, order, status",
        users: "id",
        skills: "id, slug, isActive",
        exercises: "id, skillId, category, order",
        practicePlans: "id, skillId, isRecoveryPlan",
        exerciseAttempts: "id, sessionId, exerciseId, status, createdAt",
        sessionSummaries: "id, sessionId",
        streaks: "id, skillId",
        achievements: "id, key, status",
        milestones: "id, type, achieved",
        dailyGoals: "id, date, completed",
        recommendations: "id, category, priority, createdAt",
      })
      .upgrade(async (tx) => {
        // Existing v1 rows predate skillId/planId/voiceCondition/recoveryMode
        // and exerciseAttemptId — backfill them so every row matches the
        // current schema instead of leaving sparse/undefined fields behind.
        await tx
          .table("sessions")
          .toCollection()
          .modify((session) => {
            session.skillId ??= null;
            session.planId ??= null;
            session.voiceCondition ??= null;
            session.recoveryMode ??= false;
          });

        await tx
          .table("recordings")
          .toCollection()
          .modify((recording) => {
            recording.exerciseAttemptId ??= null;
          });
      });

    // Sprint 5: Practice needs somewhere to autosave in-progress exercise
    // notes so they survive a crash, before they're promoted to a durable
    // ExerciseAttempt.notes at completion/skip time.
    this.version(3)
      .stores({
        settings: "id",
        sessions: "id, status, startedAt, skillId, planId",
        recordings: "id, sessionId, createdAt, exerciseAttemptId",
        statistics: "id, date",
        roadmap: "id, order, status",
        users: "id",
        skills: "id, slug, isActive",
        exercises: "id, skillId, category, order",
        practicePlans: "id, skillId, isRecoveryPlan",
        exerciseAttempts: "id, sessionId, exerciseId, status, createdAt",
        sessionSummaries: "id, sessionId",
        streaks: "id, skillId",
        achievements: "id, key, status",
        milestones: "id, type, achieved",
        dailyGoals: "id, date, completed",
        recommendations: "id, category, priority, createdAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("sessions")
          .toCollection()
          .modify((session) => {
            session.draftNotes ??= null;
          });
      });

    // Onboarding's Name & Age step needs somewhere real to persist age.
    this.version(4)
      .stores({
        settings: "id",
        sessions: "id, status, startedAt, skillId, planId",
        recordings: "id, sessionId, createdAt, exerciseAttemptId",
        statistics: "id, date",
        roadmap: "id, order, status",
        users: "id",
        skills: "id, slug, isActive",
        exercises: "id, skillId, category, order",
        practicePlans: "id, skillId, isRecoveryPlan",
        exerciseAttempts: "id, sessionId, exerciseId, status, createdAt",
        sessionSummaries: "id, sessionId",
        streaks: "id, skillId",
        achievements: "id, key, status",
        milestones: "id, type, achieved",
        dailyGoals: "id, date, completed",
        recommendations: "id, category, priority, createdAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("users")
          .toCollection()
          .modify((user) => {
            user.age ??= null;
          });
      });

    // Sprint 6 (Recording): "Rename recording" needs a real label field,
    // distinct from the free-text `notes`.
    this.version(5)
      .stores({
        settings: "id",
        sessions: "id, status, startedAt, skillId, planId",
        recordings: "id, sessionId, createdAt, exerciseAttemptId",
        statistics: "id, date",
        roadmap: "id, order, status",
        users: "id",
        skills: "id, slug, isActive",
        exercises: "id, skillId, category, order",
        practicePlans: "id, skillId, isRecoveryPlan",
        exerciseAttempts: "id, sessionId, exerciseId, status, createdAt",
        sessionSummaries: "id, sessionId",
        streaks: "id, skillId",
        achievements: "id, key, status",
        milestones: "id, type, achieved",
        dailyGoals: "id, date, completed",
        recommendations: "id, category, priority, createdAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("recordings")
          .toCollection()
          .modify((recording) => {
            recording.title ??= null;
          });
      });

    // Onboarding completion gate: "/" redirects to "/onboarding" until this is set.
    this.version(6)
      .stores({
        settings: "id",
        sessions: "id, status, startedAt, skillId, planId",
        recordings: "id, sessionId, createdAt, exerciseAttemptId",
        statistics: "id, date",
        roadmap: "id, order, status",
        users: "id",
        skills: "id, slug, isActive",
        exercises: "id, skillId, category, order",
        practicePlans: "id, skillId, isRecoveryPlan",
        exerciseAttempts: "id, sessionId, exerciseId, status, createdAt",
        sessionSummaries: "id, sessionId",
        streaks: "id, skillId",
        achievements: "id, key, status",
        milestones: "id, type, achieved",
        dailyGoals: "id, date, completed",
        recommendations: "id, category, priority, createdAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("users")
          .toCollection()
          .modify((user) => {
            user.onboardingCompletedAt ??= null;
          });
      });
  }
}

export function createMomentumDatabase(name?: string): MomentumDatabase {
  return new MomentumDatabase(name);
}
