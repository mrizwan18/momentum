import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CaptureVoiceIntro } from "./CaptureVoiceIntro";

describe("CaptureVoiceIntro", () => {
  it("shows the headline and privacy reassurance", () => {
    render(<CaptureVoiceIntro onBack={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText(/Let's capture/)).toBeInTheDocument();
    expect(screen.getByText("your voice")).toBeInTheDocument();
    expect(
      screen.getByText("Your recording is private and secure."),
    ).toBeInTheDocument();
  });

  it("calls onBack and onNext", async () => {
    const onBack = vi.fn();
    const onNext = vi.fn();
    render(<CaptureVoiceIntro onBack={onBack} onNext={onNext} />);

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onBack).toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CaptureVoiceIntro onBack={vi.fn()} onNext={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
