import { Activity, Footprints } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";
import { Stack } from "./Stack";
import { Text } from "./Typography";

export default function AnalyticsCardExamples() {
  return (
    <Stack gap="md" className="max-w-sm">
      <AnalyticsCard
        icon={<Activity className="h-4 w-4" />}
        label="Consistency"
        value="85%"
        caption="This Month"
        progress={83}
        ringLabel="Consistency this month"
        ringContent={
          <Stack gap="none" className="items-center">
            <Text size="sm" className="font-bold">
              25 / 30
            </Text>
            <Text tone="muted" className="text-xs">
              Days
            </Text>
          </Stack>
        }
      />
      <AnalyticsCard
        icon={<Footprints className="h-4 w-4" />}
        label="Progress"
        value="12,430"
        caption="Steps Today"
        progress={62}
        ringLabel="Steps progress today"
        tint="blue"
      />
      <AnalyticsCard
        label="Progress"
        value="--"
        caption="Not available offline"
        ringLabel="Progress unavailable"
      />
    </Stack>
  );
}
