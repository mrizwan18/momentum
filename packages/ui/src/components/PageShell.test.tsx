import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { PageHeader, PageShell } from "./PageShell";

describe("PageShell", () => {
  it("renders its children within a constrained container", () => {
    render(
      <PageShell data-testid="shell">
        <p>Content</p>
      </PageShell>,
    );
    expect(screen.getByTestId("shell")).toHaveClass("max-w-2xl");
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("reserves bottom padding for a fixed bottom nav by default", () => {
    render(<PageShell data-testid="shell" />);
    expect(screen.getByTestId("shell")).toHaveClass("pb-24");
  });
});

describe("PageHeader", () => {
  it("renders the title and description", () => {
    render(<PageHeader title="Progress" description="Your growth over time" />);
    expect(
      screen.getByRole("heading", { name: "Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your growth over time")).toBeInTheDocument();
  });

  it("calls onBack when the back button is pressed", async () => {
    const onBack = vi.fn();
    render(<PageHeader title="Progress" onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows skeleton placeholders while loading", () => {
    render(<PageHeader title="Progress" loading />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("disables the back button and dims itself when disabled", () => {
    render(<PageHeader title="Progress" onBack={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: "Go back" })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PageHeader
        title="Progress"
        description="Your growth over time"
        onBack={vi.fn()}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
