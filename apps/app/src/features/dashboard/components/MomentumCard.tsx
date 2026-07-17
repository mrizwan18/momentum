import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@momentum/ui";

/** No momentum engine exists yet (packages/engine/momentum is empty). */
export function MomentumCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Momentum</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={<Activity className="h-8 w-8" />}
          title="Momentum score coming soon"
          description="Keep practicing — your momentum score will appear after a few sessions."
        />
      </CardContent>
    </Card>
  );
}
