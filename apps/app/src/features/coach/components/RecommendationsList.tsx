import { ChevronRight, Target } from "lucide-react";
import { Card, CardContent, IconCircle, Text } from "@momentum/ui";

export interface RecommendationsListProps {
  items: string[] | null;
}

/** docs/design/references/coach.png "Recommendations" list — the Coach reply's real suggestedExercises. */
export function RecommendationsList({ items }: RecommendationsListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Text className="font-semibold">Recommendations</Text>
        <Text
          as="span"
          tone="muted"
          size="sm"
          aria-disabled="true"
          className="pointer-events-none"
        >
          See All
        </Text>
      </div>
      {items.map((item) => (
        <Card key={item}>
          <CardContent className="flex items-center gap-3 pt-6">
            <IconCircle
              icon={
                <Target aria-hidden="true" className="h-5 w-5 text-primary" />
              }
            />
            <Text size="sm" className="flex-1">
              {item}
            </Text>
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-primary"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
