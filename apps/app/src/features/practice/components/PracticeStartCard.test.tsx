import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PracticePlanRecord, SkillRecord } from "@momentum/types";
import type { PracticeCatalog } from "../services/catalog-service";
import { PracticeStartCard } from "./PracticeStartCard";

const skill: SkillRecord = {
  id: "skill-1",
  slug: "riyaaz",
  name: "Riyaaz",
  category: "vocals",
  description: "",
  isActive: true,
  createdAt: 0,
};

const plan: PracticePlanRecord = {
  id: "plan-1",
  skillId: "skill-1",
  title: "Daily Practice",
  description: "The full daily practice queue.",
  exerciseIds: ["e1", "e2", "e3"],
  targetDurationSeconds: 600,
  isRecoveryPlan: false,
  createdAt: 0,
};

const catalog: PracticeCatalog = { skill, plan, exercises: [] };

describe("PracticeStartCard", () => {
  it("shows the plan overview and a Start Practice action when idle", () => {
    render(
      <PracticeStartCard
        catalog={catalog}
        isPreparing={false}
        isBusy={false}
        onStart={vi.fn()}
        onSelectVoiceCondition={vi.fn()}
        onCancelPreparing={vi.fn()}
      />,
    );

    expect(screen.getByText("Daily Practice")).toBeInTheDocument();
    expect(screen.getByText("3 exercises · 10:00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start Practice" }),
    ).toBeInTheDocument();
  });

  it("calls onStart when Start Practice is clicked", async () => {
    const onStart = vi.fn();
    render(
      <PracticeStartCard
        catalog={catalog}
        isPreparing={false}
        isBusy={false}
        onStart={onStart}
        onSelectVoiceCondition={vi.fn()}
        onCancelPreparing={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Start Practice" }),
    );
    expect(onStart).toHaveBeenCalled();
  });

  it("crossfades to the inline voice-condition choice while preparing", async () => {
    render(
      <PracticeStartCard
        catalog={catalog}
        isPreparing
        isBusy={false}
        onStart={vi.fn()}
        onSelectVoiceCondition={vi.fn()}
        onCancelPreparing={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("How's your voice today?")).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Start Practice" }),
    ).not.toBeInTheDocument();
  });

  it("forwards the chosen voice condition and cancel action", async () => {
    const onSelectVoiceCondition = vi.fn();
    const onCancelPreparing = vi.fn();
    render(
      <PracticeStartCard
        catalog={catalog}
        isPreparing
        isBusy={false}
        onStart={vi.fn()}
        onSelectVoiceCondition={onSelectVoiceCondition}
        onCancelPreparing={onCancelPreparing}
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Normal" }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: "Normal" }));
    expect(onSelectVoiceCondition).toHaveBeenCalledWith("normal");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancelPreparing).toHaveBeenCalled();
  });
});
