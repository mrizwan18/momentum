import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceConditionInline } from "./VoiceConditionInline";

describe("VoiceConditionInline", () => {
  it("asks how the user's voice feels and offers all four conditions", () => {
    render(<VoiceConditionInline onSelect={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText("How's your voice today?")).toBeInTheDocument();
    for (const label of ["Fresh", "Normal", "Tired", "Strained"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("calls onSelect with the chosen condition", async () => {
    const onSelect = vi.fn();
    render(<VoiceConditionInline onSelect={onSelect} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Tired" }));
    expect(onSelect).toHaveBeenCalledWith("tired");
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(<VoiceConditionInline onSelect={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables every control while loading", () => {
    render(
      <VoiceConditionInline onSelect={vi.fn()} onCancel={vi.fn()} loading />,
    );

    expect(screen.getByRole("button", { name: "Fresh" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
