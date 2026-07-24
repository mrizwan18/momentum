import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./Reveal";

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <p>Welcome back</p>
      </Reveal>,
    );
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("forwards standard div props", () => {
    render(
      <Reveal data-testid="reveal-wrapper" className="flex flex-col">
        <span>content</span>
      </Reveal>,
    );
    expect(screen.getByTestId("reveal-wrapper")).toHaveClass("flex flex-col");
  });

  it("renders its children with the scale variant", () => {
    render(
      <Reveal variant="scale">
        <p>Session complete</p>
      </Reveal>,
    );
    expect(screen.getByText("Session complete")).toBeInTheDocument();
  });
});
