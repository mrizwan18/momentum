import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IntroPowerfulPractice } from "./IntroPowerfulPractice";

describe("IntroPowerfulPractice", () => {
  it("shows the headline and subhead", () => {
    render(<IntroPowerfulPractice onNext={vi.fn()} />);
    expect(screen.getByText("Powerful practice.")).toBeInTheDocument();
    expect(screen.getByText("Real progress.")).toBeInTheDocument();
    expect(screen.getByText(/AI powered voice coaching/i)).toBeInTheDocument();
  });

  it("shows the hero photo", () => {
    render(<IntroPowerfulPractice onNext={vi.fn()} />);
    expect(screen.getByAltText(/singer practicing/i)).toBeInTheDocument();
  });

  it("shows step 1 of 3 and calls onNext", async () => {
    const onNext = vi.fn();
    render(<IntroPowerfulPractice onNext={onNext} />);
    expect(
      screen.getByRole("img", { name: /step 1 of 3/i }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<IntroPowerfulPractice onNext={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
