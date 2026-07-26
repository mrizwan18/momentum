import type { AiUserContext } from "@/ai/schemas";

/** docs/features/coach.md "Coaching Categories". */
const CATEGORY_ACTIONS: Record<string, string> = {
  Breathing:
    "Spend two minutes on slow diaphragmatic breathing before your next session.",
  Pitch: "Run a slow scale today, listening closely for pitch drift.",
  Consistency:
    "Keep today's session short but don't skip it — consistency beats intensity.",
  Confidence:
    "Record yourself once today, even briefly — it builds confidence fast.",
  Expression:
    "Pick one phrase and sing it three different ways to build expression.",
  Rhythm: "Practice with a slow metronome today to lock in your timing.",
  Motivation: "Set one small, achievable goal for today's session.",
};

const CATEGORIES = Object.keys(CATEGORY_ACTIONS);

function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface DeterministicCoachReply {
  message: string;
  suggestedExercises: string[];
}

/**
 * docs/features/coach.md's original deterministic heuristic Coach, reused
 * here as the Coach's offline/AI-unavailable fallback (the user's approved
 * Hybrid architecture: LLM online, deterministic fallback offline). Same
 * tone and Observation -> Encouragement -> Action structure as the spec.
 * No network access; seeded only from real context fields, never invented.
 */
export function buildDeterministicCoachReply(
  context: Pick<AiUserContext, "streak" | "recentSessions">,
  userMessage: string,
): DeterministicCoachReply {
  const isRecovering =
    context.streak.current === 0 && context.recentSessions.length > 0;

  if (isRecovering) {
    const action = "A short, easy session today is enough to rebuild momentum.";
    return {
      message: `Welcome back. ${action}`,
      suggestedExercises: [action],
    };
  }

  const category =
    CATEGORIES[
      hashString(
        `${userMessage}:${context.streak.current}:${context.recentSessions.length}`,
      ) % CATEGORIES.length
    ];
  const action = CATEGORY_ACTIONS[category];

  const observation =
    context.streak.current > 0
      ? `You've practiced ${context.streak.current} day${context.streak.current === 1 ? "" : "s"} in a row.`
      : "You're just getting started, which is the hardest part.";
  const encouragement =
    context.streak.current >= 3
      ? "Your consistency is really paying off."
      : "Every session adds up more than it feels like right now.";

  return {
    message: `${observation} ${encouragement} ${action}`,
    suggestedExercises: [action],
  };
}
