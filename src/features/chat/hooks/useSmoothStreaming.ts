import { useCallback, useEffect, useRef, useState } from "react";

interface UseSmoothStreamOptions {
  /** Characters rendered per interval tick. 1 = slowest, 3-5 = natural feel */
  charsPerTick?: number;
  /** Interval in ms between ticks. Lower = faster. 12-20ms feels natural */
  intervalMs?: number;
}

interface UseSmoothStreamResult {
  /** The smoothly animated display text — bind this to your UI */
  displayText: string;
  /** Call this with each raw chunk from onToken */
  pushChunk: (chunk: string) => void;
  /** Call this when the stream is fully done */
  flush: () => Promise<void>;
  /** Reset everything (e.g. on new message) */
  reset: () => void;
  /** True while the animator is still draining the queue */
  isAnimating: boolean;
}

export const useSmoothStream = ({
  charsPerTick = 2,
  intervalMs = 16,
}: UseSmoothStreamOptions = {}): UseSmoothStreamResult => {
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const queueRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flushResolveRef = useRef<(() => void) | null>(null);

  const startAnimator = useCallback(() => {
    if (intervalRef.current !== null) return; // already running

    setIsAnimating(true);

    intervalRef.current = setInterval(() => {
      if (queueRef.current.length === 0) {
        // Queue drained — if flush() is waiting, resolve it
        if (flushResolveRef.current) {
          flushResolveRef.current();
          flushResolveRef.current = null;
        }
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsAnimating(false);
        return;
      }

      const slice = queueRef.current.slice(0, charsPerTick);
      queueRef.current = queueRef.current.slice(charsPerTick);

      setDisplayText((prev) => prev + slice);
    }, intervalMs);
  }, [charsPerTick, intervalMs]);

  const pushChunk = useCallback(
    (chunk: string) => {
      queueRef.current += chunk;
      startAnimator();
    },
    [startAnimator]
  );

  /** Resolves only after the animator has fully drained the queue */
  const flush = useCallback((): Promise<void> => {
    if (queueRef.current.length === 0 && intervalRef.current === null) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      flushResolveRef.current = resolve;
    });
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    queueRef.current = "";
    flushResolveRef.current = null;
    setDisplayText("");
    setIsAnimating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { displayText, pushChunk, flush, reset, isAnimating };
};