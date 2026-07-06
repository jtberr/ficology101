# Decision Log
# FIcology101 FIRE Calculator

---

## Business Context

FIcology101.com is a personal finance blog focused on FIRE (Financial Independence, Retire Early),
written by someone who has direct FIRE experience. The site's positioning is "Master the Math.
Conquer the Mind" — combining financial strategy with behavioral psychology. This calculator is
a companion tool to drive engagement with the blog's content and give readers an interactive
way to apply what they read.

---

## Made

### Keep the blog on WordPress; build only the calculator in Next.js
**Date**: 2026-06-29
**Decision**: The existing ficology101.com WordPress blog stays as-is. This project is a new
Next.js app hosted at tools.ficology101.com.
**Why**: WordPress handles content publishing well — no reason to rebuild it. The value of
a custom app is in interactive, stateful tools that WordPress can't do. Building only the
calculator focuses effort where it creates unique value and keeps scope manageable for a
solo developer learning React/Next.js.

### Single calculator for v1 — no other features
**Date**: 2026-06-29
**Decision**: Ship one thing well. V1 is the FIRE calculator only.
**Why**: The developer is learning React/Next.js from scratch (30 years of Microsoft stack,
no prior React). Keeping scope to one feature means actually shipping. Features like
newsletter integration, user accounts, a Retirement Readiness Quiz, and multiple calculators
are good ideas for v2+ but are explicitly deferred.

### Fully client-side calculation — no backend
**Date**: 2026-06-29
**Decision**: All calculation logic runs in the browser. No API routes, no database, no server
compute.
**Why**: The calculator is pure math — there's no reason to involve a server. Client-side
calculation is faster (no network latency), simpler (no auth, no infra), and inherently
privacy-respecting (user financial data never leaves their browser). Supabase is in the
tech stack for future use but is not connected in v1.

### Phase-aware three-phase model (Accumulation / Gap Years / Retirement)
**Date**: 2026-06-29
**Decision**: The calculator models all three phases of FIRE, auto-detected from contribution sign.
**Why**: Most online FIRE calculators only model the accumulation phase. The author's blog
covers the full journey including gap years (partial retirement) and the withdrawal phase.
The calculator should reflect that. This also maps directly to the published Tax Bracket
Arbitrage 4-part series, making the tool a natural companion to existing content.
**Inspiration**: The author's existing ASP.NET calculator at pawtrackz.pinnaclepet.net already
used this editable year-by-year model. The v1 goal is to enhance — not replace — that approach.

### Default annual return rate — 7% (real, inflation-adjusted)
**Date**: 2026-06-29
**Decision**: Default return rate is 7%, displayed with a tooltip clarifying it's inflation-adjusted.
**Why**: Matches FIRE community conventions (historical S&P 500 minus ~3% inflation). More honest
than 10% nominal — users who don't think about inflation separately end up with accurate projections.
The blog's "know your math" ethos supports the conservative, accurate default.

### Table length — "Years to Project" input, default 60
**Date**: 2026-06-29
**Decision**: A "Years to Project" input in the Input Panel controls table length, defaulting to 60.
**Why**: Fixed 60 rows would work but gives the user no control. An input is only marginally more
complex to build and lets younger users extend the projection. 60 years covers roughly age 30–90
for most FIRE-age users, which is the right default window.

### Recharts for charting
**Date**: 2026-06-29
**Decision**: Use Recharts for the portfolio chart.
**Why**: Most popular React charting library, excellent TypeScript support, easy to customize,
well-documented. Good fit for a developer new to React. Alternative considered: Chart.js —
rejected because its React wrapper (react-chartjs-2) adds a layer of complexity.

### Tailwind CSS for styling
**Date**: 2026-06-29
**Decision**: All styling via Tailwind utility classes. No CSS files or CSS modules.
**Why**: Tailwind keeps styles co-located with components (easier to reason about), eliminates
naming decisions, and is the de facto standard in the Next.js ecosystem. Good fit for a
developer coming from ASP.NET who is less experienced with CSS patterns.

