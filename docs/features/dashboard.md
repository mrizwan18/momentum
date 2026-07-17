# 10_DASHBOARD.md

# Dashboard Specification

## Purpose

The dashboard is the emotional home of Riyaaz. In under 5 seconds it
should answer: - Did I practice today? - What should I do next? - Am I
improving?

## Layout Order

1.  Greeting ("Good Evening, Rizwan")
2.  Current Streak
3.  Today's Vocal Score (animated ring)
4.  Today's One Thing
5.  Resume / Start Practice CTA
6.  Practice Checklist
7.  Momentum Card
8.  Weekly Snapshot
9.  Roadmap Progress
10. Latest Achievement

## Hero Section

Large typography. Friendly greeting based on time. Subtitle adapts: -
"Let's keep your streak alive." - "Welcome back." - "Recovery sessions
count too."

## Streak Card

Display: - Current streak - Longest streak - Days until next milestone

Milestones: 7, 14, 30, 60, 100, 180, 365 days.

## Today's Score

Animated 0--100. Tap to view score breakdown: - Pitch - Breath -
Technique - Consistency - Expression

## Today's One Thing

One actionable recommendation only. Examples: - Hold Sa for 15
seconds. - Record today's song. - Focus on breathing.

## Practice Checklist

Exercises: - Breathing - Warmup - Sa Re Ga Ma - Alankars - Song -
Recording - Reflection

Completion animates with XP burst.

## Momentum Card

Momentum is separate from streak. High momentum survives occasional
missed days. Factors: - Frequency - Session duration - Recovery behavior

## Weekly Snapshot

Show: - Practice hours - Avg score - Sessions completed - Best
improvement

## Roadmap Widget

Current: Month → Week → Day Progress bar. Next lesson preview.

## Achievement Widget

Latest unlocked badge. Tap to open achievement gallery.

## States

Empty: Guide first practice.

Partial: Encourage completion.

Complete: Celebrate and suggest reviewing recordings.

Recovery: Offer 10-minute comeback session.

## Accessibility

44px touch targets. Screen reader labels. Reduced motion support.

## Acceptance Criteria

- Loads in \<2s.
- Every card actionable.
- One primary CTA.
- Offline capable.
- Responsive.

# 14_PROGRESS.md

# Progress & Growth Engine Specification

## Vision

The Progress section is the user's evidence that consistent practice
works.

It should answer: - Am I improving? - How consistent am I? - What should
I focus on next?

---

# Objectives

- Visualize long-term growth.
- Reinforce consistency.
- Surface meaningful trends.
- Avoid overwhelming users with raw data.

---

# Navigation

Tabs: - Overview - Calendar - Growth - Personal Bests - Voice Timeline

---

# Overview

Display: - Total practice hours - Total sessions - Current streak -
Longest streak - Momentum score - Growth score - XP - Roadmap completion

---

# Growth Score

A long-term metric (0--100) based on:

- Weekly consistency
- Practice duration
- Recording frequency
- Roadmap completion
- Reflection completion

Unlike the daily score, Growth Score changes slowly and rewards
sustained effort.

---

# Momentum Score

Predicts the likelihood of maintaining the habit.

Influenced by: - Practice frequency - Recovery sessions - Missed days -
Session quality

Displayed as: Low / Medium / High + percentage.

---

# Charts

Weekly: - Practice minutes - Daily score - Sessions

Monthly: - Growth score - Momentum - Recording count

Yearly: - Practice heatmap - Hours practiced - Streak history

---

# Personal Bests

Track: - Longest streak - Highest daily score - Longest recording - Most
practice in one week - Fastest roadmap completion

Celebrate new records with subtle animations.

---

# Insights

Examples: - "You've practiced 18 days this month." - "Recording
frequency has increased." - "Breathing exercises are completed most
consistently."

Always include one recommended action.

---

# Empty State

If no data exists: - Encourage the first practice session. - Explain how
progress will appear over time.

---

# Accessibility

Charts must include textual summaries.

Do not rely on color alone.

---

# Acceptance Criteria

✓ Progress updates after every completed session. ✓ Charts render
offline. ✓ Growth Score remains stable and meaningful. ✓ Insights adapt
to user history.

# 17_CALENDAR.md

# Calendar & Habit History Specification

## Vision

The Calendar is the visual heartbeat of Riyaaz.

Like GitHub's contribution graph, it gives users an immediate sense of
consistency while allowing them to revisit any day in their journey.

The goal is to answer: - Did I show up today? - How consistent have I
been? - Which days were my best? - What happened on a specific day?

---

# Design Goals

- Instantly communicate consistency.
- Reward habits, not perfection.
- Make historical sessions easy to revisit.
- Encourage users to "not break the chain."
- Keep the interface calm and uncluttered.

---

# Primary Views

## Month View (default)

GitHub-style contribution heatmap.

## Week View

Shows individual sessions and durations.

## Year View

Bird's-eye view of consistency across the year.

---

# Color Legend

Gray - No practice

Light Green - Practice completed

Dark Green - Excellent session

Orange - Personal best achieved

Gold - Milestone or achievement unlocked

Colors must always have icons/text equivalents for accessibility.

---

# Daily Detail Drawer

Tapping a day opens:

- Practice duration
- Session score
- Exercises completed
- Song practiced
- Recording count
- Reflection notes
- Coach feedback
- Achievements unlocked
- Link to recordings

---

# Calendar Statistics

Display:

- Current streak
- Longest streak
- Practice days this month
- Practice rate (%)
- Average session duration
- Missed days
- Recovery sessions completed

---

# Smart Insights

Examples:

"You've practiced every Monday this month."

"Thursday is your most consistent practice day."

"You usually practice around 10 PM."

"Your longest streak started after enabling reminders."

Always end with one recommendation.

---

# Streak Philosophy

A missed day should never feel like failure.

If a streak breaks:

- Preserve longest streak.
- Highlight momentum.
- Suggest a recovery session.

Do not use negative language.

---

# Filters

View by:

- Month
- Skill
- Roadmap
- Song
- Session type
- Recording available
- Favorites

---

# Widgets

Mini calendar widget for Dashboard:

- Today's status
- Current streak
- This week's consistency

---

# Offline Behavior

Everything must function without internet.

No external APIs.

---

# Edge Cases

- Multiple sessions in one day
- Imported historical data
- Timezone changes
- Device clock changes
- Leap years

---

# Acceptance Criteria

✓ Calendar updates immediately after a session.

✓ Every day links to its session history.

✓ Heatmap renders efficiently for multiple years.

✓ Filters work offline.

✓ Accessibility requirements satisfied.
