import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterruptedPrompt } from "./InterruptedPrompt";

describe("InterruptedPrompt", () => {
  it("renders nothing when closed", () => {
    render(
      <InterruptedPrompt open={false} onResume={vi.fn()} onDiscard={vi.fn()} />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains that a session was left open", () => {
    render(<InterruptedPrompt open onResume={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByText("Pick up where you left off?")).toBeInTheDocument();
  });

  it("calls onResume when resuming", async () => {
    const onResume = vi.fn();
    render(<InterruptedPrompt open onResume={onResume} onDiscard={vi.fn()} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Resume practice" }),
    );
    expect(onResume).toHaveBeenCalled();
  });

  it("calls onDiscard when discarding", async () => {
    const onDiscard = vi.fn();
    render(<InterruptedPrompt open onResume={vi.fn()} onDiscard={onDiscard} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Discard session" }),
    );
    expect(onDiscard).toHaveBeenCalled();
  });

  it("shows a loading state on the discard button and disables resume", () => {
    render(
      <InterruptedPrompt
        open
        onResume={vi.fn()}
        onDiscard={vi.fn()}
        discardLoading
      />,
    );

    expect(
      screen.getByRole("button", { name: "Resume practice" }),
    ).toBeDisabled();
  });
});
