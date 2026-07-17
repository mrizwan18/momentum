# Momentum Engineering Bible

## Volume III --- Engineering

### Chapter 1: Scoring & Growth Mathematics

Version: 1.0

# Purpose

The Scoring Engine is the mathematical foundation of Momentum.

Its goals are to: - Reward consistency over intensity. - Encourage
complete practice sessions. - Celebrate recovery after breaks. - Produce
explainable scores.

---

# Core Metrics

## Daily Score (0--100)

DailyScore = (Breathing × 0.15) + (Warmup × 0.10) + (Scales × 0.20) +
(Technique × 0.20) + (Song × 0.20) + (Recording × 0.10) + (Reflection ×
0.05)

Each category contributes 0--100 before weighting.

---

## Growth Score (0--100)

Represents long-term improvement.

Inputs: - 30-day consistency - Practice hours - Recording frequency -
Roadmap completion - Reflection completion

Updated once per completed session using a rolling average.

Growth Score changes slowly to avoid noisy feedback.

---

## Momentum Score (0--100)

Purpose: Estimate the user's likelihood of maintaining the habit.

Increase: + Practice today + Complete all required exercises + Recovery
session completed + Reflection

Decrease: - Consecutive missed days - Incomplete sessions

Decay should be gradual, never catastrophic.

---

# XP System

Session XP

Base: 100 XP

Bonuses: +20 Recording +15 Reflection +10 Side Quest +25 Weekly
Assessment +50 Chapter Completion

No penalties for missed days.

---

# Streak Rules

A streak increases when at least one qualifying practice session is
completed.

Qualifying session: - ≥10 minutes OR - Recovery session completed

Breaking a streak: - Preserve longest streak. - Unlock recovery
guidance. - Do not reduce Growth Score.

---

# Recommendation Priority

1.  Recovery
2.  Roadmap blocker
3.  Frequently skipped exercise
4.  Reflection trend
5.  Coach recommendation
6.  Optional side quest

Only one primary recommendation is surfaced.

---

# Example

Session: Breathing 100 Warmup 90 Scales 80 Technique 70 Song 85
Recording 100 Reflection 100

Daily Score ≈ 87

XP: 100 +20 +15 =135 XP

Momentum: +4

Growth: +0.3

---

# Pseudocode

    dailyScore = weightedAverage(exercises)

    if recoveryCompleted:
        momentum += recoveryBonus

    if recordingCompleted:
        xp += recordingBonus

    growth = rollingAverage(last30Days)

---

# Edge Cases

- Multiple sessions/day → highest score + cumulative XP.
- Interrupted session → resume without penalty.
- Imported data → recalculate metrics.
- Offline mode → identical calculations.

---

# Unit Test Scenarios

✓ First practice ✓ 30-day streak ✓ Recovery after 5 missed days ✓
Recording skipped ✓ Reflection skipped ✓ Multiple sessions ✓ Import
historical data

---

# Acceptance Criteria

- Scores are deterministic.
- Formulas are documented.
- Every score is explainable.
- No hidden modifiers.
- Works entirely offline.
