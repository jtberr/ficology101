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

### Coast FI threshold discounts back `yearsToRetirement - 1`, not `yearsToRetirement`
**Date**: 2026-07-09
**Decision**: Both `calculateRows`' coast-detection check and `calculateResult`'s
`coastThreshold` now discount `fiNumber` back by `targetRetirementYear - year - 1` years
(floored at 0), not `targetRetirementYear - year`.
**Why**: The target retirement year itself is not a coasting-growth year — per the
"withdrawal switch triggers at targetRetirementAge" decision above, `year >= targetRetirementYear`
already flips that row to retirement mode (lower `retirementReturnPct`, minus a full year of
`annualExpenses` subtracted before growth). The old formula assumed coasting compounded at
`expectedReturnPct` for the full `yearsToRetirement` years, but coasting only ever gets
`yearsToRetirement - 1` real growth years before the switch — a one-year overpromise. Because
Coast FI is defined to just barely clear the bar (no margin), that shortfall was fatal: with
Auto-Coast on, real-world reproduction (birth year 2003, $80k balance, $2,400/yr contribution,
all other defaults) showed the balance permanently topping out around $1.43M against a $1.5M
FI number — Coast FI was flagged in 2026, contributions stopped, and the balance never
actually reached FI, contradicting the entire premise of the feature. Fixing the exponent
moves the detected Coast FI year later (2026 → 2029 in the repro case) but guarantees the
balance actually reaches the FI number before retirement withdrawals begin (FI year 2067,
one year before the 2068 retirement year) and stays above it afterward. This also shifts the
Coast FI date shown in ResultSummary later for every user, even without Auto-Coast enabled —
correcting a previously-too-optimistic date, not a regression.

### "Years to Project" replaced with "Project To Age", floored at 10 rows
**Date**: 2026-07-09
**Decision**: Renamed the `yearsToProject` field to `ageToProjectTo` (label "Project To Age",
default 110, max 150). `calculateRows` now derives the actual row count internally as
`Math.max(10, (birthYear + ageToProjectTo) - currentYear + 1)` instead of consuming a
stored row count directly.
**Why**: Asking users to mentally convert "how old do I want this to run to" into "how many
years is that" was an unnecessary step — an age is what people actually think in. Computing
the row count from age also needed a floor: if `ageToProjectTo` is close to (or below) the
user's current age, a naive `age - currentAge` calculation could produce a degenerate
1-row or empty table. A floor of 10 rows (chosen over an initial proposal of 50, which felt
too aggressive relative to how close to the target age a table would still project) means the
entered age acts as a *minimum* — the table always shows at least that age, or 10 rows,
whichever is longer — without needing separate input validation to reject "unreasonable"
ages relative to birth year.

### Birth Year and Current Year get mutually-derived min/max bounds
**Date**: 2026-07-09
**Decision**: `NumberField` gained `max` support (mirroring existing `min` clamping — applies
on typing, blur, and arrow-key stepping). Birth Year is bounded `[1900, values.currentYear]`;
Current Year is bounded `[values.birthYear, new Date().getFullYear() + 100]`.
**Why**: Both fields previously had no bounds, and — unlike other numeric inputs — a typo in
either one could balloon the table to thousands of rows (since row count now derives from
`ageToProjectTo - currentYear`, per the decision above) or produce a nonsensical negative age.
The bounds are deliberately relative rather than hardcoded absolutes: Birth Year's ceiling is
whatever Current Year is currently set to (not a literal year, which would go stale), and
Current Year's ceiling is computed from the browser clock at runtime (`new Date()`), not a
baked-in constant — both self-correct forever without code changes. The `+100` year headroom
on Current Year (rather than capping at "today") was a deliberate choice to preserve a real
use case: modeling a delayed plan start (e.g., "I start seriously saving in 2 years").