### Withdrawal switch triggers at targetRetirementAge, not when FI balance is hit
**Date**: 2026-06-29
**Decision**: The table switches from contributions to withdrawals when `year >= targetRetirementYear`,
not when `endBalance >= fiNumber`.
**Why**: More intuitive — users set a retire age and that's when withdrawals start. The original
FI-trigger was surprising: if you hit your FI number early, the table silently switched to
withdrawals years before the retire age. Also fixes auto-coast: coasting now correctly runs all
the way to the retire age rather than terminating early at FI balance.

### Tab-based InputPanel over collapsible sections
**Date**: 2026-06-29
**Decision**: Three tabs (Inputs / Assumptions / Settings) with a fixed-height content area;
no collapsible accordion sections.
**Why**: Collapsible sections would cause the panel — and the chart beside it — to expand and
contract as users open/close them. Tabs give a stable layout. Fixed h-[340px] content area
means the chart height is predictable regardless of which tab is active.

### Per-cell ↺ reset over protecting retirement cells or fill-down warnings
**Date**: 2026-06-30
**Decision**: Overridden cells show a small ↺ icon that resets just that cell to its calculated
default. "Clear Manual Table Edits" remains as a bulk reset.
**Why**: Three alternatives were considered: (1) make retirement withdrawal cells read-only by
default, (2) warn when fill-down would cross a phase boundary, (3) per-cell reset. Option 1
is the cleanest architecture long-term but is a bigger UX change. Option 2 prevents accidents
but doesn't help after the fact. Per-cell reset is surgical, discoverable (amber + ↺ signals
the cell is overridden), and works for any field in any phase. Combined with Phase Fill Down's
boundary-stopping, it covers both prevention and recovery.

### Phase Fill Down — stops at phase boundaries
**Date**: 2026-06-30
**Decision**: Fill-down cascades edits only within the current phase (Accumulation, Coasting,
or Retirement). Renamed "Phase Fill Down" to set the right expectation.
**Why**: The original fill-down went to end-of-table. Crossing into retirement would overwrite
inflation-adjusted auto-calculated withdrawals with a fixed number — a destructive, hard-to-undo
change. Stopping at phase boundaries makes fill-down safe by default. The name change signals
the behavior without needing to read the tooltip.

### Inflation-adjusted fill-down for retirement — built (supersedes earlier deferral)
**Date**: 2026-07-05
**Decision**: Added "Apply Inflation Rate to Withdrawals" as a sub-checkbox nested under
Phase Fill Down (Settings tab), default checked, disabled unless Phase Fill Down is checked.
When both are on and the fill-down source cell is a Retirement-phase withdrawal (negative
`contributionOrWithdrawal`), each cascaded row grows by the Inflation Rate compounding from
the edited year, instead of repeating the same dollar value. Positive overrides (a manual
contribution during retirement) always cascade flat, regardless of the checkbox — inflation
doesn't have a meaningful sign-agnostic interpretation for a contribution.
**Why**: The original 2026-06-30 deferral called the confusing-UX concern out ("you type
$40,000, cells show $41,200, $42,436..."), but on reflection that's the *correct* behavior —
it mirrors how the un-overridden default withdrawal already grows automatically, so the
override should grow the same way once fill-down is invoked. Making it an opt-in checkbox
(rather than always-on) addresses the original readability concern without giving up the
feature: the value shown while typing is still the flat number you entered; only the
cascaded rows below compound.

### FI / Coast FI "already reached at day one" — table highlight vs. card messaging are separate
**Date**: 2026-07-05
**Decision**: `calculateResult` exposes two different notions of "when": `fiYear`/`fiAge` and
`coastFiYear`/`coastFiAge` answer "is this true, and since when" (true even if true on day
one — current balance already above the FI number, e.g.) and drive the ResultSummary cards.
Separate `fiHighlightYear`/`coastFiHighlightYear` answer "did this become true *during* the
projection" (a genuine crossing — starting balance below the threshold, ending balance at/above
it) and drive the PhaseTable row highlight and PortfolioChart reference line.
**Why**: Highlighting row 1 (or drawing a chart line at year 0) as "the year you hit FI" is
misleading when you were already there before the projection starts — there's no in-projection
milestone to point at. But the summary cards should still say "You are already FI!" in that
case rather than "Not reached", which is a different, still-true fact. Conflating the two
into a single field either breaks the table (highlights day one) or breaks the cards (loses
the "already true" messaging) — they need to stay separate.

