# 13_AI_COACH.md

# AI Coach Specification

## Vision

The AI Coach is the user's encouraging mentor. It does not analyze audio
with machine learning in v1. Instead, it uses deterministic heuristics
derived from the user's practice history to provide personalized,
varied, and actionable coaching.

---

# Objectives

- Encourage daily practice.
- Highlight improvement.
- Recommend exactly one priority at a time.
- Prevent guilt after missed days.
- Make every session end with a useful insight.

---

# Core Principles

1.  Be encouraging, never judgmental.
2.  Celebrate effort before results.
3.  Give one actionable suggestion.
4.  Avoid repeating the same advice frequently.
5.  Adapt recommendations based on recent practice.

---

# Inputs

The Coach Engine consumes:

- Practice frequency
- Streak
- Momentum score
- Session duration
- Exercise completion
- Reflection answers
- Voice condition
- Recording frequency
- Roadmap progress

---

# Outputs

Generate:

- Today's Advice
- Session Feedback
- Weekly Summary
- Recovery Guidance
- Milestone Congratulations
- Tomorrow's One Thing

---

# Coaching Categories

- Breathing
- Pitch
- Consistency
- Confidence
- Expression
- Rhythm
- Recovery
- Motivation

---

# Message Structure

Every message contains:

1.  Observation
2.  Encouragement
3.  One action

Example:

Observation: "You practiced four days this week."

Encouragement: "Your consistency is improving."

Action: "Record tomorrow's song to track your progress."

---

# Recovery Coaching

After missed days:

Never mention failure.

Instead:

"Welcome back. A short practice today is enough to rebuild momentum."

---

# Weekly Report

Summarize:

- Sessions completed
- Practice time
- Strongest habit
- Improvement area
- Recommended focus

---

# Variety Rules

Maintain a message history.

Avoid repeating identical advice within the previous 14 days unless the
same issue persists.

---

# Tone of Voice

Friendly

Supportive

Professional

Calm

Short sentences.

Never use sarcasm or shame.

---

# Data Requirements

Persist:

- Coach message history
- Last advice category
- Weekly summaries
- Recovery history

---

# Acceptance Criteria

✓ Advice is deterministic.

✓ Advice changes based on user behavior.

✓ No network access required.

✓ Every session ends with actionable feedback.

✓ Recovery messages remain positive.

# 16_FUTURE_YOU.md

# Future You Specification

## Vision

Future You transforms statistics into aspiration.

Instead of showing only past progress, it visualizes where the user is
headed if they continue practicing consistently.

The purpose is motivation---not prediction certainty.

---

# Goals

- Create a compelling long-term vision.
- Connect today's practice with future results.
- Reward consistency over perfection.
- Help users understand the impact of missing or maintaining habits.

---

# Core Principles

- Clearly label projections as estimates.
- Base projections on the user's actual history.
- Encourage, never pressure.
- Update after every completed session.

---

# Projection Horizons

- 30 Days
- 90 Days
- 180 Days
- 365 Days

---

# Inputs

Use historical data:

- Practice frequency
- Average session duration
- Momentum score
- Growth score
- Roadmap completion rate
- Recording frequency
- Recovery behavior

---

# Outputs

Display estimated:

- Practice hours
- Sessions completed
- Roadmap milestone
- Recording count
- Longest streak
- Growth score
- Skill mastery percentages:
  - Breath
  - Pitch
  - Rhythm
  - Expression
  - Consistency

---

# Future Snapshot Card

Example

"You've been remarkably consistent.

If you continue at this pace, in 90 days you'll likely:

• Finish Month 4 • Record 35 more practice sessions • Reach \~60 total
practice hours • Improve your Growth Score to \~82"

Always include a reminder that projections change with future practice.

---

# Scenario Simulator

Allow users to compare scenarios:

- Current pace
- +10 minutes per session
- 6 days/week
- Daily practice

Show how projections change.

---

# Motivation Rules

Focus on possibility, not promises.

Good: "At your current pace, you're on track to..."

Avoid: "You will definitely..."

---

# Empty State

If insufficient history:

"Complete a few practice sessions and Future You will begin generating
personalized projections."

---

# Accessibility

Provide text summaries for every chart and visualization.

---

# Acceptance Criteria

✓ Updates after each completed session. ✓ Works fully offline. ✓ Clearly
distinguishes projections from historical facts. ✓ Encourages long-term
consistency without unrealistic claims.

# 18_ACHIEVEMENTS.md

# Achievement System Specification

## Vision

Achievements celebrate growth, consistency and courage.

They should never feel like arbitrary badges. Every achievement should
represent a meaningful milestone in the user's musical journey.

---

# Design Principles

- Reward effort before talent.
- Celebrate consistency.
- Surprise users occasionally.
- Make long-term goals aspirational.
- Avoid overwhelming users with hundreds of visible badges.

---

# Categories

## 1. Consistency 🟢

Examples: - First Practice - 3-Day Streak - 7-Day Streak - 14-Day
Streak - 30-Day Streak - 100-Day Streak - Recovery Hero (returned after
a break)

---

## 2. Growth 🔵

Examples: - First Full Song - Complete Month 1 - 10 Practice Hours - 50
Practice Hours - Highest Growth Score - Finished First Roadmap

---

## 3. Courage 🟣

Examples: - First Recording - First Recording Comparison - Shared Your
Progress (future) - Recorded Three Days in a Row - Completed Reflection
for 30 Days

---

## 4. Legacy 🟡

Examples: - One Year Practicing - 500 Practice Hours - 1000 Sessions -
Five-Year Anniversary - Completed Every Skill Pack

---

# Achievement Structure

Each achievement stores:

- ID
- Name
- Description
- Category
- Tier
- XP Reward
- Unlock Date
- Icon
- Hidden (true/false)

---

# Tiers

Bronze

Silver

Gold

Platinum

Diamond

Visuals should evolve with each tier.

---

# Unlock Animation

Sequence:

1.  Brief vibration (if supported)
2.  Card slides into view
3.  Badge scales in
4.  XP counter animates
5.  "View Achievement" CTA

Animation duration \< 2 seconds.

---

# Hidden Achievements

Some achievements remain hidden until earned.

Example: "You've unlocked a secret milestone!"

Purpose: Create moments of delight.

---

# Achievement Gallery

Filters:

- All
- Locked
- Unlocked
- Category
- Tier

Progress bars show completion toward the next achievement.

---

# XP Rewards

Bronze: 25 XP

Silver: 50 XP

Gold: 100 XP

Platinum: 250 XP

Diamond: 500 XP

XP contributes to overall progression but never replaces meaningful
feedback.

---

# Notifications

Unlocks should appear:

- Immediately after session
- On Dashboard
- Weekly Report
- Timeline

Never interrupt recording or active practice.

---

# Accessibility

Icons must have labels.

Animations respect reduced-motion preferences.

Achievements remain understandable without color.

---

# Acceptance Criteria

✓ Unlock logic is deterministic. ✓ Achievements persist offline. ✓
Hidden achievements reveal correctly. ✓ Gallery supports search and
filters. ✓ XP awarded exactly once per achievement.
