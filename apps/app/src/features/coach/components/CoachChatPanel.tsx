"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button, Card, CardContent, Text } from "@momentum/ui";
import type { CoachMessageRecord } from "@momentum/types";
import type { SendStatus } from "../hooks/use-coach-conversation";

export interface CoachChatPanelProps {
  messages: CoachMessageRecord[];
  loaded: boolean;
  sendStatus: SendStatus;
  onSend: (message: string) => void;
}

/**
 * The Coach's Q&A affordance — not part of docs/design/references/coach.png
 * (a stat-dashboard mock), added underneath the sparkle header button so
 * "answer singing questions, explain mistakes..." (Sprint 9) has somewhere
 * to actually happen without altering the reference's primary layout.
 */
export function CoachChatPanel({
  messages,
  loaded,
  sendStatus,
  onSend,
}: CoachChatPanelProps) {
  const [draft, setDraft] = React.useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || sendStatus === "sending") return;
    onSend(draft);
    setDraft("");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <Text className="font-semibold">Ask your AI Coach</Text>

        {!loaded ? (
          <Text tone="muted" size="sm">
            Loading your conversation…
          </Text>
        ) : messages.length === 0 ? (
          <Text tone="muted" size="sm">
            Ask about your progress, a mistake you noticed, or what to practice
            next.
          </Text>
        ) : (
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "self-end rounded-lg bg-primary/10 px-3 py-2"
                    : "self-start rounded-lg bg-surface-raised px-3 py-2"
                }
              >
                <Text size="sm">{message.message}</Text>
              </div>
            ))}
          </div>
        )}

        {sendStatus === "sending" ? (
          <Text tone="muted" size="sm" role="status" aria-live="polite">
            Your coach is thinking…
          </Text>
        ) : null}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="coach-chat-input" className="sr-only">
            Ask your AI Coach a question
          </label>
          <input
            id="coach-chat-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question…"
            className="min-h-touch flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            disabled={sendStatus === "sending"}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send"
            disabled={!draft.trim() || sendStatus === "sending"}
          >
            <Send aria-hidden="true" className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
