# Product Requirements Document
# FIcology101 FIRE Calculator

**Version**: 0.1
**Last updated**: 2026-06-29
**Status**: Draft

---

## Overview

A single-page, interactive FIRE (Financial Independence, Retire Early) calculator hosted at
tools.ficology101.com. It is a companion to the ficology101.com blog. The calculator models
the full FIRE journey across three phases — accumulation, gap years (partial retirement),
and full retirement — with a year-by-year projection table, a portfolio chart, and clear
"you can retire at age X" summary callouts. No login required; all calculation is client-side.

## Goals
- Give ficology101.com readers an interactive tool that makes the blog's concepts tangible
- Model the complete FIRE lifecycle, not just accumulation (most calculators stop there)
- Drive return visits and new traffic from search / word of mouth
- Be simple enough to actually ship as a solo developer learning React/Next.js

## Out of Scope (v1)
- User accounts, saved calculations, or any persistence
- Mobile-optimized layout (desktop-first for v1)
- Inflation adjustment (can add in v2)
- Social Security / pension income modeling
- Multiple portfolio scenarios side-by-side
- Email capture or newsletter integration

---

## User Roles

| Role | Description |
|---|---|
| **Anonymous visitor** | Anyone who lands on the page — no login, no account |

---

## Core Features

### 1. Global Inputs Panel
The user sets their starting assumptions once. These seed the year-by-year table.

- **Birth year** — used to display age alongside each projected year
- **Current year** — auto-populated with today's year, editable
- **Current portfolio balance** — today's total invested assets ($)
- **Annual contribution** — how much they save/invest per year ($)
- **Expected annual return** — percentage (default: 7%)
- **Annual expenses in retirement** — used to calculate FI number
- **Safe withdrawal rate** — percentage (default: 4%)
- **FI Number** — auto-calculated as (annual expenses ÷ SWR), displayed read-only but overridable

### 2. Phase-Aware Year-by-Year Table
The core of the calculator. A grid showing one row per year, editable at the cell level.
Based on the original ASP.NET calculator the author built and has used for years.

Columns:
- **Year** — calendar year
- **Age** — derived from birth year, read-only
- **Phase** — auto-assigned label: Accumulation / Gap Years / Retirement
- **Balance (start of year)** — calculated, read-only
- **Contribution / Withdrawal** — editable; positive = saving, negative = withdrawing
- **Return %** — editable; defaults to global return, overridable per year
- **Balance (end of year)** — calculated, read-only

Behaviors:
- "Fill down" checkbox: when a cell is edited, the change cascades to all rows below
- Phase is auto-detected: Accumulation (contributions > 0), Gap Years (contribution = 0),
  Retirement (withdrawal < 0)
- Table auto-highlights the row where portfolio first reaches the FI number
- Table auto-highlights the row where portfolio hits $0 (longevity risk warning)
- Rows extend 60 years from current year by default

### 3. Portfolio Chart
A line chart (Recharts) plotting portfolio balance over time.

- X-axis: Year (with age as secondary label)
- Y-axis: Portfolio balance ($)
- Reference line at FI number (horizontal dashed line)
- Phase regions shaded in different colors (accumulation / gap / retirement)
- Tooltip on hover showing year, age, balance, phase

### 4. Result Summary Cards
Three callout cards above the chart:

- **"You hit FI at age X (Year Y)"** — when balance first crosses FI number
- **"Your money lasts until age Z"** — when balance hits $0, or "Your money outlasts you"
  if portfolio survives to age 95
- **"Your FI Number is $X"** — calculated from expenses ÷ SWR, with brief explanation

---

## User Stories

### Anonymous visitor
- As a visitor, I want to enter my current savings and see when I can retire, so I can
  set a concrete target
- As a visitor, I want to adjust the return rate per year, so I can model conservative
  vs. optimistic scenarios
- As a visitor, I want to model gap years where I stop contributing but don't yet withdraw,
  so I can plan a partial early retirement
- As a visitor, I want to see a chart of my portfolio over time, so I can understand the
  shape of my journey visually
- As a visitor, I want to flip contributions negative to model withdrawals, so I can see
  how long my portfolio survives in retirement

---

## Acceptance Criteria (MVP)
- [ ] User can enter all global inputs and table recalculates immediately
- [ ] Year-by-year table renders 60 rows by default
- [ ] Individual cells (contribution, return %) are editable inline
- [ ] "Fill down" cascades a cell edit to all rows below
- [ ] FI number auto-calculates from expenses and SWR
- [ ] FI crossover row is highlighted in the table
- [ ] Portfolio $0 row is highlighted with a warning color
- [ ] Chart renders and updates in real time as inputs change
- [ ] Three summary cards show correct FI age, longevity, and FI number
- [ ] All calculation is client-side — no network requests for compute

---

## Open Questions
- [ ] Should the table default to 60 rows or grow dynamically?
- [ ] What's the right default return rate — 7% (real) or 10% (nominal)?
- [ ] Should we show inflation-adjusted values in a separate column (v1 or v2)?
