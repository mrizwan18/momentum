import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { ProgressEntry } from "./ProgressEntry";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
  usePathname: () => "/progress",
}));

let storage: MomentumStorage;

describe("ProgressEntry", () => {
  beforeEach(() => {
    replace.mockClear();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-progress-entry-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("redirects to /onboarding when onboarding hasn't been completed", async () => {
    render(
      <StorageProvider value={storage}>
        <ProgressEntry />
      </StorageProvider>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding"));
  });

  it("renders Progress without redirecting once onboarding is completed", async () => {
    await storage.users.completeOnboarding();

    render(
      <StorageProvider value={storage}>
        <ProgressEntry />
      </StorageProvider>,
    );

    await waitFor(
      () => expect(screen.getByText("Progress")).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
