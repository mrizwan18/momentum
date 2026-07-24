import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Crossfade } from "./Crossfade";

describe("Crossfade", () => {
  it("renders the content for the initial key", () => {
    render(
      <Crossfade activeKey="a">
        <p>First</p>
      </Crossfade>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("swaps to the new content once the key changes", async () => {
    const { rerender } = render(
      <Crossfade activeKey="a">
        <p>First</p>
      </Crossfade>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();

    rerender(
      <Crossfade activeKey="b">
        <p>Second</p>
      </Crossfade>,
    );

    await waitFor(() => expect(screen.getByText("Second")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByText("First")).not.toBeInTheDocument(),
    );
  });
});
