import { Brain } from "lucide-react";
import { Card, CardContent, IconCircle, Text } from "@momentum/ui";
import type { CoachInsightStatus } from "../hooks/use-coach-insight";

export interface PersonalizedInsightCardProps {
  status: CoachInsightStatus;
  message: string | null;
}

/** docs/design/references/coach.png "Personalized Insight" card. */
export function PersonalizedInsightCard({
  status,
  message,
}: PersonalizedInsightCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-6">
        <IconCircle
          icon={<Brain aria-hidden="true" className="h-5 w-5 text-primary" />}
        />
        <div className="flex flex-1 flex-col gap-1">
          <Text className="font-semibold">Personalized Insight</Text>
          {status === "loading" || !message ? (
            <Text tone="muted" size="sm">
              Preparing your insight…
            </Text>
          ) : (
            <Text tone="muted" size="sm">
              {message}
            </Text>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
