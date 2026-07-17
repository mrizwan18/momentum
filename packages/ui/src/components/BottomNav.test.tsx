import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Home, Mic, TrendingUp } from "lucide-react";
import { BottomNav, BottomNavItem } from "./BottomNav";

function ExampleNav({ active = "home" }: { active?: string }) {
  return (
    <BottomNav label="Primary">
      <BottomNavItem icon={<Home />} label="Home" active={active === "home"} />
      <BottomNavItem
        icon={<Mic />}
        label="Practice"
        active={active === "practice"}
      />
      <BottomNavItem
        icon={<TrendingUp />}
        label="Progress"
        active={active === "progress"}
      />
    </BottomNav>
  );
}

describe("BottomNav", () => {
  it("renders a navigation landmark with the given label", () => {
    render(<ExampleNav />);
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("marks the active item with aria-current", () => {
    render(<ExampleNav active="practice" />);
    expect(screen.getByRole("button", { name: /Practice/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: /Home/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("calls onClick for a tapped item", async () => {
    const onClick = vi.fn();
    render(
      <BottomNav label="Primary">
        <BottomNavItem icon={<Home />} label="Home" onClick={onClick} />
      </BottomNav>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables an item", () => {
    render(
      <BottomNav label="Primary">
        <BottomNavItem icon={<Home />} label="Home" disabled />
      </BottomNav>,
    );
    expect(screen.getByRole("button", { name: "Home" })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ExampleNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
