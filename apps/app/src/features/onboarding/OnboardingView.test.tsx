import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import {
  installMediaRecorderMock,
  uninstallMediaRecorderMock,
} from "@test-utils/media-recorder-mock";
import { OnboardingView } from "./OnboardingView";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

let storage: MomentumStorage;

const assessmentResponseData = {
  overallScore: 80,
  metrics: {
    pitchAccuracy: 80,
    pitchStability: 80,
    rhythm: 80,
    breathControl: 80,
    toneQuality: 80,
    consistency: 80,
    vocalRange: 80,
    confidence: 80,
    timing: 80,
    voiceClarity: 80,
    pronunciation: 80,
    energy: 80,
  },
  strengths: ["Good tone"],
  areasToImprove: ["Pitch"],
  recommendedDailyPractice: "Scales",
  recommendedDurationMinutes: 15,
  suggestedSkillLevel: "beginner",
  difficulty: "easy",
  motivationalSummary: "Great start!",
};

describe("OnboardingView", () => {
  beforeEach(() => {
    push.mockClear();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-onboarding-view-${Math.random()}`),
    );
    installMediaRecorderMock();
    // Real network calls don't exist in this test environment — /api/ai/assessment
    // is mocked so useBaselineAssessment resolves quickly and deterministically.
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ data: assessmentResponseData, provider: "mock" }),
            { status: 200 },
          ),
        ),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    uninstallMediaRecorderMock();
    await storage.db.delete();
  });

  it("starts on the splash screen", () => {
    render(
      <StorageProvider value={storage}>
        <OnboardingView />
      </StorageProvider>,
    );
    expect(screen.getByText("Momentum")).toBeInTheDocument();
  });

  it("walks the full flow from splash through the baseline recording to / on Continue", async () => {
    const user = userEvent.setup();
    // Fake timers installed before mount, so the splash timer's Date.now()
    // baseline is consistent with the fake clock we then advance.
    vi.useFakeTimers();
    render(
      <StorageProvider value={storage}>
        <OnboardingView />
      </StorageProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(2300);
    });
    vi.useRealTimers();
    expect(await screen.findByText("Powerful practice.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Your personal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Track. Improve.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Let's get to")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /get started/i }));
    expect(await screen.findByText("Almost there! 👋")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Your Name"), "Riyaaz");
    await user.type(screen.getByLabelText("Your Age"), "24");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText(/Let's capture/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Get ready to sing")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Tap to start recording" }),
    );
    expect(await screen.findByText("Recording…")).toBeInTheDocument();

    // fireEvent (not userEvent) plus fake timers installed *before* the
    // click, so the elapsed-time interval registers under the fake clock —
    // same convention as the Recording feature's own tests.
    vi.useFakeTimers();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Tap to stop" }));

    // Saving the baseline recording touches Dexie, which needs real timers.
    // Uploading/Analyzing's own auto-advance timers are left running on the
    // real clock too from here on — both screens' setInterval/setTimeout
    // calls are created the moment each mounts, under whatever clock is
    // active then, so switching to fake mid-flight wouldn't affect them.
    vi.useRealTimers();
    expect(
      await screen.findByText("Uploading your recording"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "AI is analyzing your voice",
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Your Initial Assessment 🎉",
        {},
        { timeout: 8000 },
      ),
    ).toBeInTheDocument();

    // The real (mocked) AI response has already settled by the time
    // Analyzing hands off to Result, since onComplete awaits it.
    expect(screen.getByText("80")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Continue to Dashboard" }),
    );

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    const savedUser = await storage.users.get();
    expect(savedUser?.displayName).toBe("Riyaaz");
    expect(savedUser?.age).toBe(24);

    const recordings = await storage.recordings.list();
    expect(recordings).toHaveLength(1);
    expect(recordings[0].title).toBe("Baseline Recording");

    const baseline = await storage.baselineAssessments.get();
    expect(baseline?.overallScore).toBe(80);
    expect(baseline?.recordingId).toBe(recordings[0].id);
  }, 20000);

  it("has no accessibility violations on the splash screen", async () => {
    const { container, unmount } = render(
      <StorageProvider value={storage}>
        <OnboardingView />
      </StorageProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    unmount();
  });
});
