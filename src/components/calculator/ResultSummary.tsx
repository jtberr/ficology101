// Server component — no "use client" needed. Receives pre-computed result as props.

import type { CalculatorResult } from "@/lib/types";

export interface ResultSummaryProps {
  result: CalculatorResult;
  annualExpenses: number;
  safeWithdrawalRatePct: number;
  currentYear: number;
  targetRetirementAge: number;
}

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface CardProps {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}

function Card({ label, value, sub, valueColor = "text-gray-900" }: CardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="mt-1 text-sm text-gray-500">{sub}</p>
    </div>
  );
}

export default function ResultSummary({
  result,
  annualExpenses,
  safeWithdrawalRatePct,
  currentYear,
  targetRetirementAge,
}: ResultSummaryProps) {
  const lastRow = result.rows[result.rows.length - 1];

  // Card 1 — FI Number
  const fiNumberSub = `${formatDollars(annualExpenses)}/yr ÷ ${safeWithdrawalRatePct}% SWR`;

  // Card 2 — Coast FI Date
  let coastDateValue: string;
  let coastDateSub: string;
  let coastDateColor: string;
  if (result.coastFiYear !== null && result.coastFiAge !== null) {
    const yearsAway = result.coastFiYear - currentYear;
    coastDateValue = `Age ${result.coastFiAge} in ${result.coastFiYear}`;
    coastDateSub =
      yearsAway <= 0
        ? `You can already coast to retire at ${targetRetirementAge}!`
        : `${yearsAway} year${yearsAway === 1 ? "" : "s"} from now — then coast to age ${targetRetirementAge}`;
    coastDateColor = "text-indigo-600";
  } else {
    coastDateValue = "Not reached";
    coastDateSub = `Increase contributions or raise your Target Retire Age`;
    coastDateColor = "text-gray-400";
  }

  // Card 3 — FI Date
  let fiDateValue: string;
  let fiDateSub: string;
  let fiDateColor: string;
  if (result.fiYear !== null && result.fiAge !== null) {
    const yearsAway = result.fiYear - currentYear;
    fiDateValue = `Age ${result.fiAge} in ${result.fiYear}`;
    fiDateSub =
      yearsAway <= 0
        ? "You are already FI!"
        : `${yearsAway} year${yearsAway === 1 ? "" : "s"} from now`;
    fiDateColor = "text-green-600";
  } else {
    fiDateValue = "Not reached";
    fiDateSub = "Increase contributions or extend your projection";
    fiDateColor = "text-gray-400";
  }

  // Card 3 — Longevity
  let longevityValue: string;
  let longevityColor: string;
  let longevitySub: string;
  if (result.depletionAge === null) {
    const outlastAge = lastRow?.age ?? 95;
    longevityValue = `Outlasts age ${outlastAge}`;
    longevityColor = "text-green-600";
    longevitySub = "Portfolio survives the full projection";
  } else if (result.depletionAge > 90) {
    longevityValue = `Age ${result.depletionAge}`;
    longevityColor = "text-green-600";
    longevitySub = "Strong — portfolio survives past 90";
  } else if (result.depletionAge >= 80) {
    longevityValue = `Age ${result.depletionAge}`;
    longevityColor = "text-amber-500";
    longevitySub = "Consider reducing your withdrawal rate";
  } else {
    longevityValue = `Age ${result.depletionAge}`;
    longevityColor = "text-red-600";
    longevitySub = "Portfolio depletes before age 80 — review your plan";
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card
        label="FI Number"
        value={formatDollars(result.fiNumber)}
        sub={fiNumberSub}
      />
      <Card
        label="Coast FI Date"
        value={coastDateValue}
        sub={coastDateSub}
        valueColor={coastDateColor}
      />
      <Card
        label="FI Date"
        value={fiDateValue}
        sub={fiDateSub}
        valueColor={fiDateColor}
      />
      <Card
        label="Money Lasts Until"
        value={longevityValue}
        sub={longevitySub}
        valueColor={longevityColor}
      />
    </div>
  );
}
