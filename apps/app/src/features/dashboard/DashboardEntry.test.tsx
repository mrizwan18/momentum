import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { DashboardEntry } from "./DashboardEntry";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/",
}));

let storage: MomentumStorage;

const dashboardInsightResponseData = {
  todaysFocus: "Breath control",
  dailyInsight: "You've been consistent this week.",
  motivationalMessage: "Keep it up!",
  practiceRecommendation: "Try the breathing exercises",
  estimatedImprovementPercent: 5,
  suggestedSessionLengthMinutes: 15,
  recoveryAdvice: null,
};

describe("DashboardEntry", () => {
  beforeEach(() => {
    replace.mockClear();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-dashboard-entry-${Math.random()}`),
    );
    // DashboardView kicks off a real AI Gateway call in the background —
    // mocked here so it resolves quickly and deterministically.
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              data: dashboardInsightResponseData,
              provider: "mock",
            }),
            { status: 200 },
          ),
        ),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("redirects to /onboarding when onboarding hasn't been completed", async () => {
    render(
      <StorageProvider value={storage}>
        <DashboardEntry />
      </StorageProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding"));
  });

  it("renders the Dashboard without redirecting once onboarding is completed", async () => {
    await storage.users.completeOnboarding();

    render(
      <StorageProvider value={storage}>
        <DashboardEntry />
      </StorageProvider>,
    );

    await waitFor(
      () =>
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
