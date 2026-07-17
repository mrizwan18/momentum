import { Heading, Text } from "@momentum/ui";
import { getSubtitle, getTimeOfDayGreeting } from "../lib/greeting";
import type { PracticeStatus } from "../lib/streak";

export interface GreetingProps {
  status: PracticeStatus;
}

export function Greeting({ status }: GreetingProps) {
  return (
    <div className="flex flex-col gap-1">
      <Heading as="h1" size="xl">
        {getTimeOfDayGreeting()}
      </Heading>
      <Text tone="muted">{getSubtitle(status)}</Text>
    </div>
  );
}
