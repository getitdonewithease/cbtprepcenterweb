import { useEffect, useRef, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import { useTestBrief } from "../hooks/useTestBrief";
import type { TestBrief } from "../service/testBriefService";
import { isDesktop, isFullscreenSupported } from "../utils/deviceDetection";
import HoldToStart from "./brief/HoldToStart";
import { ClockHero, FocusedFrame, NextSteps, SubjectList, Tips, headingOf } from "./brief/briefParts";

/**
 * The page before a test (design approved 2026-11-24): no sidebar, the clock as the test
 * will show it, the subjects, what happens next, tips worked out from this test's own
 * numbers, and press-and-hold to start. A test under way says how much time is left and
 * carries on; a submitted one goes to its review; a cancelled one says so.
 */

const BUTTON = "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold";

const Message = ({ title, body, children }: { title: string; body: string; children: ReactNode }) => (
  <div role="alert" className="max-w-xl pb-12">
    <h1 className="text-balance text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
    <p className="mt-3 text-pretty text-muted-foreground">{body}</p>
    <div className="mt-6 flex flex-wrap gap-3">{children}</div>
  </div>
);

const Ready = ({ brief, onStart }: { brief: TestBrief; onStart: () => void }) => (
  <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr] lg:gap-x-16 xl:gap-x-24">
    <div className="lg:col-start-1 lg:row-start-1">
      <ClockHero brief={brief} />
      <div className="mt-10 max-w-3xl sm:mt-12">
        <SubjectList brief={brief} />
      </div>
    </div>
    <aside aria-label="Before you start" className="mt-10 space-y-10 sm:mt-12 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-2">
      <NextSteps brief={brief} />
      <Tips brief={brief} />
    </aside>
    {/* Phones: the one action stays in reach at the bottom */}
    <div className="sticky bottom-0 z-10 -mx-4 mt-10 border-t bg-card px-4 py-3 sm:static sm:mx-0 sm:mt-12 sm:border-0 sm:p-0 lg:col-start-1 lg:row-start-2 lg:mt-10 lg:self-start">
      <HoldToStart
        label={brief.resumed ? "Hold to carry on" : "Hold to start"}
        hint="Hold until it fills. A stray tap won't start your clock."
        onComplete={onStart}
      />
    </div>
  </div>
);

const Loading = () => (
  <div aria-busy="true" className="pb-12">
    <p role="status" className="sr-only">
      Loading your test
    </p>
    <span className="block h-12 w-full max-w-md animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    <span className="mt-8 block h-20 w-full max-w-sm animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    {[0, 1, 2, 3].map((i) => (
      <span key={i} className="mt-4 block h-8 w-full max-w-3xl animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
    ))}
  </div>
);

const TestSummaryPage = () => {
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const navigate = useNavigate();
  const { state, reload } = useTestBrief(cbtSessionId);
  const starting = useRef(false);

  const title = state.status === "ready" ? headingOf(state.brief) : "Your test";
  useEffect(() => {
    const before = document.title;
    document.title = `${title} · Fasiti`;
    return () => {
      document.title = before;
    };
  }, [title]);

  const start = (brief: TestBrief) => {
    if (starting.current || !cbtSessionId) return;
    starting.current = true;
    // Asked while the hold still counts as the candidate's own action, so the browser allows it
    if (isDesktop() && isFullscreenSupported() && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
    // The runner's fallback duration, as a TimeSpan ("02:00:00")
    const pad = (n: number) => String(n).padStart(2, "0");
    const t = brief.durationSec;
    const duration = `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
    navigate(`/practice/test/${cbtSessionId}`, { state: { duration } });
  };

  let body;
  if (state.status === "loading") {
    body = <Loading />;
  } else if (state.status === "error") {
    body = (
      <Message title="We couldn't open this test" body={state.message}>
        <button type="button" onClick={() => void reload()} className={cn(BUTTON, PRESSABLE, PRIMARY_ACTION, FOCUS_RING)}>
          Try again
        </button>
        <Link to="/dashboard" className={cn(BUTTON, PRESSABLE, SECONDARY_ACTION, FOCUS_RING)}>
          Back to dashboard
        </Link>
      </Message>
    );
  } else if (state.brief.status === "submitted") {
    return <Navigate to={`/practice/review/${cbtSessionId}`} replace />;
  } else if (state.brief.status === "cancelled") {
    body = (
      <Message title="This test was cancelled" body="It can't be taken any more. Start a new one from your dashboard.">
        <Link to="/dashboard" className={cn(BUTTON, PRESSABLE, PRIMARY_ACTION, FOCUS_RING)}>
          Back to dashboard
        </Link>
      </Message>
    );
  } else {
    const brief = state.brief;
    body = <Ready brief={brief} onStart={() => start(brief)} />;
  }

  return <FocusedFrame>{body}</FocusedFrame>;
};

export default TestSummaryPage;
