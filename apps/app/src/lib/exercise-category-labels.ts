import { BookOpen, Flame, Mic, Mic2, Music2, Music4, Wind } from "lucide-react";
import type { ExerciseCategory } from "@momentum/types";
import type { LucideIcon } from "lucide-react";

/** Shared between Practice (exercise headers) and Dashboard (quick-practice shortcuts). */
export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  breathing: "Breathing",
  warmup: "Warmup",
  scales: "Sa Re Ga Ma",
  alankars: "Alankars",
  song: "Song Practice",
  recording: "Recording",
  reflection: "Reflection",
};

/** A representative icon per exercise category, for icon-chip presentation. */
export const CATEGORY_ICONS: Record<ExerciseCategory, LucideIcon> = {
  breathing: Wind,
  warmup: Flame,
  scales: Music2,
  alankars: Music4,
  song: Mic2,
  recording: Mic,
  reflection: BookOpen,
};
