import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RecordingControls } from "./RecordingControls";

const noop = {
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
  onCancel: vi.fn(),
};

describe("RecordingControls", () => {
  it("shows the countdown value and a cancel button", async () => {
    const onCancel = vi.fn();
    render(
      <RecordingControls
        status="countdown"
        countdownValue={2}
        elapsedMs={0}
        levels={[]}
        {...noop}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Cancel countdown" }),
    );
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows elapsed time and a pause button while recording", async () => {
    const onPause = vi.fn();
    render(
      <RecordingControls
        status="recording"
        countdownValue={0}
        elapsedMs={65_000}
        levels={[0.2, 0.5]}
        {...noop}
        onPause={onPause}
      />,
    );
    expect(screen.getByText("1:05")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Pause recording" }),
    );
    expect(onPause).toHaveBeenCalledOnce();
  });

  it("shows a resume button while paused", async () => {
    const onResume = vi.fn();
    render(
      <RecordingControls
        status="paused"
        countdownValue={0}
        elapsedMs={5000}
        levels={[0.1]}
        {...noop}
        onResume={onResume}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Resume recording" }),
    );
    expect(onResume).toHaveBeenCalledOnce();
  });

  it("calls onStop from the stop button", async () => {
    const onStop = vi.fn();
    render(
      <RecordingControls
        status="recording"
        countdownValue={0}
        elapsedMs={1000}
        levels={[0.3]}
        {...noop}
        onStop={onStop}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Stop recording" }),
    );
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RecordingControls
        status="recording"
        countdownValue={0}
        elapsedMs={1000}
        levels={[0.3]}
        {...noop}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
