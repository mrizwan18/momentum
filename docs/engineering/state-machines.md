# Momentum Engineering Bible

## Volume III --- Engineering

### Chapter 3: State Machines & Application Flow

Version: 1.0

# Purpose

Momentum is a state-driven application. Every feature must behave
predictably, recover gracefully, and never lose user progress.

---

# Core Principles

- Every state has a single entry point.
- Every transition is intentional.
- Every interrupted state is recoverable.
- No hidden transitions.

---

# Practice Session State Machine

Idle ↓ Prepare ↓ Warmup ↓ Exercise ↓ Recording (optional) ↓ Reflection ↓
Summary ↓ Completed

Recovery paths:

Exercise ↘ Pause ↘ Resume ↘ Cancel ↘ Auto-save

---

# Recording State Machine

Ready ↓ Recording ↓ Paused ↓ Recording ↓ Stopped ↓ Saved

Failure paths: - Permission denied - Storage full - Browser interruption

Always preserve metadata.

---

# Roadmap State Machine

Locked ↓ Unlocked ↓ In Progress ↓ Assessment ↓ Completed

If user misses 3+ days:

Completed Chapter ↓ Recovery Mode ↓ Resume Campaign

Never regress completed chapters.

---

# Dashboard State

Loading ↓ Hydrated ↓ Interactive

Fallback: Cached dashboard renders while repositories initialize.

---

# AI Coach State

Collect Metrics ↓ Generate Insight ↓ Select Recommendation ↓ Display

Insights are regenerated after every completed session.

---

# Global Events

Events:

SESSION_STARTED SESSION_PAUSED SESSION_RESUMED SESSION_COMPLETED
RECORDING_STARTED RECORDING_SAVED ACHIEVEMENT_UNLOCKED ROADMAP_UPDATED
SETTINGS_CHANGED

All events are immutable.

---

# Recovery Strategy

Unexpected close: → Restore active session

Tab refresh: → Resume timer

Crash: → Recover from latest checkpoint

No completed work should be lost.

---

# Acceptance Tests

✓ Resume interrupted session. ✓ Recording survives refresh. ✓ Dashboard
hydrates from cache. ✓ Coach updates after session completion. ✓
Recovery mode activates after inactivity.
