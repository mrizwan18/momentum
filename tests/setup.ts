import "./blob-polyfill";
import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Pointer Events capture API. Radix primitives
// (Toast, Dialog swipe handling, etc.) call these on pointerdown/up.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom doesn't implement Object URLs at all. A simple in-memory registry is
// enough for tests — nothing here needs the URL to actually resolve over the
// network, just to exist and be revocable (e.g. recording playback previews).
if (!URL.createObjectURL) {
  const registry = new Map<string, Blob>();
  let nextId = 0;
  URL.createObjectURL = (blob: Blob) => {
    const url = `blob:mock/${nextId++}`;
    registry.set(url, blob);
    return url;
  };
  URL.revokeObjectURL = (url: string) => {
    registry.delete(url);
  };
}

// jsdom doesn't implement ResizeObserver. Recharts' ResponsiveContainer
// (Progress feature's charts) needs it just to exist — jsdom's 0x0 layout
// means charts render empty, but that's a jsdom limitation, not a bug.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
