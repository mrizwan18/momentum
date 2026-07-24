import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Target } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";

describe("RecommendationCard", () => {
  it("renders its body copy", () => {
    render(
      <RecommendationCard icon={<Target />}>
        Practice Meend for 10 minutes daily to improve voice control.
      </RecommendationCard>,
    );
    expect(
      screen.getByText(/Practice Meend for 10 minutes/),
    ).toBeInTheDocument();
  });

  it("renders without a trailing action when onAction is omitted", () => {
    render(
      <RecommendationCard icon={<Target />}>Try this.</RecommendationCard>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onAction when the chevron button is pressed", async () => {
    const onAction = vi.fn();
    render(
      <RecommendationCard
        icon={<Target />}
        onAction={onAction}
        actionLabel="View Meend recommendation"
      >
        Try this.
      </RecommendationCard>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "View Meend recommendation" }),
    );
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RecommendationCard
        icon={<Target />}
        onAction={vi.fn()}
        actionLabel="View recommendation"
      >
        Try this.
      </RecommendationCard>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
