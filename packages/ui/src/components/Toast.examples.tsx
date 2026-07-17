"use client";

import { Button } from "./Button";
import { Cluster } from "./Stack";
import { Toaster } from "./Toast";
import { toast } from "../hooks/use-toast";

export default function ToastExamples() {
  return (
    <Cluster gap="sm">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Recording saved",
            description: "It's in your Voice Timeline.",
            variant: "success",
          })
        }
      >
        Show success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Session interrupted",
            description: "You can resume right where you left off.",
            actionLabel: "Resume",
            onAction: () => {},
          })
        }
      >
        Show toast with action
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "We couldn't save that recording",
            description: "Nothing has been lost.",
            variant: "danger",
          })
        }
      >
        Show error toast
      </Button>
      <Toaster />
    </Cluster>
  );
}
