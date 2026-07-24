import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ExerciseRecord } from "@momentum/types";
import { ExerciseQueueList } from "./ExerciseQueueList";

function makeExercise(overrides: Partial<ExerciseRecord>): ExerciseRecord {
  return {
    id: "exercise-1",
    skillId: "skill-1",
    category: "breathing",
    title: "Deep Breathing",
    description: "",
    targetDurationSeconds: 60,
    difficulty: "easy",
    order: 0,
    ...overrides,
  };
}

const exercises: ExerciseRecord[] = [
  makeExercise({
    id: "e1",
    title: "Breathing",
    order: 0,
    targetDurationSeconds: 300,
  }),
  makeExercise({
    id: "e2",
    title: "Warmup",
    order: 1,
    category: "warmup",
    targetDurationSeconds: 600,
  }),
  makeExercise({
    id: "e3",
    title: "Scales",
    order: 2,
    category: "scales",
    targetDurationSeconds: 900,
  }),
];

describe("ExerciseQueueList", () => {
  it("renders every exercise's title and duration", () => {
    render(<ExerciseQueueList exercises={exercises} currentIndex={1} />);
    expect(screen.getByText("Breathing")).toBeInTheDocument();
    expect(screen.getByText("Warmup")).toBeInTheDocument();
    expect(screen.getByText("Scales")).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
  });

  it("shows the session progress header count", () => {
    render(<ExerciseQueueList exercises={exercises} currentIndex={1} />);
    expect(screen.getByText("Session Progress")).toBeInTheDocument();
    expect(screen.getByText("2 / 3 Exercises")).toBeInTheDocument();
  });

  it("marks exercises before currentIndex as complete", () => {
    render(<ExerciseQueueList exercises={exercises} currentIndex={1} />);
    expect(screen.getByText("Breathing")).toHaveClass("line-through");
  });

  it("marks the exercise at currentIndex as the current step", () => {
    render(<ExerciseQueueList exercises={exercises} currentIndex={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("does not mark upcoming exercises as complete or current", () => {
    render(<ExerciseQueueList exercises={exercises} currentIndex={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[2]).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Scales")).not.toHaveClass("line-through");
  });
});
