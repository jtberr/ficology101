"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import InputPanel from "@/components/calculator/InputPanel";
import PhaseTable from "@/components/calculator/PhaseTable";
import PortfolioChart from "@/components/calculator/PortfolioChart";
import ResultSummary from "@/components/calculator/ResultSummary";
import { calculateResult, calculateFiNumber } from "@/lib/calculator";
import type { GlobalInputs, CellOverrides } from "@/lib/types";

const DEFAULTS: GlobalInputs = {
  birthYear: 1985,
  currentYear: 2026,
  currentBalance: 250000,
  annualContribution: 25000,
  expectedReturnPct: 7,
  retirementReturnPct: 5,
  annualExpenses: 60000,
  safeWithdrawalRatePct: 4,
  inflationPct: 3,
  fiNumberOverride: null,
  targetRetirementAge: 65,
  autoCoast: false,
  ageToProjectTo: 110,
};

const STORAGE_KEY = "ficology101-calculator-v1";
const SHARE_PARAM = "d";

interface PersistedState {
  inputs: GlobalInputs;
  overrides: CellOverrides;
  fillDown: boolean;
  applyInflationFillDown: boolean;
  entryUnit: "annual" | "monthly";
}

// Everything on the Inputs, Assumptions, and Settings tabs is shareable via URL — i.e.
// PersistedState minus `overrides`, which is deliberately excluded so a heavily-edited
// table can't blow past safe URL-length limits.
type ShareableState = Omit<PersistedState, "overrides">;

function encodeShareableState(state: ShareableState): string {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

function decodeShareableState(encoded: string): ShareableState | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(encoded))) as Partial<ShareableState>;
    if (!parsed.inputs) return null;
    return {
      inputs: parsed.inputs,
      fillDown: parsed.fillDown ?? false,
      applyInflationFillDown: parsed.applyInflationFillDown ?? true,
      entryUnit: parsed.entryUnit === "monthly" ? "monthly" : "annual",
    };
  } catch {
    return null;
  }
}