### Annual/Monthly entry toggle for Contribution and Expenses — display-only conversion
**Date**: 2026-07-10
**Decision**: Added an Annual/Monthly toggle (left-aligned, bottom of the Inputs tab, below
the FI Number field) that changes how the Annual Contribution and Annual Expenses fields are
entered and displayed. `GlobalInputs.annualContribution`/`annualExpenses` remain the only
source of truth and are always annual — the toggle's state lives outside `GlobalInputs`
entirely (a local `entryUnit` state in `CalculatorClient.tsx`, the same pattern as `fillDown`).
Conversion happens only at the `InputPanel` display/edit boundary: `toDisplay()` divides by
12 (rounded to the nearest dollar) for showing, `fromDisplay()` multiplies by 12 when an edit
commits. Toggling itself never calls `setField`, so switching back and forth never writes
anything and can never drift the stored value through repeated rounding.
**Why**: Two users independently said they think in monthly terms (paycheck-sized
contributions, monthly bills) rather than annual. Converting purely at the input/display layer
— rather than switching the calculation engine to monthly compounding — means zero changes to
`calculator.ts`, the table, the chart, or Coast FI/FI-number math; the annual model that's
already been tuned and bug-fixed stays untouched. The "no write on toggle" guarantee was a
specific requirement: the user was concerned that toggling back and forth, combined with
rounding a non-evenly-divisible annual figure (e.g. $10,000/yr → $833/mo), could cause the
stored value to drift each round-trip. It can't, by construction — only an explicit, deliberate
edit (typing a new number) ever converts and writes back, and `NumberField`'s existing
no-op-on-blur guard (from an earlier fix) means tabbing through without changing anything
doesn't trigger a write either.
**Also added**: a reminder in the Monthly Expenses tooltip to spread irregular/annual costs
(insurance premiums, property tax, car repairs) across the 12 months rather than omitting
them — a real risk of thinking in monthly terms — and a corresponding bullet in the
"How to use this calculator" instructions.

### Persistence: localStorage auto-save + Reset Calculator + Copy Share Link
**Date**: 2026-07-10
**Decision**: Three related features, all client-side only:
1. **Auto-save to localStorage** — `inputs`, table `overrides`, and the `fillDown`/
   `applyInflationFillDown`/`entryUnit` preferences are silently written to a single
   localStorage key on every real change and restored on the next visit. No save button;
   same "just works" reactivity as the rest of the calculator.
2. **Reset Calculator** (renamed from an initial "Reset All Inputs" — see below) — a button
   next to "Clear Manual Table Edits" that resets everything (inputs, overrides, preferences)
   back to defaults and clears the localStorage key. Behind a `confirm()` prompt, since unlike
   "Clear Manual Table Edits" it destroys persisted data, not just in-memory state. Only
   rendered when `hasAnyChanges` is true (anything differs from a fresh install) — mirrors
   the existing `hasOverrides`-gated visibility of "Clear Manual Table Edits".
3. **Copy Share Link** — an icon-only button (top-right of the tab strip, far right of the
   Inputs/Assumptions/Settings labels) that encodes `inputs` + `fillDown` +
   `applyInflationFillDown` + `entryUnit` (everything on those three tabs, but deliberately
   *not* table overrides) into a `?d=` URL query param and copies the resulting URL to the
   clipboard. Opening that link restores all four. Table overrides are excluded specifically
   because a heavily-edited table could push the URL past safe cross-browser length limits.
**Why**: Requested directly — users want to not re-enter their numbers every visit, and to be
able to hand a scenario to someone else (or their own other device) without an account.
localStorage keeps the "no server, no accounts" design fully intact (data never leaves the
browser). "Reset Calculator" exists because once something persists automatically, there needs
to be a visible way back to a blank slate — both for testing new scenarios and for privacy on
a shared/borrowed computer. It was originally named "Reset All Inputs," but that read as
scoped to the Inputs tab specifically when it actually also clears table edits; renamed for
clarity. The icon-only Share Link button (rather than a labeled button, tried first as "Copy
Share Link" text in the tab strip, then relocated near the Annual/Monthly toggle) exists
because the tab strip only has ~80px of leftover width after the three tab labels — nowhere
near enough for a labeled button, but plenty for a small icon matching the app's existing
inline-SVG icon convention (the pencil icon marking editable table columns).
**Also decided**: opening a shared link must not silently overwrite the visitor's own saved
localStorage profile just from viewing it. This is enforced via a `suppressAutoSaveRef` that
starts `true` only on the share-link hydration path, and is only ever cleared by a genuine
user edit (tracked through wrapped state setters, not by counting renders) — the auto-save
effect checks this ref and skips writing until it's cleared. Editing anything after opening a
shared link is treated as adopting it as your new working profile from that point on.
**Bug hit and fixed**: the first implementation used a lazy `useState(() => ...)` initializer
to read localStorage/the URL param, cached via a module-level variable to avoid re-parsing
per-field. This caused a React hydration mismatch — the initializer runs during the server's
render (no `window`, falls back to defaults) *and* during the client's first render (`window`
exists, immediately reads real data), so server and client HTML disagreed and React discarded
the tree. Fixed by reverting to the standard safe pattern: `useState` always starts at
hardcoded defaults (identical on server and client), and the real values are swapped in
afterward in a `useEffect` that only runs post-hydration — accepting a one-frame flash of
defaults in exchange for never mismatching. This required a scoped
`react-hooks/set-state-in-effect` lint exception on that effect, since hydrating from an
external client-only store on mount is one of the few legitimate reasons to call `setState`
inside an effect — the lint rule doesn't know that the alternative (the lazy initializer) is
actively broken for SSR.
**Rejected alternative — live URL sync**: continuously updating the address bar's `?d=` query
string on every keystroke (so the browser's native bookmark star would always capture current
state) was considered and explicitly rejected by the user. It would make native one-click
bookmarking work, but at the cost of the address bar visibly rewriting itself on every edit —
those two properties are in tension and can't both be had without some form of live URL
updating. Native star-bookmarking a specific scenario remains unsupported; the documented
workaround is Copy Share Link followed by manually creating a bookmark with that URL pasted in.

