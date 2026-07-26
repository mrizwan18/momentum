import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { PersonalizedInsightCard } from "./PersonalizedInsightCard";

describe("PersonalizedInsightCard", () => {
  it("shows a preparing message while loading", () => {
    render(<PersonalizedInsightCard status="loading" message={null} />);
    expect(screen.getByText("Preparing your insight…")).toBeInTheDocument();
  });

  it("shows the real message once ready", () => {
    render(
      <PersonalizedInsightCard
        status="ready"
        message="Your pitch accuracy is improving."
      />,
    );
    expect(
      screen.getByText("Your pitch accuracy is improving."),
    ).toBeInTheDocument();
  });

  it("shows the fallback message too", () => {
    render(
      <PersonalizedInsightCard
        status="fallback"
        message="Welcome back. A short practice today is enough."
      />,
    );
    expect(
      screen.getByText("Welcome back. A short practice today is enough."),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PersonalizedInsightCard status="ready" message="Great progress!" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
