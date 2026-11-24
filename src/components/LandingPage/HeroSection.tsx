import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3 } from "lucide-react";
import { cn } from "@/core/ui/cn";
import type { ThemePreference } from "@/core/theme/useThemePreference";
import HeroLightGround from "./HeroLightGround";

// ── Exam window data (an illustration of the product, not real results) ─────

const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry"] as const;

const OPTIONS = [
  { key: "A", text: "3" },
  { key: "B", text: "11" },
  { key: "C", text: "8" },
  { key: "D", text: "−2" },
] as const;

const SELECTED_OPTION = "B";
const CURRENT_QUESTION = 7;
const TOTAL_QUESTIONS = 40;
const ANSWERED = new Set([1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 14]);
const FLAGGED = new Set([10]);

const RESULT_ROWS = [
  { subject: "Mathematics", score: 78 },
  { subject: "English", score: 71 },
  { subject: "Physics", score: 66 },
  { subject: "Chemistry", score: 72 },
] as const;

const START_SECONDS = 1 * 3600 + 42 * 60 + 18;

const formatClock = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

// ── Pieces ──────────────────────────────────────────────────────────────────

const useCountdown = (isPaused: boolean): number => {
  const [seconds, setSeconds] = useState(START_SECONDS);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setSeconds((prev) => (prev <= 0 ? START_SECONDS : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused]);

  return seconds;
};

interface ExamWindowProps {
  clock: string;
}

const ExamWindow = ({ clock }: ExamWindowProps) => (
  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft">
    {/* Title bar */}
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 pl-5 pr-5 sm:pr-12">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-orange" />
        <span className="truncate text-sm font-semibold text-foreground">UTME Mock · Session 3</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-foreground/5 px-2.5 py-1 text-sm font-semibold tabular-nums text-brand-text">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
        {clock}
      </div>
    </div>

    {/* Subject tabs */}
    <div className="flex gap-1 border-b border-border px-3 pt-2">
      {SUBJECTS.map((subject, i) => (
        <span
          key={subject}
          className={cn(
            "whitespace-nowrap rounded-t-md px-3 py-2 text-xs font-medium",
            i === 0 ? "bg-foreground/[0.07] text-foreground" : "text-foreground/45",
            i === SUBJECTS.length - 1 && "hidden sm:inline",
          )}
        >
          {subject}
        </span>
      ))}
    </div>

    <div className="flex min-h-0 flex-1">
      {/* Question */}
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:pr-12 lg:pr-5">
        <p className="text-xs tabular-nums text-muted-foreground">
          Question {CURRENT_QUESTION} of {TOTAL_QUESTIONS}
        </p>
        <p className="mt-3 text-base font-medium leading-relaxed text-foreground">
          If 2x + 3 = 11, what is the value of 4x − 5?
        </p>
        <div className="mt-5 grid gap-2">
          {OPTIONS.map(({ key, text }) => {
            const isSelected = key === SELECTED_OPTION;
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/15 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md tabular-nums text-xs",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-muted-foreground",
                  )}
                >
                  {key}
                </span>
                {text}
              </div>
            );
          })}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">Previous</span>
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Next question</span>
        </div>
      </div>

      {/* Question navigator: hidden on small frames */}
      <div className="hidden w-56 shrink-0 border-l border-border py-4 pl-4 pr-12 lg:block">
        <p className="text-xs font-medium text-muted-foreground">Questions</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={cn(
                "flex h-6 items-center justify-center rounded text-[11px] tabular-nums",
                n === CURRENT_QUESTION && "bg-primary text-primary-foreground",
                n !== CURRENT_QUESTION && ANSWERED.has(n) && "bg-foreground/15 text-foreground/80",
                n !== CURRENT_QUESTION && FLAGGED.has(n) && "border border-brand-orange/70 text-brand-text",
                n !== CURRENT_QUESTION && !ANSWERED.has(n) && !FLAGGED.has(n) && "bg-foreground/[0.04] text-foreground/35",
              )}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ResultCard = () => {
  const total = RESULT_ROWS.reduce((sum, row) => sum + row.score, 0);
  return (
    <div className="w-[300px] rounded-xl border border-border bg-card/95 p-4 shadow-soft">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">Last mock score</p>
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {total}
          <span className="text-foreground/40"> / 400</span>
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {RESULT_ROWS.map(({ subject, score }) => (
          <div key={subject} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{subject}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
              <span className="block h-full rounded-full bg-brand-orange" style={{ width: `${score}%` }} />
            </span>
            <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Hero ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  theme: ThemePreference;
}

const HeroSection = ({ theme }: HeroSectionProps) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const clock = formatClock(useCountdown(prefersReducedMotion));

  const enter = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section
      id="main-content"
      tabIndex={-1}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-background outline-none lg:min-h-[calc(100svh-4rem)]"
    >
      <div className="container relative grid grid-cols-1 gap-y-10 py-12 md:py-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-x-6 lg:py-20">
        {/* Text */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:justify-start xl:col-span-5">

          <motion.h1
            id="hero-heading"
            {...enter(0)}
            className="text-balance font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[4rem]"
          >
            UTME practice that feels like the real JAMB CBT
          </motion.h1>

          <motion.p {...enter(0.12)} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl lg:leading-[1.5]">
            Timed four-subject mock exams scored out of 400, with an AI tutor that explains every
            question you get wrong.
          </motion.p>

          <motion.div {...enter(0.18)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:max-w-sm xl:max-w-none xl:flex-row xl:items-center">
            <Link
              to="/signup"
              className="group inline-flex h-12 whitespace-nowrap items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start free practice
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              to="/signin"
              className="inline-flex h-12 whitespace-nowrap items-center justify-center rounded-xl border border-border px-6 text-base font-medium text-foreground transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-foreground/5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Sign in to your account
            </Link>
          </motion.div>

          <motion.p {...enter(0.24)} className="mt-6 text-sm text-muted-foreground">
            UTME is live now. Post-UTME is coming soon.
          </motion.p>
        </div>

        {/* Product window over the shader ground */}
        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
              })}
          role="img"
          aria-label="The Fasiti exam screen: a timed UTME mathematics question with four options, a question navigator and a mock score out of 400"
          className="relative overflow-hidden rounded-2xl border border-border sm:h-[420px] md:h-[480px] lg:col-span-6 lg:col-start-7 lg:h-auto lg:min-h-[520px]"
        >
          <HeroLightGround theme={theme} />

          <div aria-hidden="true" className="relative p-5 sm:absolute sm:inset-0 sm:p-0">
            {/* Phones: the whole window inside the frame. From sm up: cut by the frame's right and bottom edges */}
            <div className="relative sm:absolute sm:left-10 sm:top-10 sm:h-[calc(100%+40px)] sm:w-[calc(100%-20px+28px)] lg:left-16 lg:top-16 lg:w-[calc(100%-64px+28px)]">
              <ExamWindow clock={clock} />
            </div>

            {/* Result card over the lower-left corner */}
            <div className="absolute bottom-8 left-8 hidden xl:block">
              <ResultCard />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
