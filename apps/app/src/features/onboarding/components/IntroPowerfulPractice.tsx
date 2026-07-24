import { Heading, Reveal, Text, tintColor } from "@momentum/ui";
import { OnboardingFooter } from "./OnboardingFooter";

export interface IntroPowerfulPracticeProps {
  onNext: () => void;
}

/** Screen 02: headline + hero photo + footer (dot 1 of 3). */
export function IntroPowerfulPractice({ onNext }: IntroPowerfulPracticeProps) {
  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Powerful practice.
          <br />
          <span className="text-primary">Real progress.</span>
        </Heading>
        <Text tone="muted">
          AI powered voice coaching to help you sing better every day.
        </Text>
      </Reveal>

      <Reveal
        delay={0.1}
        className="flex-1 overflow-hidden"
        style={{
          borderRadius: "1.75rem",
          backgroundColor: tintColor.blue,
          minHeight: "280px",
        }}
      >
        <img
          src="/images/onboarding-hero.png"
          alt="A singer practicing with a microphone and headphones"
          className="h-full w-full object-cover"
          style={{
            objectPosition: "top",
            // The source photo has empty space below the subject's hands —
            // a modest zoom crops it out instead of showing bare card
            // background beneath the person, matching the reference's
            // tightly-framed hero photo.
            transform: "scale(1.18)",
            transformOrigin: "top center",
          }}
        />
      </Reveal>

      <OnboardingFooter dotsCount={3} activeIndex={0} onNext={onNext} />
    </div>
  );
}
