import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type {
  ExerciseRecord,
  PracticePlanRecord,
  PracticeSessionRecord,
  SkillRecord,
} from "@momentum/types";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import type { PracticeCatalog } from "../services/catalog-service";
import {
  ActivePracticeScreen,
  type ActivePracticeScreenProps,
} from "./ActivePracticeScreen";

function makeExercise(overrides: Partial<ExerciseRecord>): ExerciseRecord {
  return {
    id: "exercise-1",
    skillId: "skill-1",
    category: "breathing",
    title: "Deep Breathing",
    description: "Warm up your breath.",
    targetDurationSeconds: 60,
    difficulty: "easy",
    order: 0,
    ...overrides,
  };
}

const exercises: ExerciseRecord[] = [
  makeExercise({ id: "e1", title: "Breathing", order: 0 }),
  makeExercise({ id: "e2", title: "Warmup", order: 1, category: "warmup" }),
];

const skill: SkillRecord = {
  id: "skill-1",
  slug: "riyaaz",
  name: "Riyaaz",
  category: "vocals",
  description: "",
  isActive: true,
  createdAt: 0,
};

const plan: PracticePlanRecord = {
  id: "plan-1",
  skillId: "skill-1",
  title: "Daily Practice",
  description: "",
  exerciseIds: ["e1", "e2"],
  targetDurationSeconds: 120,
  isRecoveryPlan: false,
  createdAt: 0,
};

const catalog: PracticeCatalog = { skill, plan, exercises };

function makeSession(
  overrides: Partial<PracticeSessionRecord> = {},
): PracticeSessionRecord {
  return {
    id: "session-1",
    status: "in_progress",
    skillId: "skill-1",
    planId: "plan-1",
    exerciseIds: ["e1", "e2"],
    currentStepIndex: 0,
    elapsedSeconds: 10,
    voiceCondition: "normal",
    recoveryMode: false,
    draftNotes: null,
    startedAt: 0,
    updatedAt: 0,
    completedAt: null,
    ...overrides,
  };
}

let storage: MomentumStorage;

const baseProps: Omit<
  ActivePracticeScreenProps,
  | "session"
  | "onPause"
  | "onResume"
  | "onRecordElapsed"
  | "onSaveDraftNotes"
  | "onCompleteExercise"
  | "onExitRequest"
> = {
  catalog,
  isPaused: false,
};

function renderScreen(props: Partial<ActivePracticeScreenProps> = {}) {
  return render(
    <StorageProvider value={storage}>
      <ActivePracticeScreen
        {...baseProps}
        session={makeSession()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onRecordElapsed={vi.fn()}
        onSaveDraftNotes={vi.fn()}
        onCompleteExercise={vi.fn()}
        onExitRequest={vi.fn()}
        {...props}
      />
    </StorageProvider>,
  );
}

describe("ActivePracticeScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-active-practice-screen-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    await storage.db.delete();
  });

  it("resolves the current exercise from the session's queue and shows the queue list", () => {
    renderScreen();

    expect(
      screen.getByText("Breathing", { selector: "h3" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("seeds the session timer from the persisted elapsedSeconds", () => {
    renderScreen({ session: makeSession({ elapsedSeconds: 65 }) });

    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("calls onRecordElapsed every second while running", () => {
    const onRecordElapsed = vi.fn();
    renderScreen({
      session: makeSession({ elapsedSeconds: 0 }),
      onRecordElapsed,
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onRecordElapsed).toHaveBeenCalledWith(1);
    expect(onRecordElapsed).toHaveBeenCalledWith(2);
  });

  it("freezes the session timer while paused", () => {
    renderScreen({
      session: makeSession({ elapsedSeconds: 0 }),
      isPaused: true,
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("finishes the current exercise from the bottom bar with the elapsed duration and notes", () => {
    const onCompleteExercise = vi.fn();
    renderScreen({ onCompleteExercise });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      screen.getByRole("button", { name: /Finish Exercise/i }).click();
    });

    expect(onCompleteExercise).toHaveBeenCalledWith({
      exerciseId: "e1",
      status: "completed",
      durationSeconds: 3,
      notes: null,
    });
  });

  it("debounces autosaving draft notes after the user stops typing in the Notes dialog", () => {
    const onSaveDraftNotes = vi.fn();
    renderScreen({ onSaveDraftNotes });

    act(() => {
      screen.getByRole("button", { name: "Notes" }).click();
    });
    const textarea = screen.getByRole("textbox");
    act(() => {
      fireEvent.change(textarea, {
        target: { value: "great breath support" },
      });
    });

    expect(onSaveDraftNotes).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(onSaveDraftNotes).toHaveBeenCalledWith("great breath support");
  });

  it("requests exit when the header's exit button is clicked", () => {
    const onExitRequest = vi.fn();
    renderScreen({ onExitRequest });

    act(() => {
      screen.getByRole("button", { name: "Exit practice" }).click();
    });
    expect(onExitRequest).toHaveBeenCalled();
  });
});
