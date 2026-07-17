# 20_SETTINGS.md

# Settings & Preferences Specification

## Vision

Settings should be simple, transparent, and empowering.

Users should feel in control of their practice experience without being
overwhelmed by technical options.

---

# Goals

- Customize the experience.
- Protect user data.
- Support offline-first usage.
- Make recovery easy when changing devices.

---

# Sections

## Profile

- Display name
- Avatar (optional, local only)
- Preferred skill
- Experience level
- Daily practice goal

---

## Practice

- Default session duration
- Reminder time
- Recovery mode preference
- Auto-start timer
- Auto-open Today's Practice

---

## Notifications

Support:

- Daily reminder
- Streak reminder
- Weekly report
- Achievement notifications
- Recovery reminders

Allow: - Enable/disable - Time selection - Quiet hours

---

## Appearance

- Light
- Dark
- System

Accent color: - Warm Orange (default) - Optional future themes

Reduced motion: - On - Off - System

---

## Audio

- Preferred microphone
- Recording quality
- Playback speed
- Auto-save recordings
- Storage usage

---

## Data

Display:

- Sessions
- Recordings
- Database size
- Last backup

Actions:

- Export all data
- Import backup
- Clear recordings
- Reset practice history
- Factory reset

All destructive actions require confirmation.

---

## Privacy

Explain clearly:

- No account required
- Data stays on device
- No analytics by default
- No cloud sync in v1

---

## About

Display:

- App version
- Build number
- Open source licenses
- Changelog (future)

---

# Export

Single versioned archive including:

- Sessions
- Roadmap
- Settings
- Achievements
- Statistics
- Recording metadata

---

# Import

Validate:

- Version
- Integrity
- Schema

Show preview before importing.

Never overwrite without confirmation.

---

# Error States

- Corrupt backup
- Unsupported version
- Storage unavailable
- Notification permission denied

Provide recovery guidance.

---

# Accessibility

Large touch targets.

Keyboard navigation.

Readable labels.

High contrast.

---

# Acceptance Criteria

✓ All settings persist locally. ✓ Export/import works offline. ✓ Theme
changes instantly. ✓ Reset actions require confirmation. ✓ Privacy
information is always accessible.
