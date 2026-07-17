import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Running many chromium workers concurrently against a single local
  // `next start` in this environment causes goto() to hang indefinitely;
  // serial execution is reliable and the suite is small enough not to mind.
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // A production build is required so the PWA service worker actually
    // registers (@ducanh2912/next-pwa is disabled in `next dev`) — the
    // offline-first e2e test depends on it being active.
    command: "pnpm --filter app build && pnpm --filter app start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
