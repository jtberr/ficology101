# Progress
# FIcology101 FIRE Calculator

**Last updated**: 2026-07-05

---

## Current Status: Feature-complete — ready for deploy

---

## What This Project Is

A Next.js app at tools.ficology101.com: a phase-aware FIRE calculator with a year-by-year
editable table, portfolio chart, and FI date/longevity summary cards. Companion to the
ficology101.com WordPress blog. No login, no backend — fully client-side.

---

## Key Decisions Made
- **WordPress stays**: Blog remains on WordPress; this app is tools.ficology101.com only
- **Single feature v1**: Just the FIRE calculator — no other features until this ships
- **Client-side only**: All calculation in the browser; no API routes or database for v1
- **Three-phase model**: Accumulation / Gap Years / Retirement, auto-detected from contribution sign
- **Tech stack**: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Recharts, Vercel

## Pending Decisions
- None — all pre-build decisions resolved.

---

## Completed
- [x] Spec all ai-context files (PRD, ARCHITECTURE, SCREENS, DECISIONS, AGENTS, PROGRESS)
- [x] Scaffold Next.js project — Next.js 16.2.9, TypeScript, Tailwind v4, Recharts installed
      Folder structure matches agents.md spec; build passes clean (`npm run build`)
- [x] Define all types in `src/lib/types.ts` — `GlobalInputs`, `Phase`, `TableRow`,
      `CellOverrides`, `CalculatorResult`, matching ARCHITECTURE.md and DECISIONS.md
      (includes `yearsToProject` per the "Years to Project" input decision)
- [x] Write pure calculation functions in `src/lib/calculator.ts` — `calculateFiNumber`,
      `detectPhase`, `calculateRows`, `calculateResult` all implemented per ARCHITECTURE.md.
      Sanity-checked manually: $200k start + $30k/yr @ 7% hits $1M FI number at age 46;
      post-FI withdrawal scenario behaves correctly (portfolio still grows when SWR < return).
- [x] Build `InputPanel.tsx` — all 5 sections (You, Portfolio Today, Assumptions, Retirement,
      Table Settings); shared `NumberField` primitive in `src/components/ui/NumberField.tsx`.
      Visually verified in browser: all 9 number inputs, Fill Down checkbox, live state update.
- [x] Build `PhaseTable.tsx` — 60-row editable table with inline cell editing, Tab/Enter/Escape
      navigation, FI row (green) + depletion row (red) + current year (bold) highlights, phase
      badges (Accumulation/Gap Year/Retirement/FI/$0). Verified: edit commits cascade through all
      downstream rows, Tab moves focus to next editable cell, blur commits correctly.
- [x] Build `PortfolioChart.tsx` — Recharts 3.9 LineChart with dual year/age X-axis ticks,
      $K/$M Y-axis formatting, phase shading via ReferenceArea (blue/amber/green), dashed FI
      number ReferenceLine, hover tooltip (year, age, phase, balance, contribution/withdrawal).
      Verified in browser with three-phase scenario; tooltip shows correct values.
- [x] Build `ResultSummary.tsx` — three cards: FI Number (with expenses÷SWR sub-label),
      FI Date (green if reached / gray if not, shows "X years from now"), Money Lasts Until
      (green >90 / amber 80-90 / red <80 / green "Outlasts age N" if never depletes).
      Verified all three states in browser; color coding and values correct.

## Completed (continued)
- [x] Wire everything together in `CalculatorClient.tsx` — owns all state (inputs, overrides,
      fillDown), derives result and computedFiNumber via useMemo, wires all four components.
      Fill-down cascade logic in handleCellChange. Browser-verified: redirect works, all 4
      components render, reactivity confirmed (balance change updates FI date + chart in real-time),
      cell edit cascade correct (row N end = row N+1 start), fill-down cascades to all rows ≥ year.

## Completed (continued — 2026-06-29 / 2026-06-30 polish session)
- [x] Tab-based InputPanel: Inputs / Assumptions / Settings tabs with fixed h-[340px] content area;
      no height jump between tabs; tooltips no longer clipped (removed overflow-hidden)
- [x] Auto-Coast: checkbox in Settings tab; after coastFiYear, rows default to $0 contribution;
      Coast FI detection guarded so it only fires when yearsToRetirement > 0
- [x] Withdrawal switch moved to targetRetirementAge (was: triggered when FI balance hit);
      auto-coast coasting period now correctly runs all the way to retirement age
- [x] Chart reference lines: Coast FI (purple dashed), Retirement (green dashed),
      FI Number (teal dashed with label), $0 baseline (gray solid, only when portfolio depletes)
- [x] Static two-row chart legend at bottom; Coast FI entry always shown (not conditional)
- [x] FI Number reference line color changed from green → teal to distinguish from Retirement line
- [x] Table milestone labels under Year column (FI, Coast FI, Depleted) instead of phase pills;
      row tinting (green = FI year, purple = Coast FI year, red = depletion year)
