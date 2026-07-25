import { describe, expect, it } from "vitest";
import { computeExerciseDistribution } from "./exercise-distribution";
import type { ExerciseAttemptRecord, ExerciseRecord } from "@momentum/types";

function exercise(
  id: string,
  category: ExerciseRecord["category"],
): ExerciseRecord {
  return {
    id,
    skillId: "skill-1",
    category,
    title: id,
    description: "",
    targetDurationSeconds: 60,
    difficulty: "medium",
    order: 0,
  };
}

function attempt(
  exerciseId: string,
  durationSeconds: number,
): ExerciseAttemptRecord {
  return {
    id: `${exerciseId}-${Math.random()}`,
    sessionId: "session-1",
    exerciseId,
    status: "completed",
    durationSeconds,
    difficultyRating: null,
    notes: null,
    recordingId: null,
    reflectionComplete: false,
    createdAt: 0,
  };
}

describe("computeExerciseDistribution", () => {
  const exercises = [
    exercise("breathing-1", "breathing"),
    exercise("warmup-1", "warmup"),
    exercise("song-1", "song"),
  ];

  it("returns an empty distribution with no attempts", () => {
    expect(computeExerciseDistribution([], exercises)).toEqual([]);
  });

  it("groups attempts by category with counts, durations, and percentages", () => {
    const attempts = [
      attempt("breathing-1", 30),
      attempt("breathing-1", 30),
      attempt("song-1", 120),
    ];
    const distribution = computeExerciseDistribution(attempts, exercises);

    const breathing = distribution.find((d) => d.category === "breathing");
    const song = distribution.find((d) => d.category === "song");
    expect(breathing).toEqual({
      category: "breathing",
      count: 2,
      totalDurationSeconds: 60,
      percent: 2 / 3,
    });
    expect(song).toEqual({
      category: "song",
      count: 1,
      totalDurationSeconds: 120,
      percent: 1 / 3,
    });
  });

  it("sorts descending by count", () => {
    const attempts = [
      attempt("song-1", 10),
      attempt("breathing-1", 10),
      attempt("breathing-1", 10),
    ];
    const distribution = computeExerciseDistribution(attempts, exercises);
    expect(distribution.map((d) => d.category)).toEqual(["breathing", "song"]);
  });

  it("ignores attempts referencing an exercise that no longer exists", () => {
    const attempts = [
      attempt("deleted-exercise", 30),
      attempt("breathing-1", 30),
    ];
    const distribution = computeExerciseDistribution(attempts, exercises);
    expect(distribution).toEqual([
      { category: "breathing", count: 1, totalDurationSeconds: 30, percent: 1 },
    ]);
  });
});
