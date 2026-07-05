# Decision Log
# FIcology101 — Site-Wide

---

## Business Context
FIcology101.com is a personal finance blog focused on FIRE (Financial Independence, Retire Early).
Positioning: "Master the Math. Conquer the Mind." The custom Next.js app hosts interactive tools
that companion the blog content. The WordPress blog remains at ficology101.com (or will move to
blog.ficology101.com when the main site is built in Next.js).

---

## Made

### Monorepo structure with one app per subfolder
**Date**: 2026-07-05
**Decision**: Single GitHub repo (`ficology101`) containing subfolders per app (`tools/`, `www/` when needed)
**Why**: All apps share the same domain, brand, and developer. A monorepo keeps everything in one place, makes cross-app sharing natural, and avoids managing multiple repos for what is conceptually one site. Each app is independently deployable to Vercel by pointing at its subfolder.

### tools.ficology101.com is a single Next.js app — no subdirectory splitting
**Date**: 2026-07-05
**Decision**: All tools live as routes under one Next.js app (`tools/`) — e.g. `/calculator`, `/montecarlo`
**Why**: Same domain, same stack, shared components. No reason to split into separate apps. Adding a new tool is just adding a new folder under `src/app/`.

### WordPress blog stays separate
**Date**: 2026-07-05
**Decision**: The WordPress blog is not in this repo and is not being migrated
**Why**: WordPress handles content publishing well. The value of the custom app is interactive tools, not blog content. Migration is a future option, not a current plan.

### ai-context files at three levels
**Date**: 2026-07-05
**Decision**: Root ai-context (site-wide), tools/ai-context (app-wide), tools/src/app/[tool]/ai-context (feature-specific)
**Why**: Different concerns at different levels. Site-wide decisions (monorepo structure, brand) don't belong in the calculator docs. Calculator-specific docs (PRD, screens, architecture) don't need to be read for every session.
