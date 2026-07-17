import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type { PracticeSessionRecord } from "@momentum/types";
import { PracticeChecklist } from "./PracticeChecklist";

function session(
  overrides: Partial<PracticeSessionRecord> = {},
): PracticeSessionRecord {
  return {
    id: "session-1",
    status: "in_progress",
    exerciseIds: ["breathing", "warmup", "song"],
    currentStepIndex: 1,
    elapsedSeconds: 60,
    startedAt: 0,
    updatedAt: 0,
    completedAt: null,
    ...overrides,
  };
}

describe("PracticeChecklist", () => {
  it("renders an empty state without an active session", () => {
    render(<PracticeChecklist activeSession={null} />);
    expect(screen.getByText("No checklist yet")).toBeInTheDocument();
  });

  it("marks steps before the current index as completed", () => {
    render(<PracticeChecklist activeSession={session()} />);
    expect(screen.getByText(/Breathing/)).toHaveClass("line-through");
    expect(screen.getByText(/Warm-up/)).not.toHaveClass("line-through");
  });

  it("translates known exercise ids into friendly labels", () => {
    render(
      <PracticeChecklist
        activeSession={session({
          exerciseIds: ["scales"],
          currentStepIndex: 0,
        })}
      />,
    );
    expect(screen.getByText(/Sa Re Ga Ma/)).toBeInTheDocument();
  });

  it("falls back to the raw id for an unknown exercise", () => {
    render(
      <PracticeChecklist
        activeSession={session({
          exerciseIds: ["mystery-drill"],
          currentStepIndex: 0,
        })}
      />,
    );
    expect(screen.getByText(/mystery-drill/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PracticeChecklist activeSession={session()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
