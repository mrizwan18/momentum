import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("links back to home", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("link", { name: "Back to Momentum" }),
    ).toHaveAttribute("href", "/");
  });
});