### Portfolio balance line renders red below $0
**Date**: 2026-07-10
**Decision**: The endBalance line in `PortfolioChart.tsx` is colored via an SVG
`linearGradient` (`stroke={url(#balanceLineColor)}`) rather than a flat color. Gradient stops
are computed by walking consecutive row pairs and linearly interpolating the exact fractional
x-position where `endBalance` crosses zero, inserting two stops at (almost) the same offset
— one in the outgoing color, one in the incoming — for a hard cutover rather than a blended
transition. Handles any number of crossings, not just a single depletion point. The hover
"active dot" also picks its color the same way (red if `payload.endBalance < 0`), so it never
mismatches the segment it's sitting on.
**Why**: Requested directly, to make portfolio depletion visually obvious on the chart itself
rather than only inferred from the separate $0 reference line and the "Depleted" table label.
Recharts has no built-in per-segment line coloring; the gradient-with-interpolated-stops
technique is the standard way to fake it, and generalizing to multiple crossings (rather than
assuming a single one) costs little extra code while covering edge cases like a manually
overridden table recovering above $0 after a dip.
**Legend iteration**: went through several rounds of feedback — first two separate legend
entries (one row each for "Balance" and "Balance Below $0"), then consolidated into one row
folded into the existing FI Number/Retirement/Coast FI reference-line row (rather than its own
row) to control vertical space, then a combined two-color swatch, then tried coloring the "+"
and "-" characters directly (removing the swatch), then reverted to keep the swatch *and* the
plain-colored "+ / -" text together, then dropped color from the text (redundant with the
swatch), landing on: swatch icon + "Balance (+ / -)" plain text.

### Table "Depleted" label is a per-row crossing check, not the single first-match depletionYear
**Date**: 2026-07-10
**Decision**: `PhaseTable.tsx` no longer takes a `depletionYear` prop. It computes depletion
per row directly from data it already has: `isDepletionCrossing(row) = row.startBalance > 0 &&
row.endBalance <= 0`, applied independently to every row rather than matching against one
precomputed year.
**Why**: `calculator.ts`'s `depletionYear` (`rows.find(row => row.endBalance <= 0)`) is a
single first-match value with no check on the starting side. Reported bug: if Current Balance
itself is negative, row 1 trivially satisfies `endBalance <= 0` and got labeled "Depleted"
even though nothing actually depleted during the projection — it started that way. And because
it's a single first-match value, no later row could ever be labeled "Depleted" even if the
balance recovered positive and dipped negative again. The fix mirrors the FI/Coast FI
"highlight is a crossing, not first-satisfied" distinction (see the 2026-07-05 decision above)
but goes one step further: unlike FI/Coast FI (one-time milestones, so a single highlighted
row makes sense), depletion can genuinely recur, so every qualifying row gets flagged, not
just the first. `depletionYear`/`depletionAge` in `CalculatorResult` are unchanged and still
used by the "Money Lasts Until" summary card and the chart's $0 reference-line visibility —
both are correctly first-satisfied, day-one-inclusive concepts (same reasoning as the FI/Coast
FI cards), so only the table's per-row labeling needed the crossing treatment.

---

## Open — Needs Decision

*None currently.*
