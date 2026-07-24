import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExitConfirmDialog } from "./ExitConfirmDialog";

describe("ExitConfirmDialog", () => {
  it("renders nothing when closed", () => {
    render(
      <ExitConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        onPauseAndExit={vi.fn()}
        onEndSession={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers keep practicing, resume later, and end session", () => {
    render(
      <ExitConfirmDialog
        open
        onOpenChange={vi.fn()}
        onPauseAndExit={vi.fn()}
        onEndSession={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Keep practicing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resume later" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "End session" }),
    ).toBeInTheDocument();
  });

  it("calls onPauseAndExit for Resume later", async () => {
    const onPauseAndExit = vi.fn();
    render(
      <ExitConfirmDialog
        open
        onOpenChange={vi.fn()}
        onPauseAndExit={onPauseAndExit}
        onEndSession={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Resume later" }));
    expect(onPauseAndExit).toHaveBeenCalled();
  });

  it("calls onEndSession for End session", async () => {
    const onEndSession = vi.fn();
    render(
      <ExitConfirmDialog
        open
        onOpenChange={vi.fn()}
        onPauseAndExit={vi.fn()}
        onEndSession={onEndSession}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "End session" }));
    expect(onEndSession).toHaveBeenCalled();
  });

  it("calls onOpenChange(false) for Keep practicing", async () => {
    const onOpenChange = vi.fn();
    render(
      <ExitConfirmDialog
        open
        onOpenChange={onOpenChange}
        onPauseAndExit={vi.fn()}
        onEndSession={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Keep practicing" }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables the other actions while ending", () => {
    render(
      <ExitConfirmDialog
        open
        onOpenChange={vi.fn()}
        onPauseAndExit={vi.fn()}
        onEndSession={vi.fn()}
        endLoading
      />,
    );

    expect(
      screen.getByRole("button", { name: "Keep practicing" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Resume later" })).toBeDisabled();
  });
});
