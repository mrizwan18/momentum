import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesDialog } from "./NotesDialog";

describe("NotesDialog", () => {
  it("renders nothing when closed", () => {
    render(
      <NotesDialog
        open={false}
        onOpenChange={vi.fn()}
        notes=""
        onNotesChange={vi.fn()}
      />,
    );
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();
  });

  it("shows the current notes value when open", () => {
    render(
      <NotesDialog
        open
        onOpenChange={vi.fn()}
        notes="felt great"
        onNotesChange={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("felt great")).toBeInTheDocument();
  });

  it("calls onNotesChange as the user types", async () => {
    const onNotesChange = vi.fn();
    render(
      <NotesDialog
        open
        onOpenChange={vi.fn()}
        notes=""
        onNotesChange={onNotesChange}
      />,
    );
    await userEvent.type(screen.getByRole("textbox"), "hi");
    expect(onNotesChange).toHaveBeenCalledTimes(2);
  });

  it("calls onOpenChange(false) when Done is clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <NotesDialog
        open
        onOpenChange={onOpenChange}
        notes=""
        onNotesChange={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
