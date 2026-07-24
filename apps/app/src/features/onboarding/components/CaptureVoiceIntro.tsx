"use client";

import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import {
  Button,
  Card,
  Heading,
  IconCircle,
  OnboardingBackdrop,
  Reveal,
  Text,
  shadowStyle,
} from "@momentum/ui";

export interface CaptureVoiceIntroProps {
  onBack: () => void;
  onNext: () => void;
}

/** Screen 07: intro to the baseline voice recording, before mic permission is requested. */
export function CaptureVoiceIntro({ onBack, onNext }: CaptureVoiceIntroProps) {
  return (
    <div
      className="relative flex flex-col gap-4 px-6 pt-6 pb-4"
      style={{ minHeight: "100dvh" }}
    >
      <OnboardingBackdrop />

      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="relative flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>

      <Reveal className="relative flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          {"Let's capture"}
          <br />
          <span className="text-primary">your voice</span>
        </Heading>
        <Text tone="muted">
          Record a short 10-15 second clip of you singing so AI can understand
          your current level.
        </Text>
      </Reveal>

      <Reveal
        delay={0.1}
        className="relative flex-1 overflow-hidden"
        style={{ borderRadius: "1.75rem" }}
      >
        <img
          src="/images/onboarding-hero.png"
          alt="A singer practicing with a microphone and headphones"
          className="h-full w-full object-cover"
          style={{
            objectPosition: "top",
            transform: "scale(1.1)",
            transformOrigin: "top center",
          }}
        />
      </Reveal>

      <Reveal delay={0.2}>
        <Card elevation="hero" className="flex items-start gap-3 p-4">
          <IconCircle
            icon={
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 text-primary"
              />
            }
            tint="blue"
            size={40}
          />
          <div className="flex flex-col gap-1">
            <Text style={{ fontWeight: 600 }}>
              This helps us personalize your practice plan.
            </Text>
            <Text tone="muted" size="sm">
              Your recording is private and secure.
            </Text>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.3}>
        <Button
          onClick={onNext}
          className="h-14 w-full gap-2 text-base font-semibold"
        >
          Continue
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </Reveal>
    </div>
  );
}
