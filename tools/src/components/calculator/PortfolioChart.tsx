"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import type { TableRow, Phase } from "@/lib/types";

export interface PortfolioChartProps {
  rows: TableRow[];
  fiNumber: number;
  coastFiYear: number | null;
  retirementYear: number;
  depletionYear: number | null;
}

const PHASE_FILL: Record<Phase, string> = {
  accumulation: "#BFDBFE", // blue-200
  gap: "#FDE68A",          // amber-200
  retirement: "#A7F3D0",   // emerald-200
};

const BALANCE_LINE_ID = "balanceLineColor";
const POSITIVE_BALANCE_COLOR = "#3B82F6"; // blue-500
const NEGATIVE_BALANCE_COLOR = "#EF4444"; // red-500

interface GradientStop {
  offset: string;
  color: string;
}

/** Builds gradient stops so the balance line renders red anywhere endBalance is negative.
 *  Rows are plotted on a category (evenly-spaced) x-axis, so a row's fractional position is
 *  just its index divided by (rows.length - 1). Each zero-crossing between two rows is
 *  linearly interpolated to find the exact fractional position, and gets two stops at
 *  (almost) the same offset — one in the outgoing color, one in the incoming color — which
 *  is the standard SVG trick for a hard color cutover rather than a gradual blend. Handles
 *  any number of crossings, not just one. */
function getBalanceLineGradientStops(rows: TableRow[]): GradientStop[] {
  if (rows.length === 0) return [];
  const lastIndex = rows.length - 1;
  let currentColor = rows[0].endBalance < 0 ? NEGATIVE_BALANCE_COLOR : POSITIVE_BALANCE_COLOR;
  const stops: GradientStop[] = [{ offset: "0%", color: currentColor }];

  for (let i = 0; i < lastIndex; i++) {
    const a = rows[i].endBalance;
    const b = rows[i + 1].endBalance;
    const aNeg = a < 0;
    const bNeg = b < 0;
    if (aNeg !== bNeg) {
      const t = a / (a - b); // safe: a - b !== 0 since the signs differ
      const fraction = lastIndex === 0 ? 0 : (i + t) / lastIndex;
      const offset = `${(fraction * 100).toFixed(4)}%`;
      const newColor = bNeg ? NEGATIVE_BALANCE_COLOR : POSITIVE_BALANCE_COLOR;
      stops.push({ offset, color: currentColor });
      stops.push({ offset, color: newColor });
      currentColor = newColor;
    }
  }

  stops.push({ offset: "100%", color: currentColor });
  return stops;
}

function BalanceActiveDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: TableRow }) {
  if (cx === undefined || cy === undefined) return null;
  const color = payload && payload.endBalance < 0 ? NEGATIVE_BALANCE_COLOR : POSITIVE_BALANCE_COLOR;
  return <circle cx={cx} cy={cy} r={4} fill={color} />;
}

function formatYAxis(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
}

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Groups consecutive same-phase rows into spans for ReferenceArea shading.
 *  At each transition, the ending span's x2 is extended to the first year of
 *  the next span so the bands share a boundary with no gap between them. */
function getPhaseSpans(rows: TableRow[]): { phase: Phase; x1: number; x2: number }[] {
  if (rows.length === 0) return [];
  const spans: { phase: Phase; x1: number; x2: number }[] = [];
  let current = { phase: rows[0].phase, x1: rows[0].year, x2: rows[0].year };
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].phase === current.phase) {
      current.x2 = rows[i].year;
    } else {
      current.x2 = rows[i].year; // extend to share boundary with next span
      spans.push({ ...current });
      current = { phase: rows[i].phase, x1: rows[i].year, x2: rows[i].year };
    }
  }
  spans.push({ ...current });
  return spans;
}

