"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Button,
  EmptyState,
  ErrorState,
  PageShell,
  Reveal,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
} from "@momentum/ui";
import { SessionSummaryScreen, useSessionInsight } from "@/features/summary";
import { usePracticeSession } from "./hooks/use-practice-session";
import { ActivePracticeScreen } from "./components/ActivePracticeScreen";
import { ExitConfirmDialog } from "./components/ExitConfirmDialog";
import { InterruptedPrompt } from "./components/InterruptedPrompt";
import { PracticeEnded } from "./components/PracticeEnded";
import { PracticeStartCard } from "./components/PracticeStartCard";

export function PracticeSkeleton() {
  return (
    <PageShell withBottomNav={false} className="gap-6">
      <SkeletonGroup label="Loading practice">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-52 w-full rounded-hero" />
          <Skeleton className="h-14 w-full rounded-control" />
          <SkeletonText lines={2} />
        </div>
      </SkeletonGroup>
    </PageShell>
  );
}

/**
 * Orchestrates every Practice screen from the state machine's status, per
 * docs/engineering/state-machines.md. usePracticeSession is the single
 * source of truth — this component only decides what to render for each
 * status and wires user interactions to its actions.
 */
export function PracticeView() {
  const session = usePracticeSession();
  const [exitDialogOpen, setExitDialogOpen] = React.useState(false);
  const sessionInsight = useSessionInsight();
  const insightRunRef = React.useRef<string | null>(null);

  // The real AI Gateway call runs in the background as soon as the session
  // machine reaches "completed" — SessionSummaryScreen renders immediately
  // with the deterministic summary and progressively shows the AI insight
  // once it lands, rather than blocking on it (Sprint 9 "Practice Session
  // AI").
  React.useEffect(() => {
    if (session.machine.status !== "completed") return;
    const { session: finished, summary } = session.machine;
    if (insightRunRef.current === finished.id) return;
    insightRunRef.current = finished.id;
    void sessionInsight.run({
      sessionId: finished.id,
      elapsedSeconds: finished.elapsedSeconds,
      exercisesCompleted: summary.exercisesCompleted,
      dailyScore: summary.dailyScore,
    });
  }, [session.machine, sessionInsight.run]);

  if (session.catalogState === "loading") {
    return <PracticeSkeleton />;
  }

  if (session.catalogState === "error") {
    return (
      <PageShell withBottomNav={false}>
        <ErrorState
          title="Couldn't load practice"
          description={session.loadError ?? undefined}
          actionLabel="Try again"
          onAction={session.retryLoad}
        />
      </PageShell>
    );
  }

  if (session.catalogState === "empty" || !session.catalog) {
    return (
      <PageShell withBottomNav={false}>
        <EmptyState
          title="Practice isn't ready yet"
          description="We couldn't set up today's exercises. Please try again."
          actionLabel="Try again"
          onAction={session.retryLoad}
        />
      </PageShell>
    );
  }

  const catalog = session.catalog;
  const { machine } = session;

  return (
    <PageShell withBottomNav={false}>
      {session.actionError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-lg border border-danger bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          <span>{session.actionError}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss error"
            onClick={session.dismissActionError}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {machine.status === "idle" || machine.status === "preparing" ? (
        <Reveal>
          <PracticeStartCard
            catalog={catalog}
            isPreparing={machine.status === "preparing"}
            isBusy={session.isBusy}
            onStart={session.startPractice}
            onSelectVoiceCondition={(voiceCondition) =>
              session.beginSession({ voiceCondition })
            }
            onCancelPreparing={session.cancelPreparing}
          />
        </Reveal>
      ) : null}

      {machine.status === "interrupted" ? (
        <InterruptedPrompt
          open
          onResume={session.resumeInterrupted}
          onDiscard={session.discardInterrupted}
          discardLoading={session.isBusy}
        />
      ) : null}

      {machine.status === "practicing" || machine.status === "paused" ? (
        <ActivePracticeScreen
          key={machine.session.id}
          session={machine.session}
          catalog={catalog}
          isPaused={machine.status === "paused"}
          isBusy={session.isBusy}
          onPause={session.pause}
          onResume={session.resume}
          onRecordElapsed={session.recordElapsed}
          onSaveDraftNotes={session.saveDraftNotes}
          onCompleteExercise={session.completeExercise}
          onExitRequest={() => setExitDialogOpen(true)}
        />
      ) : null}

      {machine.status === "completed" ? (
        <SessionSummaryScreen
          summary={machine.summary}
          aiInsight={sessionInsight.insight}
          aiInsightStatus={sessionInsight.status}
        />
      ) : null}

      {machine.status === "cancelled" ? <PracticeEnded /> : null}

      <ExitConfirmDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        onPauseAndExit={async () => {
          await session.pause();
          setExitDialogOpen(false);
        }}
        onEndSession={async () => {
          await session.cancel();
          setExitDialogOpen(false);
        }}
        endLoading={session.isBusy}
      />
    </PageShell>
  );
}
