import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { UploadingScreen } from "./UploadingScreen";

describe("UploadingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the uploading copy and disables back while in flight", () => {
    render(<UploadingScreen onBack={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText("Uploading your recording")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go back" })).toBeDisabled();
  });

  it("auto-advances to onComplete once the animation finishes", () => {
    const onComplete = vi.fn();
    render(<UploadingScreen onBack={vi.fn()} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(2300);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it("re-enables back once complete", () => {
    render(<UploadingScreen onBack={vi.fn()} onComplete={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(2300);
    });

    expect(screen.getByRole("button", { name: "Go back" })).not.toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <UploadingScreen onBack={vi.fn()} onComplete={vi.fn()} />,
    );
    vi.useRealTimers();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
