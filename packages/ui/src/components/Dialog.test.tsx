import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { Button } from "./Button";

function ExampleDialog(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>
        <Button>Delete recording</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this recording?</DialogTitle>
          <DialogDescription>This can&apos;t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("is closed by default", () => {
    render(<ExampleDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens when the trigger is clicked and shows title/description", async () => {
    render(<ExampleDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete recording" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete this recording?")).toBeInTheDocument();
  });

  it("closes when the close control is clicked", async () => {
    render(<ExampleDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete recording" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // The exit animation keeps the dialog mounted briefly, so wait it out.
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on Escape", async () => {
    render(<ExampleDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete recording" }),
    );
    await userEvent.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("notifies onOpenChange", async () => {
    const onOpenChange = vi.fn();
    render(<ExampleDialog onOpenChange={onOpenChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete recording" }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("has no accessibility violations when open", async () => {
    render(<ExampleDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete recording" }),
    );
    const results = await axe(screen.getByRole("dialog"));
    expect(results).toHaveNoViolations();
  });
});
