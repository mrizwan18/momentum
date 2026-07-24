import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { OnboardingEntry } from "./OnboardingEntry";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

let storage: MomentumStorage;

describe("OnboardingEntry", () => {
  beforeEach(() => {
    replace.mockClear();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-onboarding-entry-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("renders the onboarding flow when it hasn't been completed", async () => {
    render(
      <StorageProvider value={storage}>
        <OnboardingEntry />
      </StorageProvider>,
    );

    await waitFor(
      () => expect(screen.getByText("Momentum")).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to / instead of restarting an already-completed onboarding", async () => {
    await storage.users.completeOnboarding();

    render(
      <StorageProvider value={storage}>
        <OnboardingEntry />
      </StorageProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Momentum")).not.toBeInTheDocument();
  });
});
