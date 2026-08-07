import type { Metadata } from "next";
import { seminaries } from "@/content";
import { Container, PageHeader, ButtonLink, Card, Eyebrow } from "@/components/ui";
import { SeminaryDirectory } from "@/components/seminary-directory";

export const metadata: Metadata = {
  title: "Seminaries",
  description:
    "The thirteen United Methodist seminaries and the Senate-approved schools beyond them — with hybrid, online, and Course of Study options, and a word on whether you need a degree at all.",
};

export default function SeminariesPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="Where you might study"
            title="Where you can study for ordination."
            subtitle="Thirteen United Methodist schools — and a longer list beyond them."
            lead="¶324.4 asks for basic graduate theological studies from a University Senate–approved school. That is a broader list than most people realise: the thirteen United Methodist seminaries, and twenty-four more the Senate has approved. Both routes are legitimate; they carry different constraints, and the biggest one is that no online or distance class taken at a non–United Methodist school counts toward ordination."
          />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href="/seminaries/faculty" variant="secondary">
              Or start from the subject — browse faculty by what they teach
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-14">
        <SeminaryDirectory seminaries={seminaries} />

        <Card editorial className="mt-12 p-7">
          <Eyebrow>Before you assume you need a degree</Eyebrow>
          <h2 className="mt-2 font-serif text-[22px] font-medium text-fen">
            Not every call requires a residential M.Div.
          </h2>
          <p className="prose mt-3 text-[15px] text-muted">
            Licensed local pastors complete the five-year{" "}
            <span className="text-fen">Course of Study</span> while serving,
            often without relocating. Second-career and bivocational candidates
            especially should ask their conference about this route before
            committing to a full residential degree. And the{" "}
            <span className="text-fen">Ministerial Education Fund</span> and other
            scholarships exist precisely so that money is not the thing that stops
            a call.
          </p>
        </Card>
      </Container>
    </>
  );
}
