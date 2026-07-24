import { afterEach, describe, expect, it } from "vitest";
import Dexie from "dexie";
import { MomentumDatabase } from "./db";

/**
 * Real Dexie migration tests: build a database using ONLY the historical
 * v1 schema (bypassing our repositories/factories, which already produce
 * v2-shaped records), then open it with the current MomentumDatabase (v1 +
 * v2) and confirm the upgrade actually runs — new fields are backfilled,
 * old data survives, and the new v2 tables work.
 */
describe("MomentumDatabase v1 -> v2 migration", () => {
  const dbName = `test-migration-${Math.random()}`;

  afterEach(async () => {
    await Dexie.delete(dbName);
  });

  async function seedLegacyV1Database() {
    const legacy = new Dexie(dbName);
    legacy.version(1).stores({
      settings: "id",
      sessions: "id, status, startedAt",
      recordings: "id, sessionId, createdAt",
      statistics: "id, date",
      roadmap: "id, order, status",
    });
    await legacy.open();

    await legacy.table("sessions").add({
      id: "legacy-session",
      status: "completed",
      exerciseIds: ["breathing", "song"],
      currentStepIndex: 2,
      elapsedSeconds: 300,
      startedAt: 1000,
      updatedAt: 1000,
      completedAt: 2000,
    });
    await legacy.table("recordings").add({
      id: "legacy-recording",
      sessionId: "legacy-session",
      createdAt: 1500,
      durationMs: 4000,
      mimeType: "audio/webm",
      blob: new Blob(["legacy-audio"], { type: "audio/webm" }),
      favorite: false,
      notes: null,
    });

    legacy.close();
  }

  it("backfills new session/recording fields and preserves existing data", async () => {
    await seedLegacyV1Database();

    const upgraded = new MomentumDatabase(dbName);
    await upgraded.open();

    const session = await upgraded.sessions.get("legacy-session");
    expect(session).toBeDefined();
    expect(session?.skillId).toBeNull();
    expect(session?.planId).toBeNull();
    expect(session?.voiceCondition).toBeNull();
    expect(session?.recoveryMode).toBe(false);
    // Original v1 fields must survive the upgrade untouched.
    expect(session?.status).toBe("completed");
    expect(session?.exerciseIds).toEqual(["breathing", "song"]);
    expect(session?.currentStepIndex).toBe(2);
    expect(session?.completedAt).toBe(2000);

    const recording = await upgraded.recordings.get("legacy-recording");
    expect(recording).toBeDefined();
    expect(recording?.exerciseAttemptId).toBeNull();
    expect(recording?.durationMs).toBe(4000);
    expect(recording?.sessionId).toBe("legacy-session");

    upgraded.close();
  });

  it("makes the new v2 tables available after upgrading", async () => {
    await seedLegacyV1Database();

    const upgraded = new MomentumDatabase(dbName);
    await upgraded.open();

    await upgraded.skills.add({
      id: "skill-1",
      slug: "riyaaz",
      name: "Riyaaz",
      category: "vocals",
      description: "",
      isActive: true,
      createdAt: Date.now(),
    });
    await expect(upgraded.skills.count()).resolves.toBe(1);
    await expect(upgraded.achievements.count()).resolves.toBe(0);

    upgraded.close();
  });

  it("does not disturb v1 tables that had no new fields to add", async () => {
    await seedLegacyV1Database();

    const upgraded = new MomentumDatabase(dbName);
    await upgraded.open();

    await expect(upgraded.settings.count()).resolves.toBe(0);
    await expect(upgraded.statistics.count()).resolves.toBe(0);
    await expect(upgraded.roadmap.count()).resolves.toBe(0);

    upgraded.close();
  });

  it("opens cleanly for a brand-new database with no v1 history", async () => {
    const freshName = `test-fresh-${Math.random()}`;
    const fresh = new MomentumDatabase(freshName);
    await fresh.open();

    await expect(fresh.sessions.count()).resolves.toBe(0);
    await expect(fresh.skills.count()).resolves.toBe(0);

    fresh.close();
    await Dexie.delete(freshName);
  });
});

describe("MomentumDatabase v2 -> v3 migration", () => {
  const dbName = `test-migration-v2-${Math.random()}`;

  afterEach(async () => {
    await Dexie.delete(dbName);
  });

  it("backfills draftNotes on sessions predating Sprint 5", async () => {
    const legacy = new Dexie(dbName);
    legacy.version(2).stores({
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
    });
    await legacy.open();
    await legacy.table("sessions").add({
      id: "v2-session",
      status: "paused",
      skillId: "skill-1",
      planId: "plan-1",
      exerciseIds: ["breathing"],
      currentStepIndex: 0,
      elapsedSeconds: 45,
      voiceCondition: "normal",
      recoveryMode: false,
      startedAt: 1000,
      updatedAt: 1000,
      completedAt: null,
    });
    legacy.close();

    const upgraded = new MomentumDatabase(dbName);
    await upgraded.open();

    const session = await upgraded.sessions.get("v2-session");
    expect(session).toBeDefined();
    expect(session?.draftNotes).toBeNull();
    // v2 fields must survive untouched.
    expect(session?.voiceCondition).toBe("normal");
    expect(session?.elapsedSeconds).toBe(45);

    upgraded.close();
  });
});

describe("MomentumDatabase v4 -> v5 migration", () => {
  const dbName = `test-migration-v4-${Math.random()}`;

  afterEach(async () => {
    await Dexie.delete(dbName);
  });

  it("backfills title on recordings predating Sprint 6", async () => {
    const legacy = new Dexie(dbName);
    legacy.version(4).stores({
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
    });
    await legacy.open();
    await legacy.table("recordings").add({
      id: "v4-recording",
      sessionId: "session-1",
      exerciseAttemptId: null,
      createdAt: 1000,
      durationMs: 3000,
      mimeType: "audio/webm",
      blob: new Blob(["v4-audio"], { type: "audio/webm" }),
      favorite: false,
      notes: null,
    });
    legacy.close();

    const upgraded = new MomentumDatabase(dbName);
    await upgraded.open();

    const recording = await upgraded.recordings.get("v4-recording");
    expect(recording).toBeDefined();
    expect(recording?.title).toBeNull();
    // v4 fields must survive untouched.
    expect(recording?.durationMs).toBe(3000);
    expect(recording?.sessionId).toBe("session-1");

    upgraded.close();
  });
});

describe("MomentumDatabase v5 -> v6 migration", () => {
  const dbName = `test-migration-v5-${Math.random()}`;

  afterEach(async () => {
    await Dexie.delete(dbName);
  });

  it("backfills onboardingCompletedAt on users predating the onboarding gate", async () => {
    const legacy = new Dexie(dbName);
    legacy.version(5).stores({
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
    });
    await legacy.open();
    await legacy.table("users").add({
      id: "local",
      displayName: "Rizwan",
      age: 24,
      activeSkillId: null,
      createdAt: 1000,
      updatedAt: 1000,
    });
    legacy.close();

    const upgraded = new MomentumDatabase(dbName);
    await upgraded.open();

    const user = await upgraded.users.get("local");
    expect(user).toBeDefined();
    expect(user?.onboardingCompletedAt).toBeNull();
    // v5 fields must survive untouched.
    expect(user?.displayName).toBe("Rizwan");
    expect(user?.age).toBe(24);

    upgraded.close();
  });
});
