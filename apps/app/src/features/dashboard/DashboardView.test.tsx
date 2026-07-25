import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { toDateOnly } from "./lib/streak";
import { DashboardView } from "./DashboardView";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

let storage: MomentumStorage;

function renderDashboard() {
  return render(
    <StorageProvider value={storage}>
      <DashboardView />
    </StorageProvider>,
  );
}

/** Lets next/link's own post-mount effects (e.g. prefetch observers) settle. */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("DashboardView", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-dashboard-view-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
    useActiveSessionStore.setState({ activeSessionId: null });
    localStorage.clear();
  });

  it("shows a loading skeleton before Dexie resolves", async () => {
    renderDashboard();
    // role="status" doesn't take its accessible *name* from content per the
    // accname spec, but the live region's content is still announced —
    // check for both independently.
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading dashboard")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
    );
  });

  it("renders every dashboard.md section once real data has loaded", async () => {
    renderDashboard();

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
    );

    for (const title of ["Current Streak", "Quick Practice"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    expect(
      screen.getByRole("button", { name: "Go to practice" }),
    ).toBeInTheDocument();
  });

  it("reflects a real streak written through the repository pattern", async () => {
    const today = new Date();
    for (let i = 0; i < 3; i += 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await storage.statistics.upsertForDate({
        date: toDateOnly(date),
        practiceMinutes: 10,
        sessionsCompleted: 1,
      });
    }

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByTestId("streak-current")).toHaveTextContent("3"),
    );
    expect(screen.getByText("Longest: 3")).toBeInTheDocument();
    await flush();
  });

  it("has no accessibility violations once loaded", async () => {
    const { container } = renderDashboard();
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    await flush();
  });
});
