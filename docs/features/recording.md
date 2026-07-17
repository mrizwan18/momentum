# 12_RECORDING_STUDIO.md

# Recording Studio Specification

## Vision

The Recording Studio is the truth mirror of Riyaaz.

Users should not rely on memory to judge improvement. They should hear
it.

Every recording becomes part of a lifelong timeline.

---

# Goals

- Make recording effortless.
- Encourage frequent recordings.
- Preserve history.
- Make comparison simple.
- Never lose recordings.

---

# Primary Actions

- Record
- Pause
- Resume
- Stop
- Playback
- Rename
- Delete
- Favorite
- Compare

---

# Recording Metadata

Each recording stores:

- Date
- Time
- Duration
- Skill
- Song
- Exercise
- Roadmap week
- Session score
- Notes
- Voice condition
- Tags

---

# UI Layout

Header Current session

Waveform

Record button

Playback controls

Recording information

Notes

Actions

---

# Recording Flow

Practice → Record → Review → Save → Tag → Attach to Session → Voice
Timeline

---

# Waveform

Display live waveform while recording.

Support scrubbing during playback.

---

# Comparison Mode

Choose two recordings.

Display: - Recording A - Recording B

Quick switch

Loop playback

Timeline markers

Improvement notes

---

# Favorites

Allow users to pin important recordings.

Examples:

First recording

Best performance

Competition practice

Monthly benchmark

---

# Search

Filter by:

Song

Month

Week

Tags

Favorites

Duration

---

# Storage

Store locally.

Warn user when storage approaches limit.

Offer export.

---

# Future Expansion

Designed for future AI pitch analysis without changing data model.

---

# Edge Cases

Microphone revoked

Recording interrupted

Phone sleep

Low storage

Permission denied

---

# Acceptance Criteria

✓ Recording survives refresh.

✓ Metadata retained.

✓ Playback works offline.

✓ Comparison mode functions without internet.

✓ Export includes recordings metadata.

# 15_VOICE_TIMELINE.md

# Voice Timeline Specification

## Vision

The Voice Timeline is Riyaaz's signature feature.

It transforms isolated recordings into a living history of the user's
growth, allowing them to hear---not just imagine---their improvement.

---

# Objectives

- Preserve every meaningful recording.
- Make improvement obvious through comparison.
- Celebrate milestones in the user's journey.
- Build an emotional connection to consistent practice.

---

# Core Concepts

Every recording becomes a timeline event.

Timeline events include: - Recording - Milestone - Achievement - Roadmap
completion - Personal best - Weekly report snapshot

---

# Timeline Layout

Newest at the top with optional chronological mode.

Each card displays: - Date - Song / Exercise - Duration - Session
score - Voice condition - Tags - Thumbnail waveform - Notes preview

---

# Playback Experience

Actions: - Play - Pause - Seek - Rename - Favorite - Share (future) -
Delete

Playback must continue while browsing the timeline.

---

# A/B Comparison

Select any two recordings.

Comparison view shows: - Waveforms - Metadata - Time difference -
Notes - Coach comments (if available)

Users can instantly switch between recordings.

---

# Milestones

Automatically generate memorable moments such as:

- First completed song
- First 7-day streak
- First month completed
- 10 hours practiced
- 50 recordings saved
- First semi-classical exercise
- Highest daily score

Milestones appear inline with recordings.

---

# Story of Your Voice

Generate narrative highlights:

"You've practiced consistently for 90 days."

"Your recording frequency doubled this month."

"You've completed your first full roadmap."

These become part of the timeline.

---

# Search & Filters

Filter by: - Date - Song - Exercise - Roadmap month - Favorites - Tags -
Milestones

Search should work offline.

---

# Storage

Recordings stored locally.

Metadata indexed for fast searching.

Warn users when storage approaches configured limits.

---

# Accessibility

- Keyboard playback controls
- Screen-reader friendly timeline
- Text alternatives for waveform-only information

---

# Acceptance Criteria

✓ Every recording appears in the timeline. ✓ Comparison works offline. ✓
Milestones are generated automatically. ✓ Timeline remains performant
with hundreds of recordings. ✓ Playback state survives navigation.
