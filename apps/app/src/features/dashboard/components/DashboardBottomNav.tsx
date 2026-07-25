"use client";

import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Calendar, Home, User } from "lucide-react";
import { BottomNav, BottomNavItem } from "@momentum/ui";

/**
 * docs/design/PIXEL_SPEC.md B1/B3-B5 floating nav. Home and Stats (Progress)
 * both have real destinations; Activity/Profile aren't built yet (CLAUDE.md
 * phase order), so those two stay present for the expected shape but
 * disabled rather than linking to screens that don't exist.
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
      <BottomNavItem icon={<User />} label="Profile (coming soon)" disabled />
    </BottomNav>
  );
}
