import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type { RoadmapChapterRecord } from "@momentum/types";
import { RoadmapWidget } from "./RoadmapWidget";

function chapter(
  overrides: Partial<RoadmapChapterRecord> = {},
): RoadmapChapterRecord {
  return {
    id: "chapter-1",
    order: 1,
    title: "Foundations",
    status: "unlocked",
    updatedAt: 0,
    ...overrides,
  };
}

describe("RoadmapWidget", () => {
  it("renders an empty state when no chapters have been seeded", () => {
    render(<RoadmapWidget chapters={[]} />);
    expect(
      screen.getByText("Your roadmap isn't ready yet"),
    ).toBeInTheDocument();
  });

  it("shows the current in-progress chapter and completion count", () => {
    render(
      <RoadmapWidget
        chapters={[
          chapter({ id: "c1", order: 1, status: "completed" }),
          chapter({
            id: "c2",
            order: 2,
            title: "Breath Control",
            status: "in_progress",
          }),
          chapter({ id: "c3", order: 3, status: "locked" }),
        ]}
      />,
    );
    expect(screen.getByText("Breath Control")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 chapters completed")).toBeInTheDocument();
  });

  it("falls back to the first unlocked chapter when none is in progress", () => {
    render(
      <RoadmapWidget
        chapters={[chapter({ title: "Foundations", status: "unlocked" })]}
      />,
    );
    expect(screen.getByText("Foundations")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<RoadmapWidget chapters={[chapter()]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
