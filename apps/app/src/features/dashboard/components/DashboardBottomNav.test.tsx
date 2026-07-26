import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DashboardBottomNav } from "./DashboardBottomNav";

const push = vi.fn();
let pathname = "/";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

describe("DashboardBottomNav", () => {
  afterEach(() => {
    push.mockClear();
    pathname = "/";
  });

  it("marks Home as active on '/'", () => {
    render(<DashboardBottomNav />);
    const home = screen.getByRole("button", { name: "Home" });
    expect(home).toBeEnabled();
    expect(home).toHaveAttribute("aria-current", "page");
  });

  it("marks Stats as active on '/progress'", () => {
    pathname = "/progress";
    render(<DashboardBottomNav />);
    const stats = screen.getByRole("button", { name: "Stats" });
    expect(stats).toBeEnabled();
    expect(stats).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("navigates to /progress when Stats is tapped", async () => {
    render(<DashboardBottomNav />);
    await userEvent.click(screen.getByRole("button", { name: "Stats" }));
    expect(push).toHaveBeenCalledWith("/progress");
  });

  it("marks Coach as active on '/coach'", () => {
    pathname = "/coach";
    render(<DashboardBottomNav />);
    const coach = screen.getByRole("button", { name: "Coach" });
    expect(coach).toBeEnabled();
    expect(coach).toHaveAttribute("aria-current", "page");
  });

  it("navigates to /coach when Coach is tapped", async () => {
    render(<DashboardBottomNav />);
    await userEvent.click(screen.getByRole("button", { name: "Coach" }));
    expect(push).toHaveBeenCalledWith("/coach");
  });

  it("disables the not-yet-built Activity tab", () => {
    render(<DashboardBottomNav />);
    expect(screen.getByRole("button", { name: /activity/i })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DashboardBottomNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
