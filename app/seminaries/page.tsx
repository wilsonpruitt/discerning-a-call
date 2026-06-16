import type { Metadata } from "next";
import { seminaries } from "@/content";
import { Container, PageHeader, Card, Eyebrow } from "@/components/ui";
import { SeminaryDirectory } from "@/components/seminary-directory";

export const metadata: Metadata = {
  title: "Seminaries",
  description:
    "The thirteen United Methodist seminaries, with hybrid, online, and Course of Study options — and a word on whether you need a degree at all.",
};

export default function SeminariesPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="Where you might study"
            title="The United Methodist seminaries."
            subtitle="Thirteen schools — and more ways to attend than you might think."
            lead="These are the seminaries approved by the church's University Senate. Many now offer hybrid and fully online M.Div tracks, and several host a Course of Study school for licensed local pastors."
          />
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
