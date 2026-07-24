import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useOnboardingStatus } from "./use-onboarding-status";

let storage: MomentumStorage;

describe("useOnboardingStatus", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-onboarding-status-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("starts in 'checking' before Dexie resolves", () => {
    const { result } = renderHook(() => useOnboardingStatus(), {
      wrapper: ({ children }) => (
        <StorageProvider value={storage}>{children}</StorageProvider>
      ),
    });
    expect(result.current).toBe("checking");
  });

  it("resolves to 'needs-onboarding' when there is no user yet", async () => {
    const { result } = renderHook(() => useOnboardingStatus(), {
      wrapper: ({ children }) => (
        <StorageProvider value={storage}>{children}</StorageProvider>
      ),
    });
    await waitFor(() => expect(result.current).toBe("needs-onboarding"));
  });

  it("resolves to 'needs-onboarding' when a user exists but hasn't finished onboarding", async () => {
    await storage.users.setDisplayName("Rizwan");
    const { result } = renderHook(() => useOnboardingStatus(), {
      wrapper: ({ children }) => (
        <StorageProvider value={storage}>{children}</StorageProvider>
      ),
    });
    await waitFor(() => expect(result.current).toBe("needs-onboarding"));
  });

  it("resolves to 'completed' once onboarding is finished", async () => {
    await storage.users.completeOnboarding();
    const { result } = renderHook(() => useOnboardingStatus(), {
      wrapper: ({ children }) => (
        <StorageProvider value={storage}>{children}</StorageProvider>
      ),
    });
    await waitFor(() => expect(result.current).toBe("completed"));
  });
});
