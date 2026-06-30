# Architecture
# FIcology101 FIRE Calculator

**Last updated**: 2026-06-29
**Status**: Draft — pre-implementation

---

## High-Level Data Flow

This is a fully client-side application. There is no backend, no database, and no API calls
for calculation. All state lives in the browser.

```
User edits an input (global panel or table cell)
      │
      ▼
React state update (useState in the top-level Calculator component)
      │
      ▼
calculator.ts pure functions recalculate all row data
      │
      ├─ PhaseTable receives new row data → re-renders table
      ├─ PortfolioChart receives new row data → re-renders chart
      └─ ResultSummary receives new row data → re-renders callout cards
```

No server round-trips. No persistence. The URL does not encode state (v1).

---

## Core Data Types
Defined in `src/lib/types.ts`.

### `GlobalInputs`
The top-level inputs the user sets once.

| Field | Type | Notes |
|---|---|---|
| birthYear | number | Used to compute age per row |
| currentYear | number | Auto-set to today, editable |
| currentBalance | number | Today's portfolio value ($) |
| annualContribution | number | Default contribution per year ($) |
| expectedReturnPct | number | Default annual return (e.g. 7 for 7%) |
| annualExpenses | number | Retirement spending per year ($) |
| safeWithdrawalRatePct | number | Default 4 |
| fiNumberOverride | number \| null | If null, derived as annualExpenses / (SWR/100) |

### `TableRow`
One row in the year-by-year table. The table is the source of truth.

| Field | Type | Notes |
|---|---|---|
| year | number | Calendar year |
| age | number | Derived from birthYear, read-only |
| phase | 'accumulation' \| 'gap' \| 'retirement' | Auto-detected |
| startBalance | number | Calculated, read-only |
| contributionOrWithdrawal | number | Editable; positive = contribution, negative = withdrawal |
| returnPct | number | Editable; defaults to globalInputs.expectedReturnPct |
| endBalance | number | Calculated: (startBalance + contribution) * (1 + returnPct/100) |

### `CalculatorResult`
Output of the main calculation function.

| Field | Type | Notes |
|---|---|---|
| rows | TableRow[] | Full year-by-year table |
| fiYear | number \| null | First year balance >= FI number |
| fiAge | number \| null | Age at FI year |
| depletionYear | number \| null | First year balance hits $0; null if never |
| depletionAge | number \| null | Age at depletion; null if never |
| fiNumber | number | annualExpenses / (SWR/100) |

---

## Calculation Logic
All in `src/lib/calculator.ts` as pure functions. No React, no side effects.

### `calculateFiNumber(annualExpenses, swrPct): number`
Returns `annualExpenses / (swrPct / 100)`.

### `detectPhase(contributionOrWithdrawal): Phase`
- `> 0` → `'accumulation'`
- `=== 0` → `'gap'`
- `< 0` → `'retirement'`

### `calculateRows(globalInputs, overrides): TableRow[]`
`overrides` is a map of `{ [year]: Partial<TableRow> }` for cells the user has edited.
Iterates year by year, computing each row's end balance from the prior row's end balance.
Returns 60 rows starting from `currentYear`.

### `calculateResult(globalInputs, overrides): CalculatorResult`
Calls `calculateRows`, then scans for FI crossover and depletion year.

---

## Component Architecture

```
app/calculator/page.tsx         ← Server component shell; renders <CalculatorClient />
  components/calculator/
    CalculatorClient.tsx        ← "use client" — owns all state, passes data down
      InputPanel.tsx            ← Global inputs form; calls onInputChange
      ResultSummary.tsx         ← Three callout cards; receives CalculatorResult
      PortfolioChart.tsx        ← Recharts chart; receives TableRow[]
      PhaseTable.tsx            ← Year-by-year table; receives rows + onCellChange
```

State ownership:
- `globalInputs: GlobalInputs` — in CalculatorClient
- `cellOverrides: Record<number, Partial<TableRow>>` — in CalculatorClient (keyed by year)
- `fillDown: boolean` — in CalculatorClient
- `result: CalculatorResult` — derived via `useMemo` from globalInputs + cellOverrides

---

## Key Integrations

### Recharts
- Used for the portfolio balance line chart
- `<LineChart>` with `<ReferenceLine>` at the FI number
- `<ReferenceArea>` for phase shading (accumulation/gap/retirement)
- No server dependency — renders in browser

### Vercel (hosting)
- `next build` output deployed to Vercel
- No environment variables needed for v1 (no API keys, no DB)
- Custom domain: tools.ficology101.com via CNAME in DNS

---

## Security

### OWASP Top 10 Coverage

#### A01 — Broken Access Control
No access control needed — app is fully public, no user data, no admin functions.

#### A02 — Cryptographic Failures
No sensitive data stored or transmitted. No accounts, no passwords, no PII.

#### A03 — Injection
No database, no server-side rendering of user input. All calculation is in-browser JS.
User inputs are numbers only — validated as numeric before use in calculations.

#### A04 — Insecure Design
No user data leaves the browser. Calculator is stateless by design.

#### A05 — Security Misconfiguration
Vercel handles HTTPS automatically. No custom server config.
Standard Next.js security headers via `next.config.ts` (X-Frame-Options, CSP, etc.).

#### A06 — Vulnerable and Outdated Components
`npm audit` run before each deploy. Dependencies kept minimal.

#### A07 — Identification and Authentication Failures
No auth in v1. Not applicable.

#### A08 — Software and Data Integrity Failures
No webhooks, no eval(), no dynamic code execution. Dependencies locked via package-lock.json.

#### A09 — Security Logging and Monitoring Failures
Vercel provides request logging. No user financial data is logged anywhere.

#### A10 — Server-Side Request Forgery (SSRF)
No server-side HTTP requests — all computation is client-side.

---

## Pending Decisions
- See `DECISIONS.md` for open items
