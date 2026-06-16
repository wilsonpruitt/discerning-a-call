import type { Metadata } from "next";
import Link from "next/link";
import { conferences } from "@/content";
import { Container, PageHeader, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Conferences",
  description:
    "Candidacy is run by your annual conference. Find your conference's on-ramp — or learn how to find it if yours isn't here yet.",
};

export default function ConferencesPage() {
  return (
    <Container className="py-16 md:py-20">
      <PageHeader
        eyebrow="The local on-ramp"
        title="Candidacy is run by your conference."
        subtitle="The universal path is the same; the door is local."
        lead="Everything else on this site is true across the United Methodist Church. But the formal process — the summit, the forms, the people — belongs to your annual conference. Here are the ones we've mapped so far."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {conferences.map((c) => (
          <Link
            key={c.slug}
            href={`/conferences/${c.slug}`}
            className="unstyled group"
          >
            <Card className="flex h-full flex-col p-7 transition-colors hover:border-hairline-strong">
              <span className="eyebrow">{c.region}</span>
              <h2 className="mt-2 font-serif text-[25px] font-medium text-fen">
                {c.name}
              </h2>
              <p className="prose mt-3 text-[15px] text-muted">{c.intro[0]}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-fen group-hover:text-ink">
                See the on-ramp{" "}
                <span aria-hidden className="text-reed-deep">
                  →
                </span>
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <Card editorial className="mt-8 p-7">
        <Eyebrow>Don&apos;t see your conference?</Eyebrow>
        <h2 className="mt-2 font-serif text-[22px] font-medium text-fen">
          The door is the same everywhere.
        </h2>
        <p className="prose mt-2 text-[15px] text-muted">
          Even if your conference isn&apos;t mapped here yet, the way in is
          consistent across the church: talk with your pastor, and ask who your{" "}
          <span className="text-fen">district superintendent</span> is. That one
          question opens the candidacy process anywhere in The United Methodist
          Church.
        </p>
      </Card>
    </Container>
  );
}
