import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodayPracticeCard } from "./TodayPracticeCard";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("TodayPracticeCard", () => {
  it("shows today's real practice minutes", () => {
    render(<TodayPracticeCard todayMinutes={47} todayGoal={undefined} />);
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("minutes")).toBeInTheDocument();
  });

  it("shows the goal caption when a daily goal exists for today", () => {
    render(
      <TodayPracticeCard
        todayMinutes={47}
        todayGoal={{
          id: "2026-07-19",
          date: "2026-07-19",
          requiredExerciseIds: [],
          targetDurationSeconds: 3600,
          xpReward: 0,
          completed: false,
        }}
      />,
    );
    expect(screen.getByText("Goal: 60 min")).toBeInTheDocument();
  });

  it("falls back to the default goal when none has been set yet", () => {
    render(<TodayPracticeCard todayMinutes={0} todayGoal={undefined} />);
    expect(screen.getByText("Goal: 30 min")).toBeInTheDocument();
  });

  it("navigates to /practice when the action button is pressed", async () => {
    render(<TodayPracticeCard todayMinutes={0} todayGoal={undefined} />);
    await userEvent.click(
      screen.getByRole("button", { name: /go to practice/i }),
    );
    expect(push).toHaveBeenCalledWith("/practice");
  });
});
