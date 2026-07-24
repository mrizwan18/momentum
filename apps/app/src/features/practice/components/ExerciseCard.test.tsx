import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { ExerciseRecord } from "@momentum/types";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { ExerciseCard, type ExerciseCardProps } from "./ExerciseCard";

const exercise: ExerciseRecord = {
  id: "exercise-1",
  skillId: "skill-1",
  category: "breathing",
  title: "Deep Breathing",
  description: "Slow diaphragmatic breaths to warm up the voice.",
  targetDurationSeconds: 120,
  difficulty: "easy",
  order: 0,
};

const baseProps: Omit<ExerciseCardProps, "onSkip" | "onPauseToggle"> = {
  exercise,
  isSessionPaused: false,
  sessionId: "session-1",
};

let storage: MomentumStorage;

function renderCard(props: Partial<ExerciseCardProps> = {}) {
  return render(
    <StorageProvider value={storage}>
      <ExerciseCard
        {...baseProps}
        onSkip={vi.fn()}
        onPauseToggle={vi.fn()}
        {...props}
      />
    </StorageProvider>,
  );
}

describe("ExerciseCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-exercise-card-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    await storage.db.delete();
  });

  it("shows the exercise title and description", () => {
    renderCard();

    expect(screen.getByText("Deep Breathing")).toBeInTheDocument();
    expect(
      screen.getByText("Slow diaphragmatic breaths to warm up the voice."),
    ).toBeInTheDocument();
  });

  it("shows the completion percentage for a target-duration exercise", () => {
    renderCard();

    expect(screen.getByText("0%")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("reports elapsed seconds via onElapsedChange", () => {
    const onElapsedChange = vi.fn();
    renderCard({ onElapsedChange });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onElapsedChange).toHaveBeenCalledWith(3);
  });

  it("stops the timer while the session is paused", () => {
    const { rerender } = renderCard();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText("25%")).toBeInTheDocument();

    rerender(
      <StorageProvider value={storage}>
        <ExerciseCard
          {...baseProps}
          isSessionPaused
          onSkip={vi.fn()}
          onPauseToggle={vi.fn()}
        />
      </StorageProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("disables Skip while a completion is in flight", () => {
    renderCard({ isBusy: true });

    expect(screen.getByRole("button", { name: /Skip/i })).toBeDisabled();
  });

  it("calls onSkip with the elapsed duration", () => {
    const onSkip = vi.fn();
    renderCard({ onSkip });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      screen.getByRole("button", { name: /Skip/i }).click();
    });
    expect(onSkip).toHaveBeenCalledWith(1);
  });

  it("renders the recording panel for the current session", () => {
    renderCard();
    expect(screen.getByText("Record this exercise")).toBeInTheDocument();
  });

  it("calls onPauseToggle when the pause button is clicked", () => {
    const onPauseToggle = vi.fn();
    renderCard({ onPauseToggle });

    act(() => {
      screen.getByRole("button", { name: "Pause practice" }).click();
    });
    expect(onPauseToggle).toHaveBeenCalled();
  });

  it("shows a resume label for the pause button while the session is paused", () => {
    renderCard({ isSessionPaused: true });
    expect(
      screen.getByRole("button", { name: "Resume practice" }),
    ).toBeInTheDocument();
  });
});
