import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Greeting } from "./Greeting";

describe("Greeting", () => {
  it("shows a status-appropriate subtitle", () => {
    render(<Greeting status="streak-active" />);
    expect(screen.getByText(/keep your streak alive/i)).toBeInTheDocument();
  });

  it("shows the first-practice subtitle for new users", () => {
    render(<Greeting status="new" />);
    expect(screen.getByText(/first practice/i)).toBeInTheDocument();
  });

  it("shows the recovery subtitle once a streak has lapsed", () => {
    render(<Greeting status="recovery" />);
    expect(
      screen.getByText(/recovery sessions count too/i),
    ).toBeInTheDocument();
  });
});
