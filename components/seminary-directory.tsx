"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Seminary, SeminaryModality } from "@/content/types";

const MODALITIES: { key: SeminaryModality; label: string }[] = [
  { key: "residential", label: "Residential" },
  { key: "hybrid", label: "Hybrid" },
  { key: "online", label: "Online" },
];

const CARD_CLASS =
  "unstyled group flex h-full flex-col rounded-lg border border-hairline bg-ivory p-5 transition-colors hover:border-hairline-strong";

function CardShell({
  seminary,
  children,
}: {
  seminary: Seminary;
  children: React.ReactNode;
}) {
  if (seminary.slug) {
    return (
      <Link href={`/seminaries/${seminary.slug}`} className={CARD_CLASS}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={seminary.url}
      target="_blank"
      rel="noopener noreferrer"
      className={CARD_CLASS}
    >
      {children}
    </a>
  );
}

export function SeminaryDirectory({ seminaries }: { seminaries: Seminary[] }) {
  const [modality, setModality] = useState<SeminaryModality | "all">("all");
  const [courseOnly, setCourseOnly] = useState(false);
  const [umcOnly, setUmcOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seminaries.filter((s) => {
      if (modality !== "all" && !s.modalities.includes(modality)) return false;
      if (courseOnly && !s.courseOfStudy) return false;
      if (umcOnly && !s.umcAffiliated) return false;
      if (
        q &&
        !`${s.name} ${s.city} ${s.state}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [seminaries, modality, courseOnly, umcOnly, query]);

  const chip = (active: boolean) =>
    `rounded-pill border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
      active
        ? "border-fen bg-fen text-[var(--fg-on-fen)]"
        : "border-hairline-strong bg-ivory text-muted hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-ivory p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={chip(modality === "all")}
            onClick={() => setModality("all")}
          >
            All formats
          </button>
          {MODALITIES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={chip(modality === m.key)}
              onClick={() => setModality(m.key)}
            >
              {m.label}
            </button>
          ))}
          <button
            type="button"
            className={chip(courseOnly)}
            onClick={() => setCourseOnly((v) => !v)}
          >
            Course of Study
          </button>
          <button
            type="button"
            className={chip(umcOnly)}
            onClick={() => setUmcOnly((v) => !v)}
          >
            United Methodist only
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or place"
          className="w-full rounded-md border border-hairline-strong bg-parchment px-3.5 py-2 text-[14px] text-ink outline-none focus:border-fen md:w-64"
        />
      </div>

      <p className="mt-4 text-[13px] text-muted">
        {filtered.length} of {seminaries.length} schools
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((s) => (
          // A school with a profile links inward; the rest still link out, as
          // they always have. The arrow tells you which you are about to get.
          <CardShell key={s.name} seminary={s}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-[20px] font-medium text-fen group-hover:text-ink">
                {s.name}
              </h3>
              <span aria-hidden className="text-reed-deep">
                {s.slug ? "→" : "↗"}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-muted">
              {s.city}, {s.state}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.modalities.map((mod) => (
                <span
                  key={mod}
                  className="rounded-sm border border-hairline-strong px-2 py-0.5 text-[11px] capitalize text-muted"
                >
                  {mod}
                </span>
              ))}
              {s.courseOfStudy ? (
                <span className="rounded-sm border border-reed px-2 py-0.5 text-[11px] text-reed-deep">
                  Course of Study
                </span>
              ) : null}
              {!s.umcAffiliated ? (
                <span className="rounded-sm border border-hairline-strong px-2 py-0.5 text-[11px] text-muted">
                  Senate-approved, not UMC
                </span>
              ) : null}
            </div>
            {s.note ? (
              <p className="mt-3 text-[13px] leading-snug text-muted">{s.note}</p>
            ) : null}
            {s.slug ? (
              <p className="mt-3 text-[13px] font-medium text-reed-deep">
                Full profile — faculty, cost, and what ¶324.4 needs here
              </p>
            ) : null}
          </CardShell>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">
          No schools match that filter. Try widening it.
        </p>
      ) : null}
    </div>
  );
}
