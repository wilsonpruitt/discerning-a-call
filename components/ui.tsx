import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  narrow = false,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-5 ${narrow ? "max-w-3xl" : "max-w-6xl"} ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  lead,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  lead?: string;
}) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1
        className="display-md mt-3"
        style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="title-italic mt-2 text-[20px]">{subtitle}</p>
      ) : null}
      {lead ? <p className="prose mt-5 text-[17px] text-muted">{lead}</p> : null}
    </header>
  );
}

export function Card({
  children,
  className = "",
  editorial = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  editorial?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-lg border border-hairline bg-ivory ${
        editorial ? "border-l-[3px] border-l-reed" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "reed" | "ok" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "border-hairline-strong text-muted",
    reed: "border-reed text-reed-deep",
    ok: "border-[var(--ok)] text-[var(--ok)]",
    info: "border-[var(--info)] text-[var(--info)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[12px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-fen text-[var(--fg-on-fen)] hover:bg-fen-mist"
      : "border border-hairline-strong bg-ivory text-fen hover:bg-sunken";
  return (
    <Link
      href={href}
      className={`unstyled inline-flex items-center justify-center rounded-md px-5 py-2.5 text-[15px] font-medium transition-colors ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}

// Inline link attached to a step or ladder bullet. Internal hrefs route through
// next/link; anything else opens in a new tab and gets the ↗ affordance.
export function ContentLinkInline({
  label,
  url,
  className = "",
}: {
  label: string;
  url: string;
  className?: string;
}) {
  const cls = `unstyled font-medium underline decoration-hairline-strong underline-offset-2 ${className}`;
  const isInternal = url.startsWith("/");

  if (isInternal) {
    return (
      <Link href={url} className={cls}>
        {label} →
      </Link>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      {label} ↗
    </a>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="display-sm mt-2 font-serif">{title}</h2>
    </div>
  );
}
