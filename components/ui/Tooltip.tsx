"use client";

import { useEffect, useId, useRef, useState } from "react";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="tooltip-wrap">
      <button
        type="button"
        className="tooltip-trigger"
        aria-label={`More info: ${label}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        ?
      </button>
      {open && (
        <span role="tooltip" id={id} className="tooltip-content">
          {children}
        </span>
      )}
    </span>
  );
}
