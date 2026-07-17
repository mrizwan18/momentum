import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Caption, Heading, NumberDisplay, Text } from "./Typography";

describe("Typography", () => {
  it("renders a Heading with the requested element", () => {
    render(<Heading as="h1">Momentum</Heading>);
    expect(
      screen.getByRole("heading", { level: 1, name: "Momentum" }),
    ).toBeInTheDocument();
  });

  it("defaults Heading to h2", () => {
    render(<Heading>Section</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders Text as a paragraph by default", () => {
    render(<Text>Body copy</Text>);
    expect(screen.getByText("Body copy").tagName).toBe("P");
  });

  it("renders Caption and NumberDisplay", () => {
    render(
      <>
        <Caption>Reassurance</Caption>
        <NumberDisplay>84</NumberDisplay>
      </>,
    );
    expect(screen.getByText("Reassurance")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Heading as="h1">Momentum</Heading>
        <Text>Body copy</Text>
        <Caption>Reassurance</Caption>
      </>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
