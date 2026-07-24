import { Bot, Brain } from "lucide-react";
import {
  Card,
  Heading,
  IconCircle,
  MomentumMark,
  NumberDisplay,
  ProgressRing,
  radiusStyle,
  Reveal,
  Text,
  tintColor,
} from "@momentum/ui";
import { OnboardingFooter } from "./OnboardingFooter";

export interface IntroAICoachProps {
  onNext: () => void;
}

/** Static placeholder line — decorative only, not a real loading state. */
function PlaceholderLine({ width }: { width: string }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-md bg-surface-raised"
      style={{ height: "8px", width }}
    />
  );
}

/** Screen 03: headline + a preview of the AI Coach panel + footer (dot 2 of 3). */
export function IntroAICoach({ onNext }: IntroAICoachProps) {
  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Your personal
          <br />
          <span className="text-primary">AI Coach</span>
        </Heading>
        <Text tone="muted">
          Get instant feedback, customized plans and smart recommendations.
        </Text>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col gap-3">
        <Card className="flex items-center gap-3 p-4">
          <IconCircle
            icon={
              <Bot aria-hidden="true" className="h-5 w-5 text-foreground" />
            }
            tint="blue"
            size={40}
            style={{ borderRadius: radiusStyle.chip.borderRadius }}
          />
          <div className="flex flex-1 flex-col gap-1.5">
            <Text style={{ fontWeight: 600 }}>AI Coach</Text>
            <PlaceholderLine width="90%" />
            <PlaceholderLine width="60%" />
          </div>
          <IconCircle icon={<MomentumMark size={16} />} tint="blue" size={36} />
        </Card>

        <Card
          className="flex items-center justify-between gap-3 p-4"
          style={{ backgroundColor: tintColor.blue }}
        >
          <div>
            <Text style={{ fontWeight: 600 }}>Consistency Score</Text>
            <NumberDisplay size="hero">85%</NumberDisplay>
          </div>
          <ProgressRing
            value={85}
            label="Consistency score"
            size={80}
            strokeWidth={8}
          >
            <MomentumMark size={20} />
          </ProgressRing>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <IconCircle
            icon={
              <Brain aria-hidden="true" className="h-5 w-5 text-foreground" />
            }
            tint="purple"
            size={40}
            style={{ borderRadius: radiusStyle.chip.borderRadius }}
          />
          <div className="flex flex-1 flex-col gap-1.5">
            <Text style={{ fontWeight: 600 }}>Personalized Insight</Text>
            <PlaceholderLine width="85%" />
            <PlaceholderLine width="55%" />
          </div>
        </Card>
      </Reveal>

      <OnboardingFooter dotsCount={3} activeIndex={1} onNext={onNext} />
    </div>
  );
}
