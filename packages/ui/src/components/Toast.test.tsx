import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Toaster } from "./Toast";
import { dismissAll, toast } from "../hooks/use-toast";

describe("Toaster", () => {
  afterEach(() => {
    act(() => {
      dismissAll();
    });
  });

  it("renders nothing when there are no toasts", () => {
    const { container } = render(<Toaster />);
    expect(container.querySelectorAll("li")).toHaveLength(0);
  });

  it("shows a toast's title and description", () => {
    render(<Toaster />);
    act(() => {
      toast({
        title: "Recording saved",
        description: "It's in your Voice Timeline.",
      });
    });

    expect(screen.getByText("Recording saved")).toBeInTheDocument();
    expect(
      screen.getByText("It's in your Voice Timeline."),
    ).toBeInTheDocument();
  });

  it("calls onAction when the action button is pressed", async () => {
    const onAction = vi.fn();
    render(<Toaster />);
    act(() => {
      toast({ title: "Session interrupted", actionLabel: "Resume", onAction });
    });

    await userEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("disables the action while loading", () => {
    render(<Toaster />);
    act(() => {
      toast({
        title: "Saving…",
        actionLabel: "Cancel",
        onAction: vi.fn(),
        loading: true,
      });
    });

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("removes the toast when its close control is clicked", async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Recording saved" });
    });

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Recording saved")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    render(<Toaster />);
    act(() => {
      toast({
        title: "Recording saved",
        description: "It's in your Voice Timeline.",
      });
    });

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
