"use client";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Stack } from "./Stack";

export default function EmptyStateExamples() {
  return (
    <Stack gap="lg">
      <EmptyState
        title="No recordings yet"
        description="Your first recording becomes the beginning of your Voice Timeline."
        actionLabel="Record Today"
        onAction={() => {}}
      />
      <ErrorState
        title="We couldn't save that recording"
        description="Nothing has been lost. Try again."
        onAction={() => {}}
      />
    </Stack>
  );
}
