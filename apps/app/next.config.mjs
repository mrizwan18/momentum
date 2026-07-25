import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  // Default customWorkerSrc ("worker") resolves relative to the project
  // root, not src/ — without this the push/notificationclick handlers in
  // src/worker/index.js silently never get bundled into the generated sw.js.
  customWorkerSrc: "src/worker",
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@momentum/ui",
    "@momentum/engine",
    "@momentum/storage",
    "@momentum/types",
    "@momentum/utils",
  ],
};

export default withPWA(nextConfig);
