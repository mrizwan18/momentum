import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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

describe("Home", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-home-page-${Math.random()}`),
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

  it("renders the Dashboard behind the real app providers once onboarding is complete", async () => {
    await storage.users.completeOnboarding();

    render(
      <StorageProvider value={storage}>
        <Home />
      </StorageProvider>,
    );

    await waitFor(
      () =>
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(
      screen.getByRole("button", { name: "Go to practice" }),
    ).toBeInTheDocument();
  });
});
