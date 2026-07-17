import { Map } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Text,
} from "@momentum/ui";
import type { RoadmapChapterRecord } from "@momentum/types";

export interface RoadmapWidgetProps {
  chapters: RoadmapChapterRecord[];
}

export function RoadmapWidget({ chapters }: RoadmapWidgetProps) {
  if (chapters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h2">Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Map className="h-8 w-8" />}
            title="Your roadmap isn't ready yet"
            description="Your personalized roadmap will appear here once it's unlocked."
          />
        </CardContent>
      </Card>
    );
  }

  const sorted = [...chapters].sort((a, b) => a.order - b.order);
  const current =
    sorted.find((chapter) => chapter.status === "in_progress") ??
    sorted.find((chapter) => chapter.status === "unlocked") ??
    sorted[0];
  const completedCount = sorted.filter(
    (chapter) => chapter.status === "completed",
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Roadmap</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <Text>{current.title}</Text>
        <Text tone="muted" size="sm">
          {completedCount} of {sorted.length} chapters completed
        </Text>
      </CardContent>
    </Card>
  );
}