- [x] Amber highlight on overridden cell value span (not column background); red text preserved
      for negative values; pencil SVG icon (diagonal, blue) in editable column headers
- [x] Cell edit commit guard: only fires onCellChange if parsed value differs from current row value
- [x] FI Number override: "↺ Reset to auto-calculate" link clears fiNumberOverride back to null
- [x] ResultSummary: removed fiYear gate from "Money Lasts Until" card — depletion now shown
      regardless of whether FI number is reached (correct since withdrawals trigger at retire age)
- [x] Negative Y-axis values formatted with sign + abs value (e.g., -$200K not $-200K)
- [x] Collapsible "How to use" instructions expanded: updated all bullets to match current UI,
      added "Scenarios & Tips" subsection with 7 practical tips
- [x] Per-cell ↺ reset: small reset button appears in overridden cells; clears just that cell's
      override without affecting other manual edits; cleans up year key when no overrides remain
- [x] Phase Fill Down: fill-down now stops at phase boundaries (Accumulation/Coasting/Retirement);
      renamed from "Fill Down" to "Phase Fill Down" in UI and instructions; tooltip updated

## Completed (continued — 2026-07-05 bug-fix & polish session)
- [x] Cell-edit decimal precision: edit box now rounds to cents (`toEditString` helper in
      `PhaseTable.tsx`) instead of showing raw floating-point tails (e.g. `-69556.443...`)
      from inflation-compounded retirement withdrawals; commit-guard comparison updated to match
- [x] FI/Coast FI row highlighting no longer fires on day one: added `fiHighlightYear` and
      `coastFiHighlightYear` (crossing-only: startBalance below threshold, endBalance at/above)
      separate from `fiYear`/`coastFiYear` (first-satisfied, used by ResultSummary cards) —
      see DECISIONS.md. PortfolioChart's Coast FI reference line uses the same crossing value.
- [x] Coast FI threshold clamps `yearsToRetirement` to a minimum of 0 instead of returning
      `false` for zero/negative values — fixes "Not reached" when Target Retire Age equals or
      is before the user's current age despite balance clearing the FI number
- [x] ResultSummary Coast FI sub-label: "You're already past your target retirement age" when
      already-reached and the user is at/past Target Retire Age, instead of the nonsensical
      "You can already coast to retire at 59!" shown at age 60
- [x] NumberField blur guard: only fires `onChange` if the parsed value differs from the
      current value — fixes FI Number field locking into a manual override (showing
      "↺ Reset to auto-calculate") just from tabbing through without editing
- [x] Built inflation-adjusted Phase Fill Down (previously deferred 2026-06-30, now built with
      a refined design — see DECISIONS.md): "Apply Inflation Rate to Withdrawals" checkbox,
      default checked, disabled unless Phase Fill Down is checked; grows cascaded
      Retirement-phase withdrawals by the Inflation Rate; positive overrides always cascade flat
- [x] Removed dark-mode CSS (`prefers-color-scheme` media query in `globals.css`) — fixed
      barely-visible light-gray input text on mobile Chrome (iOS/Android) with system dark mode on
- [x] Extracted shared `InfoTooltip` component (`src/components/ui/InfoTooltip.tsx`); rebuilt
      it to render via `createPortal` into `document.body` instead of CSS `group-hover`, fixing
      clipping when used inside PhaseTable's scrollable table (see DECISIONS.md)
- [x] Added conditional tooltip on the "Coast FI" row label (shown only when Auto-Coast is
      unchecked) explaining the milestone and pointing to the Auto-Coast setting

## Up Next (in order)
1. Deploy to Vercel, configure tools.ficology101.com CNAME

---

## Notes / Things Discovered
- 2026-06-29: Author has an existing ASP.NET calculator at pawtrackz.pinnaclepet.net/investcalc.aspx.
  Key insight: the editable year-by-year table with "fill down" is its best feature and should be
  preserved. The enhancement is wrapping it in phase awareness, a chart, and summary cards.
- 2026-06-29: Developer has 30 years Microsoft stack experience but is new to React/Next.js.
  Bridge explanations to ASP.NET patterns. Keep code explicit and typed.
- 2026-06-29: Scaffolded with Next.js 16.2.9 (not 14 as originally planned — latest stable).
  Tailwind is v4 (uses @tailwindcss/postcss, not tailwind.config.js). Both are fine for the project.
- 2026-07-05: `npm run dev &` backgrounded via bash — if a prior dev server on port 3000 is only
  killed by its wrapper PID (not the actual `next dev`/Turbopack child), the old process keeps
  the port and silently keeps serving stale code while new "restarts" spin up on 3001+ and exit.
  Also hit a real Turbopack dev-cache staleness case (a CSS-only edit wasn't reflected even after
  confirming the right PID owned port 3000). When dev-server output looks stale: check
  `netstat -ano` for who actually holds the port, kill that PID directly, and if still stale,
  delete `.next/` before restarting.
