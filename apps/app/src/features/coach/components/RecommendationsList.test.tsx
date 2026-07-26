import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { RecommendationsList } from "./RecommendationsList";

describe("RecommendationsList", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(<RecommendationsList items={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an empty array", () => {
    const { container } = render(<RecommendationsList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every recommendation", () => {
    render(
      <RecommendationsList
        items={[
          "Practice Meend for 10 minutes daily.",
          "Try slow Taan patterns.",
        ]}
      />,
    );
    expect(
      screen.getByText("Practice Meend for 10 minutes daily."),
    ).toBeInTheDocument();
    expect(screen.getByText("Try slow Taan patterns.")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RecommendationsList items={["Practice Meend for 10 minutes daily."]} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
