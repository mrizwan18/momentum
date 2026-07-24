/**
 * Thin wrapper over the Vibration API. Most desktop browsers and iOS Safari
 * don't implement `navigator.vibrate` at all — this is a capability check,
 * not a feature flag, so calling it anywhere is always safe as a no-op.
 */
export type HapticPattern = "tap" | "success" | "warning";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [10, 40, 20],
  warning: 25,
};

export function triggerHaptic(pattern: HapticPattern = "tap"): void {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  ) {
    return;
  }
  navigator.vibrate(PATTERNS[pattern]);
}
