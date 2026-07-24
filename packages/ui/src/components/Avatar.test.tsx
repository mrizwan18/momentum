import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders initials from a two-word name", () => {
    render(<Avatar name="Riyaaz Singer" />);
    expect(screen.getByText("RS")).toBeInTheDocument();
  });

  it("renders a single initial from a one-word name", () => {
    render(<Avatar name="Riyaaz" />);
    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("renders a generic placeholder icon and an honest label when no name is set", () => {
    render(<Avatar name={null} />);
    const avatar = screen.getByRole("img", { name: "No profile name set" });
    expect(avatar).toBeInTheDocument();
    expect(avatar.querySelector("svg")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Avatar name="Riyaaz Singer" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
