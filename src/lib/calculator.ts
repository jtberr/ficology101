// Pure calculation functions — no React, no side effects.
// These can be tested in isolation without a browser.

import type { GlobalInputs, CellOverrides, CalculatorResult, Phase, TableRow } from "./types";

export function calculateFiNumber(annualExpenses: number, swrPct: number): number {
  return annualExpenses / (swrPct / 100);
}

export function detectPhase(contributionOrWithdrawal: number): Phase {
  if (contributionOrWithdrawal > 0) return "accumulation";
  if (contributionOrWithdrawal === 0) return "gap";
  return "retirement";
}

/**
 * Iterates year by year, computing each row's end balance from the prior row's end balance.
 * `overrides` holds user-edited cells, keyed by year — anything not overridden falls back
 * to the global defaults. Once the balance crosses `fiNumber`, subsequent rows automatically
 * default to withdrawing `annualExpenses` instead of contributing — unless the user has
 * manually overridden that cell.
 */
export function calculateRows(
  globalInputs: GlobalInputs,
  overrides: CellOverrides,
  fiNumber: number
): TableRow[] {
  const rows: TableRow[] = [];
  let startBalance = globalInputs.currentBalance;
  let coastFiReached = false;
  let retirementYearsElapsed = 0;
  const targetRetirementYear = globalInputs.birthYear + globalInputs.targetRetirementAge;

  for (let i = 0; i < globalInputs.yearsToProject; i++) {
    const year = globalInputs.currentYear + i;
    const override = overrides[year];
    const inRetirement = year >= targetRetirementYear;

    let defaultContrib: number;
    let defaultReturn: number;
    if (inRetirement) {
      const inflationFactor = Math.pow(1 + globalInputs.inflationPct / 100, retirementYearsElapsed);
      defaultContrib = -(globalInputs.annualExpenses * inflationFactor);
      defaultReturn = globalInputs.retirementReturnPct;
    } else if (globalInputs.autoCoast && coastFiReached) {
      defaultContrib = 0;
      defaultReturn = globalInputs.expectedReturnPct;
    } else {
      defaultContrib = globalInputs.annualContribution;
      defaultReturn = globalInputs.expectedReturnPct;
    }

    const contributionOrWithdrawal = override?.contributionOrWithdrawal ?? defaultContrib;
    const returnPct = override?.returnPct ?? defaultReturn;
    const endBalance = (startBalance + contributionOrWithdrawal) * (1 + returnPct / 100);

    rows.push({
      year,
      age: year - globalInputs.birthYear,
      phase: detectPhase(contributionOrWithdrawal),
      startBalance,
      contributionOrWithdrawal,
      returnPct,
      endBalance,
    });

    if (inRetirement) {
      retirementYearsElapsed++;
    }

    if (!coastFiReached) {
      const yearsToRetirement = targetRetirementYear - year;
      if (yearsToRetirement > 0) {
        const coastThreshold = fiNumber / Math.pow(1 + globalInputs.expectedReturnPct / 100, yearsToRetirement);
        if (endBalance >= coastThreshold) coastFiReached = true;
      }
    }

    startBalance = endBalance;
  }

  return rows;
}

export function calculateResult(
  globalInputs: GlobalInputs,
  overrides: CellOverrides
): CalculatorResult {
  const fiNumber =
    globalInputs.fiNumberOverride ??
    calculateFiNumber(globalInputs.annualExpenses, globalInputs.safeWithdrawalRatePct);
  const rows = calculateRows(globalInputs, overrides, fiNumber);

  const fiRow = rows.find((row) => row.endBalance >= fiNumber);
  const depletionRow = rows.find((row) => row.endBalance <= 0);

  // Coast FI: first year where balance can grow to fiNumber by targetRetirementAge
  // without any further contributions, using the accumulation return rate.
  const targetRetirementYear = globalInputs.birthYear + globalInputs.targetRetirementAge;
  const coastFiRow = rows.find((row) => {
    const yearsToRetirement = targetRetirementYear - row.year;
    if (yearsToRetirement <= 0) return false;
    const threshold = fiNumber / Math.pow(1 + globalInputs.expectedReturnPct / 100, yearsToRetirement);
    return row.endBalance >= threshold;
  });

  return {
    rows,
    fiYear: fiRow?.year ?? null,
    fiAge: fiRow?.age ?? null,
    depletionYear: depletionRow?.year ?? null,
    depletionAge: depletionRow?.age ?? null,
    fiNumber,
    coastFiYear: coastFiRow?.year ?? null,
    coastFiAge: coastFiRow?.age ?? null,
  };
}
