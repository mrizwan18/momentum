import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DashboardBottomNav } from "./DashboardBottomNav";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("DashboardBottomNav", () => {
  it("marks Home as the active, enabled tab", () => {
    render(<DashboardBottomNav />);
    const home = screen.getByRole("button", { name: "Home" });
    expect(home).toBeEnabled();
    expect(home).toHaveAttribute("aria-current", "page");
  });

  it("disables the not-yet-built tabs", () => {
    render(<DashboardBottomNav />);
    expect(screen.getByRole("button", { name: /activity/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /stats/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /profile/i })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DashboardBottomNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
