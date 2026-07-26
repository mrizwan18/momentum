import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { PracticeView } from "./PracticeView";

let storage: MomentumStorage;

/** Lets next/link's own post-mount effects (e.g. prefetch observers) settle. */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function renderPractice() {
  return render(
    <StorageProvider value={storage}>
      <PracticeView />
    </StorageProvider>,
  );
}

describe("PracticeView", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-practice-view-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
    useActiveSessionStore.setState({ activeSessionId: null });
    localStorage.clear();
  });

  it("shows a loading skeleton before Dexie resolves", async () => {
    renderPractice();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading practice")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Daily Practice")).toBeInTheDocument(),
    );
  });

  it("shows the plan overview and a Start Practice action once loaded", async () => {
    renderPractice();

    await waitFor(() =>
      expect(screen.getByText("Daily Practice")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Start Practice" }),
    ).toBeInTheDocument();
  });

  it("walks the full happy path: start, choose voice condition, complete every exercise, reach the summary", async () => {
    const user = userEvent.setup();
    renderPractice();

    await waitFor(() =>
      expect(screen.getByText("Daily Practice")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Start Practice" }));
    await waitFor(() =>
      expect(screen.getByText("How's your voice today?")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Normal" }));

    await waitFor(() =>
      expect(
        screen.getByRole("progressbar", { name: "Session progress" }),
      ).toBeInTheDocument(),
    );

    for (let i = 0; i < 7; i += 1) {
      const completeButton = await screen.findByRole("button", {
        name: /Finish Exercise/i,
      });
      await user.click(completeButton);
      // The button disables while the completion round-trips through Dexie;
      // wait for it to either settle (next exercise, re-enabled) or
      // disappear entirely (final exercise -> session complete) before
      // searching for the next one, so a still-pending click never gets
      // silently swallowed by userEvent skipping a disabled element.
      await waitFor(() => {
        const button = screen.queryByRole("button", {
          name: /Finish Exercise/i,
        });
        if (button) {
          expect(button).not.toBeDisabled();
        }
      });
    }

    await waitFor(() =>
      expect(screen.getByText("Session complete")).toBeInTheDocument(),
    );

    const [completedSession] = await storage.db.sessions.toArray();
    const attempts = await storage.exerciseAttempts.listBySession(
      completedSession.id,
    );
    expect(attempts).toHaveLength(7);
    await flush();
  });

  it("offers to resume or discard a session left in_progress from a prior visit", async () => {
    const session = await storage.sessions.start(["breathing", "warmup"]);
    const user = userEvent.setup();

    renderPractice();

    await waitFor(() =>
      expect(
        screen.getByText("Pick up where you left off?"),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Resume practice" }));

    await waitFor(() =>
      expect(
        screen.getByRole("progressbar", { name: "Session progress" }),
      ).toBeInTheDocument(),
    );
    await expect(storage.sessions.getActive()).resolves.toMatchObject({
      id: session.id,
      status: "in_progress",
    });
  });

  it("discards an interrupted session without resuming it", async () => {
    await storage.sessions.start(["breathing", "warmup"]);
    const user = userEvent.setup();

    renderPractice();

    await waitFor(() =>
      expect(
        screen.getByText("Pick up where you left off?"),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Discard session" }));

    await waitFor(() =>
      expect(screen.getByText("Session ended")).toBeInTheDocument(),
    );
    await expect(storage.sessions.getActive()).resolves.toBeUndefined();
    await flush();
  });

  it("ends a practicing session from the exit dialog", async () => {
    const user = userEvent.setup();
    renderPractice();

    await waitFor(() =>
      expect(screen.getByText("Daily Practice")).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Start Practice" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Fresh" })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Fresh" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Exit practice" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Exit practice" }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "End session" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Session ended")).toBeInTheDocument(),
    );
    await expect(storage.sessions.getActive()).resolves.toBeUndefined();
    await flush();
  });

  it("has no accessibility violations on the idle screen", async () => {
    const { container } = renderPractice();
    await waitFor(() =>
      expect(screen.getByText("Daily Practice")).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
