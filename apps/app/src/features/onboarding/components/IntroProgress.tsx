import { ArrowUpRight, Clock, Flame } from "lucide-react";
import {
  BarChart,
  Card,
  Heading,
  NumberDisplay,
  Reveal,
  Text,
} from "@momentum/ui";
import { OnboardingFooter } from "./OnboardingFooter";
import { StatTile } from "./StatTile";

export interface IntroProgressProps {
  onNext: () => void;
}

/** Illustrative week — this is marketing preview content, not a real user's data. */
const WEEK_DATA = [
  { label: "M", value: 65, active: true },
  { label: "T", value: 80, active: true },
  { label: "W", value: 45, active: true },
  { label: "T", value: 90, active: true },
  { label: "F", value: 85, active: true },
  { label: "S", value: 30, active: false },
  { label: "S", value: 55, active: true },
];

/** Screen 04: headline + streak/chart preview + stat tiles + footer (dot 3 of 3). */
export function IntroProgress({ onNext }: IntroProgressProps) {
  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Track. Improve.
          <br />
          <span className="text-primary">Grow.</span>
        </Heading>
        <Text tone="muted">
          Track your practice, build streaks and achieve your singing goals.
        </Text>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-1 flex-col gap-3">
        <Card elevation="hero" className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame aria-hidden="true" className="h-5 w-5 text-primary" />
              <Text style={{ fontWeight: 600 }}>Current Streak</Text>
            </div>
            <span
              aria-hidden="true"
              style={{
                height: "36px",
                width: "36px",
                border: "1.5px solid hsl(var(--palette-border))",
              }}
              className="flex items-center justify-center rounded-full text-primary"
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <NumberDisplay size="hero">12</NumberDisplay>
            <Text tone="muted" size="sm">
              days
            </Text>
          </div>
          <BarChart data={WEEK_DATA} label="Illustrative week of practice" />
        </Card>

        <div className="flex gap-3">
          <StatTile
            icon={<Flame aria-hidden="true" className="h-4 w-4 text-danger" />}
            value="860 kcal"
            label="Calories Burned"
            tint="peach"
          />
          <StatTile
            icon={<Clock aria-hidden="true" className="h-4 w-4 text-primary" />}
            value="6h 40m"
            label="Total Practice"
            tint="pink"
          />
        </div>
      </Reveal>

      <OnboardingFooter dotsCount={3} activeIndex={2} onNext={onNext} />
    </div>
  );
}
