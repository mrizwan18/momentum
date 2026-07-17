import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the explanation and encouragement copy", () => {
    render(
      <EmptyState
        title="No recordings yet"
        description="Your first recording becomes the beginning of your Voice Timeline."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No recordings yet" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Voice Timeline/)).toBeInTheDocument();
  });

  it("renders a single call to action when provided", async () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No recordings yet"
        actionLabel="Record Today"
        onAction={onAction}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Record Today" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("omits the action when none is provided", () => {
    render(<EmptyState title="No recordings yet" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the action as loading", () => {
    render(
      <EmptyState
        title="No recordings yet"
        actionLabel="Record Today"
        onAction={vi.fn()}
        actionLoading
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <EmptyState
        title="No recordings yet"
        actionLabel="Record Today"
        onAction={vi.fn()}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