export default function CalculatorClient() {
  // Initial state must be identical on the server render and the client's first render —
  // DEFAULTS/empty, never read from window/localStorage here. A lazy useState initializer
  // that reads localStorage would run differently on the server (no window) than on the
  // client's first render (window exists), causing a React hydration mismatch. The actual
  // share-link/localStorage values are swapped in afterward, in the mount effect below,
  // once hydration is already complete — accepting a one-frame flash of defaults in
  // exchange for never mismatching server-rendered HTML.
  const [inputs, setInputsState] = useState<GlobalInputs>(DEFAULTS);
  const [overrides, setOverridesState] = useState<CellOverrides>({});
  const [fillDown, setFillDownState] = useState(false);
  const [applyInflationFillDown, setApplyInflationFillDownState] = useState(true);
  // Display-only preference — doesn't affect GlobalInputs or any calculation. Contribution
  // and Expenses are always stored as annual figures; this just controls how they're
  // entered/shown in the InputPanel.
  const [entryUnit, setEntryUnitState] = useState<"annual" | "monthly">("annual");
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Suppresses auto-save until a genuine user edit happens. Without this, merely opening
  // someone else's shared link would immediately overwrite the visitor's own saved
  // localStorage profile the moment the mount effect hydrates state — see DECISIONS.md.
  const suppressAutoSaveRef = useRef(false);

  function markUserEdit() {
    suppressAutoSaveRef.current = false;
  }

  // Wrapped setters — every real user-driven change flows through these. This is how the
  // auto-save effect below distinguishes "the user changed something" from "hydration set
  // the initial state on mount."
  function setInputs(next: GlobalInputs) {
    markUserEdit();
    setInputsState(next);
  }
  function setOverrides(update: CellOverrides | ((prev: CellOverrides) => CellOverrides)) {
    markUserEdit();
    setOverridesState(update);
  }
  function setFillDown(next: boolean) {
    markUserEdit();
    setFillDownState(next);
  }
  function setApplyInflationFillDown(next: boolean) {
    markUserEdit();
    setApplyInflationFillDownState(next);
  }
  function setEntryUnit(next: "annual" | "monthly") {
    markUserEdit();
    setEntryUnitState(next);
  }

  // One-time client-only hydration after mount. A share-link URL param takes priority over
  // localStorage. This has to run in an effect (not a lazy useState initializer) specifically
  // to avoid the hydration mismatch described above — reading window/localStorage during
  // render diverges between server and client. Calling setState here is one of the
  // recognized-legitimate uses of an effect: synchronizing from an external, client-only
  // store on mount.
  /* eslint-disable react-hooks/set-state-in-effect -- see comment above: hydrating from an
     external, client-only store (URL param / localStorage) on mount is a recognized
     legitimate exception, and moving this to a lazy useState initializer would reintroduce
     a real server/client hydration mismatch instead. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get(SHARE_PARAM);
    if (shared) {
      const decoded = decodeShareableState(shared);
      if (decoded) {
        suppressAutoSaveRef.current = true;
        setInputsState(decoded.inputs);
        setFillDownState(decoded.fillDown);
        setApplyInflationFillDownState(decoded.applyInflationFillDown);
        setEntryUnitState(decoded.entryUnit);
      }
      // Clean the URL so a later refresh re-reads localStorage (including any edits made
      // since) instead of re-importing the original shared link every time.
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState;
        setInputsState(saved.inputs);
        setOverridesState(saved.overrides);
        setFillDownState(saved.fillDown);
        setApplyInflationFillDownState(saved.applyInflationFillDown);
        setEntryUnitState(saved.entryUnit === "monthly" ? "monthly" : "annual");
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — start from defaults silently
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-save on every real change. Skipped while suppressAutoSaveRef is true (i.e. right
  // after opening a shared link, before any edit).
  useEffect(() => {
    if (suppressAutoSaveRef.current) return;
    try {
      const toSave: PersistedState = { inputs, overrides, fillDown, applyInflationFillDown, entryUnit };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // localStorage unavailable (e.g. private browsing) — nothing to do
    }
  }, [inputs, overrides, fillDown, applyInflationFillDown, entryUnit]);

  function handleResetCalculator() {
    if (!confirm("Reset the calculator and clear saved data? This can't be undone.")) return;
    setInputsState(DEFAULTS);
    setOverridesState({});
    setFillDownState(false);
    setApplyInflationFillDownState(true);
    setEntryUnitState("annual");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  function handleCopyShareLink() {
    const encoded = encodeShareableState({ inputs, fillDown, applyInflationFillDown, entryUnit });
    const url = `${window.location.origin}${window.location.pathname}?${SHARE_PARAM}=${encoded}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareLinkCopied(true);
        window.setTimeout(() => setShareLinkCopied(false), 2000);
      })
      .catch(() => {
        // clipboard write can fail (e.g. permissions) — button just won't show confirmation
      });
  }

  // Derived state — recalculated only when inputs or overrides change.
  // Think of this as the equivalent of re-running a stored procedure when the parameters change.
  const result = useMemo(() => calculateResult(inputs, overrides), [inputs, overrides]);

  // The auto-calculated FI number shown in InputPanel when no override is set.
  const computedFiNumber = useMemo(
    () => calculateFiNumber(inputs.annualExpenses, inputs.safeWithdrawalRatePct),
    [inputs.annualExpenses, inputs.safeWithdrawalRatePct]
  );

  // Whether anything differs from a fresh install — drives whether "Reset Calculator" shows
  // at all. GlobalInputs is flat (all primitives, no nesting), so a JSON comparison is a
  // reliable, simple stand-in for a deep-equal check here.
  const hasAnyChanges =
    JSON.stringify(inputs) !== JSON.stringify(DEFAULTS) ||
    Object.keys(overrides).length > 0 ||
    fillDown !== false ||
    applyInflationFillDown !== true ||
    entryUnit !== "annual";

  function handleCellChange(
    year: number,
    field: "contributionOrWithdrawal" | "returnPct",
    value: number
  ) {
    setOverrides((prev) => {
      if (fillDown) {
        const currentPhase = result.rows.find((r) => r.year === year)?.phase;
        const growWithInflation =
          applyInflationFillDown &&
          field === "contributionOrWithdrawal" &&
          currentPhase === "retirement" &&
          value < 0;
        const next: CellOverrides = { ...prev };
        for (const row of result.rows) {
          if (row.year >= year && row.phase === currentPhase) {
            const cascadedValue = growWithInflation
              ? Math.round(value * Math.pow(1 + inputs.inflationPct / 100, row.year - year) * 100) / 100
              : value;
            next[row.year] = { ...prev[row.year], [field]: cascadedValue };
          }
        }
        return next;
      }
      return { ...prev, [year]: { ...prev[year], [field]: value } };
    });
  }

  function handleCellReset(
    year: number,
    field: "contributionOrWithdrawal" | "returnPct"
  ) {
    setOverrides((prev) => {
      const yearOverrides = { ...prev[year] };
      delete yearOverrides[field];
      if (Object.keys(yearOverrides).length === 0) {
        const next = { ...prev };
        delete next[year];
        return next;
      }
      return { ...prev, [year]: yearOverrides };
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: "#185236" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">FIcology 101</h1>
            <p className="text-lg text-white/70"><span className="text-white">FIRE Calculator</span> - Know your number. Know your date.</p>
          </div>
          <nav className="flex items-center gap-6">
            <a href="https://ficology101.com/" className="text-base text-white hover:underline" target="_blank" rel="noopener noreferrer">Home</a>
            <a href="https://ficology101.com/blog/" className="text-base text-white hover:underline" target="_blank" rel="noopener noreferrer">Blog</a>
            <a href="https://tools.ficology101.com/calculator" className="text-base text-white hover:underline">Calculator</a>
            <a href="https://ficology101.com/about/" className="text-base text-white hover:underline" target="_blank" rel="noopener noreferrer">About</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">

        {/* Collapsible instructions */}
        <details className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <summary className="cursor-pointer font-semibold">How to use this calculator</summary>

          <p className="mt-3 mb-1 font-semibold text-blue-900">Getting started</p>
          <ul className="space-y-1 pl-4 text-blue-800 marker:text-blue-400 list-disc">
            <li>Fill in the <strong>Inputs</strong> tab on the left — the chart, table, and summary cards update instantly. Use the <strong>Assumptions</strong> tab for return rates and the <strong>Settings</strong> tab for projection length and table options.</li>
            <li><strong>Annual / Monthly</strong> toggle (bottom of the Inputs tab) lets you type Contribution and Expenses as yearly or monthly amounts, whichever is easier — calculations and table rows are always annual-based.</li>
            <li>The table auto-switches to retirement withdrawals at your <strong>Target Retire Age</strong>. Your <strong>FI Number</strong> is shown as a milestone — it auto-calculates from Annual Expenses ÷ Safe Withdrawal Rate, or type a value to override it and click <strong>↺ Reset to auto-calculate</strong> to go back.</li>
            <li>In the table, the <strong>Contribution / Withdrawal</strong> and <strong>Return %</strong> columns are editable (pencil icon in header). Click any cell to override it for a specific year. An <span className="font-medium text-amber-700">amber highlight</span> and <strong>↺</strong> icon appear when a cell has a manual override — click <strong>↺</strong> to restore just that cell to its calculated default.</li>
            <li><strong>Phase Fill Down</strong> (Settings tab) cascades a cell edit to all rows below it within the same phase. Stops at Accumulation → Coasting → Retirement boundaries so edits don&apos;t accidentally overwrite other phases.</li>
            <li><strong>Auto-Coast</strong> (Settings tab) automatically switches to $0 contributions once you hit Coast FI, letting compound growth carry you the rest of the way to retirement.</li>
            <li><strong>Clear Manual Table Edits</strong> (link below the input panel) removes all cell overrides at once and restores the calculated defaults. <strong>Reset Calculator</strong>, next to it (shown only once anything&apos;s been changed), goes further — it also resets every input, assumption, and setting back to default and clears your saved data on this device.</li>
            <li>Your inputs, table edits, and settings are automatically saved on this device and restored next time you visit — nothing is sent anywhere, it stays in your browser. The <strong>🔗 link icon</strong> (top-right of the input panel, next to the tabs) copies a share link that restores your Inputs, Assumptions, and Settings for you or someone else on any device — table edits aren&apos;t included in the link.</li>
            <li>Phase colors: <span className="font-medium text-blue-700">blue = accumulation</span>, <span className="font-medium text-amber-600">yellow = coasting</span> (no contributions, not yet withdrawing), <span className="font-medium text-emerald-700">green = retirement</span>.</li>
          </ul>

          <p className="mt-3 mb-1 font-semibold text-blue-900">Scenarios &amp; tips</p>
          <ul className="space-y-1 pl-4 text-blue-800 marker:text-blue-400 list-disc">
            <li><strong>Simulate a market crash:</strong> click a Return % cell and enter a negative number (e.g., -20%). Repeat for each crash year. Click <strong>↺</strong> on each cell when done to restore it.</li>
            <li><strong>Sabbatical or career break:</strong> override the Contribution cell to $0 for the years you won&apos;t be saving.</li>
            <li><strong>Big one-time expense:</strong> enter a large negative number in a Contribution cell (e.g., -$50,000 for a home down payment) — it pulls that amount from the portfolio that year.</li>
            <li><strong>Part-time income in retirement:</strong> override a retirement year&apos;s withdrawal cell to a smaller negative number, or even a positive number if your part-time income covers expenses.</li>
            <li><strong>Lean FIRE vs. Fat FIRE:</strong> type a custom value in the FI Number field to compare different savings targets.</li>
            <li><strong>Variable spending in retirement:</strong> override individual retirement withdrawal cells to model spending less during a market downturn.</li>
            <li><strong>See the coast FI effect:</strong> check Auto-Coast and watch your FI Date — sometimes stopping contributions early moves your FI date by only a year or two; sometimes much more.</li>
          </ul>
        </details>

        {/* Summary cards — full width, always visible */}
        <ResultSummary
          result={result}
          annualExpenses={inputs.annualExpenses}
          safeWithdrawalRatePct={inputs.safeWithdrawalRatePct}
          currentYear={inputs.currentYear}
          targetRetirementAge={inputs.targetRetirementAge}
        />

        {/* Two-column: inputs left, chart right */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "380px 1fr" }}>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <InputPanel
              values={inputs}
              onChange={setInputs}
              computedFiNumber={computedFiNumber}
              fillDown={fillDown}
              onFillDownChange={setFillDown}
              applyInflationFillDown={applyInflationFillDown}
              onApplyInflationFillDownChange={setApplyInflationFillDown}
              entryUnit={entryUnit}
              onEntryUnitChange={setEntryUnit}
              onReset={() => setOverrides({})}
              hasOverrides={Object.keys(overrides).length > 0}
              onResetCalculator={handleResetCalculator}
              hasAnyChanges={hasAnyChanges}
              onCopyShareLink={handleCopyShareLink}
              shareLinkCopied={shareLinkCopied}
            />
          </div>
          <PortfolioChart
            rows={result.rows}
            fiNumber={result.fiNumber}
            coastFiYear={result.coastFiHighlightYear}
            retirementYear={inputs.birthYear + inputs.targetRetirementAge}
            depletionYear={result.depletionYear}
          />
        </div>

        {/* Year-by-year table — full width */}
        <PhaseTable
          rows={result.rows}
          overrides={overrides}
          onCellChange={handleCellChange}
          onCellReset={handleCellReset}
          fiYear={result.fiHighlightYear}
          coastFiYear={result.coastFiHighlightYear}
          autoCoast={inputs.autoCoast}
        />

      </div>

      {/* Footer */}
      <footer className="mt-6 border-t border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="mx-auto max-w-xl rounded-md bg-gray-100 px-5 py-4 text-center text-sm text-gray-600">
            <span className="font-semibold">Disclaimer:</span> I am not a financial advisor. This site is for entertainment and inspiration only. Please do your own research (DYOR) and consult a pro before doing anything crazy with your money.
          </div>
          <p className="text-center text-xs text-gray-400">© FIcology 101. All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
