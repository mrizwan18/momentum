import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from "./Skeleton";

describe("SkeletonGroup", () => {
  it("announces a single loading status for the group", () => {
    render(
      <SkeletonGroup label="Loading dashboard">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </SkeletonGroup>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading dashboard");
  });

  it("hides individual skeleton blocks from assistive tech", () => {
    render(<Skeleton data-testid="block" />);
    expect(screen.getByTestId("block")).toHaveAttribute("aria-hidden", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SkeletonGroup label="Loading">
        <Skeleton className="h-4 w-24" />
      </SkeletonGroup>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("SkeletonText", () => {
  it("renders the requested number of lines, the last one shorter", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll("[aria-hidden='true']");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toHaveClass("w-2/3");
  });
});

describe("SkeletonCircle", () => {
  it("renders a fixed-size circular block", () => {
    render(<SkeletonCircle size={32} data-testid="avatar" />);
    const circle = screen.getByTestId("avatar");
    expect(circle).toHaveClass("rounded-full");
    expect(circle).toHaveStyle({ width: "32px", height: "32px" });
  });
});
