import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DashboardHeader } from "./DashboardHeader";

describe("DashboardHeader", () => {
  it("shows the display name as the page heading", () => {
    render(<DashboardHeader displayName="Riyaaz Singer" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Riyaaz Singer" }),
    ).toBeInTheDocument();
  });

  it("falls back to a generic welcome when no display name is set", () => {
    render(<DashboardHeader displayName={null} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome" }),
    ).toBeInTheDocument();
  });

  it("disables the notifications button — no notification system exists yet", () => {
    render(<DashboardHeader displayName="Riyaaz Singer" />);
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <DashboardHeader displayName="Riyaaz Singer" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
