import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { CoachView } from "./CoachView";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/coach",
}));

let storage: MomentumStorage;

const coachReplyResponseData = {
  message: "You're just getting started. Try a short breathing exercise today.",
  suggestedExercises: ["Try a short breathing exercise today."],
};

function renderCoach() {
  return render(
    <StorageProvider value={storage}>
      <CoachView />
    </StorageProvider>,
  );
}

describe("CoachView", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-coach-view-${Math.random()}`),
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ data: coachReplyResponseData, provider: "mock" }),
            { status: 200 },
          ),
        ),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("renders every real-data section once loaded", async () => {
    renderCoach();

    await waitFor(() =>
      expect(screen.getByText("AI Coach")).toBeInTheDocument(),
    );
    expect(screen.getByText("Your Personal Guide")).toBeInTheDocument();
    expect(screen.getByText("Consistency Score")).toBeInTheDocument();
    expect(screen.getByText("Personalized Insight")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "You're just getting started. Try a short breathing exercise today.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Try a short breathing exercise today."),
    ).toBeInTheDocument();
  });

  it("doesn't show Focus Areas with no baseline or session data yet", async () => {
    renderCoach();
    await waitFor(() =>
      expect(screen.getByText("AI Coach")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Focus Areas")).not.toBeInTheDocument();
  });

  it("shows Focus Areas once a baseline exists", async () => {
    await storage.baselineAssessments.create({
      recordingId: "recording-1",
      overallScore: 70,
      metrics: {
        pitchAccuracy: 82,
        pitchStability: 80,
        rhythm: 70,
        breathControl: 78,
        toneQuality: 80,
        consistency: 88,
        vocalRange: 80,
        confidence: 80,
        timing: 80,
        voiceClarity: 80,
        pronunciation: 80,
        energy: 75,
      },
      strengths: ["Tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
      provider: "mock",
    });

    renderCoach();
    expect(await screen.findByText("Focus Areas")).toBeInTheDocument();
    expect(screen.getByText("Pitch Accuracy")).toBeInTheDocument();
  });

  it("toggles the chat panel from the sparkle button", async () => {
    const user = userEvent.setup();
    renderCoach();
    await waitFor(() =>
      expect(screen.getByText("AI Coach")).toBeInTheDocument(),
    );

    expect(screen.queryByText("Ask your AI Coach")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ask your AI Coach" }));
    expect(screen.getByText("Ask your AI Coach")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide chat" }));
    expect(screen.queryByText("Ask your AI Coach")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderCoach();
    await waitFor(() =>
      expect(screen.getByText("AI Coach")).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
