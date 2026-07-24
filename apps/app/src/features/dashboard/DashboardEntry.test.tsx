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
}));

let storage: MomentumStorage;

describe("DashboardEntry", () => {
  beforeEach(() => {
    replace.mockClear();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-dashboard-entry-${Math.random()}`),
    );
  });

  afterEach(async () => {
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
