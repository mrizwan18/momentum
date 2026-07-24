import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RecordingReadyScreen } from "./RecordingReadyScreen";

describe("RecordingReadyScreen", () => {
  it("shows the recording tips", () => {
    render(
      <RecordingReadyScreen
        onBack={vi.fn()}
        onStartRecording={vi.fn().mockResolvedValue(true)}
        permissionDenied={false}
      />,
    );
    expect(screen.getByText("10 – 15 seconds")).toBeInTheDocument();
    expect(screen.getByText("Use a quiet place")).toBeInTheDocument();
    expect(screen.getByText("Just be yourself")).toBeInTheDocument();
  });

  it("calls onStartRecording when the mic button is tapped", async () => {
    const onStartRecording = vi.fn().mockResolvedValue(true);
    render(
      <RecordingReadyScreen
        onBack={vi.fn()}
        onStartRecording={onStartRecording}
        permissionDenied={false}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Tap to start recording" }),
    );
    expect(onStartRecording).toHaveBeenCalled();
  });

  it("shows a permission-denied error state", () => {
    render(
      <RecordingReadyScreen
        onBack={vi.fn()}
        onStartRecording={vi.fn()}
        permissionDenied
      />,
    );
    expect(screen.getByText("Microphone access denied")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RecordingReadyScreen
        onBack={vi.fn()}
        onStartRecording={vi.fn().mockResolvedValue(true)}
        permissionDenied={false}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
