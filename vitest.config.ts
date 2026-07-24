import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
      "apps/*/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/src/**/*.{test,spec}.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/app/src"),
      "@momentum/ui": path.resolve(__dirname, "./packages/ui/src"),
      "@momentum/engine": path.resolve(__dirname, "./packages/engine/src"),
      "@momentum/storage": path.resolve(__dirname, "./packages/storage/src"),
      "@momentum/types": path.resolve(__dirname, "./packages/types/src"),
      "@momentum/utils": path.resolve(__dirname, "./packages/utils/src"),
      "@test-utils": path.resolve(__dirname, "./tests"),
    },
  },
});
