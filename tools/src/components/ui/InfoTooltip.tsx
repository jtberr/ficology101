"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  text: string;
  iconClassName?: string;
}

const TOOLTIP_WIDTH = 224; // matches w-56
const VIEWPORT_MARGIN = 8;
const GAP = 6;

export default function InfoTooltip({
  text,
  iconClassName = "border-gray-400 text-gray-400 hover:border-gray-600 hover:text-gray-600",
}: InfoTooltipProps) {
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties | null>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  // Positioned via the icon's actual screen coordinates and rendered through a portal
  // straight into <body>, so no scrollable ancestor (e.g. the table) can clip it —
  // a CSS-only group-hover panel gets cut off whenever the icon sits near an edge.
  function show() {
    const rect = iconRef.current?.getBoundingClientRect();
    if (!rect) return;
    const openBelow = rect.top < 100;
    const idealLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    const left = Math.min(
      Math.max(idealLeft, VIEWPORT_MARGIN),
      window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN
    );
    setPanelStyle({
      position: "fixed",
      left,
      width: TOOLTIP_WIDTH,
      ...(openBelow ? { top: rect.bottom + GAP } : { bottom: window.innerHeight - rect.top + GAP }),
    });
  }

  function hide() {
    setPanelStyle(null);
  }

  return (
    <span
      ref={iconRef}
      className={`inline-flex h-3.5 w-3.5 cursor-help select-none items-center justify-center rounded-full border text-[9px] font-bold leading-none ${iconClassName}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
    >
      i
      {panelStyle &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            style={panelStyle}
            className="z-50 rounded bg-gray-800 px-2.5 py-2 text-xs font-normal normal-case tracking-normal leading-snug text-white shadow-lg"
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
