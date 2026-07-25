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

describe("Home", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-home-page-${Math.random()}`),
    );
  });

  afterEach(async () => {
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
