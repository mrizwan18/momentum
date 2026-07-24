import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RecordingReview } from "./RecordingReview";

function fakeBlob() {
  return new Blob(["fake-audio"], { type: "audio/webm" });
}

describe("RecordingReview", () => {
  it("shows the duration and current title", () => {
    render(
      <RecordingReview
        blob={fakeBlob()}
        title="Take 1"
        durationMs={65_000}
        isSaving={false}
        onRename={vi.fn()}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );
    expect(screen.getByText("Duration: 1:05")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Take 1");
  });

  it("calls onRename as the title is edited", async () => {
    const onRename = vi.fn();
    render(
      <RecordingReview
        blob={fakeBlob()}
        title="Take 1"
        durationMs={1000}
        isSaving={false}
        onRename={onRename}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );
    await userEvent.type(screen.getByLabelText("Title"), "!");
    expect(onRename).toHaveBeenCalled();
  });

  it("calls onSave and onDiscard", async () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    render(
      <RecordingReview
        blob={fakeBlob()}
        title="Take 1"
        durationMs={1000}
        isSaving={false}
        onRename={vi.fn()}
        onSave={onSave}
        onDiscard={onDiscard}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: /discard/i }));
    expect(onDiscard).toHaveBeenCalledOnce();
  });

  it("disables discard while saving, and shows a loading Save button", () => {
    render(
      <RecordingReview
        blob={fakeBlob()}
        title="Take 1"
        durationMs={1000}
        isSaving={true}
        onRename={vi.fn()}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /discard/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RecordingReview
        blob={fakeBlob()}
        title="Take 1"
        durationMs={1000}
        isSaving={false}
        onRename={vi.fn()}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );
    // preload:false — axe-core otherwise tries to fetch the <audio>'s blob:
    // URL for its media rules, which jsdom can't resolve, and only gives up
    // after its own multi-second internal timeout.
    const results = await axe(container, { preload: false });
    expect(results).toHaveNoViolations();
  });
});
