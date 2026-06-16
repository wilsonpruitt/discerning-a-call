"use client";

import { useEffect, useId, useRef, useState } from "react";
import { disciplineSnippets } from "@/content/discipline-snippets";

// A ¶ reference that reveals a snippet of the Book of Discipline paragraph on
// hover, focus, or tap. Falls back to a plain badge if the snippet is unknown.
export function DisciplineRef({ refLabel }: { refLabel: string }) {
  const key = refLabel.replace(/[^0-9]/g, "");
  const entry = disciplineSnippets[key];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const badge = `inline-flex items-center rounded-sm border px-2 py-0.5 text-[12px] font-medium ${
    entry
      ? "cursor-help border-reed text-reed-deep hover:bg-[var(--warn-bg)]"
      : "border-hairline-strong text-muted"
  }`;

  if (!entry) {
    return <span className={badge}>{refLabel}</span>;
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={badge}
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={scheduleClose}
      >
        {refLabel}
      </button>

      {open ? (
        <span
          id={panelId}
          role="tooltip"
          className="absolute left-0 top-[calc(100%+6px)] z-50 block w-[300px] rounded-lg border border-hairline bg-ivory p-4 text-left shadow-[0_1px_0_rgba(26,33,40,0.04),0_4px_12px_rgba(26,33,40,0.06)] sm:w-[340px]"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <span className="eyebrow block">
            ¶{entry.number} · Book of Discipline
          </span>
          <span className="mt-1 block font-serif text-[16px] font-medium text-fen">
            {entry.title}
          </span>
          <span className="mt-2 block text-[13px] leading-relaxed text-muted">
            {entry.snippet}
          </span>
          <span className="mt-2.5 block text-[11px] text-[var(--fg-quiet)]">
            Excerpt from the 2020/2024 Book of Discipline. Read the full
            paragraph in the Discipline itself.
          </span>
        </span>
      ) : null}
    </span>
  );
}
