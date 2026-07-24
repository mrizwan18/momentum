"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from "@momentum/ui";

export interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

/**
 * docs/design/references/practice.png's bottom "Notes" pill opens this
 * instead of an always-visible inline textarea — same autosaved
 * `notesDraft` state ActivePracticeScreen already owned, just presented on
 * demand rather than taking permanent space on the exercise card.
 */
export function NotesDialog({
  open,
  onOpenChange,
  notes,
  onNotesChange,
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exercise-notes" className="sr-only">
            Notes
          </Label>
          <textarea
            id="exercise-notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={5}
            placeholder="How did this feel?"
            autoFocus
            className="flex w-full rounded-control border border-border bg-surface p-3 text-sm text-foreground transition-colors duration-fast ease-momentum placeholder:text-foreground-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
