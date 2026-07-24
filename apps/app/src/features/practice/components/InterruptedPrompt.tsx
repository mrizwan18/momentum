"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@momentum/ui";

export interface InterruptedPromptProps {
  open: boolean;
  onResume: () => void;
  onDiscard: () => void;
  discardLoading?: boolean;
}

/**
 * Shown only when a session was left `in_progress` on a prior visit — the
 * tab closed, refreshed, or crashed without the user pausing first.
 */
export function InterruptedPrompt({
  open,
  onResume,
  onDiscard,
  discardLoading = false,
}: InterruptedPromptProps) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick up where you left off?</DialogTitle>
          <DialogDescription>
            We found a practice session that didn&apos;t get closed properly.
            Nothing was lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onDiscard}
            loading={discardLoading}
          >
            Discard session
          </Button>
          <Button onClick={onResume} disabled={discardLoading}>
            Resume practice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
