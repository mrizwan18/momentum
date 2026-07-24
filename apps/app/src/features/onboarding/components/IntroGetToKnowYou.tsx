import { ArrowRight } from "lucide-react";
import {
  Button,
  Heading,
  MomentumMark,
  OnboardingBackdrop,
  Reveal,
  Text,
  shadowStyle,
} from "@momentum/ui";

export interface IntroGetToKnowYouProps {
  onNext: () => void;
}

/** Screen 05: centered closing slide — no dots, a full-width "Get Started" CTA instead. */
export function IntroGetToKnowYou({ onNext }: IntroGetToKnowYouProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-6 px-6"
      style={{ minHeight: "100dvh" }}
    >
      <OnboardingBackdrop />

      <Reveal
        variant="scale"
        style={{
          height: "112px",
          width: "112px",
          ...shadowStyle.hero,
        }}
        className="flex items-center justify-center rounded-full bg-surface"
      >
        <MomentumMark size={48} />
      </Reveal>

      <Reveal
        delay={0.1}
        className="flex flex-col items-center gap-2 text-center"
      >
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          {"Let's get to"}
          <br />
          <span className="text-primary">know you</span>
        </Heading>
        <Text tone="muted" className="text-center">
          Tell us a bit about yourself to personalize your experience.
        </Text>
      </Reveal>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "24px",
          right: "24px",
        }}
      >
        <Button
          onClick={onNext}
          className="h-14 w-full gap-2 text-base font-semibold"
        >
          Get Started
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
