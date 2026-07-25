/**
 * Custom service-worker additions, bundled into the generated Workbox SW
 * via next-pwa's `customWorkerSrc` convention (this file is picked up
 * automatically — no config needed, see @ducanh2912/next-pwa's default
 * `customWorkerSrc: "worker"`). Plain JS on purpose: it runs in
 * ServiceWorkerGlobalScope, which the app's own tsconfig (DOM lib) doesn't
 * type — keeping this out of `**\/*.ts` sidesteps that mismatch entirely.
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { title, body, notificationId } = payload;
  if (!title) return;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { notificationId },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notificationId = event.notification.data?.notificationId;

  event.waitUntil(
    (async () => {
      if (notificationId) {
        try {
          await fetch("/api/push/click", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ notificationId }),
          });
        } catch {
          // Best-effort click tracking — must never block opening the app.
        }
      }

      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = allClients.find((client) => "focus" in client);
      if (existing) {
        await existing.focus();
      } else {
        await self.clients.openWindow("/");
      }
    })(),
  );
});

// Marks this file as an ES module (no runtime effect) so TypeScript allows
// `import("./index.js")` from index.test.ts.
export {};
