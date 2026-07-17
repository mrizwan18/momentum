/**
 * jsdom/older browsers may not implement crypto.randomUUID, so fall back to
 * a timestamp + random suffix that is still unique enough for local ids.
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${random}`;
}
