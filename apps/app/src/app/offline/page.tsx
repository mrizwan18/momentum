export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        You&apos;re offline
      </h1>
      <p className="max-w-sm text-foreground-muted">
        Momentum works offline, but this screen hasn&apos;t been saved to your
        device yet. Reconnect and try again.
      </p>
    </main>
  );
}
