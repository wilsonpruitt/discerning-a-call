import type { Sourced } from "@/content/types";

// Nothing quantitative renders on a seminary page without where it came from
// and when. If a fact can't carry these, it doesn't ship — see
// research/seminary-pages-plan.md §2.

function formatAsOf(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function SourceLine({ source, asOf }: { source: string; asOf: string }) {
  return (
    <p className="mt-2 text-[12px] text-muted">
      As of {formatAsOf(asOf)} ·{" "}
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="unstyled underline decoration-hairline-strong underline-offset-2"
      >
        source ↗
      </a>
    </p>
  );
}

export function Fact({
  label,
  fact,
}: {
  label: string;
  fact: Sourced<string> | undefined;
}) {
  if (!fact) return null;
  return (
    <div className="rounded-md border border-hairline bg-parchment p-4">
      <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1.5 text-[16px] text-ink">{fact.value}</p>
      {fact.note ? (
        <p className="mt-1.5 text-[13px] leading-snug text-muted">{fact.note}</p>
      ) : null}
      <SourceLine source={fact.source} asOf={fact.asOf} />
    </div>
  );
}
