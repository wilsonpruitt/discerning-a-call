import type { Metadata } from "next";
import { resources } from "@/content";
import type { Resource, ResourceCategory } from "@/content/types";
import { Container, PageHeader, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Resources & mentorship",
  description:
    "Official tools, books, retreats, mentorship, and financial help for discerning a call to ministry.",
};

const GROUPS: { key: ResourceCategory; title: string; blurb: string }[] = [
  {
    key: "official",
    title: "Official tools",
    blurb: "The denomination's own front doors into the process.",
  },
  {
    key: "mentorship",
    title: "People who walk with you",
    blurb: "Discernment is tested in company, never alone.",
  },
  {
    key: "book",
    title: "Books worth your time",
    blurb: "For the long, slow work of listening.",
  },
  {
    key: "retreat",
    title: "Retreats & gatherings",
    blurb: "Rooms full of others on the same road.",
  },
  {
    key: "financial",
    title: "Money & scholarships",
    blurb: "So that cost is not the thing that stops a call.",
  },
];

function ResourceItem({ r }: { r: Resource }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[19px] font-medium text-fen">
          {r.title}
        </h3>
        {r.url ? (
          <span aria-hidden className="text-reed-deep">
            ↗
          </span>
        ) : null}
      </div>
      {r.by ? <p className="mt-0.5 text-[13px] text-muted">{r.by}</p> : null}
      <p className="mt-2 text-[14px] text-muted">{r.blurb}</p>
    </>
  );

  return (
    <Card className="h-full p-5 transition-colors hover:border-hairline-strong">
      {r.url ? (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="unstyled block"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </Card>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="Resources & mentorship"
            title="You don't have to figure this out alone."
            subtitle="The right book, the right room, the right person — and a little help with the bill."
          />
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <div className="space-y-14">
          {GROUPS.map((group) => {
            const items = resources.filter((r) => r.category === group.key);
            if (items.length === 0) return null;
            return (
              <section key={group.key}>
                <Eyebrow>{group.title}</Eyebrow>
                <p className="title-italic mt-1 text-[18px]">{group.blurb}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => (
                    <ResourceItem key={r.id} r={r} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}
