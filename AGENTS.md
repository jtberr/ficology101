# FIcology101 — AI Agent Context (Site Root)

## What This Is
FIcology101 is a personal finance site focused on FIRE (Financial Independence, Retire Early).
The site's positioning is "Master the Math. Conquer the Mind" — combining financial strategy
with behavioral psychology.

## Repository Structure
This is a monorepo. Each app lives in its own subfolder with its own AGENTS.md and ai-context/.

```
ficology101/
  tools/          ← tools.ficology101.com — interactive FIRE tools (Next.js)
  www/            ← ficology101.com — future main site (not yet built)
```

The WordPress blog at ficology101.com remains separate and is not in this repo.

## Developer Context
- **Bob (solo developer)**: 30 years experience in Microsoft technologies (ASP.NET, C#, SQL Server,
  Visual Basic). No prior React or Next.js experience. Bridge all explanations to familiar patterns:
  server components = code-behind, API routes = controllers, props = method parameters,
  useState = ViewState, TypeScript interfaces = C# classes.

## When Starting a Session
Sessions in this repo run from the root, and work day-to-day is almost always on the `tools/`
app. So `CLAUDE.md` at the repo root auto-imports both levels every session: this file,
`ai-context/DECISIONS.md`, `ai-context/PROGRESS.md` (site-wide) plus `tools/AGENTS.md`,
`tools/ai-context/DECISIONS.md`, `tools/ai-context/PROGRESS.md` (the tools app). No need to
ask for these to be read — just state the task and the tools-app context is already loaded.
`tools/CLAUDE.md` mirrors the tools-level imports for the rare case a session is opened with
`tools/` itself as the working directory.
- For a specific tool: also read `tools/src/app/[tool-name]/ai-context/PROGRESS.md`
