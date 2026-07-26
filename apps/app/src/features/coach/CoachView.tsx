"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { DashboardBottomNav } from "@/features/dashboard";
import {
  Button,
  PageHeader,
  PageShell,
  Reveal,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
} from "@momentum/ui";
import { useCoachData } from "./hooks/use-coach-data";
import { useCoachInsight } from "./hooks/use-coach-insight";
import { useCoachConversation } from "./hooks/use-coach-conversation";
import {
  CoachChatPanel,
  CoachGreetingCard,
  ConsistencyScoreCard,
  FocusAreasCard,
  PersonalizedInsightCard,
  RecommendationsList,
} from "./components";

export function CoachSkeleton() {
  return (
    <PageShell className="gap-6">
      <SkeletonGroup label="Loading your coach">
        <div className="flex flex-col gap-6">
          <SkeletonText lines={2} />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SkeletonGroup>
    </PageShell>
  );
}

/**
 * Sprint 9 "AI Coach Screen" — docs/design/references/coach.png's
 * stat-dashboard layout (greeting, Consistency Score, Personalized Insight,
 * Recommendations, Focus Areas + radar), plus a Q&A affordance behind the
 * header's sparkle button (not in the reference — see CoachChatPanel).
 * Coach is a bottom-nav destination like Dashboard/Progress, so its
 * PageHeader has no back button, matching that same precedent.
 */
export function CoachView() {
  const state = useCoachData();
  const insight = useCoachInsight();
  const conversation = useCoachConversation();
  const [chatOpen, setChatOpen] = React.useState(false);

  if (state.status === "loading") {
    return <CoachSkeleton />;
  }

  const { data } = state;

  return (
    <>
      <PageShell className="gap-6">
        <Reveal className="flex flex-col gap-6">
          <PageHeader
            title="AI Coach"
            description="Your Personal Guide"
            actions={
              <Button
                variant="ghost"
                size="icon"
                aria-label={chatOpen ? "Hide chat" : "Ask your AI Coach"}
                aria-pressed={chatOpen}
                onClick={() => setChatOpen((open) => !open)}
              >
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </Button>
            }
          />

          {chatOpen ? (
            <CoachChatPanel
              messages={conversation.messages}
              loaded={conversation.loaded}
              sendStatus={conversation.sendStatus}
              onSend={conversation.send}
            />
          ) : null}

          <CoachGreetingCard
            displayName={data.displayName}
            streakCurrent={data.streakCurrent}
          />
          <ConsistencyScoreCard score={data.consistencyScore} />
          <PersonalizedInsightCard
            status={insight.status}
            message={insight.message}
          />
          <RecommendationsList items={insight.suggestedExercises} />
          {data.focusAreas ? <FocusAreasCard areas={data.focusAreas} /> : null}
        </Reveal>
      </PageShell>
      <DashboardBottomNav />
    </>
  );
}
