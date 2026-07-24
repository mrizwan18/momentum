import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Input } from "./Input";

describe("Input", () => {
  it("accepts typed text", () => {
    render(<Input placeholder="Song name" defaultValue="" />);
    expect(screen.getByPlaceholderText("Song name")).toBeInTheDocument();
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Input disabled placeholder="Song name" />);
    expect(screen.getByPlaceholderText("Song name")).toBeDisabled();
  });

  it("is disabled and busy while loading", () => {
    render(<Input loading placeholder="Song name" />);
    const input = screen.getByPlaceholderText("Song name");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-busy", "true");
  });

  it("marks itself invalid via aria-invalid", () => {
    render(<Input aria-invalid placeholder="Song name" />);
    expect(screen.getByPlaceholderText("Song name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Input aria-label="Song name" placeholder="Song name" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders a decorative leading icon", () => {
    render(
      <Input
        leadingIcon={<span data-testid="leading-icon" />}
        placeholder="Enter your name"
      />,
    );
    expect(screen.getByTestId("leading-icon")).toBeInTheDocument();
  });

  it("renders trailing text", () => {
    render(<Input trailingText="Years" placeholder="Enter your age" />);
    expect(screen.getByText("Years")).toBeInTheDocument();
  });
});
