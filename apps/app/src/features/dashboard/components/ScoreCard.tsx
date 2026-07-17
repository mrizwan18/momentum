import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ProgressRing,
} from "@momentum/ui";

/**
 * No scoring engine exists yet (packages/engine/scoring is an intentionally
 * empty scaffold), so there is no real score to show — an honest empty
 * state beats a fabricated number.
 */
export function ScoreCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Today&apos;s Score</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={<ProgressRing value={0} label="No score yet" disabled />}
          title="No score yet"
          description="Complete a practice session to see today's score."
        />
      </CardContent>
    </Card>
  );
}
