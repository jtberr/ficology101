# FIcology101 — AI Agent Context

> This file is read automatically by AI coding assistants (Claude Code, Cursor, Copilot, etc.)
> at the start of every session. Keep it current. It is the single most important context file.

---

## What This Is

A Next.js web app hosted at tools.ficology101.com that provides an interactive, phase-aware
FIRE (Financial Independence, Retire Early) calculator. It is a companion to the ficology101.com
blog (a separate WordPress site). The calculator models all three phases of the FIRE journey —
accumulation, gap years, and full retirement — with a year-by-year editable table and portfolio
chart. No user accounts; anonymous and stateless.

## Developer Context

- **Bob (solo developer)**: 30 years of experience in Microsoft technologies (ASP.NET, C#, SQL Server,
  Visual Basic). No prior React or Next.js experience. Bridge all explanations to familiar patterns:
  server components = code-behind, API routes = controllers, props = method parameters,
  useState = ViewState, TypeScript interfaces = C# classes. Avoid assuming React knowledge.
  Prefer explicit, typed code over clever abstractions.

---

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript — all types explicit, no `any`
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: None for v1 — calculator is fully client-side, no persistence
- **Hosting**: Vercel
- **Domain**: tools.ficology101.com (subdomain of existing WordPress blog)

## Project Structure
```
src/
  app/
    page.tsx              ← Landing / redirect to /calculator
    calculator/
      page.tsx            ← Main calculator page (server component shell)
  components/
    calculator/
      InputPanel.tsx      ← Left panel: all user inputs
      PhaseTable.tsx      ← Year-by-year editable table
      PortfolioChart.tsx  ← Recharts line chart
      ResultSummary.tsx   ← "You can retire at age X" callout cards
    ui/                   ← Shared UI primitives (buttons, inputs, cards)
  lib/
    calculator.ts         ← All calculation logic (pure functions, no React)
    types.ts              ← Shared TypeScript interfaces
```

## Running the Project
```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run lint      # TypeScript + ESLint check
```

---

## How to Start a Coding Session

`CLAUDE.md` auto-imports this file plus `ai-context/PROGRESS.md` and `ai-context/DECISIONS.md`
every session — just state your task, no need to ask for these to be read.

**For UI work, also add:**
> "Also read ai-context/SCREENS.md."

**For architecture or calculation logic, also add:**
> "Also read ai-context/ARCHITECTURE.md."

**At the end of every session:**
- Update `ai-context/PROGRESS.md` — move completed items to done, update what's in progress
- Add any new decisions to `ai-context/DECISIONS.md` with the reasoning

**The AI has no memory between sessions.** PROGRESS.md is the handoff.

---

## Conventions
- TypeScript everywhere — explicit interfaces in `src/lib/types.ts`
- All calculation logic lives in `src/lib/calculator.ts` as pure functions — no React, no side effects
- Server components by default; `"use client"` only where interactivity requires it (inputs, chart)
- The PhaseTable rows are the source of truth for year-by-year data; calculations derive from them
- Tailwind for all styling — no CSS files, no CSS modules
- Keep components small and single-purpose

## Absolute Rules
- **Calculation logic must be pure functions** — testable in isolation, no React dependencies
- **No user data is ever sent to a server** — all calculation happens client-side in the browser
- **Never store or log user financial inputs** — this is a privacy guarantee

## What Not To Do
- Don't add a database or auth — v1 is intentionally anonymous and stateless
- Don't use `any` types — define an interface instead
- Don't put calculation logic inside React components
- Don't add features beyond the FIRE calculator for v1
