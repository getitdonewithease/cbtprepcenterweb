import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/core/ui/cn";
import { changeLine, goalLine, isFullMark, spokenDuration, type TestResult } from "../../service/testResultService";
import { primaryButton, secondaryButton, textLink } from "./reviewParts";

/**
 * The top of a test's review right after submitting (design approved 2026-11-24): while it's
 * marked, what's already known; then the mark, large, with the candidate's goal and the change
 * since their last full test, and each subject as a bar out of its maximum.
 */

/** What the test screen knew when the answers were sent; absent when the review is opened later. */
export interface JustFinished {
  answered: number;
  total: number;
  secondsUsed: number;
  timeUp: boolean;
}

export const isJustFinished = (value: unknown): value is JustFinished =>
  Boolean(value && typeof value === "object" && "answered" in value && "total" in value);

const knownLine = (f: JustFinished, saidTimeUp = false) =>
  `${f.timeUp && !saidTimeUp ? "Time ran out. " : ""}You answered ${f.answered} of ${f.total} in ${spokenDuration(f.secondsUsed)}.`;

/* ── While it's marked ─────────────────────────────────────────────────── */

const Dots = () => (
  <span className="flex gap-1" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span key={i} className="h-2 w-2 rounded-full bg-brand-orange motion-safe:animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
    ))}
  </span>
);

interface WaitProps {
  finished: JustFinished | null;
  phase: "marking" | "stalled" | "failed";
  slow?: boolean;
  cancelled?: boolean;
  onCheckAgain: () => void;
}

export const WaitForMark = ({ finished, phase, slow, cancelled, onCheckAgain }: WaitProps) => (
  <section aria-labelledby="result-h" aria-busy={phase === "marking"} className="max-w-3xl pb-8">
    <h2 id="result-h" className="text-balance text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
      {phase === "failed" && cancelled
        ? "This test was cancelled"
        : finished
          ? finished.timeUp
            ? "Time's up. Your answers are in."
            : "Done. Your answers are in."
          : "Your result"}
    </h2>
    {finished && phase !== "failed" && <p className="mt-3 text-lg text-muted-foreground">{knownLine(finished, true)}</p>}
    {phase === "marking" && (
      <p role="status" className="mt-4 flex items-center gap-3 text-muted-foreground">
        <Dots />
        {slow ? "Marking is taking longer than usual. Your answers are safe." : "Marking your answers. This usually takes a few seconds."}
      </p>
    )}
    {phase === "stalled" && (
      <div role="status" className="mt-4">
        <p className="text-pretty text-muted-foreground">
          Marking is still going. Your answers are safe, and your result will be in Test history when it's ready.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onCheckAgain} className={primaryButton()}>
            Check again
          </button>
          <Link to="/test-history" className={secondaryButton()}>
            Test history
          </Link>
        </div>
      </div>
    )}
    {phase === "failed" && (
      <div role="alert" className="mt-4">
        <p className="text-pretty text-muted-foreground">
          {cancelled ? "It has no result. Start a new test from your dashboard." : "We couldn't get your result. Check your connection and try again; your answers are safe."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {!cancelled && (
            <button type="button" onClick={onCheckAgain} className={primaryButton()}>
              Try again
            </button>
          )}
          <Link to={cancelled ? "/dashboard" : "/test-history"} className={cancelled ? primaryButton() : secondaryButton()}>
            {cancelled ? "Back to dashboard" : "Test history"}
          </Link>
        </div>
      </div>
    )}
  </section>
);

/* ── The result ────────────────────────────────────────────────────────── */

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The mark counts up once when it first arrives after a test; otherwise it simply shows. */
const useArrival = (to: number, animate: boolean) => {
  const still = !animate || reducedMotion();
  const [n, setN] = useState(still ? to : 0);
  const [grown, setGrown] = useState(still);
  useEffect(() => {
    if (still) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / 900);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    });
    const grow = requestAnimationFrame(() => setGrown(true));
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(grow);
    };
  }, [to, still]);
  return { n, grown };
};

interface ResultTopProps {
  result: TestResult;
  previous: number | null | undefined;
  goal: number | null | undefined;
  finished: JustFinished | null;
  missed: number;
  onShowMissed: () => void;
}

export const ResultTop = ({ result, previous, goal, finished, missed, onShowMissed }: ResultTopProps) => {
  const full = isFullMark(result);
  const shown = full ? result.mark : result.right;
  const { n, grown } = useArrival(shown, Boolean(finished));
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Arriving from the test: start reading at the result
  useEffect(() => {
    if (finished) headingRef.current?.focus({ preventScroll: true });
  }, [finished]);

  const facts = finished
    ? knownLine(finished)
    : `You answered ${result.answered} of ${result.total} in ${spokenDuration(result.secondsUsed)}.`;
  const goalText = full ? goalLine(result.mark, goal) : null;
  const changeText = full ? changeLine(result.mark, previous) : null;

  return (
    <section aria-labelledby="result-h" className="border-b pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
      <div>
        <p className="text-sm text-muted-foreground">{facts}</p>
        <h2 id="result-h" ref={headingRef} tabIndex={-1} className="mt-3 flex items-baseline gap-2 outline-none">
          <span className="text-6xl font-extrabold leading-none tracking-[-0.04em] tabular-nums sm:text-7xl" aria-hidden="true">
            {n}
          </span>
          <span className="text-xl font-bold text-muted-foreground" aria-hidden="true">
            {full ? "/ 400" : `of ${result.total} right`}
          </span>
          <span className="sr-only">{full ? `You scored ${result.mark} out of 400.` : `${result.right} of ${result.total} right.`}</span>
        </h2>
        {(goalText || changeText) && (
          <p className="mt-3 text-pretty">
            {goalText && <span className="font-semibold">{goalText} </span>}
            {changeText && <span className="text-muted-foreground">{changeText}</span>}
          </p>
        )}
        {missed > 0 && (
          <button type="button" onClick={onShowMissed} className={cn(textLink, "mt-3")}>
            Go through the {missed} you missed
          </button>
        )}
      </div>
      <ul className="mt-6 space-y-4 lg:mt-1" aria-label="Marks by subject">
        {result.subjects.map((s) => (
          <li key={s.name}>
            <p className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{s.name}</span>
              <span className="tabular-nums text-muted-foreground">
                <span className="font-bold text-foreground">{Math.round(Math.min(s.score, s.max))}</span> / {s.max}
              </span>
            </p>
            <span className="mt-1.5 block h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span
                className="block h-full rounded-full bg-brand-orange transition-[width] duration-700 ease-soft-out motion-reduce:transition-none"
                style={{ width: grown ? `${Math.min(100, (s.score / s.max) * 100)}%` : "0%" }}
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
