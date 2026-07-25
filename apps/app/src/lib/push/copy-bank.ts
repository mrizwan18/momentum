export type NotificationContext =
  "streak-at-risk" | "havent-practiced-today" | "comeback" | "generic";

export interface NotificationTemplate {
  key: string;
  context: NotificationContext;
  title: string;
  /** `{streak}` is substituted with the subscriber's current streak length. */
  body: string;
}

/**
 * Duolingo-style quirky/varied copy, grouped by context. Kept intentionally
 * playful (never shaming, per IMPLEMENT.md's "Never shame the user") — the
 * goal is a smile that makes tapping the notification feel worth it, not
 * guilt.
 */
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Has an active streak, hasn't practiced yet today, streak lapses tomorrow.
  {
    key: "streak-at-risk-1",
    context: "streak-at-risk",
    title: "🔥 Your streak is on thin ice",
    body: "{streak} days of hard work, about to melt. Save it with 5 minutes?",
  },
  {
    key: "streak-at-risk-2",
    context: "streak-at-risk",
    title: "Your streak just texted you",
    body: '"Where are you?" — your {streak}-day streak, probably.',
  },
  {
    key: "streak-at-risk-3",
    context: "streak-at-risk",
    title: "⏰ Streak alert!",
    body: "{streak} days strong. Don't let today be the day it ends.",
  },
  // No active streak / general daily nudge to practice today.
  {
    key: "havent-practiced-today-1",
    context: "havent-practiced-today",
    title: "Your voice called",
    body: 'It left a voicemail: "miss you, come practice." 🎤',
  },
  {
    key: "havent-practiced-today-2",
    context: "havent-practiced-today",
    title: "5 minutes > 5 hours of scrolling",
    body: "Just saying. Your future self is watching.",
  },
  {
    key: "havent-practiced-today-3",
    context: "havent-practiced-today",
    title: "Today's a great day to sound amazing tomorrow",
    body: "One quick session and you're done. Promise it's painless.",
  },
  // Been away for a few+ days — win them back without guilt-tripping.
  {
    key: "comeback-1",
    context: "comeback",
    title: "Long time no sing 👀",
    body: "We kept your spot warm. Come back whenever you're ready.",
  },
  {
    key: "comeback-2",
    context: "comeback",
    title: "Plot twist: you still remember how to do this",
    body: "Your progress isn't lost, it's just napping. Wake it up?",
  },
  {
    key: "comeback-3",
    context: "comeback",
    title: "We miss your voice in here",
    body: "No pressure, no judgment — just a friendly nudge to come back.",
  },
  // First-ever nudge / fallback when no other context fits.
  {
    key: "generic-1",
    context: "generic",
    title: "Quick reminder 🎶",
    body: "Practice makes progress. A few minutes today goes a long way.",
  },
  {
    key: "generic-2",
    context: "generic",
    title: "Momentum is calling",
    body: "Your next great session is 5 minutes away.",
  },
];

export function templatesForContext(
  context: NotificationContext,
): NotificationTemplate[] {
  return NOTIFICATION_TEMPLATES.filter((t) => t.context === context);
}

/**
 * Picks a template for `context`, avoiding anything in `recentTemplateKeys`
 * when a fresher option exists — falls back to the full set once every
 * template in this context has recently been used, so it never gets stuck.
 */
export function pickTemplate(
  context: NotificationContext,
  recentTemplateKeys: string[],
  random: () => number = Math.random,
): NotificationTemplate {
  const candidates = templatesForContext(context);
  const fresh = candidates.filter((t) => !recentTemplateKeys.includes(t.key));
  const pool = fresh.length > 0 ? fresh : candidates;
  const index = Math.floor(random() * pool.length);
  return pool[Math.min(index, pool.length - 1)];
}

export function renderTemplate(
  template: NotificationTemplate,
  vars: { streak: number },
): { title: string; body: string } {
  return {
    title: template.title,
    body: template.body.replace("{streak}", String(vars.streak)),
  };
}
