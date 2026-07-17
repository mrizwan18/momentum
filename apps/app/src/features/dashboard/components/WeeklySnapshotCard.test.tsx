import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { WeeklySnapshotCard } from "./WeeklySnapshotCard";

describe("WeeklySnapshotCard", () => {
  it("renders an empty state when there is no activity this week", () => {
    render(
      <WeeklySnapshotCard
        weekly={{ practiceMinutes: 0, sessionsCompleted: 0, daysPracticed: 0 }}
      />,
    );
    expect(screen.getByText("No practice yet this week")).toBeInTheDocument();
  });

  it("renders real practice minutes and session counts", () => {
    render(
      <WeeklySnapshotCard
        weekly={{ practiceMinutes: 42, sessionsCompleted: 3, daysPracticed: 3 }}
      />,
    );
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Minutes practiced")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Sessions completed")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <WeeklySnapshotCard
        weekly={{ practiceMinutes: 42, sessionsCompleted: 3, daysPracticed: 3 }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
