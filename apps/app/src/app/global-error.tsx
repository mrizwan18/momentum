"use client";

/**
 * Catches errors thrown by the root layout itself. Next.js requires this
 * file to render its own <html>/<body> and forbids relying on providers or
 * Tailwind, since the layout that supplies them may be what failed.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1>Momentum hit a snag</h1>
          <p>Nothing has been lost. Please reload the app.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
