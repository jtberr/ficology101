# Project AI Context Template

A reusable template for setting up AI-assisted development on any project.
Works with Claude Code, Cursor, GitHub Copilot, and any other AI coding assistant
that reads markdown files.

## What's In This Template

```
AGENTS.md                  ← AI reads this automatically every session
ai-context/
  PRD.md                   ← Product requirements: features, user stories, scope
  ARCHITECTURE.md          ← Database schema, API routes, data flow, security
  DECISIONS.md             ← Every significant decision made and why
  PROGRESS.md              ← Current status, what's done, what's next
  SCREENS.md               ← Every screen, its contents, and navigation flow
```

## How to Use This Template

### Starting a new project

1. Click **"Use this template"** on GitHub to create a new repo from this template
2. Clone your new repo locally
3. Open the project in VS Code (or your editor of choice)
4. Fill in each file — follow the instructions and replace placeholder text
5. Start coding with AI assistance

### Filling in the files (recommended order)

1. **AGENTS.md** — describe the project, tech stack, and your team first; this orients every AI session
2. **DECISIONS.md** — record your tech stack choices and the reasoning before you forget
3. **PRD.md** — document features and scope; share with stakeholders for sign-off
4. **ARCHITECTURE.md** — data model, API routes, security plan
5. **SCREENS.md** — screen list and navigation flow
6. **PROGRESS.md** — fill in as development begins; update every session

### Starting an AI coding session

Open Claude Code (or your AI tool) and say:

> "Read AGENTS.md and ai-context/PROGRESS.md, then [your task]."

Add more files as needed:
- Database/API work: also read `ai-context/ARCHITECTURE.md`
- UI work: also read `ai-context/SCREENS.md`
- When the 'why' matters: also read `ai-context/DECISIONS.md`

### Ending an AI coding session

- Update `ai-context/PROGRESS.md` — move completed items, update what's in progress
- Add any new decisions to `ai-context/DECISIONS.md` with reasoning

**The AI has no memory between sessions. PROGRESS.md is the handoff.**

## Why This Works

AI coding assistants are powerful but stateless — they start every session cold.
These files give the AI the context it needs to:
- Make consistent decisions aligned with your architecture
- Understand your team's experience level and tailor explanations
- Know where you left off without re-explaining everything
- Respect the 'why' behind decisions rather than second-guessing them

The more accurately these files reflect the current state of the project,
the more useful the AI becomes.

## Tips

- **Keep PROGRESS.md current** — it's the most important file for day-to-day work
- **Record decisions immediately** — the reasoning is easy to forget; write it down when it's fresh
- **Be honest about team experience** in AGENTS.md — the AI tailors its explanations accordingly
- **Update ARCHITECTURE.md as the schema evolves** — stale docs produce bad code suggestions
- **SCREENS.md prevents rework** — get the screen list agreed before building UI
