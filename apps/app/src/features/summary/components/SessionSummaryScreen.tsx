"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Flame,
  Mic,
  NotebookPen,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Cluster,
  Heading,
  NumberDisplay,
  Reveal,
  Stack,
  Text,
  triggerHaptic,
} from "@momentum/ui";
import { NotificationOptInPrompt } from "@/components/NotificationOptInPrompt";
import { toDateOnly } from "@/lib/date";
import { formatDuration } from "@/lib/format-duration";
import type { SessionSummaryView } from "../services/summary-service";
import { useSessionAudioAnalysis } from "../hooks/use-session-audio-analysis";

export interface SessionSummaryScreenProps {
  summary: SessionSummaryView;
}

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  caption?: string;
}

function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-raised p-4">
      <Text tone="muted" size="sm">
        {label}
      </Text>
      <NumberDisplay size="lg">{value}</NumberDisplay>
      {caption ? (
        <Text tone="muted" size="sm">
          {caption}
        </Text>
      ) : null}
    </div>
  );
}

/**
 * docs/engineering/scoring-engine.md-driven Session Summary: shown inline
 * within /practice once the state machine reaches `completed` (Recording
 * lives inline within Practice too — same precedent, no dedicated route).
 * Every number here comes from `buildSessionSummary`; nothing is fabricated
 * for effect.
 */
