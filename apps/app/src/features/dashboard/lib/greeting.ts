import type { PracticeStatus } from "./streak";

export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

/** docs/features/dashboard.md Hero Section subtitle examples. */
export function getSubtitle(status: PracticeStatus): string {
  switch (status) {
    case "new":
      return "Let's start your first practice.";
    case "practiced-today":
      return "You've already shown up today. Nice work.";
    case "streak-active":
      return "Let's keep your streak alive.";
    case "recovery":
      return "Recovery sessions count too.";
  }
}
