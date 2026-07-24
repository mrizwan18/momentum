import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePwaInstall } from "./use-pwa-install";

function mockStandalone(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList);
}

function makeBeforeInstallPromptEvent(outcome: "accepted" | "dismissed") {
  const event = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string; platform: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome, platform: "web" });
  return event;
}

describe("usePwaInstall", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts 'unavailable' when the browser hasn't offered an install yet", () => {
    mockStandalone(false);
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.status).toBe("unavailable");
  });

  it("starts 'installed' when already running standalone", () => {
    mockStandalone(true);
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.status).toBe("installed");
  });

  it("becomes 'available' once the browser fires beforeinstallprompt", () => {
    mockStandalone(false);
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("accepted"));
    });

    expect(result.current.status).toBe("available");
  });

  it("becomes 'installed' after a successful promptInstall", async () => {
    mockStandalone(false);
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("accepted"));
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe("accepted");
    expect(result.current.status).toBe("installed");
  });

  it("stays 'unavailable' after the user dismisses the native prompt", async () => {
    mockStandalone(false);
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("dismissed"));
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe("dismissed");
    expect(result.current.status).toBe("unavailable");
  });

  it("becomes 'installed' when the appinstalled event fires directly", () => {
    mockStandalone(false);
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.status).toBe("installed");
  });

  it("resolves 'unavailable' when promptInstall is called with nothing captured", async () => {
    mockStandalone(false);
    const { result } = renderHook(() => usePwaInstall());

    let outcome;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe("unavailable");
  });
});
