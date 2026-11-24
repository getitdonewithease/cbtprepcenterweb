import { useCallback, useEffect, useRef, useState } from "react";
import { isFullMark, testResultService, type TestResult } from "../service/testResultService";

/**
 * Waits for a submitted test to be marked, then gives its result. Marking runs in the
 * background: ask every 2 seconds, then every 5; after 15 seconds say it's slow; after a
 * minute stop asking and offer to check again. Nothing is asked while the tab is hidden.
 */

export type TestResultState =
  | { phase: "marking"; slow: boolean }
  | { phase: "stalled" }
  | { phase: "failed"; cancelled: boolean }
  | { phase: "marked"; result: TestResult; previous: number | null | undefined };

const SLOW_AFTER = 15_000;
const STOP_AFTER = 60_000;

export const useTestResult = (cbtSessionId: string | undefined) => {
  const [state, setState] = useState<TestResultState>({ phase: "marking", slow: false });
  const started = useRef(0);
  const timer = useRef<number | null>(null);
  const failures = useRef(0);
  const live = useRef(true);
  /** Marked, failed or stopped: nothing more to ask until Check again. */
  const settled = useRef(false);

  const clear = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const ask = useCallback(async () => {
    clear();
    if (!cbtSessionId || !live.current) return;
    if (document.visibilityState === "hidden") return; // picked up again when visible
    const waited = Date.now() - started.current;
    try {
      const result = await testResultService.getResult(cbtSessionId);
      failures.current = 0;
      if (!live.current) return;
      if (result.status === "submitted" && result.subjects.length > 0) {
        const previous = isFullMark(result) ? await testResultService.getPreviousFullMark(cbtSessionId, result.createdOn) : undefined;
        settled.current = true;
        if (live.current) setState({ phase: "marked", result, previous });
        return;
      }
      if (result.status === "cancelled") {
        settled.current = true;
        setState({ phase: "failed", cancelled: true });
        return;
      }
    } catch {
      failures.current += 1;
      if (failures.current >= 3) {
        settled.current = true;
        if (live.current) setState({ phase: "failed", cancelled: false });
        return;
      }
    }
    if (!live.current) return;
    if (waited >= STOP_AFTER) {
      settled.current = true;
      setState({ phase: "stalled" });
      return;
    }
    setState({ phase: "marking", slow: waited >= SLOW_AFTER });
    timer.current = window.setTimeout(() => void ask(), waited < 10_000 ? 2000 : 5000);
  }, [cbtSessionId]);

  const start = useCallback(() => {
    started.current = Date.now();
    failures.current = 0;
    settled.current = false;
    setState({ phase: "marking", slow: false });
    void ask();
  }, [ask]);

  useEffect(() => {
    live.current = true;
    start();
    const onVisible = () => {
      if (document.visibilityState === "visible" && timer.current === null && !settled.current) void ask();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      live.current = false;
      clear();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [start, ask]);

  return { state, checkAgain: start };
};
