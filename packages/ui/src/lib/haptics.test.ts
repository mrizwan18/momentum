import { afterEach, describe, expect, it, vi } from "vitest";
import { triggerHaptic } from "./haptics";

describe("triggerHaptic", () => {
  afterEach(() => {
    // @ts-expect-error -- test-only cleanup of a property we defined below
    delete navigator.vibrate;
  });

  it("does nothing when the Vibration API is unavailable", () => {
    expect(() => triggerHaptic()).not.toThrow();
  });

  it("calls navigator.vibrate with the pattern for the given type", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrate,
      configurable: true,
    });

    triggerHaptic("tap");
    expect(vibrate).toHaveBeenCalledWith(10);

    triggerHaptic("success");
    expect(vibrate).toHaveBeenCalledWith([10, 40, 20]);

    triggerHaptic("warning");
    expect(vibrate).toHaveBeenCalledWith(25);
  });

  it("defaults to the tap pattern", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrate,
      configurable: true,
    });

    triggerHaptic();
    expect(vibrate).toHaveBeenCalledWith(10);
  });
});
