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

export interface ExitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPauseAndExit: () => void;
  onEndSession: () => void;
  endLoading?: boolean;
}

/** docs/features/practice.md Practice Header: leaving prompts Resume later / End session / Cancel. */
export function ExitConfirmDialog({
  open,
  onOpenChange,
  onPauseAndExit,
  onEndSession,
  endLoading = false,
}: ExitConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave this practice session?</DialogTitle>
          <DialogDescription>
            You can resume later exactly where you left off, or end the session
            now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={endLoading}
          >
            Keep practicing
          </Button>
          <Button
            variant="secondary"
            onClick={onPauseAndExit}
            disabled={endLoading}
          >
            Resume later
          </Button>
          <Button variant="danger" onClick={onEndSession} loading={endLoading}>
            End session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
