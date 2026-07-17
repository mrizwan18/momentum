# 11_DAILY_PRACTICE.md

# Daily Practice Feature Specification

Version: 1.0

## Purpose

The Daily Practice flow is the heart of Riyaaz.

Every session should leave the user thinking:

> "I showed up today. I'm getting better."

The objective is to maximize consistency, not session length.

---

# UX Goals

- Zero confusion
- One clear next action
- Fast session start (\<5 seconds)
- Never lose progress
- Make completion satisfying
- Encourage returning tomorrow

---

# Session Lifecycle

Home → Start Practice → Exercise Queue → Exercise Detail → Recording →
Reflection → Session Summary → Dashboard

If interrupted: Resume exactly where the user left off.

---

# Practice Header

Display: - Current streak - Session timer - Progress bar - Exit button -
Pause button

Leaving the session prompts: - Resume later - End session - Cancel

---

# Exercise Queue

Default order

1.  Breathing
2.  Warmup
3.  Sa Re Ga Ma
4.  Alankars
5.  Song Practice
6.  Recording
7.  Reflection

The order is configurable by future skill packs.

---

# Exercise Card

Every exercise contains:

- Title
- Description
- Target duration
- Estimated difficulty
- Completed state
- Notes
- Timer
- Skip button
- Mark complete

---

# Timer

Modes: - Countdown - Stopwatch

Functions: - Start - Pause - Resume - Reset - Manual edit

Progress auto-saves every second.

---

# Voice Condition

Before first exercise ask:

How does your voice feel today?

- Fresh
- Normal
- Tired
- Strained

Coach uses this information.

---

# Song Practice

User selects:

Recommended song or Custom song

Display: Lyrics placeholder Reference notes Target duration

---

# Recording

Allow: - Start - Pause - Resume - Stop - Playback - Delete - Retake

Store locally.

---

# Reflection

Questions:

Confidence (1-10)

Today's hardest area: - Pitch - Breath - Rhythm - Confidence - High
Notes

Free journal.

---

# Session Summary

Display:

Overall Score

XP earned

Momentum gained

Achievements

Coach message

Tomorrow's One Thing

Celebrate completion.

---

# Recovery Mode

Triggered after 3 missed days.

Reduced session: - Breathing - One scale - One song - Reflection

\~10 minutes.

---

# Auto Save

Persist: - Active exercise - Timer - Notes - Recording state

Crash recovery required.

---

# Scoring Hooks

Each exercise emits:

Duration

Completion

Difficulty

Skipped

Notes

Recording present

Reflection complete

Consumed by Scoring Engine.

---

# Accessibility

Large buttons.

Keyboard support.

Reduced motion.

Visible focus.

---

# Edge Cases

Microphone denied

Storage full

Phone locked

Tab refreshed

Recording interrupted

User skips every exercise

Battery saver

Offline first

---

# Acceptance Criteria

✓ Resume interrupted sessions.

✓ Never lose recordings.

✓ Session summary generated.

✓ Offline capable.

✓ Every exercise independently completable.

✓ Session completion under all supported browsers.

# 19_ROADMAP.md

# Adaptive Roadmap & Campaign System

## Vision

The Roadmap is not a checklist.

It is the user's musical journey.

Every completed chapter should feel like finishing a meaningful part of
an adventure rather than simply checking off exercises.

---

# Philosophy

The roadmap should answer:

- What should I practice today?
- Why am I practicing it?
- What do I unlock next?
- How close am I to becoming the singer I want to be?

---

# Campaign Structure

Skill → Campaign → Chapter → Week → Day → Exercise

Example:

Campaign: Vocals

Chapter 1 Finding Your Voice

Chapter 2 Breath & Stability

Chapter 3 Pitch Confidence

Chapter 4 Expression

Chapter 5 Semi-Classical Foundations

Chapter 6 Performance Ready

---

# Chapter Structure

Each chapter contains:

- Story introduction
- Learning objectives
- Daily missions
- Optional side quests
- Weekly assessment
- Chapter reward
- Completion summary

---

# Daily Mission

Contains:

- Required exercises
- Recommended song
- Target duration
- Estimated difficulty
- XP reward

Always highlight ONE priority.

---

# Side Quests

Optional challenges:

- Record twice today
- Practice 5 extra minutes
- Try a new song
- Compare today's recording with last week

Side quests never block progression.

---

# Weekly Assessment

Every week ends with:

- One complete song
- Reflection
- Recording
- Coach review
- Score summary

Assessment rewards bonus XP.

---

# Chapter Rewards

Rewards may include:

- Badge
- XP
- Theme unlock
- Coach message
- New songs
- Celebration animation

---

# Adaptive Progression

If user misses days:

- Pause roadmap progression
- Suggest Recovery Mode
- Resume from last incomplete lesson

Never skip content automatically.

---

# Recovery Mode

After 3+ missed days:

Session reduced to:

- Breathing
- Warmup
- One scale
- One song
- Reflection

Completion restores normal roadmap.

---

# Unlock Rules

Unlock next week when:

✓ Required missions complete ✓ Weekly assessment complete

Side quests optional.

---

# Skill Packs

Roadmap Engine supports multiple skills.

Example:

Vocals Guitar Piano Coding Language Learning

Each skill provides:

- Campaign
- Chapters
- Exercises
- Assessments
- Rewards

Core engine remains unchanged.

---

# Six Month Vocal Campaign

## Chapter 1

Finding Your Voice Weeks 1--4

Songs: - Tere Naam - Faasle - Baatein Karo

Focus: Breathing, Sa, basic scales.

## Chapter 2

Breath & Stability

Songs: - Aadat - Dil Haare - Woh Lamhe

## Chapter 3

Expression

Songs: - Tera Woh Pyar - Chaap Tilak - Kana Yaari

## Chapter 4

Semi-Classical Foundations

Ragas: - Yaman - Bhairav

Songs: - Afreen Afreen - Pasoori - Muntazir

## Chapter 5

Range & Confidence

Songs: - Tajdar-e-Haram - Kun Faya Kun - O Re Piya

## Chapter 6

Performance Ready

Goals:

- Record polished covers
- Compare Month 1 vs Month 6
- Final roadmap assessment

---

# Completion Experience

At campaign completion:

Display:

- Practice hours
- Recordings created
- Growth score improvement
- Before/after comparison
- Coach graduation message

Award:

🏆 Vocal Foundations Complete

Unlock:

Advanced Vocal Campaign

---

# Acceptance Criteria

✓ Roadmap adapts without losing progress. ✓ Side quests remain optional.
✓ Weekly assessments required. ✓ Works fully offline. ✓ Supports future
skill packs without code changes.