### Coast FI threshold clamps years-to-retirement at zero
**Date**: 2026-07-05
**Decision**: When computing the Coast FI threshold, `yearsToRetirement` is clamped to
`Math.max(0, targetRetirementYear - row.year)` rather than skipping the row when the target
retirement year has already passed.
**Why**: If Target Retire Age is at or before the user's current age (a valid scenario —
someone deciding to retire now or who's already past their target), the discount-back
threshold math degenerates cleanly to the FI number itself at zero years of runway. The
original code returned `false` outright for zero-or-negative years, so Coast FI Date showed
"Not reached" even when clearly true. Card copy also special-cases this: if the coast
milestone is "already reached" and the user is at/past their target retirement age, the
sub-label reads "You're already past your target retirement age" instead of the otherwise
nonsensical "You can already coast to retire at 59!" said at age 60.

### Dark mode removed — app is intentionally light-theme only
**Date**: 2026-07-05
**Decision**: Deleted the `@media (prefers-color-scheme: dark)` block from `globals.css`
(a leftover from the `create-next-app` starter template). `--background`/`--foreground`
now stay pinned to the light values regardless of OS theme.
**Why**: Every component in the app (header, cards, panels) is hardcoded to light-theme
Tailwind classes (`bg-white`, `text-gray-900`, etc.) — none of it actually adapts to dark
mode. But `<input>` elements never set their own text color, so they inherited `body`'s
`color`, which the leftover media query flipped to near-white under system dark mode —
rendering barely-visible light-gray text on hardcoded-white input boxes. This is far more
visible on mobile (dark mode is a common default there) than on desktop, which is how it
went unnoticed. Retrofitting real dark-mode support across every component was out of
scope; pinning to light-only closes the mismatch with a one-line change.

### Info tooltips render through a portal, not CSS `group-hover`
**Date**: 2026-07-05
**Decision**: `InfoTooltip` (`src/components/ui/InfoTooltip.tsx`, shared by InputPanel and
PhaseTable) measures its icon's screen position on hover/focus and renders the tooltip panel
via `createPortal` into `document.body` with `position: fixed`, clamped to the viewport
horizontally and flipping to open below when there's insufficient room above.
**Why**: The original implementation was a pure-CSS `.group:hover .panel{visible}` pattern,
positioned `absolute` relative to the icon. That works fine in the InputPanel (not inside
any scrolling ancestor), but the same component is also used inside PhaseTable's
`overflow-auto` table — any tooltip panel that overflows the table's bounds (which happens
routinely, since the Coast FI icon sits in the leftmost Year column) gets silently clipped
by the table's own scroll container, in any direction. Rendering through a portal escapes
that ancestor entirely, so the tooltip is never clipped regardless of where the row sits in
the scrolled viewport.

### Coast FI row gets a conditional tooltip explaining what it means
**Date**: 2026-07-05
**Decision**: When a row is highlighted "Coast FI" and Auto-Coast is *unchecked*, a small
info icon appears next to the label explaining that the row means "you could stop
contributing here and still reach your FI Number by your Target Retire Age" and pointing to
the Auto-Coast setting. The icon is omitted when Auto-Coast is checked, since the table
already visibly demonstrates the behavior (contributions drop to $0, phase badge changes).
**Why**: "Coast FI" as a label is jargon that's easy to misread as something the table is
already doing automatically. The tooltip closes that gap only where it's actually ambiguous.

---

## Open — Needs Decision

*None currently.*
