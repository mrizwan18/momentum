import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PracticeSessionRecord } from "@momentum/types";
import { PracticeCta } from "./PracticeCta";

function session(): PracticeSessionRecord {
  return {
    id: "session-1",
    status: "paused",
    exerciseIds: ["breathing"],
    currentStepIndex: 0,
    elapsedSeconds: 30,
    startedAt: 0,
    updatedAt: 0,
    completedAt: null,
  };
}

describe("PracticeCta", () => {
  it("reads 'Start Practice' when there is no active session", () => {
    render(<PracticeCta activeSession={null} />);
    expect(
      screen.getByRole("link", { name: "Start Practice" }),
    ).toHaveAttribute("href", "/practice");
  });

  it("reads 'Continue Practice' when a real session is active", () => {
    render(<PracticeCta activeSession={session()} />);
    expect(
      screen.getByRole("link", { name: "Continue Practice" }),
    ).toBeInTheDocument();
  });
});
