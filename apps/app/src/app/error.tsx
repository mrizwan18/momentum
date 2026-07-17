"use client";

import * as React from "react";
import { Button } from "@momentum/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-sm text-foreground-muted">
        Nothing has been lost. Your practice data stays on this device.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
