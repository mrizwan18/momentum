import { Card, IconCircle, NumberDisplay, Text, tintColor } from "@momentum/ui";
import type { Tint } from "@momentum/ui";

export interface StatTileProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  tint: Tint;
}

/** The small "860 kcal" / "6h 40m" tinted stat cards on the Progress screen. */
export function StatTile({ icon, value, label, tint }: StatTileProps) {
  return (
    <Card
      className="flex-1"
      style={{ backgroundColor: tintColor[tint], padding: "1rem" }}
    >
      <IconCircle icon={icon} tint="surface" size={32} />
      <div style={{ marginTop: "0.625rem" }}>
        <NumberDisplay size="md">{value}</NumberDisplay>
        <Text tone="muted" size="sm">
          {label}
        </Text>
      </div>
    </Card>
  );
}
