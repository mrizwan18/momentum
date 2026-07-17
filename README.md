# Momentum

**Momentum helps you become exceptional at a difficult skill by making it easy to show up and practice, every day.**

Most people don't fail at learning an instrument, a language, or a craft because they lack talent. They fail because they don't know what to practice next, they lose consistency, and their progress feels invisible — so after a few missed days, they quit.

Momentum fixes that. It tells you the one thing to focus on today, keeps every session's evidence of your progress, and welcomes you back without guilt when you miss a day. It is not a course platform, not a habit tracker, and not a note-taking app — it's a daily practice companion built around one belief: **consistency beats intensity, and recovery is part of mastery.**

The first skill it supports is **🎤 Riyaaz (Vocals)** — a structured path to becoming a confident singer. Guitar, Piano, Coding, Languages, and Fitness are planned next.

Momentum runs entirely on your device. Your practice history, recordings, and progress are yours — private, offline-first, and never dependent on a server being online.

---

## Where things stand

This project is being built incrementally, one real feature at a time:

- ✅ **Foundation** — Next.js PWA shell, offline-first storage, theming, testing setup
- ✅ **Design System** — the reusable component library the whole app is built from
- ✅ **Dashboard** — the home screen: streak, weekly snapshot, roadmap, and practice checklist, all backed by real local data (with honest empty states where a feature, like scoring, doesn't exist yet)
- ⬜ Practice, Recording, Summary, Settings — not built yet

Nothing on screen is fabricated data — if a feature's underlying logic doesn't exist yet, the UI says so plainly instead of faking it.

---

## For contributors

<details>
<summary>Tech stack, project layout, and getting started</summary>

### Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + a custom design-token system (dark mode by default)
- **shadcn-style component primitives** built on Radix UI + Framer Motion
- **Dexie** (IndexedDB) for local-first storage, behind a repository pattern
- **Zustand** for lightweight global state (theme, active session)
- **React Hook Form + Zod** for forms and validation
- **next-pwa** for offline support and installability
- **Vitest + Testing Library + jest-axe** for unit/accessibility tests, **Playwright** for e2e

### Project layout

This is a pnpm + Turborepo monorepo:

```
apps/app/            Next.js PWA (routes, features, providers, stores)
packages/ui/         Shared design system (components, tokens, motion)
packages/storage/    Dexie database + repositories
packages/engine/     Scoring/momentum/recommendation engines (scaffolded, not yet implemented)
packages/types/      Shared TypeScript types
packages/utils/      Small shared utilities
docs/                Product, design, and engineering specs
```

### Getting started

```bash
pnpm install
pnpm dev              # start the app at localhost:3000
pnpm test             # unit tests
pnpm test:e2e         # Playwright end-to-end tests
pnpm build            # production build
```

Read `IMPLEMENT.md` and `CLAUDE.md` before implementing anything — they're the source of truth for how this codebase is meant to grow.

</details>
