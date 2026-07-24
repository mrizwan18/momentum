# Momentum Design Bible

## Volume II --- Design

### Chapter 4: Pixel Specification (Reference Screenshot Teardown)

Version 1.0

# Scope & Method

This document reverse-engineers five reference screenshots
(`docs/design/references/dashboard.png`, `practice.png`, `stats.png`,
`activity.png`, `coach.png`) as if they were exported Figma frames. Every
value below is a **visual estimate**, not a measurement taken from design
source files — treat pixel/hex values as "close enough to rebuild the
feel," not ground truth. Where a screen repeats a value already defined
in Foundations, the per-screen section references the token name instead
of restating the number.

**Note on direction, not critique:** these five screens are a brighter,
more gamified "consumer fitness app" register (photography, streak bars,
XP badges, radar charts) than `design-language.md`'s "calm coach, not a
game" mandate and its "1 Hero / 1 Primary CTA / 3 Supporting Cards"
density ceiling. This spec documents what the references _show_, not a
recommendation to adopt their density or gamification level wholesale —
reconciling the two is a separate decision, not made here.

---

# Part A — Shared Foundations

## A1. Screen Frame & Safe Area

| Property         | Value                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reference device | iPhone 14/15-class (pill-shaped Dynamic Island in status bar)                                                                                                |
| Design width     | 375pt (spec at 375; screenshots rendered ~390–430px canvas with outer bezel chrome around the frame — treat the phone glass, not the bezel, as the artboard) |
| Design height    | 812pt (iPhone-standard baseline; content scrolls)                                                                                                            |
| Safe area top    | 47pt (status bar 44pt + 3pt breathing room before first header row)                                                                                          |
| Safe area bottom | 34pt (home-indicator inset) reserved beneath the floating bottom nav                                                                                         |
| Status bar       | Time left ("9:41"), signal + Wi-Fi + battery glyphs right, black/near-black icons on the light background                                                    |

## A2. Layout Grid

| Property                            | Value                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Outer horizontal margin             | 20px both sides (content width = 375 − 40 = 335px)                                                                                                                                                                                   |
| Section vertical rhythm             | 24px between major sections (header → hero → next section)                                                                                                                                                                           |
| Card-to-card spacing (same section) | 12–16px                                                                                                                                                                                                                              |
| Card internal padding               | 20px on all sides (16px for compact list rows)                                                                                                                                                                                       |
| Grid                                | Single column, full-bleed-minus-margin cards; the only true multi-column moments are the 2-up stat cards (Activity) and the 5-up icon row (Dashboard "Quick Practice"), both using equal-width flex columns with a fixed 12px gutter |

## A3. Color Palette

Estimated HEX values, grouped by role. All five screens share this
palette; screen-specific tints are called out in each screen's own
Colors section.

