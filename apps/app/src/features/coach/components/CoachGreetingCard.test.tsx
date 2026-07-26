import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { CoachGreetingCard } from "./CoachGreetingCard";

describe("CoachGreetingCard", () => {
  it("greets the user by name", () => {
    render(<CoachGreetingCard displayName="Riyaaz" streakCurrent={3} />);
    expect(screen.getByText("Hi Riyaaz! 👋")).toBeInTheDocument();
    expect(screen.getByText(/3 days in a row/)).toBeInTheDocument();
  });

  it("greets generically without a name", () => {
    render(<CoachGreetingCard displayName={null} streakCurrent={0} />);
    expect(screen.getByText("Hi! 👋")).toBeInTheDocument();
    expect(screen.getByText(/Every session counts/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CoachGreetingCard displayName="Riyaaz" streakCurrent={3} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
