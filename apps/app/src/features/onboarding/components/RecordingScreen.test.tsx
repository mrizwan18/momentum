import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RecordingScreen } from "./RecordingScreen";

describe("RecordingScreen", () => {
  it("shows the formatted timer with a zero-padded minute", () => {
    render(
      <RecordingScreen
        onCancel={vi.fn()}
        onStop={vi.fn()}
        elapsedMs={12000}
        levels={[0.2, 0.5, 0.8]}
      />,
    );
    expect(screen.getByText("00:12")).toBeInTheDocument();
  });

  it("calls onCancel and onStop", async () => {
    const onCancel = vi.fn();
    const onStop = vi.fn();
    render(
      <RecordingScreen
        onCancel={onCancel}
        onStop={onStop}
        elapsedMs={0}
        levels={[]}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel recording" }),
    );
    expect(onCancel).toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Tap to stop" }));
    expect(onStop).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RecordingScreen
        onCancel={vi.fn()}
        onStop={vi.fn()}
        elapsedMs={5000}
        levels={[0.3]}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
