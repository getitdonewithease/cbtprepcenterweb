import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3 } from "lucide-react";
import { cn } from "@/core/ui/cn";
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
  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[hsl(222.2,47.4%,9%)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
    {/* Title bar */}
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 pl-5 pr-12">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-orange" />
        <span className="truncate text-sm font-semibold text-white">UTME Mock · Session 3</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 font-data text-sm text-brand-orange">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
        {clock}
      </div>
    </div>

    {/* Subject tabs */}
    <div className="flex gap-1 border-b border-white/10 px-3 pt-2">
      {SUBJECTS.map((subject, i) => (
        <span
          key={subject}
          className={cn(
            "whitespace-nowrap rounded-t-md px-3 py-2 text-xs font-medium",
            i === 0 ? "bg-white/[0.07] text-white" : "text-white/45",
            i === SUBJECTS.length - 1 && "hidden sm:inline",
          )}
        >
          {subject}
        </span>
      ))}
    </div>

    <div className="flex min-h-0 flex-1">
      {/* Question */}
      <div className="flex min-w-0 flex-1 flex-col p-5 pr-12 lg:pr-5">
        <p className="font-data text-xs text-white/50">
          Question {CURRENT_QUESTION} of {TOTAL_QUESTIONS}
        </p>
        <p className="mt-3 text-base font-medium leading-relaxed text-white">
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
                    ? "border-brand-orange bg-brand-orange/15 text-white"
                    : "border-white/10 text-white/65",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-data text-xs",
                    isSelected ? "bg-brand-orange text-white" : "bg-white/5 text-white/60",
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
          <span className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60">Previous</span>
          <span className="rounded-md bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white">Next question</span>
        </div>
      </div>

      {/* Question navigator: hidden on small frames */}
      <div className="hidden w-56 shrink-0 border-l border-white/10 py-4 pl-4 pr-12 lg:block">
        <p className="text-xs font-medium text-white/60">Questions</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={cn(
                "flex h-6 items-center justify-center rounded font-data text-[10px]",
                n === CURRENT_QUESTION && "bg-brand-orange text-white",
                n !== CURRENT_QUESTION && ANSWERED.has(n) && "bg-white/15 text-white/80",
                n !== CURRENT_QUESTION && FLAGGED.has(n) && "border border-brand-orange/70 text-brand-orange",
                n !== CURRENT_QUESTION && !ANSWERED.has(n) && !FLAGGED.has(n) && "bg-white/[0.04] text-white/35",
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
    <div className="w-[300px] rounded-xl border border-white/10 bg-[hsl(222.2,47.4%,11%)]/95 p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-white/60">Last mock score</p>
        <p className="font-data text-lg text-white">
          {total}
          <span className="text-white/40"> / 400</span>
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {RESULT_ROWS.map(({ subject, score }) => (
          <div key={subject} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[11px] text-white/60">{subject}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-brand-orange" style={{ width: `${score}%` }} />
            </span>
            <span className="w-6 text-right font-data text-[11px] text-white/70">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Hero ────────────────────────────────────────────────────────────────────

const HeroSection = () => {
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
      className="relative overflow-hidden bg-[hsl(222.2,47.4%,8%)] outline-none lg:min-h-[calc(100svh-4rem)]"
    >
      <div className="container relative grid grid-cols-1 gap-y-10 py-12 md:py-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-x-6 lg:py-20">
        {/* Text */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:justify-start xl:col-span-5">
          <motion.p
            {...enter(0)}
            className="text-sm font-semibold uppercase tracking-widest text-brand-orange"
          >
            JAMB UTME · CBT practice
          </motion.p>

          <motion.h1
            id="hero-heading"
            {...enter(0.05)}
            className="mt-5 font-display text-[2.5rem] font-medium leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[4rem]"
          >
            UTME practice that feels like the real JAMB CBT
          </motion.h1>

          <motion.p {...enter(0.12)} className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 lg:text-xl lg:leading-[1.5]">
            Timed four-subject mock exams scored out of 400, with an AI tutor that explains every
            question you get wrong.
          </motion.p>

          <motion.div {...enter(0.18)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:max-w-sm xl:max-w-none xl:flex-row xl:items-center">
            <Link
              to="/signup"
              className="group inline-flex h-12 whitespace-nowrap items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 text-base font-semibold text-white shadow-[0_10px_30px_-10px_hsl(25_95%_53%/0.7)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[hsl(25,95%,48%)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222.2,47.4%,8%)]"
            >
              Start free practice
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              to="/signin"
              className="inline-flex h-12 whitespace-nowrap items-center justify-center rounded-lg border border-white/20 px-6 text-base font-medium text-white transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222.2,47.4%,8%)]"
            >
              Sign in to your account
            </Link>
          </motion.div>

          <motion.p {...enter(0.24)} className="mt-6 text-sm text-white/50">
            UTME is live now. Post-UTME is coming soon.
          </motion.p>
        </div>

        {/* Product window over the light ground */}
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
          className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 sm:h-[420px] md:h-[480px] lg:col-span-6 lg:col-start-7 lg:h-auto lg:min-h-[520px]"
        >
          <HeroLightGround />

          <div aria-hidden="true" className="absolute inset-0">
            {/* Window: cut by the frame's right and bottom edges */}
            <div className="absolute left-5 top-5 h-[calc(100%+40px)] w-[calc(100%-20px+28px)] sm:left-10 sm:top-10 lg:left-16 lg:top-16 lg:w-[calc(100%-64px+28px)]">
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
