# Momentum Design Bible

## Volume II --- Design

### Chapter 3: Component System

Version 1.0

# Purpose

Every screen in Momentum should be assembled from a small set of
reusable components. Consistency is a feature.

---

# Design Principles

- One component, one responsibility.
- Components must work in light and dark mode.
- Every interactive element has hover, focus, pressed, disabled and
  loading states.
- Accessibility is built in.

---

# Core Components

## Hero Card

Used for: - Today's Score - Current Mission - Future You

Requirements: - Large headline - Primary metric - One CTA - Optional
progress ring

---

## Metric Card

Displays: - Streak - Growth Score - Momentum - Practice Hours

Rules: - Maximum 2 supporting labels. - Never combine more than one
primary metric.

---

## Practice Checklist

Fields: - Title - Status - Duration - Difficulty - Optional XP

Interactions: - Tap → open exercise - Long press → notes

---

## Recording Card

Shows: - Waveform - Date - Song - Duration - Favorite - Compare action

---

## Coach Card

Always contains: 1. Observation 2. Encouragement 3. One recommendation

Never more than one recommendation.

---

## Achievement Card

States: - Locked - Unlocked - Newly Earned

Animation: Scale + fade. Reduced-motion users receive fade only.

---

## Buttons

Primary: Filled.

Secondary: Outlined.

Ghost: Text only.

Danger: Red, destructive actions only.

---

## Inputs

Support: - Validation - Helper text - Keyboard navigation - VoiceOver
labels

---

## Progress Ring

Animated from previous value. Never restart from zero unless first
render.

---

## Motion Tokens

Fast: 150 ms Standard: 250 ms Celebration: 500 ms

Use ease-out by default.

---

# Responsive Rules

Phone: Single column.

Tablet: Two-column cards.

Desktop: Maximum content width with generous whitespace.

---

# Accessibility Checklist

✓ Contrast AA ✓ 44px touch targets ✓ Keyboard navigation ✓ Screen reader
labels ✓ Reduced motion ✓ Visible focus state

---

# Component Acceptance

Every new component must: - Support themes. - Support accessibility. -
Avoid duplicated logic. - Include loading and error states. - Be
documented before implementation.
