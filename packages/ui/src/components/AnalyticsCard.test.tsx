import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Activity } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

describe("AnalyticsCard", () => {
  it("renders the label, value, and caption", () => {
    render(
      <AnalyticsCard
        icon={<Activity />}
        label="Consistency"
        value="85%"
        caption="This Month"
        progress={85}
        ringLabel="Consistency this month"
      />,
    );
    expect(screen.getByText("Consistency")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("This Month")).toBeInTheDocument();
  });

  it("exposes the ring's own accessible name and value, distinct from the card label", () => {
    render(
      <AnalyticsCard
        label="Progress"
        value="12,430"
        progress={62}
        ringLabel="Steps progress today"
        ringContent={<span>62%</span>}
      />,
    );
    const ring = screen.getByRole("progressbar", {
      name: "Steps progress today",
    });
    expect(ring).toHaveAttribute("aria-valuenow", "62");
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("renders an indeterminate ring when progress is omitted", () => {
    render(
      <AnalyticsCard
        label="Progress"
        value="--"
        ringLabel="Loading progress"
      />,
    );
    expect(
      screen.getByRole("progressbar", { name: "Loading progress" }),
    ).not.toHaveAttribute("aria-valuenow");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AnalyticsCard
        icon={<Activity />}
        label="Consistency"
        value="85%"
        progress={85}
        ringLabel="Consistency this month"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
