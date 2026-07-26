"use client";

import * as React from "react";
import type { CoachMessageRecord } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { assembleAiContext } from "@/ai/services";
import { buildDeterministicCoachReply } from "../lib/deterministic-coach-reply";

export type SendStatus = "idle" | "sending";

export interface UseCoachConversationResult {
  messages: CoachMessageRecord[];
  loaded: boolean;
  sendStatus: SendStatus;
  send: (message: string) => Promise<void>;
}

/**
 * The Coach Q&A affordance — a real conversation backed by the Gateway,
 * persisted via storage.coachMessages so it also feeds back in as AI
 * context for every future call (Sprint 9 "AI Memory"). Falls back to the
 * deterministic heuristic coach (same Hybrid architecture as
 * useCoachInsight) when the request itself can't be made.
 */
export function useCoachConversation(): UseCoachConversationResult {
  const storage = useStorage();
  const [messages, setMessages] = React.useState<CoachMessageRecord[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [sendStatus, setSendStatus] = React.useState<SendStatus>("idle");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const history = await storage.coachMessages.list();
      if (cancelled) return;
      setMessages(history);
      setLoaded(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const send = React.useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || sendStatus === "sending") return;
      setSendStatus("sending");

      const userMessage = await storage.coachMessages.append({
        role: "user",
        message: trimmed,
      });
      setMessages((current) => [...current, userMessage]);

      const context = await assembleAiContext(storage);
      try {
        const response = await fetch("/api/ai/coach-reply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ context, message: trimmed }),
        });
        if (!response.ok) {
          throw new Error(
            `Coach reply request failed with status ${response.status}`,
          );
        }
        const result = await response.json();
        const coachMessage = await storage.coachMessages.append({
          role: "coach",
          message: result.data.message,
          suggestedExercises: result.data.suggestedExercises,
          provider: result.provider,
        });
        setMessages((current) => [...current, coachMessage]);
      } catch {
        const fallback = buildDeterministicCoachReply(context, trimmed);
        const coachMessage = await storage.coachMessages.append({
          role: "coach",
          message: fallback.message,
          suggestedExercises: fallback.suggestedExercises,
          provider: null,
        });
        setMessages((current) => [...current, coachMessage]);
      } finally {
        setSendStatus("idle");
      }
    },
    [storage, sendStatus],
  );

  return { messages, loaded, sendStatus, send };
}
