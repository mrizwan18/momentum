import { Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@momentum/ui";

/** No achievements table exists yet, so this is always an honest empty state. */
export function AchievementWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Latest Achievement</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={<Award className="h-8 w-8" />}
          title="No achievements yet"
          description="Complete your first practice session to earn your first badge."
        />
      </CardContent>
    </Card>
  );
}