// Defined outside the chart component so it has a stable reference.
// Recharts clones this element for each tick and injects x, y, payload as props.
// We pass `rows` through on the initial element; Recharts preserves extra props on clone.
interface XAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: number };
  rows: TableRow[];
}
function XAxisYearAgeTick({ x = 0, y = 0, payload, rows }: XAxisTickProps) {
  const row = payload ? rows.find((r) => r.year === payload.value) : undefined;
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#6B7280" fontSize={11} y={12}>
        {payload?.value}
      </text>
      {row && (
        <text textAnchor="middle" fill="#9CA3AF" fontSize={10} y={26}>
          Age {row.age}
        </text>
      )}
    </g>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: TableRow }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const phaseLabel =
    row.phase === "accumulation" ? "Accumulation"
    : row.phase === "gap" ? "Coasting"
    : "Retirement";
  return (
    <div className="rounded border border-gray-200 bg-white p-3 text-sm shadow-md">
      <p className="font-semibold text-gray-800">
        {row.year} · Age {row.age}
      </p>
      <p className="text-xs text-gray-500">{phaseLabel}</p>
      <p className="mt-1 font-medium text-blue-700">
        Balance: {formatDollars(row.endBalance)}
      </p>
      <p className="text-gray-600">
        {row.contributionOrWithdrawal >= 0 ? "Contribution" : "Withdrawal"}:{" "}
        {formatDollars(Math.abs(row.contributionOrWithdrawal))}
      </p>
    </div>
  );
}

export default function PortfolioChart({ rows, fiNumber, coastFiYear, retirementYear, depletionYear }: PortfolioChartProps) {
  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400">
        No data yet — enter your inputs to see the chart.
      </div>
    );
  }

  const phaseSpans = getPhaseSpans(rows);
  const balanceLineGradientStops = getBalanceLineGradientStops(rows);

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Portfolio Projection</h2>
      <div className="flex-1 pb-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <defs>
            <linearGradient id={BALANCE_LINE_ID} x1="0" y1="0" x2="1" y2="0">
              {balanceLineGradientStops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />

          {/* Phase shading behind everything else */}
          {phaseSpans.map((span, i) => (
            <ReferenceArea
              key={i}
              x1={span.x1}
              x2={span.x2}
              fill={PHASE_FILL[span.phase]}
              fillOpacity={0.35}
              strokeOpacity={0}
            />
          ))}

          <XAxis
            dataKey="year"
            height={46}
            tick={<XAxisYearAgeTick rows={rows} />}
          />

          <YAxis
            tickFormatter={formatYAxis}
            tickCount={10}
            width={72}
            tick={{ fill: "#6B7280", fontSize: 11 }}
          />

          <Tooltip content={<ChartTooltip />} />

          {/* $0 baseline — only rendered when portfolio depletes */}
          {depletionYear !== null && (
            <ReferenceLine
              y={0}
              stroke="#9CA3AF"
              strokeWidth={1}
            />
          )}

          {/* Coast FI vertical reference line */}
          {coastFiYear !== null && (
            <ReferenceLine
              x={coastFiYear}
              stroke="#9333EA"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
          )}

          {/* Retirement year vertical reference line */}
          <ReferenceLine
            x={retirementYear}
            stroke="#059669"
            strokeDasharray="4 3"
            strokeWidth={1.5}
          />

          {/* FI Number reference line */}
          <ReferenceLine
            y={fiNumber}
            stroke="#0891B2"
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: `FI: ${formatYAxis(fiNumber)}`,
              position: "insideTopLeft",
              fill: "#0891B2",
              fontSize: 11,
              fontWeight: 600,
            }}
          />

          <Line
            type="monotone"
            dataKey="endBalance"
            stroke={`url(#${BALANCE_LINE_ID})`}
            strokeWidth={2}
            dot={false}
            activeDot={<BalanceActiveDot />}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
      <div className="flex flex-col items-center gap-2 pb-3 pt-1 text-xs text-gray-500">
        <div className="flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-200" />
            Accumulation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-200" />
            Coasting
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200" />
            Retirement
          </span>
        </div>
        <div className="flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <svg width="18" height="10" className="shrink-0">
              <line x1="0" y1="5" x2="18" y2="5" stroke="#0891B2" strokeWidth="2" strokeDasharray="5 3" />
            </svg>
            FI Number
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="18" height="10" className="shrink-0">
              <line x1="0" y1="5" x2="18" y2="5" stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            Retirement
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="18" height="10" className="shrink-0">
              <line x1="0" y1="5" x2="18" y2="5" stroke="#9333EA" strokeWidth="2" strokeDasharray="3 2" />
            </svg>
            Coast FI
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="26" height="10" className="shrink-0">
              <line x1="0" y1="5" x2="13" y2="5" stroke={POSITIVE_BALANCE_COLOR} strokeWidth="2" />
              <line x1="13" y1="5" x2="26" y2="5" stroke={NEGATIVE_BALANCE_COLOR} strokeWidth="2" />
            </svg>
            Balance (+ / -)
          </span>
        </div>
      </div>
    </div>
  );
}
