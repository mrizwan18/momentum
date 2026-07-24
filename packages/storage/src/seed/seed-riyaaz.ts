import type { MomentumStorage } from "../index";
import { createSkill } from "../factories/skill-factory";
import { createExercise } from "../factories/exercise-factory";
import { createPracticePlan } from "../factories/practice-plan-factory";
import { createAchievement } from "../factories/achievement-factory";
import { createMilestone } from "../factories/milestone-factory";

/**
 * Seeds the Riyaaz (Vocals) skill pack: catalog content only (skill,
 * exercises, plans, roadmap chapters, achievement/milestone definitions) —
 * never user data (no sessions, recordings, or progress). Every `seed()`
 * call it uses only inserts when the target table is empty, so calling
 * this more than once is harmless.
 *
 * Development/demo use only — do not call this from production app code.
 * There is no login/onboarding flow yet to seed content on demand, so
 * whoever wires up the Practice feature should call this from a dev-only
 * bootstrap path (e.g. behind `process.env.NODE_ENV !== "production"`).
 */
export async function seedRiyaazSkillPack(
  storage: MomentumStorage,
): Promise<void> {
  const skill = createSkill({
    slug: "riyaaz",
    name: "Riyaaz",
    category: "vocals",
    description: "A structured path to becoming a confident singer.",
  });
  await storage.skills.seed([skill]);
  const skillId = (await storage.skills.getBySlug("riyaaz"))?.id ?? skill.id;

  // docs/features/practice.md Exercise Queue default order.
  const breathing = createExercise({
    skillId,
    category: "breathing",
    title: "Breathing",
    description: "Diaphragmatic breathing to steady your airflow.",
    targetDurationSeconds: 120,
    difficulty: "easy",
    order: 0,
  });
  const warmup = createExercise({
    skillId,
    category: "warmup",
    title: "Warm-up",
    description: "Gentle humming and lip trills to wake up your voice.",
    targetDurationSeconds: 180,
    difficulty: "easy",
    order: 1,
  });
  const scales = createExercise({
    skillId,
    category: "scales",
    title: "Sa Re Ga Ma",
    description: "Basic scale practice to build pitch accuracy.",
    targetDurationSeconds: 300,
    difficulty: "medium",
    order: 2,
  });
  const alankars = createExercise({
    skillId,
    category: "alankars",
    title: "Alankars",
    description: "Melodic ornamentation patterns.",
    targetDurationSeconds: 300,
    difficulty: "medium",
    order: 3,
  });
  const song = createExercise({
    skillId,
    category: "song",
    title: "Song Practice",
    description: "Apply today's technique to a full song.",
    targetDurationSeconds: 600,
    difficulty: "medium",
    order: 4,
  });
  const recording = createExercise({
    skillId,
    category: "recording",
    title: "Recording",
    description: "Record today's practice to track your progress.",
    targetDurationSeconds: 300,
    difficulty: "easy",
    order: 5,
  });
  const reflection = createExercise({
    skillId,
    category: "reflection",
    title: "Reflection",
    description: "A short journal entry on how today's session went.",
    targetDurationSeconds: 120,
    difficulty: "easy",
    order: 6,
  });
  const exercises = [
    breathing,
    warmup,
    scales,
    alankars,
    song,
    recording,
    reflection,
  ];
  await storage.exercises.seed(exercises);

  const dailyPlan = createPracticePlan({
    skillId,
    title: "Daily Practice",
    description: "The full daily practice queue.",
    exerciseIds: exercises.map((exercise) => exercise.id),
    targetDurationSeconds: exercises.reduce(
      (sum, exercise) => sum + exercise.targetDurationSeconds,
      0,
    ),
  });

  // docs/features/practice.md Recovery Mode: breathing, one scale, one
  // song, reflection — ~10 minutes.
  const recoveryPlan = createPracticePlan({
    skillId,
    title: "Recovery Session",
    description: "A shorter session to ease back into practice.",
    exerciseIds: [breathing.id, scales.id, song.id, reflection.id],
    targetDurationSeconds: 600,
    isRecoveryPlan: true,
  });
  await storage.practicePlans.seed([dailyPlan, recoveryPlan]);

  // docs/features/practice.md Six Month Vocal Campaign.
  await storage.roadmap.seed([
    {
      id: `${skillId}-chapter-1`,
      order: 1,
      title: "Finding Your Voice",
      status: "unlocked",
      updatedAt: Date.now(),
    },
    {
      id: `${skillId}-chapter-2`,
      order: 2,
      title: "Breath & Stability",
      status: "locked",
      updatedAt: Date.now(),
    },
    {
      id: `${skillId}-chapter-3`,
      order: 3,
      title: "Expression",
      status: "locked",
      updatedAt: Date.now(),
    },
    {
      id: `${skillId}-chapter-4`,
      order: 4,
      title: "Semi-Classical Foundations",
      status: "locked",
      updatedAt: Date.now(),
    },
    {
      id: `${skillId}-chapter-5`,
      order: 5,
      title: "Range & Confidence",
      status: "locked",
      updatedAt: Date.now(),
    },
    {
      id: `${skillId}-chapter-6`,
      order: 6,
      title: "Performance Ready",
      status: "locked",
      updatedAt: Date.now(),
    },
  ]);

  // docs/features/dashboard.md Streak Card milestones.
  await storage.milestones.seed(
    [7, 14, 30, 60, 100, 180, 365].map((threshold) =>
      createMilestone({ type: "streak", threshold }),
    ),
  );

  await storage.achievements.seed([
    createAchievement({
      key: "first_practice",
      title: "First Practice",
      description: "Completed your first practice session.",
    }),
    createAchievement({
      key: "first_recording",
      title: "First Recording",
      description: "Made your first recording.",
    }),
    createAchievement({
      key: "week_streak",
      title: "One Week Strong",
      description: "Practiced 7 days in a row.",
    }),
  ]);
}
