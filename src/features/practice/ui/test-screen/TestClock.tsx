import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/ui/cn";
import { clockText } from "../../service/testScreenService";

/**
 * The test's clock, counting down to an end time (design approved 2026-11-24): bold,
 * tabular, as the page before the test showed it. Orange text in the last 10 minutes;
 * screen readers hear it once at 10 and at 5 minutes, not every second.
 */

interface TestClockProps {
  endTime: number;
  onTimeUp: () => void;
}

const secondsTo = (end: number) => Math.max(0, Math.round((end - Date.now()) / 1000));

const TestClock = ({ endTime, onTimeUp }: TestClockProps) => {
  const [left, setLeft] = useState(() => secondsTo(endTime));
  const fired = useRef(false);
  const timeUp = useRef(onTimeUp);
  timeUp.current = onTimeUp;

  useEffect(() => {
    fired.current = false;
    const tick = () => {
      const s = secondsTo(endTime);
      setLeft(s);
      if (s === 0 && !fired.current) {
        fired.current = true;
        timeUp.current();
      }
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [endTime]);

  const late = left <= 600;
  const said = left === 0 ? "Time is up." : left <= 300 ? "Under 5 minutes left." : left <= 600 ? "Under 10 minutes left." : "";

  return (
    <>
      <span className={cn("text-lg font-extrabold tabular-nums sm:text-xl", late && "text-brand-text")} aria-hidden="true">
        {clockText(left)}
      </span>
      <span className="sr-only">Time left: {clockText(left)}</span>
      <span className="sr-only" role="status">
        {said}
      </span>
    </>
  );
};

export default TestClock;
