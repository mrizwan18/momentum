import { Blob as NodeBlob } from "node:buffer";

/**
 * jsdom's Blob doesn't survive `structuredClone` (which fake-indexeddb uses
 * internally to simulate IndexedDB's structured clone algorithm) — every
 * stored Blob silently comes back as `{}`. Node's native Blob clones
 * correctly, so swap it in before fake-indexeddb ever touches it. Must be
 * imported before "fake-indexeddb/auto" in tests/setup.ts.
 */
globalThis.Blob = NodeBlob as unknown as typeof Blob;
