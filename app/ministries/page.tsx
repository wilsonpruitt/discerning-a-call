import type { Metadata } from "next";
import Link from "next/link";
import { ministries } from "@/content";
import { Container, PageHeader, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Forms of ministry",
  description:
    "Elder, deacon, licensed local pastor, chaplain, lay minister — what each is, who it fits, and the honest trade-offs.",
};

export default function MinistriesPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="Forms of ministry"
            title="There is more than one way to answer."
            subtitle="Every form here is a complete vocation, not a consolation prize."
            lead="People often assume a call to ministry means becoming a senior pastor. It might. But it might mean being a deacon, a chaplain, a local pastor, or a lay leader. Here is each, with its gifts and its costs named honestly."
          />
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <div className="space-y-8">
          {ministries.map((m) => (
            <Card key={m.id} id={m.id} className="scroll-mt-24 p-7">
              <div className="grid gap-7 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <h2 className="font-serif text-[27px] font-medium text-fen">
                    {m.name}
                  </h2>
                  <p className="title-italic mt-1 text-[17px]">{m.oneLine}</p>
                  <div className="prose mt-4 space-y-3 text-[15px] text-muted">
                    {m.description.map((d, i) => (
                      <p key={i}>{d}</p>
                    ))}
                  </div>
                  <p className="mt-5 rounded-md border border-hairline bg-parchment p-3 text-[14px]">
                    <span className="font-medium text-fen">How you get there:</span>{" "}
                    <span className="text-muted">{m.pathSummary}</span>
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <Eyebrow>This may fit if</Eyebrow>
                    <ul className="mt-2 space-y-2">
                      {m.fitsIf.map((f, i) => (
                        <li key={i} className="flex gap-2 text-[14px]">
                          <span
                            aria-hidden
                            className="mt-0.5 text-[var(--ok)]"
                          >
                            ✓
                          </span>
                          <span className="text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Eyebrow>Weigh that</Eyebrow>
                    <ul className="mt-2 space-y-2">
                      {m.weighThat.map((w, i) => (
                        <li key={i} className="flex gap-2 text-[14px]">
                          <span
                            aria-hidden
                            className="mt-0.5 text-reed-deep"
                          >
                            ·
                          </span>
                          <span className="text-muted">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-[14px] text-muted">
          Still weighing the difference?{" "}
          <Link href="/process" className="font-medium text-fen">
            See how each maps onto the candidacy process →
          </Link>
        </p>
      </Container>
    </>
  );
}
