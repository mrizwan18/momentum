import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "./test-utils";

describe("renderWithProviders", () => {
  it("wraps the UI with the app's theme and storage providers", () => {
    renderWithProviders(<div>hello</div>);
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
