import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type {
  AiSessionInsightRecord,
  PracticeSessionRecord,
} from "@momentum/types";
import type { SessionSummaryView } from "../services/summary-service";
import { SessionSummaryScreen } from "./SessionSummaryScreen";

const aiInsight: AiSessionInsightRecord = {
  id: "session-1",
  sessionId: "session-1",
  whatImproved: ["Breath support"],
  whatDeclined: ["Pitch on high notes"],
  bestMoment: "The final scale run",
  biggestOpportunity: "Warm up longer next time",
  tomorrowsGoal: "Focus on breath control",
  encouragingSentence: "Great focus today!",
  metricsSnapshot: {
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
  provider: "mock",
  createdAt: 0,
};

const session: PracticeSessionRecord = {
  id: "session-1",
  status: "completed",
  skillId: "skill-1",
  planId: "plan-1",
  exerciseIds: ["e1", "e2"],
  currentStepIndex: 2,
  elapsedSeconds: 725,
  voiceCondition: "normal",
  recoveryMode: false,
  draftNotes: null,
  startedAt: 0,
  updatedAt: 0,
  completedAt: 1000,
};

function makeSummary(
  overrides: Partial<SessionSummaryView> = {},
): SessionSummaryView {
  return {
    session,
    durationSeconds: 725,
    exercisesCompleted: 2,
    exercisesSkipped: 0,
    totalExercises: 2,
    xpEarned: 120,
    dailyScore: 82,
    streak: { qualifying: true, current: 5, longest: 5, extended: true },
    consistency: { daysPracticed: 4, totalDays: 7 },
    recordingCount: 1,
    notes: [],
    personalBests: {
      isLongestSession: false,
      isMostExercisesCompleted: false,
      isBestDailyScore: false,
    },
    motivationalMessage: "Streak extended to 5 days — keep it going.",
    ...overrides,
  };
}

describe("SessionSummaryScreen", () => {
  afterEach(() => {
    // @ts-expect-error -- test-only cleanup of a property we defined below
    delete navigator.vibrate;
  });

  it("shows the motivational message and core stats", () => {
    render(<SessionSummaryScreen summary={makeSummary()} />);

    expect(screen.getByText("Session complete")).toBeInTheDocument();
    expect(
      screen.getByText("Streak extended to 5 days — keep it going."),
    ).toBeInTheDocument();
    expect(screen.getByText("12:05")).toBeInTheDocument(); // duration
    expect(screen.getByText("2/2")).toBeInTheDocument(); // exercises
    expect(screen.getByText("+120")).toBeInTheDocument(); // XP
    expect(screen.getByText("82")).toBeInTheDocument(); // daily score
    expect(screen.getByText("5 days")).toBeInTheDocument(); // streak
    expect(screen.getByText("4/7 days")).toBeInTheDocument(); // consistency
  });

  it("shows a skipped-count caption only when exercises were skipped", () => {
    const { rerender } = render(
      <SessionSummaryScreen summary={makeSummary({ exercisesSkipped: 0 })} />,
    );
    expect(screen.queryByText(/skipped/)).not.toBeInTheDocument();

    rerender(
      <SessionSummaryScreen
        summary={makeSummary({ exercisesCompleted: 1, exercisesSkipped: 1 })}
      />,
    );
    expect(screen.getByText("1 skipped")).toBeInTheDocument();
  });

  it("shows 'Not counted' for a non-qualifying session", () => {
    render(
      <SessionSummaryScreen
        summary={makeSummary({
          streak: {
            qualifying: false,
            current: 0,
            longest: 3,
            extended: false,
          },
        })}
      />,
    );
    expect(screen.getByText("Not counted")).toBeInTheDocument();
  });

  it("renders a personal-bests card only when at least one best was hit", () => {
    const { rerender } = render(
      <SessionSummaryScreen summary={makeSummary()} />,
    );
    expect(screen.queryByText("Personal bests")).not.toBeInTheDocument();

    rerender(
      <SessionSummaryScreen
        summary={makeSummary({
          personalBests: {
            isLongestSession: true,
            isMostExercisesCompleted: false,
            isBestDailyScore: false,
          },
        })}
      />,
    );
    expect(screen.getByText("Personal bests")).toBeInTheDocument();
    expect(screen.getByText("🏆 Longest session yet")).toBeInTheDocument();
  });

  it("renders a notes card only when notes exist", () => {
    const { rerender } = render(
      <SessionSummaryScreen summary={makeSummary()} />,
    );
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();

    rerender(
      <SessionSummaryScreen
        summary={makeSummary({
          notes: [{ exerciseTitle: "Breathing", note: "felt great" }],
        })}
      />,
    );
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Breathing")).toBeInTheDocument();
    expect(screen.getByText("felt great")).toBeInTheDocument();
  });

  it("links back to the dashboard", () => {
    render(<SessionSummaryScreen summary={makeSummary()} />);
    expect(
      screen.getByRole("link", { name: "Back to Dashboard" }),
    ).toHaveAttribute("href", "/");
  });

  it("triggers a success haptic on mount", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrate,
      configurable: true,
    });

    render(<SessionSummaryScreen summary={makeSummary()} />);
    expect(vibrate).toHaveBeenCalled();
  });

  it("does not render an AI Coach Insight card when no AI status is provided", () => {
    render(<SessionSummaryScreen summary={makeSummary()} />);
    expect(screen.queryByText("AI Coach Insight")).not.toBeInTheDocument();
  });

  it("shows a reviewing message while the AI insight is running", () => {
    render(
      <SessionSummaryScreen
        summary={makeSummary()}
        aiInsightStatus="running"
        aiInsight={null}
      />,
    );
    expect(screen.getByText("AI Coach Insight")).toBeInTheDocument();
    expect(
      screen.getByText("Your AI coach is reviewing this session…"),
    ).toBeInTheDocument();
  });

  it("shows an offline message when the AI insight is pending", () => {
    render(
      <SessionSummaryScreen
        summary={makeSummary()}
        aiInsightStatus="pending-offline"
        aiInsight={null}
      />,
    );
    expect(screen.getByText(/back online/)).toBeInTheDocument();
  });

  it("shows the real AI insight once ready", () => {
    render(
      <SessionSummaryScreen
        summary={makeSummary()}
        aiInsightStatus="ready"
        aiInsight={aiInsight}
      />,
    );
    expect(screen.getByText("Great focus today!")).toBeInTheDocument();
    expect(screen.getByText(/Breath support/)).toBeInTheDocument();
    expect(screen.getByText(/Pitch on high notes/)).toBeInTheDocument();
    expect(screen.getByText("The final scale run")).toBeInTheDocument();
    expect(screen.getByText("Warm up longer next time")).toBeInTheDocument();
    expect(screen.getByText("Focus on breath control")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SessionSummaryScreen
        summary={makeSummary({
          notes: [{ exerciseTitle: "Breathing", note: "felt great" }],
          personalBests: {
            isLongestSession: true,
            isMostExercisesCompleted: false,
            isBestDailyScore: false,
          },
        })}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
