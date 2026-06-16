"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/paths", label: "Paths" },
  { href: "/process", label: "The process" },
  { href: "/ministries", label: "Forms of ministry" },
  { href: "/seminaries", label: "Seminaries" },
  { href: "/resources", label: "Resources" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-parchment/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="unstyled flex flex-col leading-none">
          <span
            className="font-serif text-[22px] font-medium text-fen"
            style={{ letterSpacing: "0.2px" }}
          >
            Discerning a Call
          </span>
          <span className="eyebrow mt-1 text-[10px]">A Wroot Labs companion</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="unstyled text-[15px] text-muted transition-colors hover:text-ink"
              style={isActive(item.href) ? { color: "var(--fen)", fontWeight: 500 } : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/start"
            className="unstyled rounded-md bg-fen px-4 py-2 text-[14px] font-medium text-[var(--fg-on-fen)] transition-colors hover:bg-fen-mist"
          >
            Where are you?
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden rounded-md border border-hairline-strong px-3 py-2 text-[14px] text-fen"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-hairline bg-ivory px-5 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="unstyled rounded-md px-2 py-2.5 text-[15px] text-fen hover:bg-sunken"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/start"
              onClick={() => setOpen(false)}
              className="unstyled mt-1 rounded-md bg-fen px-4 py-2.5 text-center text-[15px] font-medium text-[var(--fg-on-fen)]"
            >
              Where are you?
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
