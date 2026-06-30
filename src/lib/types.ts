// Shared TypeScript interfaces — the C# class/record equivalent for this project.
// No React imports here: this file is used by both components and the pure calculation functions.

export type Phase = "accumulation" | "gap" | "retirement";

/** The one-time inputs the user sets in the Global Inputs Panel. */
export interface GlobalInputs {
  birthYear: number;
  currentYear: number;
  currentBalance: number;
  annualContribution: number;
  expectedReturnPct: number;
  retirementReturnPct: number;
  annualExpenses: number;
  safeWithdrawalRatePct: number;
  inflationPct: number;
  /** If null, the FI number is derived as annualExpenses / (safeWithdrawalRatePct / 100). */
  fiNumberOverride: number | null;
  /** Age at which the user wants to be fully retired. Drives the Coast FI calculation. */
  targetRetirementAge: number;
  /** When true, rows after Coast FI automatically default to $0 contribution. */
  autoCoast: boolean;
  /** Number of rows to project; default 60. */
  yearsToProject: number;
}

/** One row in the year-by-year table. The table is the source of truth for the projection. */
export interface TableRow {
  year: number;
  /** Derived from GlobalInputs.birthYear — read-only in the UI. */
  age: number;
  /** Auto-detected from contributionOrWithdrawal — read-only in the UI. */
  phase: Phase;
  /** Calculated from the prior row's endBalance — read-only in the UI. */
  startBalance: number;
  /** Editable. Positive = contribution, negative = withdrawal, zero = gap year. */
  contributionOrWithdrawal: number;
  /** Editable. Defaults to GlobalInputs.expectedReturnPct, overridable per row. */
  returnPct: number;
  /** Calculated: (startBalance + contributionOrWithdrawal) * (1 + returnPct / 100). */
  endBalance: number;
}

/** Per-year edits the user has made to an otherwise-calculated row. Keyed by year. */
export type CellOverrides = Record<number, Partial<TableRow>>;

/** Output of the main calculation pipeline — everything the UI needs to render. */
export interface CalculatorResult {
  rows: TableRow[];
  /** First year the balance reaches the FI number; null if it never does within the projection. */
  fiYear: number | null;
  /** Age at fiYear; null if fiYear is null. */
  fiAge: number | null;
  /** First year the balance hits $0; null if it never does within the projection. */
  depletionYear: number | null;
  /** Age at depletionYear; null if depletionYear is null. */
  depletionAge: number | null;
  /** annualExpenses / (safeWithdrawalRatePct / 100), or fiNumberOverride if set. */
  fiNumber: number;
  /** First year the balance is large enough to coast to fiNumber by targetRetirementAge. */
  coastFiYear: number | null;
  /** Age at coastFiYear; null if coastFiYear is null. */
  coastFiAge: number | null;
}
