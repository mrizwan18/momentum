import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PracticeEnded } from "./PracticeEnded";

describe("PracticeEnded", () => {
  it("reassures the user after a cancelled session", () => {
    render(<PracticeEnded />);
    expect(screen.getByText("Session ended")).toBeInTheDocument();
  });

  it("links back to the dashboard", () => {
    render(<PracticeEnded />);
    expect(
      screen.getByRole("link", { name: "Back to Dashboard" }),
    ).toHaveAttribute("href", "/");
  });
});
