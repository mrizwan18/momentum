import { describe, expect, it } from "vitest";
import { describeContext } from "./shared";
import { buildAssessmentPrompt } from "./onboarding-assessment";
import { buildCoachPrompt } from "./coach";
import type { AiUserContext } from "../schemas/ai-user-context";

function emptyContext(overrides: Partial<AiUserContext> = {}): AiUserContext {
  return {
    profile: {
      displayName: null,
      age: null,
      activeSkillId: null,
      onboardingCompletedAt: null,
    },
    streak: { current: 0, longest: 0, lastPracticeDate: null },
    statistics: { last30Days: [] },
    recentSessions: [],
    recentRecordings: [],
    achievements: [],
    goals: [],
    coachHistory: [],
    recommendations: [],
    exerciseDistribution: [],
    baseline: null,
    ...overrides,
  };
}

describe("describeContext", () => {
  it("never renders 'undefined' or 'null' literals for an empty context", () => {
    const text = describeContext(emptyContext());
    expect(text).not.toMatch(/undefined/i);
    expect(text.toLowerCase()).not.toContain("null");
  });

  it("says there's no active streak when current is 0", () => {
    const text = describeContext(emptyContext());
    expect(text).toContain("No active streak");
  });

  it("reports the real streak when one exists", () => {
    const text = describeContext(
      emptyContext({
        streak: { current: 7, longest: 10, lastPracticeDate: "2026-07-25" },
      }),
    );
    expect(text).toContain("7 day(s)");
    expect(text).toContain("longest 10");
  });

  it("mentions the baseline score only when a baseline exists", () => {
    const withBaseline = describeContext(
      emptyContext({
        baseline: { overallScore: 72, metrics: {}, createdAt: 0 },
      }),
    );
    expect(withBaseline).toContain("72/100");

    const without = describeContext(emptyContext());
    expect(without).toContain("No baseline assessment yet");
  });
});

describe("buildAssessmentPrompt", () => {
  it("includes the JSON-only instruction and the real recording duration", () => {
    const prompt = buildAssessmentPrompt({
      context: emptyContext(),
      recordingDurationMs: 12000,
    });
    expect(prompt).toContain("ONLY valid JSON");
    expect(prompt).toContain("12 seconds");
  });

  it("tells the model to estimate from context when no audio is attached", () => {
    const prompt = buildAssessmentPrompt({
      context: emptyContext(),
      recordingDurationMs: 12000,
    });
    expect(prompt).toContain("No audio is attached");
  });

  it("instructs the model to genuinely listen when real audio is attached", () => {
    const prompt = buildAssessmentPrompt({
      context: emptyContext(),
      recordingDurationMs: 12000,
      audio: [
        { base64: "abc", format: "wav", durationSeconds: 12, truncated: false },
      ],
    });
    expect(prompt).toContain("actual recorded audio");
    expect(prompt).not.toContain("No audio is attached");
  });
});

describe("buildCoachPrompt", () => {
  it("embeds the user's actual message", () => {
    const prompt = buildCoachPrompt({
      context: emptyContext(),
      message: "Why is my pitch off?",
    });
    expect(prompt).toContain("Why is my pitch off?");
  });
});
