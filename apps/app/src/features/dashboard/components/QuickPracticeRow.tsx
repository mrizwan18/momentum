import type { ReactNode } from "react";
import Link from "next/link";
import { Music2, Sparkles, Wind, Zap, Mic } from "lucide-react";
import type { ExerciseCategory } from "@momentum/types";
import { Heading, Text, shadowStyle } from "@momentum/ui";
import { CATEGORY_LABELS } from "@/lib/exercise-category-labels";

const QUICK_PRACTICE_CATEGORIES: ExerciseCategory[] = [
  "breathing",
  "warmup",
  "scales",
  "alankars",
  "song",
];

const CATEGORY_ICONS: Partial<Record<ExerciseCategory, ReactNode>> = {
  breathing: <Wind aria-hidden="true" className="h-5 w-5" />,
  warmup: <Zap aria-hidden="true" className="h-5 w-5" />,
  scales: <Music2 aria-hidden="true" className="h-5 w-5" />,
  alankars: <Sparkles aria-hidden="true" className="h-5 w-5" />,
  song: <Mic aria-hidden="true" className="h-5 w-5" />,
};

/**
 * docs/design/PIXEL_SPEC.md B1 "Quick Practice": a row of category
 * shortcuts. The exercise engine doesn't support starting a session
 * filtered to one category yet, so every tile opens the regular practice
 * flow rather than a fake per-category start — a real, if not yet fully
 * targeted, action.
 */
export function QuickPracticeRow() {
  return (
    <section className="flex flex-col gap-3">
      <Heading as="h2" size="sm">
        Quick Practice
      </Heading>
      <div className="flex justify-between gap-2">
        {QUICK_PRACTICE_CATEGORIES.map((category) => (
          <Link
            key={category}
            href="/practice"
            className="flex flex-col items-center gap-2"
          >
            <span
              style={{ height: "56px", width: "56px", ...shadowStyle.iconChip }}
              className="flex items-center justify-center rounded-full bg-surface text-primary"
            >
              {CATEGORY_ICONS[category]}
            </span>
            <Text size="sm" className="text-center">
              {CATEGORY_LABELS[category]}
            </Text>
          </Link>
        ))}
      </div>
    </section>
  );
}
