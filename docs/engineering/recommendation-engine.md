# Momentum Engineering Bible

## Volume III --- Engineering

### Chapter 2: Recommendation Engine

Version: 1.0

# Purpose

The Recommendation Engine decides the single most valuable action a user
should take today.

Its success is measured by increasing consistency, not maximizing
session length.

---

# Guiding Principle

Every day the user should see exactly **one** primary recommendation.

Too many choices reduce practice.

---

# Inputs

The engine evaluates:

- Current roadmap position
- Missed practice days
- Active streak
- Momentum score
- Growth score
- Voice condition
- Session duration history
- Reflection trends
- Recording frequency
- Previously skipped exercises
- Time available (optional)

---

# Priority Order

1.  Recovery
2.  Required roadmap mission
3.  Frequently skipped exercise
4.  Weakest habit
5.  Weekly assessment
6.  Recording reminder
7.  Side quest

Only the highest-priority item becomes "Today's One Thing".

---

# Decision Table

If missed_days \>= 3 → Recovery Session

Else if roadmap_blocked → Required Exercise

Else if recording_gap \> 7 days → Record Today's Practice

Else if reflection_missing \> 5 sessions → Complete Reflection

Else → Continue Roadmap

---

# Recommendation Object

Fields:

- title
- reason
- expectedDuration
- category
- priority
- xpReward
- completionCriteria

---

# Pseudocode

```text
if missedDays >= 3:
    recommend(Recovery)

elif roadmapBlocked:
    recommend(RoadmapMission)

elif recordingGap > 7:
    recommend(Recording)

elif weakestHabit:
    recommend(WeakestHabit)

else:
    recommend(NextRoadmapExercise)
```

---

# Anti-Goals

The engine must never:

- Recommend more than one primary task.
- Punish users for missing practice.
- Suggest advanced content before prerequisites.
- Recommend sessions exceeding the user's typical duration by more
  than 25%.

---

# Explainability

Every recommendation must answer:

- Why this?
- Why now?
- What benefit will I gain?

Example:

"Today's priority is a recording because you haven't recorded in 9 days.
A new recording will help you measure your progress."

---

# Edge Cases

- Imported history
- Empty history
- Skill switched
- Roadmap completed
- Offline mode
- Interrupted session

---

# Acceptance Tests

✓ New user receives onboarding recommendation. ✓ Returning user receives
roadmap recommendation. ✓ Recovery recommendation after 3 missed days. ✓
Recommendation updates immediately after completing today's task. ✓ Same
recommendation is not repeated unnecessarily.

---

# Success Metrics

- Recommendation completion rate
- Daily practice rate
- Recovery success rate
- Weekly roadmap progression
- User satisfaction with recommendations
