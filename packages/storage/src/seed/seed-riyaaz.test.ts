import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "../index";
import { seedRiyaazSkillPack } from "./seed-riyaaz";

describe("seedRiyaazSkillPack", () => {
  let storage: MomentumStorage;

  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-seed-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("seeds the Riyaaz skill and its exercise queue in order", async () => {
    await seedRiyaazSkillPack(storage);

    const skill = await storage.skills.getBySlug("riyaaz");
    expect(skill).toBeDefined();

    const exercises = await storage.exercises.listBySkill(skill!.id);
    expect(exercises.map((e) => e.category)).toEqual([
      "breathing",
      "warmup",
      "scales",
      "alankars",
      "song",
      "recording",
      "reflection",
    ]);
  });

  it("seeds a daily plan and a shorter recovery plan", async () => {
    await seedRiyaazSkillPack(storage);
    const skill = await storage.skills.getBySlug("riyaaz");

    const plans = await storage.practicePlans.listBySkill(skill!.id);
    expect(plans).toHaveLength(2);

    const recovery = await storage.practicePlans.getRecoveryPlan(skill!.id);
    expect(recovery?.exerciseIds).toHaveLength(4);
  });

  it("seeds all six roadmap chapters with only the first unlocked", async () => {
    await seedRiyaazSkillPack(storage);

    const chapters = await storage.roadmap.list();
    expect(chapters).toHaveLength(6);
    expect(chapters[0].status).toBe("unlocked");
    expect(chapters.slice(1).every((c) => c.status === "locked")).toBe(true);
  });

  it("seeds streak milestones and achievement definitions", async () => {
    await seedRiyaazSkillPack(storage);

    const milestones = await storage.milestones.listByType("streak");
    expect(milestones.map((m) => m.threshold)).toEqual([
      7, 14, 30, 60, 100, 180, 365,
    ]);

    const achievements = await storage.achievements.list();
    expect(achievements.map((a) => a.key).sort()).toEqual([
      "first_practice",
      "first_recording",
      "week_streak",
    ]);
    expect(achievements.every((a) => a.status === "locked")).toBe(true);
  });

  it("is idempotent — seeding twice does not duplicate content", async () => {
    await seedRiyaazSkillPack(storage);
    await seedRiyaazSkillPack(storage);

    const skills = await storage.skills.list();
    expect(skills).toHaveLength(1);

    const skill = skills[0];
    const exercises = await storage.exercises.listBySkill(skill.id);
    expect(exercises).toHaveLength(7);

    const chapters = await storage.roadmap.list();
    expect(chapters).toHaveLength(6);
  });
});
