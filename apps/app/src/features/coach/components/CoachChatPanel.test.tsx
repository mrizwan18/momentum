import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { CoachMessageRecord } from "@momentum/types";
import { CoachChatPanel } from "./CoachChatPanel";

const messages: CoachMessageRecord[] = [
  {
    id: "1",
    role: "user",
    message: "How am I doing?",
    suggestedExercises: null,
    provider: null,
    createdAt: 0,
  },
  {
    id: "2",
    role: "coach",
    message: "You're doing great!",
    suggestedExercises: null,
    provider: "mock",
    createdAt: 1,
  },
];

describe("CoachChatPanel", () => {
  it("shows a loading message before history loads", () => {
    render(
      <CoachChatPanel
        messages={[]}
        loaded={false}
        sendStatus="idle"
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByText("Loading your conversation…")).toBeInTheDocument();
  });

  it("shows an empty prompt with no history", () => {
    render(
      <CoachChatPanel
        messages={[]}
        loaded
        sendStatus="idle"
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByText(/Ask about your progress/)).toBeInTheDocument();
  });

  it("renders every message", () => {
    render(
      <CoachChatPanel
        messages={messages}
        loaded
        sendStatus="idle"
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByText("How am I doing?")).toBeInTheDocument();
    expect(screen.getByText("You're doing great!")).toBeInTheDocument();
  });

  it("shows a thinking indicator while sending", () => {
    render(
      <CoachChatPanel
        messages={messages}
        loaded
        sendStatus="sending"
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByText("Your coach is thinking…")).toBeInTheDocument();
  });

  it("calls onSend with the typed message and clears the input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(
      <CoachChatPanel messages={[]} loaded sendStatus="idle" onSend={onSend} />,
    );

    const input = screen.getByLabelText("Ask your AI Coach a question");
    await user.type(input, "What should I practice?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledWith("What should I practice?");
    expect(input).toHaveValue("");
  });

  it("disables sending an empty message", () => {
    render(
      <CoachChatPanel
        messages={[]}
        loaded
        sendStatus="idle"
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CoachChatPanel
        messages={messages}
        loaded
        sendStatus="idle"
        onSend={vi.fn()}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
