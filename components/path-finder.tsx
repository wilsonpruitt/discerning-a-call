"use client";

import { useState } from "react";
import Link from "next/link";
import type { LifeStagePath, MinistryForm, LadderStage } from "@/content/types";
import { ContentLinkInline } from "@/components/ui";

type DrawKey = "preach-lead" | "serve-world" | "serve-working" | "unsure";
type SeriousKey = "wondering" | "exploring" | "ready";

export interface WizardData {
  paths: Pick<
    LifeStagePath,
    "slug" | "name" | "cardLabel" | "ageHint" | "tagline" | "firstSteps" | "timeline" | "ladderStageIds" | "formIds"
  >[];
  ministries: Pick<MinistryForm, "id" | "name" | "oneLine">[];
  ladder: Pick<LadderStage, "id" | "name" | "summary">[];
  conferences: { slug: string; name: string }[];
}

const STAGE_Q = "Where are you in life right now?";
const SERIOUS_Q = "How would you describe this moment?";
const DRAW_Q = "What draws you most?";
const CONF_Q = "Which annual conference are you in?";

const SERIOUS: { key: SeriousKey; label: string; note: string }[] = [
  { key: "wondering", label: "Just wondering", note: "The thought won't quite leave me alone." },
  { key: "exploring", label: "Seriously exploring", note: "I want to test this with intention." },
  { key: "ready", label: "Ready to begin", note: "I think it's time to take a formal step." },
];

const DRAW: { key: DrawKey; label: string; note: string; forms: string[] }[] = [
  {
    key: "preach-lead",
    label: "Preaching & leading a church",
    note: "Word, sacrament, and the life of a congregation.",
    forms: ["elder", "local-pastor"],
  },
  {
    key: "serve-world",
    label: "Serving the world's need",
    note: "Compassion, justice, teaching, chaplaincy.",
    forms: ["deacon", "chaplaincy"],
  },
  {
    key: "serve-working",
    label: "Serving while I keep working",
    note: "A bivocational or lay-led shape of ministry.",
    forms: ["local-pastor", "lay"],
  },
  {
    key: "unsure",
    label: "I honestly don't know yet",
    note: "And that's a fine place to start.",
    forms: [],
  },
];

const SERIOUS_HEADLINE: Record<SeriousKey, string> = {
  wondering: "A good first step is simply to keep listening — here's how.",
  exploring: "You're ready to test this with intention. Here's where to put your energy.",
  ready: "It may be time to take a formal step. Here's the door.",
};

