import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOnboardingFlow } from "./use-onboarding-flow";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("useOnboardingFlow", () => {
  it("starts on splash", () => {
    const { result } = renderHook(() => useOnboardingFlow());
    expect(result.current.step).toBe("splash");
    expect(result.current.canGoBack).toBe(false);
  });

  it("walks forward through every step in order", () => {
    const { result } = renderHook(() => useOnboardingFlow());
    const expected = [
      "intro1",
      "intro2",
      "intro3",
      "intro4",
      "form",
      "captureIntro",
      "recordingReady",
      "recording",
      "uploading",
      "analyzing",
      "result",
    ];
    for (const step of expected) {
      act(() => result.current.next());
      expect(result.current.step).toBe(step);
    }
  });

  it("navigates to / instead of advancing past the last step", () => {
    const { result } = renderHook(() => useOnboardingFlow());
    for (let i = 0; i < 11; i += 1) {
      act(() => result.current.next());
    }
    expect(result.current.step).toBe("result");
    act(() => result.current.next());
    expect(push).toHaveBeenCalledWith("/");
    expect(result.current.step).toBe("result");
  });

  it("goes back a step, and no-ops at the start", () => {
    const { result } = renderHook(() => useOnboardingFlow());
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.step).toBe("intro2");
    act(() => result.current.back());
    expect(result.current.step).toBe("intro1");
    act(() => result.current.back());
    act(() => result.current.back());
    expect(result.current.step).toBe("splash");
    expect(result.current.canGoBack).toBe(false);
  });
});
