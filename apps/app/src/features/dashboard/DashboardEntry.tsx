"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "./DashboardView";

/**
 * DashboardView reads Dexie (IndexedDB), which doesn't exist during Next's
 * server render / static export pass. `ssr: false` skips that pass
 * entirely so it only ever mounts in the browser; the loading fallback
 * reuses the same skeleton DashboardView shows once it *is* mounted but
 * still waiting on Dexie, so there's no visual seam between the two.
 */
const DashboardView = dynamic(
  () => import("./DashboardView").then((mod) => mod.DashboardView),
  { ssr: false, loading: DashboardSkeleton },
);

export function DashboardEntry() {
  return <DashboardView />;
}
