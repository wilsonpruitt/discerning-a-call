import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-[20px] font-medium text-fen">
            Discerning a Call
          </p>
          <p className="prose mt-2 max-w-sm text-[14px] text-muted">
            A companion for anyone sensing a call to ministry — whatever stage of
            life you are in. The goal is not to pipeline anyone into ordination,
            but to walk alongside you while you discern.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-[14px]">
          <span className="eyebrow mb-1">Explore</span>
          <Link href="/start" className="unstyled text-muted hover:text-ink">
            Find your path
          </Link>
          <Link href="/paths" className="unstyled text-muted hover:text-ink">
            Paths by life stage
          </Link>
          <Link href="/process" className="unstyled text-muted hover:text-ink">
            The candidacy process
          </Link>
          <Link href="/seminaries" className="unstyled text-muted hover:text-ink">
            Seminaries
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-[14px]">
          <span className="eyebrow mb-1">More</span>
          <Link href="/ministries" className="unstyled text-muted hover:text-ink">
            Forms of ministry
          </Link>
          <Link href="/resources" className="unstyled text-muted hover:text-ink">
            Resources &amp; mentorship
          </Link>
          <Link
            href="/conferences"
            className="unstyled text-muted hover:text-ink"
          >
            Conferences
          </Link>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-5 text-[13px] text-muted sm:flex-row sm:items-center">
          <p>
            A project of{" "}
            <a href="https://wrootlabs.com" className="text-fen">
              Wroot Labs
            </a>
            . Not an official organ of any annual conference.
          </p>
          <p className="text-[var(--fg-quiet)]">
            Built with care for the United Methodist Church.
          </p>
        </div>
      </div>
    </footer>
  );
}
