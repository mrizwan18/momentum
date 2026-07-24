import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PracticeHeader } from "./PracticeHeader";

describe("PracticeHeader", () => {
  it("shows the Practice title and the given subtitle", () => {
    render(<PracticeHeader subtitle="Riyaaz" onExitRequest={vi.fn()} />);

    expect(screen.getByText("Practice")).toBeInTheDocument();
    expect(screen.getByText("Riyaaz")).toBeInTheDocument();
  });

  it("calls onExitRequest when the back button is clicked", async () => {
    const onExitRequest = vi.fn();
    render(<PracticeHeader subtitle="Riyaaz" onExitRequest={onExitRequest} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Exit practice" }),
    );
    expect(onExitRequest).toHaveBeenCalled();
  });

  it("renders a disabled, decorative overflow button", () => {
    render(<PracticeHeader subtitle="Riyaaz" onExitRequest={vi.fn()} />);

    expect(screen.getByRole("button", { name: "More options" })).toBeDisabled();
  });
});
