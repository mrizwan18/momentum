import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionStatusCard } from "./SessionStatusCard";

describe("SessionStatusCard", () => {
  it("shows the formatted elapsed time and In Progress status", () => {
    render(
      <SessionStatusCard
        elapsedSeconds={125}
        isPaused={false}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("2:05")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("shows Paused status when paused", () => {
    render(
      <SessionStatusCard elapsedSeconds={0} isPaused onToggle={vi.fn()} />,
    );

    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("calls onToggle when tapped", async () => {
    const onToggle = vi.fn();
    render(
      <SessionStatusCard
        elapsedSeconds={0}
        isPaused={false}
        onToggle={onToggle}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Pause practice" }),
    );
    expect(onToggle).toHaveBeenCalled();
  });

  it("exposes the resume label while paused", () => {
    render(
      <SessionStatusCard elapsedSeconds={0} isPaused onToggle={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Resume practice" }),
    ).toBeInTheDocument();
  });
});
