import type { Metadata } from "next";
import { paths, ministries, ladder, conferences } from "@/content";
import { Container, Eyebrow } from "@/components/ui";
import { PathFinder, type WizardData } from "@/components/path-finder";

export const metadata: Metadata = {
  title: "Where are you?",
  description:
    "Answer a few gentle questions and we'll point you to your path, your next steps, and your local on-ramp.",
};

export default function StartPage() {
  const data: WizardData = {
    paths: paths.map((p) => ({
      slug: p.slug,
      name: p.name,
      cardLabel: p.cardLabel,
      ageHint: p.ageHint,
      tagline: p.tagline,
      firstSteps: p.firstSteps,
      timeline: p.timeline,
      ladderStageIds: p.ladderStageIds,
      formIds: p.formIds,
    })),
    ministries: ministries.map((m) => ({
      id: m.id,
      name: m.name,
      oneLine: m.oneLine,
    })),
    ladder: ladder.map((l) => ({
      id: l.id,
      name: l.name,
      summary: l.summary,
    })),
    conferences: conferences.map((c) => ({ slug: c.slug, name: c.name })),
  };

  return (
    <Container narrow className="py-14 md:py-20">
      <div className="max-w-2xl">
        <Eyebrow>Where are you?</Eyebrow>
        <h1
          className="display-md mt-3 font-serif"
          style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}
        >
          Let&apos;s find your next step.
        </h1>
        <p className="prose mt-4 text-[17px] text-muted">
          Four short questions. No account, no email, no pressure — just a
          starting point shaped to where you actually are.
        </p>
      </div>

      <div className="mt-10">
        <PathFinder data={data} />
      </div>
    </Container>
  );
}
