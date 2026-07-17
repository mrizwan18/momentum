import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import Home from "./page";

describe("Home", () => {
  it("renders the Dashboard behind the real app providers", async () => {
    renderWithProviders(<Home />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "Start Practice" }),
    ).toBeInTheDocument();
  });
});
