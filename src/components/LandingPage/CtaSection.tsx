import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * Closing band on the page ground, so it follows the light or dark theme like the hero. The
 * orange appears only on the button and the score bars. The card on the right
 * is what a candidate walks away with after a first mock (example data).
 */

const FIRST_MOCK = {
  total: 248,
  subjects: [
    { name: "Use of English", score: 68 },
    { name: "Mathematics", score: 61 },
    { name: "Physics", score: 64 },
    { name: "Chemistry", score: 55 },
  ],
  explanationsReady: 37,
  nextTopic: "Organic Chemistry",
} as const;

const FirstMockCard = () => (
  <div
    role="img"
    aria-label={`Example result after a first mock: ${FIRST_MOCK.total} out of 400, per-subject scores, ${FIRST_MOCK.explanationsReady} explanations ready, and ${FIRST_MOCK.nextTopic} as the next topic to study.`}
    className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft"
  >
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">First mock, submitted</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Example result</p>
      </div>
      <p className="font-display text-3xl font-extrabold tabular-nums text-foreground">
        {FIRST_MOCK.total}
        <span className="text-base font-semibold text-muted-foreground"> / 400</span>
      </p>
    </div>

    <ul className="mt-5 space-y-3">
      {FIRST_MOCK.subjects.map(({ name, score }) => (
        <li key={name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-muted-foreground">{name}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <span className="block h-full rounded-full bg-brand-orange" style={{ width: `${score}%` }} />
          </span>
          <span className="w-7 text-right text-xs tabular-nums text-foreground/80">{score}</span>
        </li>
      ))}
    </ul>

    <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
      <p className="flex items-center gap-2 text-foreground/85">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-text" aria-hidden="true" />
        <span>
          <span className="tabular-nums">{FIRST_MOCK.explanationsReady}</span> explanations ready to read
        </span>
      </p>
      <p className="flex items-center gap-2 text-foreground/85">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-text" aria-hidden="true" />
        Next topic to study: {FIRST_MOCK.nextTopic}
      </p>
    </div>
  </div>
);

const CtaSection = () => (
  <section
    aria-labelledby="cta-heading"
    className="relative overflow-hidden bg-background py-20 md:py-28"
  >

    <div className="container relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2
          id="cta-heading"
          className="text-balance font-display text-4xl font-extrabold tracking-[-0.03em] text-foreground md:text-5xl"
        >
          Sit your first mock today
        </h2>
        <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          It&apos;s free to start. Four subjects, timed, with an explanation ready for every
          question you miss as soon as you submit.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/signup"
            className="group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start free practice
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/signin"
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-xl border border-border px-6 text-base font-medium text-foreground transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-foreground/5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <FirstMockCard />
      </div>
    </div>
  </section>
);

export default CtaSection;