export function PathFinder({ data }: { data: WizardData }) {
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<string | null>(null);
  const [serious, setSerious] = useState<SeriousKey | null>(null);
  const [draw, setDraw] = useState<DrawKey | null>(null);
  const [conf, setConf] = useState<string | null>(null);

  const totalSteps = 4;
  const path = data.paths.find((p) => p.slug === stage);

  const reset = () => {
    setStep(0);
    setStage(null);
    setSerious(null);
    setDraw(null);
    setConf(null);
  };

  // ---- Result view ----
  if (step === totalSteps && path && serious && draw) {
    const drawDef = DRAW.find((d) => d.key === draw)!;
    const formIds = drawDef.forms.length > 0 ? drawDef.forms : path.formIds ?? [];
    const forms = formIds
      .map((id) => data.ministries.find((m) => m.id === id))
      .filter(Boolean)
      .slice(0, 2) as Pick<MinistryForm, "id" | "name" | "oneLine">[];
    const rungs = path.ladderStageIds
      .map((id) => data.ladder.find((l) => l.id === id))
      .filter(Boolean)
      .slice(0, 3) as Pick<LadderStage, "id" | "name" | "summary">[];
    const steps = path.firstSteps.slice(0, serious === "wondering" ? 2 : 3);
    const conference = data.conferences.find((c) => c.slug === conf);
    const towardLay = formIds.includes("lay");

    return (
      <div className="rounded-xl border border-hairline bg-ivory p-7 md:p-10">
        <span className="eyebrow">Your path · {path.ageHint}</span>
        <h2
          className="display-sm mt-3 font-serif"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)" }}
        >
          {SERIOUS_HEADLINE[serious]}
        </h2>
        <p className="title-italic mt-2 text-[18px]">{path.tagline}</p>

        {towardLay ? (
          <div className="mt-5 rounded-md border-l-[3px] border-l-reed border border-hairline bg-parchment p-4">
            <p className="text-[15px] text-fen">
              Your call may be to lead as laity — and that&apos;s not a
              smaller calling.{" "}
              <Link
                href="/lay-ministry"
                className="unstyled font-medium underline decoration-hairline-strong underline-offset-2"
              >
                Here&apos;s what that looks like →
              </Link>
            </p>
          </div>
        ) : null}

        <div className="mt-7 grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <div>
            <span className="eyebrow">Do these next</span>
            <ol className="mt-3 space-y-3">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-md border border-hairline bg-parchment p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-reed font-serif text-[14px] text-reed-deep">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-fen">
                      {s.title}
                    </p>
                    <p className="mt-1 text-[14px] text-muted">{s.body}</p>
                    {s.link ? (
                      <p className="mt-1.5 text-[13px]">
                        <ContentLinkInline
                          label={s.link.label}
                          url={s.link.url}
                        />
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href={`/paths/${path.slug}`}
              className="unstyled mt-4 inline-block text-[14px] font-medium text-fen"
            >
              See the full {path.name.toLowerCase()} path →
            </Link>
          </div>

          <aside className="space-y-5">
            {forms.length > 0 ? (
              <div className="rounded-md border border-hairline bg-parchment p-4">
                <span className="eyebrow">Forms worth a look</span>
                <ul className="mt-2 space-y-2">
                  {forms.map((f) => (
                    <li key={f.id}>
                      <Link
                        href={`/ministries#${f.id}`}
                        className="unstyled block"
                      >
                        <span className="text-[14px] font-medium text-fen">
                          {f.name}
                        </span>
                        <span className="block text-[12px] text-muted">
                          {f.oneLine}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {rungs.length > 0 ? (
              <div className="rounded-md border border-hairline bg-parchment p-4">
                <span className="eyebrow">Where this sits on the path</span>
                <ul className="mt-2 space-y-1.5">
                  {rungs.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/process#${r.id}`}
                        className="unstyled text-[14px] font-medium text-fen"
                      >
                        {r.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {conference ? (
              <div className="rounded-md border-l-[3px] border-l-reed border border-hairline bg-parchment p-4">
                <span className="eyebrow">Your local on-ramp</span>
                <Link
                  href={`/conferences/${conference.slug}`}
                  className="unstyled mt-1 block text-[15px] font-semibold text-fen"
                >
                  {conference.name} →
                </Link>
              </div>
            ) : (
              <div className="rounded-md border border-hairline bg-parchment p-4">
                <span className="eyebrow">Your local on-ramp</span>
                <p className="mt-1 text-[13px] text-muted">
                  Candidacy is run by your annual conference. Ask your pastor who
                  your district superintendent is — that's your door.
                </p>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
          <p className="text-[13px] text-muted">
            This is a starting point, not a verdict. The call keeps.
          </p>
          <button
            type="button"
            onClick={reset}
            className="ml-auto rounded-md border border-hairline-strong bg-ivory px-4 py-2 text-[14px] text-fen hover:bg-sunken"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // ---- Question views ----
  const onPick = (setter: (v: never) => void, value: unknown) => {
    setter(value as never);
    setStep((s) => s + 1);
  };

  const optionBtn = (active: boolean) =>
    `w-full rounded-lg border p-5 text-left transition-colors ${
      active
        ? "border-fen bg-sunken"
        : "border-hairline-strong bg-ivory hover:border-fen"
    }`;

  return (
    <div className="rounded-xl border border-hairline bg-ivory p-7 md:p-10">
      {/* progress */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-pill ${
              i <= step ? "bg-reed" : "bg-hairline"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted">
        Step {step + 1} of {totalSteps}
      </p>

      {step === 0 ? (
        <Question title={STAGE_Q}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.paths.map((p) => (
              <button
                key={p.slug}
                type="button"
                className={optionBtn(stage === p.slug)}
                onClick={() => onPick(setStage as (v: never) => void, p.slug)}
              >
                <span className="block font-serif text-[19px] font-medium text-fen">
                  {p.name}
                </span>
                <span className="mt-1 block text-[14px] text-muted">
                  {p.cardLabel}
                </span>
              </button>
            ))}
          </div>
        </Question>
      ) : null}

      {step === 1 ? (
        <Question title={SERIOUS_Q} onBack={() => setStep(0)}>
          <div className="grid gap-3">
            {SERIOUS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={optionBtn(serious === s.key)}
                onClick={() => onPick(setSerious as (v: never) => void, s.key)}
              >
                <span className="block text-[16px] font-semibold text-fen">
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[14px] text-muted">
                  {s.note}
                </span>
              </button>
            ))}
          </div>
        </Question>
      ) : null}

      {step === 2 ? (
        <Question title={DRAW_Q} onBack={() => setStep(1)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {DRAW.map((d) => (
              <button
                key={d.key}
                type="button"
                className={optionBtn(draw === d.key)}
                onClick={() => onPick(setDraw as (v: never) => void, d.key)}
              >
                <span className="block text-[16px] font-semibold text-fen">
                  {d.label}
                </span>
                <span className="mt-0.5 block text-[14px] text-muted">
                  {d.note}
                </span>
              </button>
            ))}
          </div>
        </Question>
      ) : null}

      {step === 3 ? (
        <Question title={CONF_Q} onBack={() => setStep(2)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.conferences.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={optionBtn(conf === c.slug)}
                onClick={() => onPick(setConf as (v: never) => void, c.slug)}
              >
                <span className="block text-[16px] font-semibold text-fen">
                  {c.name}
                </span>
              </button>
            ))}
            <button
              type="button"
              className={optionBtn(conf === "other")}
              onClick={() => onPick(setConf as (v: never) => void, "other")}
            >
              <span className="block text-[16px] font-semibold text-fen">
                Another / not sure
              </span>
              <span className="mt-0.5 block text-[14px] text-muted">
                We&apos;ll point you to the universal next steps.
              </span>
            </button>
          </div>
        </Question>
      ) : null}
    </div>
  );
}

function Question({
  title,
  children,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="mt-6">
      <h2 className="font-serif text-[24px] font-medium text-fen md:text-[28px]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-5 text-[14px] text-muted hover:text-ink"
        >
          ← Back
        </button>
      ) : null}
    </div>
  );
}
