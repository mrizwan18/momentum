import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";
import { Button } from "./Button";

function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Score</CardTitle>
        <CardDescription>Based on your last session.</CardDescription>
      </CardHeader>
      <CardContent>84</CardContent>
      <CardFooter>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  );
}

describe("Card", () => {
  it("renders its composed sections", () => {
    render(<ExampleCard />);
    expect(
      screen.getByRole("heading", { name: "Today's Score" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Based on your last session.")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
  });

  it("replaces children with skeleton text while loading", () => {
    render(
      <Card loading data-testid="card">
        <div>Real content</div>
      </Card>,
    );
    expect(screen.queryByText("Real content")).not.toBeInTheDocument();
    expect(screen.getByTestId("card")).toHaveAttribute("aria-busy", "true");
  });

  it("marks itself disabled and non-interactive", () => {
    render(<Card disabled data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("aria-disabled", "true");
    expect(card).toHaveClass("pointer-events-none");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ExampleCard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