| Token                               | Estimated HEX     | Usage                                                                                    |
| ----------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `color.bg.base`                     | `#EEF1FB`         | App background (pale lavender-white) behind every screen                                 |
| `color.surface.card`                | `#FFFFFF`         | Default card background                                                                  |
| `color.surface.tintBlue`            | `#E1E6FB`         | Hero/lavender-tinted cards (Today's Practice, Consistency, Progress)                     |
| `color.surface.tintPeach`           | `#FCE8D0`         | Calories/energy stat card                                                                |
| `color.surface.tintPink`            | `#F9D7DA`         | Duration/time stat card                                                                  |
| `color.surface.tintGreen`           | `#DFF3E3`         | Success/streak icon chips                                                                |
| `color.surface.tintPurple`          | `#E7E3FB`         | AI/insight icon chips (Coach)                                                            |
| `color.border.hairline`             | _(none observed)_ | Cards are borderless; separation is via shadow + fill tone only                          |
| `color.brand.primary`               | `#4F5FE5`         | Primary CTA fill, active nav pill, links, progress-ring stroke, bold accent numerals     |
| `color.brand.primaryGradientTop`    | `#6C7CF2`         | Top stop on the two gradient-looking circular buttons (mic "Tap to Stop", dashboard FAB) |
| `color.brand.primaryGradientBottom` | `#4655D6`         | Bottom stop, same elements                                                               |
| `color.chart.barActive`             | `#4F5FE5`         | Filled/peak bars in bar charts                                                           |
| `color.chart.barInactive`           | `#C9CFF6`         | Low-value/inactive bars, same chart                                                      |
| `color.chart.track`                 | `#DDE1F5`         | Progress-ring and progress-bar unfilled track                                            |
| `color.status.success`              | `#31C46B`         | Checkmarks, "Completed!", "In Progress" text                                             |
| `color.status.streak`               | `#FF9F43`         | Flame icon (streak)                                                                      |
| `color.status.locked`               | `#AEB4C9`         | Padlock icon + locked-row icon fill                                                      |
| `color.text.primary`                | `#181A2E`         | Headings, big numerals, primary labels                                                   |
| `color.text.secondary`              | `#7D82A0`         | Captions, helper text, inactive nav labels                                               |
| `color.text.tertiary`               | `#ACB1C7`         | Placeholder-weight text (timestamps, disabled rows)                                      |
| `color.text.onBrand`                | `#FFFFFF`         | Text/icons on filled blue surfaces                                                       |
| `color.icon.default`                | `#4F5FE5`         | Line icons throughout (music note, breathing, mic)                                       |

## A4. Typography Scale

Font family across all five screens reads as a **rounded geometric
sans** (bold numerals with softened terminals) — closest system match is
**SF Pro Rounded**; the closest realistic web substitute is **Manrope**
or **Nunito Sans** (both rounded-geometric). This is a different family
from Momentum's currently-shipped **Inter** — flagged as a typeface
delta, not resolved here.

| Style                                                | Size    | Weight                   | Line height | Letter spacing | Color                                                                           |
| ---------------------------------------------------- | ------- | ------------------------ | ----------- | -------------- | ------------------------------------------------------------------------------- |
| Hero number (e.g. "47", "12,430")                    | 36–40px | Bold (700)               | 1.0         | −0.02em        | `text.primary` (or `brand.primary` when the number _is_ the accent, e.g. "316") |
| Screen title (header center/left)                    | 18–20px | Bold (700)               | 1.2         | −0.01em        | `text.primary`                                                                  |
| Section heading ("Quick Practice", "Challenges")     | 17–18px | Bold (700)               | 1.3         | 0              | `text.primary`                                                                  |
| Card title (e.g. "Swar Sadhana")                     | 15–16px | Semibold (600)           | 1.3         | 0              | `text.primary`                                                                  |
| Body/subtitle                                        | 13–14px | Regular/Medium (400–500) | 1.4         | 0              | `text.secondary`                                                                |
| Caption / micro-label (chart day labels, nav labels) | 11–12px | Medium (500)             | 1.3         | 0.01em         | `text.secondary`                                                                |
| Button label                                         | 15–16px | Semibold (600)           | 1.0         | 0              | `text.onBrand` or `brand.primary`                                               |
| Greeting name ("Riyaaz Singer")                      | 18px    | Bold (700)               | 1.2         | 0              | `text.primary`                                                                  |
| Eyebrow ("Good Morning", "Today's Practice")         | 13px    | Regular (400)            | 1.3         | 0              | `text.secondary`                                                                |

## A5. Radius Scale

| Token           | Value                 | Used for                                                                      |
| --------------- | --------------------- | ----------------------------------------------------------------------------- |
| `radius.pill`   | 999px (fully rounded) | Primary/secondary buttons, bottom nav bar, tag chips, segmented progress bars |
| `radius.hero`   | 28px                  | Hero cards (Today's Practice, Consistency, main Practice exercise card)       |
| `radius.card`   | 20–24px               | Standard cards (streak, challenge rows, coach cards)                          |
| `radius.chip`   | 14–16px               | Icon-chip squares (music note chip, brain chip) — "squircle," not fully round |
| `radius.circle` | 50%                   | Avatars, icon buttons, progress rings, FAB                                    |

## A6. Shadow / Elevation

| Token                  | X   | Y    | Blur | Spread | Color / Opacity                         | Used for                             |
| ---------------------- | --- | ---- | ---- | ------ | --------------------------------------- | ------------------------------------ |
| `shadow.card`          | 0   | 8px  | 24px | 0      | `#14163D` @ 6%                          | Default card elevation               |
| `shadow.cardHero`      | 0   | 12px | 32px | 0      | `#14163D` @ 8%                          | Hero/tinted cards, slightly heavier  |
| `shadow.nav`           | 0   | 12px | 32px | −4px   | `#14163D` @ 10%                         | Floating bottom navigation bar       |
| `shadow.buttonPrimary` | 0   | 6px  | 16px | 0      | `#4F5FE5` @ 30% (colored/tinted shadow) | Primary CTA buttons, FAB, mic button |
| `shadow.iconChip`      | 0   | 4px  | 8px  | 0      | `#14163D` @ 4%                          | Small icon-chip containers           |

## A7. Motion (Inferred)

Screenshots are static; every value below is inferred from the visual
genre (rounded, springy, "premium fitness app") rather than observed
directly.

| Token                         | Duration         | Curve                                                                  | Notes                                               |
| ----------------------------- | ---------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| `motion.duration.fast`        | 150ms            | ease-out                                                               | Button press feedback                               |
| `motion.duration.standard`    | 300ms            | ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`)                             | Card entrance, section reveal                       |
| `motion.duration.celebration` | 600ms            | spring (stiffness 260, damping 22)                                     | Progress ring fill, streak bar entrance             |
| Bottom-nav active-pill morph  | 250–300ms        | spring (stiffness 300, damping 26)                                     | Pill slides/resizes between tabs                    |
| Progress ring fill            | 600–800ms        | ease-out, animates from previous value (never restarts at 0 on update) | Consistency %, exercise completion %                |
| Bar chart entrance            | 400–600ms total  | ease-out, ~50ms stagger/bar                                            | Streak & weekly bars scale up from 0 height         |
| Waveform (active recording)   | 400–800ms loop   | ease-in-out, per-bar randomized phase                                  | Continuous idle pulse while "Tap to Stop" is active |
| Button press                  | 100–150ms        | spring                                                                 | Scale to 0.96–0.97, springs back on release         |
| Mic button active glow        | 1000–1200ms loop | ease-in-out                                                            | Soft pulsing ring while recording                   |

---

# Part B — Per-Screen Specifications

## B1. Dashboard (`dashboard.png`)

### Layout

- Screen width 375pt · safe area top 47pt · outer margin 20px (see A1/A2).
- Vertical stack: status bar → header row (avatar + greeting + bell) →
  24px gap → hero card → 24px gap → "Quick Practice" section → 24px gap
  → "Current Streak" card → 24px gap → floating bottom nav.
- Header row height ~44px; hero card height ~200px; Quick Practice row
  height ~96px (64px circle + label); streak card height ~230px.
- Bottom nav is pinned/floating, ~72px tall, 20px inset from the bottom
  safe area.

### Colors

- Background: `color.bg.base`.
- Hero card ("Today's Practice"): `color.surface.tintBlue`, with a
  photographic image (singer, headphones, mic) bleeding into the
  right/bottom of the card — no flat color there, treat as an image
  layer, not a token.
- Streak card: `color.surface.card` (white).
- Quick Practice icon circles: `color.surface.card` with
  `color.icon.default` line icons.
- Streak bar chart: `color.chart.barActive` / `color.chart.barInactive`.
- Bell icon button, back-style circular buttons: white fill, `text.primary` icon.
- FAB (arrow, bottom-right of hero image): `brand.primaryGradientTop`→`brand.primaryGradientBottom`, white icon.

### Typography

- "Good Morning": Eyebrow style (13px, secondary).
- "Riyaaz Singer": Greeting-name style (18px bold, primary).
- "Today's Practice": Eyebrow style, `text.secondary`, paired with a small music-note icon.
- "47": Hero number style, 40px, `text.primary`.
- "minutes": Body style, 14px, `text.secondary`, baseline-aligned next to "47".
- "Goal: 60 min": Caption style, `text.secondary`.
- "Quick Practice": Section heading style.
- Icon labels (Alankaar, Swar Sadhana, Raag, Taan, Breathing): Caption style, centered under each circle, 2-line wrap allowed ("Swar Sadhana").
- "Current Streak": Section heading style (inline with flame icon).
- "12": Hero number style, ~32px (slightly smaller than the 40px dashboard hero, since it shares the row with the chart).
- "days": Body style next to "12".
- Bar chart day labels (M–S): Caption style, centered under each bar.

### Components

- Avatar: 44×44px circle, photographic.
- Bell icon button: 44×44px circle, `radius.circle`, `shadow.iconChip`.
- Hero card: `radius.hero`, `shadow.cardHero`, 20px padding.
- FAB arrow button: 52×52px circle, `radius.circle`, `shadow.buttonPrimary`, overlapping the hero image's bottom-right corner by ~8px.
- Quick Practice circles: 64×64px, `radius.circle`, `shadow.iconChip`, ~28px icon centered.
- Streak card: `radius.card`, `shadow.card`, 20px padding.
- Streak bar chart: 7 bars, each ~14px wide, `radius.pill` capsule top, gap ~14px, max height ~64px.
- Bottom nav: full-width-minus-40px pill, ~72px tall, `radius.pill`, `shadow.nav`; active item ("Home") rendered as an inset filled pill (~48px tall, `brand.primary` fill, white icon + label); the three inactive items are plain outline icons in 44px circles, `color.icon.default` on white/transparent.

### Shadows

- Hero card: `shadow.cardHero`.
- Streak card: `shadow.card`.
- FAB + Quick Practice circles: `shadow.buttonPrimary` / `shadow.iconChip` respectively.
- Bottom nav: `shadow.nav` (the strongest/lowest shadow on the screen, since it visually floats above everything).

### Motion

- Hero "47" and streak "12" are the two numbers most likely to count up on load — use `motion.duration.celebration` with an ease-out count-up, not an instant swap.
- Streak bars: entrance per A7 "Bar chart entrance."
- Bottom-nav tab switch: `motion.duration` per A7 "Bottom-nav active-pill morph."
- FAB: press scale to 0.96 (`motion.duration.fast`), then navigates (slide transition per A7 standard).

---

## B2. Practice (`practice.png`)

### Layout

- Header row (back button, title+subtitle, more button) ~56px tall.
- "Current Session" status card ~64px tall, full width.
- "Current Exercise 2/5" label row + thin progress bar, ~28px tall.
- Main exercise card (icon + title + ring + waveform + transport controls) is the tallest element, ~420px.
- "Session Progress" card (segmented bar + 5-row list) ~340px.
- Bottom action bar (Notes + Finish Session) pinned, ~72px tall including 20px top/bottom padding.
- Vertical rhythm between these blocks: 20–24px.

### Colors

- "Current Session" card: `color.surface.card`; green dot + "In Progress" text in `color.status.success`; "32:47" in `text.primary`.
- Progress bar (2/5, thin): track `color.chart.track`, fill `brand.primary`.
- Exercise card: `color.surface.card`, icon chip `color.surface.tintBlue` with `color.icon.default` icon.
- "Ascending" tag: fill `color.surface.tintBlue`, text `brand.primary`, `radius.pill`.
- Progress ring ("68% Completed"): stroke `brand.primary` over `color.chart.track`, center text `text.primary` + `text.secondary` for "Completed".
- Waveform: bars in `brand.primary` at full opacity (played portion) and ~35% opacity (unplayed portion), scrubber dot + line in `brand.primary`.
- Transport buttons: Pause/Skip = white circle, `text.primary` icon; "Tap to Stop" = gradient blue circle (`brand.primaryGradientTop/Bottom`), white mic icon.
- Session Progress segmented bar: 5 segments, filled = `brand.primary`, empty = `color.chart.track`.
- Exercise list rows: completed = `color.status.success` check-circle; current = `color.surface.tintBlue` row background + pulsing blue icon; locked = `color.status.locked` icon + padlock glyph, row text dimmed to `text.tertiary`.
- Bottom bar: "Notes" = `color.surface.tintBlue` pill, `brand.primary` text/icon; "Finish Session" = `brand.primary` filled pill, white text/icon.

### Typography

- "Practice": Screen-title style (18px bold, centered).
- "Alankaar Practice": Caption style, centered under title.
- "Current Session" / "Current Exercise" / "Session Progress": Section heading style, 15–16px (slightly smaller than Dashboard's section headings since this screen is denser).
- "In Progress": Body style, 13px, `color.status.success`, medium weight.
- "32:47": Card-title style, 18px bold, tabular numerals.
- "2 / 5": bold, `brand.primary`, 14px, right-aligned.
- "Swar Sadhana": Card-title style, 16px semibold.
- "Sa Re Ga Ma Pa Dha Ni Sa": Body style, `text.secondary`, 13px.
- "68%": Hero-number style but compressed to fit the ring, ~22px bold; "Completed" caption 10px below it inside the ring.
- "0:24": Caption style, centered under the waveform, tabular numerals.
- Transport labels ("Pause", "Tap to Stop", "Skip"): Caption style, centered under each button.
- Exercise row titles: Body style, 14–15px medium; durations right-aligned, `text.secondary`, 13px.
- "Notes" / "Finish Session": Button-label style.

### Components

- Back / more buttons: 40×40px circle, `radius.circle`, `shadow.iconChip`.
- Exercise card: `radius.hero`, `shadow.cardHero`, 20px padding.
- Icon chip (music note): 48×48px, `radius.chip`.
- Progress ring: 90×90px diameter, **stroke thickness 8px**.
- Waveform: full card width (~295px), 48px tall, bar width 3px, gap 2px, ~55 bars visible, rounded caps.
- Transport row: Pause/Skip 56×56px circles; "Tap to Stop" 80×80px circle (largest, primary focal point), `radius.circle` throughout.
- Session Progress segmented bar: 5 segments, 4px tall, `radius.pill`, 4px gaps between segments.
- Exercise list rows: 48px tall each, status icon 28×28px circle, chevron/lock 20px.
- Bottom action bar buttons: 56px tall; "Notes" auto-width pill (~120px); "Finish Session" flexes to fill remaining width.

### Shadows

- Exercise card: `shadow.cardHero`.
- "Current Session" + "Session Progress" cards: `shadow.card`.
- "Tap to Stop" mic button: `shadow.buttonPrimary`, visibly stronger/larger than Pause/Skip's plain `shadow.iconChip` — it's the screen's one focal action.
- Bottom action bar sits on its own elevated surface: `shadow.nav`-equivalent (separated from scroll content).

### Motion

- Progress ring (68%): fills per A7 "Progress ring fill," must animate from the _previous_ percentage on data change, never reset to 0.
- Waveform: idle pulse loop while `Tap to Stop` is active (A7 "Waveform (active recording)"); scrubber dot moves continuously in real time, no easing (1:1 with playback position).
- "Tap to Stop": pulsing glow loop while recording (A7 "Mic button active glow").
- Current-exercise row highlight: crossfade (`motion.duration.standard`) when advancing to the next exercise, not a hard cut.
- Segmented progress bar: each segment fills with a left-to-right wipe (`motion.duration.standard`) as an exercise completes.

---

## B3. Stats (`stats.png`)

### Layout

- Header row (title left, calendar icon button right) ~44px.
- "Practice Overview" hero card ~280px tall.
- "Challenges" section header + 3 stacked cards, each ~72px tall with 12px gaps.
- Bottom nav floating, same as Dashboard.

### Colors

- "Practice Overview" card: `color.surface.card` (white, not tinted — the only "hero" card in the set that stays neutral white, since the bar chart itself carries the color).
- "316": `brand.primary` (this is the one hero number that takes the accent color directly, not `text.primary`).
- "This Week ⌄": `text.secondary`, chevron in same color.
- "Best Day" pill: fill `color.surface.tintBlue`, "78 min" in `brand.primary` bold.
- Bar chart: same `chart.barActive` / `chart.barInactive` as Dashboard, taller bars, 2 peak bars fully saturated (W, S) vs. 5 muted.
- Challenge icon chips: green-tint (`tintGreen`) for streak challenge, purple-tint (`tintPurple`) for session-count challenge, peach-tint (`tintPeach`) for the in-progress time challenge.
- "Completed!" text + circular badge: `color.status.success`.
- "+100 XP" / "+150 XP": `text.secondary`, right-aligned, small.
- In-progress challenge bar: track `chart.track`, fill `brand.primary`, "40 / 60 min" caption `text.secondary`.
- "See All": `brand.primary` link text.

### Typography

- "Riyaaz Stats": Screen-title style, left-aligned (not centered, unlike Practice).
- "Practice Overview": Section heading.
- "316": Hero-number style, `brand.primary`, 36px.
- "minutes": Body style next to it.
- "Best Day" / "78 min": caption (11px) + bold number (15px) stacked inside a pill.
- Bar chart day labels: Caption style.
- "Challenges" / "See All": Section heading + link, same row, space-between.
- Challenge titles ("7 Days Alankaar Streak"): Body style, 14–15px medium.
- "Completed!": 13px, `color.status.success`, medium.
- "+100 XP": 12px, `text.secondary`, right-aligned.

### Components

- Calendar icon button: 40×40px circle.
- Overview card: `radius.hero`, 20px padding.
- Best Day pill: `radius.card` (not fully pill-shaped — a rounded rect, ~16px radius), auto-width, internal padding 12px.
- Bar chart: 7 bars, ~16px wide (slightly wider than Dashboard's streak bars), max height ~110px, gap ~14px.
- Challenge cards: `radius.card` (~20px), 16px padding, icon chip 44×44px `radius.chip`, trailing element is either a 24px success badge or a small inline progress bar (~90px wide, 4px tall, `radius.pill`).

### Shadows

- Overview card: `shadow.cardHero`.
- Challenge cards: `shadow.card`, lighter than the overview card.

### Motion

- Bar chart entrance: staggered scale-up (A7), with the two peak bars (W, S) settling last for emphasis.
- Challenge completion badge: scale + fade in per `design-language.md`'s "Scale = achievement" rule, `motion.duration.celebration`.
- In-progress challenge bar: fills with ease-out on data change, same as any progress bar.
- "This Week ⌄" dropdown: standard disclosure — chevron rotates 180° over `motion.duration.fast` when opened.

---

## B4. Activity / Analytics (`activity.png`)

### Layout

- Header row ("Analytics" + search button) ~44px.
- "Consistency" hero card ~200px.
- "Amazing! You're on fire!" banner card ~90px.
- Two side-by-side stat cards (Calories / Total Practice), equal width, ~140px tall, 12px gutter between them.
- "Progress" card ~200px.
- Bottom nav floating.
- All cards in this screen use tinted backgrounds (no plain-white cards at all) — the densest, most colorful of the five screens.

### Colors

- "Consistency" + "Progress" cards: `color.surface.tintBlue`.
- Banner card: `color.surface.tintBlue` (slightly lighter variant, or same token — treat as identical unless a redline says otherwise).
- Calories card: `color.surface.tintPeach`; flame icon on white circle.
- Total Practice card: `color.surface.tintPink`; clock icon on white circle.
- "85%" and "12,430": `text.primary` (bold black), **not** `brand.primary` — differs from Stats' "316," which was brand-colored. Treat hero numerals' color as context-dependent (accent when the card is neutral-white, near-black when the card is already tinted, to avoid two saturated colors competing).
- Progress rings (Consistency, Progress): stroke `brand.primary` over `chart.track`, partial arcs (not full circles) reflecting the underlying %.
- Crown icon (banner): brown/amber `#8A5A2B`-ish on a white circle — a one-off color not otherwise used; treat as illustrative, not a token.

### Typography

- "Analytics": Screen-title style, left-aligned.
- "Consistency" / "Progress": Section heading style, paired with a small icon chip inline (not stacked above, inline to the left of the label).
- "85%" / "12,430": Hero-number style, 36–40px, `text.primary`.
- "This Month" / "Steps Today": Body/caption style, `text.secondary`, directly under the hero number.
- Ring center text ("25 / 30" / footprint icon only for Progress): bold 18–20px + "Days" caption 11px stacked.
- Banner heading "Amazing! You're on fire!": Card-title style, 15px bold.
- Banner body copy: Body style, 13px, `text.secondary`, 2-line wrap.
- "860" / "6h 40m": Hero-number style but smaller (~24–28px) to fit the half-width cards.
- "kcal" (unit suffix inline with "860"): Body style, same line, `text.secondary`.
- "Calories Burned" / "Total Practice": Caption style under each stat.

### Components

- Search icon button: 40×40px circle.
- Consistency/Progress cards: `radius.hero`, 20px padding, icon chip 36×36px circle (white) inline with the section label.
- Progress ring: **110×110px diameter, stroke thickness 10px** — thicker and larger than Practice screen's 90px/8px ring, since it's the screen's focal metric rather than a secondary indicator.
- Banner card: `radius.card`, icon 44×44px white circle, text block fills remaining width.
- Stat card pair: each `radius.card` (~20px), 16px padding, icon 32×32px white circle top-left, number + caption stacked below.

### Shadows

- All four tinted cards: `shadow.cardHero` (this screen's cards read slightly "heavier"/more elevated than Dashboard/Stats, consistent with tinted-not-white surfaces needing more separation from the similarly-toned page background).
- Icon circles inside cards: `shadow.iconChip`.

### Motion

- Both progress rings animate independently on load, staggered by ~150ms (Consistency first, Progress second), each per A7 "Progress ring fill."
- "12,430" steps counter: count-up animation, `motion.duration.celebration`, ease-out, since it's a large/rewarding number.
- Banner card: entrance is a gentle scale + fade (`motion.duration.celebration`) distinct from the plain fade of the stat cards, since it's a congratulatory moment (matches `design-language.md`'s "Scale = achievement").

---

## B5. AI Coach (`coach.png`)

### Layout

- Header row (back button, "AI Coach" + "Your Personal Guide" subtitle, sparkle button) ~56px.
- Greeting card ~90px.
- "Consistency Score" hero card ~180px.
- "Personalized Insight" card ~110px.
- "Recommendations" section header + 2 stacked rows, ~70px each, 12px gap.
- "Focus Areas" section: left-side 5-row compact list + right-side radar chart, combined block ~220px.
- Bottom nav floating, "Coach" tab active.
- This is the most content-dense screen of the five (7 stacked blocks vs. 3–5 on the others) — confirm against `design-language.md`'s density ceiling before implementing as-is.

### Colors

- Greeting card: `color.surface.card` (white); robot avatar chip `color.surface.tintBlue`; small waveform icon chip on the trailing edge, `color.surface.tintBlue` circle.
- "Consistency Score" card: `color.surface.tintBlue`.
- "↑ 12% from last week": `color.status.success`, small up-arrow glyph inline.
- "Personalized Insight" card: `color.surface.card`; brain icon chip `color.surface.tintPurple`; inline keywords ("Alaap", "Taan") in `brand.primary` medium weight within an otherwise `text.secondary` paragraph.
- Recommendation rows: `color.surface.card`; icon chips alternate `tintPurple` (target icon) and `tintBlue` (music icon); trailing chevron button = white circle, `text.secondary` chevron.
- Focus Areas list: small icon per row in `color.icon.default`, label `text.primary`, percentage bold `text.primary` (not accent-colored — this list is informational, not celebratory).
- Radar chart: grid lines `#D8DCEC`, filled polygon `brand.primary` @ ~30% fill opacity with a solid `brand.primary` stroke.
- "See All" / "Performance Radar ⌄": `brand.primary` / `text.secondary` respectively.

### Typography

- "AI Coach": Screen-title style, centered.
- "Your Personal Guide": Caption style, centered under title.
- "Hi Riyaaz! 👋": Card-title style, 15–16px semibold.
- Greeting body copy: Body style, `text.secondary`.
- "Consistency Score": Section heading (inline label inside the card this time, not a page-level section header).
- "85%": Hero-number style, 36px, `text.primary`.
- "↑ 12% from last week": Caption style, 12px, `color.status.success`, medium.
- "Personalized Insight": Card-title style, bold, 15px.
- Insight paragraph: Body style, `text.secondary`, with `brand.primary` medium-weight inline keyword spans.
- "Recommendations" / "See All": Section heading + link.
- Recommendation row text: Body style, 13–14px, 2-line wrap, `text.secondary`.
- "Focus Areas" / "Performance Radar ⌄": Section heading + dropdown caption.
- Focus area row labels: Body style, 13px, `text.primary`.
- Focus area percentages: Card-title style, bold, 13px, right-aligned.

### Components

- Back / sparkle buttons: 40×40px circles.
- Greeting card: `radius.card`, avatar chip 56×56px `radius.chip`, trailing waveform chip 36×36px circle.
- Consistency Score card: `radius.hero`, ring **100×100px, stroke 9px** (between Practice's 90px and Activity's 110px — this app appears to size rings relative to how "primary" the metric is on that specific screen).
- Personalized Insight card: `radius.card`, icon chip 48×48px `radius.chip`.
- Recommendation rows: `radius.card` (~18px), icon chip 40×40px `radius.chip`, trailing chevron button 32×32px circle.
- Focus Areas rows: no card chrome — a plain list, 13px icon + label + percentage, ~32px row height, no dividers (spacing-only separation).
- Radar chart: ~170×150px bounding box, 5-axis pentagon, 3 concentric grid rings.

### Shadows

- Consistency Score + Greeting + Personalized Insight + Recommendation cards: `shadow.card`.
- Focus Areas list: no shadow (it's not a card, just a list on the page background).

### Motion

- Consistency ring: fills per A7 "Progress ring fill" on load.
- Radar chart polygon: draws in via a scale-from-center or per-axis stagger (~80ms/axis), `motion.duration.standard`.
- Recommendation row chevron buttons: `motion.duration.fast` press scale, standard navigation slide on tap.
- Inline keyword highlights ("Alaap", "Taan"): no motion — static emphasis only.

---

# Part C — Design Tokens

Illustrative token structures only — **documentation, not implementation
files**. Naming mirrors what a real `colors.ts`/`spacing.ts`/etc. would
likely export, for a future implementer to translate into this repo's
actual token system (`packages/ui/src/theme/tokens.css`), not to be
copy-pasted verbatim.

### `colors.ts`

```
export const colors = {
  bg: { base: "#EEF1FB" },
  surface: {
    card: "#FFFFFF",
    tintBlue: "#E1E6FB",
    tintPeach: "#FCE8D0",
    tintPink: "#F9D7DA",
    tintGreen: "#DFF3E3",
    tintPurple: "#E7E3FB",
  },
  brand: {
    primary: "#4F5FE5",
    gradientTop: "#6C7CF2",
    gradientBottom: "#4655D6",
  },
  chart: {
    barActive: "#4F5FE5",
    barInactive: "#C9CFF6",
    track: "#DDE1F5",
  },
  status: {
    success: "#31C46B",
    streak: "#FF9F43",
    locked: "#AEB4C9",
  },
  text: {
    primary: "#181A2E",
    secondary: "#7D82A0",
    tertiary: "#ACB1C7",
    onBrand: "#FFFFFF",
  },
  icon: { default: "#4F5FE5" },
};
```

### `spacing.ts`

```
export const spacing = {
  screenMargin: 20,
  sectionGap: 24,
  cardGap: 14,
  cardPadding: 20,
  cardPaddingCompact: 16,
  gutter: 12,
};
```

### `radius.ts`

```
export const radius = {
  pill: 999,
  hero: 28,
  card: 22,
  chip: 15,
  circle: "50%",
};
```

### `shadow.ts`

```
export const shadow = {
  card: { x: 0, y: 8, blur: 24, spread: 0, color: "rgba(20, 22, 61, 0.06)" },
  cardHero: { x: 0, y: 12, blur: 32, spread: 0, color: "rgba(20, 22, 61, 0.08)" },
  nav: { x: 0, y: 12, blur: 32, spread: -4, color: "rgba(20, 22, 61, 0.10)" },
  buttonPrimary: { x: 0, y: 6, blur: 16, spread: 0, color: "rgba(79, 95, 229, 0.30)" },
  iconChip: { x: 0, y: 4, blur: 8, spread: 0, color: "rgba(20, 22, 61, 0.04)" },
};
```

### `motion.ts`

```
export const motion = {
  duration: { fast: 150, standard: 300, celebration: 600 },
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    spring: { stiffness: 260, damping: 22 },
    springSnappy: { stiffness: 300, damping: 26 },
  },
};
```

### `typography.ts`

```
export const typography = {
  fontFamily: "SF Pro Rounded, Manrope, Nunito Sans, sans-serif",
  heroNumber: { size: 38, weight: 700, lineHeight: 1.0, letterSpacing: -0.02 },
  screenTitle: { size: 19, weight: 700, lineHeight: 1.2, letterSpacing: -0.01 },
  sectionHeading: { size: 17, weight: 700, lineHeight: 1.3, letterSpacing: 0 },
  cardTitle: { size: 15, weight: 600, lineHeight: 1.3, letterSpacing: 0 },
  body: { size: 13, weight: 400, lineHeight: 1.4, letterSpacing: 0 },
  caption: { size: 11.5, weight: 500, lineHeight: 1.3, letterSpacing: 0.01 },
  button: { size: 15, weight: 600, lineHeight: 1.0, letterSpacing: 0 },
};
```

---

# Chapter Summary

Five screens, one consistent visual system: a pale-lavender canvas,
white-or-tinted cards on a shared 28/22/15px radius scale, one indigo
accent color doing almost all of the "this is important" signaling, and
a floating pill-shaped bottom nav on every screen. The biggest open
questions for whoever implements this are (1) reconciling its
gamified density with `design-language.md`'s calmer mandate, and (2) the
rounded-geometric typeface, which is not what Momentum currently ships.
