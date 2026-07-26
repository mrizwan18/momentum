// Vitest alias target for the "server-only" package (see vitest.config.ts).
// That package unconditionally throws unless Next.js's own bundler resolves
// its "react-server" condition — Vitest never does, so every src/ai/*
// file guarded with `import "server-only"` would otherwise fail to import
// in tests. This shim is a no-op; the real guard still applies in the
// actual Next.js production/client build, which never sees this file.
export {};