export function SessionSummaryScreen({ summary }: SessionSummaryScreenProps) {
  const analysis = useSessionAudioAnalysis(summary.session.id, {
    elapsedSeconds: summary.session.elapsedSeconds,
    exercisesCompleted: summary.exercisesCompleted,
    dailyScore: summary.dailyScore,
  });

  React.useEffect(() => {
    triggerHaptic("success");
  }, []);

  const bestBadges = [
    summary.personalBests.isBestDailyScore ? "Best score yet" : null,
    summary.personalBests.isLongestSession ? "Longest session yet" : null,
    summary.personalBests.isMostExercisesCompleted
      ? "Most exercises yet"
      : null,
  ].filter((label): label is string => label !== null);

  return (
    <div className="flex flex-col gap-6 py-8">
      <Reveal
        variant="scale"
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="rounded-full bg-primary/10 p-6">
          <CheckCircle2 aria-hidden="true" className="h-16 w-16 text-primary" />
        </div>
        <Stack gap="xs" className="items-center">
          <Heading as="h1" size="hero">
            Session complete
          </Heading>
          <Text tone="muted" size="lg" role="status" aria-live="polite">
            {summary.motivationalMessage}
          </Text>
        </Stack>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Duration"
            value={formatDuration(summary.durationSeconds)}
          />
          <StatTile
            label="Exercises"
            value={`${summary.exercisesCompleted}/${summary.totalExercises}`}
            caption={
              summary.exercisesSkipped > 0
                ? `${summary.exercisesSkipped} skipped`
                : undefined
            }
          />
          <StatTile label="XP Earned" value={`+${summary.xpEarned}`} />
          <StatTile label="Daily Score" value={summary.dailyScore} />
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <Cluster gap="sm" className="items-center justify-between">
              <Cluster gap="sm" className="items-center">
                <Flame aria-hidden="true" className="h-5 w-5 text-primary" />
                <Text size="sm" className="font-medium">
                  Streak
                </Text>
              </Cluster>
              <Text size="sm" className="font-semibold">
                {summary.streak.qualifying
                  ? `${summary.streak.current} ${summary.streak.current === 1 ? "day" : "days"}`
                  : "Not counted"}
              </Text>
            </Cluster>
            <Cluster gap="sm" className="items-center justify-between">
              <Text size="sm" className="font-medium">
                Practice consistency
              </Text>
              <Text size="sm" className="font-semibold">
                {summary.consistency.daysPracticed}/
                {summary.consistency.totalDays} days
              </Text>
            </Cluster>
            <Cluster gap="sm" className="items-center justify-between">
              <Cluster gap="sm" className="items-center">
                <Mic aria-hidden="true" className="h-5 w-5 text-primary" />
                <Text size="sm" className="font-medium">
                  Recordings
                </Text>
              </Cluster>
              <Text size="sm" className="font-semibold">
                {summary.recordingCount}
              </Text>
            </Cluster>
          </CardContent>
        </Card>
      </Reveal>

      {bestBadges.length > 0 ? (
        <Reveal delay={0.3}>
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Trophy aria-hidden="true" className="h-5 w-5 text-primary" />
              <CardTitle as="h2">Personal bests</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {bestBadges.map((label) => (
                <Text key={label} size="sm">
                  🏆 {label}
                </Text>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      {summary.notes.length > 0 ? (
        <Reveal delay={0.35}>
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <NotebookPen
                aria-hidden="true"
                className="h-5 w-5 text-primary"
              />
              <CardTitle as="h2">Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {summary.notes.map((note, index) => (
                <div
                  key={`${note.exerciseTitle}-${index}`}
                  className="flex flex-col gap-1"
                >
                  <Text size="sm" className="font-medium">
                    {note.exerciseTitle}
                  </Text>
                  <Text tone="muted" size="sm">
                    {note.note}
                  </Text>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      {analysis.status === "no-recordings" ||
      analysis.status === "loading" ? null : (
        <Reveal delay={0.4}>
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-primary" />
              <CardTitle as="h2">AI Coach Insight</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {analysis.status === "idle" ? (
                <>
                  <Text tone="muted" size="sm">
                    Get AI feedback on the recording(s) you made this session.
                    Your recording will be sent to OpenAI for analysis.
                  </Text>
                  <Button
                    onClick={() => void analysis.analyze()}
                    className="h-12 w-full"
                  >
                    Analyze with AI
                  </Button>
                </>
              ) : analysis.status === "encoding" ? (
                <Text tone="muted" size="sm">
                  Preparing your recordings…
                </Text>
              ) : analysis.status === "analyzing" ? (
                <Text tone="muted" size="sm">
                  Analyzing your recordings…
                </Text>
              ) : analysis.status === "error" ? (
                <>
                  <Text size="sm" role="alert">
                    {analysis.errorMessage}
                  </Text>
                  <Button
                    variant="secondary"
                    onClick={() => void analysis.analyze()}
                    className="h-12 w-full"
                  >
                    Try again
                  </Button>
                </>
              ) : analysis.status === "ready" && analysis.insight ? (
                <>
                  <Text size="sm">{analysis.insight.encouragingSentence}</Text>
                  {analysis.insight.whatImproved.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <Text size="sm" className="font-medium">
                        What improved
                      </Text>
                      {analysis.insight.whatImproved.map((item) => (
                        <Text key={item} tone="muted" size="sm">
                          • {item}
                        </Text>
                      ))}
                    </div>
                  ) : null}
                  {analysis.insight.whatDeclined.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <Text size="sm" className="font-medium">
                        What declined
                      </Text>
                      {analysis.insight.whatDeclined.map((item) => (
                        <Text key={item} tone="muted" size="sm">
                          • {item}
                        </Text>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-1">
                    <Text size="sm" className="font-medium">
                      Best moment
                    </Text>
                    <Text tone="muted" size="sm">
                      {analysis.insight.bestMoment}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text size="sm" className="font-medium">
                      Biggest opportunity
                    </Text>
                    <Text tone="muted" size="sm">
                      {analysis.insight.biggestOpportunity}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text size="sm" className="font-medium">
                      Tomorrow&apos;s goal
                    </Text>
                    <Text tone="muted" size="sm">
                      {analysis.insight.tomorrowsGoal}
                    </Text>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </Reveal>
      )}

      <NotificationOptInPrompt
        engagement={{
          currentStreak: summary.streak.current,
          lastPracticedDate: toDateOnly(new Date()),
        }}
      />

      <Reveal delay={0.45}>
        <Button asChild className="h-14 w-full text-base font-semibold">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </Reveal>
    </div>
  );
}
