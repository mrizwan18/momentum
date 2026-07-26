import "server-only";

/** FNV-1a — a fast, dependency-free string hash used to seed the mock provider's PRNG. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — a tiny deterministic PRNG so the Mock provider's output is reproducible for the same input, never truly random. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

export function scoreInRange(
  random: () => number,
  base: number,
  spread: number,
): number {
  return Math.min(100, Math.max(0, Math.round(base + random() * spread)));
}
