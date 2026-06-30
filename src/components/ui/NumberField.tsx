"use client";

import { useState } from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
  help?: string;
}

export default function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  prefix,
  suffix,
  help,
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const isMonetary = prefix === "$";

  const displayValue =
    draft !== null
      ? draft
      : isMonetary
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
      : String(value);

  function parse(raw: string): number {
    const n = parseFloat(raw.replace(/[^0-9.-]/g, ""));
    return isNaN(n) ? value : min !== undefined ? Math.max(min, n) : n;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDraft(raw);
    const parsed = parseFloat(raw.replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsed)) onChange(min !== undefined ? Math.max(min, parsed) : parsed);
  }

  function handleBlur() {
    onChange(parse(draft ?? String(value)));
    setDraft(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const cur = parse(draft ?? String(value));
      const next = cur + (e.key === "ArrowUp" ? step : -step);
      const clamped = min !== undefined ? Math.max(min, next) : next;
      const str = String(Math.round(clamped * 10000) / 10000);
      setDraft(str);
      onChange(clamped);
    }
  }

  return (
    <label className="flex flex-col gap-0.5 text-sm">
      <span className="flex items-center gap-1 font-medium text-gray-700">
        {label}
        {help && (
          <span className="group relative inline-flex">
            <span className="inline-flex h-3.5 w-3.5 cursor-help select-none items-center justify-center rounded-full border border-gray-400 text-[9px] font-bold leading-none text-gray-400 hover:border-gray-600 hover:text-gray-600">i</span>
            <span className="invisible absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded bg-gray-800 px-2.5 py-2 text-xs font-normal leading-snug text-white shadow-lg group-hover:visible">
              {help}
            </span>
          </span>
        )}
      </span>
      <div className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 focus-within:border-blue-500">
        {prefix && <span className="text-gray-400">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="w-full text-right outline-none"
          value={displayValue}
          onFocus={() => setDraft(String(value))}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {suffix && <span className="text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
}
