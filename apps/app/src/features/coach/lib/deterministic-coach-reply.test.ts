import { describe, expect, it } from "vitest";
import { buildDeterministicCoachReply } from "./deterministic-coach-reply";

describe("buildDeterministicCoachReply", () => {
  it("gives a recovery message when the streak just broke but the user has history", () => {
    const reply = buildDeterministicCoachReply(
      {
        streak: { current: 0, longest: 5, lastPracticeDate: "2026-07-20" },
        recentSessions: [
          {
            sessionId: "s1",
            completedAt: 1,
            elapsedSeconds: 60,
            exercisesCompleted: 1,
            dailyScore: 50,
            xpEarned: 10,
          },
        ],
      },
      "How am I doing?",
    );
    expect(reply.message).toContain("Welcome back");
    expect(reply.message).not.toMatch(/fail|missed/i);
  });

  it("never mentions failure or shame for a brand-new user", () => {
    const reply = buildDeterministicCoachReply(
      {
        streak: { current: 0, longest: 0, lastPracticeDate: null },
        recentSessions: [],
      },
      "Any tips?",
    );
    expect(reply.message).toMatch(/just getting started/i);
    expect(reply.message).not.toMatch(/fail|missed|bad/i);
  });

  it("acknowledges a real streak in the observation", () => {
    const reply = buildDeterministicCoachReply(
      {
        streak: { current: 5, longest: 5, lastPracticeDate: "2026-07-25" },
        recentSessions: [],
      },
      "How am I doing?",
    );
    expect(reply.message).toContain("5 days in a row");
  });

  it("is deterministic for identical input", () => {
    const context = {
      streak: { current: 4, longest: 5, lastPracticeDate: "2026-07-25" },
      recentSessions: [],
    };
    const first = buildDeterministicCoachReply(
      context,
      "What should I practice?",
    );
    const second = buildDeterministicCoachReply(
      context,
      "What should I practice?",
    );
    expect(first).toEqual(second);
  });

  it("always returns exactly one suggested exercise, matching the 'one actionable suggestion' rule", () => {
    const reply = buildDeterministicCoachReply(
      {
        streak: { current: 2, longest: 2, lastPracticeDate: "2026-07-25" },
        recentSessions: [],
      },
      "What's next?",
    );
    expect(reply.suggestedExercises).toHaveLength(1);
  });
});
