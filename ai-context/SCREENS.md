# Screen List & Navigation Flow
# FIcology101 FIRE Calculator

**Last updated**: 2026-06-29

---

## Navigation Pattern Notes
- Single-page application — no page navigation, everything is on one screen
- The calculator is the entire app; `/` redirects to `/calculator`
- No login, no navigation menu beyond a header with the FIcology101 logo/link back to blog
- Layout: header → summary cards → chart → [inputs panel | table] side by side

---

## URL Structure

```
/                   → redirects to /calculator
/calculator         → the FIRE calculator (the entire app)
```

---

## Public Screens

### / — Root
Immediately redirects to `/calculator`. No content rendered.

---

### /calculator — FIRE Calculator
The entire application. One screen. All interactions happen here without page navigation.

**Header**
- FIcology101 logo (links back to ficology101.com blog)
- Page title: "FIRE Calculator"
- Tagline: "Know your number. Know your date."

**Result Summary Cards** (top of page, always visible)
Three cards in a row, updating in real time as inputs change:
- Card 1 — **FI Number**: "Your FI Number is $[X]" with sub-label "([expenses]/yr ÷ [SWR]% SWR)"
- Card 2 — **FI Date**: "You hit FI at age [X] in [Year Y]" — green if reachable, gray if not yet
- Card 3 — **Longevity**: "Your money lasts until age [Z]" — green if > 90, yellow if 80-90,
  red if < 80, or "Outlasts age 95" if portfolio never depletes

**Two-column layout below the cards**

*Left column — Input Panel*
Global assumptions. Changing any input recalculates everything immediately.

Sections:
- **You**: Birth Year, Current Year
- **Portfolio Today**: Current Balance ($), Annual Contribution ($)
- **Assumptions**: Expected Annual Return (%), Safe Withdrawal Rate (%)
- **Retirement**: Annual Expenses in Retirement ($), FI Number (auto-calc, overridable)
- **Table Settings**: Number of years to project (default 60), Fill Down checkbox

*Right column — Portfolio Chart*
Recharts `<LineChart>` showing portfolio balance over time.
- X-axis: Year (age shown as secondary tick label)
- Y-axis: Portfolio balance in dollars (formatted with $K / $M abbreviations)
- Horizontal dashed reference line at FI Number
- Phase shading: accumulation (blue tint), gap years (yellow tint), retirement (green tint)
- Tooltip on hover: Year, Age, Phase, Balance, Contribution/Withdrawal

**Year-by-Year Table** (full width, below the two-column section)
Scrollable grid. One row per projected year.

Columns (left to right):
| Column | Editable? | Notes |
|---|---|---|
| Year | No | Calendar year |
| Age | No | Derived from birth year |
| Phase | No | Auto-detected badge: Accumulation / Gap Years / Retirement |
| Start Balance | No | End balance of prior row |
| Contribution / Withdrawal | Yes | Positive = saving, negative = withdrawing; inline edit |
| Return % | Yes | Defaults to global rate; per-year override |
| End Balance | No | Calculated: (start + contribution) × (1 + return) |

Row highlighting:
- **FI crossover row** — green background, "🎯 FI" badge in Phase column
- **Portfolio depletion row** — red background, "⚠️ $0" badge
- **Current year row** — bold, slightly different background

Interactions:
- Click any editable cell → inline text input appears
- Tab/Enter to confirm and move to next editable cell
- If Fill Down is checked → edit cascades to all rows below in same column
- Escape → cancel edit, restore prior value

---

## Navigation Flow Summary

```
ficology101.com/blog  ──→  tools.ficology101.com/calculator
(WordPress blog)                (Next.js app — this project)
                                        │
                                (single screen, no navigation)
                                        │
                        ┌───────────────┼───────────────┐
                        │               │               │
                  Input Panel     Portfolio Chart   Result Cards
                  (left col)      (right col)       (top of page)
                        │
                   Year-by-Year Table
                   (full width, below)
```

---

## Screens Not Included (Out of Scope v1)
- Login / account creation
- Saved scenarios
- Share / export (PDF, link-with-state)
- Mobile layout
- Multiple scenario comparison
- About / FAQ page (link to blog instead)
