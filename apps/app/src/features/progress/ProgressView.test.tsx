import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  createExercise,
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { toDateOnly } from "@/lib/date";
import { ProgressView } from "./ProgressView";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/progress",
}));

let storage: MomentumStorage;

function renderProgress() {
  return render(
    <StorageProvider value={storage}>
      <ProgressView />
    </StorageProvider>,
  );
}

describe("ProgressView", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-progress-view-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("shows a loading skeleton before Dexie resolves", async () => {
    renderProgress();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading progress")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Progress")).toBeInTheDocument(),
    );
  });

  it("shows an empty state with no practice history", async () => {
    renderProgress();
    await waitFor(() =>
      expect(screen.getByText("No progress yet")).toBeInTheDocument(),
    );
  });

  it("renders every section once real data has loaded", async () => {
    await storage.exercises.seed([
      createExercise({
        skillId: "riyaaz",
        category: "breathing",
        title: "Breathing",
        targetDurationSeconds: 60,
        order: 0,
      }),
    ]);
    const exercises = await storage.exercises.listBySkill("riyaaz");
    const session = await storage.sessions.start(["breathing"], {
      skillId: "riyaaz",
    });
    await storage.exerciseAttempts.record({
      sessionId: session.id,
      exerciseId: exercises[0].id,
      status: "completed",
      durationSeconds: 45,
    });
    const completed = await storage.sessions.complete(session.id);
    await storage.sessionSummaries.create({
      sessionId: completed.id,
      xpEarned: 100,
      overallScore: 75,
      momentumDelta: 5,
      coachMessage: "Nice",
    });
    await storage.statistics.upsertForDate({
      date: toDateOnly(new Date()),
      practiceMinutes: 15,
      sessionsCompleted: 1,
    });

    renderProgress();

    await waitFor(() =>
      expect(screen.getByText("This Week")).toBeInTheDocument(),
    );
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("Practice Heatmap")).toBeInTheDocument();
    expect(screen.getByText("Exercise Distribution")).toBeInTheDocument();
    expect(screen.getByText("Streak History")).toBeInTheDocument();
    expect(screen.getByText("Personal Records")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("has no accessibility violations once loaded (empty state)", async () => {
    const { container } = renderProgress();
    await waitFor(() =>
      expect(screen.getByText("No progress yet")).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
