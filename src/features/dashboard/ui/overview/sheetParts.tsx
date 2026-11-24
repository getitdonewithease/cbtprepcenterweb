import type { ReactNode } from "react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";

/** Shared pieces of the dashboard sheet (design-system/fasiti/MASTER.md tokens only). */

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-60";

export const primaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, PRIMARY_ACTION, FOCUS_RING, extra);
export const secondaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, SECONDARY_ACTION, FOCUS_RING, extra);

export const textLink = cn(
  "inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-brand-text underline-offset-4 hover:underline",
  FOCUS_RING,
);

/**
 * Every section: vertical rhythm only. No box and no side padding, so its text lines up
 * with the page title; the next section is divided off by a hairline.
 */
export const SECTION = "py-8 sm:py-10";

export const SectionHeading = ({ id, children, aside }: { id: string; children: ReactNode; aside?: ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
    <h2 id={id} className="text-xl font-extrabold tracking-[-0.02em]">
      {children}
    </h2>
    {aside}
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <span className={cn("block animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)} />
);

/** A section's own error: what went wrong, and a way to try again. */
export const SectionError = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-destructive/40 p-4">
    <p className="text-sm font-semibold">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className={secondaryButton()}>
        Try again
      </button>
    )}
  </div>
);

/** A signed change in marks. The sign is spoken, not only coloured. */
export const Change = ({ value }: { value: number }) => {
  const up = value > 0;
  const flat = value === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        flat && "bg-muted text-muted-foreground",
        up && "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
        !up && !flat && "bg-destructive/10 text-destructive",
      )}
    >
      <span className="sr-only">{up ? "up " : flat ? "no change " : "down "}</span>
      {up ? "+" : flat ? "±" : "−"}
      {Math.abs(value)}
    </span>
  );
};
