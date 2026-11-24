import { useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import BrandMark from "@/components/LandingPage/BrandMark";
import { useThemePreference } from "@/core/theme/useThemePreference";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING } from "@/core/ui/styles";
import { clockTime, isFullTest, paceOf, spokenTime, tipsFor, titleOf, type TestBrief } from "../../service/testBriefService";

/** The page before a test, in parts (design approved 2026-11-24; MASTER.md tokens only). */

/** No sidebar: the logo, a way out, and the test. Follows the candidate's theme. */
export const FocusedFrame = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemePreference();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);
  // Back to wherever they came from (dashboard or test history); a fresh tab goes home
  const leave = () => (location.key !== "default" ? navigate(-1) : navigate("/dashboard"));

  return (
    <div className="fasiti-theme min-h-dvh bg-card text-foreground">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link to="/dashboard" aria-label="Fasiti, your dashboard" className={cn("rounded-lg", FOCUS_RING)}>
          <BrandMark />
        </Link>
        <button
          type="button"
          onClick={leave}
          aria-label="Leave, don't start now"
          className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground", FOCUS_RING)}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-6 sm:px-8 sm:pb-12 sm:pt-12">
        {children}
      </main>
    </div>
  );
};

export const headingOf = (b: TestBrief) => {
  const title = titleOf(b);
  return b.resumed ? `Pick up your ${title.charAt(0).toLowerCase()}${title.slice(1)}` : title;
};

/** The clock as the test will show it, with what it means. */
export const ClockHero = ({ brief }: { brief: TestBrief }) => (
  <header>
    <h1 className="text-balance text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{headingOf(brief)}</h1>
    <div className="mt-6 flex flex-col gap-x-8 gap-y-3 sm:mt-8 sm:flex-row sm:items-end">
      <p className="text-7xl font-extrabold leading-none tracking-[-0.04em] tabular-nums sm:text-8xl">
        <span className="sr-only">{spokenTime(brief.remainingSec)} on your clock: </span>
        <span aria-hidden="true">{clockTime(brief.remainingSec)}</span>
      </p>
      <p className="max-w-[34ch] text-pretty pb-1 text-muted-foreground">
        {brief.resumed
          ? `Left on your clock, of ${clockTime(brief.durationSec)}. It runs again when you carry on.`
          : `Your clock. It starts when the test opens: ${brief.total} questions, about ${paceOf(brief)} each.`}
      </p>
    </div>
  </header>
);

export const SubjectList = ({ brief }: { brief: TestBrief }) => (
  <section aria-labelledby="brief-subjects">
    <h2 id="brief-subjects" className="text-lg font-bold">
      {brief.subjects.length === 1 ? "Your subject" : `Your ${brief.subjects.length} subjects`}
    </h2>
    <ul className="mt-2 divide-y">
      {brief.subjects.map((s) => (
        <li key={s.name} className="flex items-baseline justify-between gap-4 py-3">
          <span className="min-w-0 font-semibold">{s.name}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">{s.count} questions</span>
        </li>
      ))}
    </ul>
  </section>
);

/** What happens from here, in order (the order is the point, so it's numbered). */
export const NextSteps = ({ brief }: { brief: TestBrief }) => {
  const steps = [
    brief.resumed ? "Carry on. Your answers are where you left them." : "Start. On a computer the test opens full screen, and the clock begins.",
    brief.subjects.length > 1
      ? "Answer in any order. Subject tabs and question numbers take you anywhere."
      : "Answer in any order. The question numbers take you anywhere.",
    "Submit when you're done, or the clock submits for you at zero. Your answers save as you go.",
    isFullTest(brief) ? "See your mark out of 400, then every answer with its explanation." : "See your score, then every answer with its explanation.",
  ];
  return (
    <section aria-labelledby="brief-steps">
      <h2 id="brief-steps" className="text-lg font-bold">
        What happens next
      </h2>
      <ol className="mt-4 space-y-3.5">
        {steps.map((s, i) => (
          <li key={s} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-2">
            <span className="font-extrabold text-brand-text tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <span className="text-pretty">{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export const Tips = ({ brief }: { brief: TestBrief }) => (
  <section aria-labelledby="brief-tips">
    <h2 id="brief-tips" className="text-lg font-bold">
      Tips for this test
    </h2>
    <ul className="mt-4 space-y-3.5">
      {tipsFor(brief).map((t) => (
        <li key={t.lead} className="text-pretty">
          <span className="font-semibold">{t.lead}</span> <span className="text-muted-foreground">{t.text}</span>
        </li>
      ))}
    </ul>
  </section>
);
