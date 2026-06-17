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
  /** Resolves only after the animator has fully drained the queue */
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

  const queueRef = useRef("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flushResolveRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef({ charsPerTick, intervalMs });
  optionsRef.current = { charsPerTick, intervalMs };

  const stopAnimator = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resolveFlushIfPending = useCallback(() => {
    if (queueRef.current.length > 0) {
      return;
    }

    const resolve = flushResolveRef.current;
    flushResolveRef.current = null;

    if (resolve) {
      resolve();
    }

    stopAnimator();
    setIsAnimating(false);
  }, [stopAnimator]);

  const startAnimator = useCallback(() => {
    if (intervalRef.current !== null) {
      return;
    }

    setIsAnimating(true);

    intervalRef.current = setInterval(() => {
      if (queueRef.current.length === 0) {
        resolveFlushIfPending();
        return;
      }

      const { charsPerTick: tickSize } = optionsRef.current;
      const slice = queueRef.current.slice(0, tickSize);
      queueRef.current = queueRef.current.slice(tickSize);

      setDisplayText((prev) => prev + slice);
    }, optionsRef.current.intervalMs);
  }, [resolveFlushIfPending]);

  const pushChunk = useCallback(
    (chunk: string) => {
      if (!chunk) {
        return;
      }

      queueRef.current += chunk;
      startAnimator();
    },
    [startAnimator],
  );

  const flush = useCallback((): Promise<void> => {
    if (queueRef.current.length === 0 && intervalRef.current === null) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      flushResolveRef.current = resolve;
      startAnimator();
    });
  }, [startAnimator]);

  const reset = useCallback(() => {
    stopAnimator();
    queueRef.current = "";

    const pendingFlush = flushResolveRef.current;
    flushResolveRef.current = null;
    pendingFlush?.();

    setDisplayText("");
    setIsAnimating(false);
  }, [stopAnimator]);

  useEffect(() => {
    return () => {
      stopAnimator();
      flushResolveRef.current = null;
    };
  }, [stopAnimator]);

  return { displayText, pushChunk, flush, reset, isAnimating };
};