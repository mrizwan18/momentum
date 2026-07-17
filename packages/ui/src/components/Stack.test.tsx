import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Cluster, Stack } from "./Stack";

describe("Stack", () => {
  it("renders children in a vertical flex container", () => {
    render(
      <Stack data-testid="stack">
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    expect(screen.getByTestId("stack")).toHaveClass("flex-col");
  });
});

describe("Cluster", () => {
  it("renders children in a wrapping horizontal container", () => {
    render(
      <Cluster data-testid="cluster">
        <span>a</span>
        <span>b</span>
      </Cluster>,
    );
    expect(screen.getByTestId("cluster")).toHaveClass("flex-wrap");
  });
});
