"use client";

import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Calendar, Home, Sparkles } from "lucide-react";
import { BottomNav, BottomNavItem } from "@momentum/ui";

/**
 * docs/design/PIXEL_SPEC.md B1/B3-B5 floating nav. Home, Stats (Progress),
 * and Coach all have real destinations; Activity/Profile aren't built yet
 * (CLAUDE.md phase order) — Activity stays present for the expected shape
 * but disabled. Coach replaces the earlier "Profile (coming soon)" slot
 * now that Sprint 9 gives it somewhere real to go, matching
 * docs/design/references/coach.png's own nav (Home/Activity/Stats/Coach).
 */
export function DashboardBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <BottomNav>
      <BottomNavItem
        icon={<Home />}
        label="Home"
        active={pathname === "/"}
        onClick={() => router.push("/")}
      />
      <BottomNavItem
        icon={<Calendar />}
        label="Activity (coming soon)"
        disabled
      />
      <BottomNavItem
        icon={<BarChart3 />}
        label="Stats"
        active={pathname === "/progress"}
        onClick={() => router.push("/progress")}
      />
      <BottomNavItem
        icon={<Sparkles />}
        label="Coach"
        active={pathname === "/coach"}
        onClick={() => router.push("/coach")}
      />
    </BottomNav>
  );
}
