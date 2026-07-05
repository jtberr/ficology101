"use client";

import { useState, useRef, useEffect } from "react";
import type { TableRow, CellOverrides } from "@/lib/types";

type EditableField = "contributionOrWithdrawal" | "returnPct";
interface EditCell {
  year: number;
  field: EditableField;
}

export interface PhaseTableProps {
  rows: TableRow[];
  overrides: CellOverrides;
  onCellChange: (year: number, field: EditableField, value: number) => void;
  onCellReset: (year: number, field: EditableField) => void;
  fiYear: number | null;
  depletionYear: number | null;
  coastFiYear: number | null;
}

const EDITABLE_FIELDS: EditableField[] = ["contributionOrWithdrawal", "returnPct"];

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function PencilIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-70"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function PhaseBadge({ row }: { row: TableRow }) {
  if (row.phase === "accumulation")
    return (
      <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Accumulation
      </span>
    );
  if (row.phase === "gap")
    return (
      <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Coasting
      </span>
    );
  return (
    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Retirement
    </span>
  );
}

function rowClassName(
  row: TableRow,
  fiYear: number | null,
  depletionYear: number | null,
  coastFiYear: number | null,
): string {
  if (row.year === depletionYear) return "bg-red-50";
  if (row.year === fiYear) return "bg-green-100";
  if (row.year === coastFiYear) return "bg-purple-100";
  return "hover:bg-gray-50";
}

function getNextCell(rows: TableRow[], current: EditCell): EditCell | null {
  const fieldIdx = EDITABLE_FIELDS.indexOf(current.field);
  const rowIdx = rows.findIndex((r) => r.year === current.year);
  if (fieldIdx < EDITABLE_FIELDS.length - 1) {
    return { year: current.year, field: EDITABLE_FIELDS[fieldIdx + 1] };
  }
  if (rowIdx < rows.length - 1) {
    return { year: rows[rowIdx + 1].year, field: EDITABLE_FIELDS[0] };
  }
  return null;
}

export default function PhaseTable({
  rows,
  overrides,
  onCellChange,
  onCellReset,
  fiYear,
  depletionYear,
  coastFiYear,
}: PhaseTableProps) {
  const [activeEdit, setActiveEdit] = useState<EditCell | null>(null);
  const [editValue, setEditValue] = useState("");

  // Ref mirrors activeEdit state so blur handlers can read it synchronously,
  // avoiding a race where blur fires after Tab has already moved focus to the next cell.
  const activeEditRef = useRef<EditCell | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function setEdit(cell: EditCell | null, value = "") {
    activeEditRef.current = cell;
    setActiveEdit(cell);
    setEditValue(value);
  }

  useEffect(() => {
    if (activeEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [activeEdit]);

  function commit(nextCell: EditCell | null) {
    const current = activeEditRef.current;
    if (!current) return;
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      const currentRow = rows.find((r) => r.year === current.year);
      if (currentRow && parsed !== currentRow[current.field]) {
        onCellChange(current.year, current.field, parsed);
      }
    }
    if (nextCell) {
      const nextRow = rows.find((r) => r.year === nextCell.year);
      setEdit(nextCell, nextRow ? String(nextRow[nextCell.field]) : "");
    } else {
      setEdit(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const next = activeEditRef.current ? getNextCell(rows, activeEditRef.current) : null;
      commit(next);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEdit(null);
    }
  }

  // Guard against double-commit: Tab already called commit(), which updates activeEditRef
  // to the next cell. If blur fires afterward, the year/field check is no longer true.
  function handleBlur(year: number, field: EditableField) {
    if (activeEditRef.current?.year === year && activeEditRef.current?.field === field) {
      commit(null);
    }
  }

  function renderEditableCell(
    row: TableRow,
    field: EditableField,
    displayValue: string,
    extraClass = ""
  ) {
    const isEditing = activeEdit?.year === row.year && activeEdit?.field === field;
    const isOverridden = overrides[row.year]?.[field] !== undefined;

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="number"
          step={field === "returnPct" ? "0.1" : "500"}
          className="w-full rounded border border-blue-400 bg-white px-1 text-right text-sm outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => handleBlur(row.year, field)}
        />
      );
    }
    return (
      <span className="flex items-center justify-end gap-1">
        {isOverridden && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCellReset(row.year, field); }}
            className="text-[11px] leading-none text-gray-400 hover:text-blue-500"
            title="Reset to default"
          >
            ↺
          </button>
        )}
        <span
          className={`cursor-pointer rounded px-1 text-right hover:bg-blue-50 ${extraClass}`}
          onClick={() => setEdit({ year: row.year, field }, String(row[field]))}
          title="Click to edit"
        >
          {displayValue}
        </span>
      </span>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm" style={{ maxHeight: "540px" }}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-3 py-2 text-left">Year</th>
            <th className="px-3 py-2 text-left">Age</th>
            <th className="px-3 py-2 text-left">Phase</th>
            <th className="px-3 py-2 text-right">Start Balance</th>
            <th className="px-3 py-2 text-right">
              <span className="inline-flex items-center justify-end gap-1">
                Contribution / Withdrawal
                <PencilIcon />
              </span>
            </th>
            <th className="px-3 py-2 text-right">
              <span className="inline-flex items-center justify-end gap-1">
                Return %
                <PencilIcon />
              </span>
            </th>
            <th className="px-3 py-2 text-right">End Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.year} className={rowClassName(row, fiYear, depletionYear, coastFiYear)}>
              <td className="px-3 py-1.5">
                <div className="tabular-nums">{row.year}</div>
                {row.year === fiYear && (
                  <div className="text-[10px] font-bold uppercase tracking-wide text-green-700">FI</div>
                )}
                {row.year === coastFiYear && (
                  <div className="text-[10px] font-bold uppercase tracking-wide text-purple-700">Coast FI</div>
                )}
                {row.year === depletionYear && (
                  <div className="text-[10px] font-bold uppercase tracking-wide text-red-600">Depleted</div>
                )}
              </td>
              <td className="px-3 py-1.5 tabular-nums">{row.age}</td>
              <td className="px-3 py-1.5">
                <PhaseBadge row={row} />
              </td>
              <td className="px-3 py-1.5 tabular-nums text-right">
                {formatDollars(row.startBalance)}
              </td>
              <td className="px-3 py-1.5 tabular-nums">
                {renderEditableCell(
                  row,
                  "contributionOrWithdrawal",
                  formatDollars(row.contributionOrWithdrawal),
                  [
                    row.contributionOrWithdrawal < 0 ? "text-red-600" : "",
                    overrides[row.year]?.contributionOrWithdrawal !== undefined ? "bg-amber-200 rounded" : "",
                  ].filter(Boolean).join(" ")
                )}
              </td>
              <td className="px-3 py-1.5 tabular-nums">
                {renderEditableCell(
                  row,
                  "returnPct",
                  formatPct(row.returnPct),
                  overrides[row.year]?.returnPct !== undefined ? "bg-amber-200 rounded" : ""
                )}
              </td>
              <td className="px-3 py-1.5 tabular-nums text-right">
                <span className={row.endBalance < 0 ? "font-semibold text-red-600" : ""}>
                  {formatDollars(row.endBalance)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
