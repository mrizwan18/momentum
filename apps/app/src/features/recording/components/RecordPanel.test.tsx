import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import {
  installMediaRecorderMock,
  uninstallMediaRecorderMock,
  type MediaRecorderMockHandle,
} from "@test-utils/media-recorder-mock";
import { RecordPanel } from "./RecordPanel";

let storage: MomentumStorage;
let mock: MediaRecorderMockHandle;

function renderPanel(
  sessionId = "session-1",
  exerciseId: string | null = null,
) {
  return render(
    <StorageProvider value={storage}>
      <RecordPanel sessionId={sessionId} exerciseId={exerciseId} />
    </StorageProvider>,
  );
}

describe("RecordPanel", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-record-panel-${Math.random()}`),
    );
    mock = installMediaRecorderMock();
  });

  afterEach(async () => {
    vi.useRealTimers();
    uninstallMediaRecorderMock();
    await storage.db.delete();
  });

  it("starts with a prompt to enable the microphone", () => {
    renderPanel();
    expect(screen.getByText("Record this exercise")).toBeInTheDocument();
  });

  it("shows a denial message and lets the user retry", async () => {
    const user = userEvent.setup();
    mock.failNextGetUserMedia("NotAllowedError");
    renderPanel();

    await user.click(
      screen.getByRole("button", { name: /enable microphone/i }),
    );
    expect(
      await screen.findByText("Microphone access denied"),
    ).toBeInTheDocument();

    mock.clearGetUserMediaFailure();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(
      await screen.findByRole("button", { name: /start recording/i }),
    ).toBeInTheDocument();
  });

  it("walks record -> stop -> save end to end and persists via the repository", async () => {
    const user = userEvent.setup();
    renderPanel("session-99");

    await user.click(
      screen.getByRole("button", { name: /enable microphone/i }),
    );
    const startButton = await screen.findByRole("button", {
      name: /start recording/i,
    });

    // fireEvent (not userEvent) from here on — userEvent's own internal
    // scheduling doesn't play well with fake timers, even with delay:null.
    // Fake timers are installed before the click so the countdown's
    // setInterval is registered under them (real-timer intervals are
    // invisible to vi.advanceTimersByTime after the fact).
    vi.useFakeTimers();
    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const stopButton = screen.getByRole("button", { name: "Stop recording" });

    await act(async () => {
      fireEvent.click(stopButton);
    });
    expect(screen.getByLabelText("Title")).toBeInTheDocument();

    // fake-indexeddb needs real timers to resolve its internal scheduling.
    vi.useRealTimers();
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText("Recording saved")).toBeInTheDocument();
    await expect(
      storage.recordings.listBySession("session-99"),
    ).resolves.toHaveLength(1);
  });

  it("discarding never persists a repository row", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(
      screen.getByRole("button", { name: /enable microphone/i }),
    );
    const startButton = await screen.findByRole("button", {
      name: /start recording/i,
    });

    vi.useFakeTimers();
    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const cancelButton = screen.getByRole("button", {
      name: "Cancel recording",
    });
    act(() => {
      fireEvent.click(cancelButton);
    });
    expect(
      screen.getByRole("button", { name: /start recording/i }),
    ).toBeInTheDocument();

    vi.useRealTimers();
    await expect(storage.recordings.list()).resolves.toHaveLength(0);
  });

  it("has no accessibility violations in the idle state", async () => {
    const { container } = renderPanel();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
