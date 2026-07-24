"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "./PracticeView";

/**
 * PracticeView reads Dexie (IndexedDB) via usePracticeSession, which
 * doesn't exist during Next's server render. Mirrors DashboardEntry's
 * ssr:false pattern so it only ever mounts in the browser.
 */
const PracticeView = dynamic(
  () => import("./PracticeView").then((mod) => mod.PracticeView),
  { ssr: false, loading: PracticeSkeleton },
);

export function PracticeEntry() {
  return <PracticeView />;
}
