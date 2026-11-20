import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * Closing band: the navy stage from the hero again, so the page opens and closes the
 * same way. Orange appears only on the button and the score bars. The card on the right
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
    className="w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(222.2,47.4%,11%)] p-6 shadow-soft"
  >
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-white">First mock, submitted</p>
        <p className="mt-0.5 text-xs text-white/60">Example result</p>
      </div>
      <p className="font-display text-3xl font-extrabold tabular-nums text-white">
        {FIRST_MOCK.total}
        <span className="text-base font-semibold text-white/50"> / 400</span>
      </p>
    </div>

    <ul className="mt-5 space-y-3">
      {FIRST_MOCK.subjects.map(({ name, score }) => (
        <li key={name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-white/70">{name}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full bg-brand-orange" style={{ width: `${score}%` }} />
          </span>
          <span className="w-7 text-right text-xs tabular-nums text-white/80">{score}</span>
        </li>
      ))}
    </ul>

    <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm">
      <p className="flex items-center gap-2 text-white/85">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-text" aria-hidden="true" />
        <span>
          <span className="tabular-nums">{FIRST_MOCK.explanationsReady}</span> explanations ready to read
        </span>
      </p>
      <p className="flex items-center gap-2 text-white/85">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-text" aria-hidden="true" />
        Next topic to study: {FIRST_MOCK.nextTopic}
      </p>
    </div>
  </div>
);

const CtaSection = () => (
  <section
    aria-labelledby="cta-heading"
    className="dark relative overflow-hidden bg-[hsl(222.2,47.4%,8%)] py-20 md:py-28"
  >
    {/* Still echo of the hero's light: one soft pool behind the card, no second WebGL context */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 40% 55% at 75% 50%, hsl(25 95% 53% / 0.14), transparent 70%)",
      }}
    />

    <div className="container relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2
          id="cta-heading"
          className="text-balance font-display text-4xl font-extrabold tracking-[-0.03em] text-white md:text-5xl"
        >
          Sit your first mock today
        </h2>
        <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-white/70">
          It&apos;s free to start. Four subjects, timed, with an explanation ready for every
          question you miss as soon as you submit.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/signup"
            className="group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222.2,47.4%,8%)]"
          >
            Start free practice
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/signin"
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-xl border border-white/20 px-6 text-base font-medium text-white transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222.2,47.4%,8%)]"
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
