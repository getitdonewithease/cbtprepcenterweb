import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION } from "@/core/ui/styles";

/**
 * Start by pressing and holding until the button fills (design approved 2026-11-24), so a
 * stray tap never starts the clock. Holding Enter or Space works the same way; letting go
 * early cancels.
 */

const HOLD_MS = 900;

interface HoldToStartProps {
  label: string;
  /** Read out with the button; shown beside it from tablet width up. */
  hint: string;
  onComplete: () => void;
}

const HoldToStart = ({ label, hint, onComplete }: HoldToStartProps) => {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);
  const began = useRef(0);
  const done = useRef(false);

  const cancel = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (!done.current) setProgress(0);
  };
  const begin = () => {
    if (frame.current !== null || done.current) return;
    began.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - began.current) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        frame.current = null;
        done.current = true;
        onComplete();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const isHoldKey = (e: KeyboardEvent) => e.key === "Enter" || e.key === " ";
  const onKeyDown = (e: KeyboardEvent) => {
    if (!isHoldKey(e)) return;
    e.preventDefault();
    if (!e.repeat) begin();
  };
  const onKeyUp = (e: KeyboardEvent) => isHoldKey(e) && cancel();
  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    begin();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <button
        type="button"
        aria-describedby="hold-hint"
        onPointerDown={onPointerDown}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={cancel}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative inline-flex h-14 w-full touch-none select-none items-center justify-center overflow-hidden rounded-xl px-8 text-base font-bold sm:w-auto sm:min-w-64",
          PRESSABLE,
          PRIMARY_ACTION,
          FOCUS_RING,
        )}
      >
        <span className="absolute inset-y-0 left-0 bg-foreground/25" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
        <span className="relative">{progress >= 1 ? "Starting…" : progress > 0 ? "Keep holding…" : label}</span>
      </button>
      <p id="hold-hint" className="sr-only text-sm text-muted-foreground sm:not-sr-only">
        {hint}
      </p>
    </div>
  );
};

export default HoldToStart;
