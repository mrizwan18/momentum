import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { HistoryList } from "./HistoryList";
import type { HistoryEntry } from "../lib/history";

const history: HistoryEntry[] = [
  {
    sessionId: "a",
    date: "2026-07-25",
    completedAt: 1000,
    status: "completed",
    durationSeconds: 600,
    exercisesCompleted: 5,
    dailyScore: 82,
    xpEarned: 100,
  },
  {
    sessionId: "b",
    date: "2026-07-24",
    completedAt: 500,
    status: "abandoned",
    durationSeconds: 120,
    exercisesCompleted: 0,
    dailyScore: null,
    xpEarned: null,
  },
];

describe("HistoryList", () => {
  it("shows an empty state with no history", () => {
    render(<HistoryList history={[]} />);
    expect(screen.getByText("No sessions yet")).toBeInTheDocument();
  });

  it("lists completed sessions with duration, exercise count, and score", () => {
    render(<HistoryList history={history} />);
    expect(screen.getByText("10:00 · 5 exercises")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("labels abandoned sessions without a score", () => {
    render(<HistoryList history={history} />);
    expect(screen.getByText("Abandoned")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<HistoryList history={history} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
