import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { CoachEntry } from "./CoachEntry";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
  usePathname: () => "/coach",
}));

let storage: MomentumStorage;

const coachReplyResponseData = {
  message: "You've practiced 3 days in a row. Keep focusing on breath control.",
  suggestedExercises: ["Practice slow diaphragmatic breathing for 5 minutes."],
};

describe("CoachEntry", () => {
  beforeEach(() => {
    replace.mockClear();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-coach-entry-${Math.random()}`),
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ data: coachReplyResponseData, provider: "mock" }),
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
        <CoachEntry />
      </StorageProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding"));
  });

  it("renders the Coach screen without redirecting once onboarding is completed", async () => {
    await storage.users.completeOnboarding();

    render(
      <StorageProvider value={storage}>
        <CoachEntry />
      </StorageProvider>,
    );

    await waitFor(
      () => expect(screen.getByText("AI Coach")).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
