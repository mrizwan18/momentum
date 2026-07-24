"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Calendar, Home, User } from "lucide-react";
import { BottomNav, BottomNavItem } from "@momentum/ui";

/**
 * docs/design/PIXEL_SPEC.md B1/B3-B5 floating nav. Only Home has a real
 * destination today — Activity/Stats/Profile aren't built yet (CLAUDE.md
 * phase order), so those tabs are present for the expected shape but
 * disabled rather than linking to screens that don't exist.
 */
export function DashboardBottomNav() {
  const router = useRouter();

  return (
    <BottomNav>
      <BottomNavItem
        icon={<Home />}
        label="Home"
        active
        onClick={() => router.push("/")}
      />
      <BottomNavItem
        icon={<Calendar />}
        label="Activity (coming soon)"
        disabled
      />
      <BottomNavItem
        icon={<BarChart3 />}
        label="Stats (coming soon)"
        disabled
      />
      <BottomNavItem icon={<User />} label="Profile (coming soon)" disabled />
    </BottomNav>
  );
}
