import { Bot, Volume2 } from "lucide-react";
import { Card, CardContent, IconCircle, Text } from "@momentum/ui";

export interface CoachGreetingCardProps {
  displayName: string | null;
  streakCurrent: number;
}

/** docs/design/references/coach.png greeting bubble — deterministic (no AI call needed for a hello). */
export function CoachGreetingCard({
  displayName,
  streakCurrent,
}: CoachGreetingCardProps) {
  const encouragement =
    streakCurrent > 0
      ? `Your consistency is improving — ${streakCurrent} day${streakCurrent === 1 ? "" : "s"} in a row.`
      : "Every session counts, no matter how small.";

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <IconCircle
          icon={<Bot aria-hidden="true" className="h-6 w-6 text-primary" />}
          tint="surface"
        />
        <div className="flex flex-1 flex-col gap-1">
          <Text className="font-semibold">
            Hi{displayName ? ` ${displayName}` : ""}! 👋
          </Text>
          <Text tone="muted" size="sm">
            {encouragement}
          </Text>
        </div>
        <Volume2 aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
      </CardContent>
    </Card>
  );
}
