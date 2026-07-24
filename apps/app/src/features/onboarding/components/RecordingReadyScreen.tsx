"use client";

import * as React from "react";
import { ArrowLeft, Clock3, KeyRound, Mic, Volume2 } from "lucide-react";
import {
  Card,
  ErrorState,
  Heading,
  IconCircle,
  Reveal,
  Text,
  shadowStyle,
} from "@momentum/ui";

export interface RecordingReadyScreenProps {
  onBack: () => void;
  /** Requests mic permission and starts recording; the caller advances on true. */
  onStartRecording: () => Promise<boolean>;
  permissionDenied: boolean;
}

const TIPS = [
  { icon: Clock3, title: "10 – 15 seconds", description: "Sing clearly" },
  {
    icon: Volume2,
    title: "Use a quiet place",
    description: "For best results",
  },
  {
    icon: KeyRound,
    title: "Just be yourself",
    description: "No pressure, just practice",
  },
];

/** Screen 08: recording tips + the big mic button that requests permission and starts capture. */
export function RecordingReadyScreen({
  onBack,
  onStartRecording,
  permissionDenied,
}: RecordingReadyScreenProps) {
  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>

      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Get ready to sing
        </Heading>
        <Text tone="muted">
          Choose any song or alankaar you&apos;re comfortable with.
        </Text>
      </Reveal>

      <Reveal delay={0.1}>
        <Card elevation="hero" className="flex flex-col gap-4 p-5">
          {TIPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-3">
              <IconCircle
                icon={
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                }
                tint="blue"
                size={40}
              />
              <div className="flex flex-col">
                <Text style={{ fontWeight: 600 }}>{title}</Text>
                <Text tone="muted" size="sm">
                  {description}
                </Text>
              </div>
            </div>
          ))}
        </Card>
      </Reveal>

      {permissionDenied ? (
        <ErrorState
          title="Microphone access denied"
          description="Allow microphone access in your browser's settings, then try again."
        />
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Reveal variant="scale">
          <button
            type="button"
            onClick={onStartRecording}
            aria-label="Tap to start recording"
            style={{
              height: "96px",
              width: "96px",
              ...shadowStyle.buttonPrimary,
              backgroundColor: "hsl(var(--palette-primary) / 0.15)",
            }}
            className="flex items-center justify-center rounded-full transition-transform duration-fast ease-momentum focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
          >
            <span
              style={{ height: "72px", width: "72px" }}
              className="flex items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Mic aria-hidden="true" className="h-7 w-7" />
            </span>
          </button>
        </Reveal>
        <Text tone="muted" size="sm">
          Tap to start recording
        </Text>
      </div>
    </div>
  );
}
