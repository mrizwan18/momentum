import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@momentum/ui";

/** No recommendation engine exists yet — nothing to recommend honestly. */
export function OneThingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Today&apos;s One Thing</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Nothing planned yet"
          description="Your personalized recommendation will appear here once you start practicing."
        />
      </CardContent>
    </Card>
  );
}
