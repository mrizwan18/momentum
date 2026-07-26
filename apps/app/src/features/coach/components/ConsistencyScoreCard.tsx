import { AudioWaveform } from "lucide-react";
import {
  Card,
  CardContent,
  NumberDisplay,
  ProgressRing,
  Text,
} from "@momentum/ui";
import type { ConsistencyScore } from "../lib/consistency-score";

export interface ConsistencyScoreCardProps {
  score: ConsistencyScore;
}

/** docs/design/references/coach.png "Consistency Score" card — real days-practiced ratio, this week vs. last. */
export function ConsistencyScoreCard({ score }: ConsistencyScoreCardProps) {
  const changeLabel =
    score.changePoints === 0
      ? "Same as last week"
      : `${score.changePoints > 0 ? "↑" : "↓"} ${Math.abs(score.changePoints)}% from last week`;

  return (
    <Card elevation="raised">
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="flex flex-col gap-1">
          <Text tone="muted" size="sm">
            Consistency Score
          </Text>
          <NumberDisplay size="hero">{score.current}%</NumberDisplay>
          <Text
            size="sm"
            className={
              score.changePoints > 0
                ? "font-semibold text-success"
                : score.changePoints < 0
                  ? "font-semibold text-danger"
                  : "font-semibold"
            }
          >
            {changeLabel}
          </Text>
        </div>
        <ProgressRing
          value={score.current}
          label="Consistency score"
          size={88}
          strokeWidth={9}
        >
          <AudioWaveform aria-hidden="true" className="h-6 w-6 text-primary" />
        </ProgressRing>
      </CardContent>
    </Card>
  );
}
