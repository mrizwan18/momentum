import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders a calm, reassuring message", () => {
    render(
      <ErrorState
        title="We couldn't save that recording"
        description="Nothing has been lost."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "We couldn't save that recording" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nothing has been lost.")).toBeInTheDocument();
  });

  it("defaults the action label to Try again", async () => {
    const onAction = vi.fn();
    render(<ErrorState title="Something went wrong" onAction={onAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("shows the retry action as loading", () => {
    render(
      <ErrorState
        title="Something went wrong"
        onAction={vi.fn()}
        actionLoading
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ErrorState title="Something went wrong" onAction={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
