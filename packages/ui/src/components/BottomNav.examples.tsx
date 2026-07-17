"use client";

import * as React from "react";
import { Home, Mic, TrendingUp } from "lucide-react";
import { BottomNav, BottomNavItem } from "./BottomNav";
import { Text } from "./Typography";
import { Stack } from "./Stack";

export default function BottomNavExamples() {
  const [active, setActive] = React.useState("home");

  return (
    <Stack gap="sm">
      <Text tone="muted" size="sm">
        Rendered `static` here for the gallery — it&apos;s `fixed` to the
        viewport bottom in real use.
      </Text>
      <div className="relative overflow-hidden rounded-xl border border-border">
        <BottomNav label="Primary" className="static">
          <BottomNavItem
            icon={<Home />}
            label="Home"
            active={active === "home"}
            onClick={() => setActive("home")}
          />
          <BottomNavItem
            icon={<Mic />}
            label="Practice"
            active={active === "practice"}
            onClick={() => setActive("practice")}
          />
          <BottomNavItem
            icon={<TrendingUp />}
            label="Progress"
            active={active === "progress"}
            onClick={() => setActive("progress")}
          />
          <BottomNavItem icon={<Home />} label="Locked" disabled />
        </BottomNav>
      </div>
    </Stack>
  );
}
