import type { Metadata } from "next";
import Link from "next/link";
import { paths } from "@/content";
import { Container, PageHeader, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Paths by life stage",
  description:
    "The next step toward ministry looks different depending on where you are in life. Find the path that sounds like you.",
};

export default function PathsPage() {
  return (
    <Container className="py-16 md:py-20">
      <PageHeader
        eyebrow="Start here"
        title="Where are you in life?"
        subtitle="The same call meets each of us on a different road."
        lead="Discernment is not one-size-fits-all. Choose the stage that sounds like you, and we'll tailor the first steps, the timeline, and the cautions to your situation."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {paths.map((p) => (
          <Link key={p.slug} href={`/paths/${p.slug}`} className="unstyled group">
            <Card className="flex h-full flex-col p-7 transition-colors hover:border-hairline-strong">
              <span className="eyebrow">{p.ageHint}</span>
              <h2 className="mt-2 font-serif text-[27px] font-medium text-fen">
                {p.name}
              </h2>
              <p className="mt-1 text-[15px] text-muted">{p.cardLabel}</p>
              <p className="title-italic mt-4 text-[17px] leading-snug">
                {p.tagline}
              </p>
              <p className="prose mt-4 text-[15px] text-muted">{p.intro[0]}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-fen group-hover:text-ink">
                Open this path{" "}
                <span aria-hidden className="text-reed-deep">
                  →
                </span>
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
