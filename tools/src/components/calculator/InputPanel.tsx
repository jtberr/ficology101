"use client";

import { useState } from "react";
import type { GlobalInputs } from "@/lib/types";
import NumberField from "@/components/ui/NumberField";
import InfoTooltip from "@/components/ui/InfoTooltip";

interface InputPanelProps {
  values: GlobalInputs;
  onChange: (values: GlobalInputs) => void;
  computedFiNumber: number;
  fillDown: boolean;
  onFillDownChange: (fillDown: boolean) => void;
  applyInflationFillDown: boolean;
  onApplyInflationFillDownChange: (applyInflationFillDown: boolean) => void;
  onReset: () => void;
  hasOverrides: boolean;
}

type Tab = "inputs" | "assumptions" | "settings";

export default function InputPanel({
  values,
  onChange,
  computedFiNumber,
  fillDown,
  onFillDownChange,
  applyInflationFillDown,
  onApplyInflationFillDownChange,
  onReset,
  hasOverrides,
}: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("inputs");

  function setField<K extends keyof GlobalInputs>(field: K, value: GlobalInputs[K]) {
    onChange({ ...values, [field]: value });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "inputs", label: "Inputs" },
    { id: "assumptions", label: "Assumptions" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="flex flex-col">
      {/* Tab strip — negative margins bleed to card edges, bg-gray-50 creates visual header */}
      <div className="-mx-5 -mt-5 mb-4 flex rounded-t-lg border-b border-gray-200 bg-gray-50 px-5 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — fixed height matches Inputs tab so panel never jumps between tabs */}
      <div className="h-[340px]">

        {activeTab === "inputs" && (
          <div className="space-y-3">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">You</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Birth Year"
                  value={values.birthYear}
                  onChange={(v) => setField("birthYear", v)}
                  help="Your birth year. Used to calculate your age for each row in the projection."
                />
                <NumberField
                  label="Current Year"
                  value={values.currentYear}
                  onChange={(v) => setField("currentYear", v)}
                  help="The year the projection starts. Usually the current calendar year."
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">Portfolio Today</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Current Balance"
                  value={values.currentBalance}
                  onChange={(v) => setField("currentBalance", v)}
                  step={1000}
                  prefix="$"
                  help="Your total invested portfolio today — 401(k), IRA, brokerage accounts, etc. This is the starting balance for the projection."
                />
                <NumberField
                  label="Annual Contribution"
                  value={values.annualContribution}
                  onChange={(v) => setField("annualContribution", v)}
                  step={500}
                  prefix="$"
                  help="How much you add to your portfolio each year while working. Set to 0 for a coasting period where you stop saving but aren't yet withdrawing."
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">Retirement</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Annual Expenses"
                  value={values.annualExpenses}
                  onChange={(v) => setField("annualExpenses", v)}
                  step={500}
                  prefix="$"
                  help="Your expected yearly spending in retirement in today's dollars. This is used to calculate your FI number and sets your initial withdrawal amount (which then grows with inflation)."
                />
                <NumberField
                  label="Target Retire Age"
                  value={values.targetRetirementAge}
                  onChange={(v) => setField("targetRetirementAge", v)}
                  min={1}
                  help="The age you plan to retire. The table switches to withdrawals at this age regardless of when you hit your FI number. Also used to calculate your Coast FI number."
                />
                <div className="col-span-2">
                  <NumberField
                    label="FI Number"
                    value={values.fiNumberOverride ?? computedFiNumber}
                    onChange={(v) => setField("fiNumberOverride", v)}
                    step={10000}
                    prefix="$"
                    help="The portfolio size you need to retire — auto-calculated as Annual Expenses ÷ Safe Withdrawal Rate. Override this if you have a specific savings target in mind."
                  />
                  {values.fiNumberOverride !== null && (
                    <button
                      type="button"
                      onClick={() => setField("fiNumberOverride", null)}
                      className="mt-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      ↺ Reset to auto-calculate
                    </button>
                  )}
                </div>
              </div>
            </fieldset>
          </div>
        )}

        {activeTab === "assumptions" && (
          <div className="space-y-3">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">Assumptions</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Accum. Return %"
                  value={values.expectedReturnPct}
                  onChange={(v) => setField("expectedReturnPct", v)}
                  step={0.5}
                  suffix="%"
                  help="Expected average annual return during your accumulation (saving) years. A diversified U.S. stock portfolio has historically averaged about 7% after inflation."
                />
                <NumberField
                  label="Retire. Return %"
                  value={values.retirementReturnPct}
                  onChange={(v) => setField("retirementReturnPct", v)}
                  step={0.5}
                  suffix="%"
                  help="Expected annual return once you're in retirement. Often lower than accumulation (e.g. 5%) to reflect a more conservative portfolio and sequence-of-returns risk."
                />
                <NumberField
                  label="Safe Withdrawal Rate"
                  value={values.safeWithdrawalRatePct}
                  onChange={(v) => setField("safeWithdrawalRatePct", v)}
                  step={0.1}
                  suffix="%"
                  help="The percentage of your portfolio you withdraw each year in retirement. The classic '4% rule' suggests this rate is sustainable for a 30-year retirement in most historical market scenarios."
                />
                <NumberField
                  label="Inflation Rate"
                  value={values.inflationPct}
                  onChange={(v) => setField("inflationPct", v)}
                  step={0.5}
                  suffix="%"
                  help="How much your retirement expenses grow each year due to inflation. Your withdrawals are increased by this rate annually. The U.S. long-term average is roughly 3%."
                />
              </div>
            </fieldset>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-3">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">Table Settings</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Years to Project"
                  value={values.yearsToProject}
                  onChange={(v) => setField("yearsToProject", v)}
                  min={1}
                  help="How many years to show in the projection table and chart. 60 years covers most retirement scenarios."
                />
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={fillDown}
                    onChange={(e) => onFillDownChange(e.target.checked)}
                  />
                  <span className="flex items-center gap-1">
                    Phase Fill Down
                    <InfoTooltip text="When checked, editing a cell applies that value to all rows below it within the same phase (Accumulation, Coasting, or Retirement). Stops at phase boundaries so edits don't accidentally overwrite other phases." />
                  </span>
                </label>
                <label className={`flex items-center gap-2 pl-6 text-sm ${fillDown ? "text-gray-700" : "text-gray-400"}`}>
                  <input
                    type="checkbox"
                    checked={applyInflationFillDown}
                    disabled={!fillDown}
                    onChange={(e) => onApplyInflationFillDownChange(e.target.checked)}
                  />
                  <span className="flex items-center gap-1">
                    Apply Inflation Rate to Withdrawals
                    <InfoTooltip text="When filling down a Retirement-phase withdrawal, each subsequent year's amount grows by your Inflation Rate instead of repeating the same dollar value — matching how withdrawals normally increase automatically. Only affects withdrawals (negative values); contributions fill down flat." />
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={values.autoCoast}
                    onChange={(e) => setField("autoCoast", e.target.checked)}
                  />
                  <span className="flex items-center gap-1">
                    Auto-Coast
                    <InfoTooltip text="When checked, the table automatically switches to $0 contributions once you reach Coast FI — letting compound growth carry you the rest of the way to your target retirement age." />
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        )}

      </div>

      <div className="mt-3 flex h-6 items-center justify-end">
        {hasOverrides && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-red-500 hover:underline"
          >
            Clear Manual Table Edits
          </button>
        )}
      </div>
    </div>
  );
}
