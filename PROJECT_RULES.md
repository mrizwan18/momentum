# PROJECT_RULES.md

# Momentum Project Constitution

Version: 1.0

## Purpose

These rules are mandatory for every implementation, review, and future
feature.

## 1. Product First

Every change must: - Help the user practice - Reduce friction - Improve
clarity

## 2. Feature Ownership

Business logic belongs in `src/features`. Presentation belongs in
`src/components`. Routing belongs in `src/app`.

## 3. Engine Ownership

All decision-making belongs in `src/engine`: - Scoring - Growth -
Momentum - Recommendation - Roadmap

## 4. Storage

All persistence flows through `src/storage`. Never access IndexedDB
directly from UI components.

## 5. State

Use Zustand only for global application state. Keep temporary UI state
local.

## 6. Design

- One primary CTA per screen.
- Mobile first.
- Dark mode supported.
- Reuse components.

## 7. Accessibility

Every feature must support: - Keyboard navigation - Screen readers -
Reduced motion - WCAG AA contrast

## 8. Performance

- First load \<2s
- Route transitions \<300ms
- Lighthouse Performance \>90
- Accessibility \>95

## 9. Offline First

The MVP must function without internet.

## 10. Code Quality

- TypeScript strict
- No TODOs
- No duplicated business logic
- No placeholder implementations

## 11. Testing

Every feature requires: - Unit tests - Accessibility checks - Offline
scenario - Error handling

## 12. Definition of Done

A feature is complete only if: - Offline works - Tests pass -
Accessible - Loading, empty and error states implemented - Lint and
typecheck pass

## Final Rule

Optimize for a product users want to open every day.
