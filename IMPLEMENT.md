# IMPLEMENT.md

# Atlas → Momentum → Riyaaz

## Master Implementation Guide for AI Coding Agents

**Purpose:** This is the single source of truth for implementing the
Momentum platform MVP. Read this document completely before writing any
code.

---

# Mission

Build an offline-first Progressive Web App that helps users build a
daily practice habit.

The first skill pack is **Riyaaz (Vocals)**.

Success is measured by **daily use**, not feature count.

---

# Non-Negotiable Principles

1.  Practice before perfection.
2.  One primary action per screen.
3.  Progress is always visible.
4.  Never shame the user.
5.  Offline-first.
6.  Local-first data ownership.
7.  Beautiful, calm UI.
8.  Accessibility is mandatory.
9.  No placeholder implementations.
10. Every completed session must feel rewarding.

---

# MVP Scope (v0.1)

Implement ONLY these screens:

1.  Dashboard
2.  Practice
3.  Recording
4.  Session Summary
5.  Settings

Do NOT implement: - Login - Backend - Cloud sync - Payments - Social
features - AI/LLM integration

---

## Scope Exception: Push Notifications

Backend/cloud-sync is otherwise out of MVP scope, but push
notifications (subscriptions + send-scheduling) are a deliberate,
scoped exception approved on 2026-07-25. No other backend features
(login, accounts, payments, etc.) are in scope.

---

# Technology Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Dexie (IndexedDB)
- Zod
- React Hook Form
- next-pwa
- Lucide Icons
- Vitest
- Playwright

---

# Folder Structure

src/ app/ components/ features/ dashboard/ practice/ recording/ summary/
settings/ engine/ storage/ hooks/ lib/ types/

---

# Database

Tables:

- settings
- sessions
- recordings
- statistics
- roadmap

Every write must be transactional.

---

# Core Loop

Dashboard → Practice → Recording → Summary → Dashboard

Optimize this loop before adding anything else.

---

# Dashboard

Must answer in under five seconds:

- Did I practice today?
- What should I do next?
- Am I maintaining momentum?

Components: - Greeting - Streak - Today's Mission - Continue Practice
button - Checklist

One primary CTA only.

---

# Practice

Exercises: - Breathing - Warm-up - Scales - Song - Reflection

Features: - Timer - Pause - Resume - Complete - Auto-save

Interrupted sessions must resume.

---

# Recording

Support: - Record - Pause - Resume - Stop - Playback - Delete

Store recordings locally.

Never silently discard recordings.

---

# Summary

Display: - Duration - Exercises completed - Recording status - XP
earned - Tomorrow's One Thing

Celebrate completion with subtle animation.

---

# UI Rules

- Mobile first.
- Dark mode default.
- One primary CTA.
- Maximum three supporting cards.
- Skeleton loaders instead of spinners.
- 44px minimum touch targets.
- Reduced motion support.

---

# Engineering Rules

- Strict TypeScript.
- Feature-first architecture.
- No duplicated business logic.
- No TODOs.
- No mock data in production code.
- No hidden state mutations.

---

# State Management

Use Zustand.

Persist only: - Settings - Active session - Theme

Feature-local state wherever possible.

---

# Testing

Every feature must include:

- Unit tests
- Accessibility checks
- Happy path
- Interrupted session
- Offline scenario

---

# Performance

Targets: - First load \<2s - Lighthouse Performance \>90 - Accessibility
\>95 - PWA \>95

---

# Definition of Done

A feature is complete only when:

- It works offline.
- It is accessible.
- It has tests.
- It has loading, empty and error states.
- It matches the design language.
- It survives refresh/interruption.
- It contains no placeholder code.

---

# Future Releases

v0.2 Progress

v0.3 Voice Timeline

v0.4 AI Coach

v0.5 Achievements

v1.0 Roadmap + Growth Engine + Recommendation Engine

---

# Final Instruction

Do not optimize for feature count.

Optimize for a product that the user genuinely wants to open every day.

Whenever there is a trade-off, choose: - simplicity over complexity -
consistency over novelty - reliability over cleverness - user trust over
engagement metrics
