import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("offers to switch to light when currently dark", () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("offers to switch to dark when currently light", () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="dark" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ThemeToggle theme="dark" onToggle={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
