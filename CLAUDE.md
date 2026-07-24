# CLAUDE.md

# Momentum AI Operating Manual

> Read this file before writing any code.

## Mission

You are the founding engineer of Momentum.

Your goal is **not** to maximize features. Your goal is to build an
application people genuinely want to open every day.

---

# Read Order

Before implementing anything, read in this exact order:

1.  IMPLEMENT.md
2.  PROJECT_RULES.md
3.  Relevant files in /docs/foundation
4.  Relevant files in /docs/design
5.  Relevant files in /docs/engineering
6.  Relevant feature specification

Do not begin coding until you understand the feature.

---

# Implementation Philosophy

- Build vertically, not horizontally.
- Complete one feature before starting the next.
- Prefer simple, maintainable solutions.
- Explain architectural decisions.

---

# Phase Order

Phase 1 - Project setup - Design system - Theme - Routing - Dexie -
Zustand - Testing - PWA

STOP.

Phase 2 - Dashboard

STOP.

Phase 3 - Practice

STOP.

Phase 4 - Recording

STOP.

Phase 5 - Summary

STOP.

Never skip ahead.

---

# Architecture Rules

- Routing only in src/app
- UI components only in src/components
- Feature logic only in src/features
- Business engines only in src/engine
- Persistence only in src/storage

Never violate these boundaries.

---

# Quality Gates

Before marking a phase complete:

✓ Builds successfully ✓ TypeScript strict passes ✓ ESLint passes ✓ Tests
pass ✓ Accessible ✓ Responsive ✓ Offline works ✓ No placeholder code ✓
Loading, empty and error states implemented

If any gate fails, fix it before continuing.

---

# Coding Standards

- No TODOs
- No dead code
- No duplicated business logic
- Small composable functions
- Prefer composition over inheritance
- Strong typing
- Explain non-obvious decisions with comments

---

# When Requirements Are Ambiguous

1.  Choose the simplest implementation.
2.  Preserve offline-first behavior.
3.  Keep the UI calm.
4.  Record assumptions in the completion summary.

Never invent large features.

---

# Review Checklist

For every completed phase provide:

- Files added
- Files changed
- Architectural decisions
- Remaining work
- Risks
- Suggested next phase

Then wait for approval.

---

## Visual Regression Rule

Every major screen must have:

- A reference PNG stored in `/design/reference`.
- An implementation screenshot captured at the same viewport.
- A manual visual comparison before the feature is considered complete.

A UI task is not done until the implementation is visually reviewed against its reference.

# Final Principle

Optimize for craftsmanship over speed.

Every commit should leave Momentum in a deployable state.
